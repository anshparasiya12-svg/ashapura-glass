export interface PieceInput {
  id: string;
  width: number;
  height: number;
  quantity: number;
  label: string;
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

export interface Sheet {
  id: string;
  width: number;
  height: number;
  pieces: PlacedPiece[];
  utilization: number;
}

export interface OptimizeResult {
  sheets: Sheet[];
  unplacedPieces: PieceInput[];
  totalArea: number;
  usedArea: number;
  wasteArea: number;
  wastePercentage: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

class GuillotineBin {
  public width: number;
  public height: number;
  public freeRects: Rect[];
  public placedRects: PlacedPiece[];
  public kerf: number;

  constructor(width: number, height: number, kerf: number = 0) {
    this.width = width;
    this.height = height;
    this.kerf = kerf;
    this.freeRects = [{ x: 0, y: 0, w: width, h: height }];
    this.placedRects = [];
  }

  public insert(id: string, width: number, height: number, label: string, allowRotation: boolean): boolean {
    let bestNodeIndex = -1;
    let bestFitScore = Number.MAX_VALUE;
    let rotated = false;
    let placeW = width;
    let placeH = height;

    const ew1 = width + this.kerf;
    const eh1 = height + this.kerf;
    
    const ew2 = height + this.kerf;
    const eh2 = width + this.kerf;

    for (let i = 0; i < this.freeRects.length; i++) {
      const fr = this.freeRects[i];

      // Normal orientation
      if (ew1 <= fr.w && eh1 <= fr.h) {
        const score = Math.min(fr.w - ew1, fr.h - eh1);
        if (score < bestFitScore) {
          bestNodeIndex = i;
          bestFitScore = score;
          rotated = false;
          placeW = width;
          placeH = height;
        }
      }

      // Rotated orientation
      if (allowRotation && ew2 <= fr.w && eh2 <= fr.h) {
        const score = Math.min(fr.w - ew2, fr.h - eh2);
        if (score < bestFitScore) {
          bestNodeIndex = i;
          bestFitScore = score;
          rotated = true;
          placeW = height;
          placeH = width;
        }
      }
    }

    if (bestNodeIndex !== -1) {
      const fr = this.freeRects[bestNodeIndex];
      const effW = placeW + this.kerf;
      const effH = placeH + this.kerf;

      this.placedRects.push({
        id,
        x: fr.x,
        y: fr.y,
        width: placeW,
        height: placeH,
        label,
        rotated
      });

      this.splitFreeRect(fr, effW, effH);
      this.freeRects.splice(bestNodeIndex, 1);
      return true;
    }

    return false;
  }

  private splitFreeRect(fr: Rect, w: number, h: number) {
    const wRem = fr.w - w;
    const hRem = fr.h - h;

    let bottomRect: Rect = { x: fr.x, y: fr.y + h, w: fr.w, h: hRem };
    let rightRect: Rect = { x: fr.x + w, y: fr.y, w: wRem, h: h };

    if (wRem * fr.h > hRem * fr.w) {
      bottomRect = { x: fr.x, y: fr.y + h, w: w, h: hRem };
      rightRect = { x: fr.x + w, y: fr.y, w: wRem, h: fr.h };
    }

    if (bottomRect.w > 0 && bottomRect.h > 0) this.freeRects.push(bottomRect);
    if (rightRect.w > 0 && rightRect.h > 0) this.freeRects.push(rightRect);
  }
}

export function optimizeCuts(
  stockWidth: number,
  stockHeight: number,
  kerf: number,
  allowRotation: boolean,
  pieces: PieceInput[]
): OptimizeResult {
  let flatPieces: { id: string; w: number; h: number; lbl: string }[] = [];
  pieces.forEach(p => {
    for (let i = 0; i < p.quantity; i++) {
      flatPieces.push({ id: p.id + "-" + i, w: p.width, h: p.height, lbl: p.label });
    }
  });

  flatPieces.sort((a, b) => (b.w * b.h) - (a.w * a.h));

  const sheets: Sheet[] = [];
  let unplaced = [...flatPieces];

  while (unplaced.length > 0) {
    const bin = new GuillotineBin(stockWidth, stockHeight, kerf);
    const stillUnplaced: typeof flatPieces = [];

    for (const p of unplaced) {
      const placed = bin.insert(p.id, p.w, p.h, p.lbl, allowRotation);
      if (!placed) {
        stillUnplaced.push(p);
      }
    }

    if (unplaced.length === stillUnplaced.length) {
      break;
    }

    const usedArea = bin.placedRects.reduce((acc, p) => acc + (p.width * p.height), 0);
    const utilization = usedArea / (stockWidth * stockHeight);

    sheets.push({
      id: "Sheet-" + (sheets.length + 1),
      width: stockWidth,
      height: stockHeight,
      pieces: bin.placedRects,
      utilization
    });

    unplaced = stillUnplaced;
  }

  const unplacedInputs: PieceInput[] = unplaced.map(p => ({
    id: p.id,
    width: p.w,
    height: p.h,
    quantity: 1,
    label: p.lbl
  }));

  const totalArea = sheets.length * stockWidth * stockHeight;
  const usedArea = sheets.reduce((acc, s) => acc + s.pieces.reduce((a, p) => a + (p.width * p.height), 0), 0);
  const wasteArea = totalArea - usedArea;
  const wastePercentage = totalArea > 0 ? (wasteArea / totalArea) * 100 : 0;

  return {
    sheets,
    unplacedPieces: unplacedInputs,
    totalArea,
    usedArea,
    wasteArea,
    wastePercentage
  };
}
