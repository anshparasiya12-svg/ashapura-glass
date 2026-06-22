import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { paymentStatus, statusBadge } from "@/lib/docs";

const METHODS = ["cash", "upi", "bank_transfer", "cheque", "card", "other"] as const;

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [inv, setInv] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [showPay, setShowPay] = useState(false);
  const [pay, setPay] = useState({ amount: 0, method: "cash" as typeof METHODS[number], paid_on: new Date().toISOString().slice(0, 10), reference: "" });

  const load = async () => {
    if (!id) return;
    const [{ data: i }, { data: it }, { data: p }] = await Promise.all([
      supabase.from("invoices").select("*").eq("id", id).single(),
      supabase.from("invoice_items").select("*").eq("invoice_id", id).order("sort_order"),
      supabase.from("payments").select("*").eq("invoice_id", id).order("paid_on", { ascending: false }),
    ]);
    setInv(i); setItems(it ?? []); setPayments(p ?? []);
    if (i) setPay(s => ({ ...s, amount: Math.max(0, Number(i.net_amount) - Number(i.paid_amount)) }));
  };
  useEffect(() => { load(); }, [id]);

  const addPayment = async () => {
    if (!pay.amount || pay.amount <= 0) return toast.error("Enter amount");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !inv) return;
    const { error } = await supabase.from("payments").insert({
      owner_id: user.id, invoice_id: inv.id, customer_id: inv.customer_id,
      paid_on: pay.paid_on, amount: pay.amount, method: pay.method, reference: pay.reference,
    });
    if (error) return toast.error(error.message);
    toast.success("Payment recorded");
    setShowPay(false); load();
  };

  const deletePayment = async (pid: string) => {
    if (!confirm("Delete this payment?")) return;
    const { error } = await supabase.from("payments").delete().eq("id", pid);
    if (error) return toast.error(error.message);
    load();
  };

  if (!inv) return <div className="text-muted-foreground">Loading…</div>;
  const net = Number(inv.net_amount), paid = Number(inv.paid_amount);
  const balance = net - paid;
  const st = paymentStatus(net, paid);
  const cs = inv.customer_snapshot ?? {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/invoices" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-2xl font-bold">{inv.invoice_no}</h1>
          <span className={`px-2 py-0.5 text-xs rounded-full ${statusBadge(st)}`}>{st}</span>
        </div>
        <Link to={`/invoices/${inv.id}/edit`} className="flex items-center gap-2 border border-input px-3 py-2 rounded-lg text-sm hover:bg-accent">
          <Pencil className="h-4 w-4" /> Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs uppercase text-muted-foreground mb-2">Bill To</p>
          <p className="font-semibold">{cs.name}</p>
          {cs.phone && <p className="text-sm text-muted-foreground">{cs.phone}</p>}
          {cs.address && <p className="text-sm text-muted-foreground">{cs.address}</p>}
          {cs.state && <p className="text-sm text-muted-foreground">{cs.state}</p>}
          {cs.gst_no && <p className="text-sm text-muted-foreground">GST: {cs.gst_no}</p>}
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs uppercase text-muted-foreground mb-2">Invoice Info</p>
          <p className="text-sm"><span className="text-muted-foreground">Date:</span> {inv.invoice_date}</p>
          {inv.due_date && <p className="text-sm"><span className="text-muted-foreground">Due:</span> {inv.due_date}</p>}
          <p className="text-sm"><span className="text-muted-foreground">Type:</span> {inv.invoice_type}</p>
          <p className="text-sm"><span className="text-muted-foreground">GST:</span> {inv.gst_type}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs uppercase text-muted-foreground mb-2">Payment</p>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span>₹{net.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Paid</span><span className="text-emerald-600">₹{paid.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold border-t border-border pt-2 mt-2"><span>Balance</span><span className="text-destructive">₹{balance.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 mb-4 overflow-x-auto">
        <h3 className="font-semibold mb-3">Items</h3>
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground text-xs">
            <tr><th className="text-left px-2 py-2">#</th><th className="text-left px-2 py-2">DESCRIPTION</th>
              <th className="text-left px-2 py-2">HSN</th><th className="text-right px-2 py-2">QTY</th>
              <th className="text-right px-2 py-2">SQFT</th><th className="text-right px-2 py-2">RATE</th>
              <th className="text-right px-2 py-2">GST%</th><th className="text-right px-2 py-2">AMOUNT</th></tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it.id} className="border-t border-border">
                <td className="px-2 py-2 text-muted-foreground">{idx + 1}</td>
                <td className="px-2 py-2">{it.description}</td>
                <td className="px-2 py-2 text-muted-foreground">{it.hsn_code}</td>
                <td className="px-2 py-2 text-right">{Number(it.qty)}</td>
                <td className="px-2 py-2 text-right text-muted-foreground">{it.area_sqft ?? "—"}</td>
                <td className="px-2 py-2 text-right">₹{Number(it.rate).toFixed(2)}</td>
                <td className="px-2 py-2 text-right">{Number(it.gst_percent)}%</td>
                <td className="px-2 py-2 text-right font-medium">₹{Number(it.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-end">
          <div className="w-72 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Sub Total</span><span>₹{Number(inv.sub_total).toFixed(2)}</span></div>
            {inv.gst_type === "CGST_SGST" ? <>
              <div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span>₹{Number(inv.cgst).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span>₹{Number(inv.sgst).toFixed(2)}</span></div>
            </> : <div className="flex justify-between"><span className="text-muted-foreground">IGST</span><span>₹{Number(inv.igst).toFixed(2)}</span></div>}
            {Number(inv.discount) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-₹{Number(inv.discount).toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold border-t border-border pt-2 mt-2 text-base"><span>Net Amount</span><span>₹{net.toFixed(2)}</span></div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Payments</h3>
          {balance > 0.01 && (
            <button onClick={() => setShowPay(s => !s)} className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
              <Plus className="h-4 w-4" /> Record Payment
            </button>
          )}
        </div>
        {showPay && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 p-3 bg-muted/30 rounded-md">
            <input type="date" value={pay.paid_on} onChange={e => setPay({ ...pay, paid_on: e.target.value })} className="border border-input rounded-md px-2 py-2 text-sm bg-card" />
            <input type="number" value={pay.amount} onChange={e => setPay({ ...pay, amount: +e.target.value })} placeholder="Amount" className="border border-input rounded-md px-2 py-2 text-sm bg-card" />
            <select value={pay.method} onChange={e => setPay({ ...pay, method: e.target.value as typeof METHODS[number] })} className="border border-input rounded-md px-2 py-2 text-sm bg-card">
              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input value={pay.reference} onChange={e => setPay({ ...pay, reference: e.target.value })} placeholder="Reference" className="border border-input rounded-md px-2 py-2 text-sm bg-card" />
            <button onClick={addPayment} className="bg-primary text-primary-foreground rounded-md text-sm">Save</button>
          </div>
        )}
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No payments yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-xs">
              <tr><th className="text-left px-2 py-2">DATE</th><th className="text-left px-2 py-2">METHOD</th>
                <th className="text-left px-2 py-2">REFERENCE</th><th className="text-right px-2 py-2">AMOUNT</th><th></th></tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-2 py-2">{p.paid_on}</td>
                  <td className="px-2 py-2 uppercase text-xs">{p.method}</td>
                  <td className="px-2 py-2 text-muted-foreground">{p.reference || "—"}</td>
                  <td className="px-2 py-2 text-right font-medium">₹{Number(p.amount).toFixed(2)}</td>
                  <td className="px-2 py-2 text-right"><button onClick={() => deletePayment(p.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;
