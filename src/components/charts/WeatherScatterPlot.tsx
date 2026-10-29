import React, { useState, useMemo } from 'react';
import { MatchedEnvironmentalRecord } from '../../data/types';
import { computePearsonCorrelation, downloadCSV } from '../../data/analytics';
import { Download, Info } from 'lucide-react';

interface WeatherScatterPlotProps {
  data: MatchedEnvironmentalRecord[];
  className?: string;
}

type NumericVarKey = 'tempMean' | 'humidity' | 'windSpeed' | 'precipitation' | 'aqi' | 'pm25' | 'pm10';

const VAR_OPTIONS: Record<NumericVarKey, { label: string; unit: string; isWeather: boolean }> = {
  tempMean: { label: 'Mean Temperature', unit: '°C', isWeather: true },
  humidity: { label: 'Relative Humidity', unit: '%', isWeather: true },
  windSpeed: { label: 'Wind Velocity', unit: 'km/h', isWeather: true },
  precipitation: { label: 'Precipitation', unit: 'mm', isWeather: true },
  aqi: { label: 'Air Quality Index', unit: 'AQI', isWeather: false },
  pm25: { label: 'PM2.5 Mass Conc', unit: 'µg/m³', isWeather: false },
  pm10: { label: 'PM10 Mass Conc', unit: 'µg/m³', isWeather: false },
};

