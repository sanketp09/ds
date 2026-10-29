import React, { useState } from 'react';
import { WEATHER_DATA, MATCHED_ENVIRONMENTAL_DATA } from '../data/dataset';
import { WeatherScatterPlot } from '../components/charts/WeatherScatterPlot';
import { AtmosphericField } from '../visualizations/AtmosphericField';
import { 
  CloudSun, 
  Wind, 
  Droplets, 
  SunMedium, 
  Thermometer, 
  Bus,
  Layers,
  Info
} from 'lucide-react';

export const WeatherPage: React.FC = () => {
  const [active3DVar, setActive3DVar] = useState<'tempMean' | 'humidity' | 'windSpeed' | 'precipitation'>('tempMean');

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <section className="border-b border-[#E5E5E5] pb-5">
        <div className="text-xs font-mono text-[#14213D]/70 uppercase tracking-wider mb-2 font-bold">
          WEATHER &amp; METEOROLOGY / MODULE 03
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#000000]">
            Weather is context, not an explanation.
          </h1>
          <p className="text-sm text-[#14213D]/80 mt-1.5 max-w-2xl leading-relaxed">
            Exploring relationships between meteorological observations, seasonal rainfall, and AQI without implying unsupported causal effects.
          </p>
        </div>
      </section>

      {/* 8.1 Weather Overview Metric Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5] shadow-xs hover:border-[#14213D] transition-colors">
          <div className="flex items-center gap-1.5 text-xs text-[#14213D]/70 font-mono mb-1 font-semibold">
            <Thermometer size={13} className="text-[#FCA311]" />
            <span>MEAN TEMP</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#000000]">27.2 <span className="text-xs font-normal text-[#14213D]">°C</span></div>
          <div className="text-[10px] text-[#14213D]/60 mt-1 font-semibold">ANNUAL BASELINE</div>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5] shadow-xs hover:border-[#14213D] transition-colors">
          <div className="flex items-center gap-1.5 text-xs text-[#14213D]/70 font-mono mb-1 font-semibold">
            <Thermometer size={13} className="text-[#14213D]" />
            <span>RANGE</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#000000]">18° — 35° <span className="text-xs font-normal text-[#14213D]">C</span></div>
          <div className="text-[10px] text-[#14213D]/60 mt-1 font-semibold">MIN / MAX BOUNDS</div>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5] shadow-xs hover:border-[#14213D] transition-colors">
          <div className="flex items-center gap-1.5 text-xs text-[#14213D]/70 font-mono mb-1 font-semibold">
            <Droplets size={13} className="text-[#14213D]" />
            <span>HUMIDITY</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#000000]">72 <span className="text-xs font-normal text-[#14213D]">%</span></div>
          <div className="text-[10px] text-[#14213D]/60 mt-1 font-semibold">COASTAL SATURATION</div>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5] shadow-xs hover:border-[#14213D] transition-colors">
          <div className="flex items-center gap-1.5 text-xs text-[#14213D]/70 font-mono mb-1 font-semibold">
            <Droplets size={13} className="text-[#FCA311]" />
            <span>PRECIPITATION</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#000000]">2,420 <span className="text-xs font-normal text-[#14213D]">mm/yr</span></div>
          <div className="text-[10px] text-[#14213D]/60 mt-1 font-semibold">MONSOON TOTAL</div>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5] shadow-xs hover:border-[#14213D] transition-colors">
          <div className="flex items-center gap-1.5 text-xs text-[#14213D]/70 font-mono mb-1 font-semibold">
            <Wind size={13} className="text-[#14213D]" />
            <span>MAX WIND</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#000000]">18.4 <span className="text-xs font-normal text-[#14213D]">km/h</span></div>
          <div className="text-[10px] text-[#14213D]/60 mt-1 font-semibold">SEA BREEZE GUSTS</div>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5] shadow-xs hover:border-[#14213D] transition-colors">
          <div className="flex items-center gap-1.5 text-xs text-[#14213D]/70 font-mono mb-1 font-semibold">
            <SunMedium size={13} className="text-[#FCA311]" />
            <span>RADIATION</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#000000]">18.5 <span className="text-xs font-normal text-[#14213D]">MJ/m²</span></div>
          <div className="text-[10px] text-[#14213D]/60 mt-1 font-semibold">SHORTWAVE FLUX</div>
        </div>
      </section>

      {/* 8.2 & 8.3 Scatter Plot Section */}
      <section>
        <WeatherScatterPlot data={MATCHED_ENVIRONMENTAL_DATA} />
      </section>

      {/* Section 12: Rainfall Dynamics & Transport Infrastructure (Notebook Extension) */}
      <section className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase font-bold">
              NOTEBOOK SECTION 12 EXTENSION
            </div>
            <h2 className="text-base font-bold text-[#000000]">
              Monsoon Rainfall Dynamics &amp; BEST Urban Mobility Infrastructure
            </h2>
          </div>
          <span className="font-mono text-xs text-[#14213D] bg-[#E5E5E5] px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5">
            <Bus size={13} className="text-[#FCA311]" />
            SPATIAL &amp; PRECIPITATION REGIMES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <div className="text-[10px] text-[#14213D]/60 font-semibold mb-1">WETTEST CALENDAR MONTH</div>
            <div className="text-xl font-black text-[#14213D]">JULY</div>
            <p className="text-[11px] text-[#14213D]/80 font-sans mt-1">
              Highest mean daily rainfall (780 mm/month); coincides directly with lowest annual mean AQI (63.63).
            </p>
          </div>

          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <div className="text-[10px] text-[#14213D]/60 font-semibold mb-1">DRIEST CALENDAR PERIOD</div>
            <div className="text-xl font-black text-[#14213D]">JAN — FEB</div>
            <p className="text-[11px] text-[#14213D]/80 font-sans mt-1">
              Negligible precipitation (&lt; 0.2 mm/day); dry air and minimal washout prolong atmospheric stagnation.
            </p>
          </div>

          <div className="p-4 bg-[#F4F6F9] rounded-lg border border-[#E5E5E5]">
            <div className="text-[10px] text-[#14213D]/60 font-semibold mb-1">BEST BUS INFRASTRUCTURE</div>
            <div className="text-xl font-black text-[#FCA311]">MAPPED KML</div>
            <p className="text-[11px] text-[#14213D]/80 font-sans mt-1">
              Extracted spatial distribution of mapped transit stops along major north-south coastal corridors.
            </p>
          </div>
        </div>
      </section>

      {/* 8.4 3D Atmospheric Field */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase font-bold">
              3D METEOROLOGICAL DYNAMICS
            </div>
            <h3 className="text-base font-bold text-[#000000]">
              Atmospheric Force Field Simulation
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-md border border-[#E5E5E5] text-xs font-mono shadow-xs">
            <button
              onClick={() => setActive3DVar('tempMean')}
              className={`px-3 py-1 rounded transition-all font-semibold ${
                active3DVar === 'tempMean' ? 'bg-[#14213D] text-[#FFFFFF]' : 'text-[#14213D] hover:bg-[#E5E5E5]'
              }`}
            >
              TEMPERATURE
            </button>
            <button
              onClick={() => setActive3DVar('humidity')}
              className={`px-3 py-1 rounded transition-all font-semibold ${
                active3DVar === 'humidity' ? 'bg-[#14213D] text-[#FFFFFF]' : 'text-[#14213D] hover:bg-[#E5E5E5]'
              }`}
            >
              HUMIDITY
            </button>
            <button
              onClick={() => setActive3DVar('windSpeed')}
              className={`px-3 py-1 rounded transition-all font-semibold ${
                active3DVar === 'windSpeed' ? 'bg-[#14213D] text-[#FFFFFF]' : 'text-[#14213D] hover:bg-[#E5E5E5]'
              }`}
            >
              WIND
            </button>
            <button
              onClick={() => setActive3DVar('precipitation')}
              className={`px-3 py-1 rounded transition-all font-semibold ${
                active3DVar === 'precipitation' ? 'bg-[#14213D] text-[#FFFFFF]' : 'text-[#14213D] hover:bg-[#E5E5E5]'
              }`}
            >
              PRECIPITATION
            </button>
          </div>
        </div>

        <AtmosphericField activeVariable={active3DVar} />
      </section>
    </div>
  );
};
