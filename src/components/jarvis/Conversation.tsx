import { useEffect, useRef, useState } from "react";
import { Mic, Send, Sparkle, Square, Trash2 } from "lucide-react";
import { useJarvis, useMounted } from "./JarvisProvider";
import { clock } from "@/lib/jarvis-data";
import { cn } from "@/lib/utils";

const quick = [
  "System status report",
  "List running agents",
  "Create mission: draft weekly report",
  "What's in flight right now?",
];

export function Conversation() {
  const {
    messages,
    sendMessage,
    clearChat,
    thinking,
    listening,
    toggleListening,
    speaking,
    stopSpeaking,
    interim,
  } = useJarvis();
  const [value, setValue] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();


  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, thinking]);

  const submit = (text?: string) => {
    const t = text ?? value;
    if (!t.trim()) return;
    sendMessage(t);
    setValue("");
  };

  return (
    <section className="glass-soft flex min-h-0 flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-[11px] font-bold tracking-[0.22em] text-muted-foreground">
          CONVERSATION LOG
        </span>
        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" /> Clear
        </button>
      </div>

      <div className="flex max-h-64 min-h-32 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Channel clear. Speak or type to brief me.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="animate-rise-in flex gap-3">
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-xs",
                m.role === "jarvis"
                  ? "border-cyan-hud/40 bg-cyan-hud/12 text-cyan-hud"
                  : "border-border bg-foreground/5 text-muted-foreground",
              )}
            >
              {m.role === "jarvis" ? <Sparkle className="h-3.5 w-3.5" /> : "You"[0]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-baseline gap-2">
                <span
                  className={cn(
                    "text-xs font-bold",
                    m.role === "jarvis" ? "text-cyan-hud" : "text-foreground",
                  )}
                >
                  {m.role === "jarvis" ? "JARVIS" : "You"}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {mounted ? clock(m.at) : ""}
                </span>

              </div>
              <p
                className={cn(
                  "text-[13px] leading-relaxed",
                  m.kind === "confirm" ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {m.kind === "confirm" && <span className="mr-1 text-emerald-hud">✔</span>}
                {m.text}
              </p>
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex items-center gap-2 pl-10 text-xs text-cyan-hud">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <i
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-cyan-hud"
                  style={{ animation: `core-pulse 1s ease-in-out ${i * 0.15}s infinite` }}
                />
              ))}
            </span>
            reasoning…
          </div>
        )}
        {interim && (
          <p className="pl-10 text-[13px] italic text-muted-foreground/70">“{interim}”</p>
        )}
        <div ref={endRef} />
      </div>

      {speaking && (
        <button
          onClick={stopSpeaking}
          className="mx-4 mb-2 flex items-center justify-center gap-2 rounded-lg border border-amber-hud/40 bg-amber-hud/10 py-1.5 text-[11px] font-bold text-amber-hud transition-colors hover:bg-amber-hud/20"
        >
          <Square className="h-3 w-3" /> Stop speaking
        </button>
      )}

      <div className="flex flex-wrap gap-2 px-4 pb-2">

        {quick.map((q) => (
          <button
            key={q}
            onClick={() => submit(q)}
            className="rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-cyan-hud/50 hover:text-cyan-hud"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-center gap-2 border-t border-border px-4 py-3"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Speak or type a command…"
          className="min-w-0 flex-1 rounded-xl border border-border bg-foreground/5 px-3.5 py-2.5 text-[13px] text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-cyan-hud/60 focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--cyan-hud)_14%,transparent)]"
        />
        <button
          type="button"
          onClick={toggleListening}
          aria-label="Voice command"
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-all",
            listening
              ? "border-cyan-hud/60 bg-cyan-hud/15 text-cyan-hud glow-ring"
              : "border-border bg-foreground/5 text-muted-foreground hover:text-cyan-hud",
          )}
        >
          <Mic className="h-4 w-4" />
        </button>
        <button
          type="submit"
          aria-label="Send"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--cyan-hud),var(--blue-hud))] text-primary-foreground shadow-[0_6px_18px_color-mix(in_oklab,var(--cyan-hud)_35%,transparent)] transition-transform hover:-translate-y-0.5"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
