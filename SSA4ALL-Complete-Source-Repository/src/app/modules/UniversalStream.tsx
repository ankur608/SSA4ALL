"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Radio,
  Terminal,
  Filter,
  Shield,
  Layers,
  ArrowDown,
  Pause,
  Play,
  Zap,
} from "lucide-react";
import { UniversalTelemetryStreamPacket, AgencySource } from "../../types/ssa";

interface UniversalStreamProps {
  initialPackets: UniversalTelemetryStreamPacket[];
  theme?: "dark" | "light";
}

export const UniversalStream: React.FC<UniversalStreamProps> = ({
  initialPackets,
  theme = "dark",
}) => {
  const [packets, setPackets] = useState<UniversalTelemetryStreamPacket[]>(initialPackets);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState<string>("ALL");

  const getAgencyBadge = (agency: AgencySource) => {
    switch (agency) {
      case "NASA (ODPO)":
        return "bg-blue-600/20 text-blue-400 border-blue-500/40";
      case "ESA":
        return "bg-emerald-600/20 text-emerald-400 border-emerald-500/40";
      case "JAXA":
        return "bg-rose-600/20 text-rose-400 border-rose-500/40";
      case "ISRO":
        return "bg-amber-600/20 text-amber-400 border-amber-500/40";
      case "USSPACECOM":
        return "bg-purple-600/20 text-purple-400 border-purple-500/40";
      case "CelesTrak":
      default:
        return "bg-orange-600/20 text-orbit-orange border-orbit-orange/40";
    }
  };

  useEffect(() => {
    if (isPaused) return;

    const sampleFeedPool = [
      {
        agency: "NASA (ODPO)" as AgencySource,
        event: "ORBIT_UPDATE" as const,
        targetNorad: 25544,
        targetName: "ISS (ZARYA)",
        dataSummary: "Ground tracking pass completed. State vector covariance variance: 1.1m.",
        classification: "UNCLASSIFIED" as const,
      },
      {
        agency: "ESA" as AgencySource,
        event: "RADAR_ACQUISITION" as const,
        targetNorad: 27370,
        targetName: "ENVISAT (DERELICT)",
        dataSummary: "Santa Maria tracking pass complete. RCS: 26.5 m². Tumble period: 142.4s.",
        classification: "RESTRICTED" as const,
      },
      {
        agency: "JAXA" as AgencySource,
        event: "MANEUVER_CONFIRMATION" as const,
        targetNorad: 47960,
        targetName: "ELSA-d ADR SERVICER",
        dataSummary: "Cape York radar pass tracking confirmed ADR proximity operations nominal.",
        classification: "UNCLASSIFIED" as const,
      },
      {
        agency: "USSPACECOM" as AgencySource,
        event: "CONJUNCTION_ALERT" as const,
        targetNorad: 51044,
        targetName: "STARLINK-3142",
        dataSummary: "Conjunction Data Message (CDM) generated for Fengyun fragment close approach.",
        classification: "UNCLASSIFIED" as const,
      },
      {
        agency: "CelesTrak" as AgencySource,
        event: "TLE_INGEST" as const,
        targetNorad: 48274,
        targetName: "TIANGONG SPACE STATION",
        dataSummary: "Ephemeris refresh: Orbit inclination 41.48°, altitude 395km.",
        classification: "UNCLASSIFIED" as const,
      },
    ];

    const interval = setInterval(() => {
      const randomFeed = sampleFeedPool[Math.floor(Math.random() * sampleFeedPool.length)];
      const newPacket: UniversalTelemetryStreamPacket = {
        id: `SDA-STREAM-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agency: randomFeed.agency,
        event: randomFeed.event,
        targetNorad: randomFeed.targetNorad,
        targetName: randomFeed.targetName,
        dataSummary: randomFeed.dataSummary,
        classification: randomFeed.classification,
      };

      setPackets((prev) => [newPacket, ...prev.slice(0, 39)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const filteredPackets =
    selectedAgencyFilter === "ALL"
      ? packets
      : packets.filter((p) => p.agency.toLowerCase().includes(selectedAgencyFilter.toLowerCase()));

  return (
    <div className={`orbit-panel rounded-2xl p-5 transition-all flex flex-col h-[420px] ${
      theme === "light" ? "bg-white border-purple-200 shadow-md text-purple-950" : "bg-[#140236] border-[rgba(75,20,140,0.7)] text-white"
    }`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-purple-900/60 mb-3">
        <div className="flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-orbit-orange glow-orange" />
          <div>
            <div className="font-display text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              <span>GLOBAL RADAR INGESTION FEED</span>
              <span className="w-2.5 h-2.5 rounded-full bg-orbit-orange animate-orange-pulse" />
            </div>
            <div className="text-xs opacity-75 font-sans mt-0.5">
              Live Ingestion Node (NASA, ESA, JAXA, ISRO, USSPACECOM, CelesTrak)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-sans ${
            theme === "light" ? "bg-purple-50/80 border-purple-200 text-purple-950" : "bg-black/60 border-purple-900 text-slate-200"
          }`}>
            <Filter className="w-3.5 h-3.5 text-orbit-orange" />
            <select
              value={selectedAgencyFilter}
              onChange={(e) => setSelectedAgencyFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold"
            >
              <option value="ALL">ALL AGENCIES</option>
              <option value="NASA">NASA (ODPO)</option>
              <option value="ESA">ESA</option>
              <option value="JAXA">JAXA</option>
              <option value="ISRO">ISRO</option>
              <option value="USSPACECOM">USSPACECOM</option>
            </select>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-xl border transition-all ${
              isPaused
                ? "bg-orbit-orange/20 border-orbit-orange text-orbit-orange"
                : "bg-black/40 border-purple-900 text-slate-300 hover:text-white"
            }`}
            title={isPaused ? "Resume Feed" : "Pause Feed"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-sans text-xs">
        <AnimatePresence>
          {filteredPackets.map((pkt) => (
            <motion.div
              key={pkt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`p-3.5 rounded-xl border transition-all ${
                theme === "light"
                  ? "bg-purple-50/40 border-purple-200 hover:border-orbit-orange"
                  : "bg-black/60 border-purple-950 hover:border-purple-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded font-mono font-bold uppercase border ${getAgencyBadge(
                      pkt.agency
                    )}`}
                  >
                    {pkt.agency}
                  </span>
                  <span className="text-xs text-orbit-orange font-bold font-mono">
                    {pkt.event}
                  </span>
                  <span className="opacity-40">|</span>
                  <span className="text-xs font-bold">{pkt.targetName}</span>
                  <span className="opacity-60 text-[11px] font-mono">({pkt.targetNorad})</span>
                </div>

                <div className="text-[11px] opacity-60 font-mono">
                  {new Date(pkt.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </div>
              </div>

              <div className="text-xs opacity-90 leading-relaxed pl-2.5 border-l-2 border-purple-600/70 font-sans">
                {pkt.dataSummary}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
