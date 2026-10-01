import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Activity, Bell, Gauge, Power, Settings2, X } from "lucide-react";
import { toast } from "sonner";

import { useJarvis, useNow } from "./JarvisProvider";
import { timeAgo } from "@/lib/jarvis-data";
import { cn } from "@/lib/utils";

function Gauge3({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit?: string;
  color: string;
}) {
  return (
    <div className="neu-inset flex items-center gap-2.5 rounded-xl px-3 py-1.5">
      <span className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className="font-mono text-[12px] font-bold tabular-nums" style={{ color }}>
        {value}
        {unit}
      </span>
      <span className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-[oklch(0.13_0.01_256)] shadow-[inset_0_1px_2px_oklch(0_0_0/70%)] lg:inline-block">
        <i
          className="block h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(100, value)}%`,
            background: `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 35%, transparent))`,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </span>
    </div>
  );
}

export function TopBar() {
  const {
    unread,
    notifications,
    markAllRead,
    clearNotifications,
    dismissNotification,
    cpu,
    ram,
    net,
    telemetryOn,
    setTelemetryOn,
    setView,
    voiceListening,
    voiceThinking,
    voiceSpeaking,
    voiceAudioLevel,
  } = useJarvis();
  const now = useNow();

  return (
    <header className="bezel relative z-50 flex h-[4.25rem] items-center justify-between gap-4 rounded-2xl px-4 sm:px-5">
      <div className="gloss pointer-events-none absolute inset-0 rounded-2xl" />
      <div className="flex min-w-0 items-center gap-3">
        <span className="neu relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl">
          <span className="absolute inset-1 animate-ping-ring rounded-xl border border-cyan-hud/40" />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6 drop-shadow-[0_0_8px_var(--cyan-hud)]"
          >
            <path
              d="M12 2L2 8l10 6 10-6-10-6z"
              stroke="var(--cyan-hud)"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M2 16l10 6 10-6M2 12l10 6 10-6"
              stroke="var(--cyan-hud)"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="font-display etched block truncate text-lg font-bold tracking-[0.3em] text-foreground">
            JARVIS
          </span>
          <span className="block text-[9.5px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Console MK-VII
          </span>
        </span>
      </div>

      <div className="hidden items-center gap-2 xl:flex">
        <Gauge3 label="CPU" value={cpu} unit="%" color="var(--cyan-hud)" />
        <Gauge3 label="RAM" value={ram} unit="%" color="var(--violet-hud)" />
        <Gauge3 label="NET" value={Math.round(net)} unit=" KB/s" color="var(--emerald-hud)" />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="neu-inset hidden rounded-xl px-3 py-1.5 font-mono text-xs tabular-nums text-cyan-hud sm:inline-block">
          {now
            ? new Date(now).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })
            : "--:--:--"}
        </span>

        {/* Live Voice Protocol Status */}
        <div className="neu-inset hidden md:flex items-center gap-2 rounded-xl px-2.5 py-1.5 font-mono text-xs border border-hairline">
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full animate-ping opacity-75",
                voiceSpeaking
                  ? "bg-violet-hud"
                  : voiceListening
                    ? "bg-cyan-hud"
                    : "bg-muted-foreground",
              )}
            />
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                voiceSpeaking
                  ? "bg-violet-hud"
                  : voiceListening
                    ? "bg-cyan-hud"
                    : "bg-muted-foreground",
              )}
            />
          </span>
          <span className="text-[10px] font-bold tracking-wider text-foreground">
            {voiceSpeaking
              ? "SPEAKING"
              : voiceThinking
                ? "THINKING"
                : voiceListening
                  ? "VOICE ON"
                  : "MUTED"}
          </span>
          <span className="flex items-end gap-[2px] h-3 ml-0.5">
            {[0.4, 0.9, 0.6, 1, 0.5].map((h, i) => (
              <span
                key={i}
                className={cn(
                  "w-[2px] rounded-full transition-all duration-75",
                  voiceSpeaking ? "bg-violet-hud" : "bg-cyan-hud",
                )}
                style={{
                  height: `${Math.max(
                    2,
                    Math.min(
                      12,
                      voiceListening || voiceSpeaking
                        ? Math.max(0.15, voiceAudioLevel) * 12 * h
                        : 2,
                    ),
                  )}px`,
                }}
              />
            ))}
          </span>
        </div>

        <button
          onClick={() => setTelemetryOn(!telemetryOn)}
          aria-label="Toggle live telemetry"
          title={telemetryOn ? "Live telemetry on" : "Telemetry frozen"}
          className={cn(
            "key grid h-10 w-10 place-items-center rounded-xl",
            telemetryOn
              ? "text-emerald-hud glow-ring"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Activity className="h-4 w-4" />
        </button>

        <Popover onOpenChange={(o) => o && markAllRead()}>
          <PopoverTrigger asChild>
            <button
              aria-label="Notifications"
              className="key relative grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:text-cyan-hud"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="led absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center bg-amber-hud px-1 text-[10px] font-extrabold text-background">
                  {unread}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={14}
            className="glass z-[9999] w-[min(24rem,calc(100vw-2rem))] border-hairline bg-[oklch(0.24_0.013_256/_95%)] p-0 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <span className="text-xs font-bold tracking-[0.2em] text-foreground">
                NOTIFICATIONS
              </span>
              <button
                onClick={clearNotifications}
                className="key rounded-lg px-2.5 py-1 text-[11px] font-semibold text-cyan-hud"
              >
                Clear all
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2.5">
              {notifications.length === 0 && (
                <p className="py-10 text-center text-xs text-muted-foreground">
                  No signals. All quiet on the network.
                </p>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => toast(n.title, { description: timeAgo(n.at) })}
                  className="neu-sm group animate-rise-in mb-2 flex cursor-pointer gap-3 rounded-xl p-3 last:mb-0 transition-colors hover:border-cyan-hud/40"
                >
                  <span className="neu-inset grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm">
                    {n.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-relaxed text-foreground">{n.title}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {timeAgo(n.at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(n.id);
                    }}
                    aria-label="Dismiss"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <button
          onClick={() => setView("mission")}
          aria-label="Mission control"
          className="key hidden h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:text-cyan-hud sm:grid"
        >
          <Gauge className="h-4 w-4" />
        </button>

        <button
          onClick={() => setView("settings")}
          aria-label="Settings"
          className="key grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:text-cyan-hud"
        >
          <Settings2 className="h-4 w-4" />
        </button>

        <div className="neu grid h-10 w-10 place-items-center rounded-full text-cyan-hud">
          <Power className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
