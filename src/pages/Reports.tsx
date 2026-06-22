import { useState } from "react";
import { getInvoices } from "@/lib/store";
import { BarChart3, TrendingUp, IndianRupee, Download, Calendar, ArrowUpRight } from "lucide-react";

const periods = [
  { key: "month" as const,   label: "This Month" },
  { key: "quarter" as const, label: "This Quarter" },
  { key: "all" as const,     label: "All Time" },
];

const Reports = () => {
  const [period, setPeriod] = useState<"month" | "quarter" | "all">("month");
  const invoices = getInvoices();
  const now = new Date();

  const filtered = invoices.filter((i) => {
    const d = new Date(i.date);
    if (period === "all") return true;
    if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    const q = Math.floor(now.getMonth() / 3);
    const dq = Math.floor(d.getMonth() / 3);
    return q === dq && d.getFullYear() === now.getFullYear();
  });

  const totals = filtered.reduce(
    (acc, i) => ({
      sub:  acc.sub  + i.subTotal,
      cgst: acc.cgst + i.cgst,
      sgst: acc.sgst + i.sgst,
      igst: acc.igst + i.igst,
      net:  acc.net  + i.netAmount,
    }),
    { sub: 0, cgst: 0, sgst: 0, igst: 0, net: 0 }
  );

  const summaryCards = [
    { label: "Sub Total",   value: totals.sub,  icon: IndianRupee, gradient: "from-teal-500 to-emerald-500",   bg: "from-teal-50 to-emerald-50",   border: "border-teal-100",   text: "text-teal-700"   },
    { label: "CGST",        value: totals.cgst, icon: BarChart3,   gradient: "from-sky-500 to-blue-500",       bg: "from-sky-50 to-blue-50",       border: "border-sky-100",    text: "text-sky-700"    },
    { label: "SGST",        value: totals.sgst, icon: BarChart3,   gradient: "from-violet-500 to-purple-500",  bg: "from-violet-50 to-purple-50",  border: "border-violet-100", text: "text-violet-700" },
    { label: "IGST",        value: totals.igst, icon: BarChart3,   gradient: "from-amber-500 to-orange-500",  bg: "from-amber-50 to-orange-50",   border: "border-amber-100",  text: "text-amber-700"  },
    { label: "Net Total",   value: totals.net,  icon: TrendingUp,  gradient: "from-emerald-500 to-green-500", bg: "from-emerald-50 to-green-50",  border: "border-emerald-100",text: "text-emerald-700"},
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <BarChart3 className="h-4 w-4 text-teal-500" />
            <p className="text-xs text-muted-foreground font-medium">Financial Overview</p>
          </div>
          <h1 className="text-2xl font-bold text-foreground font-display">Reports</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  period === p.key
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="h-3 w-3" />
                {p.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow transition-all">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-7 stagger-children">
        {summaryCards.map((c) => (
          <div key={c.label} className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-4 animate-fade-in-up hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-3 shadow-sm`}>
              <c.icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-[11px] text-muted-foreground mb-0.5">{c.label}</p>
            <p className={`text-base font-bold ${c.text}`}>₹{c.value.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Invoice Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-foreground font-display">Invoice Breakdown</h2>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full ml-1">
              {filtered.length} records
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUpRight className="h-3 w-3" />
            {periods.find(p => p.key === period)?.label}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Invoice #</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sub Total</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">GST</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Net Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium text-foreground">No invoices in this period</p>
                    <p className="text-sm mt-1">Try selecting a different time range</p>
                  </td>
                </tr>
              ) : (
                filtered.map((i) => (
                  <tr key={i.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-primary font-semibold text-xs bg-primary/8 px-2 py-0.5 rounded-md">{i.invoiceNo}</span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{i.date}</td>
                    <td className="px-5 py-3.5 text-foreground font-medium text-xs">{i.customerName}</td>
                    <td className="px-5 py-3.5 text-right text-xs">₹{i.subTotal.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-right text-xs text-amber-600 font-medium">₹{(i.cgst + i.sgst + i.igst).toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-foreground">₹{i.netAmount.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-gradient-to-r from-teal-50 to-emerald-50 border-t-2 border-teal-100">
                  <td colSpan={3} className="px-5 py-3 text-xs font-bold text-teal-700 uppercase tracking-wide">Total ({filtered.length} invoices)</td>
                  <td className="px-5 py-3 text-right text-xs font-bold text-teal-700">₹{totals.sub.toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-xs font-bold text-amber-600">₹{(totals.cgst + totals.sgst + totals.igst).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right font-bold text-teal-700 text-sm">₹{totals.net.toFixed(2)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
