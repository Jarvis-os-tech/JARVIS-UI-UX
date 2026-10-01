import type { AGUIClient, AGUIEvent, AGUIClientConfig } from "./agui-types";
import { uid } from "./jarvis-data";

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

interface SimulatedPayload {
  thoughts: string[];
  toolCalls?: Array<{
    tool: string;
    args: Record<string, unknown>;
    result: unknown;
    stateDelta?: Record<string, unknown>;
  }>;
  textChunks: string[];
}

function generateSimulatedResponse(directive: string, stateContext: Record<string, unknown>): SimulatedPayload {
  const lower = directive.toLowerCase().trim();

  if (lower.includes("mission") || lower.includes("operation") || lower.includes("deploy") || lower.includes("task")) {
    const missionId = `m-${uid()}`;
    const missionTitle = directive.length > 50 ? directive.slice(0, 48) + "..." : directive;
    return {
      thoughts: [
        "Analyzing mission objective parameters",
        "Assessing node availability across sub-agent matrix",
        "Formulating operational milestone roadmap",
        "Registering task payload into mission ledger",
      ],
      toolCalls: [
        {
          tool: "mission_dispatch_service",
          args: {
            title: missionTitle,
            priority: "HIGH",
            assignedAgent: "Orchestrator Core",
            executionPlan: ["Ingest inputs", "Parallel swarm scan", "Synthesize findings"],
          },
          result: {
            status: "COMMITTED",
            missionId,
            allocatedNodes: ["node-alpha-1", "node-gamma-4"],
            estimatedTtlMs: 240000,
          },
          stateDelta: {
            newMission: {
              id: missionId,
              title: missionTitle,
              desc: `Initiated via prompt directive: "${directive}"`,
              icon: "🚀",
              accent: "var(--cyan-hud)",
              status: "progress",
              progress: 15,
              createdAt: Date.now(),
            },
          },
        },
      ],
      textChunks: [
        `Operational directive acknowledged, Sir.\n\n`,
        `I have registered and initialized **"${missionTitle}"** under the Orchestrator Core.\n\n`,
        `• **Designation:** \`${missionId}\`\n`,
        `• **Allocation:** 2 compute clusters assigned\n`,
        `• **Telemetry:** Status is currently at 15% progression with live telemetry telemetry synced.\n\n`,
        `I will monitor execution metrics and alert you immediately if any anomalies are detected.`,
      ],
    };
  }

  if (lower.includes("diagnostic") || lower.includes("scan") || lower.includes("health") || lower.includes("telemetry")) {
    return {
      thoughts: [
        "Initiating cluster-wide heartbeat query",
        "Probing neural routing latency and packet jitter",
        "Evaluating cryptographic ledger integrity",
        "Compiling real-time diagnostic synthesis",
      ],
      toolCalls: [
        {
          tool: "core_telemetry_diagnostic",
          args: { scope: "cluster_wide", probeDepth: "exhaustive", timeoutMs: 1500 },
          result: {
            status: "OPTIMAL",
            nodeCount: 16,
            averageLatencyMs: 14.2,
            packetLoss: "0.00%",
            memoryUtilization: "41.8%",
            securityShields: "ACTIVE",
          },
          stateDelta: {
            telemetrySync: {
              cpu: 38,
              ram: 42,
              net: 284,
            },
          },
        },
      ],
      textChunks: [
        `All systems operating within nominal operational thresholds, Sir.\n\n`,
        `**Diagnostic Telemetry Summary:**\n`,
        `• **Core Matrix:** 16/16 edge nodes reporting healthy status\n`,
        `• **Mean Latency:** 14.2 ms across distributed relays\n`,
        `• **Memory Pressure:** 41.8% nominal reserve\n`,
        `• **Security Substrate:** Quantum-hardened mesh active and fully uncompromised.\n\n`,
        `The console is ready for high-throughput directive execution.`,
      ],
    };
  }

  if (lower.includes("agent") || lower.includes("swarm") || lower.includes("worker") || lower.includes("bot")) {
    return {
      thoughts: [
        "Querying agent swarm coordination state",
        "Inspecting thread load and queue depth",
        "Synthesizing autonomous agent status matrix",
      ],
      toolCalls: [
        {
          tool: "swarm_coordination_probe",
          args: { clusterId: "local-swarm-mk7", includeIdle: true },
          result: {
            activeAgents: 6,
            totalQueuedTasks: 84,
            topWorker: "Research Scout",
            efficiencyIndex: "98.4%",
          },
        },
      ],
      textChunks: [
        `Swarm coordination status retrieved.\n\n`,
        `Currently, **6 autonomous agents** are active across the network:\n`,
        `1. **Orchestrator Core** — Load 46% (Routing intents)\n`,
        `2. **Signal Router** — Load 62% (Routing events)\n`,
        `3. **Research Scout** — Load 78% (Sweeping sources)\n`,
        `4. **Code Synthesizer** — Load 34% (Standby)\n`,
        `5. **Sentinel Guard** — Load 88% (Perimeter defense)\n`,
        `6. **Data Weaver** — Load 19% (Indexing memory shards)\n\n`,
        `All queues are balanced with no throttling detected.`,
      ],
    };
  }

  if (lower.includes("memory") || lower.includes("recall") || lower.includes("search") || lower.includes("find")) {
    return {
      thoughts: [
        "Parsing search query embedding vector",
        "Traversing vector memory shard indexes",
        "Ranking semantic relevance nodes",
      ],
      toolCalls: [
        {
          tool: "vector_memory_retrieval",
          args: { query: directive, topK: 3, threshold: 0.82 },
          result: {
            matches: [
              { id: "mem-042", subject: "Quantum Encryption Key Rotation", score: 0.94 },
              { id: "mem-108", subject: "Autonomous Swarm Protocol v2", score: 0.89 },
              { id: "mem-219", subject: "Friday Audio-Reactive Synthesis Core", score: 0.85 },
            ],
          },
        },
      ],
      textChunks: [
        `I scanned our persistent vector memory repository for **"${directive}"**.\n\n`,
        `Top semantic correlations identified:\n`,
        `• **Quantum Encryption Key Rotation** (\`mem-042\`, 94% relevance)\n`,
        `• **Autonomous Swarm Protocol v2** (\`mem-108\`, 89% relevance)\n`,
        `• **Friday Audio-Reactive Synthesis Core** (\`mem-219\`, 85% relevance)\n\n`,
        `Would you like me to pull the complete decrypted payload for any of these entries?`,
      ],
    };
  }

  // Conversational fallback
  return {
    thoughts: [
      "Deconstructing natural language intent",
      "Correlating context against active console directives",
      "Formulating precise response sequence",
    ],
    textChunks: [
      `Understood, Sir. `,
      `I am actively monitoring our telemetry streams, sub-agent swarm status, and mission queues. `,
      `You may issue commands to dispatch autonomous missions, execute system diagnostics, query swarm telemetry, or activate hands-free continuous voice mode at any moment.\n\n`,
      `How may I assist your next objective?`,
    ],
  };
}

