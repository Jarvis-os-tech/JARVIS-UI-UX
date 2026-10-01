import React, { useMemo } from "react";
import { Mic, MicOff, Volume2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LiveVoiceOrbitProps {
  size?: "sm" | "md" | "lg";
  isListening?: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean;
  audioLevel?: number;
  transcript?: string;
  onClick?: () => void;
  className?: string;
  showStatusLabel?: boolean;
}

export function LiveVoiceOrbit({
  size = "sm",
  isListening = true,
  isThinking = false,
  isSpeaking = false,
  audioLevel = 0,
  transcript,
  onClick,
  className,
  showStatusLabel = false,
}: LiveVoiceOrbitProps) {
  // Theme and status descriptors based on current voice loop state
  const stateTheme = useMemo(() => {
    if (isThinking) {
      return {
        accent: "var(--amber-hud)",
        ringColor: "#fbbf24",
        glow: "rgba(251, 191, 36, 0.55)",
        status: "THINKING",
        desc: "Synthesizing AG-UI directive...",
        badgeBg: "bg-amber-hud/15 text-amber-hud border-amber-hud/40",
      };
    }
    if (isSpeaking) {
      return {
        accent: "var(--violet-hud)",
        ringColor: "#a78bfa",
        glow: "rgba(167, 139, 250, 0.55)",
        status: "SPEAKING",
        desc: "Transmitting response audio...",
        badgeBg: "bg-violet-hud/15 text-violet-hud border-violet-hud/40",
      };
    }
    if (isListening) {
      return {
        accent: "var(--cyan-hud)",
        ringColor: "#2dd4eb",
        glow: "rgba(45, 212, 235, 0.5)",
        status: "LISTENING",
        desc: "Voice active · speak naturally",
        badgeBg: "bg-cyan-hud/15 text-cyan-hud border-cyan-hud/40",
      };
    }
    return {
      accent: "var(--muted-foreground)",
      ringColor: "#71717a",
      glow: "rgba(113, 113, 122, 0.2)",
      status: "MUTED",
      desc: "Microphone off · click to enable",
      badgeBg: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
    };
  }, [isListening, isThinking, isSpeaking]);

  // Size configurations
  const dimensions = {
    sm: {
      container: "h-11 w-11",
      svgSize: 44,
      coreSize: "h-6 w-6",
      iconSize: "h-3 w-3",
      glowScale: 1.25,
    },
    md: {
      container: "h-16 w-16",
      svgSize: 64,
      coreSize: "h-9 w-9",
      iconSize: "h-4 w-4",
      glowScale: 1.35,
    },
    lg: {
      container: "h-44 w-44 sm:h-52 sm:w-52",
      svgSize: 200,
      coreSize: "h-20 w-20 sm:h-24 sm:w-24",
      iconSize: "h-8 w-8 sm:h-9 sm:w-9",
      glowScale: 1.5,
    },
  }[size];

  // Dynamic visual reactive scales
  const coreScale = 1 + Math.min(0.4, audioLevel * 0.45);
  const ringScale = 1 + Math.min(0.15, audioLevel * 0.2);

  const tooltipText = isSpeaking
    ? "JARVIS Speaking · Click to interrupt"
    : isThinking
      ? "JARVIS Thinking..."
      : isListening
        ? "JARVIS Listening continuously · Click to mute"
        : "JARVIS Muted · Click to activate voice";

  return (
    <div className={cn("relative flex items-center gap-3", className)}>
      <button
        type="button"
        onClick={onClick}
        title={tooltipText}
        aria-label={tooltipText}
        className={cn(
          "relative grid place-items-center rounded-2xl transition-all duration-200 select-none",
          dimensions.container,
          onClick ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default",
        )}
      >
        {/* Holographic Radial Ambient Glow */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full transition-transform duration-100 ease-out"
          style={{
            background: `radial-gradient(circle, ${stateTheme.glow} 0%, transparent 70%)`,
            transform: `scale(${coreScale * dimensions.glowScale})`,
            opacity: isListening || isSpeaking || isThinking ? 0.85 : 0.2,
          }}
        />

        {/* Multi-Ring Arc Reactor SVG */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full pointer-events-none"
          style={{
            transform: `scale(${ringScale})`,
            transition: "transform 0.1s ease-out",
          }}
        >
          {/* Outer Guideway Track */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="oklch(1 0 0 / 10%)"
            strokeWidth="1.2"
          />

          {/* Outer Rotating Segmented Ticks */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={stateTheme.accent}
            strokeWidth="1.6"
            strokeDasharray={size === "sm" ? "4 8 12 8" : "3 6 12 6 20 8"}
            className={cn(
              "origin-center transition-opacity duration-300",
              isThinking
                ? "animate-spin"
                : isListening || isSpeaking
                  ? "animate-spin-slow opacity-80"
                  : "opacity-30",
            )}
          />

          {/* Mid Counter-Rotating Gyro Track */}
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="var(--cyan-hud)"
            strokeWidth="1.2"
            strokeDasharray="10 14 30 8"
            className={cn(
              "origin-center opacity-60",
              isThinking ? "animate-spin-slower" : "animate-spin-slower",
            )}
          />

          {/* Inner Arc Orbit */}
          <circle
            cx="50"
            cy="50"
            r="27"
            fill="none"
            stroke={stateTheme.accent}
            strokeWidth="2"
            strokeDasharray="24 16 48 20"
            className={cn(
              "origin-center transition-opacity duration-300",
              isThinking
                ? "animate-spin"
                : isListening || isSpeaking
                  ? "animate-spin-slow opacity-90"
                  : "opacity-40",
            )}
          />
        </svg>

        {/* Central Glowing Core Button */}
        <div
          className={cn(
            "relative grid place-items-center rounded-full border border-hairline shadow-lg transition-transform duration-100 ease-out",
            dimensions.coreSize,
          )}
          style={{
            transform: `scale(${coreScale})`,
            boxShadow: `0 0 16px ${stateTheme.glow}, inset 0 0 10px ${stateTheme.glow}`,
          }}
        >
          <div
            className="flex h-full w-full items-center justify-center rounded-full border border-white/20 transition-all duration-300"
            style={{
              background: `radial-gradient(circle, #ffffff 0%, ${stateTheme.accent} 65%, transparent 100%)`,
            }}
          >
            {isSpeaking ? (
              <Volume2 className={cn(dimensions.iconSize, "text-black animate-pulse")} />
            ) : isThinking ? (
              <Activity className={cn(dimensions.iconSize, "text-black animate-spin")} />
            ) : isListening ? (
              <Mic className={cn(dimensions.iconSize, "text-black")} />
            ) : (
              <MicOff className={cn(dimensions.iconSize, "text-black opacity-70")} />
            )}
          </div>
        </div>

        {/* Active Ping Radiation when voice is hearing speech */}
        {(audioLevel > 0.08 || isSpeaking) && (
          <span
            className="pointer-events-none absolute inset-0 rounded-2xl border animate-ping-ring opacity-75"
            style={{ borderColor: stateTheme.ringColor }}
          />
        )}
      </button>

      {/* Optional Status Label / Live Feedback */}
      {showStatusLabel && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "rounded-md border px-1.5 py-0.2 font-mono text-[9.5px] font-bold uppercase tracking-wider",
                stateTheme.badgeBg,
              )}
            >
              {stateTheme.status}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground truncate">
              {transcript ? `"${transcript}"` : stateTheme.desc}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
