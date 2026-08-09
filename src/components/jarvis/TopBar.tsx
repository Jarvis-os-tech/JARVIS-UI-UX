import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Mic, MicOff, Radar, Settings2, Volume2, VolumeX, X } from "lucide-react";

import { useJarvis, useNow } from "./JarvisProvider";
import { timeAgo } from "@/lib/jarvis-data";
import { cn } from "@/lib/utils";

function Meter({ value }: { value: number }) {
  return (
    <span className="hidden h-1 w-12 overflow-hidden rounded-full bg-foreground/10 lg:inline-block">
      <i
        className="block h-full rounded-full bg-[linear-gradient(90deg,var(--cyan-hud),var(--blue-hud))] transition-all duration-700"
        style={{ width: `${value}%` }}
      />
    </span>
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
    listening,
    toggleListening,
    speechOn,
    setSpeechOn,
    setView,
  } = useJarvis();
  const now = useNow();

  return (
    <header className="glass relative z-50 flex h-16 items-center justify-between gap-4 rounded-2xl px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative grid h-9 w-9 shrink-0 place-items-center">
          <span className="absolute inset-0 animate-ping-ring rounded-full border border-cyan-hud/50" />
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 drop-shadow-[0_0_8px_var(--cyan-hud)]">
            <path d="M12 2L2 8l10 6 10-6-10-6z" stroke="var(--cyan-hud)" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M2 16l10 6 10-6M2 12l10 6 10-6" stroke="var(--cyan-hud)" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="font-display truncate text-lg font-bold tracking-[0.28em] text-foreground">
          JARVIS
        </span>
      </div>

      <div className="hidden items-center gap-6 text-xs text-muted-foreground xl:flex">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-hud shadow-[0_0_10px_var(--emerald-hud)]" />
          <span className="font-semibold text-foreground">Autonomous</span>
        </span>
        <span className="flex items-center gap-2">
          CPU <b className="font-mono text-foreground">{cpu}%</b>
          <Meter value={cpu} />
        </span>
        <span className="flex items-center gap-2">
          RAM <b className="font-mono text-foreground">{ram}%</b>
          <Meter value={ram} />
        </span>
        <span className="flex items-center gap-2">
          NET <b className="font-mono text-foreground">{net} KB/s</b>
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden font-mono text-xs tabular-nums text-muted-foreground sm:inline">
          {now
            ? new Date(now).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })
            : "--:--:--"}
        </span>

        <button
          onClick={toggleListening}
          aria-label={listening ? "Stop listening" : "Start voice command"}
          className={cn(
            "grid h-9 w-9 place-items-center rounded-xl border transition-all",
            listening
              ? "border-cyan-hud/60 bg-cyan-hud/15 text-cyan-hud glow-ring"
              : "border-border bg-foreground/5 text-muted-foreground hover:border-cyan-hud/50 hover:text-cyan-hud",
          )}
        >
          {listening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </button>

        <button
          onClick={() => setSpeechOn(!speechOn)}
          aria-label="Toggle voice output"
          className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-foreground/5 text-muted-foreground transition-all hover:border-cyan-hud/50 hover:text-cyan-hud"
        >
          {speechOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>

        <Popover onOpenChange={(o) => o && markAllRead()}>
          <PopoverTrigger asChild>
            <button
              aria-label="Notifications"
              className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-foreground/5 text-muted-foreground transition-all hover:border-cyan-hud/50 hover:text-cyan-hud"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-amber-hud px-1 text-[10px] font-extrabold text-background shadow-[0_0_10px_var(--amber-hud)]">
                  {unread}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={10}
            className="z-[100] w-[min(22rem,calc(100vw-2rem))] border-border bg-popover/95 p-0 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-xs font-bold tracking-[0.18em] text-foreground">NOTIFICATIONS</span>
              <button
                onClick={clearNotifications}
                className="text-[11px] font-semibold text-cyan-hud hover:underline"
              >
                Clear all
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {notifications.length === 0 && (
                <p className="py-10 text-center text-xs text-muted-foreground">
                  No signals. All quiet on the network.
                </p>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="group animate-rise-in mb-1.5 flex gap-3 rounded-xl border border-border bg-foreground/[0.03] p-3 last:mb-0"
                >
                  <span className="text-sm leading-5">{n.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-relaxed text-foreground">{n.title}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{timeAgo(n.at)}</p>
                  </div>
                  <button
                    onClick={() => dismissNotification(n.id)}
                    aria-label="Dismiss"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <button
          onClick={() => setView("settings")}
          aria-label="Settings"
          className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-foreground/5 text-muted-foreground transition-all hover:border-cyan-hud/50 hover:text-cyan-hud"
        >
          <Settings2 className="h-4 w-4" />
        </button>

        <div className="grid h-9 w-9 place-items-center rounded-full border border-cyan-hud/60 bg-cyan-hud/10 shadow-[var(--glow-cyan)]">
          <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
            <circle cx="12" cy="9" r="3" stroke="var(--cyan-hud)" strokeWidth="1.5" />
            <path d="M5 20c1.5-3.5 4.5-5 7-5s5.5 1.5 7 5" stroke="var(--cyan-hud)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </header>
  );
}
