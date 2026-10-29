import React, { useState } from 'react';
import { AirQualityRecord } from '../../data/types';
import { ShieldAlert } from 'lucide-react';

interface AnomalyTimelineChartProps {
  data: AirQualityRecord[];
  selectedObservation: AirQualityRecord | null;
  onSelectObservation: (obs: AirQualityRecord) => void;
  className?: string;
}

export const AnomalyTimelineChart: React.FC<AnomalyTimelineChartProps> = ({
  data,
  selectedObservation,
  onSelectObservation,
  className = ''
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<AirQualityRecord | null>(null);

  const svgWidth = 840;
  const svgHeight = 260;
  const padLeft = 45;
  const padRight = 25;
  const padTop = 30;
  const padBottom = 35;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const maxAqi = 440;

  return (
    <div className={`bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-5 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase font-bold">
            ISOLATION FOREST DIAGNOSTICS
          </div>
          <h2 className="text-base font-bold text-[#000000]">
            Anomaly Timeline &amp; Outlier Distribution
          </h2>
          <p className="text-xs text-[#14213D]/70 mt-0.5">
            47 flagged candidate observations across 1,545 daily records (3.04% contamination rate)
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#14213D]" />
            <span className="text-[#14213D] font-semibold">Nominal (1,498)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FCA311] border border-[#14213D]" />
            <span className="text-[#14213D] font-bold">Flagged (47)</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Timeline */}
      <div className="relative mt-4">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none overflow-visible">
          {/* Y Axis Grid lines */}
          {[100, 200, 300, 400].map(val => {
            const y = padTop + chartH - (val / maxAqi) * chartH;
            return (
              <g key={val}>
                <line x1={padLeft} y1={y} x2={padLeft + chartW} y2={y} stroke="#E5E5E5" strokeWidth="1" />
                <text x={padLeft - 8} y={y + 3} textAnchor="end" className="fill-[#14213D]/70 font-mono text-[9px] font-semibold">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Nominal Observations (Navy dots) */}
          {data.map((d, i) => {
            if (d.isAnomaly) return null;
            const x = padLeft + (i / Math.max(1, data.length - 1)) * chartW;
            const y = padTop + chartH - (d.aqi / maxAqi) * chartH;
            return (
              <circle
                key={d.date}
                cx={x}
                cy={y}
                r="1.8"
                fill="#14213D"
                fillOpacity="0.25"
              />
            );
          })}

          {/* Flagged Anomalies (Highlighted Amber dots) */}
          {data.map((d, i) => {
            if (!d.isAnomaly) return null;
            const x = padLeft + (i / Math.max(1, data.length - 1)) * chartW;
            const y = padTop + chartH - (d.aqi / maxAqi) * chartH;
            const isSelected = selectedObservation?.date === d.date;

            return (
              <g
                key={d.date}
                onClick={() => onSelectObservation(d)}
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                {/* Ping Ring for Selected */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="none"
                    stroke="#FCA311"
                    strokeWidth="2.5"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "5.5" : "4"}
                  fill="#FCA311"
                  stroke="#14213D"
                  strokeWidth={isSelected ? "2" : "1.5"}
                />
              </g>
            );
          })}

          {/* Time Labels */}
          {['2022-08', '2023-01', '2023-07', '2024-01', '2024-07', '2025-01', '2025-07', '2026-01', '2026-10'].map(dt => {
            const idx = data.findIndex(d => d.date.startsWith(dt));
            if (idx === -1) return null;
            const x = padLeft + (idx / Math.max(1, data.length - 1)) * chartW;
            return (
              <text key={dt} x={x} y={padTop + chartH + 18} textAnchor="middle" className="fill-[#14213D]/70 font-mono text-[9px] font-semibold">
                {dt}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-2 left-16 bg-[#14213D] text-[#FFFFFF] p-3 rounded-md font-mono text-xs border border-[#E5E5E5]/20 z-20 pointer-events-none shadow-xl">
            <div className="flex items-center gap-2 text-[#FCA311] font-bold border-b border-[#E5E5E5]/20 pb-1">
              <ShieldAlert size={12} />
              <span>FLAGGED OBSERVATION: {hoveredPoint.date}</span>
            </div>
            <div className="mt-1 space-y-0.5 text-[11px]">
              <div>AQI: <span className="font-bold text-white">{hoveredPoint.aqi}</span></div>
              <div>PM2.5 / PM10: <span className="text-[#FCA311]">{hoveredPoint.pm25} / {hoveredPoint.pm10} µg/m³</span></div>
            </div>
            <div className="text-[9px] text-[#E5E5E5]/70 mt-1">CLICK TO INSPECT FULL POLLUTANT PROFILE</div>
          </div>
        )}
      </div>

      <div className="mt-3 text-[11px] font-mono text-[#14213D]/80 flex items-center justify-between font-semibold">
        <span>CLICK ON ANY AMBER MARKER TO LOAD FULL SPECTRAL COMPOSITION</span>
        <span>ISOLATION FOREST n_estimators=100</span>
      </div>
    </div>
  );
};
