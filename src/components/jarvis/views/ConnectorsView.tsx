import { useState } from "react";
import { Plug } from "lucide-react";
import { useJarvis } from "../JarvisProvider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const seed = [
  { id: "c1", n: "Calendar MCP", d: "Read/write scheduling across all connected calendars.", on: true, c: "var(--cyan-hud)" },
  { id: "c2", n: "Mail Gateway", d: "Triage, draft and send on your behalf with approval gates.", on: true, c: "var(--violet-hud)" },
  { id: "c3", n: "Web Browser", d: "Headless browsing, extraction and form automation.", on: true, c: "var(--blue-hud)" },
  { id: "c4", n: "Home Systems", d: "Lights, climate, locks and energy telemetry.", on: false, c: "var(--emerald-hud)" },
  { id: "c5", n: "Code Repository", d: "Read repos, open pull requests, run CI checks.", on: true, c: "var(--amber-hud)" },
  { id: "c6", n: "Finance Feed", d: "Market data, portfolio snapshots and alerts.", on: false, c: "var(--pink-hud)" },
];

export function ConnectorsView() {
  const [items, setItems] = useState(seed);
  const { pushLog, pushNotification } = useJarvis();

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const on = !i.on;
        queueMicrotask(() => {
          pushLog(`${i.n} ${on ? "connected" : "disconnected"}.`);
          pushNotification("🧩", `${i.n} ${on ? "connected" : "disconnected"}.`);
          toast(`${i.n} ${on ? "connected" : "disconnected"}`);
        });
        return { ...i, on };
      }),
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="mb-4">
        <h1 className="font-display text-2xl font-bold tracking-wide">MCPs &amp; Connectors</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Every tool the swarm can reach. Toggle a connector to grant or revoke autonomous access.
        </p>
      </header>

      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-3 overflow-y-auto pb-4">
        {items.map((i) => (
          <article key={i.id} className="glass-soft animate-rise-in rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                style={{ background: `color-mix(in oklab, ${i.c} 15%, transparent)`, color: i.c }}
              >
                <Plug className="h-4 w-4" />
              </span>
              <button
                onClick={() => toggle(i.id)}
                aria-label={`Toggle ${i.n}`}
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
                  i.on ? "border-cyan-hud/50 bg-cyan-hud/25" : "border-border bg-foreground/8",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all",
                    i.on ? "left-[1.4rem] bg-cyan-hud shadow-[0_0_10px_var(--cyan-hud)]" : "left-0.5 bg-muted-foreground",
                  )}
                />
              </button>
            </div>
            <h3 className="mt-3 text-[13.5px] font-bold">{i.n}</h3>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{i.d}</p>
            <p className={cn("mt-3 text-[11px] font-semibold", i.on ? "text-emerald-hud" : "text-muted-foreground")}>
              {i.on ? "● Connected" : "○ Offline"}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
