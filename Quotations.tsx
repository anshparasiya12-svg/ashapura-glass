import React, { useState, useMemo } from "react";
import { Triangle, Plus, Trash2, Calculator, Settings, Layers, Zap } from "lucide-react";
import { optimizeCuts, PieceInput, OptimizeResult } from "@/lib/optimizer";
import { OptimizerVisualizer } from "@/components/OptimizerVisualizer";
import { downloadPDF, triggerPrint } from "@/lib/pdf";
import { shareOnWhatsApp } from "@/lib/whatsapp";
import { toast } from "sonner";
import { Download, Printer, Share2 } from "lucide-react";

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
  id: string;
  length: string;
  width: string;
  unit: "ft" | "in" | "mm";
  qty: string;
  description: string;
}

const toMM = (v: number, u: "ft" | "in" | "mm") => u === "ft" ? v * FT_TO_MM : u === "in" ? v * IN_TO_MM : v;

const GlassOptimizer = () => {
  const [sheetL, setSheetL] = useState(15);
  const [sheetW, setSheetW] = useState(12);
  const [customSheet, setCustomSheet] = useState(false);
  const [kerf, setKerf] = useState(3);
  const [thickness, setThickness] = useState("5mm");
  const [glassType, setGlassType] = useState("Clear Glass");
  const [allowRotation, setAllowRotation] = useState(true);
  
  const [pieces, setPieces] = useState<UIRow[]>([
    { id: crypto.randomUUID(), length: "4", width: "3", unit: "ft", qty: "6", description: "Window Pane A" },
  ]);

  const [result, setResult] = useState<OptimizeResult | null>(null);

  const addPiece = () => setPieces([...pieces, { id: crypto.randomUUID(), length: "", width: "", unit: "ft", qty: "1", description: "" }]);
  const updatePiece = (id: string, k: keyof UIRow, v: string) => setPieces(pieces.map((p) => p.id === id ? { ...p, [k]: v } : p));
  const removePiece = (id: string) => setPieces(pieces.filter((p) => p.id !== id));

  const runOptimize = () => {
    const inputs: PieceInput[] = [];
    for (const p of pieces) {
      const l = parseFloat(p.length);
      const w = parseFloat(p.width);
      const q = parseInt(p.qty || "1", 10);
      if (!l || !w || !q) continue;
      
      inputs.push({
        id: p.id,
        width: toMM(l, p.unit),
        height: toMM(w, p.unit),
        quantity: q,
        label: p.description || `Piece ${inputs.length + 1}`
      });
    }

    if (inputs.length === 0) {
      toast.error("Add at least one valid piece");
      return;
    }

    const sheetWmm = (customSheet ? sheetL : sheetL) * FT_TO_MM;
    const sheetHmm = (customSheet ? sheetW : sheetW) * FT_TO_MM;

    const r = optimizeCuts(sheetWmm, sheetHmm, kerf, allowRotation, inputs);
    setResult(r);
    toast.success(`Optimization complete! Used ${r.sheets.length} sheet(s)`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-sm font-medium mb-3">
            <Zap className="w-4 h-4" /> Pro Feature
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Triangle className="h-8 w-8 text-teal-600 dark:text-teal-400" /> 
            Glass Optimizer Pro
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Advanced 2D bin packing with 90° rotation and kerf mapping.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Stock Settings (Glassmorphism Card) */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2"><Layers className="w-5 h-5 text-teal-500" /> Stock Sheet</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((p) => (
                  <button key={p.label} onClick={() => { setSheetL(p.l); setSheetW(p.w); setCustomSheet(false); }}
                    className={`px-3 py-2 rounded-lg text-sm border transition-all ${!customSheet && sheetL === p.l && sheetW === p.w ? "bg-teal-500/10 border-teal-500/50 text-teal-700 dark:text-teal-300 font-semibold shadow-inner" : "border-border/50 bg-background/50 hover:bg-muted"}`}>
                    {p.label}
                  </button>
                ))}
              </div>

              {customSheet && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <GlassField label="Length (ft)"><input type="number" value={sheetL} onChange={(e) => setSheetL(+e.target.value)} className="glass-input" /></GlassField>
                  <GlassField label="Width (ft)"><input type="number" value={sheetW} onChange={(e) => setSheetW(+e.target.value)} className="glass-input" /></GlassField>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <GlassField label="Glass Type">
                  <select value={glassType} onChange={(e) => setGlassType(e.target.value)} className="glass-input">{GLASS_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
                </GlassField>
                <GlassField label="Thickness">
                  <select value={thickness} onChange={(e) => setThickness(e.target.value)} className="glass-input">{THICKNESS.map((t) => <option key={t}>{t}</option>)}</select>
                </GlassField>
              </div>
            </div>
          </div>

          {/* Engine Settings */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2"><Settings className="w-5 h-5 text-teal-500" /> Engine Settings</h2>
            <div className="space-y-5">
              <GlassField label="Blade Kerf / Cutting Loss (mm)">
                <input type="number" value={kerf} onChange={(e) => setKerf(+e.target.value)} className="glass-input" />
              </GlassField>
              
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50 cursor-pointer hover:bg-muted/50 transition">
                <input type="checkbox" checked={allowRotation} onChange={(e) => setAllowRotation(e.target.checked)} className="w-5 h-5 accent-teal-500 rounded" /> 
                <div>
                  <div className="font-semibold text-sm">Allow 90° Rotation</div>
                  <div className="text-xs text-muted-foreground">Significantly reduces waste by rotating pieces</div>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Pieces & Output */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Cut Pieces</h2>
              <button onClick={runOptimize} className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition flex items-center gap-2">
                <Calculator className="h-4 w-4" /> Optimize Engine
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 px-2 hidden md:grid">
                <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase">#</div>
                <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase">Length</div>
                <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase">Width</div>
                <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase">Unit</div>
                <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase">Qty</div>
                <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase">Label</div>
                <div className="col-span-1"></div>
              </div>

              {pieces.map((p, i) => (
                <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-background/50 p-3 md:p-2 rounded-xl border border-border/50 group">
                  <div className="col-span-1 text-sm text-muted-foreground font-mono pl-2 hidden md:block">{i + 1}</div>
                  
                  <div className="md:col-span-2 flex gap-2 md:block"><span className="md:hidden text-xs w-16">Length:</span><input value={p.length} onChange={(e) => updatePiece(p.id, "length", e.target.value)} className="glass-input h-9 text-sm w-full" placeholder="L" /></div>
                  <div className="md:col-span-2 flex gap-2 md:block"><span className="md:hidden text-xs w-16">Width:</span><input value={p.width} onChange={(e) => updatePiece(p.id, "width", e.target.value)} className="glass-input h-9 text-sm w-full" placeholder="W" /></div>
                  <div className="md:col-span-2 flex gap-2 md:block">
                    <span className="md:hidden text-xs w-16">Unit:</span>
                    <select value={p.unit} onChange={(e) => updatePiece(p.id, "unit", e.target.value)} className="glass-input h-9 text-sm w-full">{["ft", "in", "mm"].map((u) => <option key={u}>{u}</option>)}</select>
                  </div>
                  <div className="md:col-span-2 flex gap-2 md:block"><span className="md:hidden text-xs w-16">Qty:</span><input value={p.qty} onChange={(e) => updatePiece(p.id, "qty", e.target.value)} className="glass-input h-9 text-sm w-full" type="number" /></div>
                  <div className="md:col-span-2 flex gap-2 md:block"><span className="md:hidden text-xs w-16">Label:</span><input value={p.description} onChange={(e) => updatePiece(p.id, "description", e.target.value)} className="glass-input h-9 text-sm w-full" placeholder="Label" /></div>
                  
                  <div className="col-span-1 text-right md:text-center mt-2 md:mt-0">
                    <button onClick={() => removePiece(p.id)} className="text-destructive/50 hover:text-destructive p-2 rounded-lg hover:bg-destructive/10 transition"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addPiece} className="mt-4 border border-dashed border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-500/5 hover:bg-teal-500/10 w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition">
              <Plus className="h-4 w-4" /> Add Row
            </button>
          </div>

          {result && (
            <div id="optimization-results" className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold">Optimization Results</h2>
                
                <div className="flex items-center gap-2 no-print">
                  <button onClick={() => triggerPrint()} className="p-2 border border-border rounded-lg hover:bg-muted transition text-foreground">
                    <Printer className="w-5 h-5" />
                  </button>
                  <button onClick={async () => {
                    toast.loading("Generating PDF...");
                    const success = await downloadPDF("optimization-results", "Glass_Optimization_Report.pdf");
                    toast.dismiss();
                    if (success) toast.success("PDF Downloaded successfully!");
                    else toast.error("Failed to generate PDF.");
                  }} className="p-2 border border-border rounded-lg hover:bg-muted transition text-foreground">
                    <Download className="w-5 h-5" />
                  </button>
                  <button onClick={() => {
                    const msg = `*Glass Optimization Report*\nTotal Sheets Used: ${result.sheets.length}\nYield: ${((result.usedArea / result.totalArea) * 100).toFixed(1)}%\nWaste: ${result.wastePercentage.toFixed(1)}%`;
                    shareOnWhatsApp("", msg);
                  }} className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#20bd5a] transition shadow-md shadow-[#25D366]/20">
                    <Share2 className="w-4 h-4" /> WhatsApp
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <ResultCard label="Total Sheets" value={result.sheets.length.toString()} />
                <ResultCard label="Yield (Used)" value={`${((result.usedArea / result.totalArea) * 100).toFixed(1)}%`} highlight />
                <ResultCard label="Waste %" value={`${result.wastePercentage.toFixed(1)}%`} destructive={result.wastePercentage > 15} />
                <ResultCard label="Unplaced Pieces" value={result.unplacedPieces.length.toString()} destructive={result.unplacedPieces.length > 0} />
              </div>

              <OptimizerVisualizer result={result} />
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
  let colorClass = "bg-background border-border/50 text-foreground";
  if (highlight) colorClass = "bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300";
  if (destructive) colorClass = "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400";

  return (
    <div className={`p-4 rounded-xl border ${colorClass} shadow-sm`}>
      <p className="text-xs uppercase font-semibold opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
};

export default GlassOptimizer;
