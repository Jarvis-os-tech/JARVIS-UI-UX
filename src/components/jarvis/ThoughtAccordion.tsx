import React, { useState } from "react";
import { ChevronDown, ChevronRight, BrainCircuit, CheckCircle2, Clock } from "lucide-react";
import type { AGUIThoughtStep } from "@/lib/agui-types";
import { cn } from "@/lib/utils";

interface ThoughtAccordionProps {
  thoughts: AGUIThoughtStep[];
  isStreaming?: boolean;
}

export function ThoughtAccordion({ thoughts, isStreaming }: ThoughtAccordionProps) {
  // Default open while streaming, can be toggled by user
  const [isOpen, setIsOpen] = useState<boolean>(true);

  if (!thoughts || thoughts.length === 0) return null;

  return (
    <div className="mb-3.5 overflow-hidden rounded-xl border border-hairline bg-[oklch(0.2_0.012_256/_70%)] backdrop-blur-md transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <BrainCircuit className={cn("h-3.5 w-3.5", isStreaming ? "animate-pulse text-cyan-hud" : "text-muted-foreground")} />
          <span className="font-semibold tracking-wide text-foreground">
            Thought Process ({thoughts.length} step{thoughts.length > 1 ? "s" : ""})
          </span>
          {isStreaming && (
            <span className="flex items-center gap-1 rounded bg-cyan-hud/10 px-1.5 py-0.5 font-mono text-[10px] text-cyan-hud">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-hud animate-ping" />
              Reasoning...
            </span>
          )}
        </div>
        <div className="text-muted-foreground">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-hairline px-3.5 py-2.5">
          <ul className="space-y-2">
            {thoughts.map((step, idx) => (
              <li key={step.id || idx} className="flex items-start gap-2.5 text-[11.5px] leading-relaxed">
                <span className="mt-0.5 text-cyan-hud">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-hud" />
                </span>
                <div className="flex-1">
                  <span className="text-foreground/90 font-mono">{step.title}</span>
                  {step.durationMs && (
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                      ({step.durationMs}ms)
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