export class DefaultAGUIClient implements AGUIClient {
  private endpointUrl?: string;
  private apiKey?: string;

  constructor(config?: AGUIClientConfig) {
    this.endpointUrl = config?.endpointUrl;
    this.apiKey = config?.apiKey;
  }

  connect(endpointUrl: string): void {
    this.endpointUrl = endpointUrl;
  }

  async dispatch(
    directive: string,
    stateContext: Record<string, unknown>,
    onEvent: (event: AGUIEvent) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    const runId = `run-${uid()}`;
    const threadId = `th-${uid()}`;
    const messageId = `msg-${uid()}`;

    onEvent({
      type: "RunStarted",
      runId,
      threadId,
      timestamp: Date.now(),
    });

    try {
      // If external endpoint is provided, attempt SSE streaming
      if (this.endpointUrl && this.endpointUrl.trim().length > 0) {
        await this.dispatchRemoteSSE(directive, stateContext, onEvent, signal, runId, messageId);
        return;
      }

      // Autonomous High-Fidelity Simulation
      const simulated = generateSimulatedResponse(directive, stateContext);

      // 1. Thought Steps
      for (let i = 0; i < simulated.thoughts.length; i++) {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        const stepId = `step-${uid()}`;
        const stepTitle = simulated.thoughts[i];

        onEvent({
          type: "StepStarted",
          stepId,
          title: stepTitle,
          timestamp: Date.now(),
        });

        await sleep(75 + Math.random() * 50, signal);

        onEvent({
          type: "StepFinished",
          stepId,
          timestamp: Date.now(),
        });
      }

      // 2. Tool Calls (if any)
      if (simulated.toolCalls && simulated.toolCalls.length > 0) {
        for (const tc of simulated.toolCalls) {
          if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
          const callId = `call-${uid()}`;

          onEvent({
            type: "ToolCallStart",
            callId,
            tool: tc.tool,
            args: tc.args,
          });

          await sleep(140 + Math.random() * 80, signal);

          onEvent({
            type: "ToolCallResult",
            callId,
            result: tc.result,
          });

          if (tc.stateDelta) {
            onEvent({
              type: "StateDelta",
              patch: tc.stateDelta,
            });
          }
        }
      }

      // 3. Streaming Text Message
      onEvent({
        type: "TextMessageStart",
        messageId,
        role: "assistant",
      });

      for (const chunk of simulated.textChunks) {
        // Stream chunk token-by-token or word-by-word with 15-25ms delay
        const words = chunk.split(/(?<=\s|\\n)/);
        for (const word of words) {
          if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
          onEvent({
            type: "TextMessageContent",
            messageId,
            delta: word,
          });
          await sleep(16 + Math.random() * 12, signal);
        }
      }

      onEvent({
        type: "TextMessageEnd",
        messageId,
      });

      onEvent({
        type: "RunFinished",
        runId,
        timestamp: Date.now(),
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        onEvent({
          type: "RunFinished",
          runId,
          timestamp: Date.now(),
        });
        return;
      }
      onEvent({
        type: "RunError",
        runId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private async dispatchRemoteSSE(
    directive: string,
    stateContext: Record<string, unknown>,
    onEvent: (event: AGUIEvent) => void,
    signal?: AbortSignal,
    runId = `run-${uid()}`,
    messageId = `msg-${uid()}`,
  ): Promise<void> {
    if (!this.endpointUrl) return;

    const response = await fetch(this.endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({
        directive,
        context: stateContext,
        runId,
      }),
      signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`AG-UI server responded with status: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    onEvent({
      type: "TextMessageStart",
      messageId,
      role: "assistant",
    });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const raw = trimmed.slice(6);
          if (raw === "[DONE]") continue;
          try {
            const parsed = JSON.parse(raw);
            if (parsed.type) {
              onEvent(parsed);
            } else if (parsed.delta) {
              onEvent({
                type: "TextMessageContent",
                messageId,
                delta: parsed.delta,
              });
            }
          } catch {
            onEvent({
              type: "TextMessageContent",
              messageId,
              delta: raw,
            });
          }
        }
      }
    }

    onEvent({
      type: "TextMessageEnd",
      messageId,
    });

    onEvent({
      type: "RunFinished",
      runId,
      timestamp: Date.now(),
    });
  }
}

export const aguiClient = new DefaultAGUIClient();
