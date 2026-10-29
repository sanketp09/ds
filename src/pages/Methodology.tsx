import React, { useState } from 'react';
import { 
  Database, 
  ExternalLink, 
  ShieldAlert
} from 'lucide-react';

interface PipelineStep {
  id: string;
  name: string;
  code: string;
  purpose: string;
  inputs: string;
  outputs: string;
  details: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'csv',
    name: 'CSV Sources',
    code: '01',
    purpose: 'Ingestion of tabular historical environmental observations from archival records.',
    inputs: 'Raw Mumbai Air Quality and Weather CSV data tables',
    outputs: 'Raw observation dataframes with heterogeneous timestamp encodings',
    details: 'Covers August 2022 to October 2026 (AQI) and January 2020 to October 2026 (Weather).'
  },
  {
    id: 'schema',
    name: 'Schema Inspection',
    code: '02',
    purpose: 'Validating data types, physical pollutant units, and column definitions.',
    inputs: 'Raw CSV headers and numerical formats',
    outputs: 'Verified data dictionary: AQI (dimensionless), particulates (µg/m³), CO (µg/m³), Temp (°C)',
    details: 'Enforced ISO 8601 UTC date formats and mapped sensor attribute definitions.'
  },
  {
    id: 'cleaning',
    name: 'Data Cleaning',
    code: '03',
    purpose: 'Handling missing values, deduplication, and bounds checking.',
    inputs: 'Raw observational records with occasional missing sensor records',
    outputs: '1,545 cleaned daily AQI records and 2,492 cleaned daily weather records',
    details: 'Forward-fill / linear interpolation across short gaps (< 2 days); extreme sensor errors clipped.'
  },
  {
    id: 'eda',
    name: 'Exploratory EDA',
    code: '04',
    purpose: 'Univariate distributions, descriptive statistics, and seasonal cross-correlations.',
    inputs: 'Cleaned observational time series',
    outputs: 'Sample moments (Mean: 183.65, Median: 170.0), monthly aggregation tables',
    details: 'Identified strong monsoon washout (July mean: 63.63) and winter stagnation (Nov mean: 294.51).'
  },
  {
    id: 'anomaly',
    name: 'Anomaly Detection',
    code: '05',
    purpose: 'Unsupervised partitioning of multivariate pollutant coordinate outliers.',
    inputs: 'Standardized 7-dimensional pollutant feature space (AQI, PM2.5, PM10, NO2, SO2, CO, O3)',
    outputs: '47 flagged candidate observations (3.04% contamination rate)',
    details: 'Isolation Forest (n_estimators=100, max_samples=256) isolating rapid partition leaves.'
  },
  {
    id: 'regression',
    name: 'Meteorological Regression',
    code: '06',
    purpose: 'Quantifying linear and multivariate associations between weather parameters and AQI.',
    inputs: 'Matched daily environmental records (N = 1,545)',
    outputs: 'Pearson r (Temp vs AQI: −0.018), 80/20 chronological train/test split coefficients',
    details: 'Training: 1,236 obs; Test: 309 obs. Evaluated R², MAE, and lag autocorrelation.'
  },
  {
    id: 'stationarity',
    name: 'Stationarity Testing',
    code: '07',
    purpose: 'Testing for unit roots and seasonal integration order before forecasting.',
    inputs: 'Monthly aggregated AQI time-series level and first difference',
    outputs: 'Level ADF: −1.4497 (p=0.5582); First Difference ADF: −8.6006 (p<0.001)',
    details: 'Confirmed level series non-stationarity; first differencing successfully induces stationarity.'
  },
  {
    id: 'forecast',
    name: 'Forecast Evaluation',
    code: '08',
    purpose: 'Benchmarking seasonal exponential smoothing against naive last-value persistence.',
    inputs: '51 monthly aggregated records with chronological holdout split (80% train / 20% test)',
    outputs: 'Naive MAE: 109.650, RMSE: 133.442 vs Holt–Winters MAE: 21.742, RMSE: 30.683',
    details: 'Holt–Winters captures 12-month additive seasonality, dramatically outperforming persistence.'
  }
];

