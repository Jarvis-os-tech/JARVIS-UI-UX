import { useState } from "react";
import { Brain, Search } from "lucide-react";
import { useJarvis } from "../JarvisProvider";
import { toast } from "sonner";

const memories = [
  { t: "Owner profile", d: "Gopi — prefers concise briefings, morning digests at 08:00.", tag: "identity", c: "var(--cyan-hud)" },
  { t: "Voice preferences", d: "Neutral tone, 1.04x rate, always confirm destructive actions aloud.", tag: "voice", c: "var(--violet-hud)" },
  { t: "Infrastructure map", d: "14 nodes, 3 regions, certificates auto-rotated every 60 days.", tag: "systems", c: "var(--emerald-hud)" },
  { t: "Research corpus", d: "8,412 embedded documents across 42 monitored sources.", tag: "knowledge", c: "var(--blue-hud)" },
  { t: "Escalation policy", d: "Anything above priority 3 wakes the owner, regardless of hour.", tag: "rules", c: "var(--amber-hud)" },
  { t: "Recall index", d: "Entity graph with 1.2M edges, compressed nightly.", tag: "vector", c: "var(--pink-hud)" },
];

export function MemoryView() {
  const [q, setQ] = useState("");
  const { pushLog } = useJarvis();
  const list = memories.filter(
    (m) => m.t.toLowerCase().includes(q.toLowerCase()) || m.d.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="mb-4">
        <h1 className="font-display text-2xl font-bold tracking-wide">Knowledge Hub</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Long-term memory, entity graph and everything JARVIS recalls about your world.
        </p>
      </header>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-foreground/5 px-3.5 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Recall anything…"
          className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3 overflow-y-auto pb-4">
        {list.map((m) => (
          <button
            key={m.t}
            onClick={() => {
              pushLog(`Recalled memory node “${m.t}”.`);
              toast(`Recalled: ${m.t}`);
            }}
            className="glass-soft animate-rise-in rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-hud/35"
          >
            <span
              className="grid h-9 w-9 place-items-center rounded-xl"
              style={{ background: `color-mix(in oklab, ${m.c} 15%, transparent)`, color: m.c }}
            >
              <Brain className="h-4 w-4" />
            </span>
            <h3 className="mt-3 text-[13.5px] font-bold">{m.t}</h3>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{m.d}</p>
            <span className="mt-3 inline-block rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {m.tag}
            </span>
          </button>
        ))}
        {list.length === 0 && (
          <p className="col-span-full py-10 text-center text-xs text-muted-foreground">
            Nothing in memory matches that.
          </p>
        )}
      </div>
    </div>
  );
}
