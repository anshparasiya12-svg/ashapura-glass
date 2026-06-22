import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DocForm from "@/components/DocForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DocHeader, DocItem, emptyItem, recomputeItem } from "@/lib/docs";

const todayPlus = (days: number) => {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const QuotationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [header, setHeader] = useState<DocHeader | null>(null);
  const [items, setItems] = useState<DocItem[]>([emptyItem()]);

  useEffect(() => { (async () => {
    if (id) {
      const { data: q } = await supabase.from("quotations").select("*").eq("id", id).single();
      const { data: its } = await supabase.from("quotation_items").select("*").eq("quotation_id", id).order("sort_order");
      if (q) {
        setHeader({
          doc_no: q.quote_no, doc_date: q.quote_date, valid_until: q.valid_until ?? "",
          gst_type: q.gst_type as "CGST_SGST" | "IGST",
          customer_id: q.customer_id, customer_snapshot: q.customer_snapshot as DocHeader["customer_snapshot"],
          notes: q.notes ?? "", terms: q.terms ?? "", discount: Number(q.discount ?? 0),
        });
        setItems((its ?? []).map(i => recomputeItem({
          id: i.id, description: i.description, width: i.width as number | null,
          height: i.height as number | null, unit: i.unit as DocItem["unit"], qty: Number(i.qty),
          area_sqft: i.area_sqft as number | null, rate: Number(i.rate),
          gst_percent: Number(i.gst_percent), amount: Number(i.amount),
        })));
      }
    } else {
      const { count } = await supabase.from("quotations").select("*", { count: "exact", head: true });
      setHeader({
        doc_no: `QUO/${new Date().getFullYear()}/${String((count ?? 0) + 1).padStart(4, "0")}`,
        doc_date: new Date().toISOString().slice(0, 10),
        valid_until: todayPlus(15), gst_type: "CGST_SGST",
        customer_id: null,
        customer_snapshot: { name: "", phone: "", email: "", address: "", state: "", gst_no: "" },
        notes: "", terms: "1. Prices valid for 15 days.\n2. 50% advance required.", discount: 0,
      });
    }
    setReady(true);
  })(); }, [id]);

  const onSubmit = async (h: DocHeader, its: DocItem[], totals: ReturnType<typeof import("@/lib/docs").computeTotals>) => {
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return toast.error("Not signed in"); }
    const headerRow = {
      owner_id: user.id,
      quote_no: h.doc_no, quote_date: h.doc_date, valid_until: h.valid_until || null,
      customer_id: h.customer_id, customer_snapshot: h.customer_snapshot,
      gst_type: h.gst_type, sub_total: totals.sub_total, cgst: totals.cgst, sgst: totals.sgst,
      igst: totals.igst, discount: h.discount, net_amount: totals.net_amount,
      notes: h.notes, terms: h.terms,
    };
    let qid = id;
    if (id) {
      const { error } = await supabase.from("quotations").update(headerRow).eq("id", id);
      if (error) { setSubmitting(false); return toast.error(error.message); }
      await supabase.from("quotation_items").delete().eq("quotation_id", id);
    } else {
      const { data, error } = await supabase.from("quotations").insert({ ...headerRow, status: "draft" as const }).select().single();
      if (error || !data) { setSubmitting(false); return toast.error(error?.message ?? "Failed"); }
      qid = data.id;
    }
    const itemRows = its.map((i, idx) => ({
      owner_id: user.id, quotation_id: qid!, description: i.description, width: i.width,
      height: i.height, unit: i.unit, qty: i.qty, area_sqft: i.area_sqft, rate: i.rate,
      gst_percent: i.gst_percent, amount: i.amount, sort_order: idx,
    }));
    if (itemRows.length) {
      const { error } = await supabase.from("quotation_items").insert(itemRows);
      if (error) { setSubmitting(false); return toast.error(error.message); }
    }
    toast.success(id ? "Quotation updated" : "Quotation created");
    navigate("/quotations");
  };

  if (!ready || !header) return <div className="text-muted-foreground">Loading…</div>;
  return <DocForm kind="quotation" title={id ? "Edit Quotation" : "New Quotation"}
    initialHeader={header} initialItems={items} onSubmit={onSubmit} submitting={submitting} />;
};

export default QuotationForm;
