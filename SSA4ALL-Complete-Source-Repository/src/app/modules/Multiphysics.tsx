"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Thermometer,
  Sun,
  Zap,
  Gauge,
  Layers,
  Flame,
  Shield,
  Eye,
  Sliders,
  Radio,
  Cpu,
  BatteryCharging,
  Copy,
  Check,
  Compass,
  FileCode,
  Activity,
} from "lucide-react";
import { MultiphysicsTelemetry, SpaceAsset } from "../../types/ssa";

interface MultiphysicsProps {
  selectedAsset: SpaceAsset | null;
  initialTelemetry: MultiphysicsTelemetry;
  theme?: "dark" | "light";
}

export const Multiphysics: React.FC<MultiphysicsProps> = ({
  selectedAsset,
  initialTelemetry,
  theme = "dark",
}) => {
  const [solarFlux, setSolarFlux] = useState<number>(initialTelemetry.solarFluxWPerM2);
  const [radiatorDeployed, setRadiatorDeployed] = useState<boolean>(true);
  const [radiationStormActive, setRadiationStormActive] = useState<boolean>(false);
  const [copiedTle, setCopiedTle] = useState<boolean>(false);

  const fluxFactor = (solarFlux - 1361) / 400;
  const panelTemp = 72 + fluxFactor * 45 - (radiatorDeployed ? 12 : 0);
  const coreTemp = 21 + fluxFactor * 18 - (radiatorDeployed ? 6 : 0);
  const thermalGradient = Math.abs(panelTemp - (-65));
  const batterySoc = Math.max(20, Math.min(100, 91.2 - (fluxFactor > 0.5 ? 8 : 0)));
  const powerVolts = 124.0 + fluxFactor * 8.2;
  const lensOcclusion = radiationStormActive ? 18.5 : 3.8;
  const antennaGain = radiationStormActive ? 32.1 : 39.2;

  const currentAsset = selectedAsset || {
    id: "ISS-25544",
    name: "ISS (ZARYA)",
    noradId: 25544,
    tleLine1: "1 25544U 98067A   24082.71261574  .00014389  00000+0  25916-3 0  9993",
    tleLine2: "2 25544  51.6421  74.3218 0005128 124.7891 324.9123 15.49842138445124",
    inclination: 51.64,
    period: 92.9,
    apogee: 420,
    perigee: 414,
    massKg: 450000,
    radarCrossSection: 410.0,
    orbitClass: "LEO" as const,
  };

  const handleCopyTle = () => {
    const text = `${currentAsset.name}\n${currentAsset.tleLine1}\n${currentAsset.tleLine2}`;
    navigator.clipboard.writeText(text);
    setCopiedTle(true);
    setTimeout(() => setCopiedTle(false), 2000);
  };

  return (
    <div className={`orbit-panel rounded-2xl p-6 transition-all ${
      theme === "light" ? "bg-white border-purple-200 shadow-md text-purple-950" : "bg-[#140236] border-[rgba(75,20,140,0.7)] text-white"
    }`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-purple-900/60 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orbit-orange/20 border border-orbit-orange/40">
            <Cpu className="w-6 h-6 text-orbit-orange glow-orange" />
          </div>
          <div>
            <div className="font-display text-base font-black tracking-widest uppercase flex items-center gap-2">
              <span>MULTIPHYSICS, PAYLOAD SUBSYSTEMS & TLE TELEMETRY</span>
              <span className="text-[11px] bg-orbit-orange/20 border border-orbit-orange/50 text-orbit-orange px-2.5 py-0.5 rounded-lg font-mono font-bold">
                {currentAsset.name} (NORAD {currentAsset.noradId})
              </span>
            </div>
            <div className="text-xs opacity-75 font-sans mt-0.5">
              Two-Line Elements, Payload Subsystems, Thermal Gradients & Solar Radiation Flux
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-sans">
          <span
            className={`px-3.5 py-1.5 rounded-xl font-bold ${
              panelTemp > 95
                ? "bg-orbit-crimson/20 border border-orbit-crimson text-orbit-crimson animate-pulse"
                : "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
            }`}
          >
            {panelTemp > 95 ? "THERMAL ELEVATION" : "BUS NOMINAL"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* Left: Wireframe SVG Schematic & Thermal Flux */}
        <div className={`lg:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl border ${
          theme === "light" ? "bg-purple-50/50 border-purple-200" : "bg-black/90 border-purple-950"
        }`}>
          <div className="text-xs font-display mb-2.5 w-full flex justify-between font-bold tracking-wider uppercase opacity-85">
            <span>SPACECRAFT THERMAL VECTOR</span>
            <span className="text-orbit-orange font-mono font-bold">{thermalGradient.toFixed(1)}°C GRADIENT</span>
          </div>

          <div className="relative w-full h-44 flex items-center justify-center">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              <rect x="75" y="35" width="50" height="50" fill="#1c0248" stroke="#FF5B00" strokeWidth="2" rx="4" />
              <rect x="15" y="45" width="55" height="30" fill="#0e0126" stroke="#FF5B00" strokeWidth="1.5" />
              <line x1="33" y1="45" x2="33" y2="75" stroke="#FF5B00" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="51" y1="45" x2="51" y2="75" stroke="#FF5B00" strokeWidth="1" strokeDasharray="2 2" />
              <rect x="130" y="45" width="55" height="30" fill="#0e0126" stroke="#FF5B00" strokeWidth="1.5" />
              <line x1="148" y1="45" x2="148" y2="75" stroke="#FF5B00" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="166" y1="45" x2="166" y2="75" stroke="#FF5B00" strokeWidth="1" strokeDasharray="2 2" />
              <path d="M 100 35 Q 100 15 115 10" fill="none" stroke="#00D2FF" strokeWidth="2" />
              <circle cx="115" cy="10" r="3" fill="#00D2FF" />
            </svg>
          </div>

          <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-purple-900/60 font-mono text-xs text-center">
            <div>
              <span className="opacity-70 text-[10px] font-sans">PANEL SURFACE:</span>
              <p className="text-sm font-bold text-orbit-orange">{panelTemp.toFixed(1)}°C</p>
            </div>
            <div>
              <span className="opacity-70 text-[10px] font-sans">CORE AVIONICS:</span>
              <p className="text-sm font-bold text-emerald-400">{coreTemp.toFixed(1)}°C</p>
            </div>
          </div>
        </div>

        {/* Right: Interactive Environmental Flux Controls */}
        <div className={`lg:col-span-7 p-5 rounded-2xl border space-y-4 font-mono text-xs ${
          theme === "light" ? "bg-purple-50/50 border-purple-200" : "bg-black/90 border-purple-950"
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-purple-900/60">
            <span className="font-display text-xs font-bold text-orbit-orange uppercase tracking-wider">
              SOLAR RADIATION & ENVIRONMENTAL FLUX SIMULATOR
            </span>
          </div>

          {/* Solar Flux Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-sans text-xs">
              <span className="flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-orbit-orange" />
                <strong>Direct Solar Flux (W/m²)</strong>
              </span>
              <span className="font-mono text-orbit-orange font-bold">{solarFlux} W/m²</span>
            </div>
            <input
              type="range"
              min="1000"
              max="1800"
              step="10"
              value={solarFlux}
              onChange={(e) => setSolarFlux(Number(e.target.value))}
              className="w-full accent-orbit-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] opacity-60 font-mono">
              <span>Deep Umbra (1,000 W/m²)</span>
              <span>1 AU Nominal (1,361 W/m²)</span>
              <span>Solar Flare Peak (1,800 W/m²)</span>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setRadiatorDeployed(!radiatorDeployed)}
              className={`p-3 rounded-xl border flex items-center justify-between font-sans text-xs transition-all ${
                radiatorDeployed
                  ? "bg-orbit-orange/20 border-orbit-orange text-orbit-orange font-bold"
                  : "bg-black/40 border-purple-950 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Thermal Radiator Panel</span>
              </div>
              <span className="font-mono text-[10px] font-bold">{radiatorDeployed ? "DEPLOYED" : "STOWED"}</span>
            </button>

            <button
              onClick={() => setRadiationStormActive(!radiationStormActive)}
              className={`p-3 rounded-xl border flex items-center justify-between font-sans text-xs transition-all ${
                radiationStormActive
                  ? "bg-orbit-crimson/20 border-orbit-crimson text-orbit-crimson font-bold"
                  : "bg-black/40 border-purple-950 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span>Space Weather Storm (SPE)</span>
              </div>
              <span className="font-mono text-[10px] font-bold">{radiationStormActive ? "ACTIVE" : "NOMINAL"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2 NEW DETAILED SECTIONS: Payload Subsystems & Full Two-Line Element (TLE) Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Section 1: Payload Subsystems & Actuators */}
        <div className={`p-5 rounded-2xl border font-mono text-xs space-y-4 ${
          theme === "light" ? "bg-purple-50/50 border-purple-200" : "bg-black/90 border-purple-950"
        }`}>
          <div className="flex items-center justify-between pb-2.5 border-b border-purple-900/60 font-sans">
            <div className="flex items-center gap-2 font-display text-xs font-bold text-orbit-orange uppercase tracking-wider">
              <Activity className="w-4 h-4 text-orbit-orange" />
              <span>PAYLOAD SUBSYSTEMS & MISSION TELEMETRY</span>
            </div>
            <span className="text-[11px] font-mono text-purple-300 font-bold">HEALTH: 100% NOMINAL</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-black/60 rounded-xl border border-purple-900">
              <div className="text-[10px] opacity-60 font-sans">FPA CRYOGENIC TEMP</div>
              <div className="text-sm font-bold text-cyan-400 mt-1">-120.4 °C</div>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-purple-900">
              <div className="text-[10px] opacity-60 font-sans">DOWNLINK (X/Ka-BAND)</div>
              <div className="text-sm font-bold text-orbit-orange mt-1">850.0 Mbps</div>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-purple-900">
              <div className="text-[10px] opacity-60 font-sans">PROPELLANT ΔV BUDGET</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">184.2 m/s</div>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-purple-900">
              <div className="text-[10px] opacity-60 font-sans">REACTION WHEEL 1 (RW1)</div>
              <div className="text-sm font-bold text-white mt-1">+4,210 RPM</div>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-purple-900">
              <div className="text-[10px] opacity-60 font-sans">REACTION WHEEL 2 (RW2)</div>
              <div className="text-sm font-bold text-white mt-1">-3,840 RPM</div>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-purple-900">
              <div className="text-[10px] opacity-60 font-sans">CHAMBER PRESSURE</div>
              <div className="text-sm font-bold text-purple-300 mt-1">14.2 Bar</div>
            </div>
          </div>
        </div>

        {/* Section 2: Authoritative Two-Line Element (TLE) Data */}
        <div className={`p-5 rounded-2xl border font-mono text-xs space-y-3.5 ${
          theme === "light" ? "bg-purple-50/50 border-purple-200" : "bg-black/90 border-purple-950"
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-purple-900/60 font-sans">
            <div className="flex items-center gap-2 font-display text-xs font-bold text-orbit-orange uppercase tracking-wider">
              <FileCode className="w-4 h-4 text-orbit-orange" />
              <span>AUTHORITATIVE TWO-LINE ELEMENT (TLE) DATA</span>
            </div>
            <button
              onClick={handleCopyTle}
              className="px-2.5 py-1 rounded-lg bg-black border border-purple-800 text-slate-200 hover:text-white flex items-center gap-1.5 text-[11px] transition-colors"
            >
              {copiedTle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTle ? "COPIED TLE" : "COPY TLE"}</span>
            </button>
          </div>

          {/* Raw TLE Box */}
          <div className="p-3 bg-black rounded-xl border border-purple-900 text-slate-200 text-xs font-mono overflow-x-auto select-all">
            <div>{currentAsset.name}</div>
            <div className="text-orbit-orange font-bold">{currentAsset.tleLine1}</div>
            <div className="text-purple-300 font-bold">{currentAsset.tleLine2}</div>
          </div>

          {/* Decoded TLE Orbital Elements Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px] opacity-90">
            <div>INCLINATION: <strong className="text-orbit-orange">{currentAsset.inclination}°</strong></div>
            <div>ORBIT PERIOD: <strong className="text-white">{currentAsset.period} min</strong></div>
            <div>APOGEE: <strong className="text-white">{currentAsset.apogee} km</strong></div>
            <div>PERIGEE: <strong className="text-white">{currentAsset.perigee} km</strong></div>
            <div>MASS: <strong className="text-purple-300">{currentAsset.massKg.toLocaleString()} kg</strong></div>
            <div>RCS: <strong className="text-purple-300">{currentAsset.radarCrossSection} m²</strong></div>
            <div>ORBIT CLASS: <strong className="text-white">{currentAsset.orbitClass}</strong></div>
            <div>CATALOG: <strong className="text-emerald-400">NORAD {currentAsset.noradId}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
