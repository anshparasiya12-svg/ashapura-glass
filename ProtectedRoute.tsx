import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DocItem, DocHeader, emptyItem, recomputeItem, computeTotals,
} from "@/lib/docs";

interface Customer {
  id: string; name: string; phone: string | null; email: string | null;
  address: string | null; state: string | null; gst_no: string | null;
}

interface Customer {
  id: string; name: string; phone: string | null; email: string | null;
  address: string | null; state: string | null; gst_no: string | null;
}

interface Props {
  kind: "quotation" | "invoice";
  initialHeader: DocHeader;
  initialItems: DocItem[];
  onSubmit: (header: DocHeader, items: DocItem[], totals: ReturnType<typeof computeTotals>) => Promise<unknown>;
  submitting?: boolean;
  title: string;
}

const GST_RATES = [0, 5, 12, 18, 28];

const DocForm = ({ kind, initialHeader, initialItems, onSubmit, submitting, title }: Props) => {
  const [header, setHeader] = useState<DocHeader>(initialHeader);
  const [items, setItems] = useState<DocItem[]>(initialItems.length ? initialItems : [emptyItem()]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    supabase.from("customers").select("id,name,phone,email,address,state,gst_no").order("name")
      .then(({ data }) => setCustomers(data ?? []));
  }, []);

  const updateItem = (id: string, patch: Partial<DocItem>) =>
    setItems(prev => prev.map(i => i.id === id ? recomputeItem({ ...i, ...patch }) : i));

  const totals = computeTotals(items, header.gst_type, header.discount);

  const selectCustomer = (id: string) => {
    const c = customers.find(x => x.id === id);
    if (!c) { setHeader(h => ({ ...h, customer_id: null })); return; }
    setHeader(h => ({
      ...h, customer_id: c.id,
      customer_snapshot: {
        name: c.name, phone: c.phone ?? "", email: c.email ?? "",
        address: c.address ?? "", state: c.state ?? "", gst_no: c.gst_no ?? "",
      },
    }));
  };

  const handleSubmit = async () => {
    if (!header.customer_snapshot.name) return toast.error("Customer name required");
    if (items.every(i => !i.description)) return toast.error("Add at least one item");
    await onSubmit(header, items.filter(i => i.description), totals);
  };

  return (
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-black text-foreground tracking-tight">{title}</h1>
        <button onClick={handleSubmit} disabled={submitting}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition disabled:opacity-50 disabled:hover:translate-y-0">
          <Save className="h-4 w-4" /> {submitting ? "Saving…" : "Save Document"}
        </button>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider mb-1.5 block">
            {kind === "quotation" ? "Quote No" : "Invoice No"}
          </label>
          <input value={header.doc_no} onChange={e => setHeader({ ...header, doc_no: e.target.value })}
            className="glass-input" />
        </div>
        <div>
          <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider mb-1.5 block">Date</label>
          <input type="date" value={header.doc_date} onChange={e => setHeader({ ...header, doc_date: e.target.value })}
            className="glass-input" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
            {kind === "quotation" ? "Valid Until" : "Due Date"}
          </label>
          <input type="date"
            value={kind === "quotation" ? header.valid_until ?? "" : header.due_date ?? ""}
            onChange={e => setHeader(kind === "quotation"
              ? { ...header, valid_until: e.target.value }
              : { ...header, due_date: e.target.value })}
            className="w-full border border-input rounded-md px-3 py-2 text-sm bg-card" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">GST Type</label>
          <div className="flex">
            <button type="button" onClick={() => setHeader({ ...header, gst_type: "CGST_SGST" })}
              className={`flex-1 py-2 text-sm rounded-l-md border ${header.gst_type === "CGST_SGST" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-input"}`}>
              CGST+SGST
            </button>
            <button type="button" onClick={() => setHeader({ ...header, gst_type: "IGST" })}
              className={`flex-1 py-2 text-sm rounded-r-md border-t border-r border-b ${header.gst_type === "IGST" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-input"}`}>
              IGST
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 mb-4">
        <h3 className="font-semibold text-foreground mb-3">Bill To</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select value={header.customer_id ?? ""} onChange={e => selectCustomer(e.target.value)}
            className="border border-input rounded-md px-3 py-2 text-sm bg-card md:col-span-3">
            <option value="">— Select existing customer or enter below —</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` (${c.phone})` : ""}</option>)}
          </select>
          <input value={header.customer_snapshot.name}
            onChange={e => setHeader({ ...header, customer_snapshot: { ...header.customer_snapshot, name: e.target.value } })}
            placeholder="Customer name *" className="border border-input rounded-md px-3 py-2 text-sm bg-card" />
          <input value={header.customer_snapshot.phone ?? ""}
            onChange={e => setHeader({ ...header, customer_snapshot: { ...header.customer_snapshot, phone: e.target.value } })}
            placeholder="Phone" className="border border-input rounded-md px-3 py-2 text-sm bg-card" />
          <input value={header.customer_snapshot.gst_no ?? ""}
            onChange={e => setHeader({ ...header, customer_snapshot: { ...header.customer_snapshot, gst_no: e.target.value } })}
            placeholder="GST No" className="border border-input rounded-md px-3 py-2 text-sm bg-card" />
          <input value={header.customer_snapshot.address ?? ""}
            onChange={e => setHeader({ ...header, customer_snapshot: { ...header.customer_snapshot, address: e.target.value } })}
            placeholder="Address" className="border border-input rounded-md px-3 py-2 text-sm bg-card md:col-span-2" />
          <input value={header.customer_snapshot.state ?? ""}
            onChange={e => setHeader({ ...header, customer_snapshot: { ...header.customer_snapshot, state: e.target.value } })}
            placeholder="State" className="border border-input rounded-md px-3 py-2 text-sm bg-card" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Items</h3>
          <button onClick={() => setItems(p => [...p, emptyItem()])}
            className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary text-primary-foreground text-xs">
                <th className="py-2 px-2 text-left rounded-tl-md">#</th>
                <th className="py-2 px-2 text-left">DESCRIPTION</th>
                {kind === "invoice" && <th className="py-2 px-2 text-left">HSN</th>}
                <th className="py-2 px-2 text-center">W</th>
                <th className="py-2 px-2 text-center">H</th>
                <th className="py-2 px-2 text-center">UNIT</th>
                <th className="py-2 px-2 text-center">QTY</th>
                <th className="py-2 px-2 text-center">SQFT</th>
                <th className="py-2 px-2 text-right">RATE</th>
                <th className="py-2 px-2 text-center">GST%</th>
                <th className="py-2 px-2 text-right">AMOUNT</th>
                <th className="py-2 px-2 rounded-tr-md"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.id} className="border-b border-border">
                  <td className="py-2 px-2 text-muted-foreground">{idx + 1}</td>
                  <td className="py-2 px-2">
                    <input value={it.description} onChange={e => updateItem(it.id, { description: e.target.value })}
                      placeholder="Item" className="w-40 border border-input rounded px-2 py-1 text-sm bg-card" />
                  </td>
                  {kind === "invoice" && (
                    <td className="py-2 px-2">
                      <input value={it.hsn_code ?? ""} onChange={e => updateItem(it.id, { hsn_code: e.target.value })}
                        className="w-20 border border-input rounded px-2 py-1 text-sm bg-card" />
                    </td>
                  )}
                  <td className="py-2 px-2">
                    <input type="number" value={it.width ?? ""} onChange={e => updateItem(it.id, { width: e.target.value ? +e.target.value : null })}
                      className="w-16 border border-input rounded px-2 py-1 text-sm bg-card" />
                  </td>
                  <td className="py-2 px-2">
                    <input type="number" value={it.height ?? ""} onChange={e => updateItem(it.id, { height: e.target.value ? +e.target.value : null })}
                      className="w-16 border border-input rounded px-2 py-1 text-sm bg-card" />
                  </td>
                  <td className="py-2 px-2">
                    <select value={it.unit ?? ""} onChange={e => updateItem(it.id, { unit: (e.target.value || null) as DocItem["unit"] })}
                      className="border border-input rounded px-1 py-1 text-sm bg-card">
                      <option value="">—</option><option value="ft">ft</option><option value="in">in</option><option value="mm">mm</option>
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <input type="number" value={it.qty} onChange={e => updateItem(it.id, { qty: +e.target.value })}
                      className="w-16 border border-input rounded px-2 py-1 text-sm text-center bg-card" />
                  </td>
                  <td className="py-2 px-2 text-center text-muted-foreground">{it.area_sqft ?? "—"}</td>
                  <td className="py-2 px-2">
                    <input type="number" value={it.rate} onChange={e => updateItem(it.id, { rate: +e.target.value })}
                      className="w-20 border border-input rounded px-2 py-1 text-sm text-right bg-card" />
                  </td>
                  <td className="py-2 px-2">
                    <select value={it.gst_percent} onChange={e => updateItem(it.id, { gst_percent: +e.target.value })}
                      className="border border-input rounded px-1 py-1 text-sm bg-card">
                      {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </td>
                  <td className="py-2 px-2 text-right font-medium">₹{it.amount.toFixed(2)}</td>
                  <td className="py-2 px-2">
                    {items.length > 1 && (
                      <button onClick={() => setItems(p => p.filter(i => i.id !== it.id))} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <textarea value={header.notes ?? ""} onChange={e => setHeader({ ...header, notes: e.target.value })}
              placeholder="Notes" rows={3} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-card resize-none" />
            {kind === "quotation" && (
              <textarea value={header.terms ?? ""} onChange={e => setHeader({ ...header, terms: e.target.value })}
                placeholder="Terms & Conditions" rows={3} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-card resize-none" />
            )}
          </div>
          <div className="w-full md:w-80 ml-auto space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Sub Total</span><span>₹{totals.sub_total.toFixed(2)}</span></div>
            {header.gst_type === "CGST_SGST" ? (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span>₹{totals.cgst.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span>₹{totals.sgst.toFixed(2)}</span></div>
              </>
            ) : (
              <div className="flex justify-between"><span className="text-muted-foreground">IGST</span><span>₹{totals.igst.toFixed(2)}</span></div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Discount</span>
              <input type="number" value={header.discount} onChange={e => setHeader({ ...header, discount: +e.target.value || 0 })}
                className="w-24 border border-input rounded px-2 py-1 text-sm text-right bg-card" />
            </div>
            <div className="flex justify-between font-bold border-t border-border pt-2 mt-2 text-base">
              <span>Net Amount</span><span>₹{totals.net_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocForm;
