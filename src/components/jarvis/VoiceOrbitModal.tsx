import React, { useEffect, useMemo } from "react";
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceOrbitModalProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  transcript: string;
  lastSpoken: string;
  audioLevel: number;
  error?: string | null;
  onToggleMic: () => void;
  onInterruptSpeech: () => void;
}

export function VoiceOrbitModal({
  isOpen,
  onClose,
  isListening,
  isThinking,
  isSpeaking,
  transcript,
  lastSpoken,
  audioLevel,
  error,
  onToggleMic,
  onInterruptSpeech,
}: VoiceOrbitModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Derived state styling
  const stateTheme = useMemo(() => {
    if (isThinking) {
      return {
        accent: "var(--amber-hud)",
        ringColor: "text-amber-hud",
        glow: "rgba(235, 175, 45, 0.45)",
        status: "ANALYZING DIRECTIVE",
        desc: "Synthesizing tactical response...",
      };
    }
    if (isSpeaking) {
      return {
        accent: "var(--violet-hud)",
        ringColor: "text-violet-hud",
        glow: "rgba(185, 120, 255, 0.5)",
        status: "JARVIS SPEAKING",
        desc: "Transmitting response audio...",
      };
    }
    if (isListening) {
      return {
        accent: "var(--cyan-hud)",
        ringColor: "text-cyan-hud",
        glow: "rgba(45, 212, 235, 0.45)",
        status: "LISTENING CONTINUOUSLY",
        desc: "Hands-free voice mode active. Speak naturally.",
      };
    }
    return {
      accent: "var(--muted-foreground)",
      ringColor: "text-muted-foreground",
      glow: "rgba(150, 150, 150, 0.2)",
      status: "STANDBY",
      desc: "Microphone muted. Tap mic to resume.",
    };
  }, [isListening, isThinking, isSpeaking]);

  if (!isOpen) return null;

  // Compute dynamic scale and rotation multipliers based on audio level
  const coreScale = 1 + Math.min(0.5, audioLevel * 0.6);
  const ringScale = 1 + Math.min(0.2, audioLevel * 0.25);
  const waveOpacity = 0.25 + audioLevel * 0.65;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Frosted dark backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[oklch(0.12_0.01_256/_88%)] backdrop-blur-3xl transition-opacity animate-in fade-in duration-300"
      />

      {/* Futuristic Grid & Starfield Background Ambience */}
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(ellipse_at_center,var(--cyan-hud)_0%,transparent_70%),linear-gradient(to_right,oklch(1_0_0/5%)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/5%)_1px,transparent_1px)] [background-size:100%_100%,48px_48px,48px_48px]" />

      {/* Main Holographic Container */}
      <div className="glass relative z-10 flex w-full max-w-2xl flex-col items-center overflow-hidden rounded-3xl border border-hairline bg-[oklch(0.2_0.013_256/_94%)] p-6 sm:p-8 shadow-[0_24px_80px_oklch(0_0_0/80%)] backdrop-blur-2xl animate-in zoom-in-95 duration-200">
        {/* Top Header / Close bar */}
        <div className="flex w-full items-center justify-between border-b border-hairline pb-4">
          <div className="flex items-center gap-3">
            <span className="neu-inset grid h-8 w-8 place-items-center rounded-lg text-cyan-hud">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xs font-bold tracking-[0.25em] text-foreground">
                  HOLOGRAPHIC VOICE ORBIT
                </span>
                <span className="rounded-md bg-cyan-hud/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-hud">
                  FRIDAY MK-VII
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Continuous hands-free conversation loop
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close voice orbit"
            className="key grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Central Holographic Reactor Orbit */}
        <div className="relative my-8 flex h-72 w-72 sm:h-80 sm:w-80 items-center justify-center">
          {/* Ambient Glow Aura */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full transition-all duration-300"
            style={{
              background: `radial-gradient(circle, ${stateTheme.glow} 0%, transparent 72%)`,
              transform: `scale(${coreScale * 1.3})`,
            }}
          />

          {/* SVG Multi-Ring Gyroscope */}
          <svg
            viewBox="0 0 320 320"
            className="absolute inset-0 h-full w-full"
            style={{
              transform: `scale(${ringScale})`,
              transition: "transform 0.15s ease-out",
            }}
          >
            {/* Outer Static Track */}
            <circle
              cx="160"
              cy="160"
              r="148"
              fill="none"
              stroke="oklch(1 0 0 / 8%)"
              strokeWidth="1.5"
            />

            {/* Outer Rotating Segmented Ticks */}
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke={stateTheme.accent}
              strokeWidth="2"
              strokeDasharray="4 8 16 8 32 12"
              className="animate-spin-slow origin-center opacity-70"
            />

            {/* Mid Ring Counter-Rotating Gyro */}
            <circle
              cx="160"
              cy="160"
              r="114"
              fill="none"
              stroke="var(--cyan-hud)"
              strokeWidth="1.8"
              strokeDasharray="18 24 60 12"
              className="animate-spin-slower origin-center opacity-50"
            />

            {/* Inner Concentric Arc Track */}
            <circle
              cx="160"
              cy="160"
              r="84"
              fill="none"
              stroke={stateTheme.accent}
              strokeWidth="2.5"
              strokeDasharray="40 20 80 40"
              className="animate-spin-slow origin-center opacity-80"
            />

            {/* Reactive Wave Rings radiating outward */}
            <circle
              cx="160"
              cy="160"
              r="58"
              fill="none"
              stroke={stateTheme.accent}
              strokeWidth="1.5"
              style={{
                opacity: waveOpacity,
                transform: `scale(${coreScale})`,
                transformOrigin: "center",
                transition: "transform 0.1s ease-out",
              }}
            />
          </svg>

          {/* Pulsing Arc Reactor Core */}
          <div
            className="neu relative flex h-28 w-28 items-center justify-center rounded-full border border-hairline shadow-2xl transition-transform duration-150"
            style={{
              transform: `scale(${coreScale})`,
              boxShadow: `0 0 35px ${stateTheme.glow}, inset 0 0 20px ${stateTheme.glow}`,
            }}
          >
            <div
              className="h-16 w-16 rounded-full border border-white/20 transition-colors duration-500 flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, #fff 0%, ${stateTheme.accent} 65%, transparent 100%)`,
              }}
            >
              {isSpeaking ? (
                <Volume2 className="h-7 w-7 text-black drop-shadow-md animate-pulse" />
              ) : isThinking ? (
                <Activity className="h-7 w-7 text-black drop-shadow-md animate-spin" />
              ) : (
                <Mic className="h-7 w-7 text-black drop-shadow-md" />
              )}
            </div>
          </div>
        </div>

        {/* Audio Equalizer Bars */}
        <div className="flex items-center gap-1.5 h-8 mb-4">
          {[0.25, 0.55, 0.9, 0.4, 0.75, 1, 0.6, 0.8, 0.45, 0.3].map((heightMod, idx) => {
            const barHeight = Math.max(
              4,
              Math.min(
                28,
                (isListening || isSpeaking ? audioLevel * 28 * heightMod : 4) +
                  (isThinking ? 12 : 2),
              ),
            );
            return (
              <span
                key={idx}
                className="w-1.5 rounded-full transition-all duration-75"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: stateTheme.accent,
                  boxShadow: `0 0 8px ${stateTheme.accent}`,
                }}
              />
            );
          })}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 rounded-full border border-hairline bg-[oklch(0.18_0.012_256)] px-4 py-1.5 shadow-inner">
          <span
            className="h-2 w-2 rounded-full animate-ping"
            style={{ backgroundColor: stateTheme.accent }}
          />
          <span
            className="font-mono text-xs font-bold tracking-wider"
            style={{ color: stateTheme.accent }}
          >
            [{stateTheme.status}]
          </span>
          <span className="text-[11px] text-muted-foreground">{stateTheme.desc}</span>
        </div>

        {/* Live Subtitle Transcription Area */}
        <div className="mt-5 w-full min-h-[4.5rem] rounded-2xl border border-hairline bg-[oklch(0.18_0.012_256/_75%)] p-4 shadow-inner flex flex-col justify-center">
          {error ? (
            <p className="text-center font-mono text-xs text-destructive">{error}</p>
          ) : isThinking ? (
            <p className="text-center font-mono text-xs text-amber-hud animate-pulse">
              [DECOMPOSING DIRECTIVE: &quot;{transcript}&quot;]
            </p>
          ) : transcript ? (
            <p className="text-center text-sm font-medium leading-relaxed text-foreground animate-rise-in">
              &ldquo;{transcript}&rdquo;
            </p>
          ) : isSpeaking && lastSpoken ? (
            <p className="line-clamp-2 text-center text-xs leading-relaxed text-cyan-hud">
              {lastSpoken}
            </p>
          ) : (
            <p className="text-center text-xs text-muted-foreground italic">
              Speak a directive... (e.g. &ldquo;Run cluster diagnostic&rdquo;, &ldquo;Deploy mission
              alpha&rdquo;, &ldquo;Status report&rdquo;)
            </p>
          )}
        </div>

        {/* Bottom Modal Controls */}
        <div className="mt-6 flex w-full items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMic}
              aria-label={isListening ? "Mute microphone" : "Unmute microphone"}
              className={cn(
                "key flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all",
                isListening
                  ? "text-cyan-hud border-cyan-hud/40 shadow-[0_0_15px_rgba(45,212,235,0.2)]"
                  : "text-muted-foreground",
              )}
            >
              {isListening ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4 text-destructive" />
              )}
              {isListening ? "Mute Mic" : "Unmute Mic"}
            </button>

            {isSpeaking && (
              <button
                onClick={onInterruptSpeech}
                aria-label="Stop speech"
                className="key flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-amber-hud"
              >
                <VolumeX className="h-4 w-4" />
                Interrupt
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground hidden sm:inline-block">
              [ESC] Exit Voice Mode
            </span>
            <button
              onClick={onClose}
              className="key rounded-xl px-4 py-2.5 text-xs font-bold text-foreground hover:text-cyan-hud"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
