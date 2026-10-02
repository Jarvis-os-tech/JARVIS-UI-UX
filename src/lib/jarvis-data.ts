export type AgentStatus = "running" | "stopped";

export type Agent = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  accent: string;
  status: AgentStatus;
  tasks: number;
  uptimeMin: number;
  load: number;
};

export type MissionStatus = "progress" | "paused" | "done" | "pending" | "cancelled";

export type Mission = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  accent: string;
  status: MissionStatus;
  progress: number;
  createdAt: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "jarvis";
  text: string;
  at: number;
  kind?: "confirm" | "normal";
};

export type Notification = {
  id: string;
  icon: string;
  title: string;
  at: number;
  read: boolean;
};

export type LogEntry = { id: string; text: string; at: number };

export type ViewKey =
  | "dashboard"
  | "agentspace"
  | "agents"
  | "memory"
  | "connectors"
  | "mission"
  | "workflows"
  | "settings";

export const uid = () => Math.random().toString(36).slice(2, 10);

export type DelegationStatus = "delegating" | "running" | "completed" | "failed";

export interface CodeArtifact {
  filename: string;
  language: string;
  code: string;
}

export interface DelegatedOutputCard {
  id: string;
  taskId: string;
  title: string;
  agentId: string;
  agentName: string;
  agentRole?: string;
  accent: string;
  icon: string;
  objective: string;
  prompt: string;
  executiveSummary: string;
  findings: string[];
  codeArtifacts?: CodeArtifact[];
  telemetry: {
    latencyMs: number;
    model: string;
    computeCluster: string;
    status: "OPTIMAL" | "SUCCESS" | "VERIFIED";
    timestamp: number;
  };
  rawOutput?: string;
}

export interface DelegatedTask {
  id: string;
  title: string;
  agentId: string;
  agentName: string;
  prompt: string;
  status: DelegationStatus;
  progress: number;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  displayCard: DelegatedOutputCard;
}

export const seedAgents: Agent[] = [
  {
    id: "jarvis-core",
    name: "J.A.R.V.I.S. Core",
    desc: "Central intent orchestrator, live voice net & multi-agent routing cortex.",
    icon: "◎",
    accent: "var(--cyan-hud)",
    status: "running",
    tasks: 56,
    uptimeMin: 1440,
    load: 38,
  },
  {
    id: "hermes",
    name: "Hermes Intelligence",
    desc: "Autonomous deep research, multi-turn reasoning & personal knowledge vault synthesis.",
    icon: "🧠",
    accent: "var(--emerald-hud)",
    status: "running",
    tasks: 29,
    uptimeMin: 1120,
    load: 54,
  },
  {
    id: "ultron",
    name: "Ultron Sentinel",
    desc: "Zero-trust security referee, Linux OS diagnostics, hardware actuators & system booster.",
    icon: "🛡",
    accent: "var(--amber-hud)",
    status: "running",
    tasks: 19,
    uptimeMin: 890,
    load: 28,
  },
  {
    id: "prime-agent",
    name: "Prime Architect",
    desc: "Autonomous software engineering, fullstack coding, refactoring and AST analysis.",
    icon: "⚡",
    accent: "var(--violet-hud)",
    status: "running",
    tasks: 34,
    uptimeMin: 980,
    load: 62,
  },
  {
    id: "openmanus",
    name: "OpenManus Computer-Use",
    desc: "Autonomous browser automation, sandboxed shell execution and artifact generation.",
    icon: "🌐",
    accent: "var(--blue-hud)",
    status: "running",
    tasks: 14,
    uptimeMin: 420,
    load: 41,
  },
  {
    id: "friday",
    name: "F.R.I.D.A.Y. Co-Pilot",
    desc: "Audio-reactive voice co-pilot, ambient sensory stream and multimodal assistance.",
    icon: "🎙",
    accent: "var(--pink-hud)",
    status: "running",
    tasks: 22,
    uptimeMin: 1440,
    load: 26,
  },
];

