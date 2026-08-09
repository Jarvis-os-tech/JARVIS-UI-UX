import { useJarvis } from "../JarvisProvider";
import { cn } from "@/lib/utils";

function Row({
  title,
  desc,
  on,
  onToggle,
}: {
  title: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="glass-soft flex items-center justify-between gap-4 rounded-xl p-4">
      <div className="min-w-0">
        <p className="text-[13.5px] font-bold">{title}</p>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        aria-label={`Toggle ${title}`}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
          on ? "border-cyan-hud/50 bg-cyan-hud/25" : "border-border bg-foreground/8",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all",
            on ? "left-[1.4rem] bg-cyan-hud shadow-[0_0_10px_var(--cyan-hud)]" : "left-0.5 bg-muted-foreground",
          )}
        />
      </button>
    </div>
  );
}

export function SettingsView() {
  const {
    speechOn,
    setSpeechOn,
    wakeWord,
    setWakeWord,
    autonomy,
    setAutonomy,
    cpu,
    ram,
    net,
    voices,
    voiceName,
    setVoiceName,
    voiceRate,
    setVoiceRate,
    speak,
    micSupported,
  } = useJarvis();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="mb-4">
        <h1 className="font-display text-2xl font-bold tracking-wide">System Preferences</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Tune how independently JARVIS acts and how it speaks to you.
        </p>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-4">
        <Row
          title="Voice output"
          desc="Speak every response aloud through the neural synthesiser."
          on={speechOn}
          onToggle={() => setSpeechOn(!speechOn)}
        />
        <Row
          title="Wake word"
          desc={
            micSupported
              ? "Listen continuously for “Jarvis” in the background."
              : "Voice capture isn't supported in this browser."
          }
          on={wakeWord}
          onToggle={() => setWakeWord(!wakeWord)}
        />

        <div className="glass-soft rounded-xl p-4">
          <p className="text-[13.5px] font-bold">Neural voice</p>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Choose the synthesised voice JARVIS speaks with.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-border bg-foreground/5 px-3 py-2 text-[12.5px] outline-none focus:border-cyan-hud/60"
            >
              {voices.length === 0 && <option value="">No voices detected</option>}
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} · {v.lang}
                </option>
              ))}
            </select>
            <button
              onClick={() => speak("All systems nominal. I am ready when you are.")}
              className="shrink-0 rounded-lg border border-cyan-hud/35 bg-cyan-hud/10 px-4 py-2 text-[12px] font-bold text-cyan-hud transition-colors hover:bg-cyan-hud/20"
            >
              Test voice
            </button>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-[12px] text-muted-foreground">Speaking rate</p>
            <span className="font-mono text-sm font-bold text-cyan-hud">{voiceRate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min={0.6}
            max={1.6}
            step={0.02}
            value={voiceRate}
            onChange={(e) => setVoiceRate(Number(e.target.value))}
            className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-foreground/10 accent-cyan-hud"
            style={{
              background: `linear-gradient(90deg, var(--cyan-hud) ${((voiceRate - 0.6) / 1) * 100}%, oklch(1 0 0 / 10%) ${((voiceRate - 0.6) / 1) * 100}%)`,
            }}
          />
        </div>


        <div className="glass-soft rounded-xl p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-[13.5px] font-bold">Autonomy level</p>
            <span className="font-mono text-sm font-bold text-cyan-hud">{autonomy}%</span>
          </div>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Higher levels let agents act without asking for confirmation first.
          </p>
          <input
            type="range"
            min={0}
            max={100}
            value={autonomy}
            onChange={(e) => setAutonomy(Number(e.target.value))}
            className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-foreground/10 accent-cyan-hud"
            style={{
              background: `linear-gradient(90deg, var(--cyan-hud) ${autonomy}%, oklch(1 0 0 / 10%) ${autonomy}%)`,
            }}
          />
          <div className="mt-2 flex justify-between text-[10.5px] text-muted-foreground">
            <span>Ask first</span>
            <span>Fully autonomous</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { l: "CPU LOAD", v: `${cpu}%`, c: "text-cyan-hud" },
            { l: "MEMORY", v: `${ram}%`, c: "text-violet-hud" },
            { l: "NETWORK", v: `${net} KB/s`, c: "text-emerald-hud" },
          ].map((s) => (
            <div key={s.l} className="glass-soft rounded-xl p-4">
              <p className={cn("font-mono text-lg font-extrabold", s.c)}>{s.v}</p>
              <p className="mt-0.5 text-[10px] tracking-[0.14em] text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
