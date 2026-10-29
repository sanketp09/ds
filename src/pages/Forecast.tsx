import React, { useState, useMemo } from 'react';
import { 
  getMonthlyForecastSeries, 
  NOTEBOOK_ADF_RESULTS 
} from '../data/forecasting';
import { ForecastingComparisonChart } from '../components/charts/ForecastingComparisonChart';
import { ForecastMorph } from '../visualizations/ForecastMorph';
import { Info } from 'lucide-react';

export const ForecastPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<'Holt-Winters' | 'Naive' | 'Both'>('Holt-Winters');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  const series = useMemo(() => getMonthlyForecastSeries(), []);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <section className="border-b border-[#E5E5E5] pb-5">
        <div className="text-xs font-mono text-[#14213D]/70 uppercase tracking-wider mb-2 font-bold">
          FORECASTING LAB / MODULE 05
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#000000]">
              What the historical pattern suggests.
            </h1>
            <p className="text-sm text-[#14213D]/80 mt-1.5 max-w-2xl leading-relaxed">
              Compare a naive last-value baseline with Holt–Winters exponential smoothing on chronological holdout records.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-md border border-[#E5E5E5] text-xs font-mono self-start md:self-auto shadow-xs">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 rounded transition-all font-semibold ${
                viewMode === '2d' ? 'bg-[#14213D] text-[#FFFFFF]' : 'text-[#14213D] hover:bg-[#E5E5E5]'
              }`}
            >
              2D ANALYTICAL CHART
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded transition-all font-semibold ${
                viewMode === '3d' ? 'bg-[#14213D] text-[#FFFFFF]' : 'text-[#14213D] hover:bg-[#E5E5E5]'
              }`}
            >
              3D TIME-SERIES MORPH
            </button>
          </div>
        </div>
      </section>

      {/* 10.1 & 10.2 Primary Visualization Surface */}
      <section>
        {viewMode === '2d' ? (
          <ForecastingComparisonChart
            series={series}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        ) : (
          <ForecastMorph
            series={series}
            selectedModel={selectedModel === 'Both' ? 'Holt-Winters' : selectedModel}
          />
        )}
      </section>

      {/* 10.5 Stationarity Diagnostics (ADF Test Results) */}
      <section className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5] mb-4">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase font-bold">
              TIME-SERIES INTEGRATION &amp; UNIT ROOT TESTS
            </div>
            <h2 className="text-lg font-bold text-[#000000]">
              Augmented Dickey–Fuller (ADF) Stationarity Analysis
            </h2>
          </div>
          <span className="font-mono text-xs text-[#14213D] bg-[#E5E5E5] px-2.5 py-1 rounded-md font-bold">
            NULL HYPOTHESIS H0: UNIT ROOT PRESENT (NON-STATIONARY)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {NOTEBOOK_ADF_RESULTS.map((adf) => {
            const isStationary = adf.pValue < 0.05;
            return (
              <div 
                key={adf.series} 
                className={`p-4 rounded-lg border font-mono ${
                  isStationary 
                    ? 'bg-[#14213D] text-[#FFFFFF] border-[#14213D]' 
                    : 'bg-[#F4F6F9] text-[#000000] border-[#E5E5E5]'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold ${isStationary ? 'text-[#FFFFFF]' : 'text-[#000000]'}`}>{adf.series}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isStationary ? 'bg-[#FCA311] text-[#14213D]' : 'bg-[#E5E5E5] text-[#14213D]'
                  }`}>
                    {isStationary ? 'STATIONARY (p < 0.05)' : 'NON-STATIONARY (p > 0.05)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-3 text-xs">
                  <div>
                    <span className={`text-[10px] block font-semibold ${isStationary ? 'text-[#E5E5E5]' : 'text-[#14213D]/60'}`}>ADF TEST STATISTIC</span>
                    <span className="text-lg font-bold">{adf.adfStatistic.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className={`text-[10px] block font-semibold ${isStationary ? 'text-[#E5E5E5]' : 'text-[#14213D]/60'}`}>p-VALUE</span>
                    <span className={`text-lg font-bold ${isStationary ? 'text-[#FCA311]' : 'text-[#14213D]'}`}>
                      {adf.pValue < 0.001 ? '< 0.001' : adf.pValue.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className={`pt-2 border-t text-[11px] leading-tight ${
                  isStationary ? 'border-[#FFFFFF]/20 text-[#E5E5E5]' : 'border-[#E5E5E5] text-[#14213D]/70'
                }`}>
                  {adf.conclusion}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3.5 bg-[#F4F6F9] rounded-md border border-[#E5E5E5] text-xs text-[#14213D]/80 flex items-start gap-2">
          <Info size={14} className="text-[#FCA311] shrink-0 mt-0.5" />
          <p>
            <span className="font-bold text-[#000000]">Interpretation:</span> The level series contains non-stationary seasonal cycles. First-differencing successfully achieves stationarity (p &lt; 0.001), validating the mathematical foundation for exponential smoothing and autoregressive transformations. First differencing does not guarantee accurate forecasting on unobserved regimes.
          </p>
        </div>
      </section>

      {/* 10.6 Error Analysis and Holdout Limitations */}
      <section className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-6 shadow-xs">
        <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase mb-1 font-bold">
          EVALUATION RIGOR &amp; METHODOLOGICAL LIMITS
        </div>
        <h2 className="text-xl font-display font-bold text-[#000000] mb-4">
          Error Metric Comparison &amp; Validation Constraints
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-[#14213D]/80 leading-relaxed">
          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h4 className="font-bold text-[#000000] font-mono mb-1.5">MEAN ABSOLUTE ERROR (MAE)</h4>
            <p>
              Measures the average magnitude of absolute residuals. Holt–Winters achieved <span className="font-bold text-[#14213D] bg-[#FCA311]/25 px-1 rounded">21.742 AQI</span> compared to <span className="font-bold text-[#14213D] bg-[#E5E5E5] px-1 rounded">109.650 AQI</span> for the naive baseline, demonstrating consistent seasonal alignment.
            </p>
          </div>

          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h4 className="font-bold text-[#000000] font-mono mb-1.5">ROOT MEAN SQUARED ERROR (RMSE)</h4>
            <p>
              Penalizes large outlier misses heavily due to squaring. Holt–Winters produced <span className="font-bold text-[#14213D] bg-[#FCA311]/25 px-1 rounded">30.683</span> vs. <span className="font-bold text-[#14213D] bg-[#E5E5E5] px-1 rounded">133.442</span>, confirming that seasonal modeling dampens extreme transitional errors.
            </p>
          </div>

          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <h4 className="font-bold text-[#000000] font-mono mb-1.5">HOLDOUT LIMITATIONS</h4>
            <p>
              Evaluation is performed on a single chronological holdout split (80/20). While temporal leakage was strictly avoided, rolling-origin cross-validation would provide stronger statistical confidence across shifting climatological boundaries.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
