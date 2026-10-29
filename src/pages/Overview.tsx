import React from 'react';
import { NavLink } from 'react-router-dom';
import { DATASET_METADATA, AIR_QUALITY_DATA } from '../data/dataset';
import { AtmosphericTerrain } from '../visualizations/AtmosphericTerrain';
import { HistoricalAqiChart } from '../components/charts/HistoricalAqiChart';
import { MonthlySeasonalityChart } from '../components/charts/MonthlySeasonalityChart';
import { PollutantDistributionChart } from '../components/charts/PollutantDistributionChart';
import { ArrowUpRight } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* 6.1 Header */}
      <section className="border-b border-[#E5E5E5] pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#14213D]/70 uppercase tracking-wider mb-2">
          <span className="text-[#14213D] font-bold">ENVIRONMENTAL OBSERVATORY</span>
          <span>/</span>
          <span className="text-[#FCA311] font-semibold">MODULE 01</span>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#000000] tracking-tight">
              Reading Mumbai's atmosphere.
            </h1>
            <p className="text-base text-[#14213D]/80 mt-2 max-w-2xl leading-relaxed">
              An analytical view of air quality, weather patterns, unusual observations and monthly AQI forecasts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#14213D] bg-[#FFFFFF] p-3 rounded-md border border-[#E5E5E5] shadow-xs self-start lg:self-auto">
            <div>
              <span className="font-bold text-[#14213D]">LOCATION:</span> MUMBAI, INDIA
            </div>
            <span className="text-[#E5E5E5]">•</span>
            <div>
              <span className="font-bold text-[#14213D]">AQI:</span> AUG 2022 — OCT 2026
            </div>
            <span className="text-[#E5E5E5]">•</span>
            <div>
              <span className="font-bold text-[#14213D]">WEATHER:</span> JAN 2020 — OCT 2026
            </div>
          </div>
        </div>
      </section>

      {/* 6.2 Key Metric Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5E5E5] shadow-xs flex flex-col justify-between hover:border-[#14213D]/40 transition-colors">
          <div className="flex justify-between items-start text-xs font-mono text-[#14213D]/70">
            <span className="font-bold text-[#14213D]">MEAN AQI</span>
            <span className="text-[10px] bg-[#E5E5E5] px-1.5 py-0.5 rounded text-[#14213D] font-semibold">1,545 OBS</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-display font-black text-[#000000] tabular-nums">
              {DATASET_METADATA.meanAqi}
            </div>
            <p className="text-xs text-[#14213D]/70 mt-1">
              Sample mean across the 2022–2026 daily observational series.
            </p>
          </div>
          <div className="pt-2 border-t border-[#E5E5E5] text-[10px] font-mono text-[#14213D] flex items-center justify-between font-semibold">
            <span>CALCULATION: Σ(AQI) / N</span>
            <span>UNITS: AQI INDEX</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5E5E5] shadow-xs flex flex-col justify-between hover:border-[#14213D]/40 transition-colors">
          <div className="flex justify-between items-start text-xs font-mono text-[#14213D]/70">
            <span className="font-bold text-[#14213D]">MEDIAN AQI</span>
            <span className="text-[10px] bg-[#E5E5E5] px-1.5 py-0.5 rounded text-[#14213D] font-semibold">50TH PERCENTILE</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-display font-black text-[#000000] tabular-nums">
              {DATASET_METADATA.medianAqi}
            </div>
            <p className="text-xs text-[#14213D]/70 mt-1">
              Midpoint value; resists episodic extreme pollution spikes.
            </p>
          </div>
          <div className="pt-2 border-t border-[#E5E5E5] text-[10px] font-mono text-[#14213D] flex items-center justify-between font-semibold">
            <span>SKEW: RIGHT-TAILED</span>
            <span>170.0 AQI</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#FFFFFF] p-5 rounded-lg border-2 border-[#FCA311] shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start text-xs font-mono">
            <span className="font-bold text-[#000000]">MAXIMUM OBSERVED</span>
            <span className="text-[10px] bg-[#FCA311] px-1.5 py-0.5 rounded text-[#14213D] font-bold">SEVERE OUTLIER</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-display font-black text-[#14213D] tabular-nums">
              {DATASET_METADATA.maxAqi}
            </div>
            <p className="text-xs text-[#14213D]/70 mt-1">
              Recorded on 13 March 2023 with PM2.5 at 279.78 µg/m³.
            </p>
          </div>
          <div className="pt-2 border-t border-[#E5E5E5] text-[10px] font-mono text-[#14213D] flex items-center justify-between font-bold">
            <span>PEAK: 13 MAR 2023</span>
            <NavLink to="/anomalies" className="hover:underline text-[#FCA311] bg-[#14213D] px-1.5 py-0.5 rounded flex items-center gap-0.5">
              CASE <ArrowUpRight size={10} />
            </NavLink>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5E5E5] shadow-xs flex flex-col justify-between hover:border-[#14213D]/40 transition-colors">
          <div className="flex justify-between items-start text-xs font-mono text-[#14213D]/70">
            <span className="font-bold text-[#14213D]">FLAGGED ANOMALIES</span>
            <span className="text-[10px] bg-[#14213D] px-1.5 py-0.5 rounded text-[#FCA311] font-bold">ISOLATION FOREST</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-display font-black text-[#000000] tabular-nums">
              {DATASET_METADATA.flaggedAnomalyCount} <span className="text-base font-normal text-[#14213D]/60">/ 1,545</span>
            </div>
            <p className="text-xs text-[#14213D]/70 mt-1">
              Approximately {DATASET_METADATA.flaggedAnomalyPercentage}% of daily records flagged for deeper diagnostic review.
            </p>
          </div>
          <div className="pt-2 border-t border-[#E5E5E5] text-[10px] font-mono text-[#14213D] flex items-center justify-between font-semibold">
            <span>CONTAMINATION: ~3%</span>
            <NavLink to="/anomalies" className="text-[#14213D] hover:text-[#FCA311] font-bold hover:underline flex items-center gap-0.5">
              EXPLORE <ArrowUpRight size={10} />
            </NavLink>
          </div>
        </div>
      </section>

      {/* 6.3 3D Hero Visualization */}
      <section className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#14213D]/80 font-semibold">
          <span className="uppercase tracking-wider">3D ATMOSPHERIC MORPHOLOGY · HERO COMPONENT</span>
          <span className="text-[10px] text-[#FCA311] bg-[#14213D] px-2 py-0.5 rounded">4 SPATIAL STATES</span>
        </div>
        <AtmosphericTerrain />
      </section>

      {/* 6.4 Historical AQI Chart */}
      <section>
        <HistoricalAqiChart data={AIR_QUALITY_DATA} />
      </section>

      {/* 6.5 & 6.6 Seasonal Patterns & Pollutant Composition */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlySeasonalityChart />
        <PollutantDistributionChart data={AIR_QUALITY_DATA} />
      </section>

      {/* 6.7 Research Findings Panel */}
      <section className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-6 shadow-xs">
        <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase mb-1 font-bold">
          EMPIRICAL RESEARCH FINDINGS
        </div>
        <h2 className="text-xl font-display font-bold text-[#000000] mb-6">
          Evidence-Backed Analytical Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Finding 1 */}
          <div className="flex flex-col justify-between p-5 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5] hover:border-[#14213D] transition-colors">
            <div>
              <div className="font-mono text-xs text-[#14213D] font-bold mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FCA311]" />
                FINDING 01 / SEASONAL VARIABILITY
              </div>
              <h3 className="text-sm font-bold text-[#000000] mt-1">
                Monsoon Scavenging vs. Winter Inversion
              </h3>
              <p className="text-xs text-[#14213D]/80 mt-2 leading-relaxed">
                Observed monthly mean AQI ranges from a low of <span className="font-bold text-[#14213D] bg-[#E5E5E5] px-1 rounded">63.63 in July</span> during monsoon washout to a peak of <span className="font-bold text-[#14213D] bg-[#FCA311]/20 px-1 rounded">294.51 in November</span> under winter boundary trapping.
              </p>
            </div>
            <NavLink 
              to="/air-quality"
              className="mt-4 pt-3 border-t border-[#E5E5E5] text-xs font-mono font-bold text-[#14213D] hover:text-[#FCA311] flex items-center justify-between"
            >
              <span>AIR QUALITY EXPLORER</span>
              <ArrowUpRight size={13} />
            </NavLink>
          </div>

          {/* Finding 2 */}
          <div className="flex flex-col justify-between p-5 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5] hover:border-[#14213D] transition-colors">
            <div>
              <div className="font-mono text-xs text-[#14213D] font-bold mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FCA311]" />
                FINDING 02 / METEOROLOGICAL CORRELATION
              </div>
              <h3 className="text-sm font-bold text-[#000000] mt-1">
                Negligible Linear Temperature Association
              </h3>
              <p className="text-xs text-[#14213D]/80 mt-2 leading-relaxed">
                The Pearson correlation between daily mean temperature and AQI is <span className="font-bold text-[#14213D] bg-[#E5E5E5] px-1 rounded">r = −0.018</span> in matched records, confirming that temperature alone cannot linearly explain pollution levels.
              </p>
            </div>
            <NavLink 
              to="/weather"
              className="mt-4 pt-3 border-t border-[#E5E5E5] text-xs font-mono font-bold text-[#14213D] hover:text-[#FCA311] flex items-center justify-between"
            >
              <span>WEATHER &amp; CORRELATION</span>
              <ArrowUpRight size={13} />
            </NavLink>
          </div>

          {/* Finding 3 */}
          <div className="flex flex-col justify-between p-5 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5] hover:border-[#14213D] transition-colors">
            <div>
              <div className="font-mono text-xs text-[#14213D] font-bold mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FCA311]" />
                FINDING 03 / UNSUPERVISED ANOMALY DETECTION
              </div>
              <h3 className="text-sm font-bold text-[#000000] mt-1">
                Isolation Forest Flags 47 Observations
              </h3>
              <p className="text-xs text-[#14213D]/80 mt-2 leading-relaxed">
                Unsupervised partitioning identified <span className="font-bold text-[#14213D] bg-[#FCA311]/20 px-1 rounded">47 candidate anomalies (3.04%)</span>, characterized by anomalous co-occurrences of extreme PM2.5, SO2, and CO concentrations.
              </p>
            </div>
            <NavLink 
              to="/anomalies"
              className="mt-4 pt-3 border-t border-[#E5E5E5] text-xs font-mono font-bold text-[#14213D] hover:text-[#FCA311] flex items-center justify-between"
            >
              <span>ANOMALY OBSERVATORY</span>
              <ArrowUpRight size={13} />
            </NavLink>
          </div>
        </div>
      </section>
    </div>
  );
};