export const seedDelegatedTasks: DelegatedTask[] = [
  {
    id: "del-task-001",
    title: "Hermes ⟶ Knowledge Vault & Research Synthesis",
    agentId: "hermes",
    agentName: "Hermes Intelligence",
    prompt: "Investigate zero-latency IPC between local C++ workers and the Axum memory engine.",
    status: "completed",
    progress: 100,
    startedAt: Date.now() - 420_000,
    completedAt: Date.now() - 418_200,
    durationMs: 1800,
    displayCard: {
      id: "card-del-001",
      taskId: "del-task-001",
      title: "Zero-Latency IPC & Sovereign Memory Architecture",
      agentId: "hermes",
      agentName: "Hermes Intelligence",
      agentRole: "Autonomous Research & Personal Knowledge Sub-Agent",
      accent: "var(--emerald-hud)",
      icon: "🧠",
      objective:
        "Evaluate Unix Domain Sockets vs Shared Memory for sub-millisecond IPC in JARVIS OS.",
      prompt: "Investigate zero-latency IPC between local C++ workers and the Axum memory engine.",
      executiveSummary:
        "Hermes completed exhaustive vault synthesis and benchmarking across local memory transports. Unix Domain Sockets with zero-copy ring buffers achieve sub-45 microsecond roundtrips without kernel context switch overhead.",
      findings: [
        "Unix Domain Sockets (UDS) with SOCK_SEQPACKET provide strict message boundary preservation without packet fragmentation.",
        "SQLite WAL-mode with FTS5 search enables sub-millisecond vector and full-text hybrid lookups.",
        "Cognee graph memory sync handles multi-agent entity resolution without lock contention.",
        "Obsidian sovereign vault markdown links remain 100% compliant with standard frontmatter schema.",
      ],
      codeArtifacts: [
        {
          filename: "ipc_uds_channel.rs",
          language: "rust",
          code: `// High-throughput Unix Domain Socket Listener\nuse tokio::net::UnixListener;\n\npub async fn bind_worker_channel(path: &str) -> std::io::Result<()> {\n    let listener = UnixListener::bind(path)?;\n    println!("⚡ JARVIS IPC channel bound to {}", path);\n    Ok(())\n}`,
        },
      ],
      telemetry: {
        latencyMs: 1800,
        model: "Hermes-3-70B / Obsidian Bridge",
        computeCluster: "Cluster-Alpha / Local Sovereign",
        status: "OPTIMAL",
        timestamp: Date.now() - 418_200,
      },
    },
  },
  {
    id: "del-task-002",
    title: "Ultron ⟶ Zero-Trust Security & Diagnostic Audit",
    agentId: "ultron",
    agentName: "Ultron Sentinel",
    prompt: "Run hardware thermal scanner and verify non-promiscuous network interface states.",
    status: "completed",
    progress: 100,
    startedAt: Date.now() - 180_000,
    completedAt: Date.now() - 177_900,
    durationMs: 2100,
    displayCard: {
      id: "card-del-002",
      taskId: "del-task-002",
      title: "OS Diagnostics & Hardware Shield Verification",
      agentId: "ultron",
      agentName: "Ultron Sentinel",
      agentRole: "Chief Security Sentinel, OS Diagnostics & Autonomous Gateway",
      accent: "var(--amber-hud)",
      icon: "🛡",
      objective:
        "Deep system diagnostic audit covering Linux sysfs thermals, RAM caches, and socket listeners.",
      prompt: "Run hardware thermal scanner and verify non-promiscuous network interface states.",
      executiveSummary:
        "All hardware sensors and systemd services inspected. Zero unauthorized listening ports detected on external network interfaces. CPU thermals stabilized at 41.2°C.",
      findings: [
        "Thermals: All 4 thermal zones reporting nominal temperatures (Zone 0: 41°C, Zone 1: 39°C).",
        "RAM Allocation: 42% utilized; page cache clean with zero swap pressure.",
        "Network Ports: Port 18789 (Ultron Gateway) and Port 50051 (Memory Engine) strictly bound to loopback 127.0.0.1.",
        "PipeWire audio latency verified at 5.3ms buffer size.",
      ],
      telemetry: {
        latencyMs: 2100,
        model: "Ultron-Sentinel-v4 / Native C++ sys_telemetry",
        computeCluster: "Node-Kernel-Shield",
        status: "VERIFIED",
        timestamp: Date.now() - 177_900,
      },
    },
  },
];

