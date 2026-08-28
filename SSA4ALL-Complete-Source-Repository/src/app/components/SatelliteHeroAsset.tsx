"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crosshair, Radio, Zap, Navigation, ShieldCheck, Activity } from "lucide-react";

interface SatelliteHeroAssetProps {
  theme?: "dark" | "light";
}

export const SatelliteHeroAsset: React.FC<SatelliteHeroAssetProps> = ({
  theme = "dark",
}) => {
  const [pulseActive, setPulseActive] = useState<boolean>(true);

  return (
    <div className="relative w-full h-full min-h-[290px] rounded-2xl overflow-hidden flex items-center justify-center group">
      {/* High-Resolution Realistic Satellite Image Asset */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <motion.img
          src="/images/satellite_hero.jpg"
          alt="Orbital Satellite Asset"
          className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />
        {/* Subtle Vignette & Gradient Overlay */}
        <div
          className={`absolute inset-0 pointer-events-none transition-all ${
            theme === "light"
              ? "bg-gradient-to-t from-purple-950/70 via-transparent to-purple-950/30"
              : "bg-gradient-to-t from-black/85 via-black/20 to-black/40"
          }`}
        />
      </div>

      {/* Aerospace Tactical HUD Overlays */}
      {/* Top Left Tag */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-900/80 font-mono text-[11px] text-white">
        <span className="w-2 h-2 rounded-full bg-orbit-orange animate-orange-pulse" />
        <span className="font-bold text-orbit-orange">LEO-SAT-01</span>
        <span className="opacity-40">|</span>
        <span className="opacity-80">ALT: 412 km</span>
      </div>

      {/* Top Right Attitude Angles */}
      <div className="absolute top-3 right-3 z-10 hidden sm:flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-900/80 font-mono text-[10px] text-slate-200">
        <span>ATTITUDE:</span>
        <span className="text-orbit-orange font-bold">P:+2.4° Y:-1.1° R:+0.8°</span>
      </div>

      {/* Central Targeting Reticle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-40 h-40 rounded-full border border-orbit-orange/30 flex items-center justify-center animate-spin-slow">
          <div className="w-28 h-28 rounded-full border border-dashed border-purple-400/40" />
        </div>
        <div className="absolute w-6 h-6 border-t-2 border-l-2 border-orbit-orange -translate-x-12 -translate-y-12" />
        <div className="absolute w-6 h-6 border-t-2 border-r-2 border-orbit-orange translate-x-12 -translate-y-12" />
        <div className="absolute w-6 h-6 border-b-2 border-l-2 border-orbit-orange -translate-x-12 translate-y-12" />
        <div className="absolute w-6 h-6 border-b-2 border-r-2 border-orbit-orange translate-x-12 translate-y-12" />
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-purple-900/80 font-mono text-[11px] text-white">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>BUS NOMINAL</span>
          </span>
          <span className="opacity-40">|</span>
          <span className="opacity-80">PROPULSION: <strong className="text-orbit-orange">ACTIVE</strong></span>
        </div>
        <div className="text-purple-300 font-bold hidden sm:block">
          VELOCITY: 7.66 km/s
        </div>
      </div>
    </div>
  );
};
