import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, TrendingUp, IndianRupee, FilePlus, Package, Users, BarChart3, AlertTriangle, ClipboardList, Triangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSettings, getInvoices } from "@/lib/store";

interface DashProduct { id: string; name: string; stock: number; low_stock_threshold: number }

const Dashboard = () => {
  const [settings] = useState(getSettings());
  const [productCount, setProductCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [lowStock, setLowStock] = useState<DashProduct[]>([]);
  const [inStock, setInStock] = useState(0);
  const [outStock, setOutStock] = useState(0);

  const invoices = getInvoices();
  const now = new Date();
  const thisMonth = invoices.filter((i) => {
    const d = new Date(i.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthRevenue = thisMonth.reduce((s, i) => s + i.netAmount, 0);
  const totalRevenue = invoices.reduce((s, i) => s + i.netAmount, 0);
  const totalGst = invoices.reduce((s, i) => s + i.cgst + i.sgst + i.igst, 0);

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
    { label: "Total Sales", value: `₹${totalRevenue.toFixed(2)}`, icon: IndianRupee, tint: "bg-emerald-50 text-emerald-600" },
    { label: "This Month", value: `₹${monthRevenue.toFixed(2)}`, icon: TrendingUp, tint: "bg-sky-50 text-sky-600" },
    { label: "Invoices", value: invoices.length.toString(), icon: FileText, tint: "bg-amber-50 text-amber-600" },
    { label: "GST Collected", value: `₹${totalGst.toFixed(2)}`, icon: BarChart3, tint: "bg-violet-50 text-violet-600" },
    { label: "Products", value: productCount.toString(), icon: Package, tint: "bg-teal-50 text-teal-600" },
    { label: "Customers", value: customerCount.toString(), icon: Users, tint: "bg-rose-50 text-rose-600" },
  ];

  const actions = [
    { label: "Create Quotation", sub: "New quote", to: "/quotations", icon: ClipboardList },
    { label: "Create Invoice", sub: "New bill", to: "/invoice/new", icon: FilePlus },
    { label: "Glass Optimizer", sub: "Cut planning", to: "/glass-optimizer", icon: Triangle },
    { label: "View Reports", sub: "Sales & GST", to: "/reports", icon: BarChart3 },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Glass business at a glance</p>
        </div>
        <Link to="/invoice/new" className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition">
          <FilePlus className="h-4 w-4" /> New Invoice
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card/50 backdrop-blur-xl rounded-2xl p-5 border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${s.tint}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-black text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {actions.map((a) => (
          <Link key={a.label} to={a.to} className="bg-card/50 backdrop-blur-xl rounded-2xl p-5 border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-teal-500/30 hover:bg-teal-500/5 transition-all group flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <a.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{a.label}</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">{a.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Package className="w-5 h-5 text-teal-500" /> Stock Overview</h2>
          <Link to="/products" className="text-sm font-bold text-teal-600 hover:text-teal-700 transition">Manage →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StockOverviewCard label="In Stock" value={inStock} dot="bg-green-500" bg="bg-green-500/10 border-green-500/20" />
          <StockOverviewCard label="Low Stock" value={lowStock.length} dot="bg-orange-500" bg="bg-orange-500/10 border-orange-500/20" />
          <StockOverviewCard label="Out of Stock" value={outStock} dot="bg-red-500" bg="bg-red-500/10 border-red-500/20" />
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-sm font-semibold text-red-700">Low Stock Alert</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span key={p.id} className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full">{p.name} ({p.stock} left)</span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><FileText className="w-5 h-5 text-teal-500" /> Recent Invoices</h2>
          <Link to="/invoices" className="text-sm font-bold text-teal-600 hover:text-teal-700 transition">View All →</Link>
        </div>
        {invoices.length === 0 ? (
          <div className="text-center py-16 bg-muted/20">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="font-bold text-foreground">No invoices yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first invoice to see it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-wider bg-muted/30">
                  <th className="text-left px-6 py-4 font-bold">Invoice #</th>
                  <th className="text-left px-6 py-4 font-bold">Date</th>
                  <th className="text-left px-6 py-4 font-bold">Customer</th>
                  <th className="text-right px-6 py-4 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(-5).reverse().map((inv) => (
                  <tr key={inv.id} className="border-t border-border/50 hover:bg-muted/30 transition">
                    <td className="px-6 py-4 font-mono font-bold text-teal-600 dark:text-teal-400">{inv.invoiceNo}</td>
                    <td className="px-6 py-4 font-medium text-muted-foreground">{inv.date}</td>
                    <td className="px-6 py-4 font-bold text-foreground">{inv.customerName}</td>
                    <td className="px-6 py-4 text-right font-black text-foreground">₹{inv.netAmount.toFixed(2)}</td>
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

const StockOverviewCard = ({ label, value, dot, bg }: { label: string; value: number; dot: string; bg: string }) => (
  <div className={`${bg} rounded-xl p-5 border shadow-sm`}>
    <div className="flex items-center gap-2 mb-2">
      <span className={`h-2.5 w-2.5 rounded-full ${dot} shadow-[0_0_8px_currentColor]`} />
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
    <p className="text-3xl font-black text-foreground">{value} <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">Items</span></p>
  </div>
);

export default Dashboard;
