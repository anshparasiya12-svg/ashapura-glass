export interface PieceInput {
  id: string;
  width: number;
  height: number;
  quantity: number;
  label: string;
  /** If true, this piece keeps its grain direction (no 90° rotation). */
  grainLock?: boolean;
}

export interface PlacedPiece {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
  label: string;
  rotated: boolean;
}

export interface FreeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Sheet {
  id: string;
  width: number;
  height: number;
  pieces: PlacedPiece[];
  freeRects: FreeRect[];
  utilization: number;
}

export interface OptimizeResult {
  sheets: Sheet[];
  unplacedPieces: PieceInput[];
  totalArea: number;
  usedArea: number;
  wasteArea: number;
  wastePercentage: number;
  /** Theoretical minimum sheets if waste were zero. */
  theoreticalMinSheets: number;
  /** 0–100 quality score combining yield vs theoretical minimum. */
  score: number;
}

interface Rect { x: number; y: number; w: number; h: number; }

class GuillotineBin {
  freeRects: Rect[];
  placedRects: PlacedPiece[];
  constructor(public width: number, public height: number, public kerf = 0) {
    this.freeRects = [{ x: 0, y: 0, w: width, h: height }];
    this.placedRects = [];
  }

  insert(id: string, w: number, h: number, label: string, allowRotation: boolean): boolean {
    let best = -1, bestScore = Infinity, rotated = false, pw = w, ph = h;
    const k = this.kerf;
    for (let i = 0; i < this.freeRects.length; i++) {
      const fr = this.freeRects[i];
      if (w + k <= fr.w && h + k <= fr.h) {
        const s = Math.min(fr.w - (w + k), fr.h - (h + k));
        if (s < bestScore) { best = i; bestScore = s; rotated = false; pw = w; ph = h; }
      }
      if (allowRotation && h + k <= fr.w && w + k <= fr.h) {
        const s = Math.min(fr.w - (h + k), fr.h - (w + k));
        if (s < bestScore) { best = i; bestScore = s; rotated = true; pw = h; ph = w; }
      }
    }
    if (best === -1) return false;
    const fr = this.freeRects[best];
    this.placedRects.push({ id, x: fr.x, y: fr.y, width: pw, height: ph, label, rotated });
    this.split(fr, pw + k, ph + k);
    this.freeRects.splice(best, 1);
    return true;
  }

  private split(fr: Rect, w: number, h: number) {
    const wRem = fr.w - w, hRem = fr.h - h;
    let bottom: Rect, right: Rect;
    if (wRem * fr.h > hRem * fr.w) {
      bottom = { x: fr.x, y: fr.y + h, w, h: hRem };
      right = { x: fr.x + w, y: fr.y, w: wRem, h: fr.h };
    } else {
      bottom = { x: fr.x, y: fr.y + h, w: fr.w, h: hRem };
      right = { x: fr.x + w, y: fr.y, w: wRem, h };
    }
    if (bottom.w > 0 && bottom.h > 0) this.freeRects.push(bottom);
    if (right.w > 0 && right.h > 0) this.freeRects.push(right);
  }
}

export function optimizeCuts(
  stockWidth: number,
  stockHeight: number,
  kerf: number,
  allowRotation: boolean,
  pieces: PieceInput[]
): OptimizeResult {
  type Flat = { id: string; w: number; h: number; lbl: string; rot: boolean };
  const flat: Flat[] = [];
  pieces.forEach(p => {
    const rot = allowRotation && !p.grainLock;
    for (let i = 0; i < p.quantity; i++) {
      flat.push({ id: p.id + "-" + i, w: p.width, h: p.height, lbl: p.label, rot });
    }
  });
  flat.sort((a, b) => (b.w * b.h) - (a.w * a.h));

  const sheets: Sheet[] = [];
  let remaining = [...flat];

  while (remaining.length) {
    const bin = new GuillotineBin(stockWidth, stockHeight, kerf);
    const next: Flat[] = [];
    for (const p of remaining) {
      if (!bin.insert(p.id, p.w, p.h, p.lbl, p.rot)) next.push(p);
    }
    if (remaining.length === next.length) break;
    const used = bin.placedRects.reduce((a, p) => a + p.width * p.height, 0);
    sheets.push({
      id: "Sheet-" + (sheets.length + 1),
      width: stockWidth, height: stockHeight,
      pieces: bin.placedRects,
      freeRects: bin.freeRects.map(r => ({ x: r.x, y: r.y, width: r.w, height: r.h })),
      utilization: used / (stockWidth * stockHeight),
    });
    remaining = next;
  }

  const unplacedInputs: PieceInput[] = remaining.map(p => ({
    id: p.id, width: p.w, height: p.h, quantity: 1, label: p.lbl,
  }));

  const totalArea = sheets.length * stockWidth * stockHeight;
  const usedArea = sheets.reduce((a, s) => a + s.pieces.reduce((b, p) => b + p.width * p.height, 0), 0);
  const wasteArea = totalArea - usedArea;
  const wastePct = totalArea > 0 ? (wasteArea / totalArea) * 100 : 0;
  const piecesArea = flat.reduce((a, p) => a + p.w * p.h, 0);
  const theoreticalMinSheets = Math.ceil(piecesArea / (stockWidth * stockHeight)) || 1;
  const yieldRatio = totalArea > 0 ? usedArea / totalArea : 0;
  const sheetEff = sheets.length > 0 ? theoreticalMinSheets / sheets.length : 0;
  const score = Math.round(Math.max(0, Math.min(100, yieldRatio * 60 + sheetEff * 40)));

  return {
    sheets, unplacedPieces: unplacedInputs,
    totalArea, usedArea, wasteArea, wastePercentage: wastePct,
    theoreticalMinSheets, score,
  };
}
