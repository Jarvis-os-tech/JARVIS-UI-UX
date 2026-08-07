import {
  Boxes,
  Bot,
  Brain,
  LayoutDashboard,
  Plug,
  Settings2,
  Target,
  Workflow,
} from "lucide-react";
import { useJarvis, useStats } from "./JarvisProvider";
import { cn } from "@/lib/utils";
import type { ViewKey } from "@/lib/jarvis-data";

const items: { key: ViewKey; label: string; sub: string; Icon: typeof Boxes }[] = [
  { key: "dashboard", label: "Dashboard", sub: "Command Deck", Icon: LayoutDashboard },
  { key: "memory", label: "Memory", sub: "Knowledge Hub", Icon: Brain },
  { key: "agents", label: "AI Agents", sub: "Live Swarm", Icon: Bot },
  { key: "connectors", label: "MCPs & Connectors", sub: "Plugins", Icon: Plug },
  { key: "mission", label: "Mission Control", sub: "Tasks & Ops", Icon: Target },
  { key: "workflows", label: "Workflow Forge", sub: "Design & Automate", Icon: Workflow },
  { key: "settings", label: "Settings", sub: "System Prefs", Icon: Settings2 },
];

export function Sidebar() {
  const { view, setView } = useJarvis();
  const stats = useStats();

  return (
    <nav className="glass flex shrink-0 gap-1.5 overflow-x-auto rounded-2xl p-2.5 lg:w-60 lg:flex-col lg:overflow-visible">
      {items.map(({ key, label, sub, Icon }) => {
        const active = view === key;
        return (
          <button
            key={key}
            onClick={() => setView(key)}
            className={cn(
              "group relative flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all lg:w-full",
              active
                ? "border border-cyan-hud/40 bg-cyan-hud/10 text-foreground shadow-[inset_0_1px_0_oklch(1_0_0/12%),var(--glow-cyan)]"
                : "border border-transparent text-muted-foreground hover:border-border hover:bg-foreground/5 hover:text-foreground",
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 hidden h-6 w-0.5 -translate-y-1/2 rounded-full bg-cyan-hud shadow-[0_0_10px_var(--cyan-hud)] lg:block" />
            )}
            <Icon className={cn("h-4.5 w-4.5 shrink-0", active && "text-cyan-hud")} />
            <span className="hidden min-w-0 lg:block">
              <span className="block truncate text-[13px] font-semibold leading-tight">{label}</span>
              <span className="block truncate text-[10.5px] uppercase tracking-wider text-muted-foreground">
                {sub}
              </span>
            </span>
            <span className="text-[13px] font-semibold lg:hidden">{label}</span>
          </button>
        );
      })}

      <div className="hidden flex-1 lg:block" />

      <div className="hidden rounded-xl border border-border bg-foreground/[0.04] p-3 lg:block">
        <div className="flex items-center gap-2.5">
          <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-cyan-hud/12">
            <span className="absolute inset-0 animate-ping-ring rounded-lg border border-cyan-hud/40" />
            <Boxes className="h-4 w-4 text-cyan-hud" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">JARVIS Core</p>
            <p className="truncate text-[10px] text-muted-foreground">v3.0 · Ultimate Edition</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-foreground/5 py-1.5">
            <p className="font-mono text-sm font-bold text-emerald-hud">{stats.running}</p>
            <p className="text-[9.5px] uppercase tracking-wider text-muted-foreground">Agents</p>
          </div>
          <div className="rounded-lg bg-foreground/5 py-1.5">
            <p className="font-mono text-sm font-bold text-cyan-hud">{stats.active}</p>
            <p className="text-[9.5px] uppercase tracking-wider text-muted-foreground">Missions</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
