"use client";

import React, { useState } from "react";
import {
  FileDown,
  Printer,
  ShieldCheck,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  Terminal,
  Share2,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  SpaceAsset,
  ConjunctionEvent,
  SensorStation,
  OpenSSA_MultiAgencyHandoffReport,
} from "../../types/ssa";

interface ExportReportingProps {
  assets: SpaceAsset[];
  conjunctions: ConjunctionEvent[];
  sensors: SensorStation[];
  isFocused?: boolean;
  theme?: "dark" | "light";
}

export const ExportReporting: React.FC<ExportReportingProps> = ({
  assets,
  conjunctions,
  sensors,
  isFocused = false,
  theme = "dark",
}) => {
  const [classification, setClassification] = useState<
    "UNCLASSIFIED" | "RESTRICTED" | "NATO SECRET" | "MULTI-AGENCY CONFIDENTIAL"
  >("UNCLASSIFIED");
  const [copied, setCopied] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const generateHandoffData = (): OpenSSA_MultiAgencyHandoffReport => {
    return {
      reportHeader: {
        reportId: `SSA4ALL-DATASET-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        originatingAgency: "NASA (ODPO)",
        coordinatingAgencies: ["NASA (ODPO)", "ESA", "JAXA", "ISRO", "USSPACECOM"],
        timestampUtc: new Date().toISOString(),
        securityClassification: classification,
        complianceProtocol: "CCSDS 508.0-B-1 (Conjunction Data Message Standard)",
        systemVersion: "SSA4ALL Tactical v4.8-PROD",
      },
      executiveSummary: {
        totalTrackedObjects: assets.length,
        activeSatellites: assets.filter((a) => a.type === "Satellite" || a.type === "Space Station").length,
        catalogedDebris: assets.filter((a) => a.type === "Debris" || a.type === "Rocket Body").length,
        criticalConjunctionsCount: conjunctions.filter((c) => c.riskLevel === "CRITICAL" && c.maneuverStatus !== "AVOIDED").length,
        operationalSensorsOnline: sensors.filter((s) => s.isTracking).length,
        networkCoverageEfficiency: "99.2%",
      },
      activeConjunctions: conjunctions.map((c) => ({
        conjunctionId: c.id,
        primaryObject: {
          id: c.primaryAssetId,
          name: c.primaryAssetName,
          norad: assets.find((a) => a.id === c.primaryAssetId)?.noradId || 0,
        },
        secondaryObject: {
          id: c.chaserDebrisId,
          name: c.chaserDebrisName,
          norad: assets.find((a) => a.id === c.chaserDebrisId)?.noradId || 0,
        },
        missDistanceKm: parseFloat((c.missDistance / 1000).toFixed(4)),
        collisionProbability: c.pc,
        tcaUtc: c.tca,
        recommendedManeuverDeltaV_ms: c.requiredDeltaV || 0,
        status: c.maneuverStatus,
      })),
      sensorNetworkStatus: sensors.map((s) => ({
        sensorId: s.id,
        stationName: s.name,
        country: s.country,
        operationalState: s.isTracking ? "TRACKING" : "SEARCH",
        activeTargetNorad: assets.find((a) => a.id === s.activeTargetId)?.noradId,
        snrMargin: `${s.snrDb} dB`,
      })),
      orbitalEphemerisCatalog: assets.map((a) => ({
        noradId: a.noradId,
        assetName: a.name,
        type: a.type,
        epochUtc: a.calculatedPos.timestamp,
        positionGeodetic: {
          latitudeDeg: parseFloat(a.calculatedPos.lat.toFixed(4)),
          longitudeDeg: parseFloat(a.calculatedPos.lon.toFixed(4)),
          altitudeKm: parseFloat(a.calculatedPos.alt.toFixed(2)),
        },
        orbitalVelocityKmS: a.calculatedPos.velocity,
        inclinationDeg: a.inclination,
      })),
    };
  };

  const currentReportObject = generateHandoffData();
  const jsonStringPreview = JSON.stringify(currentReportObject, null, 2);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStringPreview);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `SSA4ALL_Authoritative_Dataset_${new Date().toISOString().replace(/[:.]/g, "-")}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice("Authoritative CDM JSON package exported successfully.");
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportCSV = () => {
    let csv = "NORAD_ID,NAME,TYPE,STATUS,LATITUDE_DEG,LONGITUDE_DEG,ALTITUDE_KM,VELOCITY_KM_S,AGENCY\n";
    assets.forEach((a) => {
      csv += `${a.noradId},"${a.name}",${a.type},${a.status},${a.calculatedPos.lat.toFixed(4)},${a.calculatedPos.lon.toFixed(4)},${a.calculatedPos.alt.toFixed(2)},${a.calculatedPos.velocity},"${a.agencySource}"\n`;
    });

    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `SSA4ALL_OrbitalCatalog_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice("Authoritative CSV catalog exported.");
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(jsonStringPreview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className={`orbit-panel rounded-2xl p-6 transition-all ${
        isFocused
          ? "border-orbit-orange ring-2 ring-orbit-orange/40 shadow-orange-glow bg-[#1C0248]/95"
          : theme === "light"
          ? "bg-white border-purple-200 text-purple-950 shadow-md"
          : "bg-[#140236]"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-purple-900/60 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orbit-orange/20 border border-orbit-orange/40">
            <Share2 className="w-6 h-6 text-orbit-orange glow-orange" />
          </div>
          <div>
            <div className="font-display text-base font-black tracking-widest uppercase flex items-center gap-2">
              <span>AUTHORITATIVE DATASET & MULTI-AGENCY EXCHANGE</span>
              <span className="text-[11px] bg-purple-900/40 border border-purple-700 text-purple-200 px-2.5 py-0.5 rounded-lg font-mono font-bold">
                CCSDS 508.0 STANDARD
              </span>
            </div>
            <div className="text-xs opacity-75 font-sans mt-0.5">
              Access the Most Comprehensive Commercial Catalog of Objects in LEO with Unmatched Accuracy
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-sans opacity-80 font-bold">SECURITY:</span>
          <select
            value={classification}
            onChange={(e: any) => setClassification(e.target.value)}
            className={`rounded-xl px-3.5 py-2 text-xs font-mono font-bold focus:outline-none border ${
              theme === "light"
                ? "bg-white border-purple-200 text-purple-950"
                : "bg-black border-purple-800 text-orbit-orange"
            }`}
          >
            <option value="UNCLASSIFIED">UNCLASSIFIED</option>
            <option value="RESTRICTED">RESTRICTED</option>
            <option value="MULTI-AGENCY CONFIDENTIAL">MULTI-AGENCY CONFIDENTIAL</option>
            <option value="NATO SECRET">NATO SECRET</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex flex-wrap items-center justify-between gap-3 mb-5 p-4 rounded-2xl border ${
        theme === "light" ? "bg-purple-50/50 border-purple-200" : "bg-black/80 border-purple-950"
      }`}>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="px-5 py-3 rounded-xl bg-orbit-orange text-white hover:bg-orbit-orangeBright font-sans text-xs font-black tracking-wider flex items-center gap-2 transition-all shadow-orange-glow"
          >
            <FileCode className="w-4 h-4" />
            <span>EXPORT AUTHORITATIVE JSON →</span>
          </button>

          <button
            onClick={handleExportCSV}
            className={`px-4 py-3 rounded-xl border font-sans text-xs font-bold flex items-center gap-2 transition-all ${
              theme === "light"
                ? "bg-white border-purple-200 text-purple-950 hover:bg-purple-50"
                : "bg-[#1c0248] border-purple-800 text-slate-100 hover:border-orbit-orange"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-orbit-orange" />
            <span>EXPORT CSV CATALOG</span>
          </button>

          <button
            onClick={handlePrintReport}
            className={`px-4 py-3 rounded-xl border font-sans text-xs font-bold flex items-center gap-2 transition-all ${
              theme === "light"
                ? "bg-white border-purple-200 text-purple-950 hover:bg-purple-50"
                : "bg-[#1c0248] border-purple-800 text-slate-100 hover:border-orbit-orange"
            }`}
          >
            <Printer className="w-4 h-4 text-purple-400" />
            <span>PRINT / PDF REPORT</span>
          </button>
        </div>

        <button
          onClick={handleCopyClipboard}
          className={`px-4 py-2.5 rounded-xl border font-sans text-xs font-bold flex items-center gap-2 transition-all ${
            theme === "light"
              ? "bg-white border-purple-200 text-purple-950 hover:bg-purple-50"
              : "bg-black/60 border-purple-800 text-slate-200 hover:text-white"
          }`}
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-orbit-orange" />}
          <span>{copied ? "COPIED" : "COPY JSON"}</span>
        </button>
      </div>

      {/* Confirmation */}
      {exportNotice && (
        <div className="mb-5 p-3.5 bg-emerald-500/20 border border-emerald-500/50 rounded-xl font-sans text-xs text-emerald-400 flex items-center gap-2.5 font-bold">
          <CheckCircle2 className="w-5 h-5" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* JSON Viewport */}
      <div className="rounded-2xl border border-purple-950 bg-black overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-[#100129] border-b border-purple-950 font-mono text-xs opacity-90">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-orbit-orange" />
            <span>SCHEMA: OpenSSA_ConjunctionDataMessage.json</span>
          </div>
          <span className="text-orbit-orange font-bold">READY FOR MULTI-AGENCY INGESTION</span>
        </div>

        <pre className="p-5 font-mono text-xs text-slate-200 max-h-64 overflow-y-auto leading-relaxed selection:bg-orbit-orange selection:text-white">
          <code>{jsonStringPreview}</code>
        </pre>
      </div>
    </div>
  );
};
