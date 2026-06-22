import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Delivery {
  id: string;
  challan_no: string;
  delivery_date: string;
  customer_id: string | null;
  vehicle_no: string | null;
  driver_name: string | null;
  notes: string | null;
  customers?: { name: string } | null;
}

const empty = { challan_no: "", delivery_date: new Date().toISOString().slice(0, 10), customer_id: "", vehicle_no: "", driver_name: "", notes: "" };

const Deliveries = () => {
  const [list, setList] = useState<Delivery[]>([]);
  const [customers, setCustomers] = useState<{id: string, name: string}[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [dRes, cRes] = await Promise.all([
      supabase.from("deliveries").select("id,challan_no,delivery_date,customer_id,vehicle_no,driver_name,notes,customers(name)").order("created_at", { ascending: false }),
      supabase.from("customers").select("id,name").order("name")
    ]);
    if (dRes.error) toast.error(dRes.error.message); else setList(dRes.data ?? []);
    if (cRes.data) setCustomers(cRes.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setForm(empty); setEditingId(null); setShowForm(false); };

  const save = async () => {
    if (!form.challan_no) { toast.error("Challan No required"); return; }
    
    const payload = {
      challan_no: form.challan_no,
      delivery_date: form.delivery_date,
      customer_id: form.customer_id || null,
      vehicle_no: form.vehicle_no,
      driver_name: form.driver_name,
      notes: form.notes
    };

    if (editingId) {
      const { error } = await supabase.from("deliveries").update(payload).eq("id", editingId);
      if (error) return toast.error(error.message);
      toast.success("Challan updated");
    } else {
      const { error } = await supabase.from("deliveries").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Challan generated");
    }
    reset(); load();
  };

  const edit = (d: Delivery) => {
    setForm({ 
      challan_no: d.challan_no, 
      delivery_date: d.delivery_date, 
      customer_id: d.customer_id ?? "", 
      vehicle_no: d.vehicle_no ?? "", 
      driver_name: d.driver_name ?? "", 
      notes: d.notes ?? "" 
    });
    setEditingId(d.id); setShowForm(true);
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("deliveries").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Challan deleted"); load();
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Delivery Challans</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage dispatch and transportation</p>
        </div>
        <button onClick={() => { reset(); setShowForm(true); }} className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition">
          <Plus className="h-4 w-4" /> New Challan
        </button>
      </div>

      {showForm && (
        <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input value={form.challan_no} onChange={(e) => setForm({ ...form, challan_no: e.target.value })} placeholder="Challan No" className="glass-input" />
          <input type="date" value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} className="glass-input" />
          <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} className="glass-input col-span-1 md:col-span-2">
            <option value="">Select Customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input value={form.vehicle_no} onChange={(e) => setForm({ ...form, vehicle_no: e.target.value })} placeholder="Vehicle Number" className="glass-input" />
          <input value={form.driver_name} onChange={(e) => setForm({ ...form, driver_name: e.target.value })} placeholder="Driver Name" className="glass-input" />
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional Notes" className="glass-input col-span-1 md:col-span-2" />
          
          <div className="flex gap-2 col-span-1 md:col-span-2 mt-2">
            <button onClick={save} className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-5 py-2.5 rounded-lg font-bold shadow-md shadow-teal-500/20 transition hover:-translate-y-0.5 text-sm">{editingId ? "Update Challan" : "Generate Challan"}</button>
            <button onClick={reset} className="border border-input px-5 py-2.5 rounded-md text-sm hover:bg-muted/30 transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-muted-foreground uppercase tracking-wider text-xs">
            <tr>
              <th className="text-left px-6 py-4 font-bold">CHALLAN NO</th>
              <th className="text-left px-6 py-4 font-bold">DATE</th>
              <th className="text-left px-6 py-4 font-bold">CUSTOMER</th>
              <th className="text-left px-6 py-4 font-bold">VEHICLE</th>
              <th className="text-center px-6 py-4 font-bold">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading…</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-16 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="font-bold text-foreground">No deliveries yet</p>
                <p className="text-sm">Generate a challan when dispatching materials.</p>
              </td></tr>
            ) : list.map((d) => (
              <tr key={d.id} className="border-t border-border/50 hover:bg-muted/30 transition">
                <td className="px-6 py-4 font-bold text-foreground">{d.challan_no}</td>
                <td className="px-6 py-4 text-muted-foreground">{d.delivery_date}</td>
                <td className="px-6 py-4 font-medium text-foreground">{d.customers?.name || "-"}</td>
                <td className="px-6 py-4 text-muted-foreground">{d.vehicle_no || "-"}</td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex gap-3">
                    <button onClick={() => edit(d)} className="text-teal-600 hover:scale-110 transition"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => del(d.id)} className="text-red-500 hover:scale-110 transition"><Trash2 className="h-4 w-4" /></button>
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

export default Deliveries;
