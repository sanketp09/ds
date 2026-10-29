import React, { useState } from 'react';
import { 
  AIR_QUALITY_DATA, 
  MATCHED_ENVIRONMENTAL_DATA 
} from '../data/dataset';
import { MatchedEnvironmentalRecord } from '../data/types';
import { AnomalyTimelineChart } from '../components/charts/AnomalyTimelineChart';
import { AnomalyPointCloud } from '../visualizations/AnomalyPointCloud';
import { ShieldAlert, Crosshair, ArrowRight } from 'lucide-react';

export const AnomaliesPage: React.FC = () => {
  const [selectedObs, setSelectedObs] = useState<MatchedEnvironmentalRecord>(
    MATCHED_ENVIRONMENTAL_DATA.find(d => d.date === '2023-03-13') || MATCHED_ENVIRONMENTAL_DATA[0]
  );
  const [viewTab, setViewTab] = useState<'timeline' | 'latentSpace'>('timeline');

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <section className="border-b border-[#E5E5E5] pb-5">
        <div className="text-xs font-mono text-[#14213D]/70 uppercase tracking-wider mb-2 font-bold">
          ANOMALY OBSERVATORY / MODULE 04
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#000000]">
            Observations outside the pattern.
          </h1>
          <p className="text-sm text-[#14213D]/80 mt-1.5 max-w-2xl leading-relaxed">
            Unsupervised anomaly detection using Isolation Forest to identify multivariate atmospheric deviations.
          </p>
        </div>
      </section>

      {/* 9.1 Summary Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5E5E5] shadow-xs">
          <div className="text-[10px] font-mono text-[#14213D]/60 uppercase font-bold">TOTAL AQI OBSERVATIONS</div>
          <div className="text-3xl font-display font-black text-[#000000] mt-2 tabular-nums">
            1,545
          </div>
          <p className="text-xs text-[#14213D]/70 mt-1">Complete daily records from 2022 to 2026.</p>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5E5E5] shadow-xs">
          <div className="text-[10px] font-mono text-[#14213D]/60 uppercase font-bold">FLAGGED OBSERVATIONS</div>
          <div className="text-3xl font-display font-black text-[#FCA311] mt-2 tabular-nums">
            47
          </div>
          <p className="text-xs text-[#14213D]/70 mt-1">Multivariate outlier candidates identified.</p>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5E5E5] shadow-xs">
          <div className="text-[10px] font-mono text-[#14213D]/60 uppercase font-bold">FLAGGED SHARE</div>
          <div className="text-3xl font-display font-black text-[#14213D] mt-2 tabular-nums">
            3.04%
          </div>
          <p className="text-xs text-[#14213D]/70 mt-1">Contamination parameter setting (0.03).</p>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5E5E5] shadow-xs">
          <div className="text-[10px] font-mono text-[#14213D]/60 uppercase font-bold">ALGORITHM</div>
          <div className="text-2xl font-display font-bold text-[#14213D] mt-2">
            Isolation Forest
          </div>
          <p className="text-xs text-[#14213D]/70 mt-1">Random partitioning trees in feature space.</p>
        </div>
      </section>

      {/* View Switcher: 2D Timeline vs 3D Latent Point Cloud */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#14213D]/70 font-bold">OBSERVATION SPACE:</span>
            <div className="flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-md border border-[#E5E5E5] text-xs font-mono shadow-xs">
              <button
                onClick={() => setViewTab('timeline')}
                className={`px-3 py-1 rounded transition-all font-semibold ${
                  viewTab === 'timeline' ? 'bg-[#14213D] text-[#FFFFFF]' : 'text-[#14213D] hover:bg-[#E5E5E5]'
                }`}
              >
                2D CHRONOLOGICAL TIMELINE
              </button>
              <button
                onClick={() => setViewTab('latentSpace')}
                className={`px-3 py-1 rounded transition-all font-semibold ${
                  viewTab === 'latentSpace' ? 'bg-[#14213D] text-[#FFFFFF]' : 'text-[#14213D] hover:bg-[#E5E5E5]'
                }`}
              >
                3D MULTI-POLLUTANT CLOUD
              </button>
            </div>
          </div>

          <div className="hidden sm:block text-[11px] font-mono text-[#14213D] font-bold">
            ACTIVE SELECTION: {selectedObs.date} (AQI {selectedObs.aqi})
          </div>
        </div>

        {viewTab === 'timeline' ? (
          <AnomalyTimelineChart
            data={AIR_QUALITY_DATA}
            selectedObservation={selectedObs}
            onSelectObservation={(d) => {
              const matched = MATCHED_ENVIRONMENTAL_DATA.find(m => m.date === d.date) || d as any;
              setSelectedObs(matched);
            }}
          />
        ) : (
          <AnomalyPointCloud
            data={MATCHED_ENVIRONMENTAL_DATA}
            selectedObservation={selectedObs}
            onSelectObservation={setSelectedObs}
          />
        )}
      </section>

      {/* 9.3 Featured Notebook Example & Selected Evidence Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notebook Featured Case: 13 March 2023 */}
        <div className="bg-[#FFFFFF] rounded-lg border-2 border-[#FCA311] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-[#FCA311]" />
                <span className="font-mono text-xs font-bold text-[#14213D] tracking-wider uppercase">
                  ANOMALY CANDIDATE / EXAMPLE OBSERVATION
                </span>
              </div>
              <span className="font-mono text-xs bg-[#14213D] text-[#FCA311] px-2.5 py-0.5 rounded-md font-bold">
                NOTEBOOK BENCHMARK
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <div className="text-xs font-mono text-[#14213D]/60 font-semibold">RECORDED DATE</div>
                <div className="text-xl font-bold font-mono text-[#000000]">13 March 2023</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-[#14213D]/60 font-semibold">PEAK AQI</div>
                <div className="text-3xl font-black font-mono text-[#14213D]">423</div>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 my-4 p-3 bg-[#F4F6F9] rounded-md border border-[#E5E5E5] font-mono text-xs">
              <div>
                <span className="text-[10px] text-[#14213D]/60 font-semibold block">PM2.5</span>
                <span className="font-bold text-[#000000]">279.78</span> µg/m³
              </div>
              <div>
                <span className="text-[10px] text-[#14213D]/60 font-semibold block">PM10</span>
                <span className="font-bold text-[#000000]">403.34</span> µg/m³
              </div>
              <div>
                <span className="text-[10px] text-[#14213D]/60 font-semibold block">NO2</span>
                <span className="font-bold text-[#000000]">116.25</span> µg/m³
              </div>
              <div>
                <span className="text-[10px] text-[#14213D]/60 font-semibold block">SO2</span>
                <span className="font-bold text-[#000000]">144.52</span> µg/m³
              </div>
              <div>
                <span className="text-[10px] text-[#14213D]/60 font-semibold block">CO</span>
                <span className="font-bold text-[#000000]">2,912.38</span> µg/m³
              </div>
              <div>
                <span className="text-[10px] text-[#14213D]/60 font-semibold block">O3</span>
                <span className="font-bold text-[#000000]">715.88</span> µg/m³
              </div>
            </div>

            <p className="text-xs text-[#14213D]/80 leading-relaxed italic">
              “This observation was flagged by the model. Its cause has not been independently verified.”
            </p>
          </div>

          <button
            onClick={() => {
              const bmk = MATCHED_ENVIRONMENTAL_DATA.find(d => d.date === '2023-03-13');
              if (bmk) setSelectedObs(bmk);
            }}
            className="mt-4 pt-3 border-t border-[#E5E5E5] text-xs font-mono font-bold text-[#14213D] hover:text-[#FCA311] flex items-center justify-between"
          >
            <span>FOCUS THIS OBSERVATION IN EVIDENCE PANEL</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Dynamic Evidence Panel for Active Selected Observation */}
        <div className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-2">
              <Crosshair size={16} className="text-[#14213D]" />
              <span className="font-mono text-xs font-bold text-[#14213D] tracking-wider uppercase">
                ACTIVE EVIDENCE DOSSIER
              </span>
            </div>
            <span className={`font-mono text-xs px-2.5 py-0.5 rounded-md font-bold ${
              selectedObs.isAnomaly ? 'bg-[#FCA311] text-[#14213D]' : 'bg-[#E5E5E5] text-[#14213D]'
            }`}>
              {selectedObs.isAnomaly ? 'FLAGGED OUTLIER' : 'NOMINAL RECORD'}
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between font-mono">
            <div>
              <div className="text-xs text-[#14213D]/60 font-semibold">OBSERVATION DATE</div>
              <div className="text-xl font-bold text-[#000000]">{selectedObs.date}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#14213D]/60 font-semibold">RECORDED AQI</div>
              <div className="text-3xl font-black text-[#14213D]">{selectedObs.aqi}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 my-4 p-3 bg-[#F4F6F9] rounded-md border border-[#E5E5E5] font-mono text-xs">
            <div>
              <span className="text-[10px] text-[#14213D]/60 font-semibold block">PM2.5</span>
              <span className="font-bold text-[#000000]">{selectedObs.pm25}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#14213D]/60 font-semibold block">PM10</span>
              <span className="font-bold text-[#000000]">{selectedObs.pm10}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#14213D]/60 font-semibold block">NO2</span>
              <span className="font-bold text-[#000000]">{selectedObs.no2}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#14213D]/60 font-semibold block">SO2</span>
              <span className="font-bold text-[#000000]">{selectedObs.so2}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#14213D]/60 font-semibold block">CO</span>
              <span className="font-bold text-[#000000]">{selectedObs.co}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#14213D]/60 font-semibold block">O3</span>
              <span className="font-bold text-[#000000]">{selectedObs.o3}</span>
            </div>
            {selectedObs.weather && (
              <>
                <div>
                  <span className="text-[10px] text-[#14213D]/60 font-semibold block">TEMP MEAN</span>
                  <span className="font-bold text-[#000000]">{selectedObs.weather.tempMean}°C</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#14213D]/60 font-semibold block">HUMIDITY</span>
                  <span className="font-bold text-[#000000]">{selectedObs.weather.humidity}%</span>
                </div>
              </>
            )}
          </div>

          <div className="text-xs text-[#14213D]/80 leading-relaxed">
            <span className="font-bold text-[#000000]">Classification note: </span>
            {selectedObs.isAnomaly 
              ? 'Identified through tree partition depth isolation. Requires physical verification against local meteorological events, industrial flaring, or sensor calibration shifts.'
              : 'Consistent with seasonal cluster density bounds.'}
          </div>
        </div>
      </section>

      {/* 9.5 Model Explainability Section */}
      <section className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-6 shadow-xs">
        <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase mb-1 font-bold">
          UNSUPERVISED ALGORITHM EXPLAINABILITY
        </div>
        <h2 className="text-xl font-display font-bold text-[#000000] mb-4">
          How Isolation Forest Operates
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs leading-relaxed text-[#14213D]/80">
          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h4 className="font-bold text-[#000000] font-mono mb-1">1. RANDOM PARTITIONING</h4>
            <p>
              The algorithm recursively selects a random feature and split value. Outlier points require fewer partitions to isolate than points located in dense clusters.
            </p>
          </div>
          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h4 className="font-bold text-[#000000] font-mono mb-1">2. PATH LENGTH SCORE</h4>
            <p>
              Observations with significantly shorter average tree path lengths across an ensemble of 100 trees receive high anomaly scores.
            </p>
          </div>
          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h4 className="font-bold text-[#000000] font-mono mb-1">3. ANOMALY ≠ ERROR</h4>
            <p>
              An anomaly flag indicates statistical rarity, not sensor malfunction. Valid episodic meteorological inversions frequently manifest as outliers.
            </p>
          </div>
          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h4 className="font-bold text-[#000000] font-mono mb-1">4. INDEPENDENT VERIFICATION</h4>
            <p>
              Unsupervised models do not establish physical causality. Independent ground-truth station logs and local emission records remain required.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
