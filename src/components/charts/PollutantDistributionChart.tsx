import React, { useState, useMemo } from 'react';
import { AirQualityRecord } from '../../data/types';
import { computeSummaryStats, computeHistogram } from '../../data/analytics';

interface PollutantDistributionChartProps {
  data: AirQualityRecord[];
  className?: string;
}

type PollutantKey = 'pm25' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3' | 'dust' | 'aod';

const POLLUTANT_CONFIG: Record<PollutantKey, { label: string; unit: string; desc: string }> = {
  pm25: { label: 'PM2.5', unit: 'µg/m³', desc: 'Fine inhalable particulates ≤ 2.5 µm diameter' },
  pm10: { label: 'PM10', unit: 'µg/m³', desc: 'Coarse inhalable particulates ≤ 10 µm diameter' },
  no2: { label: 'NO2', unit: 'µg/m³', desc: 'Nitrogen dioxide from combustion & transport' },
  so2: { label: 'SO2', unit: 'µg/m³', desc: 'Sulfur dioxide from industrial processes & refineries' },
  co: { label: 'CO', unit: 'µg/m³', desc: 'Carbon monoxide from incomplete combustion' },
  o3: { label: 'O3', unit: 'µg/m³', desc: 'Ground-level ozone formed by photochemical reactions' },
  dust: { label: 'Dust', unit: 'µg/m³', desc: 'Suspended mineral & road dust mass concentration' },
  aod: { label: 'AOD', unit: 'dimensionless', desc: 'Aerosol Optical Depth (columnar sunlight extinction)' },
};

