import { useRef, useState } from "react";
import { Triangle, Plus, Trash2, Calculator, Settings, Layers, Zap, Sparkles, FileDown, Image as ImageIcon, Save, Lock, Unlock, Mic, MessageCircle } from "lucide-react";
import { optimizeCuts, PieceInput, OptimizeResult } from "@/lib/optimizer";
import { OptimizerVisualizer } from "@/components/OptimizerVisualizer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const FT_TO_MM = 304.8;
const IN_TO_MM = 25.4;
const PRESETS = [
  { label: "15 ft × 12 ft", l: 15, w: 12 },
  { label: "12 ft × 8 ft", l: 12, w: 8 },
  { label: "10 ft × 8 ft", l: 10, w: 8 },
  { label: "8 ft × 6 ft", l: 8, w: 6 },
];
const THICKNESS = ["3mm", "4mm", "5mm", "6mm", "8mm", "10mm", "12mm"];
const GLASS_TYPES = ["Clear Glass", "Tinted", "Reflective", "Frosted", "Toughened", "Mirror"];

interface UIRow {
  id: string; length: string; width: string; unit: "ft" | "in" | "mm"; qty: string; description: string; grainLock: boolean;
}

const toMM = (v: number, u: "ft" | "in" | "mm") => u === "ft" ? v * FT_TO_MM : u === "in" ? v * IN_TO_MM : v;
const MIN_LEFTOVER_FT = 1; // ignore scraps smaller than 1ft x 1ft

