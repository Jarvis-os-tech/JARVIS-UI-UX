import { ChatView } from "../ChatView";
import { ParallelTaskDock } from "../ParallelTaskDock";
import { useJarvis, useStats } from "../JarvisProvider";

export function DashboardView() {
  const { cpu, ram, net, aguiMessages, isStreaming, sendDirective, stopDirective, clearChat } =
    useJarvis();
  const stats = useStats();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 shrink-0">
        <div className="min-w-0">
          <h1 className="font-display etched text-2xl font-bold tracking-wide">
            Good to see you, <span className="text-aurora">Gopi</span>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            The swarm is running autonomously — {stats.active} missions in flight.
          </p>
        </div>
        <div className="hidden gap-2 sm:flex">
          {[
            { l: "AGENTS", v: stats.running, c: "text-emerald-hud" },
            { l: "MISSIONS", v: stats.active, c: "text-cyan-hud" },
            { l: "CPU", v: `${cpu}%`, c: "text-violet-hud" },
            { l: "RAM", v: `${ram}%`, c: "text-amber-hud" },
            { l: "NET", v: `${Math.round(net)}`, c: "text-cyan-hud" },
          ].map((s) => (
            <div key={s.l} className="neu-inset rounded-xl px-3.5 py-2 text-center">
              <p className={`font-mono text-sm font-extrabold ${s.c}`}>{s.v}</p>
              <p className="text-[9px] tracking-[0.16em] text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Parallel Background Delegation Dock */}
      <ParallelTaskDock />

      <div className="glass flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-hairline bg-[oklch(0.22_0.013_256/_75%)] shadow-2xl">
        <ChatView
          messages={aguiMessages}
          isStreaming={isStreaming}
          onSendMessage={sendDirective}
          onStopStreaming={stopDirective}
          onClearMessages={clearChat}
        />
      </div>
    </div>
  );
}
