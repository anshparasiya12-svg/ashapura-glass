import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FilePlus, FileText, Package, BarChart3, Settings, Zap, Users,
  Triangle, LogOut, ClipboardList, Truck, Hammer, Receipt, ShoppingCart, FolderKanban,
  ChevronRight,
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
      { label: "Quotations",  icon: ClipboardList, path: "/quotations" },
      { label: "New Invoice", icon: FilePlus,       path: "/invoice/new" },
      { label: "All Invoices",icon: FileText,        path: "/invoices" },
      { label: "Customers",   icon: Users,           path: "/customers" },
    ],
  },
  {
    label: "Factory",
    items: [
      { label: "Glass Optimizer", icon: Triangle,      path: "/glass-optimizer" },
      { label: "Work Orders",     icon: Hammer,         path: "/work-orders" },
      { label: "Deliveries",      icon: Truck,          path: "/deliveries" },
      { label: "Projects",        icon: FolderKanban,   path: "/projects" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { label: "Products",  icon: Package,      path: "/products" },
      { label: "Purchases", icon: ShoppingCart,  path: "/purchases" },
      { label: "Suppliers", icon: Truck,         path: "/suppliers" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Expenses", icon: Receipt,   path: "/expenses" },
      { label: "Reports",  icon: BarChart3, path: "/reports" },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", icon: Settings, path: "/settings" }],
  },
];

const AppSidebar = () => {
  const location = useLocation();
  const { signOut, user, roles } = useAuth();

  const onLogout = async () => {
    await signOut();
    toast.success("Signed out");
  };

  // Get initials for avatar
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AG";

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-50 overflow-hidden sidebar-gradient border-r border-white/5">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-teal-500/10 to-transparent pointer-events-none" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-20 h-20 bg-teal-500/20 blur-2xl rounded-full pointer-events-none" />

      {/* ── Brand ── */}
      <div className="relative flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg flex-shrink-0">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-white leading-tight font-display">Ashapura Glass</h1>
          <p className="text-[10px] text-teal-300/60 font-medium tracking-wide">Business Suite</p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="relative flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {groups.map((g) => (
          <div key={g.label} className="mb-2">
            <p className="text-[9px] uppercase tracking-widest text-white/25 px-3 mb-1 mt-3 font-semibold">
              {g.label}
            </p>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
                      isActive
                        ? "bg-teal-500/20 text-teal-300 shadow-sm"
                        : "text-white/55 hover:text-white/90 hover:bg-white/6"
                    }`}
                  >
                    {/* Active pill indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-teal-400 rounded-r-full" />
                    )}
                    <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-teal-400" : "text-white/40 group-hover:text-white/70"} transition-colors`} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && <ChevronRight className="h-3 w-3 text-teal-400/60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User Section ── */}
      <div className="relative px-3 py-3 border-t border-white/5 bg-black/20">
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg mb-1">
            {/* Avatar */}
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] text-white/80 font-medium truncate leading-tight">{user.email}</p>
              <p className="text-[10px] text-white/35 uppercase tracking-wide">{roles[0] ?? "operator"}</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
