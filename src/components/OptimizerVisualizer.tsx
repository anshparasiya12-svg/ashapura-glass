import React, { forwardRef } from "react";
import { OptimizeResult } from "@/lib/optimizer";

interface Props { result: OptimizeResult; }

export const OptimizerVisualizer = forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  if (!result || result.sheets.length === 0) return null;
  return (
    <div ref={ref} className="space-y-8">
      {result.sheets.map((sheet, idx) => (
        <div key={sheet.id} data-sheet-svg-wrapper className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
            <div>
              <h3 className="text-lg font-bold text-foreground">Sheet {idx + 1}</h3>
              <p className="text-sm text-muted-foreground">
                {Math.round(sheet.width)} × {Math.round(sheet.height)} mm • Utilization: {(sheet.utilization * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-xs text-muted-foreground">{sheet.pieces.length} pieces</div>
          </div>

          <div className="relative w-full overflow-x-auto bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4 border border-border flex justify-center">
            <svg
              data-sheet-svg
              viewBox={`0 0 ${sheet.width} ${sheet.height}`}
              className="max-h-[500px] w-auto drop-shadow-md bg-white"
              style={{ display: "block", maxWidth: "100%" }}
            >
              <rect x="0" y="0" width={sheet.width} height={sheet.height} fill="#fee2e2" />
              {sheet.freeRects.map((fr, i) => (
                <rect key={"fr-" + i} x={fr.x} y={fr.y} width={fr.width} height={fr.height}
                  fill="#fef3c7" stroke="#fbbf24" strokeWidth={Math.max(sheet.width, sheet.height) * 0.0015} strokeDasharray="8 6" />
              ))}
              {sheet.pieces.map((piece, i) => {
                const hue = (i * 137.5) % 360;
                const fs = Math.min(piece.width, piece.height) * 0.13;
                return (
                  <g key={piece.id + i}>
                    <rect x={piece.x} y={piece.y} width={piece.width} height={piece.height}
                      fill={`hsl(${hue},70%,82%)`} stroke="#0f766e"
                      strokeWidth={Math.max(sheet.width, sheet.height) * 0.0012} />
                    {piece.width > 20 && piece.height > 20 && (
                      <>
                        <text x={piece.x + piece.width / 2} y={piece.y + piece.height / 2 - fs * 0.3}
                          textAnchor="middle" dominantBaseline="middle" fill="#0f172a" fontSize={fs} fontWeight="bold">
                          {piece.label}
                        </text>
                        <text x={piece.x + piece.width / 2} y={piece.y + piece.height / 2 + fs * 0.8}
                          textAnchor="middle" dominantBaseline="middle" fill="#334155" fontSize={fs * 0.75}>
                          {Math.round(piece.width)}×{Math.round(piece.height)}
                        </text>
                        {piece.rotated && (
                          <text x={piece.x + piece.width - fs} y={piece.y + fs} textAnchor="middle"
                            dominantBaseline="middle" fill="#d97706" fontSize={fs * 0.8} fontWeight="bold">↻</text>
                        )}
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      ))}

      {result.unplacedPieces.length > 0 && (
        <div className="bg-red-50 border border-red-200 dark:bg-red-900/10 dark:border-red-900/50 rounded-xl p-4">
          <h3 className="text-red-700 dark:text-red-400 font-bold mb-2">Unplaced Pieces (Increase sheet count or reduce sizes)</h3>
          <ul className="list-disc pl-5 text-sm text-red-600 dark:text-red-300">
            {result.unplacedPieces.map((p, i) => (
              <li key={i}>{p.label} ({Math.round(p.width)} × {Math.round(p.height)} mm)</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});
OptimizerVisualizer.displayName = "OptimizerVisualizer";
