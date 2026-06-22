import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  category: string | null;
  thickness_mm: number | null;
  hsn_code: string | null;
  unit: string;
  rate: number;
  gst_percent: number;
  stock: number;
  low_stock_threshold: number;
}

const CATEGORIES = ["Clear Glass", "Tinted Glass", "Reflective Glass", "Toughened Glass", "Laminated Glass", "Mirror", "ACP", "Hardware", "Custom"];
const THICKNESSES = [4, 5, 6, 8, 10, 12, 15, 19];

const emptyForm = { name: "", category: "Clear Glass", thickness_mm: 5, hsn_code: "", unit: "sqft", rate: 0, gst_percent: 18, stock: 0, low_stock_threshold: 10 };

const stockStatus = (p: Product) => (p.stock <= 0 ? "out" : p.stock <= p.low_stock_threshold ? "low" : "in");

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setProducts((data as Product[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const save = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    if (editingId) {
      const { error } = await supabase.from("products").update(form).eq("id", editingId);
      if (error) return toast.error(error.message);
      toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert(form);
      if (error) return toast.error(error.message);
      toast.success("Product added");
    }
    reset(); load();
  };

  const edit = (p: Product) => {
    setForm({
      name: p.name, category: p.category ?? "Clear Glass", thickness_mm: Number(p.thickness_mm ?? 5),
      hsn_code: p.hsn_code ?? "", unit: p.unit, rate: Number(p.rate), gst_percent: Number(p.gst_percent),
      stock: Number(p.stock), low_stock_threshold: Number(p.low_stock_threshold),
    });
    setEditingId(p.id); setShowForm(true);
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const inStock = products.filter((p) => stockStatus(p) === "in").length;
  const lowStock = products.filter((p) => stockStatus(p) === "low").length;
  const outStock = products.filter((p) => stockStatus(p) === "out").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Product Master</h1>
        <button onClick={() => { reset(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StockCard label="In Stock" value={inStock} color="bg-green-500" />
        <StockCard label="Low Stock" value={lowStock} color="bg-orange-500" />
        <StockCard label="Out of Stock" value={outStock} color="bg-red-500" />
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border border-border p-5 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product Name" className="input" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={form.thickness_mm} onChange={(e) => setForm({ ...form, thickness_mm: Number(e.target.value) })} className="input">
              {THICKNESSES.map((t) => <option key={t} value={t}>{t} mm</option>)}
            </select>
            <input value={form.hsn_code} onChange={(e) => setForm({ ...form, hsn_code: e.target.value })} placeholder="HSN Code" className="input" />
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input">
              {["sqft", "nos", "mtr", "kg", "box", "set", "pcs"].map((u) => <option key={u}>{u}</option>)}
            </select>
            <input type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })} placeholder="Rate" className="input" />
            <select value={form.gst_percent} onChange={(e) => setForm({ ...form, gst_percent: Number(e.target.value) })} className="input">
              {[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}
            </select>
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} placeholder="Stock" className="input" />
            <input type="number" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: Number(e.target.value) })} placeholder="Low stock alert" className="input" />
            <div className="flex gap-2 col-span-2">
              <button onClick={save} className="bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm flex-1">{editingId ? "Update" : "Add"}</button>
              <button onClick={reset} className="border border-input px-3 py-2 rounded-md text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">NAME</th>
              <th className="text-left px-4 py-3 font-semibold">CATEGORY</th>
              <th className="text-left px-4 py-3 font-semibold">THICK</th>
              <th className="text-left px-4 py-3 font-semibold">UNIT</th>
              <th className="text-right px-4 py-3 font-semibold">RATE</th>
              <th className="text-center px-4 py-3 font-semibold">GST</th>
              <th className="text-left px-4 py-3 font-semibold">STOCK</th>
              <th className="text-left px-4 py-3 font-semibold">STATUS</th>
              <th className="text-center px-4 py-3 font-semibold">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">Loading…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No products yet</td></tr>
            ) : products.map((p) => {
              const s = stockStatus(p);
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.thickness_mm} mm</td>
                  <td className="px-4 py-3 text-foreground">{p.unit}</td>
                  <td className="px-4 py-3 text-right text-foreground">₹{Number(p.rate).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center text-foreground">{p.gst_percent}%</td>
                  <td className="px-4 py-3 text-foreground">{p.stock} {p.unit}</td>
                  <td className="px-4 py-3"><StatusPill status={s} /></td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex gap-3">
                      <button onClick={() => edit(p)} className="text-primary hover:opacity-70"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => del(p.id)} className="text-destructive hover:opacity-70"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StockCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
    <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  </div>
);

const StatusPill = ({ status }: { status: "in" | "low" | "out" }) => {
  const map = {
    in: { label: "In Stock", cls: "bg-green-100 text-green-700", dot: "bg-green-500" },
    low: { label: "Low Stock", cls: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
    out: { label: "Out of Stock", cls: "bg-red-100 text-red-700", dot: "bg-red-500" },
  } as const;
  const m = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${m.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />{m.label}
    </span>
  );
};

export default Products;