export const seedMissions: Mission[] = [
  {
    id: "m1",
    title: "Morning Systems Briefing",
    desc: "Aggregate overnight telemetry into a 90 second digest.",
    icon: "☀",
    accent: "var(--amber-hud)",
    status: "progress",
    progress: 68,
    createdAt: Date.now() - 5_400_000,
  },
  {
    id: "m2",
    title: "Competitor Intel Sweep",
    desc: "Crawl 42 sources, deduplicate and rank signal by relevance.",
    icon: "🛰",
    accent: "var(--blue-hud)",
    status: "progress",
    progress: 34,
    createdAt: Date.now() - 3_600_000,
  },
  {
    id: "m3",
    title: "Infrastructure Health Check",
    desc: "Probe every node, verify certificates and rotate stale keys.",
    icon: "✔",
    accent: "var(--emerald-hud)",
    status: "done",
    progress: 100,
    createdAt: Date.now() - 86_400_000,
  },
  {
    id: "m4",
    title: "Inbox Triage Protocol",
    desc: "Classify, draft replies and escalate anything above priority 3.",
    icon: "✉",
    accent: "var(--violet-hud)",
    status: "pending",
    progress: 0,
    createdAt: Date.now() - 1_800_000,
  },
];

export const seedNotifications: Notification[] = [
  {
    id: "n1",
    icon: "🛰",
    title: "Research Scout finished sweeping 42 sources.",
    at: Date.now() - 240_000,
    read: false,
  },
  {
    id: "n2",
    icon: "⚠",
    title: "Sentinel is offline — autonomous defence paused.",
    at: Date.now() - 900_000,
    read: false,
  },
  {
    id: "n3",
    icon: "✔",
    title: "Infrastructure health check completed cleanly.",
    at: Date.now() - 3_600_000,
    read: false,
  },
];

export const missionIcons = ["🎯", "🛰", "⚡", "🧭", "✉", "☀", "🔭", "🧪"];
export const missionAccents = [
  "var(--cyan-hud)",
  "var(--violet-hud)",
  "var(--emerald-hud)",
  "var(--amber-hud)",
  "var(--pink-hud)",
  "var(--blue-hud)",
];

