import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  FileCode,
  FileText,
  Layers,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { DelegatedOutputCard } from "@/lib/jarvis-data";
import { cn } from "@/lib/utils";

interface DelegationOutputCardProps {
  card: DelegatedOutputCard;
  onClose?: () => void;
  isModal?: boolean;
}

export function DelegationOutputCard({
  card,
  onClose,
  isModal = false,
}: DelegationOutputCardProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "findings" | "artifacts" | "telemetry">(
    "summary",
  );
  const [activeArtifactIdx, setActiveArtifactIdx] = useState(0);
  const [copiedArtifact, setCopiedArtifact] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const hasArtifacts = Boolean(card.codeArtifacts && card.codeArtifacts.length > 0);

  const handleCopyArtifact = () => {
    if (!card.codeArtifacts || !card.codeArtifacts[activeArtifactIdx]) return;
    const code = card.codeArtifacts[activeArtifactIdx].code;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(code);
    }
    setCopiedArtifact(true);
    toast.success("Code artifact copied to clipboard");
    setTimeout(() => setCopiedArtifact(false), 2000);
  };

  const handleCopyAll = () => {
    const payload = JSON.stringify(card, null, 2);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(payload);
    }
    setCopiedAll(true);
    toast.success("Complete task output copied as JSON");
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(card, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `${card.agentId}-${card.taskId}.json`);
    dlAnchor.click();
    toast.success(`Exported ${card.taskId}.json`);
  };

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-gradient-to-br from-[oklch(0.24_0.013_256/_95%)] via-[oklch(0.20_0.012_256/_95%)] to-[oklch(0.18_0.012_256/_95%)]",
        "border-hairline shadow-2xl backdrop-blur-2xl",
        isModal ? "w-full max-w-3xl max-h-[88vh]" : "w-full max-w-2xl my-3",
      )}
      style={{
        boxShadow: `0 20px 48px -10px oklch(0.08 0 0 / 70%), 0 0 24px -4px color-mix(in oklab, ${card.accent} 25%, transparent)`,
      }}
    >
      {/* Top Holographic Glow Stripe */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${card.accent}, var(--cyan-hud), transparent)`,
        }}
      />

      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 border-b border-hairline p-4 sm:p-5 pb-3.5">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="neu-inset grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl shadow-inner"
            style={{ color: card.accent }}
          >
            {card.icon}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                style={{
                  color: card.accent,
                  borderColor: `color-mix(in oklab, ${card.accent} 40%, transparent)`,
                  background: `color-mix(in oklab, ${card.accent} 12%, transparent)`,
                }}
              >
                {card.agentName}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-hud bg-emerald-hud/10 border border-emerald-hud/30 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-hud animate-pulse" />
                {card.telemetry.status}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {(card.telemetry.latencyMs / 1000).toFixed(1)}s elapsed
              </span>
            </div>

            <h3 className="font-display text-base font-bold text-foreground truncate mt-1">
              {card.title}
            </h3>
            {card.agentRole && (
              <p className="text-[11px] text-muted-foreground truncate">{card.agentRole}</p>
            )}
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="key grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Dismiss Card"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dispatched Directive Pill Box */}
      <div className="mx-4 sm:mx-5 mt-3.5 rounded-xl border border-hairline bg-black/40 p-3">
        <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-wider text-cyan-hud/90 mb-1">
          <span className="flex items-center gap-1.5 font-bold">
            <Terminal className="h-3 w-3" />
            J.A.R.V.I.S. DISPATCHED DIRECTIVE
          </span>
          <span className="text-muted-foreground">TASK #{card.taskId}</span>
        </div>
        <p className="text-xs font-mono text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {card.prompt}
        </p>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b border-hairline px-4 sm:px-5 pt-3">
        <button
          onClick={() => setActiveTab("summary")}
          className={cn(
            "flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold transition-all",
            activeTab === "summary"
              ? "border-cyan-hud text-cyan-hud"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          Executive Summary
        </button>

        <button
          onClick={() => setActiveTab("findings")}
          className={cn(
            "flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold transition-all",
            activeTab === "findings"
              ? "border-cyan-hud text-cyan-hud"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Findings & Verification
          <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-mono">
            {card.findings.length}
          </span>
        </button>

        {hasArtifacts && (
          <button
            onClick={() => setActiveTab("artifacts")}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold transition-all",
              activeTab === "artifacts"
                ? "border-cyan-hud text-cyan-hud"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Code2 className="h-3.5 w-3.5" />
            Code & Artifacts
            <span className="rounded-full bg-cyan-hud/20 text-cyan-hud px-1.5 py-0.2 text-[10px] font-mono">
              {card.codeArtifacts?.length}
            </span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("telemetry")}
          className={cn(
            "flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold transition-all",
            activeTab === "telemetry"
              ? "border-cyan-hud text-cyan-hud"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Cpu className="h-3.5 w-3.5" />
          System Telemetry
        </button>
      </div>

      {/* Main Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar min-h-[180px] max-h-[50vh]">
        {/* Tab 1: Executive Summary */}
        {activeTab === "summary" && (
          <div className="space-y-3.5 animate-rise-in">
            <div className="neu-sm rounded-xl border border-hairline bg-[oklch(0.22_0.012_256/_70%)] p-4">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-foreground">
                <Sparkles className="h-4 w-4 text-cyan-hud" />
                <span>Executive Synthesis</span>
              </div>
              <p className="text-xs sm:text-[13px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {card.executiveSummary}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                HIGHLIGHTED INSIGHTS
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                {card.findings.slice(0, 2).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-hairline bg-black/25 p-3 text-xs"
                  >
                    <span
                      className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md font-mono text-[10px] font-bold"
                      style={{
                        background: `color-mix(in oklab, ${card.accent} 20%, transparent)`,
                        color: card.accent,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-foreground/90 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Findings & Verification */}
        {activeTab === "findings" && (
          <div className="space-y-2.5 animate-rise-in">
            {card.findings.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-hairline bg-[oklch(0.22_0.012_256/_60%)] p-3.5 text-xs transition-colors hover:border-cyan-hud/40"
              >
                <div className="p-1 rounded-md bg-emerald-hud/15 text-emerald-hud mt-0.5 shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-0.5">
                    Finding #{idx + 1}
                  </span>
                  <p className="text-foreground leading-relaxed">{item}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Code & Artifacts */}
        {activeTab === "artifacts" && hasArtifacts && (
          <div className="space-y-3 animate-rise-in">
            {/* File Tabs */}
            <div className="flex items-center justify-between gap-2 border-b border-hairline pb-2">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {card.codeArtifacts?.map((art, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveArtifactIdx(i)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono transition-all",
                      activeArtifactIdx === i
                        ? "neu-inset text-cyan-hud border border-cyan-hud/30"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <FileCode className="h-3.5 w-3.5" />
                    <span>{art.filename}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyArtifact}
                className="key flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-mono text-cyan-hud hover:text-foreground shrink-0"
              >
                {copiedArtifact ? (
                  <Check className="h-3.5 w-3.5 text-emerald-hud" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copiedArtifact ? "Copied" : "Copy Code"}</span>
              </button>
            </div>

            {/* Code Block Container */}
            {card.codeArtifacts && card.codeArtifacts[activeArtifactIdx] && (
              <div className="relative rounded-xl border border-hairline bg-black/60 p-3.5 font-mono text-xs overflow-x-auto text-cyan-100">
                <span className="absolute top-2 right-2 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">
                  {card.codeArtifacts[activeArtifactIdx].language}
                </span>
                <pre className="leading-relaxed">
                  <code>{card.codeArtifacts[activeArtifactIdx].code}</code>
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: System Telemetry */}
        {activeTab === "telemetry" && (
          <div className="space-y-3 animate-rise-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="neu-inset rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mb-1">
                  <Clock className="h-3 w-3 text-cyan-hud" />
                  <span>LATENCY</span>
                </div>
                <div className="text-base font-mono font-bold text-cyan-hud">
                  {card.telemetry.latencyMs}ms
                </div>
              </div>

              <div className="neu-inset rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mb-1">
                  <Cpu className="h-3 w-3 text-violet-hud" />
                  <span>NEURAL CORE</span>
                </div>
                <div className="text-[11px] font-mono font-bold text-violet-hud truncate">
                  {card.telemetry.model.split("/")[0]}
                </div>
              </div>

              <div className="neu-inset rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mb-1">
                  <Server className="h-3 w-3 text-emerald-hud" />
                  <span>CLUSTER NODE</span>
                </div>
                <div className="text-[11px] font-mono font-bold text-emerald-hud truncate">
                  {card.telemetry.computeCluster}
                </div>
              </div>

              <div className="neu-inset rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mb-1">
                  <ShieldCheck className="h-3 w-3 text-amber-hud" />
                  <span>VERIFICATION</span>
                </div>
                <div className="text-base font-mono font-bold text-amber-hud">
                  {card.telemetry.status}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-hairline bg-black/30 p-3 font-mono text-[11px] text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="text-foreground">
                  {new Date(card.telemetry.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Model Engine:</span>
                <span className="text-foreground">{card.telemetry.model}</span>
              </div>
              <div className="flex justify-between">
                <span>Allocated Cluster:</span>
                <span className="text-foreground">{card.telemetry.computeCluster}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between gap-2 border-t border-hairline bg-[oklch(0.18_0.012_256/_70%)] px-4 sm:px-5 py-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="key flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground hover:text-cyan-hud transition-colors"
          >
            {copiedAll ? (
              <Check className="h-3.5 w-3.5 text-emerald-hud" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>{copiedAll ? "Copied" : "Copy Output"}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="key flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground hover:text-cyan-hud transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="key rounded-lg px-3 py-1.5 text-[11px] font-bold text-cyan-hud hover:bg-cyan-hud/10 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