export const MethodologyPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState<PipelineStep>(PIPELINE_STEPS[0]);

  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      {/* Header */}
      <section className="border-b border-[#E5E5E5] pb-5">
        <div className="text-xs font-mono text-[#14213D]/70 uppercase tracking-wider mb-2 font-bold">
          RESEARCH METHODOLOGY / MODULE 06
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#000000]">
            Every result has a method.
          </h1>
          <p className="text-sm text-[#14213D]/80 mt-1.5 max-w-2xl leading-relaxed">
            Data provenance, mathematical algorithms, validation splits, and critical scientific limitations behind the analytical findings.
          </p>
        </div>
      </section>

      {/* 11.1 Dataset Registry */}
      <section className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5] mb-5">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-[#14213D]" />
            <h2 className="text-lg font-bold text-[#000000]">
              Dataset Provenance &amp; Registry
            </h2>
          </div>
          <a
            href="https://www.kaggle.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs text-[#14213D] hover:text-[#FCA311] font-bold"
          >
            <span>KAGGLE DATASET ARCHIVE</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {/* Air Quality Registry Card */}
          <div className="p-5 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5] space-y-3">
            <div className="flex justify-between items-center text-[#14213D] font-black border-b border-[#E5E5E5] pb-2">
              <span>AIR QUALITY TIME-SERIES</span>
              <span className="text-[#FCA311] bg-[#14213D] px-2 py-0.5 rounded text-[11px]">1,545 RECORDS</span>
            </div>
            <div className="space-y-1.5 text-[#14213D]/80">
              <div className="flex justify-between">
                <span className="font-semibold text-[#14213D]">COVERAGE:</span>
                <span className="text-[#000000] font-bold">5 AUG 2022 — 27 OCT 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#14213D]">TOTAL ATTRIBUTES:</span>
                <span className="text-[#000000] font-bold">19 COLUMNS</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#14213D]">CORE METRICS:</span>
                <span className="text-[#000000] font-bold">AQI, PM2.5, PM10, NO2, SO2, CO, O3</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#14213D]">AUXILIARY:</span>
                <span className="text-[#000000]">Dust, AOD (Aerosol Optical Depth)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#14213D]">PROVENANCE:</span>
                <span className="text-[#000000]">Kaggle Smart-City Repository</span>
              </div>
            </div>
          </div>

          {/* Weather Registry Card */}
          <div className="p-5 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5] space-y-3">
            <div className="flex justify-between items-center text-[#14213D] font-black border-b border-[#E5E5E5] pb-2">
              <span>METEOROLOGICAL TIME-SERIES</span>
              <span className="text-[#FCA311] bg-[#14213D] px-2 py-0.5 rounded text-[11px]">2,492 RECORDS</span>
            </div>
            <div className="space-y-1.5 text-[#14213D]/80">
              <div className="flex justify-between">
                <span className="font-semibold text-[#14213D]">COVERAGE:</span>
                <span className="text-[#000000] font-bold">1 JAN 2020 — 27 OCT 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#14213D]">TOTAL ATTRIBUTES:</span>
                <span className="text-[#000000] font-bold">14 COLUMNS</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#14213D]">CORE METRICS:</span>
                <span className="text-[#000000] font-bold">Mean/Min/Max Temp, Humidity, Precip</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#14213D]">DYNAMICS:</span>
                <span className="text-[#000000]">Max Wind Velocity, Shortwave Radiation</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#14213D]">MATCHED RECORDS:</span>
                <span className="text-[#000000] font-bold">1,545 days synchronized with AQI</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-[#F4F6F9] rounded-md border border-[#E5E5E5] text-xs text-[#14213D]/80 leading-relaxed font-mono">
          <span className="font-bold text-[#000000]">Notice:</span> Data originates from historical research archives curated on Kaggle. It was not queried live from official government monitoring APIs. Analysis is exploratory and retrospective.
        </div>
      </section>

      {/* 11.2 Interactive Pipeline Visualization */}
      <section className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-6 shadow-xs">
        <div className="pb-3 border-b border-[#E5E5E5] mb-5">
          <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase font-bold">
            END-TO-END ANALYTICAL ARCHITECTURE
          </div>
          <h2 className="text-lg font-bold text-[#000000]">
            Data Science Pipeline Flow
          </h2>
        </div>

        {/* Pipeline Navigation Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
          {PIPELINE_STEPS.map((step) => {
            const isSelected = activeStep.id === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step)}
                className={`p-2.5 rounded-md text-left transition-all border font-mono text-xs ${
                  isSelected
                    ? 'bg-[#14213D] text-[#FFFFFF] border-[#14213D] shadow-sm'
                    : 'bg-[#F4F6F9] text-[#14213D] border-[#E5E5E5] hover:bg-[#E5E5E5]'
                }`}
              >
                <div className={`text-[9px] font-bold mb-1 ${isSelected ? 'text-[#FCA311]' : 'text-[#14213D]/60'}`}>{step.code}</div>
                <div className="font-bold text-[11px] truncate">{step.name}</div>
              </button>
            );
          })}
        </div>

        {/* Active Node Detail Dossier */}
        <div className="p-5 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5] font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5] mb-3">
            <span className="font-bold text-sm text-[#14213D]">
              STAGE {activeStep.code} · {activeStep.name.toUpperCase()}
            </span>
            <span className="text-[10px] text-[#14213D]/60 font-semibold">NODE METADATA</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-[#14213D]/70 block uppercase mb-1 font-bold">PURPOSE</span>
              <p className="text-[#000000] font-sans text-xs leading-relaxed">{activeStep.purpose}</p>
            </div>
            <div>
              <span className="text-[10px] text-[#14213D]/70 block uppercase mb-1 font-bold">INPUTS / RECEPTORS</span>
              <p className="text-[#000000] font-sans text-xs leading-relaxed">{activeStep.inputs}</p>
            </div>
            <div>
              <span className="text-[10px] text-[#14213D]/70 block uppercase mb-1 font-bold">OUTPUT ARTIFACTS</span>
              <p className="text-[#000000] font-sans text-xs leading-relaxed">{activeStep.outputs}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#E5E5E5] text-[11px] text-[#14213D]/80">
            <span className="font-bold text-[#000000]">Implementation note:</span> {activeStep.details}
          </div>
        </div>
      </section>

      {/* 11.3 Mathematical Methods Cards */}
      <section className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-6 shadow-xs">
        <div className="pb-3 border-b border-[#E5E5E5] mb-5">
          <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase font-bold">
            MATHEMATICAL SPECIFICATIONS
          </div>
          <h2 className="text-lg font-bold text-[#000000]">
            Algorithms &amp; Methodological Formulations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs leading-relaxed">
          {/* Card 1 */}
          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h3 className="font-mono font-bold text-[#14213D] mb-1">PEARSON CORRELATION</h3>
            <p className="text-[#14213D]/80">
              Measures linear co-variation between meteorological drivers and AQI. Evaluated across 1,545 paired observations. Confirmed r = −0.018 for temperature.
            </p>
            <div className="mt-2 text-[10px] font-mono text-[#14213D]/70 font-semibold">LIMIT: Blind to non-linear threshold triggers.</div>
          </div>

          {/* Card 2 */}
          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h3 className="font-mono font-bold text-[#14213D] mb-1">ISOLATION FOREST</h3>
            <p className="text-[#14213D]/80">
              Unsupervised tree-based outlier detection. Isolates anomalies in short path lengths. Flagged 47 instances (3.04%) with anomalous multi-pollutant surges.
            </p>
            <div className="mt-2 text-[10px] font-mono text-[#14213D]/70 font-semibold">LIMIT: Requires empirical physical validation.</div>
          </div>

          {/* Card 3 */}
          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h3 className="font-mono font-bold text-[#14213D] mb-1">AUGMENTED DICKEY–FULLER (ADF)</h3>
            <p className="text-[#14213D]/80">
              Tests for stochastic unit roots in monthly series. Level series: ADF = −1.4497 (p = 0.5582). First difference: ADF = −8.6006 (p &lt; 0.001, stationary).
            </p>
            <div className="mt-2 text-[10px] font-mono text-[#14213D]/70 font-semibold">ROLE: Confirms differencing order I(1).</div>
          </div>

          {/* Card 4 */}
          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h3 className="font-mono font-bold text-[#14213D] mb-1">HOLT–WINTERS EXPONENTIAL SMOOTHING</h3>
            <p className="text-[#14213D]/80">
              Triple exponential smoothing capturing additive level, linear trend, and 12-month seasonal periodicity. Yielded MAE = 21.742, RMSE = 30.683 on test holdout.
            </p>
            <div className="mt-2 text-[10px] font-mono text-[#14213D]/70 font-semibold">ROLE: Benchmark seasonal forecast model.</div>
          </div>

          {/* Card 5 */}
          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h3 className="font-mono font-bold text-[#14213D] mb-1">NAIVE LAST-VALUE PERSISTENCE</h3>
            <p className="text-[#14213D]/80">
              Carries forward the most recent observation as the baseline projection. Produced MAE = 109.650, RMSE = 133.442, failing to model seasonal transitions.
            </p>
            <div className="mt-2 text-[10px] font-mono text-[#14213D]/70 font-semibold">ROLE: Minimal sanity-check baseline.</div>
          </div>

          {/* Card 6 */}
          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h3 className="font-mono font-bold text-[#14213D] mb-1">CHRONOLOGICAL 80/20 VALIDATION</h3>
            <p className="text-[#14213D]/80">
              Strict historical split (Training: 1,236 daily records / 41 months; Test: 309 records / 10 months). Avoids random shuffle leakage across time boundaries.
            </p>
            <div className="mt-2 text-[10px] font-mono text-[#14213D]/70 font-semibold">RULE: Zero lookahead bias.</div>
          </div>
        </div>
      </section>

      {/* 11.5 Scientific Limitations & Boundary Disclosures */}
      <section className="bg-[#FFFFFF] rounded-lg border-2 border-[#14213D] p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5E5] mb-4">
          <ShieldAlert size={18} className="text-[#FCA311]" />
          <h2 className="text-lg font-bold text-[#000000]">
            Methodological Boundaries &amp; Scope Limitations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#14213D]/80 leading-relaxed">
          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h4 className="font-bold text-[#000000] font-mono mb-1">1. DOMAIN SCOPE RESTRICTION</h4>
            <p>
              The current research implementation focuses exclusively on ambient air quality and meteorological context. Transport volumes, electricity grid loads, municipal waste management, and public health records are not integrated as verified live sources.
            </p>
          </div>

          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h4 className="font-bold text-[#000000] font-mono mb-1">2. NO OPERATIONAL REAL-TIME TELEMETRY</h4>
            <p>
              This is a retrospective academic research platform operating on curated historical datasets. It is not an emergency response system and does not stream live sensor telemetry.
            </p>
          </div>

          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h4 className="font-bold text-[#000000] font-mono mb-1">3. DIAGNOSTIC ANOMALY FLAGS</h4>
            <p>
              Isolation Forest flags represent statistical outliers in multivariate feature space. They must not be misconstrued as verified industrial pollution incidents without independent corroboration.
            </p>
          </div>

          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h4 className="font-bold text-[#000000] font-mono mb-1">4. CONCEPTUAL 3D MORPHOLOGY</h4>
            <p>
              The 3D terrain and particle simulations are abstract computational visualizations of atmospheric dynamics. They do not represent verified geographic elevation or plume dispersion maps.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