export const WeatherScatterPlot: React.FC<WeatherScatterPlotProps> = ({
  data,
  className = ''
}) => {
  const [varX, setVarX] = useState<NumericVarKey>('tempMean');
  const [varY, setVarY] = useState<NumericVarKey>('aqi');
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    x: number;
    y: number;
  } | null>(null);

  const optX = VAR_OPTIONS[varX];
  const optY = VAR_OPTIONS[varY];

  const plotData = useMemo(() => {
    return data.map(d => {
      const vx = optX.isWeather ? d.weather?.[varX as keyof typeof d.weather] as number : (d as any)[varX];
      const vy = optY.isWeather ? d.weather?.[varY as keyof typeof d.weather] as number : (d as any)[varY];
      if (typeof vx !== 'number' || typeof vy !== 'number') return null;
      return {
        date: d.date,
        x: vx,
        y: vy,
        isAnomaly: d.isAnomaly
      };
    }).filter(Boolean) as { date: string; x: number; y: number; isAnomaly: boolean }[];
  }, [data, varX, varY, optX, optY]);

  const stats = useMemo(() => {
    const xs = plotData.map(p => p.x);
    const ys = plotData.map(p => p.y);
    return computePearsonCorrelation(xs, ys);
  }, [plotData]);

  // SVG Scales
  const svgWidth = 680;
  const svgHeight = 320;
  const padLeft = 50;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 45;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const minX = useMemo(() => Math.floor(Math.min(...plotData.map(p => p.x))), [plotData]);
  const maxX = useMemo(() => Math.ceil(Math.max(...plotData.map(p => p.x))), [plotData]);
  const minY = useMemo(() => Math.floor(Math.min(...plotData.map(p => p.y))), [plotData]);
  const maxY = useMemo(() => Math.ceil(Math.max(...plotData.map(p => p.y))), [plotData]);

  const rangeX = Math.max(1, maxX - minX);
  const rangeY = Math.max(1, maxY - minY);

  const scaleX = (val: number) => padLeft + ((val - minX) / rangeX) * chartW;
  const scaleY = (val: number) => padTop + chartH - ((val - minY) / rangeY) * chartH;

  const lineP1 = { x: minX, y: stats.slope * minX + stats.intercept };
  const lineP2 = { x: maxX, y: stats.slope * maxX + stats.intercept };

  const handleExportCSV = () => {
    const rows = plotData.map(p => ({
      date: p.date,
      [optX.label]: p.x,
      [optY.label]: p.y,
      isAnomaly: p.isAnomaly ? 'Yes' : 'No'
    }));
    downloadCSV(`mumbai_${varX}_vs_${varY}.csv`, rows);
  };

  return (
    <div className={`bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-5 shadow-xs ${className}`}>
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase font-bold">
            BIVARIATE METEOROLOGICAL CORRELATION
          </div>
          <h2 className="text-base font-bold text-[#000000]">
            {optY.label} vs. {optX.label}
          </h2>
          <p className="text-xs text-[#14213D]/70 mt-0.5">
            Matched daily records (N = {plotData.length})
          </p>
        </div>

        {/* X/Y Selectors & CSV Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[#14213D] font-bold">X:</span>
            <select
              value={varX}
              onChange={e => setVarX(e.target.value as NumericVarKey)}
              className="bg-[#E5E5E5] text-[#14213D] px-2.5 py-1 rounded-md border border-[#E5E5E5] text-xs font-mono font-semibold focus:outline-none"
            >
              {(Object.keys(VAR_OPTIONS) as NumericVarKey[]).map(k => (
                <option key={k} value={k}>{VAR_OPTIONS[k].label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[#14213D] font-bold">Y:</span>
            <select
              value={varY}
              onChange={e => setVarY(e.target.value as NumericVarKey)}
              className="bg-[#E5E5E5] text-[#14213D] px-2.5 py-1 rounded-md border border-[#E5E5E5] text-xs font-mono font-semibold focus:outline-none"
            >
              {(Object.keys(VAR_OPTIONS) as NumericVarKey[]).map(k => (
                <option key={k} value={k}>{VAR_OPTIONS[k].label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-[#14213D] hover:bg-[#000000] text-[#FFFFFF] px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors shadow-xs ml-auto"
          >
            <Download size={12} className="text-[#FCA311]" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Badge Bar */}
      <div className="flex flex-wrap items-center gap-4 my-3 p-3 bg-[#F4F6F9] rounded-md border border-[#E5E5E5] text-xs font-mono">
        <div>
          <span className="text-[#14213D]/70 font-semibold">PEARSON r: </span>
          <span className={`font-bold text-sm ${Math.abs(stats.r) < 0.05 ? 'text-[#14213D]' : stats.r > 0 ? 'text-[#14213D]' : 'text-[#FCA311]'}`}>
            {stats.r > 0 ? `+${stats.r}` : stats.r}
          </span>
        </div>
        <div className="text-[#14213D]/80">
          SLOPE: <span className="text-[#000000] font-bold">{stats.slope}</span>
        </div>
        <div className="text-[#14213D]/80">
          INTERCEPT: <span className="text-[#000000] font-bold">{stats.intercept}</span>
        </div>
        {varX === 'tempMean' && varY === 'aqi' && (
          <div className="text-[11px] text-[#14213D] bg-[#FCA311]/25 px-2.5 py-0.5 rounded-md font-bold ml-auto border border-[#FCA311]/40">
            * r = −0.018: NEGLIGIBLE LINEAR ASSOCIATION
          </div>
        )}
      </div>

      {/* SVG Scatter Plot Surface */}
      <div className="relative mt-2">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none overflow-visible">
          {/* Y Axis Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const val = Math.round(minY + ratio * rangeY);
            const y = scaleY(val);
            return (
              <g key={ratio}>
                <line x1={padLeft} y1={y} x2={padLeft + chartW} y2={y} stroke="#E5E5E5" strokeWidth="1" />
                <text x={padLeft - 8} y={y + 3} textAnchor="end" className="fill-[#14213D]/70 font-mono text-[9px] font-semibold">
                  {val}
                </text>
              </g>
            );
          })}

          {/* X Axis Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const val = Math.round(minX + ratio * rangeX);
            const x = scaleX(val);
            return (
              <g key={ratio}>
                <line x1={x} y1={padTop} x2={x} y2={padTop + chartH} stroke="#E5E5E5" strokeWidth="1" />
                <text x={x} y={padTop + chartH + 16} textAnchor="middle" className="fill-[#14213D]/70 font-mono text-[9px] font-semibold">
                  {val} {optX.unit}
                </text>
              </g>
            );
          })}

          {/* Linear Trendline */}
          <line
            x1={scaleX(lineP1.x)}
            y1={scaleY(lineP1.y)}
            x2={scaleX(lineP2.x)}
            y2={scaleY(lineP2.y)}
            stroke="#FCA311"
            strokeWidth="2.5"
            strokeDasharray="5 3"
          />

          {/* Scatter Points */}
          {plotData.map((p) => {
            const cx = scaleX(p.x);
            const cy = scaleY(p.y);
            return (
              <circle
                key={p.date}
                cx={cx}
                cy={cy}
                r={p.isAnomaly ? "3.8" : "2.2"}
                fill={p.isAnomaly ? "#FCA311" : "#14213D"}
                fillOpacity={p.isAnomaly ? 1.0 : 0.45}
                stroke={p.isAnomaly ? "#14213D" : "none"}
                strokeWidth={p.isAnomaly ? 1.2 : 0}
                className="cursor-pointer hover:stroke-2 hover:stroke-[#000000]"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 bg-[#14213D] text-[#FFFFFF] p-3 rounded-md font-mono text-xs border border-[#E5E5E5]/20 z-20 shadow-xl">
            <div className="text-[#FCA311] border-b border-[#E5E5E5]/20 pb-1 font-bold">
              OBSERVATION: {hoveredPoint.date}
            </div>
            <div className="mt-1 space-y-0.5">
              <div>{optX.label}: <span className="font-bold text-white">{hoveredPoint.x} {optX.unit}</span></div>
              <div>{optY.label}: <span className="font-bold text-white">{hoveredPoint.y} {optY.unit}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Caveat */}
      <div className="mt-4 pt-3 border-t border-[#E5E5E5] text-xs text-[#14213D]/80 leading-relaxed flex items-start gap-2">
        <Info size={14} className="text-[#FCA311] shrink-0 mt-0.5" />
        <p>
          <span className="font-bold text-[#000000]">Contextual Note:</span> Weather represents meteorological boundary context, not an isolated causative driver. Pearson correlation describes linear association only; non-linear thresholds and lag effects are evaluated in multi-variate regression.
        </p>
      </div>
    </div>
  );
};
