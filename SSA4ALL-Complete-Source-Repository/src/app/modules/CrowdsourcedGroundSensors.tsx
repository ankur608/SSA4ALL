"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Wifi,
  Eye,
  Activity,
  Globe,
  Antenna,
  Sliders,
  Terminal,
  Play,
  Pause,
  Download,
  Filter,
  CheckCircle2,
  Sparkles,
  Zap,
  Volume2,
  Compass,
  Cpu,
  Layers,
} from "lucide-react";
import { TinyGSPacket, SatNOGSObservation, MASCARADetection } from "../../types/ssa";
import {
  INITIAL_TINYGS_PACKETS,
  INITIAL_SATNOGS_OBSERVATIONS,
  INITIAL_MASCARA_DETECTIONS,
} from "../../data/mockAssets";

interface CrowdsourcedGroundSensorsProps {
  theme?: "dark" | "light";
}

export const CrowdsourcedGroundSensors: React.FC<CrowdsourcedGroundSensorsProps> = ({
  theme = "dark",
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"TINYGS" | "SATNOGS" | "MASCARA">("TINYGS");
  const [tinyGSPackets, setTinyGSPackets] = useState<TinyGSPacket[]>(INITIAL_TINYGS_PACKETS);
  const [satnogsObs, setSatnogsObs] = useState<SatNOGSObservation[]>(INITIAL_SATNOGS_OBSERVATIONS);
  const [mascaraDetections, setMascaraDetections] = useState<MASCARADetection[]>(INITIAL_MASCARA_DETECTIONS);
  const [selectedTinyGSPacket, setSelectedTinyGSPacket] = useState<TinyGSPacket>(INITIAL_TINYGS_PACKETS[0]);
  const [selectedSatnogsObs, setSelectedSatnogsObs] = useState<SatNOGSObservation>(INITIAL_SATNOGS_OBSERVATIONS[0]);
  const [selectedMascaraDet, setSelectedMascaraDet] = useState<MASCARADetection>(INITIAL_MASCARA_DETECTIONS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Real-time simulated stream for TinyGS LoRa frames
  useEffect(() => {
    const interval = setInterval(() => {
      const satellites = [
        { name: "FOSSASAT-1B", norad: 44420, freq: 436.7 },
        { name: "NORBI-CubeSat", norad: 47960, freq: 436.25 },
        { name: "GRBAlpha (Astrophysics)", norad: 48820, freq: 437.025 },
        { name: "HISE-1 LEO", norad: 51240, freq: 436.85 },
      ];
      const stations = [
        { id: "GS-BERLIN-04", name: "Berlin-LoRa-Hub #301", lat: 52.52, lon: 13.405 },
        { id: "GS-AUSTIN-12", name: "Texas-Space-LoRa #78", lat: 30.2672, lon: -97.7431 },
        { id: "GS-SYDNEY-02", name: "Sydney-OBC-Station #41", lat: -33.8688, lon: 151.2093 },
      ];

      const sat = satellites[Math.floor(Math.random() * satellites.length)];
      const stn = stations[Math.floor(Math.random() * stations.length)];

      const newPkt: TinyGSPacket = {
        id: `TGS-PKT-${Math.floor(1000 + Math.random() * 9000)}`,
        stationId: stn.id,
        stationName: stn.name,
        stationLat: stn.lat,
        stationLon: stn.lon,
        satelliteNorad: sat.norad,
        satelliteName: sat.name,
        frequencyMhz: sat.freq,
        rssi: Math.floor(-124 + Math.random() * 22),
        snr: parseFloat((4.5 + Math.random() * 9.5).toFixed(1)),
        spreadingFactor: `SF${Math.floor(7 + Math.random() * 5)}`,
        bandwidthKhz: 125,
        crcStatus: "VALID",
        receivedAt: new Date().toISOString(),
        decodedTelemetry: {
          batteryVoltageV: parseFloat((3.8 + Math.random() * 0.4).toFixed(2)),
          solarPanelCurrentMa: parseFloat((250 + Math.random() * 200).toFixed(1)),
          obcTemperatureC: parseFloat((12 + Math.random() * 15).toFixed(1)),
          gyroRatesDegS: [
            parseFloat((Math.random() * 0.1 - 0.05).toFixed(2)),
            parseFloat((Math.random() * 0.1 - 0.05).toFixed(2)),
            parseFloat((Math.random() * 0.1 - 0.05).toFixed(2)),
          ],
          magnetometerUt: [
            parseFloat((15 + Math.random() * 20).toFixed(1)),
            parseFloat((-10 - Math.random() * 15).toFixed(1)),
            parseFloat((35 + Math.random() * 25).toFixed(1)),
          ],
          resetCount: Math.floor(Math.random() * 4),
        },
      };

      setTinyGSPackets((prev) => [newPkt, ...prev.slice(0, 19)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`orbit-panel rounded-3xl p-6 transition-all ${
        theme === "light"
          ? "bg-white border-purple-200 shadow-md text-purple-950"
          : "bg-[#140236] border-[rgba(75,20,140,0.7)] text-white"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-purple-900/60 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-orbit-orange/20 border border-orbit-orange/40">
            <Radio className="w-6 h-6 text-orbit-orange glow-orange animate-pulse" />
          </div>
          <div>
            <div className="font-display text-base font-black tracking-widest uppercase flex items-center gap-2">
              <span>CROWDSOURCED GROUND STATIONS & ALL-SKY TELESCOPES</span>
              <span className="text-[10px] bg-orbit-orange/20 border border-orbit-orange/50 text-orbit-orange px-2.5 py-0.5 rounded-lg font-mono font-bold">
                OPEN SSA ECOSYSTEM
              </span>
            </div>
            <div className="text-xs opacity-75 font-sans mt-0.5">
              Live Ingestion from TinyGS LoRa Network, SatNOGS SDR Array & MASCARA All-Sky Optical Astrometry
            </div>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex items-center gap-2 font-sans text-xs">
          <button
            onClick={() => setActiveSubTab("TINYGS")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "TINYGS"
                ? "bg-orbit-orange text-white shadow-orange-glow"
                : "bg-black/40 border border-purple-900 text-slate-300 hover:text-white"
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>TinyGS (LoRa)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("SATNOGS")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "SATNOGS"
                ? "bg-orbit-orange text-white shadow-orange-glow"
                : "bg-black/40 border border-purple-900 text-slate-300 hover:text-white"
            }`}
          >
            <Antenna className="w-3.5 h-3.5" />
            <span>SatNOGS (SDR)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("MASCARA")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "MASCARA"
                ? "bg-purple-600 text-white shadow-duke-glow font-black"
                : "bg-black/40 border border-purple-900 text-slate-300 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>MASCARA (Optical)</span>
          </button>
        </div>
      </div>

      {/* 1. TinyGS LoRa Ground Station Sub-Tab */}
      {activeSubTab === "TINYGS" && (
        <div className="space-y-6">
          {/* Network Banner */}
          <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
            theme === "light" ? "bg-purple-50/50 border-purple-200" : "bg-black/80 border-purple-950"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-orbit-orange animate-orange-pulse" />
              <div className="font-mono text-xs">
                GLOBAL LORA NETWORK: <span className="text-orbit-orange font-bold">2,148 STATIONS ONLINE</span> (UHF 433/868/915 MHz)
              </div>
            </div>
            <div className="flex items-center gap-4 font-mono text-xs opacity-80">
              <span>ACTIVE SATELLITES: <strong>48 CubeSats</strong></span>
              <span>DECODED PACKETS (24H): <strong className="text-orbit-orange">184,210</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Live Packet Ingestion Feed */}
            <div className="lg:col-span-6 space-y-3">
              <div className="font-display text-xs font-bold text-orbit-orange uppercase tracking-wider flex items-center justify-between">
                <span>LIVE DEMODULATED LORA FRAMES</span>
                <span className="text-[10px] font-mono opacity-70">AUTO-INGESTION STREAM</span>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {tinyGSPackets.map((pkt) => {
                    const isSelected = selectedTinyGSPacket.id === pkt.id;
                    return (
                      <motion.div
                        key={pkt.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => setSelectedTinyGSPacket(pkt)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#1f034d] border-orbit-orange shadow-orange-glow"
                            : theme === "light"
                            ? "bg-white border-purple-200 hover:border-purple-300"
                            : "bg-black/60 border-purple-950 hover:border-purple-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5 font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-orbit-orange">{pkt.satelliteName}</span>
                            <span className="opacity-40">|</span>
                            <span className="text-slate-300">{pkt.stationName}</span>
                          </div>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                            CRC OK
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-2 font-mono text-[11px] opacity-80 mt-2">
                          <div>FREQ: <span className="text-purple-300">{pkt.frequencyMhz} MHz</span></div>
                          <div>RSSI: <span className="text-orbit-orange">{pkt.rssi} dBm</span></div>
                          <div>SNR: <span className="text-emerald-400">+{pkt.snr} dB</span></div>
                          <div>SF: <span className="text-white">{pkt.spreadingFactor}</span></div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Decoded Satellite Telemetry Payload Viewer */}
            <div className={`lg:col-span-6 p-5 rounded-3xl border font-mono text-xs space-y-4 ${
              theme === "light" ? "bg-purple-50/50 border-purple-200" : "bg-black/90 border-purple-950"
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-orbit-orange" />
                  <span className="font-display font-bold uppercase">{selectedTinyGSPacket.satelliteName} // DECODED TELEMETRY</span>
                </div>
                <span className="text-[11px] opacity-70">NORAD {selectedTinyGSPacket.satelliteNorad}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-black/60 rounded-xl border border-purple-900">
                  <div className="text-[10px] opacity-60 font-sans">BATTERY BUS</div>
                  <div className="text-base font-bold text-orbit-orange mt-1">{selectedTinyGSPacket.decodedTelemetry.batteryVoltageV} V</div>
                </div>

                <div className="p-3 bg-black/60 rounded-xl border border-purple-900">
                  <div className="text-[10px] opacity-60 font-sans">SOLAR CURRENT</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">{selectedTinyGSPacket.decodedTelemetry.solarPanelCurrentMa} mA</div>
                </div>

                <div className="p-3 bg-black/60 rounded-xl border border-purple-900">
                  <div className="text-[10px] opacity-60 font-sans">OBC TEMP</div>
                  <div className="text-base font-bold text-purple-300 mt-1">{selectedTinyGSPacket.decodedTelemetry.obcTemperatureC}°C</div>
                </div>

                <div className="p-3 bg-black/60 rounded-xl border border-purple-900 col-span-2 sm:col-span-3">
                  <div className="text-[10px] opacity-60 font-sans mb-1">GYROSCOPE ANGULAR RATES (PITCH, YAW, ROLL)</div>
                  <div className="text-xs text-white">
                    X: <span className="text-orbit-orange font-bold">{selectedTinyGSPacket.decodedTelemetry.gyroRatesDegS[0]}°/s</span> | 
                    Y: <span className="text-orbit-orange font-bold">{selectedTinyGSPacket.decodedTelemetry.gyroRatesDegS[1]}°/s</span> | 
                    Z: <span className="text-orbit-orange font-bold">{selectedTinyGSPacket.decodedTelemetry.gyroRatesDegS[2]}°/s</span>
                  </div>
                </div>
              </div>

              {/* Raw JSON Payload */}
              <div className="p-3 bg-black rounded-xl border border-purple-950 text-[11px] overflow-x-auto text-slate-300">
                <pre>{JSON.stringify(selectedTinyGSPacket.decodedTelemetry, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SatNOGS Open SDR Ground Station Network Sub-Tab */}
      {activeSubTab === "SATNOGS" && (
        <div className="space-y-6">
          {/* Top Observation Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {satnogsObs.map((obs) => {
              const isSelected = selectedSatnogsObs.observationId === obs.observationId;
              return (
                <div
                  key={obs.observationId}
                  onClick={() => setSelectedSatnogsObs(obs)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#1f034d] border-orbit-orange shadow-orange-glow"
                      : theme === "light"
                      ? "bg-white border-purple-200"
                      : "bg-black/60 border-purple-950"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-bold text-xs text-orbit-orange truncate">{obs.satelliteName}</span>
                    <span className="text-[10px] bg-purple-900/60 px-2 py-0.5 rounded font-mono text-purple-200 font-bold">
                      {obs.modulation}
                    </span>
                  </div>
                  <div className="font-mono text-xs opacity-80 space-y-1">
                    <div>STATION: <strong>{obs.groundStationName}</strong> ({obs.country})</div>
                    <div>FREQ: <strong>{obs.transmitterFreqMhz} MHz</strong> | MAX EL: <strong>{obs.maxElevationDeg}°</strong></div>
                    <div>FRAMES DECODED: <strong className="text-emerald-400">{obs.framesDecoded}</strong></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Graphical Waterfall RF Spectrogram Visualizer */}
          <div className={`p-6 rounded-3xl border space-y-4 ${
            theme === "light" ? "bg-purple-50/50 border-purple-200" : "bg-black/90 border-purple-950"
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-900/60 font-mono text-xs">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-orbit-orange" />
                <span className="font-display font-bold uppercase">{selectedSatnogsObs.observationId} // WATERFALL RF SPECTROGRAM</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] opacity-80">
                <span>DOPPLER: <strong>+{selectedSatnogsObs.dopplerShiftKhz} kHz</strong></span>
                <span>RECEIVER: <strong>RTL-SDR v4 / HackRF</strong></span>
              </div>
            </div>

            {/* Simulated Waterfall Canvas */}
            <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-black border border-purple-900 flex flex-col justify-between p-3">
              {/* Frequency Scale Header */}
              <div className="flex justify-between font-mono text-[10px] text-slate-400 border-b border-purple-900/60 pb-1">
                <span>{(selectedSatnogsObs.transmitterFreqMhz - 0.05).toFixed(3)} MHz</span>
                <span className="text-orbit-orange font-bold">{selectedSatnogsObs.transmitterFreqMhz.toFixed(3)} MHz (CENTER)</span>
                <span>{(selectedSatnogsObs.transmitterFreqMhz + 0.05).toFixed(3)} MHz</span>
              </div>

              {/* Waterfall Color Waves Graphic */}
              <svg viewBox="0 0 600 120" className="w-full h-28 my-auto opacity-90">
                <defs>
                  <linearGradient id="waterfallGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF5B00" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#9333ea" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#0c0122" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                {/* S-curve Doppler Signal Track */}
                <path
                  d="M 120 10 Q 300 60 480 110"
                  stroke="#FF5B00"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray="4 2"
                />
                <path
                  d="M 120 10 Q 300 60 480 110"
                  stroke="#00D2FF"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Background Noise Spectral Heatmap */}
                <rect x="0" y="0" width="600" height="120" fill="url(#waterfallGrad)" opacity="0.35" />
              </svg>

              <div className="flex justify-between font-mono text-[10px] text-slate-400 border-t border-purple-900/60 pt-1">
                <span>TIME: -10m 00s</span>
                <span className="text-emerald-400 font-bold">SIGNAL ACQUIRED // DOPPLER LOCK</span>
                <span>TIME: 00m 00s (TCA)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MASCARA All-Sky Optical Telescope Astrometry Sub-Tab */}
      {activeSubTab === "MASCARA" && (
        <div className="space-y-6">
          <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
            theme === "light" ? "bg-purple-50/50 border-purple-200" : "bg-black/80 border-purple-950"
          }`}>
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-orbit-orange" />
              <div className="font-mono text-xs">
                MASCARA OBSERVATORIES: <span className="text-orbit-orange font-bold">La Palma (North)</span> & <span className="text-orbit-orange font-bold">La Silla (South)</span>
              </div>
            </div>
            <div className="font-mono text-xs opacity-80">
              ASTROMETRIC PRECISION: <strong className="text-emerald-400">&lt; 0.5 arcsec</strong> | ALL-SKY PHOTOMETRY
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {mascaraDetections.map((det) => {
              const isSelected = selectedMascaraDet.detectionId === det.detectionId;
              return (
                <div
                  key={det.detectionId}
                  onClick={() => setSelectedMascaraDet(det)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#1f034d] border-orbit-orange shadow-orange-glow"
                      : theme === "light"
                      ? "bg-white border-purple-200"
                      : "bg-black/60 border-purple-950"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-bold text-sm text-orbit-orange truncate">{det.targetName}</span>
                    <span className="text-[10px] bg-purple-900/60 px-2 py-0.5 rounded font-mono text-purple-200 font-bold">
                      Mag {det.apparentMagnitude > 0 ? `+${det.apparentMagnitude}` : det.apparentMagnitude}
                    </span>
                  </div>

                  <div className="font-mono text-xs opacity-80 space-y-1.5 mt-3">
                    <div>SITE: <strong>{det.observatorySite}</strong></div>
                    <div>RA / DEC: <strong className="text-white">{det.rightAscensionDeg.toFixed(2)}°, {det.declinationDeg.toFixed(2)}°</strong></div>
                    <div>TUMBLE PERIOD: <strong className={det.tumblePeriodSeconds > 0 ? "text-orbit-orange font-bold" : "text-emerald-400"}>
                      {det.tumblePeriodSeconds > 0 ? `${det.tumblePeriodSeconds}s (Tumbling)` : "Stable (3-Axis Stabilized)"}
                    </strong></div>
                    <div>STREAK RESIDUAL: <strong className="text-purple-300">{det.astrometricResidualArcsec}&quot;</strong></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Photometric Light Curve Visualizer */}
          <div className={`p-6 rounded-3xl border space-y-3 ${
            theme === "light" ? "bg-purple-50/50 border-purple-200" : "bg-black/90 border-purple-950"
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-purple-900/60 font-mono text-xs">
              <span className="font-display font-bold uppercase text-orbit-orange">
                {selectedMascaraDet.targetName} // OPTICAL PHOTOMETRIC LIGHT CURVE
              </span>
              <span className="text-slate-300">TUMBLE FREQUENCY: {selectedMascaraDet.tumblePeriodSeconds > 0 ? (1 / selectedMascaraDet.tumblePeriodSeconds).toFixed(4) : 0} Hz</span>
            </div>

            <div className="relative w-full h-36 bg-black rounded-2xl p-3 border border-purple-900 flex items-center justify-center">
              <svg viewBox="0 0 500 80" className="w-full h-full">
                {/* Light Curve Sine Wave reflecting solar specular glints from solar arrays */}
                <path
                  d="M 10 40 Q 60 10 110 40 T 210 40 T 310 40 T 410 40 T 490 40"
                  stroke="#FF5B00"
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle cx="110" cy="40" r="4" fill="#FF5B00" />
                <circle cx="210" cy="40" r="4" fill="#FF5B00" />
                <circle cx="310" cy="40" r="4" fill="#FF5B00" />
                <circle cx="410" cy="40" r="4" fill="#FF5B00" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
