/**
 * AG-UI (Agent-User Interaction) Protocol Types
 * Standardized specification for agent lifecycle events, streaming tokens,
 * thought processes, generative tool execution, and state deltas.
 */

export type AGUIEvent =
  | { type: "RunStarted"; runId: string; threadId: string; timestamp: number }
  | { type: "StepStarted"; stepId: string; title: string; timestamp: number }
  | { type: "StepFinished"; stepId: string; timestamp: number }
  | { type: "TextMessageStart"; messageId: string; role: "assistant" }
  | { type: "TextMessageContent"; messageId: string; delta: string }
  | { type: "TextMessageEnd"; messageId: string }
  | { type: "ToolCallStart"; callId: string; tool: string; args: Record<string, unknown> }
  | { type: "ToolCallResult"; callId: string; result: unknown }
  | { type: "StateDelta"; patch: Record<string, unknown> }
  | { type: "RunFinished"; runId: string; timestamp: number }
  | { type: "RunError"; runId: string; error: string };

export interface AGUIToolCall {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  result?: unknown;
  status: "pending" | "running" | "completed" | "error";
  approvalRequired?: boolean;
  approved?: boolean;
}

export interface AGUIThoughtStep {
  id: string;
  title: string;
  timestamp: number;
  durationMs?: number;
}

export interface AGUIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  thoughts?: AGUIThoughtStep[];
  toolCalls?: AGUIToolCall[];
  isStreaming?: boolean;
  timestamp: number;
  model?: string;
}

export interface AGUIClientConfig {
  endpointUrl?: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

export interface AGUIClient {
  dispatch(
    directive: string,
    stateContext: Record<string, unknown>,
    onEvent: (event: AGUIEvent) => void,
    signal?: AbortSignal,
  ): Promise<void>;
  connect(endpointUrl: string): void;
}
