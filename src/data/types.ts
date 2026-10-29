export type AQICategory = 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';

export interface AirQualityRecord {
  date: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  dust: number;
  aod: number;
  category: AQICategory;
  isAnomaly: boolean;
}

export interface WeatherRecord {
  date: string;
  tempMean: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  shortwaveRadiation: number;
}

export interface MatchedEnvironmentalRecord extends AirQualityRecord {
  weather?: WeatherRecord;
}

export interface MonthlyBenchmark {
  month: string;
  monthIndex: number; // 0 to 11
  meanAqi: number;
  interpretation?: string;
}

export interface AnomalyObservationDetail extends AirQualityRecord {
  contextualNote?: string;
  zScoreAqi?: number;
}

export interface CorrelationMetric {
  varX: string;
  varY: string;
  r: number;
  sampleSize: number;
  pValue?: number;
  slope?: number;
  intercept?: number;
}

export interface ForecastPoint {
  date: string;
  monthLabel: string;
  actual: number;
  naive: number | null;
  holtWinters: number | null;
  isTestPeriod: boolean;
}

export interface ForecastModelMetric {
  model: string;
  mae: number;
  rmse: number;
  description: string;
}

export interface ADFTestResult {
  series: string;
  adfStatistic: number;
  pValue: number;
  criticalValues: {
    '1%': number;
    '5%': number;
    '10%': number;
  };
  conclusion: string;
}
