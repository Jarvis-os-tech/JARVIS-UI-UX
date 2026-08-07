import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  clock,
  missionAccents,
  missionIcons,
  seedAgents,
  seedMissions,
  seedNotifications,
  uid,
  type Agent,
  type ChatMessage,
  type LogEntry,
  type Mission,
  type MissionStatus,
  type Notification,
  type ViewKey,
} from "@/lib/jarvis-data";

type Ctx = ReturnType<typeof useJarvisState>;

const JarvisContext = createContext<Ctx | null>(null);

function useJarvisState() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [agents, setAgents] = useState<Agent[]>(seedAgents);
  const [missions, setMissions] = useState<Mission[]>(seedMissions);
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const [log, setLog] = useState<LogEntry[]>([
    { id: uid(), text: "Orchestrator core online — 4 agents linked.", at: Date.now() - 600_000 },
    { id: uid(), text: "Mission “Infrastructure Health Check” completed.", at: Date.now() - 3_500_000 },
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "user",
      text: "Show me the running agents and system status.",
      at: Date.now() - 300_000,
    },
    {
      id: uid(),
      role: "jarvis",
      text: "Four agents are live. Core load is nominal at 46%, all links stable.",
      at: Date.now() - 296_000,
    },
    {
      id: uid(),
      role: "user",
      text: "Schedule a system health check every morning at 8 AM.",
      at: Date.now() - 120_000,
    },
    {
      id: uid(),
      role: "jarvis",
      kind: "confirm",
      text: "Scheduled. The health check protocol will execute daily at 8:00 AM.",
      at: Date.now() - 118_000,
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechOn, setSpeechOn] = useState(true);
  const [autonomy, setAutonomy] = useState(72);
  const [wakeWord, setWakeWord] = useState(true);
  const [cpu, setCpu] = useState(18);
  const [ram, setRam] = useState(42);
  const [net, setNet] = useState(120.4);
  const recognitionRef = useRef<any>(null);

  /* ------- live telemetry ------- */
  useEffect(() => {
    const t = setInterval(() => {
      setCpu(14 + Math.round(Math.random() * 16));
      setRam(36 + Math.round(Math.random() * 14));
      setNet(Number((80 + Math.random() * 90).toFixed(1)));
      setAgents((prev) =>
        prev.map((a) =>
          a.status === "running"
            ? { ...a, load: Math.max(8, Math.min(96, a.load + Math.round((Math.random() - 0.5) * 14))) }
            : a,
        ),
      );
    }, 2500);
    return () => clearInterval(t);
  }, []);

  /* ------- autonomous mission progress ------- */
  useEffect(() => {
    const t = setInterval(() => {
      setMissions((prev) =>
        prev.map((m) => {
          if (m.status !== "progress") return m;
          const next = Math.min(100, m.progress + Math.random() * 4);
          if (next >= 100) {
            queueMicrotask(() => {
              pushNotification("✔", `Mission “${m.title}” completed autonomously.`);
              pushLog(`Mission “${m.title}” reached 100% and closed.`);
            });
            return { ...m, progress: 100, status: "done" as MissionStatus };
          }
          return { ...m, progress: next };
        }),
      );
    }, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushLog = useCallback((text: string) => {
    setLog((l) => [{ id: uid(), text, at: Date.now() }, ...l].slice(0, 40));
  }, []);

  const pushNotification = useCallback((icon: string, title: string) => {
    setNotifications((n) => [{ id: uid(), icon, title, at: Date.now(), read: false }, ...n].slice(0, 30));
  }, []);

  const markAllRead = useCallback(
    () => setNotifications((n) => n.map((x) => ({ ...x, read: true }))),
    [],
  );
  const clearNotifications = useCallback(() => setNotifications([]), []);
  const dismissNotification = useCallback(
    (id: string) => setNotifications((n) => n.filter((x) => x.id !== id)),
    [],
  );

  /* ------- speech ------- */
  const speak = useCallback(
    (text: string) => {
      if (!speechOn || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.04;
      u.pitch = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    },
    [speechOn],
  );

  /* ------- agents ------- */
  const toggleAgent = useCallback(
    (id: string) => {
      setAgents((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          const status = a.status === "running" ? "stopped" : "running";
          queueMicrotask(() => {
            pushLog(`${a.name} ${status === "running" ? "activated" : "suspended"}.`);
            pushNotification(status === "running" ? "▶" : "⏸", `${a.name} ${status}.`);
            toast(`${a.name} ${status === "running" ? "activated" : "suspended"}`);
          });
          return {
            ...a,
            status,
            load: status === "running" ? 20 + Math.round(Math.random() * 30) : 0,
            uptimeMin: status === "running" ? 1 : 0,
            tasks: status === "running" ? a.tasks : 0,
          };
        }),
      );
    },
    [pushLog, pushNotification],
  );

  /* ------- missions ------- */
  const createMission = useCallback(
    (title: string, desc: string) => {
      const m: Mission = {
        id: uid(),
        title,
        desc: desc || "Autonomously planned by the orchestrator core.",
        icon: missionIcons[Math.floor(Math.random() * missionIcons.length)] ?? "🎯",
        accent: missionAccents[Math.floor(Math.random() * missionAccents.length)] ?? "var(--cyan-hud)",
        status: "progress",
        progress: 0,
        createdAt: Date.now(),
      };
      setMissions((prev) => [m, ...prev]);
      pushLog(`Mission “${title}” dispatched.`);
      pushNotification("🎯", `New mission dispatched: ${title}`);
      toast.success(`Mission dispatched: ${title}`);
      speak(`Mission ${title} dispatched.`);
      return m;
    },
    [pushLog, pushNotification, speak],
  );

  const setMissionStatus = useCallback(
    (id: string, status: MissionStatus) => {
      setMissions((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          queueMicrotask(() => pushLog(`Mission “${m.title}” → ${status}.`));
          return { ...m, status, progress: status === "done" ? 100 : m.progress };
        }),
      );
    },
    [pushLog],
  );

  const removeMission = useCallback(
    (id: string) => {
      setMissions((prev) => {
        const m = prev.find((x) => x.id === id);
        if (m) queueMicrotask(() => pushLog(`Mission “${m.title}” removed.`));
        return prev.filter((x) => x.id !== id);
      });
    },
    [pushLog],
  );

  /* ------- conversation ------- */
  const respond = useCallback(
    (input: string) => {
      const text = input.toLowerCase();
      let reply = "";
      let kind: ChatMessage["kind"] = "normal";

      if (/(create|start|launch|dispatch|new)\s+(a\s+)?mission/.test(text)) {
        const title = input.replace(/.*mission(\s+(to|for|called))?/i, "").trim() || "Untitled Mission";
        createMission(title.charAt(0).toUpperCase() + title.slice(1), "Dispatched by voice command.");
        reply = `Mission “${title}” has been dispatched and is now executing.`;
        kind = "confirm";
      } else if (/status|system|health|cpu|ram/.test(text)) {
        reply = `All systems nominal. CPU at ${cpu}%, memory at ${ram}%, network throughput ${net} KB/s.`;
      } else if (/agent/.test(text)) {
        const running = agents.filter((a) => a.status === "running");
        reply = `${running.length} agents online: ${running.map((a) => a.name).join(", ")}.`;
      } else if (/mission|task/.test(text)) {
        const active = missions.filter((m) => m.status === "progress");
        reply = active[0]
          ? `${active.length} missions in flight. Leading: “${active[0].title}” at ${Math.round(active[0].progress)}%.`
          : "No missions are currently in flight. Say the word and I'll dispatch one.";
      } else if (/stop listening|sleep|standby/.test(text)) {
        reply = "Entering standby. Say “Jarvis” whenever you need me.";
      } else if (/hello|hi|hey|jarvis/.test(text)) {
        reply = "I'm here. Every subsystem is standing by for your orders.";
      } else {
        reply = `Understood. I'm decomposing “${input}” into an execution plan and routing it through the orchestrator core.`;
      }

      setThinking(true);
      window.setTimeout(() => {
        setThinking(false);
        setMessages((m) => [...m, { id: uid(), role: "jarvis", text: reply, at: Date.now(), kind }]);
        speak(reply);
      }, 850);
    },
    [agents, cpu, createMission, missions, net, ram, speak],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      setMessages((m) => [...m, { id: uid(), role: "user", text: clean, at: Date.now() }]);
      respond(clean);
    },
    [respond],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    toast("Conversation log cleared");
  }, []);

  /* ------- voice input ------- */
  const toggleListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice capture isn't supported in this browser");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript as string;
      sendMessage(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, sendMessage]);

  const unread = notifications.filter((n) => !n.read).length;

  return {
    view,
    setView,
    agents,
    toggleAgent,
    missions,
    createMission,
    setMissionStatus,
    removeMission,
    notifications,
    unread,
    pushNotification,
    markAllRead,
    clearNotifications,
    dismissNotification,
    log,
    pushLog,
    messages,
    sendMessage,
    clearChat,
    thinking,
    listening,
    toggleListening,
    speechOn,
    setSpeechOn,
    autonomy,
    setAutonomy,
    wakeWord,
    setWakeWord,
    cpu,
    ram,
    net,
    clock,
  };
}

export function JarvisProvider({ children }: { children: ReactNode }) {
  const value = useJarvisState();
  return <JarvisContext.Provider value={value}>{children}</JarvisContext.Provider>;
}

export function useJarvis() {
  const ctx = useContext(JarvisContext);
  if (!ctx) throw new Error("useJarvis must be used inside JarvisProvider");
  return ctx;
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function useStats() {
  const { missions, agents } = useJarvis();
  return useMemo(
    () => ({
      active: missions.filter((m) => m.status === "progress").length,
      paused: missions.filter((m) => m.status === "paused").length,
      done: missions.filter((m) => m.status === "done").length,
      pending: missions.filter((m) => m.status === "pending").length,
      running: agents.filter((a) => a.status === "running").length,
      stopped: agents.filter((a) => a.status === "stopped").length,
    }),
    [missions, agents],
  );
}
