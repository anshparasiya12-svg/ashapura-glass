import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FilePlus, FileText, Package, BarChart3, Settings, Zap, Users,
  Triangle, LogOut, ClipboardList, Truck, Hammer, Receipt, ShoppingCart, FolderKanban,
  Box
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const groups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", icon: LayoutDashboard, path: "/" }],
  },
  {
    label: "Sales",
    items: [
      { label: "Quotations", icon: ClipboardList, path: "/quotations" },
      { label: "New Invoice", icon: FilePlus, path: "/invoice/new" },
      { label: "All Invoices", icon: FileText, path: "/invoices" },
      { label: "Customers", icon: Users, path: "/customers" },
    ],
  },
  {
    label: "Factory & Production",
    items: [
      { label: "Glass Optimizer", icon: Triangle, path: "/glass-optimizer" },
      { label: "Work Orders", icon: Hammer, path: "/work-orders" },
      { label: "Deliveries", icon: Truck, path: "/deliveries" },
      { label: "Projects", icon: FolderKanban, path: "/projects" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { label: "Products", icon: Box, path: "/products" },
      { label: "Purchases", icon: ShoppingCart, path: "/purchases" },
      { label: "Suppliers", icon: Truck, path: "/suppliers" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Expenses", icon: Receipt, path: "/expenses" },
      { label: "Reports", icon: BarChart3, path: "/reports" },
    ],
  },
];

const AppSidebar = () => {
  const location = useLocation();
  const { signOut, user, roles } = useAuth();

  const onLogout = async () => {
    await signOut();
    toast.success("Signed out");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card/60 backdrop-blur-2xl border-r border-border/50 flex flex-col z-50 overflow-y-auto no-print">
      <div className="flex items-center gap-3 px-6 py-6 mb-2">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Triangle className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight leading-none">KC Glass</h1>
          <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-1 uppercase tracking-wider">ERP Pro</p>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4 space-y-6">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2 mb-2">{g.label}</p>
            <div className="space-y-1">
              {g.items.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
                return (
                  <Link key={item.path} to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                        : "text-foreground/70 hover:bg-muted/50 hover:text-foreground"
                    }`}>
                    <item.icon className={`h-4 w-4 ${isActive ? "text-teal-500" : "text-muted-foreground"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-muted/40 rounded-2xl p-4 border border-border/50">
          <Link to="/settings" className="flex items-center gap-3 text-sm font-medium text-foreground/80 hover:text-foreground mb-4">
            <Settings className="w-4 h-4 text-muted-foreground" /> Settings
          </Link>
          <div className="h-px w-full bg-border/50 mb-4" />
          {user && (
            <div className="mb-3">
              <p className="text-xs text-foreground/90 font-medium truncate">{user.email}</p>
              <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wide mt-0.5">{roles[0] ?? "Admin"}</p>
            </div>
          )}
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-2 rounded-xl text-xs font-bold transition">
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