const GlassOptimizer = () => {
  const [sheetL, setSheetL] = useState(15);
  const [sheetW, setSheetW] = useState(12);
  const [customSheet, setCustomSheet] = useState(false);
  const [kerf, setKerf] = useState(3);
  const [thickness, setThickness] = useState("5mm");
  const [glassType, setGlassType] = useState("Clear Glass");
  const [allowRotation, setAllowRotation] = useState(true);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [pieces, setPieces] = useState<UIRow[]>([
    { id: crypto.randomUUID(), length: "4", width: "3", unit: "ft", qty: "6", description: "Window", grainLock: false },
  ]);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const vizRef = useRef<HTMLDivElement>(null);

  const addPiece = () => setPieces([...pieces, { id: crypto.randomUUID(), length: "", width: "", unit: "ft", qty: "1", description: "", grainLock: false }]);
  const updatePiece = (id: string, k: keyof UIRow, v: string | boolean) => setPieces(pieces.map((p) => p.id === id ? { ...p, [k]: v as never } : p));
  const removePiece = (id: string) => setPieces(pieces.filter((p) => p.id !== id));

  const runOptimize = () => {
    const inputs: PieceInput[] = [];
    for (const p of pieces) {
      const l = parseFloat(p.length), w = parseFloat(p.width), q = parseInt(p.qty || "1", 10);
      if (!l || !w || !q) continue;
      inputs.push({
        id: p.id, width: toMM(l, p.unit), height: toMM(w, p.unit),
        quantity: q, label: p.description || `P${inputs.length + 1}`,
        grainLock: p.grainLock,
      });
    }
    if (!inputs.length) { toast.error("Add at least one valid piece"); return; }
    const r = optimizeCuts(sheetL * FT_TO_MM, sheetW * FT_TO_MM, kerf, allowRotation, inputs);
    setResult(r);
    toast.success(`Optimized: ${r.sheets.length} sheet(s), score ${r.score}/100`);
  };

  const runAI = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("optimizer-ai", { body: { text: aiText } });
      if (error) throw error;
      const parsed = (data?.pieces ?? []) as Array<{ length: number; width: number; unit: "ft"|"in"|"mm"; qty: number; label: string }>;
      if (!parsed.length) { toast.error("AI couldn't parse any pieces"); return; }
      const rows: UIRow[] = parsed.map(p => ({
        id: crypto.randomUUID(),
        length: String(p.length ?? ""),
        width: String(p.width ?? ""),
        unit: (p.unit ?? "ft") as UIRow["unit"],
        qty: String(p.qty ?? 1),
        description: p.label ?? "",
        grainLock: false,
      }));
      setPieces(rows);
      setAiText("");
      toast.success(`Parsed ${rows.length} piece row(s)`);
    } catch (e: any) {
      toast.error(e?.message || "AI parsing failed");
    } finally { setAiLoading(false); }
  };

  const voiceInput = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice not supported in this browser"); return; }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.onresult = (e: any) => setAiText((prev) => (prev ? prev + " " : "") + e.results[0][0].transcript);
    rec.onerror = () => toast.error("Voice error");
    rec.start();
    toast("Listening…");
  };

  const svgToPng = async (svg: SVGSVGElement, scale = 2): Promise<string> => {
    const xml = new XMLSerializer().serializeToString(svg);
    const url = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
    const img = new Image();
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = url; });
    const vb = svg.viewBox.baseVal;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(800, vb.width * scale / 4);
    canvas.height = Math.max(600, vb.height * scale / 4);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  };

  const buildPDF = async (): Promise<jsPDF | null> => {
    if (!result) return null;
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    pdf.setFontSize(16);
    pdf.text("Glass Cutting Plan", 14, 18);
    pdf.setFontSize(10);
    pdf.text(`${glassType} ${thickness}  •  Sheet ${sheetL}×${sheetW} ft  •  Kerf ${kerf}mm`, 14, 25);
    pdf.text(`Sheets: ${result.sheets.length}  •  Waste: ${result.wastePercentage.toFixed(1)}%  •  Score: ${result.score}/100`, 14, 31);

    const body = pieces.filter(p => p.length && p.width).map((p, i) => [
      i + 1, p.description || "-", `${p.length} × ${p.width} ${p.unit}`, p.qty, p.grainLock ? "Yes" : "No",
    ]);
    autoTable(pdf, { startY: 38, head: [["#", "Label", "Size", "Qty", "Grain Lock"]], body, theme: "grid", headStyles: { fillColor: [15, 118, 110] } });

    const svgs = Array.from(vizRef.current?.querySelectorAll<SVGSVGElement>("svg[data-sheet-svg]") ?? []);
    for (let i = 0; i < svgs.length; i++) {
      const png = await svgToPng(svgs[i]);
      pdf.addPage();
      pdf.setFontSize(13);
      pdf.text(`Sheet ${i + 1} layout`, 14, 16);
      const vb = svgs[i].viewBox.baseVal;
      const maxW = 180, maxH = 240;
      const ratio = vb.width / vb.height;
      let w = maxW, h = w / ratio;
      if (h > maxH) { h = maxH; w = h * ratio; }
      pdf.addImage(png, "PNG", 14, 22, w, h);
    }
    return pdf;
  };

  const exportPDF = async () => {
    const pdf = await buildPDF();
    if (!pdf) return;
    pdf.save(`cutting-plan-${Date.now()}.pdf`);
    toast.success("PDF exported");
  };

  const exportPNG = async () => {
    const svgs = vizRef.current?.querySelectorAll<SVGSVGElement>("svg[data-sheet-svg]");
    if (!svgs || !svgs.length) return;
    for (let i = 0; i < svgs.length; i++) {
      const dataUrl = await svgToPng(svgs[i]);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `sheet-${i + 1}.png`;
      a.click();
    }
    toast.success("PNG export complete");
  };

  const shareWhatsApp = async (audience: "customer" | "team") => {
    if (!result) { toast.error("Run optimization first"); return; }
    const phone = window.prompt(
      `Enter ${audience === "customer" ? "customer" : "production team"} WhatsApp number (with country code, e.g. 919824660185):`
    );
    if (!phone) return;
    const clean = phone.replace(/\D/g, "");
    if (clean.length < 10) { toast.error("Invalid phone number"); return; }

    const t = toast.loading("Generating PDF & uploading…");
    try {
      const pdf = await buildPDF();
      if (!pdf) { toast.dismiss(t); return; }
      const blob = pdf.output("blob");
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? "anon";
      const path = `${uid}/cutting-plan-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage.from("project-files").upload(path, blob, {
        contentType: "application/pdf", upsert: false,
      });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage.from("project-files")
        .createSignedUrl(path, 60 * 60 * 24 * 14); // 14 days
      if (sErr || !signed) throw sErr ?? new Error("Could not create link");

      const header = audience === "customer"
        ? `Hello! Here is your cutting plan from ${glassType} ${thickness}.`
        : `Production cut list — ${glassType} ${thickness}, ${sheetL}×${sheetW} ft sheet.`;
      const summary = `Sheets: ${result.sheets.length} | Pieces: ${result.sheets.reduce((a, s) => a + s.pieces.length, 0)} | Waste: ${result.wastePercentage.toFixed(1)}% | Score: ${result.score}/100`;
      const msg = `${header}%0A%0A${encodeURIComponent(summary)}%0A%0APDF: ${encodeURIComponent(signed.signedUrl)}`;
      window.open(`https://wa.me/${clean}?text=${msg}`, "_blank");
      toast.dismiss(t);
      toast.success("WhatsApp opened");
    } catch (e: any) {
      toast.dismiss(t);
      toast.error(e?.message ?? "Failed to share");
    }
  };



  const saveLeftovers = async () => {
    if (!result) return;
    const thicknessMM = parseFloat(thickness);
    const rows: any[] = [];
    for (const s of result.sheets) {
      for (const fr of s.freeRects) {
        const lFt = fr.width / FT_TO_MM, wFt = fr.height / FT_TO_MM;
        if (lFt < MIN_LEFTOVER_FT || wFt < MIN_LEFTOVER_FT) continue;
        rows.push({
          glass_type: glassType,
          thickness_mm: thicknessMM,
          length_ft: +lFt.toFixed(3),
          width_ft: +wFt.toFixed(3),
          used: false,
        });
      }
    }
    if (!rows.length) { toast("No leftover sheets above minimum size"); return; }
    const { error } = await supabase.from("leftover_sheets").insert(rows);
    if (error) return toast.error(error.message);
    toast.success(`Saved ${rows.length} leftover sheet(s) to inventory`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-sm font-medium mb-3">
            <Zap className="w-4 h-4" /> Pro Engine
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Triangle className="h-8 w-8 text-teal-600 dark:text-teal-400" /> Glass Optimizer Pro
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Multi-sheet bin packing • grain-lock • kerf mapping • AI input.</p>
        </div>
      </div>

      {/* AI Smart Input */}
      <div className="bg-gradient-to-br from-teal-500/10 via-card/50 to-emerald-500/10 backdrop-blur-xl border border-teal-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-teal-500" />
          <h2 className="font-bold">AI Smart Input</h2>
          <span className="text-xs text-muted-foreground">— type or speak your cut list (Hindi/Gujarati/English supported)</span>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <textarea value={aiText} onChange={(e) => setAiText(e.target.value)} rows={2}
            placeholder='e.g. "5x3 ft 4nos window, 2x4 ft 2nos door, 1200x600mm 3nos shelf"'
            className="glass-input flex-1 resize-none" />
          <div className="flex md:flex-col gap-2">
            <button onClick={voiceInput} className="px-4 py-2 rounded-xl border border-border bg-background/60 hover:bg-muted transition flex items-center gap-2 text-sm"><Mic className="w-4 h-4" /> Voice</button>
            <button onClick={runAI} disabled={aiLoading || !aiText.trim()} className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-bold text-sm disabled:opacity-50 flex items-center gap-2"><Sparkles className="w-4 h-4" /> {aiLoading ? "Parsing…" : "Parse"}</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2"><Layers className="w-5 h-5 text-teal-500" /> Stock Sheet</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((p) => (
                  <button key={p.label} onClick={() => { setSheetL(p.l); setSheetW(p.w); setCustomSheet(false); }}
                    className={`px-3 py-2 rounded-lg text-sm border transition-all ${!customSheet && sheetL === p.l && sheetW === p.w ? "bg-teal-500/10 border-teal-500/50 text-teal-700 dark:text-teal-300 font-semibold" : "border-border/50 bg-background/50 hover:bg-muted"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setCustomSheet(true)} className="text-xs text-teal-600 font-semibold">+ Custom size</button>
              {customSheet && (
                <div className="grid grid-cols-2 gap-3">
                  <GlassField label="Length (ft)"><input type="number" value={sheetL} onChange={(e) => setSheetL(+e.target.value)} className="glass-input" /></GlassField>
                  <GlassField label="Width (ft)"><input type="number" value={sheetW} onChange={(e) => setSheetW(+e.target.value)} className="glass-input" /></GlassField>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <GlassField label="Glass Type">
                  <select value={glassType} onChange={(e) => setGlassType(e.target.value)} className="glass-input">{GLASS_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
                </GlassField>
                <GlassField label="Thickness">
                  <select value={thickness} onChange={(e) => setThickness(e.target.value)} className="glass-input">{THICKNESS.map((t) => <option key={t}>{t}</option>)}</select>
                </GlassField>
              </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2"><Settings className="w-5 h-5 text-teal-500" /> Engine</h2>
            <div className="space-y-4">
              <GlassField label="Blade Kerf (mm)">
                <input type="number" value={kerf} onChange={(e) => setKerf(+e.target.value)} className="glass-input" />
              </GlassField>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50 cursor-pointer">
                <input type="checkbox" checked={allowRotation} onChange={(e) => setAllowRotation(e.target.checked)} className="w-5 h-5 accent-teal-500" />
                <div>
                  <div className="font-semibold text-sm">Allow 90° Rotation (global)</div>
                  <div className="text-xs text-muted-foreground">Lock individual rows below to preserve grain</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Cut Pieces</h2>
              <button onClick={runOptimize} className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 transition flex items-center gap-2">
                <Calculator className="h-4 w-4" /> Optimize
              </button>
            </div>

            <div className="space-y-3">
              {pieces.map((p, i) => (
                <div key={p.id} className="grid grid-cols-12 gap-2 items-center bg-background/50 p-2 rounded-xl border border-border/50">
                  <div className="col-span-1 text-sm text-muted-foreground font-mono pl-2 hidden md:block">{i + 1}</div>
                  <input value={p.length} onChange={(e) => updatePiece(p.id, "length", e.target.value)} className="glass-input h-9 text-sm col-span-6 md:col-span-2" placeholder="L" />
                  <input value={p.width} onChange={(e) => updatePiece(p.id, "width", e.target.value)} className="glass-input h-9 text-sm col-span-6 md:col-span-2" placeholder="W" />
                  <select value={p.unit} onChange={(e) => updatePiece(p.id, "unit", e.target.value)} className="glass-input h-9 text-sm col-span-4 md:col-span-1">
                    {["ft", "in", "mm"].map((u) => <option key={u}>{u}</option>)}
                  </select>
                  <input value={p.qty} onChange={(e) => updatePiece(p.id, "qty", e.target.value)} className="glass-input h-9 text-sm col-span-4 md:col-span-1" type="number" placeholder="Qty" />
                  <input value={p.description} onChange={(e) => updatePiece(p.id, "description", e.target.value)} className="glass-input h-9 text-sm col-span-4 md:col-span-3" placeholder="Label" />
                  <button onClick={() => updatePiece(p.id, "grainLock", !p.grainLock)}
                    title={p.grainLock ? "Grain locked (no rotation)" : "Free rotation"}
                    className={`col-span-6 md:col-span-1 h-9 rounded-lg border flex items-center justify-center transition ${p.grainLock ? "bg-amber-500/10 border-amber-500/50 text-amber-700" : "border-border/50 text-muted-foreground hover:bg-muted"}`}>
                    {p.grainLock ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </button>
                  <button onClick={() => removePiece(p.id)} className="col-span-6 md:col-span-1 h-9 text-destructive/60 hover:text-destructive rounded-lg hover:bg-destructive/10 flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>

            <button onClick={addPiece} className="mt-4 border border-dashed border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-500/5 hover:bg-teal-500/10 w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition">
              <Plus className="h-4 w-4" /> Add Row
            </button>
          </div>

          {result && (
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-2xl font-bold">Results</h2>
                <div className="flex flex-wrap gap-2">
                  <button onClick={saveLeftovers} className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-semibold flex items-center gap-2"><Save className="h-4 w-4" /> Save Leftovers</button>
                  <button onClick={() => shareWhatsApp("customer")} className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp Customer</button>
                  <button onClick={() => shareWhatsApp("team")} className="px-3 py-2 rounded-lg bg-green-600/90 hover:bg-green-700 text-white text-sm font-bold flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp Team</button>
                  <button onClick={exportPNG} className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-semibold flex items-center gap-2"><ImageIcon className="h-4 w-4" /> PNG</button>
                  <button onClick={exportPDF} className="px-3 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-500 text-white text-sm font-bold flex items-center gap-2"><FileDown className="h-4 w-4" /> PDF</button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                <ResultCard label="Sheets" value={result.sheets.length.toString()} />
                <ResultCard label="Theoretical Min" value={result.theoreticalMinSheets.toString()} />
                <ResultCard label="Yield" value={`${((result.usedArea / result.totalArea) * 100).toFixed(1)}%`} highlight />
                <ResultCard label="Waste" value={`${result.wastePercentage.toFixed(1)}%`} destructive={result.wastePercentage > 15} />
                <ResultCard label="Score" value={`${result.score}/100`} highlight={result.score >= 80} destructive={result.score < 50} />
              </div>

              <OptimizerVisualizer ref={vizRef} result={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GlassField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider mb-1.5 block">{label}</label>
    {children}
  </div>
);

const ResultCard = ({ label, value, highlight, destructive }: { label: string; value: string; highlight?: boolean; destructive?: boolean }) => {
  let cls = "bg-background border-border/50 text-foreground";
  if (highlight) cls = "bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300";
  if (destructive) cls = "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400";
  return (
    <div className={`p-4 rounded-xl border ${cls} shadow-sm`}>
      <p className="text-[10px] uppercase font-semibold opacity-70 mb-1 tracking-wider">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
};

export default GlassOptimizer;
