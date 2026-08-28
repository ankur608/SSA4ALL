"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Wifi,
  WifiOff,
  Crosshair,
  Activity,
  Globe,
  Sliders,
  Maximize2,
  Signal,
  CheckCircle,
  Antenna,
  Layers,
  Zap,
  Target,
  X,
  Play,
  RotateCw,
  Compass,
  ArrowRight,
  TrendingUp,
  Cpu,
  FileText,
} from "lucide-react";
import { SensorStation, SpaceAsset } from "../../types/ssa";
import { calculateSensorLookAngles } from "../../utils/orbitPropagator";

interface SensorsProps {
  sensors: SensorStation[];
  assets: SpaceAsset[];
  onToggleSensorTracking: (sensorId: string) => void;
  onTaskSensor: (sensorId: string, assetId: string) => void;
  selectedAsset: SpaceAsset | null;
  theme?: "dark" | "light";
}

export const Sensors: React.FC<SensorsProps> = ({
  sensors,
  assets,
  onToggleSensorTracking,
  onTaskSensor,
  selectedAsset,
  theme = "dark",
}) => {
  const [selectedSensorId, setSelectedSensorId] = useState<string>(sensors[0]?.id || "");
  const [taskingModalSensor, setTaskingModalSensor] = useState<SensorStation | null>(null);
  const [taskingSelectedAssetId, setTaskingSelectedAssetId] = useState<string>(assets[0]?.id || "");
  const [taskingSuccessMsg, setTaskingSuccessMsg] = useState<string | null>(null);

  const activeSensor = sensors.find((s) => s.id === selectedSensorId) || sensors[0];

  const handleOpenTasking = (sensor: SensorStation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTaskingModalSensor(sensor);
    setTaskingSelectedAssetId(sensor.activeTargetId || selectedAsset?.id || assets[0]?.id || "");
    setTaskingSuccessMsg(null);
  };

  const handleConfirmTasking = () => {
    if (!taskingModalSensor) return;
    onTaskSensor(taskingModalSensor.id, taskingSelectedAssetId);
    const target = assets.find((a) => a.id === taskingSelectedAssetId);
    setTaskingSuccessMsg(`RADAR LOCK ACQUIRED ON ${target?.name || taskingSelectedAssetId}! Beam steering and Doppler tracking active.`);
    setTimeout(() => {
      setTaskingModalSensor(null);
      setTaskingSuccessMsg(null);
    }, 1500);
  };

  return (
    <div className={`orbit-panel rounded-2xl p-6 transition-all ${
      theme === "light" ? "bg-white border-purple-200 shadow-md text-purple-950" : "bg-[#140236] border-[rgba(75,20,140,0.7)] text-white"
    }`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-purple-900/60 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orbit-orange/20 border border-orbit-orange/40">
            <Radio className="w-6 h-6 text-orbit-orange glow-orange animate-pulse" />
          </div>
          <div>
            <div className="font-display text-base font-black tracking-widest uppercase flex items-center gap-2">
              <span>MULTI-MISSION RADARS & PHASED ARRAY GRAPHICAL MATRIX</span>
              <span className="text-[11px] bg-orbit-orange/20 border border-orbit-orange/50 text-orbit-orange px-2.5 py-0.5 rounded-lg font-mono font-bold">
                {sensors.filter((s) => s.isTracking).length}/{sensors.length} ARRAYS ACTIVE
              </span>
            </div>
            <div className="text-xs opacity-75 font-sans mt-0.5">
              Phased Array Radars Delivering Continuous, All-Weather Space Domain Coverage
            </div>
          </div>
        </div>
      </div>

      {/* Radar Cards Grid with Graphical Phased Array Antennas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {sensors.map((sensor) => {
          const isSelected = sensor.id === selectedSensorId;

          let lookAngles = {
            azimuthDeg: sensor.azimuthDeg,
            elevationDeg: sensor.elevationDeg,
            slantRangeKm: sensor.rangeKm * 0.75,
          };

          if (sensor.isTracking && sensor.activeTargetId) {
            const target = assets.find((a) => a.id === sensor.activeTargetId);
            if (target) {
              lookAngles = calculateSensorLookAngles(
                sensor.lat,
                sensor.lon,
                sensor.altMeters,
                target.calculatedPos.lat,
                target.calculatedPos.lon,
                target.calculatedPos.alt
              );
            }
          }

          return (
            <motion.div
              key={sensor.id}
              onClick={() => setSelectedSensorId(sensor.id)}
              whileHover={{ scale: 1.01 }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? theme === "light"
                    ? "bg-orange-50/80 border-orbit-orange shadow-lg ring-2 ring-orange-500/20"
                    : "bg-[#1f034d] border-orbit-orange shadow-orange-glow"
                  : theme === "light"
                  ? "bg-white border-purple-200 hover:border-purple-400"
                  : "bg-black/60 border-purple-950 hover:border-purple-800"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-3.5">
                <div className="flex-1">
                  <div className="font-display text-sm font-bold flex items-center gap-2 truncate">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        sensor.isTracking ? "bg-orbit-orange animate-orange-pulse" : "bg-neutral-500"
                      }`}
                    />
                    <span className="truncate">{sensor.name}</span>
                  </div>
                  <div className="text-xs opacity-75 font-sans mt-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{sensor.country}</span>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSensorTracking(sensor.id);
                  }}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    sensor.isTracking ? "bg-orbit-orange" : "bg-neutral-600"
                  }`}
                  title={sensor.isTracking ? "Standby" : "Activate Sensor Pass Loop"}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-md ring-0 transition duration-200 ease-in-out ${
                      sensor.isTracking ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Graphical Phased Array Beamforming SVG Object */}
              <div className={`p-3 rounded-xl border mb-3.5 flex items-center justify-between ${
                theme === "light" ? "bg-purple-50/50 border-purple-200" : "bg-black/80 border-purple-950"
              }`}>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-orbit-orange font-bold flex items-center gap-1">
                    <Antenna className="w-3.5 h-3.5" />
                    <span>PHASED ARRAY APERTURE</span>
                  </span>
                  <div className="grid grid-cols-4 gap-1 w-20 h-12 p-1.5 bg-[#0f0126] rounded border border-purple-900">
                    {[...Array(12)].map((_, i) => (
                      <span
                        key={i}
                        className={`rounded-full transition-all duration-300 ${
                          sensor.isTracking
                            ? (i + Math.floor(lookAngles.elevationDeg)) % 2 === 0
                              ? "bg-orbit-orange shadow-orange-glow"
                              : "bg-purple-400"
                            : "bg-neutral-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Graphical Radar Beam Vector */}
                <div className="flex-1 ml-3.5 flex flex-col items-center justify-center">
                  <svg viewBox="0 0 100 45" className="w-full h-11">
                    <path
                      d="M 10 35 L 85 10"
                      stroke={sensor.isTracking ? "#FF5B00" : "#64748B"}
                      strokeWidth="2.5"
                      strokeDasharray={sensor.isTracking ? "3 2" : "none"}
                    />
                    <circle cx="85" cy="10" r="4.5" fill={sensor.isTracking ? "#FF5B00" : "#64748B"} />
                    <text x="25" y="40" fill="#A5A6C2" fontSize="9" fontFamily="monospace">
                      AZ {lookAngles.azimuthDeg.toFixed(0)}° / EL {lookAngles.elevationDeg.toFixed(0)}°
                    </text>
                  </svg>
                </div>
              </div>

              {/* Telemetry Metrics */}
              <div className={`grid grid-cols-2 gap-x-2 gap-y-1.5 font-mono text-xs p-3 rounded-xl border mb-3.5 ${
                theme === "light" ? "bg-purple-50/50 border-purple-200" : "bg-black/60 border-purple-950"
              }`}>
                <div>
                  BAND: <span className="text-purple-300 font-bold">{sensor.frequencyGhz > 1 ? "S-Band (2.9 GHz)" : "UHF (440 MHz)"}</span>
                </div>
                <div>
                  SNR:{" "}
                  <span className={sensor.isTracking ? "text-orbit-orange font-bold" : "opacity-60"}>
                    {sensor.isTracking ? `${sensor.snrDb} dB` : "OFFLINE"}
                  </span>
                </div>
                <div>
                  RANGE: <span>{sensor.rangeKm.toLocaleString()} km</span>
                </div>
                <div>
                  LINK MARGIN:{" "}
                  <span className="text-orbit-orange font-bold">{sensor.isTracking ? `+${sensor.linkBudgetDb} dB` : "--"}</span>
                </div>
              </div>

              {/* Active Target Lock & Functional Task Button */}
              <div className="flex items-center justify-between text-xs font-sans">
                <div className="truncate flex-1 font-mono text-xs">
                  PASS LOCK:{" "}
                  <span className={sensor.isTracking && sensor.activeTargetName ? "text-orbit-orange font-bold font-sans" : "opacity-60"}>
                    {sensor.isTracking && sensor.activeTargetName ? sensor.activeTargetName : "AUTONOMOUS SCAN"}
                  </span>
                </div>

                <button
                  onClick={(e) => handleOpenTasking(sensor, e)}
                  className="ml-2 px-3.5 py-1.5 rounded-xl bg-orbit-orange text-white hover:bg-orbit-orangeBright font-bold transition-all flex items-center gap-1.5 text-xs shadow-orange-glow"
                  title="Task Radar Array on Target"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>TASK</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Sensor Deep Analytics Panel */}
      {activeSensor && (
        <div className={`border rounded-2xl p-5 font-mono text-xs space-y-4 ${
          theme === "light" ? "bg-purple-50/50 border-purple-200" : "bg-black/90 border-purple-950"
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-900/60">
            <div className="flex items-center gap-2.5">
              <Antenna className="w-5 h-5 text-orbit-orange" />
              <span className="font-display text-sm font-bold uppercase tracking-wider">{activeSensor.name} // DEEP RADAR ANALYTICS</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenTasking(activeSensor)}
                className="px-3 py-1 bg-orbit-orange text-white rounded-lg font-bold flex items-center gap-1.5 text-xs shadow-orange-glow"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>TASK THIS ARRAY</span>
              </button>
              <div className="text-xs opacity-80 font-sans">
                <span>LAT/LON: {activeSensor.lat.toFixed(4)}°, {activeSensor.lon.toFixed(4)}°</span>
              </div>
            </div>
          </div>

          {/* Deep Analytics Grid: Radar Range Equation, Doppler Shift & Phased Array Tile Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Radar Equation & Link Budget */}
            <div className="p-4 bg-black/60 rounded-xl border border-purple-900 space-y-2">
              <div className="text-[11px] font-display font-bold text-orbit-orange uppercase flex items-center justify-between">
                <span>RADAR RANGE EQUATION</span>
                <Signal className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] opacity-80 leading-relaxed font-sans text-slate-300">
                {"SNR = (P_t · G² · λ² · σ) / ((4π)³ · k · T₀ · B · F · R⁴ · L)"}
              </div>
              <div className="pt-1 text-xs opacity-90 space-y-1">
                <div>PEAK TX POWER: <strong className="text-white">2.5 MW</strong></div>
                <div>ANTENNA GAIN: <strong className="text-white">46.2 dBi</strong></div>
                <div>NOISE FIGURE (F): <strong className="text-purple-300">2.8 dB</strong></div>
                <div>CALCULATED SNR: <strong className="text-orbit-orange font-bold">+{activeSensor.snrDb} dB</strong></div>
              </div>
            </div>

            {/* 2. Doppler Velocity Profiler */}
            <div className="p-4 bg-black/60 rounded-xl border border-purple-900 space-y-2">
              <div className="text-[11px] font-display font-bold text-orbit-orange uppercase flex items-center justify-between">
                <span>DOPPLER VELOCITY PROFILER</span>
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] opacity-80 leading-relaxed font-sans text-slate-300">
                {"Δf = (2 · v_r · f₀) / c  (f₀ = 2.9 GHz)"}
              </div>
              <div className="pt-1 text-xs opacity-90 space-y-1">
                <div>LOS VELOCITY (v_r): <strong className="text-emerald-400 font-bold">± 7.42 km/s</strong></div>
                <div>DOPPLER SHIFT (Δf): <strong className="text-white">+143.4 kHz</strong></div>
                <div>RANGE ACCURACY: <strong className="text-white">&lt; 1.2 meters</strong></div>
                <div>CHIRP BANDWIDTH: <strong className="text-purple-300">50.0 MHz</strong></div>
              </div>
            </div>

            {/* 3. Phased Array T/R Modules Tile Matrix */}
            <div className="p-4 bg-black/60 rounded-xl border border-purple-900 space-y-2">
              <div className="text-[11px] font-display font-bold text-orbit-orange uppercase flex items-center justify-between">
                <span>T/R ELEMENT STATUS</span>
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] opacity-80 font-sans">
                Active Solid-State GaN Transmit/Receive Modules
              </div>
              <div className="pt-1 text-xs opacity-90 space-y-1">
                <div>ACTIVE ELEMENTS: <strong className="text-emerald-400 font-bold">128 / 128 (100%)</strong></div>
                <div>BEAM STEERING SPEED: <strong className="text-white">&lt; 2.0 ms</strong></div>
                <div>PHASE RESOLUTION: <strong className="text-white">6-Bit (5.625°)</strong></div>
                <div>POLARIZATION: <strong className="text-purple-300">Dual Circular (RHCP/LHCP)</strong></div>
              </div>
            </div>

            {/* 4. Upcoming Pass Window & Horizon */}
            <div className="p-4 bg-black/60 rounded-xl border border-purple-900 space-y-2">
              <div className="text-[11px] font-display font-bold text-orbit-orange uppercase flex items-center justify-between">
                <span>PASS HORIZON WINDOW</span>
                <Compass className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] opacity-80 font-sans">
                Current Scheduled Tracking Ephemeris
              </div>
              <div className="pt-1 text-xs opacity-90 space-y-1">
                <div>AOS (ACQUISITION): <strong className="text-white">T+04m 12s</strong></div>
                <div>MAX ELEVATION: <strong className="text-orbit-orange font-bold">78.4°</strong></div>
                <div>LOS (LOSS): <strong className="text-white">T+14m 38s</strong></div>
                <div>PASS DURATION: <strong className="text-purple-300">626 seconds</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Radar Tasking & Analytics Modal */}
      <AnimatePresence>
        {taskingModalSensor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className={`max-w-2xl w-full rounded-3xl p-6 border shadow-2xl space-y-5 ${
                theme === "light"
                  ? "bg-white border-purple-200 text-purple-950"
                  : "bg-[#16023b] border-purple-700 text-white"
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orbit-orange/20 border border-orbit-orange/40">
                    <Crosshair className="w-6 h-6 text-orbit-orange animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-black uppercase text-orbit-orange">
                      TASK RADAR ARRAY // {taskingModalSensor.name}
                    </h3>
                    <p className="text-xs opacity-75 font-sans">
                      Target Assignment, Phased-Array Beam Steering & Radar Look Angles
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTaskingModalSensor(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Target Space Asset Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase opacity-85">
                  SELECT TARGET ORBITAL ASSET:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {assets.map((asset) => {
                    const isSelected = taskingSelectedAssetId === asset.id;
                    const isDebris = asset.type === "Debris" || asset.type === "Rocket Body";
                    return (
                      <div
                        key={asset.id}
                        onClick={() => setTaskingSelectedAssetId(asset.id)}
                        className={`p-3 rounded-xl border cursor-pointer font-mono text-xs transition-all ${
                          isSelected
                            ? "bg-orbit-orange/20 border-orbit-orange shadow-orange-glow"
                            : "bg-black/50 border-purple-950 hover:border-purple-800"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className={isSelected ? "text-orbit-orange font-sans" : "text-slate-200 font-sans"}>
                            {asset.name}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            isDebris ? "bg-orbit-crimson/20 text-orbit-crimson" : "bg-purple-900/60 text-purple-200"
                          }`}>
                            {asset.type}
                          </span>
                        </div>
                        <div className="text-[11px] opacity-75 mt-1 flex justify-between">
                          <span>NORAD: {asset.noradId}</span>
                          <span>ALT: {asset.calculatedPos.alt.toFixed(0)} km</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Computed Beam Steering Parameters */}
              {(() => {
                const target = assets.find((a) => a.id === taskingSelectedAssetId);
                const angles = target
                  ? calculateSensorLookAngles(
                      taskingModalSensor.lat,
                      taskingModalSensor.lon,
                      taskingModalSensor.altMeters,
                      target.calculatedPos.lat,
                      target.calculatedPos.lon,
                      target.calculatedPos.alt
                    )
                  : { azimuthDeg: 0, elevationDeg: 0, slantRangeKm: 0 };

                return (
                  <div className="p-4 bg-black/70 rounded-2xl border border-purple-900 grid grid-cols-3 gap-3 font-mono text-xs">
                    <div>
                      <div className="text-[10px] opacity-60 font-sans">AZIMUTH</div>
                      <div className="text-base font-bold text-orbit-orange mt-0.5">{angles.azimuthDeg.toFixed(1)}°</div>
                    </div>
                    <div>
                      <div className="text-[10px] opacity-60 font-sans">ELEVATION</div>
                      <div className="text-base font-bold text-orbit-orange mt-0.5">{angles.elevationDeg.toFixed(1)}°</div>
                    </div>
                    <div>
                      <div className="text-[10px] opacity-60 font-sans">SLANT RANGE</div>
                      <div className="text-base font-bold text-white mt-0.5">{angles.slantRangeKm.toFixed(1)} km</div>
                    </div>
                  </div>
                );
              })()}

              {/* Success Notification */}
              {taskingSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{taskingSuccessMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setTaskingModalSensor(null)}
                  className="px-4 py-2 rounded-xl border border-purple-800 text-xs font-bold font-sans hover:bg-white/10 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmTasking}
                  className="px-5 py-2.5 rounded-xl bg-orbit-orange text-white hover:bg-orbit-orangeBright font-bold font-sans text-xs flex items-center gap-2 shadow-orange-glow transition-all"
                >
                  <Crosshair className="w-4 h-4" />
                  <span>CONFIRM RADAR TASKING</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
