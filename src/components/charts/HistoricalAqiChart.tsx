import React, { useState, useMemo } from 'react';
import { AirQualityRecord } from '../../data/types';

interface HistoricalAqiChartProps {
  data: AirQualityRecord[];
  onSelectDate?: (date: string) => void;
  className?: string;
}

export const HistoricalAqiChart: React.FC<HistoricalAqiChartProps> = ({
  data,
  className = ''
}) => {
  const [showRollingAvg, setShowRollingAvg] = useState(true);
  const [aggregation, setAggregation] = useState<'daily' | 'monthly'>('daily');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [hoveredRecord, setHoveredRecord] = useState<AirQualityRecord | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Filter by year
  const filteredData = useMemo(() => {
    if (selectedYear === 'ALL') return data;
    return data.filter(d => d.date.startsWith(selectedYear));
  }, [data, selectedYear]);

  // Aggregate monthly if selected
  const displayData = useMemo(() => {
    if (aggregation === 'daily') return filteredData;

    const monthlyMap = new Map<string, { sum: number; count: number; date: string; category: any; isAnomaly: boolean }>();
    filteredData.forEach(d => {
      const ym = d.date.slice(0, 7);
      const curr = monthlyMap.get(ym) || { sum: 0, count: 0, date: `${ym}-15`, category: 'Moderate', isAnomaly: false };
      curr.sum += d.aqi;
      curr.count += 1;
      if (d.isAnomaly) curr.isAnomaly = true;
      monthlyMap.set(ym, curr);
    });

    return Array.from(monthlyMap.entries()).map(([ym, val]) => {
      const avgAqi = Math.round(val.sum / val.count);
      return {
        date: ym,
        aqi: avgAqi,
        pm25: Math.round(avgAqi * 0.46),
        pm10: Math.round(avgAqi * 0.77),
        no2: 35,
        so2: 20,
        co: 900,
        o3: 100,
        dust: 80,
        aod: 0.55,
        category: avgAqi > 200 ? 'Very Poor' : avgAqi > 100 ? 'Poor' : 'Moderate',
        isAnomaly: val.isAnomaly
      } as AirQualityRecord;
    });
  }, [filteredData, aggregation]);

  // Compute 7-day rolling average for daily
  const rollingAverages = useMemo(() => {
    if (aggregation === 'monthly' || !showRollingAvg) return [];
    const windowSize = 7;
    return displayData.map((d, i, arr) => {
      const start = Math.max(0, i - windowSize + 1);
      const slice = arr.slice(start, i + 1);
      const avg = Math.round(slice.reduce((s, r) => s + r.aqi, 0) / slice.length);
      return avg;
    });
  }, [displayData, aggregation, showRollingAvg]);

  // SVG Chart Dimensions
  const svgWidth = 840;
  const svgHeight = 280;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const maxVal = 440;

  const points = useMemo(() => {
    if (displayData.length === 0) return '';
    return displayData.map((d, i) => {
      const x = padLeft + (i / Math.max(1, displayData.length - 1)) * chartW;
      const y = padTop + chartH - (d.aqi / maxVal) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [displayData, chartW, chartH]);

  const rollingPoints = useMemo(() => {
    if (rollingAverages.length === 0) return '';
    return rollingAverages.map((avg, i) => {
      const x = padLeft + (i / Math.max(1, rollingAverages.length - 1)) * chartW;
      const y = padTop + chartH - (avg / maxVal) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [rollingAverages, chartW, chartH]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relX = (mouseX / rect.width) * svgWidth;
    
    if (relX >= padLeft && relX <= padLeft + chartW && displayData.length > 0) {
      const ratio = (relX - padLeft) / chartW;
      const idx = Math.min(displayData.length - 1, Math.max(0, Math.round(ratio * (displayData.length - 1))));
      setHoveredRecord(displayData[idx]);
      setHoverX(padLeft + (idx / (displayData.length - 1)) * chartW);
    }
  };

  const handleMouseLeave = () => {
    setHoveredRecord(null);
    setHoverX(null);
  };

  return (
    <div className={`bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-5 shadow-xs ${className}`}>
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase font-bold">
            CHRONOLOGICAL TIME-SERIES
          </div>
          <h2 className="text-base font-bold text-[#000000]">
            The Shape of Air Quality
          </h2>
          <p className="text-xs text-[#14213D]/70 mt-0.5">
            Daily observational records · August 2022 to October 2026 (N = {filteredData.length})
          </p>
        </div>

        {/* View Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Year selector */}
          <div className="flex items-center gap-1 bg-[#E5E5E5] p-1 rounded-md font-mono text-[11px]">
            {['ALL', '2022', '2023', '2024', '2025', '2026'].map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2 py-0.5 rounded transition-all ${
                  selectedYear === yr ? 'bg-[#14213D] text-[#FFFFFF] font-bold' : 'text-[#14213D] hover:text-[#000000]'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Aggregation Toggle */}
          <div className="flex items-center gap-1 bg-[#E5E5E5] p-1 rounded-md font-mono text-[11px]">
            <button
              onClick={() => setAggregation('daily')}
              className={`px-2 py-0.5 rounded ${aggregation === 'daily' ? 'bg-[#14213D] text-[#FFFFFF] font-bold' : 'text-[#14213D]'}`}
            >
              DAILY
            </button>
            <button
              onClick={() => setAggregation('monthly')}
              className={`px-2 py-0.5 rounded ${aggregation === 'monthly' ? 'bg-[#14213D] text-[#FFFFFF] font-bold' : 'text-[#14213D]'}`}
            >
              MONTHLY AVG
            </button>
          </div>

          {/* Rolling Average Toggle */}
          {aggregation === 'daily' && (
            <button
              onClick={() => setShowRollingAvg(!showRollingAvg)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all font-semibold ${
                showRollingAvg 
                  ? 'border-[#FCA311] bg-[#FCA311]/15 text-[#14213D]' 
                  : 'border-[#E5E5E5] text-[#14213D]/70 hover:text-[#000000]'
              }`}
            >
              7-DAY ROLLING
            </button>
          )}
        </div>
      </div>

      {/* SVG Interactive Chart Surface */}
      <div className="relative mt-4">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair overflow-visible select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Y Axis Grid & Reference Lines */}
          {[100, 200, 300, 400].map(val => {
            const y = padTop + chartH - (val / maxVal) * chartH;
            return (
              <g key={val}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartW}
                  y2={y}
                  stroke="#E5E5E5"
                  strokeDasharray={val === 300 ? "4 4" : undefined}
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

          {/* Severe AQI Threshold Label */}
          <text
            x={padLeft + chartW - 4}
            y={padTop + chartH - (300 / maxVal) * chartH - 4}
            textAnchor="end"
            className="fill-[#FCA311] font-mono text-[9px] font-bold"
          >
            SEVERE THRESHOLD (&gt;300 AQI)
          </text>

          {/* Area Fill Under Curve */}
          {points && (
            <polygon
              points={`${padLeft},${padTop + chartH} ${points} ${padLeft + chartW},${padTop + chartH}`}
              fill="rgba(20, 33, 61, 0.06)"
            />
          )}

          {/* Primary AQI Data Polyline */}
          {points && (
            <polyline
              points={points}
              fill="none"
              stroke="#14213D"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          )}

          {/* 7-Day Rolling Average Line */}
          {showRollingAvg && rollingPoints && (
            <polyline
              points={rollingPoints}
              fill="none"
              stroke="#FCA311"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}

          {/* Highlight Extreme Anomaly Outliers (> 330) */}
          {displayData.map((d, i) => {
            if (d.aqi > 330 || d.isAnomaly) {
              const x = padLeft + (i / Math.max(1, displayData.length - 1)) * chartW;
              const y = padTop + chartH - (d.aqi / maxVal) * chartH;
              return (
                <circle
                  key={d.date}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#FCA311"
                  stroke="#14213D"
                  strokeWidth="1.5"
                />
              );
            }
            return null;
          })}

          {/* Hover Crosshair & Point */}
          {hoverX !== null && hoveredRecord && (
            <g>
              <line
                x1={hoverX}
                y1={padTop}
                x2={hoverX}
                y2={padTop + chartH}
                stroke="#14213D"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={hoverX}
                cy={padTop + chartH - (hoveredRecord.aqi / maxVal) * chartH}
                r="5"
                fill="#FCA311"
                stroke="#14213D"
                strokeWidth="2"
              />
            </g>
          )}

          {/* X Axis Time Labels */}
          {['2022-08', '2023-01', '2023-07', '2024-01', '2024-07', '2025-01', '2025-07', '2026-01', '2026-10'].map(dt => {
            const idx = displayData.findIndex(d => d.date.startsWith(dt));
            if (idx === -1) return null;
            const x = padLeft + (idx / Math.max(1, displayData.length - 1)) * chartW;
            return (
              <text
                key={dt}
                x={x}
                y={padTop + chartH + 18}
                textAnchor="middle"
                className="fill-[#14213D]/70 font-mono text-[9px] font-semibold"
              >
                {dt}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredRecord && hoverX !== null && (
          <div 
            className="absolute top-2 pointer-events-none bg-[#14213D] text-[#FFFFFF] p-3 rounded-md shadow-xl text-xs font-mono border border-[#E5E5E5]/20 z-20"
            style={{
              left: Math.min(hoverX + 12, svgWidth - 190),
            }}
          >
            <div className="flex items-center justify-between gap-4 text-[#FCA311] border-b border-[#E5E5E5]/20 pb-1 font-bold">
              <span>DATE: {hoveredRecord.date}</span>
              <span>{hoveredRecord.isAnomaly ? 'OUTLIER' : hoveredRecord.category}</span>
            </div>
            <div className="mt-1.5 space-y-0.5">
              <div className="flex justify-between gap-4">
                <span className="text-[#E5E5E5]">AQI VALUE:</span>
                <span className="font-extrabold text-[#FFFFFF] text-sm">{hoveredRecord.aqi}</span>
              </div>
              <div className="flex justify-between gap-4 text-[11px] text-[#E5E5E5]/90">
                <span>PM2.5 / PM10:</span>
                <span>{hoveredRecord.pm25} / {hoveredRecord.pm10} µg/m³</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between text-xs font-mono text-[#14213D]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-1 bg-[#14213D] rounded-full" />
            <span className="font-bold">DAILY AQI</span>
          </div>
          {showRollingAvg && (
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-1 bg-[#FCA311] rounded-full" />
              <span className="font-bold text-[#14213D]">7-DAY ROLLING AVG</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FCA311] border border-[#14213D]" />
            <span className="font-bold">OUTLIER OBS</span>
          </div>
        </div>

        <div className="text-[11px] font-semibold text-[#14213D]/70">
          RANGE: {filteredData.length > 0 ? `${filteredData[0].date} — ${filteredData[filteredData.length - 1].date}` : 'N/A'}
        </div>
      </div>
    </div>
  );
};
