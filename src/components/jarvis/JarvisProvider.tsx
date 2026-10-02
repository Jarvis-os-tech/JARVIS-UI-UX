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
  seedDelegatedTasks,
  createDelegationCard,
  uid,
  type Agent,
  type ChatMessage,
  type DelegatedTask,
  type DelegatedOutputCard,
  type LogEntry,
  type Mission,
  type MissionStatus,
  type Notification,
  type ViewKey,
} from "@/lib/jarvis-data";
import type { AGUIEvent, AGUIMessage, AGUIThoughtStep, AGUIToolCall } from "@/lib/agui-types";
import { aguiClient } from "@/lib/agui-client";
import { useContinuousVoice } from "@/hooks/useContinuousVoice";

type Ctx = ReturnType<typeof useJarvisState>;

const JarvisContext = createContext<Ctx | null>(null);

const VIEWS: ViewKey[] = [
  "dashboard",
  "agentspace",
  "agents",
  "memory",
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
  const [delegatedTasks, setDelegatedTasks] = useState<DelegatedTask[]>(seedDelegatedTasks);
  const [activeOutputCard, setActiveOutputCard] = useState<DelegatedOutputCard | null>(null);
  const [log, setLog] = useState<LogEntry[]>([
    { id: uid(), text: "Orchestrator core online — 4 agents linked.", at: Date.now() - 600_000 },
    {
      id: uid(),
      text: "Mission “Infrastructure Health Check” completed.",
      at: Date.now() - 3_500_000,
    },
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "jarvis",
      text: "Console ready, Gopi. Type a directive or tap a command chip below.",
      at: Date.now() - 5_000,
    },
  ]);
  const [aguiMessages, setAguiMessages] = useState<AGUIMessage[]>([
    {
      id: uid(),
      role: "assistant",
      content:
        "Console online, Sir. I am listening for your directives via prompt stream or continuous hands-free voice orbit.",
      timestamp: Date.now() - 5_000,
      model: "AG-UI / MK-VII",
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [thinking, setThinking] = useState(false);
  const [autonomy, setAutonomy] = useState(72);
  const [density, setDensity] = useState(64);
  const [telemetryOn, setTelemetryOn] = useState(true);
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [confirmDestructive, setConfirmDestructive] = useState(true);
  const [cpu, setCpu] = useState(18);
  const [ram, setRam] = useState(42);
  const [net, setNet] = useState(120.4);

  const stateRef = useRef({ agents, missions, cpu, ram, net, autonomy });
  stateRef.current = { agents, missions, cpu, ram, net, autonomy };

  /* ------- live telemetry ------- */
  useEffect(() => {
    if (!telemetryOn) return;
    const t = setInterval(() => {
      setCpu(14 + Math.round(Math.random() * 16));
      setRam(36 + Math.round(Math.random() * 14));
      setNet(Number((80 + Math.random() * 90).toFixed(1)));
      setAgents((prev) =>
        prev.map((a) =>
          a.status === "running"
            ? {
                ...a,
                load: Math.max(8, Math.min(96, a.load + Math.round((Math.random() - 0.5) * 14))),
              }
            : a,
        ),
      );
    }, 2500);
    return () => clearInterval(t);
  }, [telemetryOn]);

  const pushLog = useCallback((text: string) => {
    setLog((l) => [{ id: uid(), text, at: Date.now() }, ...l].slice(0, 40));
  }, []);

  const pushNotification = useCallback((icon: string, title: string) => {
    setNotifications((n) =>
      [{ id: uid(), icon, title, at: Date.now(), read: false }, ...n].slice(0, 30),
    );
  }, []);

  /* ------- autonomous mission progress ------- */
  useEffect(() => {
    if (!autoDispatch) return;
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
  }, [autoDispatch, pushLog, pushNotification]);

  const markAllRead = useCallback(
    () => setNotifications((n) => n.map((x) => ({ ...x, read: true }))),
    [],
  );
  const clearNotifications = useCallback(() => setNotifications([]), []);
  const dismissNotification = useCallback(
    (id: string) => setNotifications((n) => n.filter((x) => x.id !== id)),
    [],
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
        desc: desc || "Planned by the orchestrator core.",
        icon: missionIcons[Math.floor(Math.random() * missionIcons.length)] ?? "🎯",
        accent:
          missionAccents[Math.floor(Math.random() * missionAccents.length)] ?? "var(--cyan-hud)",
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

  /* ------- console (deterministic command interpreter) ------- */
  const respond = useCallback(
    (text: string): { reply: string; confirm?: boolean } => {
      const q = text.toLowerCase().trim();
      const s = stateRef.current;

      const createMatch = q.match(/^(?:create|new|dispatch|start)\s+mission[:\s]+(.+)$/);
      if (createMatch?.[1]) {
        const title = createMatch[1].trim();
        createMission(
          title.charAt(0).toUpperCase() + title.slice(1),
          "Dispatched from the console.",
        );
        return { reply: `Mission “${title}” dispatched and now running.`, confirm: true };
      }

      const navMatch = q.match(/^(?:open|go to|show)\s+(\w+)/);
      if (navMatch?.[1]) {
        const key = VIEWS.find((v) => v.startsWith(navMatch[1]!.slice(0, 4)));
        if (key) {
          setView(key);
          return { reply: `Opening ${key}.`, confirm: true };
        }
      }

      const agentMatch = q.match(/^(start|stop|activate|suspend)\s+(.+)$/);
      if (agentMatch?.[2]) {
        const target = agentMatch[2].trim();
        const a = s.agents.find((x) => x.name.toLowerCase().includes(target));
        if (a) {
          const on = /start|activate/.test(agentMatch[1]!);
          setAgentStatus(a.id, on ? "running" : "stopped");
          return { reply: `${a.name} ${on ? "activated" : "suspended"}.`, confirm: true };
        }
      }

      if (/pause (all|every)? ?mission/.test(q)) {
        s.missions
          .filter((m) => m.status === "progress")
          .forEach((m) => setMissionStatus(m.id, "paused"));
        return { reply: "All active missions paused.", confirm: true };
      }

      if (/status|report|diagnostic|health/.test(q)) {
        return {
          reply: `Systems nominal. CPU ${s.cpu}%, memory ${s.ram}%, network ${s.net} KB/s. ${
            s.agents.filter((a) => a.status === "running").length
          } of ${s.agents.length} agents online, ${
            s.missions.filter((m) => m.status === "progress").length
          } missions in flight.`,
        };
      }

      if (/agents?/.test(q)) {
        return {
          reply: `Online: ${
            s.agents
              .filter((a) => a.status === "running")
              .map((a) => `${a.name} (${a.load}%)`)
              .join(", ") || "none"
          }.`,
        };
      }

      if (/mission|in flight|tasks?/.test(q)) {
        return {
          reply: `In flight: ${
            s.missions
              .filter((m) => m.status === "progress")
              .map((m) => `${m.title} — ${Math.round(m.progress)}%`)
              .join(" · ") || "nothing right now"
          }.`,
        };
      }

      if (/help|command/.test(q)) {
        return {
          reply:
            "Try: “status report”, “create mission: weekly digest”, “stop sentinel”, “pause all missions”, or “open workflows”.",
        };
      }

      return {
        reply: `Logged “${text}”. Say “help” for the command set, or dispatch it as a mission from Mission Control.`,
      };
    },
    [createMission, setAgentStatus, setMissionStatus],
  );

  const openOutputCard = useCallback((card: DelegatedOutputCard) => {
    setActiveOutputCard(card);
  }, []);

  const cancelDelegatedTask = useCallback((taskId: string) => {
    setDelegatedTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "failed" as const } : t)),
    );
    toast("Delegation halted by user");
  }, []);

  const delegateTask = useCallback(
    async (targetAgentId: string, prompt: string, title?: string): Promise<DelegatedTask> => {
      const cleanPrompt = prompt.trim();
      const lowerTarget = targetAgentId.toLowerCase();
      const targetAgent =
        agents.find(
          (a) =>
            a.id.toLowerCase() === lowerTarget ||
            a.name.toLowerCase().includes(lowerTarget) ||
            (lowerTarget.includes("hermes") && a.id === "hermes") ||
            (lowerTarget.includes("ultron") && a.id === "ultron") ||
            ((lowerTarget.includes("prime") ||
              lowerTarget.includes("coder") ||
              lowerTarget.includes("software")) &&
              a.id === "prime-agent") ||
            ((lowerTarget.includes("manus") || lowerTarget.includes("browser")) &&
              a.id === "openmanus") ||
            (lowerTarget.includes("friday") && a.id === "friday"),
        ) ||
        agents[1] ||
        agents[0];

      const taskId = `del-${uid()}`;
      const taskTitle =
        title ||
        `${targetAgent.name} ⟶ ${cleanPrompt.length > 45 ? cleanPrompt.slice(0, 42) + "..." : cleanPrompt}`;
      const startedAt = Date.now();

      const initialCard = createDelegationCard(targetAgent.id, cleanPrompt, taskId);

      const newTask: DelegatedTask = {
        id: taskId,
        title: taskTitle,
        agentId: targetAgent.id,
        agentName: targetAgent.name,
        prompt: cleanPrompt,
        status: "running",
        progress: 18,
        startedAt,
        displayCard: initialCard,
      };

      setDelegatedTasks((prev) => [newTask, ...prev]);

      // POPUP NOTIFICATION 1: Delegation dispatched
      toast(`⚡ J.A.R.V.I.S. ⟶ Delegated task to ${targetAgent.name}`, {
        description: cleanPrompt.length > 70 ? cleanPrompt.slice(0, 68) + "..." : cleanPrompt,
        duration: 4500,
      });

      pushNotification(
        targetAgent.icon || "⚡",
        `JARVIS delegated task to ${targetAgent.name}: "${taskTitle}"`,
      );
      pushLog(`Task delegation dispatched: J.A.R.V.I.S. ⟶ ${targetAgent.name} ("${cleanPrompt}")`);

      // Progress step 1
      await new Promise((resolve) => setTimeout(resolve, 600));
      setDelegatedTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, progress: 54 } : t)));

      // Progress step 2
      await new Promise((resolve) => setTimeout(resolve, 650));
      setDelegatedTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, progress: 88 } : t)));

      // Progress step 3 (Completion)
      await new Promise((resolve) => setTimeout(resolve, 550));
      const completedAt = Date.now();
      const durationMs = completedAt - startedAt;

      const finalCard = createDelegationCard(targetAgent.id, cleanPrompt, taskId);
      finalCard.telemetry.latencyMs = durationMs;

      const completedTask: DelegatedTask = {
        ...newTask,
        status: "completed",
        progress: 100,
        completedAt,
        durationMs,
        displayCard: finalCard,
      };

      setDelegatedTasks((prev) => prev.map((t) => (t.id === taskId ? completedTask : t)));

      setAgents((prev) =>
        prev.map((a) =>
          a.id === targetAgent.id
            ? { ...a, tasks: a.tasks + 1, load: Math.min(94, a.load + 6) }
            : a,
        ),
      );

      // POPUP NOTIFICATION 2: Delegation completed with actionable Card view!
      toast.success(`✅ Delegation Complete: ${targetAgent.name}`, {
        description: `Finished: "${taskTitle}" — Click to inspect output card`,
        action: {
          label: "View Output Card",
          onClick: () => {
            setActiveOutputCard(finalCard);
          },
        },
        duration: 9000,
      });

      pushNotification("✔", `Delegation completed by ${targetAgent.name}: "${taskTitle}"`);
      pushLog(
        `Delegation complete: ${targetAgent.name} finished in ${(durationMs / 1000).toFixed(1)}s`,
      );

      return completedTask;
    },
    [agents, pushLog, pushNotification],
  );

  const sendDirective = useCallback(
    async (text: string): Promise<string> => {
      const clean = text.trim();
      if (!clean) return "";

      const lower = clean.toLowerCase();
      // Check for explicit delegation: "delegate to <agent>: <task>", "ask <agent> to <task>", "/delegate <agent> <task>"
      const isDelegationIntent =
        lower.startsWith("/delegate") ||
        lower.startsWith("delegate to") ||
        lower.startsWith("delegate task") ||
        lower.startsWith("ask hermes") ||
        lower.startsWith("ask ultron") ||
        lower.startsWith("ask prime") ||
        lower.startsWith("ask openmanus") ||
        lower.includes("delegate to hermes") ||
        lower.includes("delegate to ultron") ||
        lower.includes("delegate to prime") ||
        lower.includes("delegate to openmanus");

      if (isDelegationIntent) {
        let targetId = "hermes";
        if (
          lower.includes("ultron") ||
          lower.includes("security") ||
          lower.includes("diagnostic")
        ) {
          targetId = "ultron";
        } else if (
          lower.includes("prime") ||
          lower.includes("code") ||
          lower.includes("engineer")
        ) {
          targetId = "prime-agent";
        } else if (
          lower.includes("manus") ||
          lower.includes("browser") ||
          lower.includes("crawl")
        ) {
          targetId = "openmanus";
        } else if (lower.includes("friday") || lower.includes("voice")) {
          targetId = "friday";
        }

        let promptText = clean
          .replace(/^\/delegate\s+/i, "")
          .replace(/^delegate\s+to\s+[a-z-_.]+\s*[:—-]?\s*/i, "")
          .replace(/^ask\s+[a-z-_.]+\s+to\s+/i, "")
          .replace(/^delegate\s+task\s*[:—-]?\s*/i, "")
          .trim();

        if (!promptText) promptText = clean;

        void delegateTask(targetId, promptText);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const userMsgId = `u-${uid()}`;
      const assistantMsgId = `a-${uid()}`;
      const now = Date.now();

      const userMsg: AGUIMessage = {
        id: userMsgId,
        role: "user",
        content: clean,
        timestamp: now,
      };

      const assistantMsg: AGUIMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        thoughts: [],
        toolCalls: [],
        isStreaming: true,
        timestamp: now,
        model: "AG-UI / MK-VII",
      };

      setAguiMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      pushLog(`Directive dispatched: "${clean}"`);

      let fullContent = "";

      try {
        await aguiClient.dispatch(
          clean,
          {
            agents: stateRef.current.agents,
            missions: stateRef.current.missions,
            telemetry: {
              cpu: stateRef.current.cpu,
              ram: stateRef.current.ram,
              net: stateRef.current.net,
            },
          },
          (event: AGUIEvent) => {
            switch (event.type) {
              case "StepStarted": {
                setAguiMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          thoughts: [
                            ...(msg.thoughts || []),
                            {
                              id: event.stepId,
                              title: event.title,
                              timestamp: event.timestamp,
                            },
                          ],
                        }
                      : msg,
                  ),
                );
                break;
              }
              case "StepFinished": {
                setAguiMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          thoughts: (msg.thoughts || []).map((t) =>
                            t.id === event.stepId
                              ? { ...t, durationMs: event.timestamp - t.timestamp }
                              : t,
                          ),
                        }
                      : msg,
                  ),
                );
                break;
              }
              case "ToolCallStart": {
                setAguiMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          toolCalls: [
                            ...(msg.toolCalls || []),
                            {
                              id: event.callId,
                              tool: event.tool,
                              args: event.args,
                              status: "running",
                            },
                          ],
                        }
                      : msg,
                  ),
                );
                pushLog(`Tool call initiated: ${event.tool}`);
                break;
              }
              case "ToolCallResult": {
                setAguiMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          toolCalls: (msg.toolCalls || []).map((tc) =>
                            tc.id === event.callId
                              ? { ...tc, status: "completed", result: event.result }
                              : tc,
                          ),
                        }
                      : msg,
                  ),
                );
                break;
              }
              case "StateDelta": {
                if (event.patch.newMission) {
                  const nm = event.patch.newMission as Mission;
                  setMissions((prev) => [nm, ...prev]);
                  pushNotification("🚀", `Mission "${nm.title}" deployed.`);
                  toast.success(`Mission initialized: ${nm.title}`);
                }
                if (event.patch.telemetrySync) {
                  const ts = event.patch.telemetrySync as {
                    cpu?: number;
                    ram?: number;
                    net?: number;
                  };
                  if (ts.cpu) setCpu(ts.cpu);
                  if (ts.ram) setRam(ts.ram);
                  if (ts.net) setNet(ts.net);
                }
                break;
              }
              case "TextMessageContent": {
                fullContent += event.delta;
                setAguiMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: (msg.content || "") + event.delta }
                      : msg,
                  ),
                );
                break;
              }
              case "TextMessageEnd":
              case "RunFinished": {
                setAguiMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg,
                  ),
                );
                setIsStreaming(false);
                break;
              }
              case "RunError": {
                setAguiMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          content: (msg.content || "") + `\n\n*(Error: ${event.error})*`,
                          isStreaming: false,
                        }
                      : msg,
                  ),
                );
                setIsStreaming(false);
                toast.error(`AG-UI Run Error: ${event.error}`);
                break;
              }
            }
          },
          controller.signal,
        );
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Handled abort
        } else {
          console.error("Directive execution error:", err);
        }
      } finally {
        setIsStreaming(false);
      }

      return fullContent;
    },
    [pushLog, pushNotification, delegateTask],
  );

  const stopDirective = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setAguiMessages((prev) => prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)));
    toast("Generation halted by user");
  }, []);

  const voice = useContinuousVoice({
    onCommand: sendDirective,
  });

  // JARVIS is a voice-first application: voice orbit is alive and runs continuously
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Immediately start continuous hands-free voice loop
    voice.startVoice();

    // Browser audio/mic policy: ensure first user gesture unlocks mic/AudioContext if initially blocked
    const unlockVoice = () => {
      if (!voice.isListening && !voice.isSpeaking && !voice.isThinking) {
        voice.startVoice();
      }
    };

    window.addEventListener("click", unlockVoice, { once: true });
    window.addEventListener("keydown", unlockVoice, { once: true });

    return () => {
      window.removeEventListener("click", unlockVoice);
      window.removeEventListener("keydown", unlockVoice);
      voice.stopVoice();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      setMessages((m) => [...m, { id: uid(), role: "user", text: clean, at: Date.now() }]);
      void sendDirective(clean);
    },
    [sendDirective],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setAguiMessages([]);
    toast("Console stream cleared");
  }, []);

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
    aguiMessages,
    isStreaming,
    sendDirective,
    stopDirective,
    voiceModalOpen,
    setVoiceModalOpen,
    voiceListening: voice.isListening,
    voiceThinking: voice.isThinking,
    voiceSpeaking: voice.isSpeaking,
    voiceTranscript: voice.transcript,
    voiceLastSpoken: voice.lastSpoken,
    voiceAudioLevel: voice.audioLevel,
    voiceError: voice.error,
    toggleVoiceMic: () => {
      if (voice.isActive) {
        voice.stopVoice();
        toast("Microphone muted");
      } else {
        voice.startVoice();
        toast("JARVIS Voice continuous listening active");
      }
    },
    interruptVoiceSpeech: voice.cancelSpeech,
    clearChat,
    thinking,
    autonomy,
    setAutonomy,
    density,
    setDensity,
    telemetryOn,
    setTelemetryOn,
    autoDispatch,
    setAutoDispatch,
    confirmDestructive,
    setConfirmDestructive,
    cpu,
    ram,
    net,
    clock,
    delegatedTasks,
    activeOutputCard,
    setActiveOutputCard,
    delegateTask,
    cancelDelegatedTask,
    openOutputCard,
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
