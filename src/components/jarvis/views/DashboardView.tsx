import { Conversation } from "../Conversation";
import { OrbStage } from "../OrbStage";
import { useJarvis, useStats } from "../JarvisProvider";

export function DashboardView() {
  const { listening, cpu, ram } = useJarvis();
  const stats = useStats();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-wide">
            Good to see you, <span className="text-aurora">Gopi</span>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {listening ? "I'm listening…" : "The swarm is running autonomously. What shall we do next?"}
          </p>
        </div>
        <div className="hidden gap-2 sm:flex">
          {[
            { l: "AGENTS", v: stats.running, c: "text-emerald-hud" },
            { l: "MISSIONS", v: stats.active, c: "text-cyan-hud" },
            { l: "CPU", v: `${cpu}%`, c: "text-violet-hud" },
            { l: "RAM", v: `${ram}%`, c: "text-amber-hud" },
          ].map((s) => (
            <div key={s.l} className="glass-soft rounded-xl px-3.5 py-2 text-center">
              <p className={`font-mono text-sm font-extrabold ${s.c}`}>{s.v}</p>
              <p className="text-[9.5px] tracking-[0.14em] text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </header>

      <OrbStage />
      <Conversation />
    </div>
  );
}
