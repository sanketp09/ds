import React, { useState, useMemo } from 'react';
import { AIR_QUALITY_DATA } from '../data/dataset';
import { MATCHED_ENVIRONMENTAL_DATA } from '../data/dataset';
import { AirQualityRecord, AQICategory } from '../data/types';
import { computeSummaryStats, computeHistogram, downloadCSV } from '../data/analytics';
import { CorrelationHeatmap } from '../components/charts/CorrelationHeatmap';
import { Filter, RotateCcw, Download } from 'lucide-react';

export const AirQualityPage: React.FC = () => {
  const [startDate, setStartDate] = useState('2022-08-05');
  const [endDate, setEndDate] = useState('2026-10-27');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPollutant, setSelectedPollutant] = useState<keyof AirQualityRecord>('pm25');

  // Filter dataset
  const filteredData = useMemo(() => {
    return AIR_QUALITY_DATA.filter(r => {
      if (r.date < startDate || r.date > endDate) return false;
      if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
      return true;
    });
  }, [startDate, endDate, selectedCategory]);

  // Dynamic statistics
  const currentValues = useMemo(() => {
    return filteredData.map(d => d[selectedPollutant]).filter(v => typeof v === 'number') as number[];
  }, [filteredData, selectedPollutant]);

  const stats = useMemo(() => computeSummaryStats(currentValues), [currentValues]);
  const histogram = useMemo(() => computeHistogram(currentValues, 14), [currentValues]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<AQICategory, number> = {
      'Good': 0,
      'Moderate': 0,
      'Poor': 0,
      'Very Poor': 0,
      'Severe': 0
    };
    filteredData.forEach(d => {
      if (counts[d.category] !== undefined) counts[d.category]++;
    });
    return counts;
  }, [filteredData]);

  const resetFilters = () => {
    setStartDate('2022-08-05');
    setEndDate('2026-10-27');
    setSelectedCategory('ALL');
    setSelectedPollutant('pm25');
  };

  const handleExportCSV = () => {
    downloadCSV('mumbai_filtered_air_quality.csv', filteredData);
  };

  const pollutantLabels: Record<string, string> = {
    aqi: 'AQI Index',
    pm25: 'PM2.5 (µg/m³)',
    pm10: 'PM10 (µg/m³)',
    no2: 'NO2 (µg/m³)',
    so2: 'SO2 (µg/m³)',
    co: 'CO (µg/m³)',
    o3: 'O3 (µg/m³)',
    dust: 'Dust Mass (µg/m³)',
    aod: 'Aerosol Optical Depth'
  };

  const maxFreq = Math.max(...histogram.map(h => h.count), 1);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <section className="border-b border-[#E5E5E5] pb-5">
        <div className="text-xs font-mono text-[#14213D]/70 uppercase tracking-wider mb-2 font-bold">
          AIR QUALITY / MODULE 02
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#000000]">
              Inside the particulate record.
            </h1>
            <p className="text-sm text-[#14213D]/80 mt-1.5 max-w-2xl">
              Explore AQI and pollutant distributions across the available Mumbai observations.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-[#14213D] hover:bg-[#000000] text-[#FFFFFF] px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition-colors self-start md:self-auto shadow-xs"
          >
            <Download size={13} className="text-[#FCA311]" />
            <span>EXPORT FILTERED DATA</span>
          </button>
        </div>
      </section>

      {/* Filter Control Bar */}
      <section className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5E5E5] shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] mb-4">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#14213D]">
            <Filter size={14} className="text-[#FCA311]" />
            <span>DATASET FILTERS &amp; PARAMETERS</span>
          </div>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs font-mono font-bold text-[#14213D] hover:text-[#FCA311]"
          >
            <RotateCcw size={12} />
            <span>RESET</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          {/* Start Date */}
          <div>
            <label className="text-[10px] text-[#14213D]/70 uppercase block mb-1 font-semibold">START DATE</label>
            <input
              type="date"
              value={startDate}
              min="2022-08-05"
              max={endDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-[#F4F6F9] border border-[#E5E5E5] rounded-md px-2.5 py-1.5 text-xs font-mono text-[#000000] focus:outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-[10px] text-[#14213D]/70 uppercase block mb-1 font-semibold">END DATE</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max="2026-10-27"
              onChange={e => setEndDate(e.target.value)}
              className="w-full bg-[#F4F6F9] border border-[#E5E5E5] rounded-md px-2.5 py-1.5 text-xs font-mono text-[#000000] focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-[10px] text-[#14213D]/70 uppercase block mb-1 font-semibold">AQI CATEGORY</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-[#F4F6F9] border border-[#E5E5E5] rounded-md px-2.5 py-1.5 text-xs font-mono text-[#000000] font-semibold focus:outline-none"
            >
              <option value="ALL">ALL CATEGORIES</option>
              <option value="Good">GOOD (0–50)</option>
              <option value="Moderate">MODERATE (51–100)</option>
              <option value="Poor">POOR (101–200)</option>
              <option value="Very Poor">VERY POOR (201–300)</option>
              <option value="Severe">SEVERE (&gt;300)</option>
            </select>
          </div>

          {/* Pollutant Focus */}
          <div>
            <label className="text-[10px] text-[#14213D]/70 uppercase block mb-1 font-semibold">POLLUTANT FOCUS</label>
            <select
              value={selectedPollutant}
              onChange={e => setSelectedPollutant(e.target.value as keyof AirQualityRecord)}
              className="w-full bg-[#F4F6F9] border border-[#E5E5E5] rounded-md px-2.5 py-1.5 text-xs font-mono text-[#000000] font-semibold focus:outline-none"
            >
              {Object.keys(pollutantLabels).map(k => (
                <option key={k} value={k}>{pollutantLabels[k]}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Recalculated Statistical Summary */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5] shadow-xs font-mono">
          <div className="text-[10px] text-[#14213D]/60 font-semibold">ACTIVE SAMPLE (N)</div>
          <div className="text-xl font-black text-[#000000] mt-1 tabular-nums">{stats.count}</div>
          <div className="text-[9px] text-[#14213D]/60 mt-0.5">OBSERVATIONS</div>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5] shadow-xs font-mono">
          <div className="text-[10px] text-[#14213D]/60 font-semibold">SAMPLE MEAN</div>
          <div className="text-xl font-black text-[#14213D] mt-1 tabular-nums">{stats.mean}</div>
          <div className="text-[9px] text-[#14213D]/60 mt-0.5 truncate">{pollutantLabels[selectedPollutant]}</div>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5] shadow-xs font-mono">
          <div className="text-[10px] text-[#14213D]/60 font-semibold">SAMPLE MEDIAN</div>
          <div className="text-xl font-black text-[#000000] mt-1 tabular-nums">{stats.median}</div>
          <div className="text-[9px] text-[#14213D]/60 mt-0.5">50TH PERCENTILE</div>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5] shadow-xs font-mono">
          <div className="text-[10px] text-[#14213D]/60 font-semibold">STD DEVIATION</div>
          <div className="text-xl font-black text-[#14213D] mt-1 tabular-nums">{stats.stdDev}</div>
          <div className="text-[9px] text-[#14213D]/60 mt-0.5">DISPERSION σ</div>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5] shadow-xs font-mono">
          <div className="text-[10px] text-[#14213D]/60 font-semibold">MINIMUM</div>
          <div className="text-xl font-black text-[#14213D] mt-1 tabular-nums">{stats.min}</div>
          <div className="text-[9px] text-[#14213D]/60 mt-0.5">LOWER BOUND</div>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5] shadow-xs font-mono">
          <div className="text-[10px] text-[#14213D]/60 font-semibold">MAXIMUM</div>
          <div className="text-xl font-black text-[#FCA311] mt-1 tabular-nums">{stats.max}</div>
          <div className="text-[9px] text-[#14213D]/60 mt-0.5">UPPER EXTREME</div>
        </div>
      </section>

      {/* Distribution Chart & Category Frequency */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Histogram */}
        <div className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-5 shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-[#E5E5E5]">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase font-bold">
                EMPIRICAL DENSITY
              </div>
              <h3 className="text-base font-bold text-[#000000]">
                {pollutantLabels[selectedPollutant]} Histogram
              </h3>
            </div>
            <span className="font-mono text-xs text-[#14213D] bg-[#E5E5E5] px-2.5 py-0.5 rounded font-bold">
              14 BINS
            </span>
          </div>

          <div className="relative mt-4">
            <svg viewBox="0 0 540 200" className="w-full h-auto select-none">
              {histogram.map((bin, i) => {
                const step = 480 / histogram.length;
                const barW = step * 0.8;
                const barH = (bin.count / maxFreq) * 140;
                const x = 35 + i * step + (step - barW) / 2;
                const y = 165 - barH;

                return (
                  <g key={bin.label}>
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={barH}
                      fill="#14213D"
                      rx="2"
                      className="hover:fill-[#FCA311] transition-colors"
                    />
                    <text x={x + barW / 2} y="180" textAnchor="middle" className="fill-[#14213D]/70 font-mono text-[8px] font-semibold">
                      {bin.binStart}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Category Frequency */}
        <div className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-5 shadow-xs">
          <div className="pb-3 border-b border-[#E5E5E5]">
            <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase font-bold">
              SEVERITY CLASSIFICATION
            </div>
            <h3 className="text-base font-bold text-[#000000]">
              AQI Category Frequency Breakdown
            </h3>
          </div>

          <div className="space-y-3 mt-4 font-mono text-xs">
            {(Object.keys(categoryCounts) as AQICategory[]).map(cat => {
              const count = categoryCounts[cat];
              const pct = filteredData.length > 0 ? ((count / filteredData.length) * 100).toFixed(1) : '0';
              let barColor = '#14213D';
              if (cat === 'Good') barColor = '#2A4365';
              if (cat === 'Moderate') barColor = '#14213D';
              if (cat === 'Poor') barColor = '#E67E22';
              if (cat === 'Very Poor') barColor = '#FCA311';
              if (cat === 'Severe') barColor = '#000000';

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-[#000000]">{cat}</span>
                    <span className="text-[#14213D]/70 font-semibold">{count} obs ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#E5E5E5] h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300" 
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Correlation Matrix */}
      <section>
        <CorrelationHeatmap data={MATCHED_ENVIRONMENTAL_DATA} />
      </section>
    </div>
  );
};
