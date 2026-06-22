import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { getInvoices } from "@/lib/store";

const GstReports = () => {
  const invoices = getInvoices();
  const [period, setPeriod] = useState("all");

  const filtered = period === "all" ? invoices : invoices.filter((inv) => {
    const d = new Date(inv.date);
    const now = new Date();
    if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === "quarter") {
      const q = Math.floor(now.getMonth() / 3);
      const iq = Math.floor(d.getMonth() / 3);
      return iq === q && d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalCgst = filtered.reduce((s, i) => s + i.cgst, 0);
  const totalSgst = filtered.reduce((s, i) => s + i.sgst, 0);
  const totalIgst = filtered.reduce((s, i) => s + i.igst, 0);
  const totalTax = totalCgst + totalSgst + totalIgst;
  const totalTaxable = filtered.reduce((s, i) => s + i.subTotal, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-foreground tracking-tight">GST Reports</h1>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="border border-input rounded-md px-3 py-2 text-sm bg-card text-foreground">
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Taxable Amount", value: totalTaxable },
          { label: "CGST", value: totalCgst },
          { label: "SGST", value: totalSgst },
          { label: "IGST", value: totalIgst },
        ].map((s) => (
          <div key={s.label} className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold text-foreground">₹{s.value.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
        <h2 className="text-base font-semibold text-foreground mb-2">Total Tax Collected</h2>
        <p className="text-3xl font-bold text-primary">₹{totalTax.toFixed(2)}</p>
        {filtered.length === 0 && (
          <div className="text-center py-8 mt-4">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No data for the selected period</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GstReports;

