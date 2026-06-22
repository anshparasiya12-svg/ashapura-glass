import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users as UsersIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  state: string | null;
  gst_no: string | null;
}

const empty = { name: "", phone: "", email: "", address: "", state: "", gst_no: "" };

const Customers = () => {
  const [list, setList] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("customers").select("id,name,phone,email,address,state,gst_no").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setList(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setForm(empty); setEditingId(null); setShowForm(false); };

  const save = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    if (editingId) {
      const { error } = await supabase.from("customers").update(form).eq("id", editingId);
      if (error) return toast.error(error.message);
      toast.success("Customer updated");
    } else {
      const { error } = await supabase.from("customers").insert(form);
      if (error) return toast.error(error.message);
      toast.success("Customer added");
    }
    reset(); load();
  };

  const edit = (c: Customer) => {
    setForm({ name: c.name, phone: c.phone ?? "", email: c.email ?? "", address: c.address ?? "", state: c.state ?? "", gst_no: c.gst_no ?? "" });
    setEditingId(c.id); setShowForm(true);
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Customer deleted"); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-foreground tracking-tight">Customers</h1>
        <button onClick={() => { reset(); setShowForm(true); }} className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition">
          <Plus className="h-4 w-4" /> Add Customer
        </button>
      </div>

      {showForm && (
        <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 mb-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="glass-input" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="glass-input" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="glass-input" />
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="glass-input col-span-2" />
          <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="glass-input" />
          <input value={form.gst_no} onChange={(e) => setForm({ ...form, gst_no: e.target.value })} placeholder="GST No" className="glass-input" />
          <div className="flex gap-2 col-span-2 md:col-span-3">
            <button onClick={save} className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-4 py-2 rounded-lg font-bold shadow-md shadow-teal-500/20 transition hover:-translate-y-0.5 text-sm">{editingId ? "Update" : "Add"}</button>
            <button onClick={reset} className="border border-input px-4 py-2 rounded-md text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-muted-foreground uppercase tracking-wider text-xs">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">NAME</th>
              <th className="text-left px-4 py-3 font-semibold">PHONE</th>
              <th className="text-left px-4 py-3 font-semibold">EMAIL</th>
              <th className="text-left px-4 py-3 font-semibold">STATE</th>
              <th className="text-left px-4 py-3 font-semibold">GST NO</th>
              <th className="text-center px-4 py-3 font-semibold">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Loading…</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">
                <UsersIcon className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />No customers yet
              </td></tr>
            ) : list.map((c) => (
              <tr key={c.id} className="border-t border-border/50 hover:bg-muted/30 transition">
                <td className="px-4 py-3 text-foreground">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.state}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.gst_no}</td>
                <td className="px-4 py-3 text-center">
                  <div className="inline-flex gap-3">
                    <button onClick={() => edit(c)} className="text-primary"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => del(c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
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

export default Customers;

