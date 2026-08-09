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
import { askJarvis } from "@/lib/jarvis-agent.functions";
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

const VIEWS: ViewKey[] = [
  "dashboard",
  "memory",
  "agents",
  "connectors",
  "mission",
  "workflows",
  "settings",
];

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
      role: "jarvis",
      text: "Good to see you, Gopi. Every subsystem is online — say “Jarvis” or press the microphone whenever you're ready.",
      at: Date.now() - 5_000,
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interim, setInterim] = useState("");
  const [speechOn, setSpeechOn] = useState(true);
  const [voiceRate, setVoiceRate] = useState(1.04);
  const [voiceName, setVoiceName] = useState<string>("");
  const [voices, setVoices] = useState<{ name: string; lang: string }[]>([]);
  const [autonomy, setAutonomy] = useState(72);
  const [wakeWord, setWakeWord] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [cpu, setCpu] = useState(18);
  const [ram, setRam] = useState(42);
  const [net, setNet] = useState(120.4);

  const recognitionRef = useRef<any>(null);
  const listeningRef = useRef(false);
  const wakeWordRef = useRef(false);
  const speakingRef = useRef(false);
  const stateRef = useRef({ agents, missions, cpu, ram, net, autonomy, messages });
  stateRef.current = { agents, missions, cpu, ram, net, autonomy, messages };

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

  const pushLog = useCallback((text: string) => {
    setLog((l) => [{ id: uid(), text, at: Date.now() }, ...l].slice(0, 40));
  }, []);

  const pushNotification = useCallback((icon: string, title: string) => {
    setNotifications((n) => [{ id: uid(), icon, title, at: Date.now(), read: false }, ...n].slice(0, 30));
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
  }, [pushLog, pushNotification]);

  const markAllRead = useCallback(
    () => setNotifications((n) => n.map((x) => ({ ...x, read: true }))),
    [],
  );
  const clearNotifications = useCallback(() => setNotifications([]), []);
  const dismissNotification = useCallback(
    (id: string) => setNotifications((n) => n.filter((x) => x.id !== id)),
    [],
  );

  /* ------- speech synthesis ------- */
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => {
      const list = window.speechSynthesis.getVoices();
      if (!list.length) return;
      setVoices(list.map((v) => ({ name: v.name, lang: v.lang })));
      setVoiceName((cur) => {
        if (cur) return cur;
        const preferred =
          list.find((v) => /daniel|google uk english male|arthur|male/i.test(v.name) && /en/i.test(v.lang)) ??
          list.find((v) => /en-GB/i.test(v.lang)) ??
          list.find((v) => /en/i.test(v.lang));
        return preferred?.name ?? list[0]?.name ?? "";
      });
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    speakingRef.current = false;
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!speechOn || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const match = window.speechSynthesis.getVoices().find((v) => v.name === voiceName);
      if (match) u.voice = match;
      u.rate = voiceRate;
      u.pitch = 0.92;
      u.onstart = () => {
        speakingRef.current = true;
        setSpeaking(true);
      };
      u.onend = u.onerror = () => {
        speakingRef.current = false;
        setSpeaking(false);
      };
      window.speechSynthesis.speak(u);
    },
    [speechOn, voiceName, voiceRate],
  );

  /* ------- agents ------- */
  const setAgentStatus = useCallback(
    (id: string, status: Agent["status"]) => {
      setAgents((prev) =>
        prev.map((a) => {
          if (a.id !== id || a.status === status) return a;
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

  const toggleAgent = useCallback(
    (id: string) => {
      const a = stateRef.current.agents.find((x) => x.id === id);
      if (!a) return;
      setAgentStatus(id, a.status === "running" ? "stopped" : "running");
    },
    [setAgentStatus],
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
      return m;
    },
    [pushLog, pushNotification],
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

  /* ------- action execution ------- */
  const runAction = useCallback(
    (action: string, target: string) => {
      const t = target.trim();
      const findMission = () =>
        stateRef.current.missions.find((m) => m.title.toLowerCase().includes(t.toLowerCase())) ??
        stateRef.current.missions.find((m) => m.status === "progress");
      const findAgent = () =>
        stateRef.current.agents.find((a) => a.name.toLowerCase().includes(t.toLowerCase()));

      switch (action) {
        case "create_mission":
          createMission(t || "Untitled Mission", "Dispatched by voice command.");
          break;
        case "pause_mission": {
          const m = findMission();
          if (m) setMissionStatus(m.id, "paused");
          break;
        }
        case "resume_mission": {
          const m = findMission();
          if (m) setMissionStatus(m.id, "progress");
          break;
        }
        case "cancel_mission": {
          const m = findMission();
          if (m) setMissionStatus(m.id, "cancelled");
          break;
        }
        case "start_agent": {
          const a = findAgent();
          if (a) setAgentStatus(a.id, "running");
          break;
        }
        case "stop_agent": {
          const a = findAgent();
          if (a) setAgentStatus(a.id, "stopped");
          break;
        }
        case "navigate": {
          const v = VIEWS.find((x) => x === t.toLowerCase());
          if (v) setView(v);
          break;
        }
        case "clear_chat":
          setMessages([]);
          break;
        case "speak_off":
          setSpeechOn(false);
          break;
        case "speak_on":
          setSpeechOn(true);
          break;
        default:
          break;
      }
    },
    [createMission, setAgentStatus, setMissionStatus],
  );

  /* ------- conversation (AI brain) ------- */
  const sendMessage = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      stopSpeaking();
      setInterim("");
      setMessages((m) => [...m, { id: uid(), role: "user", text: clean, at: Date.now() }]);
      setThinking(true);

      const s = stateRef.current;
      const context = [
        `CPU ${s.cpu}% | RAM ${s.ram}% | NET ${s.net} KB/s | autonomy ${s.autonomy}%`,
        `Agents: ${s.agents.map((a) => `${a.name} (${a.status}, load ${a.load}%)`).join("; ")}`,
        `Missions: ${s.missions
          .map((m) => `${m.title} (${m.status}, ${Math.round(m.progress)}%)`)
          .join("; ")}`,
        `Current view: ${view}`,
      ].join("\n");

      const history = [...s.messages, { role: "user" as const, text: clean, id: "", at: 0 }]
        .slice(-12)
        .map((m) => ({
          role: (m.role === "jarvis" ? "assistant" : "user") as "assistant" | "user",
          text: m.text,
        }));

      try {
        const out = await askJarvis({ data: { messages: history, context } });
        const reply = out?.reply?.trim() || "Understood.";
        const action = out?.action ?? "none";
        setMessages((m) => [
          ...m,
          {
            id: uid(),
            role: "jarvis",
            text: reply,
            at: Date.now(),
            kind: action !== "none" ? "confirm" : "normal",
          },
        ]);
        if (action !== "none") {
          runAction(action, out.target ?? "");
          pushLog(`Voice action executed: ${action}${out.target ? ` → ${out.target}` : ""}.`);
        }
        speak(reply);
      } catch (err) {
        console.error(err);
        const fallback =
          "My uplink to the reasoning core failed. Core systems remain nominal — try again in a moment.";
        setMessages((m) => [...m, { id: uid(), role: "jarvis", text: fallback, at: Date.now() }]);
        toast.error("Reasoning core unreachable");
        speak(fallback);
      } finally {
        setThinking(false);
      }
    },
    [pushLog, runAction, speak, stopSpeaking, view],
  );

  const sendMessageRef = useRef(sendMessage);
  sendMessageRef.current = sendMessage;

  const clearChat = useCallback(() => {
    setMessages([]);
    toast("Conversation log cleared");
  }, []);

  /* ------- voice input ------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setMicSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;

    rec.onresult = (e: any) => {
      let final = "";
      let partial = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else partial += r[0].transcript;
      }
      setInterim(partial);
      const said = final.trim();
      if (!said) return;

      if (wakeWordRef.current && !listeningRef.current) {
        if (/\b(jarvis|friday)\b/i.test(said)) {
          const command = said.replace(/.*\b(jarvis|friday)\b[,.\s]*/i, "").trim();
          if (command) sendMessageRef.current(command);
          else {
            listeningRef.current = true;
            setListening(true);
          }
        }
        return;
      }
      if (listeningRef.current) sendMessageRef.current(said);
    };

    rec.onerror = (e: any) => {
      if (e?.error === "not-allowed") {
        toast.error("Microphone access denied");
        wakeWordRef.current = false;
        setWakeWord(false);
        listeningRef.current = false;
        setListening(false);
      }
    };

    rec.onend = () => {
      if (listeningRef.current || wakeWordRef.current) {
        try {
          rec.start();
        } catch {
          /* already starting */
        }
      } else {
        setInterim("");
      }
    };

    recognitionRef.current = rec;
    return () => {
      listeningRef.current = false;
      wakeWordRef.current = false;
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    };
  }, []);

  const syncRecognition = useCallback((active: boolean) => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      if (active) rec.start();
      else rec.stop();
    } catch {
      /* already in that state */
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!micSupported) {
      toast.error("Voice capture isn't supported in this browser");
      return;
    }
    const next = !listeningRef.current;
    listeningRef.current = next;
    setListening(next);
    if (next) {
      stopSpeaking();
      syncRecognition(true);
    } else if (!wakeWordRef.current) {
      syncRecognition(false);
    }
  }, [micSupported, stopSpeaking, syncRecognition]);

  const setWakeWordEnabled = useCallback(
    (on: boolean) => {
      if (on && !micSupported) {
        toast.error("Voice capture isn't supported in this browser");
        return;
      }
      wakeWordRef.current = on;
      setWakeWord(on);
      if (on) {
        syncRecognition(true);
        toast("Wake word armed — say “Jarvis”");
      } else if (!listeningRef.current) {
        syncRecognition(false);
      }
    },
    [micSupported, syncRecognition],
  );

  const unread = notifications.filter((n) => !n.read).length;

  return {
    view,
    setView,
    agents,
    toggleAgent,
    setAgentStatus,
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
    speaking,
    interim,
    toggleListening,
    stopSpeaking,
    micSupported,
    speechOn,
    setSpeechOn,
    voices,
    voiceName,
    setVoiceName,
    voiceRate,
    setVoiceRate,
    speak,
    autonomy,
    setAutonomy,
    wakeWord,
    setWakeWord: setWakeWordEnabled,
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

export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
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
