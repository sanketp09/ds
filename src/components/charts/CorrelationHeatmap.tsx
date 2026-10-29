import React, { useState, useMemo } from 'react';
import { MatchedEnvironmentalRecord } from '../../data/types';
import { computePearsonCorrelation } from '../../data/analytics';
import { Info, Check } from 'lucide-react';

interface CorrelationHeatmapProps {
  data: MatchedEnvironmentalRecord[];
  className?: string;
}

const DEFAULT_VARIABLES = [
  { id: 'aqi', label: 'AQI' },
  { id: 'pm25', label: 'PM2.5' },
  { id: 'pm10', label: 'PM10' },
  { id: 'no2', label: 'NO2' },
  { id: 'so2', label: 'SO2' },
  { id: 'co', label: 'CO' },
  { id: 'tempMean', label: 'Temp', isWeather: true },
  { id: 'humidity', label: 'Humidity', isWeather: true },
  { id: 'windSpeed', label: 'Wind', isWeather: true },
];

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  data,
  className = ''
}) => {
  const [selectedVarIds, setSelectedVarIds] = useState<string[]>([
    'aqi', 'pm25', 'pm10', 'no2', 'so2', 'tempMean', 'humidity'
  ]);
  const [hoveredCell, setHoveredCell] = useState<{
    varA: string;
    varB: string;
    r: number;
    count: number;
  } | null>(null);

  const activeVars = useMemo(() => {
    return DEFAULT_VARIABLES.filter(v => selectedVarIds.includes(v.id));
  }, [selectedVarIds]);

  // Compute correlation matrix for active variables
  const matrix = useMemo(() => {
    const mat: { [key: string]: { [key: string]: { r: number; count: number } } } = {};

    activeVars.forEach(v1 => {
      mat[v1.id] = {};
      activeVars.forEach(v2 => {
        if (v1.id === v2.id) {
          mat[v1.id][v2.id] = { r: 1.0, count: data.length };
        } else {
          const xVals = data.map(d => v1.isWeather ? d.weather?.[v1.id as keyof typeof d.weather] as number : (d as any)[v1.id]).filter(v => typeof v === 'number');
          const yVals = data.map(d => v2.isWeather ? d.weather?.[v2.id as keyof typeof d.weather] as number : (d as any)[v2.id]).filter(v => typeof v === 'number');
          const res = computePearsonCorrelation(xVals, yVals);
          mat[v1.id][v2.id] = { r: res.r, count: res.count };
        }
      });
    });

    return mat;
  }, [activeVars, data]);

  const toggleVariable = (id: string) => {
    if (selectedVarIds.includes(id)) {
      if (selectedVarIds.length > 3) {
        setSelectedVarIds(selectedVarIds.filter(v => v !== id));
      }
    } else {
      setSelectedVarIds([...selectedVarIds, id]);
    }
  };

  // Diverging color scale: Navy (#14213D) for positive, Amber (#FCA311) for negative
  const getCellColor = (r: number) => {
    if (r === 1) return '#14213D';
    if (r > 0) {
      const opacity = Math.min(1, Math.max(0.12, r));
      return `rgba(20, 33, 61, ${opacity * 0.9})`;
    } else {
      const opacity = Math.min(1, Math.max(0.15, Math.abs(r)));
      return `rgba(252, 163, 17, ${opacity * 0.9})`;
    }
  };

  return (
    <div className={`bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-5 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase font-bold">
            CROSS-VARIABLE ASSOCIATIONS
          </div>
          <h2 className="text-base font-bold text-[#000000]">
            Pearson Correlation Matrix
          </h2>
          <p className="text-xs text-[#14213D]/70 mt-0.5">
            Pairwise linear association coefficients across matched environmental observations
          </p>
        </div>

        {/* Variable Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
          {DEFAULT_VARIABLES.map(v => {
            const isSelected = selectedVarIds.includes(v.id);
            return (
              <button
                key={v.id}
                onClick={() => toggleVariable(v.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all flex items-center gap-1 font-semibold ${
                  isSelected 
                    ? 'bg-[#14213D] text-[#FFFFFF] border-[#14213D]' 
                    : 'bg-[#E5E5E5] text-[#14213D] border-[#E5E5E5]'
                }`}
              >
                <span>{v.label}</span>
                {isSelected && <Check size={11} className="text-[#FCA311]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="mt-4 overflow-x-auto">
        <div className="inline-block min-w-[420px] w-full">
          {/* Column Header */}
          <div className="flex pl-20">
            {activeVars.map(col => (
              <div 
                key={col.id} 
                className="flex-1 text-center font-mono text-[10px] font-bold text-[#14213D] pb-1.5"
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Rows */}
          {activeVars.map(row => (
            <div key={row.id} className="flex items-center my-0.5">
              {/* Row Label */}
              <div className="w-20 font-mono text-[10px] font-bold text-[#14213D] pr-2 text-right shrink-0">
                {row.label}
              </div>

              {/* Cells */}
              <div className="flex-1 flex gap-0.5">
                {activeVars.map(col => {
                  const cell = matrix[row.id]?.[col.id] || { r: 0, count: 0 };
                  const rVal = cell.r;
                  const isHovered = hoveredCell?.varA === row.id && hoveredCell?.varB === col.id;

                  return (
                    <div
                      key={col.id}
                      onMouseEnter={() => setHoveredCell({ varA: row.label, varB: col.label, r: rVal, count: cell.count })}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{ backgroundColor: getCellColor(rVal) }}
                      className={`flex-1 h-9 rounded flex items-center justify-center font-mono text-[11px] cursor-pointer transition-all ${
                        Math.abs(rVal) > 0.4 ? 'text-[#FFFFFF] font-bold' : 'text-[#000000] font-semibold'
                      } ${isHovered ? 'ring-2 ring-[#FCA311] scale-105 z-10' : ''}`}
                    >
                      {rVal.toFixed(2)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hover Info & Caveat */}
      <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#14213D]">
          <Info size={14} className="shrink-0 text-[#FCA311]" />
          <span className="font-mono text-[11px] font-semibold">
            {hoveredCell 
              ? `${hoveredCell.varA} ↔ ${hoveredCell.varB}: Pearson r = ${hoveredCell.r.toFixed(3)} (N = ${hoveredCell.count})`
              : 'Hover over any cell to inspect correlation coefficient and sample size'}
          </span>
        </div>

        <div className="font-mono text-[10px] text-[#14213D] bg-[#E5E5E5] px-2.5 py-1 rounded-md font-bold">
          * CORRELATION ≠ CAUSATION (NAVY = POSITIVE, AMBER = NEGATIVE)
        </div>
      </div>
    </div>
  );
};
