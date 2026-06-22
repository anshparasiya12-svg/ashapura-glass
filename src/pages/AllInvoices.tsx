import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, FilePlus, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { paymentStatus, statusBadge } from "@/lib/docs";

interface Row {
  id: string; invoice_no: string; invoice_date: string; invoice_type: string;
  net_amount: number; paid_amount: number;
  customer_snapshot: { name?: string };
}

const AllInvoices = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select("id,invoice_no,invoice_date,invoice_type,net_amount,paid_amount,customer_snapshot")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setRows((data ?? []) as Row[]);
    setLoading(false);
  })(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">All Invoices</h1>
        <Link to="/invoice/new" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90">
          <FilePlus className="h-4 w-4" /> New Invoice
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium text-foreground">No invoices yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="text-left px-4 py-3">INVOICE NO</th>
                <th className="text-left px-4 py-3">DATE</th>
                <th className="text-left px-4 py-3">CUSTOMER</th>
                <th className="text-left px-4 py-3">TYPE</th>
                <th className="text-right px-4 py-3">AMOUNT</th>
                <th className="text-right px-4 py-3">PAID</th>
                <th className="text-left px-4 py-3">STATUS</th>
                <th className="text-center px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const net = Number(r.net_amount), paid = Number(r.paid_amount);
                const st = paymentStatus(net, paid);
                return (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{r.invoice_no}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.invoice_date}</td>
                    <td className="px-4 py-3">{r.customer_snapshot?.name ?? "—"}</td>
                    <td className="px-4 py-3 uppercase text-xs text-muted-foreground">{r.invoice_type}</td>
                    <td className="px-4 py-3 text-right font-semibold">₹{net.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">₹{paid.toFixed(2)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${statusBadge(st)}`}>{st}</span></td>
                    <td className="px-4 py-3 text-center">
                      <Link to={`/invoices/${r.id}`} className="text-primary inline-flex"><Eye className="h-4 w-4" /></Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllInvoices;
