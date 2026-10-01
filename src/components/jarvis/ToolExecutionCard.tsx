import React, { useState } from "react";
import { Terminal, Check, Loader2, ChevronDown, ChevronRight, Cpu } from "lucide-react";
import type { AGUIToolCall } from "@/lib/agui-types";
import { cn } from "@/lib/utils";

interface ToolExecutionCardProps {
  toolCall: AGUIToolCall;
}

export function ToolExecutionCard({ toolCall }: ToolExecutionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isRunning = toolCall.status === "running" || toolCall.status === "pending";
  const isError = toolCall.status === "error";

  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-hairline bg-[oklch(0.21_0.013_256)] font-mono text-xs shadow-md transition-all">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer items-center justify-between px-3.5 py-2.5 bg-black/20 hover:bg-black/35 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="neu-inset grid h-6 w-6 place-items-center rounded text-cyan-hud">
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Terminal className="h-3.5 w-3.5" />
            )}
          </span>
          <span className="font-semibold text-foreground tracking-wide">
            {toolCall.tool}
          </span>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
              isRunning
                ? "bg-amber-hud/15 text-amber-hud animate-pulse"
                : isError
                  ? "bg-destructive/20 text-destructive"
                  : "bg-emerald-hud/15 text-emerald-hud",
            )}
          >
            {isRunning ? "Executing" : isError ? "Failed" : "Executed"}
          </span>
        </div>

        <button
          type="button"
          aria-label={isExpanded ? "Collapse tool details" : "Expand tool details"}
          className="text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-hairline p-3 space-y-2.5 bg-black/30">
          <div>
            <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground block mb-1">
              Parameters:
            </span>
            <pre className="max-h-40 overflow-x-auto rounded-lg bg-[oklch(0.16_0.01_256)] p-2 text-[11px] text-cyan-hud/90">
              {JSON.stringify(toolCall.args, null, 2)}
            </pre>
          </div>

          {toolCall.result !== undefined && (
            <div>
              <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground block mb-1">
                Output:
              </span>
              <pre className="max-h-48 overflow-x-auto rounded-lg bg-[oklch(0.16_0.01_256)] p-2 text-[11px] text-emerald-hud/90">
                {JSON.stringify(toolCall.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
