import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  state: string | null;
  gst_no: string | null;
}

const empty = { name: "", phone: "", email: "", address: "", state: "", gst_no: "" };

const Suppliers = () => {
  const [list, setList] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("suppliers").select("id,name,phone,email,address,state,gst_no").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setList(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setForm(empty); setEditingId(null); setShowForm(false); };

  const save = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    if (editingId) {
      const { error } = await supabase.from("suppliers").update(form).eq("id", editingId);
      if (error) return toast.error(error.message);
      toast.success("Supplier updated");
    } else {
      const { error } = await supabase.from("suppliers").insert(form);
      if (error) return toast.error(error.message);
      toast.success("Supplier added");
    }
    reset(); load();
  };

  const edit = (s: Supplier) => {
    setForm({ name: s.name, phone: s.phone ?? "", email: s.email ?? "", address: s.address ?? "", state: s.state ?? "", gst_no: s.gst_no ?? "" });
    setEditingId(s.id); setShowForm(true);
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Supplier deleted"); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Suppliers</h1>
        <button onClick={() => { reset(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Supplier
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border border-border p-5 mb-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="input" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="input" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="input" />
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="input col-span-2" />
          <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="input" />
          <input value={form.gst_no} onChange={(e) => setForm({ ...form, gst_no: e.target.value })} placeholder="GST No" className="input" />
          <div className="flex gap-2 col-span-2 md:col-span-3">
            <button onClick={save} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm">{editingId ? "Update" : "Add"}</button>
            <button onClick={reset} className="border border-input px-4 py-2 rounded-md text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">NAME</th>
              <th className="text-left px-4 py-3 font-semibold">PHONE</th>
              <th className="text-left px-4 py-3 font-semibold">STATE</th>
              <th className="text-left px-4 py-3 font-semibold">GST NO</th>
              <th className="text-center px-4 py-3 font-semibold">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading…</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">
                <Truck className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />No suppliers yet
              </td></tr>
            ) : list.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-3 text-foreground">{s.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.state}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.gst_no}</td>
                <td className="px-4 py-3 text-center">
                  <div className="inline-flex gap-3">
                    <button onClick={() => edit(s)} className="text-primary"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => del(s.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Suppliers;
