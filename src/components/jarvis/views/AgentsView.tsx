import { useJarvis, useStats } from "../JarvisProvider";
import { cn } from "@/lib/utils";

export function AgentsView() {
  const { agents, toggleAgent } = useJarvis();
  const stats = useStats();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="mb-5">
        <h1 className="font-display text-2xl font-bold tracking-wide">AI Agent Swarm</h1>
        <div className="mt-2 flex gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <i className="h-1.5 w-1.5 rounded-full bg-emerald-hud shadow-[0_0_8px_var(--emerald-hud)]" />
            <b className="text-foreground">{stats.running}</b> running
          </span>
          <span className="flex items-center gap-2">
            <i className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            <b className="text-foreground">{stats.stopped}</b> suspended
          </span>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3.5 overflow-y-auto pb-4">
        {agents.map((a) => (
          <article
            key={a.id}
            className="glass-soft animate-rise-in flex flex-col gap-2.5 rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:border-cyan-hud/35"
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
                style={{
                  background: `color-mix(in oklab, ${a.accent} 15%, transparent)`,
                  color: a.accent,
                  border: `1px solid color-mix(in oklab, ${a.accent} 30%, transparent)`,
                }}
              >
                {a.icon}
              </span>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold",
                  a.status === "running"
                    ? "border-emerald-hud/35 bg-emerald-hud/12 text-emerald-hud"
                    : "border-border bg-foreground/5 text-muted-foreground",
                )}
              >
                {a.status === "running" ? "RUNNING" : "STOPPED"}
              </span>
            </div>

            <h3 className="text-sm font-bold">{a.name}</h3>
            <p className="text-[11.5px] leading-relaxed text-muted-foreground">{a.desc}</p>

            <div className="mt-auto space-y-2">
              <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
                <span>{a.tasks} tasks</span>
                <span className="font-mono">
                  {a.status === "running" ? `${Math.floor(a.uptimeMin / 60)}h uptime` : "offline"}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-foreground/8">
                <i
                  className="block h-full rounded-full transition-all duration-700"
                  style={{ width: `${a.load}%`, background: a.accent }}
                />
              </div>
              <button
                onClick={() => toggleAgent(a.id)}
                className={cn(
                  "w-full rounded-lg border py-2 text-xs font-bold transition-colors",
                  a.status === "running"
                    ? "border-amber-hud/35 bg-amber-hud/10 text-amber-hud hover:bg-amber-hud/20"
                    : "border-emerald-hud/35 bg-emerald-hud/10 text-emerald-hud hover:bg-emerald-hud/20",
                )}
              >
                {a.status === "running" ? "Suspend Agent" : "Activate Agent"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