export const PollutantDistributionChart: React.FC<PollutantDistributionChartProps> = ({
  data,
  className = ''
}) => {
  const [selectedPollutant, setSelectedPollutant] = useState<PollutantKey>('pm25');
  const [viewMode, setViewMode] = useState<'histogram' | 'boxplot'>('histogram');
  const [hoveredBin, setHoveredBin] = useState<{ label: string; count: number } | null>(null);

  const values = useMemo(() => {
    return data.map(d => d[selectedPollutant]).filter(v => typeof v === 'number');
  }, [data, selectedPollutant]);

  const stats = useMemo(() => {
    return computeSummaryStats(values);
  }, [values]);

  const histogram = useMemo(() => {
    return computeHistogram(values, 12);
  }, [values]);

  const config = POLLUTANT_CONFIG[selectedPollutant];

  // SVG dimensions
  const svgWidth = 640;
  const svgHeight = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const maxFreq = Math.max(...histogram.map(h => h.count), 1);

  return (
    <div className={`bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-5 shadow-xs ${className}`}>
      {/* Selector & Config */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase font-bold">
            POLLUTANT COMPOSITION &amp; DISTRIBUTIONS
          </div>
          <h2 className="text-base font-bold text-[#000000] flex items-center gap-2">
            <span>{config.label} Distribution</span>
            <span className="font-mono text-xs font-normal text-[#14213D]/70">({config.unit})</span>
          </h2>
          <p className="text-xs text-[#14213D]/70 mt-0.5">
            {config.desc}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#E5E5E5] p-1 rounded-md font-mono text-[11px] self-start sm:self-auto">
          <button
            onClick={() => setViewMode('histogram')}
            className={`px-2.5 py-1 rounded transition-all font-semibold ${viewMode === 'histogram' ? 'bg-[#14213D] text-[#FFFFFF]' : 'text-[#14213D]'}`}
          >
            HISTOGRAM
          </button>
          <button
            onClick={() => setViewMode('boxplot')}
            className={`px-2.5 py-1 rounded transition-all font-semibold ${viewMode === 'boxplot' ? 'bg-[#14213D] text-[#FFFFFF]' : 'text-[#14213D]'}`}
          >
            BOX PLOT
          </button>
        </div>
      </div>

      {/* Pollutant Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 my-3">
        {(Object.keys(POLLUTANT_CONFIG) as PollutantKey[]).map(key => (
          <button
            key={key}
            onClick={() => setSelectedPollutant(key)}
            className={`px-3 py-1 text-xs font-mono rounded-md transition-all font-semibold ${
              selectedPollutant === key
                ? 'bg-[#14213D] text-[#FFFFFF] shadow-sm'
                : 'bg-[#E5E5E5] text-[#14213D] hover:bg-[#14213D] hover:text-[#FFFFFF]'
            }`}
          >
            {POLLUTANT_CONFIG[key].label}
          </button>
        ))}
      </div>

      {/* Statistical Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 my-3 p-3 bg-[#F4F6F9] rounded-md border border-[#E5E5E5] font-mono text-xs">
        <div>
          <div className="text-[10px] text-[#14213D]/60 font-semibold">MEAN</div>
          <div className="font-bold text-[#000000] text-sm">{stats.mean} <span className="text-[9px] font-normal text-[#14213D]">{config.unit}</span></div>
        </div>
        <div>
          <div className="text-[10px] text-[#14213D]/60 font-semibold">MEDIAN</div>
          <div className="font-bold text-[#000000] text-sm">{stats.median} <span className="text-[9px] font-normal text-[#14213D]">{config.unit}</span></div>
        </div>
        <div>
          <div className="text-[10px] text-[#14213D]/60 font-semibold">STD DEV</div>
          <div className="font-bold text-[#14213D] text-sm">{stats.stdDev}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#14213D]/60 font-semibold">MINIMUM</div>
          <div className="font-bold text-[#14213D] text-sm">{stats.min}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#14213D]/60 font-semibold">MAXIMUM</div>
          <div className="font-bold text-[#FCA311] text-sm">{stats.max}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#14213D]/60 font-semibold">OBSERVATIONS</div>
          <div className="font-bold text-[#000000] text-sm">{stats.count}</div>
        </div>
      </div>

      {/* SVG View */}
      <div className="relative mt-2">
        {viewMode === 'histogram' ? (
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none overflow-visible">
            {/* Frequency Y lines */}
            {[Math.round(maxFreq * 0.5), maxFreq].map(freq => {
              const y = padTop + chartH - (freq / maxFreq) * chartH;
              return (
                <g key={freq}>
                  <line x1={padLeft} y1={y} x2={padLeft + chartW} y2={y} stroke="#E5E5E5" strokeWidth="1" />
                  <text x={padLeft - 8} y={y + 3} textAnchor="end" className="fill-[#14213D]/70 font-mono text-[10px] font-semibold">
                    {freq}
                  </text>
                </g>
              );
            })}

            {/* Histogram Bars */}
            {histogram.map((bin, i) => {
              const step = chartW / histogram.length;
              const barW = step * 0.8;
              const barH = (bin.count / maxFreq) * chartH;
              const x = padLeft + i * step + (step - barW) / 2;
              const y = padTop + chartH - barH;
              const isHovered = hoveredBin?.label === bin.label;

              return (
                <g
                  key={bin.label}
                  onMouseEnter={() => setHoveredBin(bin)}
                  onMouseLeave={() => setHoveredBin(null)}
                  className="cursor-pointer"
                >
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    fill={isHovered ? '#FCA311' : '#14213D'}
                    rx="2"
                    className="transition-colors duration-150"
                  />
                  <text
                    x={x + barW / 2}
                    y={padTop + chartH + 16}
                    textAnchor="middle"
                    className="fill-[#14213D]/70 font-mono text-[8px] font-semibold"
                  >
                    {bin.binStart}
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          /* Box Plot View */
          <svg viewBox={`0 0 ${svgWidth} 140`} className="w-full h-auto select-none">
            {(() => {
              const range = stats.max - stats.min || 1;
              const q1Val = stats.min + (stats.median - stats.min) * 0.5;
              const q3Val = stats.median + (stats.max - stats.median) * 0.5;
              const scale = (v: number) => padLeft + ((v - stats.min) / range) * chartW;

              const xMin = scale(stats.min);
              const xQ1 = scale(q1Val);
              const xMed = scale(stats.median);
              const xQ3 = scale(q3Val);
              const xMax = scale(stats.max);
              const boxY = 40;
              const boxHeight = 45;

              return (
                <g>
                  {/* Whiskers */}
                  <line x1={xMin} y1={boxY + boxHeight / 2} x2={xQ1} y2={boxY + boxHeight / 2} stroke="#14213D" strokeWidth="1.5" />
                  <line x1={xQ3} y1={boxY + boxHeight / 2} x2={xMax} y2={boxY + boxHeight / 2} stroke="#14213D" strokeWidth="1.5" />
                  <line x1={xMin} y1={boxY + 12} x2={xMin} y2={boxY + boxHeight - 12} stroke="#14213D" strokeWidth="2" />
                  <line x1={xMax} y1={boxY + 12} x2={xMax} y2={boxY + boxHeight - 12} stroke="#14213D" strokeWidth="2" />

                  {/* Interquartile Box */}
                  <rect x={xQ1} y={boxY} width={xQ3 - xQ1} height={boxHeight} fill="rgba(20, 33, 61, 0.15)" stroke="#14213D" strokeWidth="2" rx="2" />
                  
                  {/* Median Line */}
                  <line x1={xMed} y1={boxY} x2={xMed} y2={boxY + boxHeight} stroke="#FCA311" strokeWidth="3" />

                  {/* Labels */}
                  <text x={xMin} y={boxY + boxHeight + 20} textAnchor="middle" className="fill-[#14213D] font-mono text-[10px] font-semibold">Min: {stats.min}</text>
                  <text x={xMed} y={boxY - 8} textAnchor="middle" className="fill-[#14213D] font-mono text-[10px] font-bold">Median: {stats.median}</text>
                  <text x={xMax} y={boxY + boxHeight + 20} textAnchor="middle" className="fill-[#14213D] font-mono text-[10px] font-semibold">Max: {stats.max}</text>
                </g>
              );
            })()}
          </svg>
        )}

        {/* Hover Bin Tooltip */}
        {hoveredBin && (
          <div className="absolute top-1 right-2 bg-[#14213D] text-[#FFFFFF] px-3 py-1.5 rounded-md font-mono text-xs border border-[#E5E5E5]/20 shadow-md">
            <span>INTERVAL: {hoveredBin.label} {config.unit}</span>
            <span className="text-[#FCA311] ml-3 font-bold">COUNT: {hoveredBin.count}</span>
          </div>
        )}
      </div>
    </div>
  );
};
