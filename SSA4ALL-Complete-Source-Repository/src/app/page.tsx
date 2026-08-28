"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SpaceAsset,
  ConjunctionEvent,
  SensorStation,
  MultiphysicsTelemetry,
  UniversalTelemetryStreamPacket,
} from "../types/ssa";
import {
  INITIAL_SPACE_ASSETS,
  INITIAL_CONJUNCTIONS,
  INITIAL_SENSOR_STATIONS,
  INITIAL_MULTIPHYSICS,
  INITIAL_TELEMETRY_STREAM,
} from "../data/mockAssets";
import { propagateSatellite } from "../utils/orbitPropagator";
import { ThreeGlobeCanvas } from "./components/ThreeGlobeCanvas";
import { WireframeSatelliteHero } from "./components/WireframeSatelliteHero";
import { AICopilot } from "./components/AICopilot";
import { Conjunctions } from "./modules/Conjunctions";
import { Sensors } from "./modules/Sensors";
import { ExportReporting } from "./modules/ExportReporting";
import { Multiphysics } from "./modules/Multiphysics";
import { UniversalStream } from "./modules/UniversalStream";
import { CrowdsourcedGroundSensors } from "./modules/CrowdsourcedGroundSensors";
import {
  ShieldAlert,
  Globe2,
  Radio,
  Share2,
  Cpu,
  Layers,
  Activity,
  Terminal,
  Compass,
  Zap,
  Crosshair,
  Satellite,
  Maximize2,
  Radar,
  Plus,
  X,
  Target,
  ArrowRight,
  Database,
  Eye,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Sliders,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";

export default function SSATacticalDashboard() {
  const [assets, setAssets] = useState<SpaceAsset[]>(INITIAL_SPACE_ASSETS);
  const [conjunctions, setConjunctions] = useState<ConjunctionEvent[]>(INITIAL_CONJUNCTIONS);
  const [sensors, setSensors] = useState<SensorStation[]>(INITIAL_SENSOR_STATIONS);
  const [multiphysics, setMultiphysics] = useState<MultiphysicsTelemetry>(INITIAL_MULTIPHYSICS);
  const [telemetryStream, setTelemetryStream] = useState<UniversalTelemetryStreamPacket[]>(INITIAL_TELEMETRY_STREAM);

  const [selectedAsset, setSelectedAsset] = useState<SpaceAsset | null>(INITIAL_SPACE_ASSETS[0]);
  const [targetCameraAssetId, setTargetCameraAssetId] = useState<string | null>(null);
  const [focusedModule, setFocusedModule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "CONJUNCTIONS" | "SENSORS" | "CROWDSOURCED" | "MULTIPHYSICS" | "EXPORTS">("ALL");
  const [assetFilter, setAssetFilter] = useState<"ALL" | "DEBRIS" | "SATELLITES">("ALL");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [satelliteRotating, setSatelliteRotating] = useState<boolean>(true);

  // Theme State
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const workstationRef = useRef<HTMLDivElement>(null);

  // Apply Theme to DOM
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.className = theme === "light" ? "light-theme" : "dark-theme";
    }
  }, [theme]);

  // Real-Time High-Fidelity Client-Side SGP4 Orbit Propagation Loop
  useEffect(() => {
    const propagationInterval = setInterval(() => {
      const now = new Date();

      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          const updatedPos = propagateSatellite(asset.tleLine1, asset.tleLine2, now);
          return {
            ...asset,
            calculatedPos: updatedPos,
          };
        })
      );
    }, 1500);

    return () => clearInterval(propagationInterval);
  }, []);

  useEffect(() => {
    if (selectedAsset) {
      const refreshed = assets.find((a) => a.id === selectedAsset.id);
      if (refreshed) setSelectedAsset(refreshed);
    }
  }, [assets]);

  const handleExecuteManeuver = useCallback((conjunctionId: string) => {
    setConjunctions((prev) =>
      prev.map((c) => {
        if (c.id === conjunctionId) {
          return {
            ...c,
            pc: 0.0000001,
            missDistance: 6420,
            riskLevel: "NOMINAL",
            maneuverStatus: "AVOIDED",
          };
        }
        return c;
      })
    );

    const avoidedConj = conjunctions.find((c) => c.id === conjunctionId);
    if (avoidedConj) {
      const packet: UniversalTelemetryStreamPacket = {
        id: `SDA-MANEUVER-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agency: "NASA (ODPO)",
        event: "MANEUVER_CONFIRMATION",
        targetNorad: 25544,
        targetName: avoidedConj.primaryAssetName,
        dataSummary: `Collision Avoidance Trajectory verified. Pc dropped to 1.0e-7. Miss distance: 6.42km.`,
        classification: "UNCLASSIFIED",
      };
      setTelemetryStream((prev) => [packet, ...prev]);
    }
  }, [conjunctions]);

  const handleToggleSensorTracking = useCallback((sensorId: string) => {
    setSensors((prev) =>
      prev.map((s) => (s.id === sensorId ? { ...s, isTracking: !s.isTracking } : s))
    );
  }, []);

  const handleTaskSensor = useCallback((sensorId: string, assetId: string) => {
    const targetAsset = assets.find((a) => a.id === assetId);
    setSensors((prev) =>
      prev.map((s) => {
        if (s.id === sensorId) {
          return {
            ...s,
            isTracking: true,
            activeTargetId: assetId,
            activeTargetName: targetAsset?.name || assetId,
            snrDb: parseFloat((30 + Math.random() * 12).toFixed(1)),
            linkBudgetDb: parseFloat((18 + Math.random() * 8).toFixed(1)),
          };
        }
        return s;
      })
    );
  }, [assets]);

  const scrollToWorkstation = (tabName: "ALL" | "CONJUNCTIONS" | "SENSORS" | "CROWDSOURCED" | "MULTIPHYSICS" | "EXPORTS", moduleKey?: string) => {
    setActiveTab(tabName);
    if (moduleKey) setFocusedModule(moduleKey);
    workstationRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCopilotCommand = useCallback(
    (command: string, param?: string) => {
      if (command === "/layout-focus-conjunctions") {
        scrollToWorkstation("CONJUNCTIONS", "conjunctions");
      } else if (command === "/camera-target" && param) {
        setTargetCameraAssetId(param);
        const target = assets.find((a) => a.id === param);
        if (target) setSelectedAsset(target);
        scrollToWorkstation("ALL");
      } else if (command === "/filter") {
        if (param === "debris") setAssetFilter("DEBRIS");
        else if (param === "satellites") setAssetFilter("SATELLITES");
        else setAssetFilter("ALL");
      } else if (command === "/system-override-safety") {
        const crit = conjunctions.find((c) => c.riskLevel === "CRITICAL" && c.maneuverStatus !== "AVOIDED");
        if (crit) handleExecuteManeuver(crit.id);
        scrollToWorkstation("CONJUNCTIONS", "conjunctions");
      } else if (command === "/generate-report") {
        scrollToWorkstation("EXPORTS", "export");
      }
    },
    [assets, conjunctions, handleExecuteManeuver]
  );

  const filteredAssets = assets.filter((a) => {
    if (assetFilter === "DEBRIS") return a.type === "Debris" || a.type === "Rocket Body";
    if (assetFilter === "SATELLITES") return a.type === "Satellite" || a.type === "Space Station";
    return true;
  });

  const criticalConjunctionCount = conjunctions.filter(
    (c) => c.riskLevel === "CRITICAL" && c.maneuverStatus !== "AVOIDED"
  ).length;

  return (
    <div
      className={`min-h-screen ${
        theme === "light" ? "bg-[#FAF8FF] text-[#1C0248]" : "bg-black text-white"
      } relative selection:bg-orbit-orange selection:text-white`}
    >
      {/* WIDE STICKY TOP TITLE BAR (2X SCALED) */}
      <header
        className={`sticky top-0 z-50 w-full px-5 sm:px-10 py-5 sm:py-6 border-b backdrop-blur-2xl transition-all ${
          theme === "light"
            ? "bg-white/95 border-purple-200 shadow-md text-[#1C0248]"
            : "bg-black/95 border-[rgba(75,20,140,0.65)] shadow-2xl text-white"
        }`}
      >
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
          {/* Left: Menu + Button (2x Font Scale) */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 text-2xl sm:text-3xl font-sans font-black text-orbit-orange hover:opacity-85 transition-all nav-line nav-line-orange pb-1.5"
            >
              <span>Menu</span>
              {menuOpen ? <X className="w-7 h-7 sm:w-8 sm:h-8" /> : <Plus className="w-7 h-7 sm:w-8 sm:h-8" />}
            </button>
          </div>

          {/* Center: Wide Centered Wordmark (2x Font Scale) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-orbit-orange animate-orange-pulse" />
            <span className="font-display text-xl sm:text-3xl md:text-4xl font-black tracking-widest sm:tracking-ultra uppercase truncate">
              SSA4ALL // ORBITAL INTELLIGENCE LAB
            </span>
          </div>

          {/* Right: Theme Toggle (2x Font Scale) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border transition-all flex items-center gap-3 text-base sm:text-lg font-sans font-bold ${
                theme === "light"
                  ? "bg-amber-100/90 border-amber-300 text-amber-950 hover:bg-amber-200"
                  : "bg-[#1c0248] border-purple-800 text-purple-200 hover:text-white"
              }`}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Theme`}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-6 h-6 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-6 h-6 text-purple-900" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <div className="p-3 sm:p-6 lg:p-8 space-y-8 max-w-[1700px] mx-auto">
        {/* Expandable Mega Menu Modal Overlay */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`orbit-panel rounded-3xl p-6 sm:p-8 border z-50 absolute left-4 right-4 sm:left-8 sm:right-8 top-20 shadow-2xl ${
                theme === "light" ? "bg-white border-purple-200 text-purple-950" : "bg-[#140236]/95 border-purple-700/80 text-white"
              }`}
            >
              <div className="flex justify-between items-center pb-4 border-b border-purple-900/60 mb-6">
                <div className="font-display text-xs sm:text-sm font-black text-orbit-orange tracking-ultra uppercase">
                  SYSTEM DIRECTORY & MISSIONS
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {/* Col 1: Radar Network */}
                <div className="space-y-3">
                  <h4 className="font-display text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center gap-2 text-orbit-orange">
                    <Radar className="w-4 h-4" />
                    <span>Multi-Mission Radars</span>
                  </h4>
                  <ul className="space-y-2 text-xs font-sans opacity-90">
                    <li className="hover:text-orbit-orange cursor-pointer flex items-center justify-between" onClick={() => { setMenuOpen(false); scrollToWorkstation("SENSORS"); }}>
                      <span>Otago Space Radar (New Zealand)</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                    </li>
                    <li className="hover:text-orbit-orange cursor-pointer flex items-center justify-between" onClick={() => { setMenuOpen(false); scrollToWorkstation("SENSORS"); }}>
                      <span>Guanacaste Array (Costa Rica)</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                    </li>
                    <li className="hover:text-orbit-orange cursor-pointer flex items-center justify-between" onClick={() => { setMenuOpen(false); scrollToWorkstation("SENSORS"); }}>
                      <span>Santa Maria Station (Azores)</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                    </li>
                    <li className="hover:text-orbit-orange cursor-pointer flex items-center justify-between" onClick={() => { setMenuOpen(false); scrollToWorkstation("SENSORS"); }}>
                      <span>Midland Facility (Texas)</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                    </li>
                  </ul>
                </div>

                {/* Col 2: Authoritative Dataset & Open Sensors */}
                <div className="space-y-3">
                  <h4 className="font-display text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center gap-2 text-orbit-orange">
                    <FileCheck className="w-4 h-4" />
                    <span>Open Sensor Networks</span>
                  </h4>
                  <ul className="space-y-2 text-xs font-sans opacity-90">
                    <li className="hover:text-orbit-orange cursor-pointer flex items-center justify-between" onClick={() => { setMenuOpen(false); scrollToWorkstation("CROWDSOURCED"); }}>
                      <span>TinyGS Global LoRa Array (2,100+ Nodes)</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                    </li>
                    <li className="hover:text-orbit-orange cursor-pointer flex items-center justify-between" onClick={() => { setMenuOpen(false); scrollToWorkstation("CROWDSOURCED"); }}>
                      <span>SatNOGS Open SDR Observations</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                    </li>
                    <li className="hover:text-orbit-orange cursor-pointer flex items-center justify-between" onClick={() => { setMenuOpen(false); scrollToWorkstation("CROWDSOURCED"); }}>
                      <span>MASCARA All-Sky Optical Telescopes</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                    </li>
                    <li className="hover:text-orbit-orange cursor-pointer flex items-center justify-between" onClick={() => { setMenuOpen(false); scrollToWorkstation("EXPORTS"); }}>
                      <span>CCSDS 508.0 Conjunction Messages</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                    </li>
                  </ul>
                </div>

                {/* Col 3: Orbital Solutions */}
                <div className="space-y-3">
                  <h4 className="font-display text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center gap-2 text-orbit-orange">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Orbital Solutions</span>
                  </h4>
                  <ul className="space-y-2 text-xs font-sans opacity-90">
                    <li className="hover:text-orbit-orange cursor-pointer flex items-center justify-between" onClick={() => { setMenuOpen(false); scrollToWorkstation("CONJUNCTIONS"); }}>
                      <span>Autonomous Collision Avoidance</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                    </li>
                    <li className="hover:text-orbit-orange cursor-pointer flex items-center justify-between" onClick={() => { setMenuOpen(false); scrollToWorkstation("MULTIPHYSICS"); }}>
                      <span>Spacecraft Multiphysics Diagnostics</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                    </li>
                    <li className="hover:text-orbit-orange cursor-pointer flex items-center justify-between" onClick={() => { setMenuOpen(false); scrollToWorkstation("ALL"); }}>
                      <span>Space Domain Awareness (SDA)</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                    </li>
                  </ul>
                </div>

                {/* Col 4: Operations & Flight Dynamics */}
                <div className="space-y-3">
                  <h4 className="font-display text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center gap-2 text-orbit-orange">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Flight Ops</span>
                  </h4>
                  <ul className="space-y-2 text-xs font-sans opacity-90">
                    <li className="hover:text-orbit-orange cursor-pointer flex items-center justify-between" onClick={() => { setMenuOpen(false); scrollToWorkstation("ALL"); }}>
                      <span>AI Flight Dynamics Copilot</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Headline Section */}
        <section className="text-center pt-2 pb-2">
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black tracking-ultra uppercase max-w-5xl mx-auto leading-tight">
            THE ORBITAL INTELLIGENCE <br className="hidden sm:inline" />
            TECHNOLOGY STACK
          </h1>
          <p className={`text-xs sm:text-sm max-w-3xl mx-auto mt-3 font-sans ${theme === "light" ? "text-purple-900" : "text-slate-300"}`}>
            Autonomous SGP4/SDP4 precision orbit propagation, multi-mission sensor surveillance network, and authoritative collision assessment.
          </p>
        </section>

        {/* 2-Column Hero Showcase (3D Wireframe Satellite Matrix Mesh + 3 Stack Tiers) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center py-2">
          {/* Left Column: 3D Wireframe Satellite Matrix Mesh */}
          <div className={`lg:col-span-5 relative flex flex-col items-center justify-center p-6 rounded-3xl border ${
            theme === "light" ? "bg-white border-purple-200 shadow-lg" : "bg-[#140236] border-[rgba(75,20,140,0.75)] shadow-2xl"
          }`}>
            <div className="w-full flex items-center justify-between mb-2 text-xs font-mono opacity-90">
              <span className="text-orbit-orange font-display font-black uppercase tracking-wider text-xs sm:text-sm">
                3D SATELLITE MATRIX MESH
              </span>
              <button
                onClick={() => setSatelliteRotating(!satelliteRotating)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold transition-colors ${
                  theme === "light" ? "bg-purple-50 border-purple-200 text-purple-950 hover:bg-purple-100" : "bg-black/60 border-purple-800 text-slate-200 hover:text-white"
                }`}
              >
                {satelliteRotating ? "PAUSE ROTATION" : "RESUME ROTATION"}
              </button>
            </div>

            {/* 3D Wireframe Satellite Mesh Canvas */}
            <div className="w-full h-64 sm:h-72 relative">
              <WireframeSatelliteHero
                theme={theme}
                isRotating={satelliteRotating}
                onToggleRotation={() => setSatelliteRotating(!satelliteRotating)}
              />
            </div>

            <div className="w-full flex items-center justify-between pt-3 border-t border-purple-900/60 text-xs font-mono opacity-90">
              <span>RADAR CROSS SECTION: <strong className="text-white">410.0 m²</strong></span>
              <span>INCLINATION: <strong className="text-orbit-orange font-bold">51.64°</strong></span>
            </div>
          </div>

          {/* Right Column: 3-Tier Technology Stack */}
          <div className="lg:col-span-7 space-y-4">
            {/* Tier 1: Multi-Mission Radars */}
            <div
              onClick={() => scrollToWorkstation("SENSORS", "sensors")}
              className="pb-4 border-b border-purple-900/60 group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl border transition-all text-orbit-orange ${
                  theme === "light" ? "bg-white border-purple-200 group-hover:border-orbit-orange shadow-md" : "bg-[#1c0248] border-purple-800 group-hover:border-orbit-orange shadow-duke-glow"
                }`}>
                  <Radar className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-display text-base font-bold text-orbit-orange tracking-wider flex items-center justify-between">
                    <span>Multi-Mission Radars</span>
                    <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-lg border font-bold ${
                      theme === "light" ? "bg-purple-50 border-purple-200 text-purple-950" : "bg-black/60 border-purple-800 text-slate-300"
                    }`}>
                      6 SITES ONLINE
                    </span>
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed font-sans ${theme === "light" ? "text-purple-900" : "text-slate-200"}`}>
                    Leverage our proliferated sensor network, featuring rapidly deployable phased-array radars that deliver continuous, all-weather coverage.
                  </p>
                  <div className="pt-1 text-xs font-bold text-orbit-orange flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform">
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tier 2: Authoritative Dataset & Open Sensors */}
            <div
              onClick={() => scrollToWorkstation("CROWDSOURCED")}
              className="pb-4 border-b border-purple-900/60 group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl border transition-all text-orbit-orange ${
                  theme === "light" ? "bg-white border-purple-200 group-hover:border-orbit-orange shadow-md" : "bg-[#1c0248] border-purple-800 group-hover:border-orbit-orange shadow-duke-glow"
                }`}>
                  <FileCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-display text-base font-bold text-orbit-orange tracking-wider flex items-center justify-between">
                    <span>Open Sensor Ingestion & Datasets</span>
                    <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-lg border font-bold ${
                      theme === "light" ? "bg-purple-50 border-purple-200 text-purple-950" : "bg-black/60 border-purple-800 text-slate-300"
                    }`}>
                      TINYGS / SATNOGS / MASCARA
                    </span>
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed font-sans ${theme === "light" ? "text-purple-900" : "text-slate-200"}`}>
                    Live decentralized LoRa ground stations, open SDR waterfall spectrograms, and all-sky astronomical optical telescope astrometry.
                  </p>
                  <div className="pt-1 text-xs font-bold text-orbit-orange flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform">
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tier 3: Collision Avoidance & Space Traffic Management */}
            <div
              onClick={() => scrollToWorkstation("CONJUNCTIONS", "conjunctions")}
              className="pb-1 group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl border transition-all text-orbit-orange ${
                  theme === "light" ? "bg-white border-purple-200 group-hover:border-orbit-crimson shadow-md" : "bg-[#1c0248] border-purple-800 group-hover:border-orbit-crimson shadow-duke-glow"
                }`}>
                  <ShieldAlert className="w-6 h-6 text-orbit-crimson" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-display text-base font-bold text-orbit-orange tracking-wider flex items-center justify-between">
                    <span>Collision Avoidance & Space Domain Awareness</span>
                    <span className="text-[11px] font-mono text-orbit-crimson bg-orbit-crimson/20 px-2.5 py-0.5 rounded-lg border border-orbit-crimson/50 font-bold">
                      {criticalConjunctionCount} CRITICAL CDMs
                    </span>
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed font-sans ${theme === "light" ? "text-purple-900" : "text-slate-200"}`}>
                    Automated Conjunction Data Messages (CDM) screening with real-time probability of collision ($P_c$) and instant impulsive $\Delta V$ maneuver calculation.
                  </p>
                  <div className="pt-1 text-xs font-bold text-orbit-orange flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform">
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live System Metrics Strip */}
        <section className={`grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl border ${
          theme === "light" ? "bg-white border-purple-200 shadow-md text-[#1C0248]" : "bg-[#140236] border-[rgba(75,20,140,0.7)] text-white"
        }`}>
          <div>
            <div className="text-[11px] opacity-75 font-sans font-bold">TRACKED LEO OBJECTS</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-orbit-orange mt-1">{assets.length} ACTIVE</div>
          </div>
          <div>
            <div className="text-[11px] opacity-75 font-sans font-bold">PHASED ARRAY SENSORS</div>
            <div className="text-xl sm:text-2xl font-black font-mono mt-1">
              {sensors.filter((s) => s.isTracking).length} / {sensors.length} ONLINE
            </div>
          </div>
          <div>
            <div className="text-[11px] opacity-75 font-sans font-bold">CRITICAL CONJUNCTIONS</div>
            <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${criticalConjunctionCount > 0 ? "text-orbit-crimson animate-pulse" : "text-orbit-orange"}`}>
              {criticalConjunctionCount} ACTIVE
            </div>
          </div>
          <div>
            <div className="text-[11px] opacity-75 font-sans font-bold">AVERAGE RADAR SNR</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-purple-300 mt-1">+34.8 dB</div>
          </div>
        </section>

        {/* Interactive Multi-Tab Operations Workstation */}
        <div ref={workstationRef} className="space-y-6 pt-2">
          {/* Workstation Multi-Tab Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-900/60 pb-3">
            <div className="flex items-center gap-2 font-sans text-xs overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab("ALL");
                  setFocusedModule(null);
                }}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  activeTab === "ALL"
                    ? "bg-orbit-orange text-white shadow-orange-glow font-black"
                    : theme === "light"
                    ? "bg-white border border-purple-200 text-purple-950 hover:bg-purple-50"
                    : "bg-[#1c0248] border border-purple-800 text-slate-200 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>GLOBAL 3D VISUALIZATION</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("CONJUNCTIONS");
                  setFocusedModule("conjunctions");
                }}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  activeTab === "CONJUNCTIONS"
                    ? "bg-orbit-crimson text-white shadow-crimson-glow font-black"
                    : theme === "light"
                    ? "bg-white border border-purple-200 text-purple-950 hover:bg-purple-50"
                    : "bg-[#1c0248] border border-purple-800 text-slate-200 hover:text-white"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>CONJUNCTIONS ({criticalConjunctionCount})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("SENSORS");
                  setFocusedModule("sensors");
                }}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  activeTab === "SENSORS"
                    ? "bg-orbit-orange text-white shadow-orange-glow font-black"
                    : theme === "light"
                    ? "bg-white border border-purple-200 text-purple-950 hover:bg-purple-50"
                    : "bg-[#1c0248] border border-purple-800 text-slate-200 hover:text-white"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>RADAR ARRAYS</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("CROWDSOURCED");
                  setFocusedModule("crowdsourced");
                }}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  activeTab === "CROWDSOURCED"
                    ? "bg-orbit-orange text-white shadow-orange-glow font-black"
                    : theme === "light"
                    ? "bg-white border border-purple-200 text-purple-950 hover:bg-purple-50"
                    : "bg-[#1c0248] border border-purple-800 text-slate-200 hover:text-white"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>CROWDSOURCED GS & TELESCOPES</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("MULTIPHYSICS");
                  setFocusedModule("multiphysics");
                }}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  activeTab === "MULTIPHYSICS"
                    ? "bg-purple-600 text-white shadow-duke-glow font-black"
                    : theme === "light"
                    ? "bg-white border border-purple-200 text-purple-950 hover:bg-purple-50"
                    : "bg-[#1c0248] border border-purple-800 text-slate-200 hover:text-white"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>MULTIPHYSICS</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("EXPORTS");
                  setFocusedModule("export");
                }}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  activeTab === "EXPORTS"
                    ? "bg-neutral-800 text-white font-black"
                    : theme === "light"
                    ? "bg-white border border-purple-200 text-purple-950 hover:bg-purple-50"
                    : "bg-[#1c0248] border border-purple-800 text-slate-200 hover:text-white"
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>DATA EXCHANGE</span>
              </button>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 font-sans text-xs font-bold">
              <span className="opacity-70 text-[11px]">FILTER:</span>
              <button
                onClick={() => setAssetFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                  assetFilter === "ALL"
                    ? "bg-orbit-orange text-white border-orbit-orange shadow-orange-glow"
                    : theme === "light"
                    ? "bg-white border-purple-200 text-purple-950"
                    : "bg-black/60 border-purple-800 text-slate-300"
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setAssetFilter("SATELLITES")}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                  assetFilter === "SATELLITES"
                    ? "bg-orbit-orange text-white border-orbit-orange shadow-orange-glow"
                    : theme === "light"
                    ? "bg-white border-purple-200 text-purple-950"
                    : "bg-black/60 border-purple-800 text-slate-300"
                }`}
              >
                SATS
              </button>
              <button
                onClick={() => setAssetFilter("DEBRIS")}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                  assetFilter === "DEBRIS"
                    ? "bg-orbit-crimson text-white border-orbit-crimson shadow-crimson-glow"
                    : theme === "light"
                    ? "bg-white border-purple-200 text-purple-950"
                    : "bg-black/60 border-purple-800 text-slate-300"
                }`}
              >
                DEBRIS
              </button>
            </div>
          </div>

          {/* Standard Full-Power Workstation Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Center / Left: 3D Globe & Active Modules */}
            <div className="xl:col-span-8 space-y-6">
              <div className="h-[500px] sm:h-[550px] w-full">
                <ThreeGlobeCanvas
                  assets={filteredAssets}
                  sensors={sensors}
                  conjunctions={conjunctions}
                  selectedAsset={selectedAsset}
                  onSelectAsset={(asset) => {
                    setSelectedAsset(asset);
                    setTargetCameraAssetId(asset.id);
                  }}
                  targetCameraAssetId={targetCameraAssetId}
                  onCameraFlyComplete={() => setTargetCameraAssetId(null)}
                  theme={theme}
                />
              </div>

              {(activeTab === "ALL" || activeTab === "CONJUNCTIONS") && (
                <Conjunctions
                  conjunctions={conjunctions}
                  assets={assets}
                  onExecuteManeuver={handleExecuteManeuver}
                  isFocused={focusedModule === "conjunctions"}
                  theme={theme}
                />
              )}

              {(activeTab === "ALL" || activeTab === "SENSORS") && (
                <Sensors
                  sensors={sensors}
                  assets={assets}
                  onToggleSensorTracking={handleToggleSensorTracking}
                  onTaskSensor={handleTaskSensor}
                  selectedAsset={selectedAsset}
                  theme={theme}
                />
              )}

              {(activeTab === "ALL" || activeTab === "CROWDSOURCED") && (
                <CrowdsourcedGroundSensors theme={theme} />
              )}

              {(activeTab === "ALL" || activeTab === "MULTIPHYSICS") && (
                <Multiphysics
                  selectedAsset={selectedAsset}
                  initialTelemetry={multiphysics}
                  theme={theme}
                />
              )}

              {(activeTab === "ALL" || activeTab === "EXPORTS") && (
                <ExportReporting
                  assets={assets}
                  conjunctions={conjunctions}
                  sensors={sensors}
                  isFocused={focusedModule === "export"}
                  theme={theme}
                />
              )}
            </div>

            {/* Right Dock: AI Command Copilot & Universal Live Stream Feed */}
            <div className="xl:col-span-4 space-y-6">
              <AICopilot
                assets={assets}
                conjunctions={conjunctions}
                onExecuteCommand={handleCopilotCommand}
                onFocusModule={(mod) => {
                  if (mod === "conjunctions") scrollToWorkstation("CONJUNCTIONS", "conjunctions");
                  if (mod === "export") scrollToWorkstation("EXPORTS", "export");
                }}
                onTargetAsset={(assetId) => {
                  setTargetCameraAssetId(assetId);
                  const target = assets.find((a) => a.id === assetId);
                  if (target) setSelectedAsset(target);
                }}
                focusedModule={focusedModule}
                theme={theme}
              />

              <UniversalStream initialPackets={telemetryStream} theme={theme} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
