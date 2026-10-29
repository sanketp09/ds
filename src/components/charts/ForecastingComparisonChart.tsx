import React, { useState } from 'react';
import { ForecastPoint } from '../../data/types';
import { NOTEBOOK_FORECAST_METRICS } from '../../data/forecasting';

interface ForecastingComparisonChartProps {
  series: ForecastPoint[];
  selectedModel: 'Holt-Winters' | 'Naive' | 'Both';
  onSelectModel: (m: 'Holt-Winters' | 'Naive' | 'Both') => void;
  className?: string;
}

export const ForecastingComparisonChart: React.FC<ForecastingComparisonChartProps> = ({
  series,
  selectedModel,
  onSelectModel,
  className = ''
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<ForecastPoint | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const svgWidth = 840;
  const svgHeight = 300;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 45;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const maxVal = 340;
  const count = series.length;

  const splitIndex = series.findIndex(s => s.isTestPeriod);
  const splitX = padLeft + (splitIndex / (count - 1)) * chartW;

  const actualPoints = series.map((pt, i) => {
    const x = padLeft + (i / (count - 1)) * chartW;
    const y = padTop + chartH - (pt.actual / maxVal) * chartH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const naivePoints = series.filter(s => s.isTestPeriod && s.naive !== null).map((pt) => {
    const i = series.findIndex(s => s.date === pt.date);
    const x = padLeft + (i / (count - 1)) * chartW;
    const y = padTop + chartH - ((pt.naive as number) / maxVal) * chartH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const hwPoints = series.filter(s => s.isTestPeriod && s.holtWinters !== null).map((pt) => {
    const i = series.findIndex(s => s.date === pt.date);
    const x = padLeft + (i / (count - 1)) * chartW;
    const y = padTop + chartH - ((pt.holtWinters as number) / maxVal) * chartH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relX = (mouseX / rect.width) * svgWidth;
    if (relX >= padLeft && relX <= padLeft + chartW) {
      const idx = Math.min(count - 1, Math.max(0, Math.round(((relX - padLeft) / chartW) * (count - 1))));
      setHoveredPoint(series[idx]);
      setHoverX(padLeft + (idx / (count - 1)) * chartW);
    }
  };

  return (
    <div className={`bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-5 shadow-xs ${className}`}>
      {/* Header and Model Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase font-bold">
            CHRONOLOGICAL HOLDOUT EVALUATION
          </div>
          <h2 className="text-base font-bold text-[#000000]">
            Actual vs. Projected Monthly AQI
          </h2>
          <p className="text-xs text-[#14213D]/70 mt-0.5">
            Holdout test horizon (80/20 chronological split: 41 train months, 10 test months)
          </p>
        </div>

        {/* Model Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#E5E5E5] p-1 rounded-md font-mono text-[11px]">
          <button
            onClick={() => onSelectModel('Holt-Winters')}
            className={`px-3 py-1 rounded transition-all font-semibold ${
              selectedModel === 'Holt-Winters' ? 'bg-[#14213D] text-[#FFFFFF]' : 'text-[#14213D]'
            }`}
          >
            HOLT-WINTERS
          </button>
          <button
            onClick={() => onSelectModel('Naive')}
            className={`px-3 py-1 rounded transition-all font-semibold ${
              selectedModel === 'Naive' ? 'bg-[#14213D] text-[#FFFFFF]' : 'text-[#14213D]'
            }`}
          >
            NAIVE BASELINE
          </button>
          <button
            onClick={() => onSelectModel('Both')}
            className={`px-3 py-1 rounded transition-all font-semibold ${
              selectedModel === 'Both' ? 'bg-[#14213D] text-[#FFFFFF]' : 'text-[#14213D]'
            }`}
          >
            COMPARE BOTH
          </button>
        </div>
      </div>

      {/* Metric Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
        {NOTEBOOK_FORECAST_METRICS.map(m => {
          const isSelected = selectedModel === 'Both' || (selectedModel === 'Holt-Winters' && m.model.includes('Holt')) || (selectedModel === 'Naive' && m.model.includes('Naive'));
          return (
            <div 
              key={m.model}
              className={`p-4 rounded-lg border transition-all ${
                isSelected 
                  ? 'bg-[#F4F6F9] border-[#14213D] shadow-sm' 
                  : 'bg-[#FFFFFF] border-[#E5E5E5] opacity-60'
              }`}
            >
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-[#000000]">{m.model}</span>
                <span className="text-[10px] text-[#14213D]/60 font-semibold">EVALUATION METRIC</span>
              </div>
              <div className="flex items-baseline gap-4 mt-2 font-mono">
                <div>
                  <span className="text-[10px] text-[#14213D]/70 font-semibold">MAE: </span>
                  <span className="text-base font-black text-[#14213D]">{m.mae.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#14213D]/70 font-semibold">RMSE: </span>
                  <span className="text-base font-black text-[#000000]">{m.rmse.toFixed(3)}</span>
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-[#14213D]/80 leading-tight">
                {m.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* SVG Time Series */}
      <div className="relative mt-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair select-none overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setHoveredPoint(null); setHoverX(null); }}
        >
          {/* Y Grid lines */}
          {[100, 200, 300].map(val => {
            const y = padTop + chartH - (val / maxVal) * chartH;
            return (
              <g key={val}>
                <line x1={padLeft} y1={y} x2={padLeft + chartW} y2={y} stroke="#E5E5E5" strokeWidth="1" />
                <text x={padLeft - 8} y={y + 3} textAnchor="end" className="fill-[#14213D]/70 font-mono text-[9px] font-semibold">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Holdout Split Vertical Line */}
          <line
            x1={splitX}
            y1={padTop}
            x2={splitX}
            y2={padTop + chartH}
            stroke="#FCA311"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <text
            x={splitX - 6}
            y={padTop + 14}
            textAnchor="end"
            className="fill-[#14213D] font-mono text-[9px] font-bold tracking-wider"
          >
            TRAINING HISTORY (80%)
          </text>
          <text
            x={splitX + 6}
            y={padTop + 14}
            textAnchor="start"
            className="fill-[#FCA311] font-mono text-[9px] font-bold tracking-wider"
          >
            TEST HOLDOUT (20%)
          </text>

          {/* Actual Observed Monthly AQI Polyline */}
          <polyline
            points={actualPoints}
            fill="none"
            stroke="#000000"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Naive Baseline Projection */}
          {(selectedModel === 'Naive' || selectedModel === 'Both') && naivePoints && (
            <polyline
              points={naivePoints}
              fill="none"
              stroke="#FCA311"
              strokeWidth="2.2"
              strokeDasharray="5 3"
              strokeLinejoin="round"
            />
          )}

          {/* Holt-Winters Projection */}
          {(selectedModel === 'Holt-Winters' || selectedModel === 'Both') && hwPoints && (
            <polyline
              points={hwPoints}
              fill="none"
              stroke="#14213D"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
          )}

          {/* Individual Points */}
          {series.map((pt, i) => {
            const x = padLeft + (i / (count - 1)) * chartW;
            const y = padTop + chartH - (pt.actual / maxVal) * chartH;
            return (
              <circle
                key={pt.date}
                cx={x}
                cy={y}
                r="3"
                fill={pt.isTestPeriod ? '#FFFFFF' : '#000000'}
                stroke="#000000"
                strokeWidth="1.8"
              />
            );
          })}

          {/* Crosshair on hover */}
          {hoverX !== null && hoveredPoint && (
            <g>
              <line
                x1={hoverX}
                y1={padTop}
                x2={hoverX}
                y2={padTop + chartH}
                stroke="#14213D"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            </g>
          )}

          {/* Time Labels */}
          {series.filter((_, i) => i % 6 === 0 || i === count - 1).map((pt) => {
            const i = series.findIndex(s => s.date === pt.date);
            const x = padLeft + (i / (count - 1)) * chartW;
            return (
              <text key={pt.date} x={x} y={padTop + chartH + 18} textAnchor="middle" className="fill-[#14213D]/70 font-mono text-[9px] font-semibold">
                {pt.monthLabel}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && hoverX !== null && (
          <div 
            className="absolute top-2 pointer-events-none bg-[#14213D] text-[#FFFFFF] p-3 rounded-md font-mono text-xs border border-[#E5E5E5]/20 z-20 shadow-xl"
            style={{ left: Math.min(hoverX + 10, svgWidth - 210) }}
          >
            <div className="text-[#FCA311] font-bold border-b border-[#E5E5E5]/20 pb-1">
              MONTH: {hoveredPoint.monthLabel} ({hoveredPoint.date})
            </div>
            <div className="mt-1 space-y-1">
              <div>ACTUAL AQI: <span className="font-extrabold text-white text-sm">{hoveredPoint.actual}</span></div>
              {hoveredPoint.isTestPeriod && (
                <>
                  {hoveredPoint.holtWinters !== null && (
                    <div className="text-[#FFFFFF]">
                      HOLT-WINTERS: <span className="font-bold text-[#FCA311]">{hoveredPoint.holtWinters}</span>
                    </div>
                  )}
                  {hoveredPoint.naive !== null && (
                    <div className="text-[#E5E5E5]">
                      NAIVE BASELINE: <span className="font-bold">{hoveredPoint.naive}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend and Caveat */}
      <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between text-xs font-mono text-[#14213D]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-1 bg-[#000000] rounded-full" />
            <span className="font-bold">ACTUAL OBSERVATIONS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-1 bg-[#14213D] rounded-full" />
            <span className="font-bold">HOLT-WINTERS (MAE: 21.74)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-1 bg-[#FCA311] rounded-full" />
            <span className="font-bold text-[#FCA311]">NAIVE LAST-VALUE (MAE: 109.65)</span>
          </div>
        </div>

        <div className="text-[10px] text-[#14213D]/70 font-semibold">
          SINGLE HOLDOUT PERIOD · NOT AN OFFICIAL OPERATIONAL FORECAST
        </div>
      </div>
    </div>
  );
};
