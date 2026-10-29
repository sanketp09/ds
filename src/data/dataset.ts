import rawData from './generated/mumbaiData.json';
import { AirQualityRecord, WeatherRecord, MatchedEnvironmentalRecord } from './types';

export const AIR_QUALITY_DATA: AirQualityRecord[] = rawData.airQuality as AirQualityRecord[];
export const WEATHER_DATA: WeatherRecord[] = rawData.weather as WeatherRecord[];

export const DATASET_METADATA = rawData.metadata;

// Index weather data by date for O(1) matched lookup
const weatherByDate = new Map<string, WeatherRecord>();
for (const w of WEATHER_DATA) {
  weatherByDate.set(w.date, w);
}

// Generate matched observations (all 1545 AQI records joined with corresponding weather)
export const MATCHED_ENVIRONMENTAL_DATA: MatchedEnvironmentalRecord[] = AIR_QUALITY_DATA.map(aqi => ({
  ...aqi,
  weather: weatherByDate.get(aqi.date)
}));

// Highlighted anomaly from the notebook: 13 March 2023
export const NOTEBOOK_ANOMALY_CASE = AIR_QUALITY_DATA.find(r => r.date === '2023-03-13') || {
  date: '2023-03-13',
  aqi: 423,
  pm25: 279.78,
  pm10: 403.34,
  no2: 116.25,
  so2: 144.52,
  co: 2912.38,
  o3: 715.88,
  dust: 312.4,
  aod: 1.72,
  category: 'Severe' as const,
  isAnomaly: true
};

export const FLAGGED_ANOMALIES = AIR_QUALITY_DATA.filter(r => r.isAnomaly);
