# Mumbai Environmental Intelligence (M.E.I.)
### *“Reading the city through its atmosphere.”*
**Integrated Smart-City Analytics for Mumbai: Air Quality, Weather, Seasonal Patterns, Anomaly Detection and Forecasting**

An interactive, production-grade environmental intelligence platform and computational observatory bridging spatial data visualization, atmospheric science, and machine-learning diagnostics.

---

## 🌟 Highlights & Key Capabilities

- **Purposeful 3D Spatial Morphing**:
  - **Hero: The Breathing City** (`AtmosphericTerrain.tsx`): 4 interpolated states (`SURFACE`, `POLLUTION`, `TIME`, `OBSERVATIONS`) with real vertex elevation displacement and instanced particulate drift.
  - **3D Anomaly Latent Space** (`AnomalyPointCloud.tsx`): Interactive 3D point cloud of 1,545 observations with raycaster hover/selection, isolating the 47 flagged outliers in Electric Amber (`#FCA311`).
  - **3D Time-Series Morph** (`ForecastMorph.tsx`): 3D temporal ribbon showing historical monthly AQI transitioning across the 80/20 holdout boundary into model projections.
  - **3D Atmospheric Force Field** (`AtmosphericField.tsx`): Dynamic fluid force surface responding to selected meteorological variables.
- **Full Analytical Dashboard**:
  - **Chronological Time-Series**: 1,545 daily records (2022–2026) with optional 7-day rolling average and zoom/filter controls.
  - **Monthly Seasonality**: Exact empirical monthly mean AQI values highlighting monsoon washout (July mean: `63.63`) vs. winter stagnation (November peak: `294.51`).
  - **Pollutant Composition**: PM2.5, PM10, NO2, SO2, CO, O3, Dust mass concentration, and Aerosol Optical Depth (AOD) with dynamic histograms and box plots.
  - **Pearson Correlation Matrix**: Pairwise associations across air-quality and meteorological variables.
  - **Bivariate Weather Regressions**: AQI vs. Mean Temperature ($r = -0.018$) with dynamic regression trendlines and instant CSV export.
  - **Rainfall & Urban Mobility Dynamics (Notebook Section 12)**: Monthly precipitation trends and mapped BEST transit infrastructure.
  - **Forecasting Lab**: Naive persistence baseline ($\text{MAE}=109.650, \text{RMSE}=133.442$) vs. Holt–Winters exponential smoothing ($\text{MAE}=21.742, \text{RMSE}=30.683$) on holdout records, with Augmented Dickey–Fuller (ADF) stationarity diagnostics.
  - **Methodology & Provenance**: Interactive 8-stage data pipeline flow, mathematical formulations, and scientific boundary disclosures.

---

## 🎨 Color Palette & Visual Identity

Engineered with a high-contrast, modern palette avoiding murky brown tones:

- `#FFFFFF` — Pure White (Cards, surfaces, crisp canvas)
- `#E5E5E5` — Platinum Silver (Borders, chips, sub-panels)
- `#FCA311` — Electric Amber (Outliers, severe peaks, accent highlights)
- `#14213D` — Oxford Navy (Sidebar rail, primary lines, 3D visualizer backgrounds)
- `#000000` — Jet Black (Display titles, key metrics, high-contrast labels)

---

## 📊 Empirical Benchmarks & Dataset Verification

| Research Metric | Empirical Value | Implementation |
| :--- | :--- | :--- |
| **Total Daily AQI Records** | `1,545` | Aug 5, 2022 — Oct 27, 2026 |
| **Total Daily Weather Records** | `2,492` | Jan 1, 2020 — Oct 27, 2026 |
| **Sample Mean AQI** | `183.65` | Multi-year daily average |
| **Sample Median AQI** | `170.00` | 50th percentile (skew-resistant) |
| **Maximum Observed AQI** | `423` | Recorded on 13 March 2023 |
| **Flagged Outlier Observations** | `47 / 1,545` (3.04%) | Isolation Forest ($n=100$) |
| **Temp vs AQI Correlation** | $r = -0.018$ | 1,545 matched pairs (negligible linear effect) |
| **Holt-Winters Holdout MAE / RMSE** | `21.742` / `30.683` | Seasonal holdout evaluation |
| **Naive Baseline MAE / RMSE** | `109.650` / `133.442` | Last-value persistence benchmark |
| **ADF Test (Level Monthly AQI)** | $\text{ADF} = -1.4497, p = 0.5582$ | Non-stationary ($p > 0.05$) |
| **ADF Test (1st Differenced AQI)** | $\text{ADF} = -8.6006, p < 0.001$ | Stationary ($p < 0.001$) |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+ or v22+)
- npm (v9+)

### Installation
```bash
git clone https://github.com/sanketp09/ds.git
cd ds
npm install
```

### Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🏛️ Application Architecture

```
src/
├── app/
│   └── App.tsx               # Client router for all 6 routes
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx     # Desktop rail & mobile responsive header
│   └── charts/
│       ├── HistoricalAqiChart.tsx
│       ├── MonthlySeasonalityChart.tsx
│       ├── PollutantDistributionChart.tsx
│       ├── CorrelationHeatmap.tsx
│       ├── WeatherScatterPlot.tsx
│       ├── AnomalyTimelineChart.tsx
│       └── ForecastingComparisonChart.tsx
├── visualizations/
│   ├── AtmosphericTerrain.tsx # 3D Hero Terrain (4 morphing states)
│   ├── AnomalyPointCloud.tsx   # 3D Latent Point Cloud
│   ├── ForecastMorph.tsx       # 3D Time-Series Ribbon
│   └── AtmosphericField.tsx    # 3D Force Field Simulation
├── pages/
│   ├── Overview.tsx           # Route: /
│   ├── AirQuality.tsx         # Route: /air-quality
│   ├── Weather.tsx            # Route: /weather
│   ├── Anomalies.tsx          # Route: /anomalies
│   ├── Forecast.tsx           # Route: /forecast
│   └── Methodology.tsx        # Route: /methodology
└── data/
    ├── dataset.ts             # O(1) indexed data access
    ├── analytics.ts           # Math, moments, Pearson r, CSV download
    ├── forecasting.ts         # Holdout series & ADF test metrics
    └── types.ts               # Complete TypeScript interfaces
```

---

## 📜 Academic Attribution & Disclaimers

1. **Domain Scope**: Covers ambient air quality and meteorological boundary dynamics. Traffic volumes, electrical grid load, and healthcare admissions are not claimed as integrated live streams.
2. **Retrospective Research**: This is an analytical research platform operating on curated historical records (2020–2026). It is not an emergency response system.
3. **Diagnostic Anomaly Flags**: Isolation Forest flags represent statistical outliers in multivariate feature space, requiring physical verification against local events or emissions.
4. **Data Sources**: Curated from public research archives on Kaggle (Rohan Rao and Akshay Karthick).
