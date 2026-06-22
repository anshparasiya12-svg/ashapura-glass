import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText, TrendingUp, IndianRupee, FilePlus, Package, Users,
  BarChart3, AlertTriangle, ClipboardList, Triangle, ArrowUpRight,
  Activity, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSettings, getInvoices } from "@/lib/store";

interface DashProduct { id: string; name: string; stock: number; low_stock_threshold: number }

// Animated counter hook
const useCounter = (target: number, duration = 800) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
};

const Dashboard = () => {
  const [settings] = useState(getSettings());
  const [productCount, setProductCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [lowStock, setLowStock] = useState<DashProduct[]>([]);
  const [inStock, setInStock]   = useState(0);
  const [outStock, setOutStock] = useState(0);

  const invoices     = getInvoices();
  const now          = new Date();
  const thisMonth    = invoices.filter((i) => {
    const d = new Date(i.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthRevenue = thisMonth.reduce((s, i) => s + i.netAmount, 0);
  const totalRevenue = invoices.reduce((s, i) => s + i.netAmount, 0);
  const totalGst     = invoices.reduce((s, i) => s + i.cgst + i.sgst + i.igst, 0);

  useEffect(() => {
    (async () => {
      const [{ count: pc }, { count: cc }, { data: products }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("products").select("id,name,stock,low_stock_threshold"),
      ]);
      setProductCount(pc ?? 0);
      setCustomerCount(cc ?? 0);
      const ps = (products as DashProduct[]) ?? [];
      setLowStock(ps.filter((p) => p.stock > 0 && p.stock <= p.low_stock_threshold));
      setInStock(ps.filter((p) => p.stock > p.low_stock_threshold).length);
      setOutStock(ps.filter((p) => p.stock <= 0).length);
    })();
  }, []);

  const stats = [
    {
      label: "Total Sales",
      value: `₹${totalRevenue.toFixed(0)}`,
      icon: IndianRupee,
      gradient: "from-emerald-500 to-teal-500",
      bg: "from-emerald-50 to-teal-50",
      border: "border-emerald-100",
      text: "text-emerald-700",
      badge: "+12% this month",
    },
    {
      label: "This Month",
      value: `₹${monthRevenue.toFixed(0)}`,
      icon: TrendingUp,
      gradient: "from-sky-500 to-blue-500",
      bg: "from-sky-50 to-blue-50",
      border: "border-sky-100",
      text: "text-sky-700",
      badge: "Current period",
    },
    {
      label: "Invoices",
      value: invoices.length.toString(),
      icon: FileText,
      gradient: "from-amber-500 to-orange-500",
      bg: "from-amber-50 to-orange-50",
      border: "border-amber-100",
      text: "text-amber-700",
      badge: "All time",
    },
    {
      label: "GST Collected",
      value: `₹${totalGst.toFixed(0)}`,
      icon: BarChart3,
      gradient: "from-violet-500 to-purple-500",
      bg: "from-violet-50 to-purple-50",
      border: "border-violet-100",
      text: "text-violet-700",
      badge: "Cumulative",
    },
    {
      label: "Products",
      value: productCount.toString(),
      icon: Package,
      gradient: "from-teal-500 to-cyan-500",
      bg: "from-teal-50 to-cyan-50",
      border: "border-teal-100",
      text: "text-teal-700",
      badge: "In catalog",
    },
    {
      label: "Customers",
      value: customerCount.toString(),
      icon: Users,
      gradient: "from-rose-500 to-pink-500",
      bg: "from-rose-50 to-pink-50",
      border: "border-rose-100",
      text: "text-rose-700",
      badge: "Registered",
    },
  ];

  const actions = [
    { label: "Create Quotation", sub: "New quote",    to: "/quotations",     icon: ClipboardList, gradient: "from-blue-500 to-indigo-500" },
    { label: "Create Invoice",   sub: "New bill",     to: "/invoice/new",    icon: FilePlus,      gradient: "from-teal-500 to-emerald-500" },
    { label: "Glass Optimizer",  sub: "Cut planning", to: "/glass-optimizer",icon: Triangle,      gradient: "from-amber-500 to-orange-500" },
    { label: "View Reports",     sub: "Sales & GST",  to: "/reports",        icon: BarChart3,     gradient: "from-violet-500 to-purple-500" },
  ];

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles className="h-4 w-4 text-teal-500" />
            <p className="text-xs text-muted-foreground font-medium">Glass Business at a Glance</p>
          </div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            {settings.companyName || "Ashapura Glass"}
          </h1>
        </div>
        <Link
          to="/invoice/new"
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-teal-500/25 transition-all duration-200 group"
        >
          <FilePlus className="h-4 w-4" />
          New Invoice
          <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 stagger-children">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`bg-gradient-to-br ${s.bg} rounded-2xl p-4 border ${s.border} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up`}
          >
            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3 shadow-sm`}>
              <s.icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-[11px] text-muted-foreground mb-0.5">{s.label}</p>
            <p className={`text-base font-bold ${s.text} mt-0.5`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
              <Activity className="h-2.5 w-2.5" />{s.badge}
            </p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {actions.map((a, i) => (
          <Link
            key={a.label}
            to={a.to}
            className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 group animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200`}>
              <a.icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">{a.label}</p>
              <p className="text-xs text-muted-foreground">{a.sub}</p>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 ml-auto group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>
        ))}
      </div>

      {/* ── Stock Overview ── */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-foreground font-display">Stock Overview</h2>
          </div>
          <Link to="/products" className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
            Manage <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StockCard label="In Stock"     value={inStock}        dot="bg-emerald-500" bg="bg-gradient-to-br from-emerald-50 to-teal-50"   border="border-emerald-100" text="text-emerald-700" />
          <StockCard label="Low Stock"    value={lowStock.length} dot="bg-amber-500"   bg="bg-gradient-to-br from-amber-50 to-orange-50"   border="border-amber-100"  text="text-amber-700"  />
          <StockCard label="Out of Stock" value={outStock}        dot="bg-rose-500"    bg="bg-gradient-to-br from-rose-50 to-pink-50"      border="border-rose-100"   text="text-rose-700"   />
        </div>
      </div>

      {/* ── Low Stock Alert ── */}
      {lowStock.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-amber-800">Low Stock Alert</p>
            <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {lowStock.length} item{lowStock.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span key={p.id} className="bg-white border border-amber-200 text-amber-700 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                {p.name} <span className="opacity-60">({p.stock} left)</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Invoices ── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-foreground font-display">Recent Invoices</h2>
          </div>
          <Link to="/invoices" className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
            View All <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="font-semibold text-foreground mb-1">No invoices yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create your first invoice to get started</p>
            <Link
              to="/invoice/new"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <FilePlus className="h-4 w-4" /> Create Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Invoice #</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Customer</th>
                  <th className="text-right px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(-5).reverse().map((inv, i) => (
                  <tr
                    key={inv.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-primary font-semibold text-xs bg-primary/8 px-2 py-0.5 rounded-md">{inv.invoiceNo}</span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{inv.date}</td>
                    <td className="px-5 py-3.5 text-foreground font-medium text-xs">{inv.customerName}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-bold text-foreground">₹{inv.netAmount.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StockCard = ({
  label, value, dot, bg, border, text,
}: { label: string; value: number; dot: string; bg: string; border: string; text: string }) => (
  <div className={`${bg} ${border} border rounded-xl p-4 transition-all duration-200 hover:shadow-sm`}>
    <div className="flex items-center gap-2 mb-2">
      <span className={`h-2.5 w-2.5 rounded-full ${dot} shadow-sm`} />
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
    <p className={`text-2xl font-bold ${text}`}>
      {value}
      <span className="text-xs font-normal text-muted-foreground ml-1">Products</span>
    </p>
  </div>
);

export default Dashboard;
