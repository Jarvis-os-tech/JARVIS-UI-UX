import { useJarvis } from "./JarvisProvider";

export function OrbStage() {
  const { listening, thinking, speaking, cpu } = useJarvis();
  const active = listening || thinking || speaking;


  return (
    <div className="relative grid min-h-0 flex-1 place-items-center py-2">
      <svg viewBox="0 0 760 560" className="h-full max-h-[26rem] w-full">
        <defs>
          <radialGradient id="coreGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="var(--cyan-hud)" stopOpacity="0.42" />
            <stop offset="60%" stopColor="var(--blue-hud)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--cyan-hud)" stopOpacity="0.65" />
            <stop offset="50%" stopColor="var(--violet-hud)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--cyan-hud)" stopOpacity="0.1" />
          </linearGradient>
          <filter id="soft">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <g style={{ transformOrigin: "380px 280px" }} className="animate-spin-slow">
          <ellipse cx="380" cy="280" rx="280" ry="150" fill="none" stroke="url(#ringGrad)" strokeWidth="1.2" strokeDasharray="4 9" />
          <circle cx="660" cy="280" r="7" fill="var(--violet-hud)" />
          <circle cx="100" cy="280" r="5" fill="var(--cyan-hud)" />
        </g>
        <g style={{ transformOrigin: "380px 280px" }} className="animate-spin-slower">
          <ellipse cx="380" cy="280" rx="340" ry="205" fill="none" stroke="url(#ringGrad)" strokeWidth="1" transform="rotate(18 380 280)" />
          <circle cx="716" cy="300" r="6" fill="var(--emerald-hud)" />
          <circle cx="52" cy="262" r="6" fill="var(--cyan-hud)" />
        </g>
        <g style={{ transformOrigin: "380px 280px" }} className="animate-spin-slow">
          <ellipse cx="380" cy="280" rx="200" ry="235" fill="none" stroke="url(#ringGrad)" strokeWidth="1" transform="rotate(-26 380 280)" strokeDasharray="2 12" />
          <circle cx="560" cy="440" r="6" fill="var(--amber-hud)" />
          <circle cx="212" cy="118" r="5" fill="var(--blue-hud)" />
        </g>

        <circle cx="380" cy="280" r="150" fill="url(#coreGrad)" filter="url(#soft)" className="animate-core-pulse" />
        <circle
          cx="380"
          cy="280"
          r="96"
          fill="color-mix(in oklab, var(--cyan-hud) 5%, transparent)"
          stroke="var(--cyan-hud)"
          strokeWidth={active ? 2 : 1.3}
          className="animate-core-pulse"
        />
        <circle cx="380" cy="280" r="72" fill="none" stroke="var(--cyan-hud)" strokeOpacity="0.5" strokeWidth="1" />
        <circle
          cx="380"
          cy="280"
          r="118"
          fill="none"
          stroke="var(--cyan-hud)"
          strokeOpacity="0.28"
          strokeWidth="1"
          strokeDasharray={`${cpu * 3} 900`}
          transform="rotate(-90 380 280)"
        />

        {/* face */}
        <g transform="translate(380,262)">
          <ellipse cx="-16" cy="0" rx="4" ry={active ? 6 : 11} fill="var(--cyan-hud)">
            <animate attributeName="ry" values="11;3;11" dur="5s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="16" cy="0" rx="4" ry={active ? 6 : 11} fill="var(--cyan-hud)">
            <animate attributeName="ry" values="11;3;11" dur="5s" repeatCount="indefinite" />
          </ellipse>
          <path d="M-15 25 Q0 36 15 25" stroke="var(--cyan-hud)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
        <text
          x="380"
          y="352"
          textAnchor="middle"
          fill="var(--foreground)"
          fontSize="22"
          fontWeight="700"
          letterSpacing="9"
          fontFamily="var(--font-display)"
        >
          JARVIS
        </text>
      </svg>

      <div className="pointer-events-none absolute bottom-1 flex items-center gap-3 rounded-full border border-border bg-background/50 px-4 py-1.5 backdrop-blur-md">
        <span className="flex h-4 items-end gap-[3px]">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <i
              key={i}
              className="w-[3px] rounded-full bg-cyan-hud"
              style={{
                height: "100%",
                animation: active
                  ? `eq ${0.55 + (i % 4) * 0.16}s ease-in-out ${i * 0.06}s infinite`
                  : "none",
                transform: active ? undefined : "scaleY(0.22)",
                transformOrigin: "bottom",
                opacity: active ? 1 : 0.45,
              }}
            />
          ))}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {listening ? "Listening" : thinking ? "Reasoning" : speaking ? "Speaking" : "Standing by"}
        </span>

      </div>
    </div>
  );
}
