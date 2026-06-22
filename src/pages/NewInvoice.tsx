import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DocForm from "@/components/DocForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DocHeader, DocItem, emptyItem, recomputeItem, computeTotals } from "@/lib/docs";

const NewInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [header, setHeader] = useState<DocHeader | null>(null);
  const [items, setItems] = useState<DocItem[]>([emptyItem()]);
  const [invoiceType, setInvoiceType] = useState<"gst" | "tax" | "retail">("gst");

  useEffect(() => { (async () => {
    if (id) {
      const { data: inv } = await supabase.from("invoices").select("*").eq("id", id).single();
      const { data: its } = await supabase.from("invoice_items").select("*").eq("invoice_id", id).order("sort_order");
      if (inv) {
        setInvoiceType(inv.invoice_type);
        setHeader({
          doc_no: inv.invoice_no, doc_date: inv.invoice_date, due_date: inv.due_date ?? "",
          gst_type: inv.gst_type as "CGST_SGST" | "IGST",
          customer_id: inv.customer_id, customer_snapshot: inv.customer_snapshot as DocHeader["customer_snapshot"],
          notes: inv.notes ?? "", attender: inv.attender ?? "", biller: inv.biller ?? "",
          discount: Number(inv.discount ?? 0),
        });
        setItems((its ?? []).map(i => recomputeItem({
          id: i.id, description: i.description, hsn_code: i.hsn_code ?? "",
          width: i.width as number | null, height: i.height as number | null,
          unit: i.unit as DocItem["unit"], qty: Number(i.qty), area_sqft: i.area_sqft as number | null,
          rate: Number(i.rate), gst_percent: Number(i.gst_percent), amount: Number(i.amount),
        })));
      }
    } else {
      const { count } = await supabase.from("invoices").select("*", { count: "exact", head: true });
      setHeader({
        doc_no: `INV/${new Date().getFullYear()}/${String((count ?? 0) + 1).padStart(4, "0")}`,
        doc_date: new Date().toISOString().slice(0, 10), due_date: "",
        gst_type: "CGST_SGST", customer_id: null,
        customer_snapshot: { name: "", phone: "", email: "", address: "", state: "", gst_no: "" },
        notes: "", discount: 0,
      });
    }
    setReady(true);
  })(); }, [id]);

  const onSubmit = async (h: DocHeader, its: DocItem[], totals: ReturnType<typeof computeTotals>) => {
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return toast.error("Not signed in"); }
    const headerRow = {
      owner_id: user.id, invoice_no: h.doc_no, invoice_type: invoiceType,
      invoice_date: h.doc_date, due_date: h.due_date || null,
      customer_id: h.customer_id, customer_snapshot: h.customer_snapshot,
      gst_type: h.gst_type, sub_total: totals.sub_total, cgst: totals.cgst, sgst: totals.sgst,
      igst: totals.igst, discount: h.discount, net_amount: totals.net_amount,
      notes: h.notes, attender: h.attender, biller: h.biller,
    };
    let invId = id;
    if (id) {
      const { error } = await supabase.from("invoices").update(headerRow).eq("id", id);
      if (error) { setSubmitting(false); return toast.error(error.message); }
      await supabase.from("invoice_items").delete().eq("invoice_id", id);
    } else {
      const { data, error } = await supabase.from("invoices").insert(headerRow).select().single();
      if (error || !data) { setSubmitting(false); return toast.error(error?.message ?? "Failed"); }
      invId = data.id;
    }
    const itemRows = its.map((i, idx) => ({
      owner_id: user.id, invoice_id: invId!, description: i.description, hsn_code: i.hsn_code,
      width: i.width, height: i.height, unit: i.unit, qty: i.qty, area_sqft: i.area_sqft,
      rate: i.rate, gst_percent: i.gst_percent, amount: i.amount, sort_order: idx,
    }));
    if (itemRows.length) {
      const { error } = await supabase.from("invoice_items").insert(itemRows);
      if (error) { setSubmitting(false); return toast.error(error.message); }
    }
    toast.success(id ? "Invoice updated" : "Invoice created");
    navigate(`/invoices/${invId}`);
  };

  if (!ready || !header) return <div className="text-muted-foreground">Loading…</div>;
  return (
    <div>
      {!id && (
        <div className="flex gap-2 mb-4">
          {(["gst", "tax", "retail"] as const).map(t => (
            <button key={t} onClick={() => setInvoiceType(t)}
              className={`px-3 py-1.5 rounded-md text-sm border ${invoiceType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-input"}`}>
              {t === "gst" ? "GST Invoice" : t === "tax" ? "Tax Invoice" : "Retail / Estimate"}
            </button>
          ))}
        </div>
      )}
      <DocForm kind="invoice" title={id ? "Edit Invoice" : "New Invoice"}
        initialHeader={header} initialItems={items} onSubmit={onSubmit} submitting={submitting} />
    </div>
  );
};

export default NewInvoice;
