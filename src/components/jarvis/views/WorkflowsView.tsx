import { useState } from "react";
import { Play, Workflow } from "lucide-react";
import { useJarvis } from "../JarvisProvider";
import { toast } from "sonner";

const seed = [
  { id: "w1", n: "Morning Digest", steps: ["Collect telemetry", "Summarise overnight events", "Speak briefing"], runs: 128, c: "var(--amber-hud)" },
  { id: "w2", n: "Inbox Triage", steps: ["Classify mail", "Draft replies", "Escalate P1+"], runs: 942, c: "var(--violet-hud)" },
  { id: "w3", n: "Deep Research", steps: ["Plan queries", "Crawl sources", "Rank + cite", "Compose brief"], runs: 61, c: "var(--blue-hud)" },
  { id: "w4", n: "Incident Response", steps: ["Detect anomaly", "Isolate node", "Notify owner"], runs: 7, c: "var(--emerald-hud)" },
];

export function WorkflowsView() {
  const { createMission, pushLog } = useJarvis();
  const [name, setName] = useState("");
  const [flows, setFlows] = useState(seed);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="mb-4">
        <h1 className="font-display text-2xl font-bold tracking-wide">Workflow Forge</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Compose multi-step autonomous routines and hand them to the orchestrator.
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setFlows((f) => [
            { id: Math.random().toString(36).slice(2), n: name.trim(), steps: ["Plan", "Execute", "Report"], runs: 0, c: "var(--cyan-hud)" },
            ...f,
          ]);
          pushLog(`Workflow “${name.trim()}” forged.`);
          toast.success(`Workflow “${name.trim()}” created`);
          setName("");
        }}
        className="mb-4 flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name a new workflow…"
          className="min-w-0 flex-1 rounded-xl border border-border bg-foreground/5 px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-hud/60"
        />
        <button className="shrink-0 rounded-xl bg-[linear-gradient(135deg,var(--cyan-hud),var(--blue-hud))] px-5 text-[13px] font-bold text-primary-foreground">
          Forge
        </button>
      </form>

      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-3 overflow-y-auto pb-4">
        {flows.map((f) => (
          <article key={f.id} className="glass-soft animate-rise-in rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                style={{ background: `color-mix(in oklab, ${f.c} 15%, transparent)`, color: f.c }}
              >
                <Workflow className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-[13.5px] font-bold">{f.n}</h3>
                <p className="text-[10.5px] text-muted-foreground">{f.runs} runs</p>
              </div>
            </div>

            <ol className="mt-3 space-y-1.5">
              {f.steps.map((s, i) => (
                <li key={s} className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
                  <span
                    className="grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full border text-[9px] font-bold"
                    style={{ borderColor: `color-mix(in oklab, ${f.c} 40%, transparent)`, color: f.c }}
                  >
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>

            <button
              onClick={() => createMission(f.n, `Workflow run: ${f.steps.join(" → ")}`)}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-cyan-hud/35 bg-cyan-hud/10 py-2 text-xs font-bold text-cyan-hud transition-colors hover:bg-cyan-hud/20"
            >
              <Play className="h-3.5 w-3.5" /> Run workflow
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