export function timeAgo(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function clock(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function createDelegationCard(
  agentId: string,
  prompt: string,
  taskId: string,
): DelegatedOutputCard {
  const clean = prompt.trim();
  const title =
    clean.length > 52 ? `${clean.slice(0, 50)}...` : clean || "Autonomous Task Execution";

  switch (agentId) {
    case "hermes":
      return {
        id: `card-${uid()}`,
        taskId,
        title: `Hermes ⟶ ${title}`,
        agentId: "hermes",
        agentName: "Hermes Intelligence",
        agentRole: "Autonomous Research & Personal Knowledge Sub-Agent",
        accent: "var(--emerald-hud)",
        icon: "🧠",
        objective: clean,
        prompt: clean,
        executiveSummary: `Hermes completed deep multi-turn reasoning and sovereign vault synthesis regarding: "${title}". High-yield insights extracted and cross-referenced against active project memories.`,
        findings: [
          `Identified 8 verified citations and knowledge nodes across local memory and external sources.`,
          `Semantic coherence score evaluated at 96.4% across contextual embeddings.`,
          `Obsidian vault graph linkages updated with reciprocal backlinks in vault directory.`,
          `Zero hallucination anomalies detected; grounded directly in factual source texts.`,
        ],
        codeArtifacts: [
          {
            filename: "vault_briefing.md",
            language: "markdown",
            code: `# Hermes Briefing: ${title}\n\n- Timestamp: ${new Date().toISOString()}\n- Agent: Hermes CLI Sub-Agent\n- Status: Grounded & Verified\n\n## Core Findings\nExhaustive multi-source reasoning confirmed optimal operational strategy.`,
          },
        ],
        telemetry: {
          latencyMs: 1650 + Math.round(Math.random() * 800),
          model: "Hermes-3-Llama-3.1-70B / Vault Core",
          computeCluster: "Node-Sovereign-Alpha",
          status: "OPTIMAL",
          timestamp: Date.now(),
        },
      };

    case "ultron":
      return {
        id: `card-${uid()}`,
        taskId,
        title: `Ultron ⟶ ${title}`,
        agentId: "ultron",
        agentName: "Ultron Sentinel",
        agentRole: "Chief Security Sentinel, OS Diagnostics & Autonomous Gateway",
        accent: "var(--amber-hud)",
        icon: "🛡",
        objective: clean,
        prompt: clean,
        executiveSummary: `Ultron executed system-level inspection and security verification for: "${title}". Kernel metrics, sandboxed boundaries, and socket listeners audited cleanly.`,
        findings: [
          `Zero-trust audit passed: No unauthorized IPC handles or socket leases open.`,
          `Linux kernel cgroups confirmed resource isolation limits strictly enforced.`,
          `Hardware actuators (ALSA volume, GPU clock, display backlight) reporting nominal state.`,
          `Gateway loopback proxy (port 18789) active with sub-millisecond dispatch latency.`,
        ],
        telemetry: {
          latencyMs: 1420 + Math.round(Math.random() * 600),
          model: "Ultron-Sentinel-v4 / Native C++ Workers",
          computeCluster: "Shield-Daemon-0",
          status: "VERIFIED",
          timestamp: Date.now(),
        },
      };

    case "prime-agent":
      return {
        id: `card-${uid()}`,
        taskId,
        title: `Prime Agent ⟶ ${title}`,
        agentId: "prime-agent",
        agentName: "Prime Architect",
        agentRole: "Autonomous Software Engineer & Coding Agent",
        accent: "var(--violet-hud)",
        icon: "⚡",
        objective: clean,
        prompt: clean,
        executiveSummary: `Prime Architect parsed requirements, analyzed repository AST, and verified modular implementation for: "${title}". Generated clean production-grade code artifacts.`,
        findings: [
          `AST dependency analysis completed with zero circular dependency hazards.`,
          `Type safety verified: 100% TypeScript compile-ready without loose 'any' escapes.`,
          `Modular interface contracts adhere strictly to the JARVIS holographic console architecture.`,
          `Unit test coverage verified across happy path and edge case boundaries.`,
        ],
        codeArtifacts: [
          {
            filename: "agent_orchestration_module.ts",
            language: "typescript",
            code: `export interface SwarmPacket {\n  sourceId: string;\n  targetId: string;\n  payload: Record<string, unknown>;\n  timestamp: number;\n}\n\nexport async function routeSwarmPacket(packet: SwarmPacket): Promise<boolean> {\n  console.log(\`⚡ Routing \${packet.sourceId} ⟶ \${packet.targetId}\`);\n  return true;\n}`,
          },
        ],
        telemetry: {
          latencyMs: 2200 + Math.round(Math.random() * 900),
          model: "Prime-Coder-3.1 / DeepTree AST Engine",
          computeCluster: "Compute-Cluster-Gamma",
          status: "SUCCESS",
          timestamp: Date.now(),
        },
      };

    case "openmanus":
      return {
        id: `card-${uid()}`,
        taskId,
        title: `OpenManus ⟶ ${title}`,
        agentId: "openmanus",
        agentName: "OpenManus Computer-Use",
        agentRole: "Autonomous GUI & Browser Automation Sub-Agent",
        accent: "var(--blue-hud)",
        icon: "🌐",
        objective: clean,
        prompt: clean,
        executiveSummary: `OpenManus navigated browser sandboxes and automated web verification steps for: "${title}". Captured DOM snapshot and extracted structured target outputs.`,
        findings: [
          `Headless Chromium instance spawned in isolated sandbox container.`,
          `Target elements successfully resolved via semantic selector tree.`,
          `Extracted structured text, metadata, and telemetry without script timeout.`,
          `Network payload verified clean of external tracking beacons.`,
        ],
        telemetry: {
          latencyMs: 2400 + Math.round(Math.random() * 1100),
          model: "OpenManus-v2 / Chromium Headless Pool",
          computeCluster: "Sandbox-Node-10100",
          status: "OPTIMAL",
          timestamp: Date.now(),
        },
      };

    default:
      return {
        id: `card-${uid()}`,
        taskId,
        title: `Sub-Agent ⟶ ${title}`,
        agentId,
        agentName: "Specialist Sub-Agent",
        agentRole: "JARVIS Swarm Co-Processor",
        accent: "var(--cyan-hud)",
        icon: "◎",
        objective: clean,
        prompt: clean,
        executiveSummary: `Autonomous sub-agent successfully processed directive: "${title}". Results verified against JARVIS operational protocols.`,
        findings: [
          `Task completed within nominal compute budget.`,
          `All validation constraints satisfied.`,
          `Output formatted into standardized card telemetry.`,
        ],
        telemetry: {
          latencyMs: 1800 + Math.round(Math.random() * 600),
          model: "JARVIS-Swarm-Net / Gemini 3.1 Flash",
          computeCluster: "Cluster-Core",
          status: "OPTIMAL",
          timestamp: Date.now(),
        },
      };
  }
}
