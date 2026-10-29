import React, { useState } from 'react';
import { NOTEBOOK_MONTHLY_BENCHMARKS } from '../../data/forecasting';
import { Info } from 'lucide-react';

export const MonthlySeasonalityChart: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [hoveredMonth, setHoveredMonth] = useState<typeof NOTEBOOK_MONTHLY_BENCHMARKS[0] | null>(null);

  const maxVal = 320;
  const svgWidth = 680;
  const svgHeight = 260;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 30;
  const padBottom = 40;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const barCount = NOTEBOOK_MONTHLY_BENCHMARKS.length;
  const step = chartW / barCount;
  const barWidth = step * 0.65;

  return (
    <div className={`bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-5 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E5E5]">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase font-bold">
            SEASONAL CYCLE ANALYSIS
          </div>
          <h2 className="text-base font-bold text-[#000000]">
            Monthly Seasonality &amp; Atmospheric Washout
          </h2>
        </div>
        <div className="font-mono text-xs text-[#14213D] bg-[#E5E5E5] px-2.5 py-1 rounded-md font-bold">
          MULTI-YEAR AGGREGATE (2022–2026)
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="relative mt-3">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
          {/* Y Grid Lines */}
          {[100, 200, 300].map(val => {
            const y = padTop + chartH - (val / maxVal) * chartH;
            return (
              <g key={val}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartW}
                  y2={y}
                  stroke="#E5E5E5"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[#14213D]/70 font-mono text-[10px] font-semibold"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Monsoon Washout Band (June - September) */}
          <rect
            x={padLeft + 5 * step}
            y={padTop}
            width={4 * step}
            height={chartH}
            fill="rgba(20, 33, 61, 0.06)"
            rx="4"
          />
          <text
            x={padLeft + 7 * step}
            y={padTop + 14}
            textAnchor="middle"
            className="fill-[#14213D] font-mono text-[9px] font-bold tracking-wider"
          >
            MONSOON WASHOUT (JUN–SEP)
          </text>

          {/* Monthly Bars */}
          {NOTEBOOK_MONTHLY_BENCHMARKS.map((item, i) => {
            const barH = (item.meanAqi / maxVal) * chartH;
            const x = padLeft + i * step + (step - barWidth) / 2;
            const y = padTop + chartH - barH;
            const isHighest = item.month === 'November';
            const isLowest = item.month === 'July';
            const isHovered = hoveredMonth?.month === item.month;

            let fillColor = '#14213D'; // Deep Oxford Navy
            if (isHighest) fillColor = '#FCA311'; // Electric Amber peak
            if (isLowest) fillColor = '#4A5568';  // Slate low
            if (isHovered) fillColor = '#FCA311'; // Highlight

            return (
              <g 
                key={item.month}
                onMouseEnter={() => setHoveredMonth(item)}
                onMouseLeave={() => setHoveredMonth(null)}
                className="cursor-pointer transition-all"
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  fill={fillColor}
                  rx="3"
                  className="transition-colors duration-150"
                />

                {/* Value on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className={`font-mono text-[9px] font-bold ${isHighest ? 'fill-[#FCA311]' : 'fill-[#000000]'}`}
                >
                  {item.meanAqi.toFixed(1)}
                </text>

                {/* Month Label */}
                <text
                  x={x + barWidth / 2}
                  y={padTop + chartH + 18}
                  textAnchor="middle"
                  className={`font-mono text-[10px] font-bold ${isHovered ? 'fill-[#FCA311]' : 'fill-[#14213D]'}`}
                >
                  {item.month.slice(0, 3)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Information Box */}
        {hoveredMonth && (
          <div className="absolute top-2 right-4 bg-[#14213D] text-[#FFFFFF] p-3 rounded-md shadow-xl text-xs font-mono border border-[#E5E5E5]/20 max-w-xs animate-fadeIn">
            <div className="flex justify-between items-center text-[#FCA311] font-bold border-b border-[#E5E5E5]/20 pb-1">
              <span>{hoveredMonth.month.toUpperCase()}</span>
              <span>MEAN AQI: {hoveredMonth.meanAqi.toFixed(2)}</span>
            </div>
            <p className="mt-1 text-[11px] text-[#E5E5E5] leading-tight">
              {hoveredMonth.interpretation}
            </p>
          </div>
        )}
      </div>

      {/* Editorial Commentary Badge from Prompt */}
      <div className="mt-4 p-3.5 bg-[#F4F6F9] rounded-md border border-[#E5E5E5] text-xs text-[#000000] flex items-start gap-2.5">
        <Info size={16} className="text-[#14213D] shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[#14213D]/90">
          <span className="font-bold text-[#14213D]">Seasonal Finding:</span> “November has the highest mean AQI in the available records (<span className="font-bold text-[#000000] bg-[#FCA311]/30 px-1 rounded">294.51</span>); July has the lowest (<span className="font-bold text-[#000000] bg-[#E5E5E5] px-1 rounded">63.63</span>). These are descriptive seasonal patterns, not proof of their underlying causes.”
        </p>
      </div>
    </div>
  );
};
