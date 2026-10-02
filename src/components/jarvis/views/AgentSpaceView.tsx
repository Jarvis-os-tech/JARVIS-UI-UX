import React, { useState, useRef, useEffect } from "react";
import {
  Activity,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  FileText,
  Layers,
  Maximize2,
  Minimize2,
  Network,
  Play,
  RotateCcw,
  Send,
  Shield,
  Sparkles,
  Terminal,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useJarvis } from "../JarvisProvider";
import { cn } from "@/lib/utils";
import type { Agent, DelegatedTask } from "@/lib/jarvis-data";

interface NodePosition {
  id: string;
  x: number; // percentage (0-100) or pixels
  y: number;
}

export function AgentSpaceView() {
  const { agents, delegatedTasks, delegateTask, openOutputCard, cpu, ram, net } = useJarvis();

  const [zoom, setZoom] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [activeWireId, setActiveWireId] = useState<string | null>(null);
  const [isCascading, setIsCascading] = useState(false);

  // Quick preset tasks for agents
  const agentPresets: Record<string, string[]> = {
    hermes: [
      "Deep research on autonomous multi-agent consensus protocols.",
      "Synthesize recent project milestones into personal knowledge vault.",
      "Query Obsidian notes for architectural patterns on zero-copy IPC.",
    ],
    ultron: [
      "Execute deep OS kernel diagnostic and inspect listening ports.",
      "Scan hardware thermal zones and optimize cooling curve.",
      "Zero-trust audit on local daemon privileges and sandbox limits.",
    ],
    "prime-agent": [
      "Implement resilient WebSocket reconnection logic with exponential backoff.",
      "Refactor UI state machine to eliminate redundant re-renders.",
      "Generate unit tests for AST parser with edge case fuzzing.",
    ],
    openmanus: [
      "Spawn headless Chromium sandbox and crawl latest AI benchmark papers.",
      "Automate web screenshot validation and verify layout metrics.",
      "Extract structured JSON table from web specification docs.",
    ],
    friday: [
      "Calibrate continuous hands-free voice stream gain and VAD thresholds.",
      "Run multimodal audio-reactive frequency synthesis check.",
      "Benchmark speech synthesis latency across edge models.",
    ],
  };

  // Node coordinates inside the 1000 x 700 virtual canvas (n8n graph style)
  // J.A.R.V.I.S. is the central orchestrator node at (500, 350)
  const canvasWidth = 1000;
  const canvasHeight = 700;

  const nodePositions: Record<string, { x: number; y: number }> = {
    "jarvis-core": { x: 500, y: 350 }, // Exact center
    hermes: { x: 200, y: 150 }, // Top-Left (North-West)
    ultron: { x: 800, y: 150 }, // Top-Right (North-East)
    "prime-agent": { x: 840, y: 440 }, // Middle-Right (East)
    openmanus: { x: 500, y: 580 }, // Bottom-Center (South)
    friday: { x: 160, y: 440 }, // Middle-Left (West)
  };

  // Get agent status and active delegation
  const getAgentRunningTask = (agentId: string) => {
    return delegatedTasks.find(
      (t) => t.agentId === agentId && (t.status === "running" || t.status === "delegating"),
    );
  };

  const getAgentLatestCompletedTask = (agentId: string) => {
    return delegatedTasks.find((t) => t.agentId === agentId && t.status === "completed");
  };

  const handleQuickDelegate = async (agentId: string, promptText: string) => {
    if (!promptText.trim()) return;
    setActiveWireId(`jarvis-core-${agentId}`);
    setSelectedAgent(null);
    setCustomPrompt("");
    await delegateTask(agentId, promptText);
  };

  // Swarm Cascade demo: triggers Jarvis -> Hermes -> Prime Agent sequence
  const handleSwarmCascade = async () => {
    if (isCascading) return;
    setIsCascading(true);

    try {
      setActiveWireId("jarvis-core-hermes");
      await delegateTask(
        "hermes",
        "Swarm Step 1: Research specifications for high-throughput zero-latency inter-agent IPC.",
      );

      setActiveWireId("hermes-prime-agent");
      await delegateTask(
        "prime-agent",
        "Swarm Step 2: Implement autonomous Rust UDS channel based on Hermes specification.",
      );

      setActiveWireId("prime-agent-ultron");
      await delegateTask(
        "ultron",
        "Swarm Step 3: Run kernel security audit and latency verification on generated binary.",
      );
    } finally {
      setIsCascading(false);
      setActiveWireId(null);
    }
  };

  // Compute smooth cubic Bézier curve between two nodes with n8n style
  const renderBezierWire = (
    id: string,
    from: { x: number; y: number },
    to: { x: number; y: number },
    color: string,
    isInterAgent = false,
  ) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    // Control points offset for elegant curvature
    const curvature = 0.45;
    const cx1 = from.x + (Math.abs(dx) > 50 ? dx * curvature : 0);
    const cy1 = from.y + (Math.abs(dy) > 50 ? dy * 0.1 : 0);
    const cx2 = to.x - (Math.abs(dx) > 50 ? dx * curvature : 0);
    const cy2 = to.y - (Math.abs(dy) > 50 ? dy * 0.1 : 0);

    const d = `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;
    const isActive = activeWireId === id || activeWireId === `all`;

    return (
      <g key={id} className="group cursor-pointer">
        {/* Wide invisible hit area */}
        <path d={d} fill="none" stroke="transparent" strokeWidth="20" />

        {/* Outer Glow / Halo */}
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={isActive ? "4" : isInterAgent ? "1" : "2"}
          strokeOpacity={isActive ? 0.9 : isInterAgent ? 0.25 : 0.4}
          strokeDasharray={isInterAgent ? "4 4" : undefined}
          style={{
            filter: isActive ? `drop-shadow(0 0 8px ${color})` : undefined,
            transition: "all 0.4s ease",
          }}
        />

        {/* Animated Data Packet Flow on active wires */}
        <path
          d={d}
          fill="none"
          stroke={isActive ? "#ffffff" : color}
          strokeWidth={isActive ? "3" : "1.5"}
          strokeDasharray="6 14"
          className="animate-wire-flow"
          strokeOpacity={isActive ? 1 : 0.6}
        />

        {/* Port connection dots */}
        <circle cx={from.x} cy={from.y} r="3.5" fill={color} />
        <circle cx={to.x} cy={to.y} r="3.5" fill={color} />
      </g>
    );
  };

  return (
    <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl bg-[oklch(0.18_0.012_256)] border border-hairline shadow-2xl">
      {/* Top HUD Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-[oklch(0.22_0.013_256/_80%)] px-4 py-3 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="neu-inset grid h-9 w-9 place-items-center rounded-xl text-cyan-hud">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-bold tracking-[0.16em] text-foreground">
                AGENT SPACE
              </h2>
              <span className="rounded bg-cyan-hud/15 border border-cyan-hud/30 px-2 py-0.2 font-mono text-[10px] font-bold text-cyan-hud uppercase">
                n8n Mesh Architecture
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              J.A.R.V.I.S. Core orchestrator connected to specialized neural agent nodes.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSwarmCascade}
            disabled={isCascading}
            className={cn(
              "key flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
              isCascading
                ? "bg-violet-hud/20 text-violet-hud border border-violet-hud animate-pulse"
                : "text-cyan-hud hover:border-cyan-hud glow-ring",
            )}
            title="Simulate multi-step task cascade across Jarvis, Hermes, Prime, and Ultron"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isCascading ? "Swarm Cascade Active..." : "Run Swarm Cascade"}</span>
          </button>

          {/* Zoom controls */}
          <div className="neu-inset flex items-center rounded-xl p-1 gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.65, z - 0.1))}
              className="key grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:text-foreground text-xs"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1 font-bold text-cyan-hud min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              className="key grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:text-foreground text-xs"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="key grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:text-foreground text-xs"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph Canvas Area */}
      <div className="relative flex-1 overflow-auto bg-[oklch(0.16_0.012_256)] flex items-center justify-center p-4">
        {/* n8n Style Dotted Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle, var(--cyan-hud) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Scaled Virtual Graph Surface */}
        <div
          className="relative transition-transform duration-200"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {/* SVG Connector Wires Layer */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Central Wires: Jarvis ⟶ Sub-Agents */}
            {renderBezierWire(
              "jarvis-core-hermes",
              nodePositions["jarvis-core"],
              nodePositions["hermes"],
              "var(--emerald-hud)",
            )}
            {renderBezierWire(
              "jarvis-core-ultron",
              nodePositions["jarvis-core"],
              nodePositions["ultron"],
              "var(--amber-hud)",
            )}
            {renderBezierWire(
              "jarvis-core-prime-agent",
              nodePositions["jarvis-core"],
              nodePositions["prime-agent"],
              "var(--violet-hud)",
            )}
            {renderBezierWire(
              "jarvis-core-openmanus",
              nodePositions["jarvis-core"],
              nodePositions["openmanus"],
              "var(--blue-hud)",
            )}
            {renderBezierWire(
              "jarvis-core-friday",
              nodePositions["jarvis-core"],
              nodePositions["friday"],
              "var(--pink-hud)",
            )}

            {/* Cross Wires: Inter-Agent Collaborations (n8n multi-node routing) */}
            {renderBezierWire(
              "hermes-prime-agent",
              nodePositions["hermes"],
              nodePositions["prime-agent"],
              "var(--cyan-hud)",
              true,
            )}
            {renderBezierWire(
              "prime-agent-ultron",
              nodePositions["prime-agent"],
              nodePositions["ultron"],
              "var(--amber-hud)",
              true,
            )}
            {renderBezierWire(
              "ultron-openmanus",
              nodePositions["ultron"],
              nodePositions["openmanus"],
              "var(--blue-hud)",
              true,
            )}
          </svg>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* CENTER NODE: J.A.R.V.I.S. Core (500, 350)                       */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${nodePositions["jarvis-core"].x}px`,
              top: `${nodePositions["jarvis-core"].y}px`,
            }}
          >
            <div className="relative group w-64 rounded-2xl border border-cyan-hud/60 bg-[oklch(0.24_0.013_256/_95%)] p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-cyan-hud hover:scale-105">
              {/* Outer holographic ring & Arc Reactor Glow */}
              <div className="absolute -inset-1.5 rounded-2xl bg-cyan-hud/15 blur-lg pointer-events-none animate-core-pulse" />

              {/* Port Connectors (North, South, East, West) */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 border-cyan-hud bg-black" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 border-cyan-hud bg-black" />
              <div className="absolute top-1/2 -left-2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-cyan-hud bg-black" />
              <div className="absolute top-1/2 -right-2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-cyan-hud bg-black" />

              {/* Center Node Header */}
              <div className="flex items-center gap-3">
                <div className="neu-inset relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-cyan-hud border border-cyan-hud/40 shadow-inner">
                  <div className="absolute inset-1 rounded-xl border border-cyan-hud/40 animate-ping-ring" />
                  <span className="font-display font-black text-lg">◎</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-black tracking-widest text-cyan-hud">
                      J.A.R.V.I.S.
                    </span>
                    <span className="h-2 w-2 rounded-full bg-cyan-hud animate-ping" />
                  </div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Orchestrator Prime
                  </p>
                </div>
              </div>

              {/* Central Telemetry HUD */}
              <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-hairline bg-black/40 p-2 text-center font-mono">
                <div>
                  <span className="block text-[8.5px] text-muted-foreground">CPU</span>
                  <span className="text-[11px] font-bold text-cyan-hud">{cpu}%</span>
                </div>
                <div>
                  <span className="block text-[8.5px] text-muted-foreground">RAM</span>
                  <span className="text-[11px] font-bold text-violet-hud">{ram}%</span>
                </div>
                <div>
                  <span className="block text-[8.5px] text-muted-foreground">MESH</span>
                  <span className="text-[11px] font-bold text-emerald-hud">SYNC</span>
                </div>
              </div>

              <div className="mt-2 text-center text-[10px] font-mono text-cyan-hud/80">
                ⚡ 5 Satellite Agents Linked
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SATELLITE AGENT NODES (Arranged around Jarvis)                 */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {agents
            .filter((a) => a.id !== "jarvis-core")
            .map((agent) => {
              const pos = nodePositions[agent.id] || { x: 500, y: 500 };
              const runningTask = getAgentRunningTask(agent.id);
              const latestCompleted = getAgentLatestCompletedTask(agent.id);
              const isBusy = Boolean(runningTask);

              return (
                <div
                  key={agent.id}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                  }}
                >
                  <div
                    className={cn(
                      "group w-60 rounded-2xl border bg-[oklch(0.23_0.013_256/_95%)] p-3.5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105",
                      isBusy
                        ? "border-cyan-hud shadow-[0_0_20px_var(--cyan-hud)]"
                        : "border-hairline hover:border-cyan-hud/50",
                    )}
                    style={{
                      boxShadow: isBusy
                        ? `0 0 24px color-mix(in oklab, ${agent.accent} 35%, transparent)`
                        : undefined,
                    }}
                  >
                    {/* Node Ports (n8n circles on edges) */}
                    <div
                      className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 bg-black"
                      style={{ borderColor: agent.accent }}
                    />
                    <div
                      className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 bg-black"
                      style={{ borderColor: agent.accent }}
                    />

                    {/* Node Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="neu-inset grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base"
                          style={{ color: agent.accent }}
                        >
                          {agent.icon}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-foreground truncate">
                            {agent.name}
                          </h4>
                          <span
                            className="inline-flex items-center gap-1 text-[9.5px] font-mono uppercase tracking-wider"
                            style={{ color: agent.accent }}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                isBusy ? "bg-cyan-hud animate-ping" : "bg-emerald-hud",
                              )}
                            />
                            {isBusy ? "DELEGATING..." : "ONLINE"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                      {agent.desc}
                    </p>

                    {/* Active running task banner if delegated */}
                    {runningTask && (
                      <div className="mt-2.5 rounded-lg bg-cyan-hud/10 border border-cyan-hud/30 p-2 text-[10px] font-mono text-cyan-hud flex items-center justify-between">
                        <span className="truncate max-w-[130px] font-bold">
                          {runningTask.title}
                        </span>
                        <span className="shrink-0">{Math.round(runningTask.progress)}%</span>
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div className="mt-3 flex items-center gap-2 border-t border-hairline pt-2.5">
                      <button
                        onClick={() => setSelectedAgent(agent)}
                        className="key flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold text-cyan-hud hover:text-foreground"
                      >
                        <Zap className="h-3 w-3" />
                        <span>Delegate</span>
                      </button>

                      {latestCompleted && (
                        <button
                          onClick={() => openOutputCard(latestCompleted.displayCard)}
                          className="key flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-mono text-emerald-hud hover:text-foreground"
                          title="View latest delegation output card"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Card</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* QUICK DELEGATION DIALOG DRAWER (When clicking "Delegate" on a node) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-lg rounded-2xl border border-hairline bg-[oklch(0.24_0.013_256/_95%)] p-5 shadow-2xl backdrop-blur-2xl animate-rise-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2.5">
                <span className="neu-inset grid h-9 w-9 place-items-center rounded-xl text-lg">
                  {selectedAgent.icon}
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-hud">
                    J.A.R.V.I.S. ⟶ TASK DISPATCH
                  </span>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Delegate to {selectedAgent.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="key grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Presets suggestions */}
            <div className="my-3 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                QUICK DIRECTIVE PRESETS
              </span>
              <div className="space-y-1.5">
                {(agentPresets[selectedAgent.id] || []).map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickDelegate(selectedAgent.id, preset)}
                    className="w-full text-left rounded-xl border border-hairline bg-black/30 p-2.5 text-xs text-foreground/90 hover:border-cyan-hud/40 hover:bg-cyan-hud/10 transition-all flex items-center justify-between gap-2 group"
                  >
                    <span className="truncate">{preset}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-cyan-hud group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Directive Input */}
            <div className="mt-3 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                OR WRITE CUSTOM INSTRUCTION
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleQuickDelegate(selectedAgent.id, customPrompt);
                    }
                  }}
                  placeholder={`What would you like ${selectedAgent.name} to execute?`}
                  className="flex-1 rounded-xl border border-hairline bg-black/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-hud"
                />
                <button
                  onClick={() => handleQuickDelegate(selectedAgent.id, customPrompt)}
                  disabled={!customPrompt.trim()}
                  className="key flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-cyan-hud disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Dispatch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
