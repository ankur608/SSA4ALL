"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Terminal,
  Sparkles,
  Zap,
  Maximize2,
  Minimize2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Radio,
  FileSpreadsheet,
} from "lucide-react";
import { SpaceAsset, ConjunctionEvent } from "../../types/ssa";

interface AICopilotProps {
  assets: SpaceAsset[];
  conjunctions: ConjunctionEvent[];
  onExecuteCommand: (command: string, param?: string) => void;
  onFocusModule?: (moduleKey: string) => void;
  onTargetAsset?: (assetId: string) => void;
  focusedModule?: string | null;
  theme?: "dark" | "light";
}

interface ChatMessage {
  id: string;
  sender: "user" | "copilot" | "system";
  text: string;
  timestamp: string;
  actionExecuted?: string;
}

export const AICopilot: React.FC<AICopilotProps> = ({
  assets,
  conjunctions,
  onExecuteCommand,
  onFocusModule,
  onTargetAsset,
  focusedModule,
  theme = "dark",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "copilot",
      text: "SSA4ALL Space Domain Awareness AI active. Global radar network telemetry synchronized. Ready for flight dynamics and conjunction screening queries.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    {
      id: "msg-2",
      sender: "system",
      text: "RADAR ALERT: 1 Critical Conjunction active (ISS vs COSMOS-2251 Debris). Miss Distance: 214m.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isListening) {
      timeout = setTimeout(() => {
        setIsListening(false);
        const voicePrompts = [
          "/layout-focus-conjunctions",
          "/camera-target ISS-25544",
          "/filter debris",
          "/system-override-safety",
        ];
        const randomPrompt = voicePrompts[Math.floor(Math.random() * voicePrompts.length)];
        handleUserMessage(randomPrompt, true);
      }, 2600);
    }
    return () => clearTimeout(timeout);
  }, [isListening]);

  const handleUserMessage = (textToSend: string, wasVoice: boolean = false) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: (wasVoice ? "🎙️ " : "") + textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    processTacticalIntent(textToSend.trim());
  };

  const processTacticalIntent = (rawInput: string) => {
    const input = rawInput.toLowerCase();
    let replyText = "";
    let actionTaken = "";

    if (input.startsWith("/layout-focus-conjunctions") || input.includes("focus conjunction")) {
      actionTaken = "FOCUS_CDMS";
      replyText = "Transitioning view to Conjunction Data Messages (CDM) panel. Isolating critical close encounters.";
      if (onFocusModule) onFocusModule("conjunctions");
      onExecuteCommand("/layout-focus-conjunctions");
    } else if (input.startsWith("/camera-target") || input.includes("track") || input.includes("camera")) {
      const parts = rawInput.split(" ");
      const targetQuery = parts.slice(1).join(" ").trim() || "ISS-25544";
      
      const foundAsset = assets.find(
        (a) =>
          a.id.toLowerCase().includes(targetQuery.toLowerCase()) ||
          a.name.toLowerCase().includes(targetQuery.toLowerCase()) ||
          a.noradId.toString() === targetQuery
      ) || assets[0];

      actionTaken = `SLEW_CAMERA: ${foundAsset.name}`;
      replyText = `Slewing 3D camera to [${foundAsset.name}] (NORAD ${foundAsset.noradId}). Altitude: ${foundAsset.calculatedPos.alt.toFixed(1)} km. Velocity: ${foundAsset.calculatedPos.velocity} km/s.`;
      
      if (onTargetAsset) onTargetAsset(foundAsset.id);
      onExecuteCommand("/camera-target", foundAsset.id);
    } else if (input.startsWith("/filter") || input.includes("filter")) {
      if (input.includes("debris")) {
        actionTaken = "FILTER_DEBRIS";
        replyText = "Filter applied: Displaying cataloged orbital debris fragments.";
        onExecuteCommand("/filter", "debris");
      } else if (input.includes("satellite") || input.includes("active")) {
        actionTaken = "FILTER_SATELLITES";
        replyText = "Filter applied: Displaying active satellites and space stations.";
        onExecuteCommand("/filter", "satellites");
      } else {
        actionTaken = "FILTER_RESET";
        replyText = "Filter cleared: Showing all cataloged orbital objects.";
        onExecuteCommand("/filter", "all");
      }
    } else if (input.startsWith("/system-override-safety") || input.includes("override") || input.includes("avoid")) {
      actionTaken = "COLLISION_AVOIDANCE_BURNOUT";
      replyText = "SAFETY PROTOCOL ENGAGED: Executing autonomous collision avoidance calculation. Post-burn Miss Distance expands to > 6.4 km. Collision probability Pc neutralized.";
      onExecuteCommand("/system-override-safety");
    } else if (input.startsWith("/generate-report") || input.includes("export") || input.includes("report")) {
      actionTaken = "EXPORT_CDM_REPORT";
      replyText = "Compiling Conjunction Data Message (CDM) and multi-agency compliance handoff document.";
      if (onFocusModule) onFocusModule("export");
      onExecuteCommand("/generate-report");
    } else {
      const criticalCount = conjunctions.filter((c) => c.riskLevel === "CRITICAL").length;
      replyText = `Radar Summary: Tracking ${assets.length} orbital objects in LEO. ${criticalCount} critical CDM alerts active. Global network SNR nominal.`;
      actionTaken = "AI_QUERY_RESPONSE";
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `copilot-${Date.now()}`,
          sender: "copilot",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actionExecuted: actionTaken,
        },
      ]);
    }, 380);
  };

  return (
    <div
      className={`orbit-panel rounded-2xl flex flex-col transition-all duration-300 ${
        isOpen ? "h-[540px]" : "h-16"
      }`}
    >
      {/* Header */}
      <div className={`p-4 flex items-center justify-between border-b rounded-t-2xl ${
        theme === "light"
          ? "bg-purple-100/70 border-purple-200 text-purple-950"
          : "bg-[#1c0248] border-[rgba(100,35,185,0.7)] text-white"
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="w-6 h-6 text-orbit-orange glow-orange" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orbit-orange animate-ping" />
          </div>
          <div>
            <div className="font-display text-sm font-black tracking-wider uppercase flex items-center gap-2">
              <span>AI COMMAND COPILOT</span>
              <span className="text-[10px] bg-orbit-orange/20 px-2.5 py-0.5 rounded font-mono text-orbit-orange border border-orbit-orange/40 font-bold">
                v4.8 PROD
              </span>
            </div>
            <div className="text-xs opacity-75 font-mono">Flight Dynamics & Conjunction Command Assistant</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isListening && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orbit-crimson/20 rounded border border-orbit-crimson/50">
              <span className="text-xs font-mono text-orbit-crimson font-bold">LISTENING</span>
              <div className="flex items-center gap-0.5 h-3.5">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [0.3, 1.2, 0.4] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    className="w-0.5 h-full bg-orbit-crimson rounded-full"
                  />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg opacity-80 hover:opacity-100 hover:bg-black/20 transition-all"
            title={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <>
          {/* Quick Macros */}
          <div className={`p-2.5 border-b flex items-center gap-2 overflow-x-auto text-xs ${
            theme === "light" ? "bg-purple-50/50 border-purple-200" : "bg-[#0f0126] border-purple-900/60"
          }`}>
            <span className="opacity-60 font-sans text-xs flex items-center gap-1 flex-shrink-0 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-orbit-orange" /> MACROS:
            </span>
            <button
              onClick={() => handleUserMessage("/layout-focus-conjunctions")}
              className="px-3 py-1 rounded bg-orbit-orange/20 text-orbit-orange hover:bg-orbit-orange/30 border border-orbit-orange/40 font-mono text-xs flex-shrink-0 transition-all font-bold"
            >
              /focus-cdms
            </button>
            <button
              onClick={() => handleUserMessage("/camera-target ISS-25544")}
              className="px-3 py-1 rounded bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/40 font-mono text-xs flex-shrink-0 transition-all font-bold"
            >
              /target-ISS
            </button>
            <button
              onClick={() => handleUserMessage("/system-override-safety")}
              className="px-3 py-1 rounded bg-orbit-crimson/20 text-orbit-crimson hover:bg-orbit-crimson/30 border border-orbit-crimson/40 font-mono text-xs flex-shrink-0 transition-all font-bold"
            >
              /avoidance-burn
            </button>
            <button
              onClick={() => handleUserMessage("/generate-report")}
              className="px-3 py-1 rounded bg-black/40 text-slate-300 hover:bg-black/60 font-mono text-xs flex-shrink-0 transition-all"
            >
              /export-cdm
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 font-sans text-xs">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : msg.sender === "system" ? "items-center" : "items-start"
                }`}
              >
                {msg.sender === "system" ? (
                  <div className="w-full text-center py-1.5 px-3.5 bg-orbit-crimson/20 border border-orbit-crimson/50 rounded-xl text-orbit-crimson text-xs font-mono font-bold">
                    {msg.text}
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 ${
                      msg.sender === "user"
                        ? "bg-orbit-orange/20 border border-orbit-orange/50 text-white font-medium"
                        : theme === "light"
                        ? "bg-white border border-purple-200 text-purple-950 shadow-sm"
                        : "bg-[#140236] border border-[rgba(100,35,185,0.7)] text-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs opacity-70 mb-1.5">
                      <span className={msg.sender === "user" ? "text-orbit-orange font-bold font-mono" : "text-orbit-orange font-bold font-mono"}>
                        {msg.sender === "user" ? "OPERATOR" : "AI COPILOT"}
                      </span>
                      <span className="font-mono">{msg.timestamp}</span>
                    </div>
                    <div className="text-xs leading-relaxed break-words">{msg.text}</div>
                    {msg.actionExecuted && (
                      <div className="mt-2.5 pt-2 border-t border-purple-900/60 flex items-center gap-1.5 text-xs font-mono text-orbit-orange font-bold">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>ACTION: {msg.actionExecuted}</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className={`p-3.5 border-t flex items-center gap-2.5 rounded-b-2xl ${
            theme === "light" ? "bg-purple-50/80 border-purple-200" : "bg-[#100129] border-[rgba(100,35,185,0.7)]"
          }`}>
            <button
              onClick={() => setIsListening(!isListening)}
              className={`p-3 rounded-xl transition-all ${
                isListening
                  ? "bg-orbit-crimson text-white animate-pulse shadow-crimson-glow"
                  : "bg-black/40 text-slate-300 hover:text-white hover:bg-black/60"
              }`}
              title="Voice Recognition"
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUserMessage(inputText);
              }}
              placeholder="Ask AI Copilot or enter command (e.g. /camera-target ISS)..."
              className={`flex-1 rounded-xl px-3.5 py-2.5 text-xs font-sans focus:outline-none border ${
                theme === "light"
                  ? "bg-white border-purple-200 text-purple-950 placeholder-purple-400 focus:border-orbit-orange"
                  : "bg-black/70 border-purple-900 text-white placeholder-slate-500 focus:border-orbit-orange"
              }`}
            />

            <button
              onClick={() => handleUserMessage(inputText)}
              disabled={!inputText.trim()}
              className="px-4 py-2.5 bg-orbit-orange text-white text-xs font-bold rounded-xl hover:bg-orbit-orangeBright disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2 shadow-orange-glow"
            >
              <span>SEND</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
