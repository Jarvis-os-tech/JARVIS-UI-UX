import { Plus } from "lucide-react";
import { useJarvis } from "./JarvisProvider";
import { cn } from "@/lib/utils";
import type { Mission } from "@/lib/jarvis-data";

const statusLabel: Record<Mission["status"], { text: string; cls: string }> = {
  progress: { text: "In Progress", cls: "text-cyan-hud" },
  paused: { text: "Paused", cls: "text-amber-hud" },
  done: { text: "Completed", cls: "text-emerald-hud" },
  pending: { text: "Queued", cls: "text-amber-hud" },
  cancelled: { text: "Cancelled", cls: "text-destructive" },
};

export function MissionRail() {
  const { missions, setView, createMission } = useJarvis();
  const shown = missions.slice(0, 6);

  return (
    <aside className="glass flex min-h-0 shrink-0 flex-col overflow-hidden rounded-2xl xl:w-[21rem]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-cyan-hud/30 bg-cyan-hud/12 text-cyan-hud">
            🎯
          </span>
          <span className="text-[13px] font-bold tracking-wide">MISSION CONTROL</span>
        </div>
        <button
          onClick={() => setView("mission")}
          className="rounded-lg border border-cyan-hud/25 bg-cyan-hud/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-hud transition-colors hover:bg-cyan-hud/20"
        >
          View All
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-4">
        <p className="text-[10.5px] font-bold tracking-[0.18em] text-muted-foreground">ACTIVE MISSIONS</p>
        {shown.map((m) => {
          const s = statusLabel[m.status];
          return (
            <button
              key={m.id}
              onClick={() => setView("mission")}
              className="glass-soft group flex gap-3 rounded-xl p-3 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-hud/40"
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm"
                style={{
                  background: `color-mix(in oklab, ${m.accent} 16%, transparent)`,
                  color: m.accent,
                  border: `1px solid color-mix(in oklab, ${m.accent} 30%, transparent)`,
                }}
              >
                {m.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold">{m.title}</span>
                <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-muted-foreground">
                  {m.desc}
                </span>
                <span className="mt-2 flex items-center justify-between text-[11px]">
                  <span className={cn("font-semibold", s.cls)}>{s.text}</span>
                  <span className="font-mono text-muted-foreground">{Math.round(m.progress)}%</span>
                </span>
                <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-foreground/8">
                  <i
                    className="block h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${m.progress}%`,
                      background: `linear-gradient(90deg, ${m.accent}, var(--blue-hud))`,
                    }}
                  />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => createMission("Ad-hoc Directive", "Quick mission dispatched from the rail.")}
        className="m-4 mt-0 flex items-center justify-center gap-2 rounded-xl border border-cyan-hud/40 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--cyan-hud)_18%,transparent),color-mix(in_oklab,var(--blue-hud)_18%,transparent))] py-3 text-[13px] font-bold text-cyan-hud transition-transform hover:-translate-y-0.5"
      >
        <Plus className="h-4 w-4" /> New Mission
      </button>
    </aside>
  );
}
