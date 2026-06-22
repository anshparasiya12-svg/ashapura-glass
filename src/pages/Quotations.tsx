import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, FileText, Pencil, Trash2, ArrowRightCircle, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { statusBadge } from "@/lib/docs";

interface QuoteRow {
  id: string; quote_no: string; quote_date: string; valid_until: string | null;
  net_amount: number; status: string; customer_snapshot: { name?: string };
}

const STATUSES = ["draft", "sent", "accepted", "rejected", "expired"] as const;

const Quotations = () => {
  const [rows, setRows] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotations")
      .select("id,quote_no,quote_date,valid_until,net_amount,status,customer_snapshot")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows((data ?? []) as QuoteRow[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("quotations").update({ status: status as never }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this quotation?")) return;
    const { error } = await supabase.from("quotations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const convert = async (id: string) => {
    const { data: q, error } = await supabase.from("quotations").select("*").eq("id", id).single();
    if (error || !q) return toast.error(error?.message ?? "Not found");
    const { data: items } = await supabase.from("quotation_items").select("*").eq("quotation_id", id).order("sort_order");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Not signed in");

    const { count } = await supabase.from("invoices").select("*", { count: "exact", head: true });
    const invoice_no = `INV/${new Date().getFullYear()}/${String((count ?? 0) + 1).padStart(4, "0")}`;

    const { data: inv, error: e2 } = await supabase.from("invoices").insert({
      owner_id: user.id,
      invoice_no,
      invoice_type: "gst" as const,
      invoice_date: new Date().toISOString().slice(0, 10),
      customer_id: q.customer_id,
      customer_snapshot: q.customer_snapshot,
      quotation_id: q.id,
      gst_type: q.gst_type,
      sub_total: q.sub_total, cgst: q.cgst, sgst: q.sgst, igst: q.igst,
      discount: q.discount, net_amount: q.net_amount, notes: q.notes,
    }).select().single();
    if (e2 || !inv) return toast.error(e2?.message ?? "Failed");

    if (items?.length) {
      const payload = items.map(({ id: _i, quotation_id: _q, ...rest }) => ({ ...rest, invoice_id: inv.id }));
      const { error: e3 } = await supabase.from("invoice_items").insert(payload);
      if (e3) return toast.error(e3.message);
    }
    await supabase.from("quotations").update({ status: "accepted" as never }).eq("id", id);
    toast.success("Converted to invoice");
    navigate(`/invoices/${inv.id}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Quotations</h1>
        <Link to="/quotations/new" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> New Quotation
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="text-left px-4 py-3">QUOTE NO</th>
              <th className="text-left px-4 py-3">DATE</th>
              <th className="text-left px-4 py-3">CUSTOMER</th>
              <th className="text-left px-4 py-3">VALID UNTIL</th>
              <th className="text-right px-4 py-3">AMOUNT</th>
              <th className="text-left px-4 py-3">STATUS</th>
              <th className="text-center px-4 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-muted-foreground">
                <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />No quotations yet
              </td></tr>
            ) : rows.map(q => (
              <tr key={q.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{q.quote_no}</td>
                <td className="px-4 py-3 text-muted-foreground">{q.quote_date}</td>
                <td className="px-4 py-3">{q.customer_snapshot?.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{q.valid_until ?? "—"}</td>
                <td className="px-4 py-3 text-right font-semibold">₹{Number(q.net_amount).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <select value={q.status} onChange={e => updateStatus(q.id, e.target.value)}
                    className={`px-2 py-1 text-xs rounded-full border-0 ${statusBadge(q.status)}`}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex gap-3">
                    <button title="Convert to Invoice" onClick={() => convert(q.id)} className="text-primary"><ArrowRightCircle className="h-4 w-4" /></button>
                    <Link title="Edit" to={`/quotations/${q.id}/edit`} className="text-primary"><Pencil className="h-4 w-4" /></Link>
                    <button title="Delete" onClick={() => del(q.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Quotations;
