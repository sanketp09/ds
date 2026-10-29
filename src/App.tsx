import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './pages/Overview';
import { AirQualityPage } from './pages/AirQuality';
import { WeatherPage } from './pages/Weather';
import { AnomaliesPage } from './pages/Anomalies';
import { ForecastPage } from './pages/Forecast';
import { MethodologyPage } from './pages/Methodology';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/air-quality" element={<AirQualityPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/anomalies" element={<AnomaliesPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
