import { useRef, useState } from "react";
import { Save, Store, Phone, FileText, Image as ImageIcon, Landmark, CreditCard, Smartphone, Upload, X } from "lucide-react";
import { getSettings, saveSettings, type CompanySettings } from "@/lib/store";
import { toast } from "sonner";

const SettingsPage = () => {
  const [form, setForm] = useState<CompanySettings>(getSettings());
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (k: keyof CompanySettings, v: string) => setForm({ ...form, [k]: v });

  const handleSave = () => { saveSettings(form); toast.success("Settings saved!"); };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, logo: reader.result as string });
    reader.readAsDataURL(file);
  };

  const inputCls = "w-full border border-input rounded-md px-3 py-2 text-sm bg-card text-foreground";
  const labelCls = "text-xs font-semibold text-muted-foreground uppercase mb-1 block";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your shop and bank details. Saved data appears on every invoice.</p>
      </div>

      {/* Shop Details */}
      <section className="bg-card rounded-xl border border-border mb-6 overflow-hidden">
        <header className="flex items-center justify-between p-5 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Shop Details</h2>
              <p className="text-xs text-muted-foreground">Business, contact, GST and logo</p>
            </div>
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
            <Save className="h-4 w-4" /> Update
          </button>
        </header>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3"><Store className="h-4 w-4 text-primary" /><h3 className="text-sm font-bold">Business Information</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelCls}>Shop Name</label><input className={inputCls} value={form.companyName} onChange={(e) => update("companyName", e.target.value)} /></div>
              <div><label className={labelCls}>Owner Name</label><input className={inputCls} value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} /></div>
              <div>
                <label className={labelCls}>Business Type</label>
                <select className={inputCls} value={form.businessType} onChange={(e) => update("businessType", e.target.value)}>
                  {["Proprietorship", "Partnership", "Private Limited", "LLP", "Other"].map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3"><Phone className="h-4 w-4 text-primary" /><h3 className="text-sm font-bold">Contact Information</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelCls}>Mobile Number</label><input className={inputCls} value={form.phone} onChange={(e) => update("phone", e.target.value)} /></div>
              <div><label className={labelCls}>Email Address</label><input className={inputCls} value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelCls}>Shop Address</label><input className={inputCls} value={form.address} onChange={(e) => update("address", e.target.value)} /></div>
              <div><label className={labelCls}>City</label><input className={inputCls} value={form.city} onChange={(e) => update("city", e.target.value)} /></div>
              <div><label className={labelCls}>State</label><input className={inputCls} value={form.state} onChange={(e) => update("state", e.target.value)} /></div>
              <div><label className={labelCls}>Pincode</label><input className={inputCls} value={form.pincode} onChange={(e) => update("pincode", e.target.value)} /></div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3"><FileText className="h-4 w-4 text-primary" /><h3 className="text-sm font-bold">GST Information</h3></div>
            <div><label className={labelCls}>GST Number</label><input className={inputCls} placeholder="22AAAAA0000A1Z5" value={form.gstNo} onChange={(e) => update("gstNo", e.target.value)} /></div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3"><ImageIcon className="h-4 w-4 text-primary" /><h3 className="text-sm font-bold">Shop Logo</h3></div>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30">
                {form.logo ? <img src={form.logo} alt="logo" className="h-full w-full object-contain" /> : <ImageIcon className="h-8 w-8 text-muted-foreground/40" />}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogo} />
                <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 border border-input px-3 py-2 rounded-md text-sm">
                  <Upload className="h-4 w-4" /> {form.logo ? "Replace logo" : "Upload logo"}
                </button>
                {form.logo && (
                  <button onClick={() => update("logo", "")} className="ml-2 inline-flex items-center gap-1 text-destructive text-sm">
                    <X className="h-4 w-4" /> Remove
                  </button>
                )}
                <p className="text-xs text-muted-foreground mt-1">PNG or JPG, max 2 MB</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bank Details */}
      <section className="bg-card rounded-xl border border-border overflow-hidden">
        <header className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Bank Details</h2>
              <p className="text-xs text-muted-foreground">Bank, account and UPI used for payments</p>
            </div>
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
            <Save className="h-4 w-4" /> Update
          </button>
        </header>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3"><Landmark className="h-4 w-4 text-primary" /><h3 className="text-sm font-bold">Bank Information</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelCls}>Bank Name</label><input className={inputCls} value={form.bankName} onChange={(e) => update("bankName", e.target.value)} /></div>
              <div><label className={labelCls}>Branch Name</label><input className={inputCls} value={form.branchName} onChange={(e) => update("branchName", e.target.value)} /></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3"><CreditCard className="h-4 w-4 text-primary" /><h3 className="text-sm font-bold">Account Details</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelCls}>Account Holder Name</label><input className={inputCls} value={form.accountHolderName} onChange={(e) => update("accountHolderName", e.target.value)} /></div>
              <div><label className={labelCls}>Account Number</label><input className={inputCls} value={form.bankAcNo} onChange={(e) => update("bankAcNo", e.target.value)} /></div>
              <div><label className={labelCls}>IFSC Code</label><input className={inputCls} value={form.ifscCode} onChange={(e) => update("ifscCode", e.target.value)} /></div>
              <div>
                <label className={labelCls}>Account Type</label>
                <select className={inputCls} value={form.accountType} onChange={(e) => update("accountType", e.target.value)}>
                  {["Current", "Savings"].map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3"><Smartphone className="h-4 w-4 text-primary" /><h3 className="text-sm font-bold">UPI Details</h3></div>
            <div><label className={labelCls}>UPI ID</label><input className={inputCls} placeholder="yourname@bank" value={form.upiId} onChange={(e) => update("upiId", e.target.value)} /></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
