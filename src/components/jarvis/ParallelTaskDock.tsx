import React from "react";
import { CheckCircle2, ChevronRight, Sparkles, X, Zap } from "lucide-react";
import { useJarvis } from "./JarvisProvider";
import { cn } from "@/lib/utils";
import type { DelegatedOutputCard } from "@/lib/jarvis-data";

export function ParallelTaskDock() {
  const { delegatedTasks, cancelDelegatedTask, openOutputCard } = useJarvis();

  const activeTasks = delegatedTasks.filter(
    (t) => t.status === "running" || t.status === "delegating",
  );
  const completedTasks = delegatedTasks.filter((t) => t.status === "completed");

  if (activeTasks.length === 0 && completedTasks.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-2 mb-3">
      {/* Active Running Delegations */}
      {activeTasks.length > 0 && (
        <div className="space-y-2">
          {activeTasks.map((task) => {
            const elapsedSec = ((Date.now() - task.startedAt) / 1000).toFixed(1);
            return (
              <div
                key={task.id}
                className="relative overflow-hidden rounded-xl border border-cyan-hud/40 bg-[oklch(0.24_0.013_256/_90%)] p-3 shadow-lg backdrop-blur-md flex items-center justify-between gap-3 animate-rise-in"
              >
                {/* Background progress bar shimmer */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-hud/15 via-violet-hud/20 to-transparent pointer-events-none transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />

                <div className="flex items-center gap-3 min-w-0 z-10">
                  <div className="neu-inset grid h-8 w-8 shrink-0 place-items-center rounded-lg text-cyan-hud">
                    <Zap className="h-4 w-4 animate-pulse" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded bg-cyan-hud/20 border border-cyan-hud/40 px-1.5 py-0.2 font-mono text-[10px] font-bold text-cyan-hud uppercase">
                        <Sparkles className="h-2.5 w-2.5 animate-spin" />
                        Delegated to {task.agentName}
                      </span>
                      <span className="text-xs font-bold text-foreground truncate max-w-xs sm:max-w-md">
                        {task.title}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground truncate">
                      Processing directive in background... ({Math.round(task.progress)}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 z-10">
                  <span className="neu-inset rounded-full px-2 py-0.5 font-mono text-[10px] font-bold text-foreground">
                    {elapsedSec}s
                  </span>
                  <button
                    onClick={() => cancelDelegatedTask(task.id)}
                    className="key grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:text-destructive transition-colors"
                    title="Cancel task"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Delegations Quick Bar */}
      {completedTasks.length > 0 && activeTasks.length === 0 && (
        <div className="flex items-center justify-between gap-2 p-2 px-3 rounded-xl border border-hairline bg-[oklch(0.23_0.013_256/_75%)] backdrop-blur-md">
          <div className="flex items-center gap-2 min-w-0 overflow-x-auto py-0.5 no-scrollbar">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground shrink-0 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-hud" />
              Delegation Output Cards ({completedTasks.length}):
            </span>

            {completedTasks.slice(0, 3).map((task) => (
              <button
                key={task.id}
                onClick={() => openOutputCard(task.displayCard)}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 hover:bg-cyan-hud/15 border border-hairline hover:border-cyan-hud/40 text-[11px] text-foreground transition-all shrink-0"
              >
                <span className="text-xs">{task.displayCard.icon}</span>
                <span className="truncate max-w-[140px] font-mono font-medium group-hover:text-cyan-hud">
                  {task.displayCard.title}
                </span>
                <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-cyan-hud group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>

          {completedTasks.length > 0 && (
            <button
              onClick={() => openOutputCard(completedTasks[0].displayCard)}
              className="text-[11px] font-mono font-bold text-cyan-hud hover:underline shrink-0 ml-1"
            >
              Latest Card →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
