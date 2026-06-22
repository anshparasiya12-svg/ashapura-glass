import React from 'react';
import { OptimizeResult, Sheet, PlacedPiece } from '@/lib/optimizer';

interface OptimizerVisualizerProps {
  result: OptimizeResult;
}

export const OptimizerVisualizer: React.FC<OptimizerVisualizerProps> = ({ result }) => {
  if (!result || result.sheets.length === 0) return null;

  return (
    <div className="space-y-8">
      {result.sheets.map((sheet, idx) => (
        <div key={sheet.id} className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Sheet {idx + 1}</h3>
              <p className="text-sm text-muted-foreground">
                {sheet.width} × {sheet.height} • Utilization: {(sheet.utilization * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          
          <div className="relative w-full overflow-x-auto bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4 border border-border flex justify-center">
            {/* We scale the SVG to fit within a reasonable max-width while maintaining aspect ratio */}
            <svg
              viewBox={`0 0 ${sheet.width} ${sheet.height}`}
              className="max-h-[500px] w-auto drop-shadow-md bg-white dark:bg-neutral-800"
              style={{ display: 'block', maxWidth: '100%' }}
            >
              {/* Draw Stock Sheet Boundary */}
              <rect
                x="0"
                y="0"
                width={sheet.width}
                height={sheet.height}
                fill="none"
                stroke="currentColor"
                strokeWidth={Math.max(sheet.width, sheet.height) * 0.002}
                className="text-border"
              />

              {/* Draw Waste Background (The entire sheet is technically waste until covered) */}
              <rect
                x="0"
                y="0"
                width={sheet.width}
                height={sheet.height}
                fill="currentColor"
                className="text-red-500/10 dark:text-red-900/20"
              />

              {/* Draw Pieces */}
              {sheet.pieces.map((piece, i) => {
                // Alternating colors for adjacent pieces
                const hue = (i * 137.5) % 360; 
                const fillStyle = `hsl(${hue}, 70%, 80%)`;
                const darkFillStyle = `hsl(${hue}, 60%, 30%)`;

                const fontSize = Math.min(piece.width, piece.height) * 0.15;

                return (
                  <g key={piece.id + i}>
                    <rect
                      x={piece.x}
                      y={piece.y}
                      width={piece.width}
                      height={piece.height}
                      fill={fillStyle}
                      stroke="#fff"
                      strokeWidth={Math.max(sheet.width, sheet.height) * 0.001}
                      className="dark:stroke-neutral-900"
                      style={{ fill: `var(--theme-mode, ${fillStyle})` }} // Simplified, let's just use inline colors
                    />
                    
                    {/* Add inner rect for styling/glass effect */}
                    <rect
                      x={piece.x + 2}
                      y={piece.y + 2}
                      width={Math.max(0, piece.width - 4)}
                      height={Math.max(0, piece.height - 4)}
                      fill="rgba(255,255,255,0.2)"
                    />

                    {/* Dimensions & Label */}
                    {piece.width > 20 && piece.height > 20 && (
                      <>
                        <text
                          x={piece.x + piece.width / 2}
                          y={piece.y + piece.height / 2 - fontSize * 0.2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#000"
                          fontSize={fontSize}
                          fontWeight="bold"
                        >
                          {piece.label || piece.id.split('-')[0]}
                        </text>
                        <text
                          x={piece.x + piece.width / 2}
                          y={piece.y + piece.height / 2 + fontSize * 0.8}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#333"
                          fontSize={fontSize * 0.8}
                        >
                          {piece.width.toFixed(1)}×{piece.height.toFixed(1)}
                        </text>
                        {piece.rotated && (
                          <text
                            x={piece.x + piece.width - fontSize}
                            y={piece.y + fontSize}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#d97706"
                            fontSize={fontSize * 0.7}
                            fontWeight="bold"
                          >
                            ↻
                          </text>
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
          <h3 className="text-red-700 dark:text-red-400 font-bold mb-2">Unplaced Pieces (Insufficient Stock)</h3>
          <ul className="list-disc pl-5 text-sm text-red-600 dark:text-red-300">
            {result.unplacedPieces.map((p, i) => (
              <li key={i}>{p.label || p.id} ({p.width} × {p.height})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

