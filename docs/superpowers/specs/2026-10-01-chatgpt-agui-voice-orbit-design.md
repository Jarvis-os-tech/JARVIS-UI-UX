# JARVIS Frontend: ChatGPT Interface & AG-UI Protocol with Continuous Voice Orbit

## 1. Executive Summary

This specification defines the transformation of the JARVIS agent console from a multi-gauge dashboard layout into a streamlined, high-productivity **ChatGPT-style conversational interface** powered by the **AG-UI (Agent-User Interaction) Protocol**.

Key pillars:

1. **ChatGPT-Style Layout**: The static middle gauge is removed from the main view and replaced by a full-height centered conversation stream with real-time token streaming, reasoning step accordions, in-stream tool execution cards, human-in-the-loop approvals, and a responsive prompt deck.
2. **Single Persistent Session**: Operates in a single continuous console session without complex multi-thread clutter, preserving conversation context and agent mission logs.
3. **Continuous Holographic Voice Orbit**: An on-demand popup overlay featuring an audio-reactive Stark Arc Reactor / Friday holographic orb. When activated, it operates in a continuous hands-free voice loop (Speech-to-Text -> AG-UI reasoning/tool run -> Speech Synthesis with audio pulse -> loop).
4. **AG-UI Protocol Engine**: Full compliance with the AG-UI event standard (`RunStarted`, `TextMessageStart/Content/End`, `StepStarted/Finished`, `ToolCallStart/Result`, `StateDelta`, `StateSnapshot`, `RunFinished`), featuring a built-in interactive simulator plus configurable live SSE/WebSocket backend connectivity.
5. **Notification & UI Fixes**: Integration of Sonner toast styling, elimination of header overflow clipping on popovers, and interactive notification events.

---

## 2. Architecture & AG-UI Protocol

### 2.1 AG-UI Event Model

The client engine implements the event specification:

- **Lifecycle**:
  - `RunStarted`: Initiates an agent execution with `run_id`, `thread_id`, timestamp.
  - `RunFinished`: Finalizes execution, sets status to idle.
  - `RunError`: Emits error payload and displays error toast.
- **Reasoning / Thinking**:
  - `StepStarted`: Emits title (e.g., `"Querying swarm telemetry"`, `"Executing MCP tool"`) and step ID.
  - `StepFinished`: Concludes reasoning step and collapses/marks completed.
- **Streaming Tokens**:
  - `TextMessageStart`: Message initialization with message ID and role (`assistant`).
  - `TextMessageContent`: Incremental delta chunks with character pacing for streaming effect.
  - `TextMessageEnd`: Concludes message chunking.
- **Generative UI & Tool Calls**:
  - `ToolCallStart`: Emits tool name and arguments.
  - `ToolCallResult`: Emits result data; renders inline interactive tool cards (search results, mission cards, agent actions).
- **State Synchronization**:
  - `StateDelta`: Incremental JSON updates to system metrics, agent status, and missions.
  - `StateSnapshot`: Full state refresh on connection or reset.
- **Human-in-the-Loop**:
  - `ApprovalRequest`: Inline interactive approval card requiring user `[Approve]` or `[Reject]` before proceeding.

### 2.2 Dual Backend Transport

- **Internal Simulated Agent**: Fully interactive default engine simulating JARVIS responses, tool dispatches, missions, and telemetry with realistic latency and token streaming.
- **External Live AG-UI Server**: Configuration in Settings allowing users to supply an SSE (`/events`) or WebSocket endpoint. The client parses standard AG-UI events from the server stream when active.

---

## 3. UI & Component Structure

### 3.1 Main Layout (Replacing the Middle Orbit)

- **File**: `src/components/jarvis/views/DashboardView.tsx` and `src/components/jarvis/JarvisApp.tsx`
- **Changes**:
  - Remove `OrbStage` from `DashboardView`.
  - Convert the main workspace to `ChatView`:
    - Top: Header with agent status, clear console button, model pill (`JARVIS MK-VII / AG-UI`), and Voice Orbit trigger.
    - Center: Centered max-w-3xl message column with automatic scroll-to-bottom and smooth scrolling.
    - Bottom: Fixed prompt deck with auto-resizing textarea, quick chips, tool trigger, voice button, and send button.

### 3.2 Message Stream Components

- **User Message**: Clean bubble with user avatar, timestamp, and edit directive action.
- **Assistant Message (JARVIS)**:
  - Glowing JARVIS arc icon with active model badge.
  - **Reasoning Accordion**: Collapsible "Thought process" with pulse indicator and execution duration.
  - **Tool Execution Cards**: In-stream cards showing tool name, arguments, loading spinner or completion checkmark, and formatted output data.
  - **Approval Cards**: Action cards with `[Approve]` and `[Reject]` buttons for commands like agent shutdowns, mission aborts, or system modifications.
  - **Markdown Formatting**: Full support for headings, bold/italic, lists, tables, and fenced code blocks with syntax highlighting and copy button.

### 3.3 Continuous Voice Orbit Overlay

- **File**: `src/components/jarvis/VoiceOrbitModal.tsx`
- **Trigger**: Prominent microphone button in prompt bar or top navigation.
- **Design & Visuals**:
  - Fullscreen or elevated HUD modal overlay with glass backdrop.
  - Centered holographic Arc Reactor / Friday Orbit with multi-layered rotating rings, glowing energy arcs, and radial tick marks.
  - Live Web Audio API analyzer measuring microphone audio frequency and amplitude, dynamically pulsing the outer energy ring and equalizer bars.
- **Continuous Loop Flow**:
  1. **Listen**: Uses browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) in continuous mode. Live interim transcriptions float beneath the orbit in real-time.
  2. **Process**: Upon speech pause, dispatches query to AG-UI engine; Orbit enters spinning "processing" state with ambient cyan/amber glow.
  3. **Speak**: Uses Web Speech Synthesis (`speechSynthesis`) to audibly speak the response back in a robotic/British assistant voice. Outer rings pulse synchronously with audio utterance.
  4. **Auto-Loop**: As soon as speech synthesis ends, the recognition automatically resumes listening for the next command without user click.
- **Controls**: Floating HUD controls for Mute, Interrupt, and Close.

### 3.4 Notifications & TopBar Fixes

- **Sonner Integration**: Import `sonner/dist/styles.css` in `src/routes/__root.tsx` or `src/styles.css` and customize styles to match the dark sci-fi HUD theme.
- **TopBar Clipping Fix**: In `src/components/jarvis/TopBar.tsx`, remove clipping `overflow: hidden` on the outer header container so Radix popovers and notifications float above all cards with `z-[100]`.
- **Interactive Notifications**: Clicking a notification opens relevant mission or agent detail cards.

---

## 4. State Management & Data Flow

- **File**: `src/components/jarvis/JarvisProvider.tsx`
- Manage single persistent message history with AG-UI message types:
  ```ts
  interface AGUIMessage {
    id: string;
    role: "user" | "assistant" | "system";
    text: string;
    at: number;
    thinking?: string[];
    isStreaming?: boolean;
    toolCalls?: {
      id: string;
      tool: string;
      args: Record<string, unknown>;
      result?: unknown;
      status: "running" | "completed" | "approval_required" | "rejected";
    }[];
  }
  ```
- Manage voice chat state: `isVoiceActive`, `voiceStatus: 'idle' | 'listening' | 'thinking' | 'speaking'`, `liveTranscript`.

---

## 5. Verification & Testing Plan

- **Build & Lint Verification**:
  - `npm run build` must succeed without errors.
  - `npm run lint` format checks must pass cleanly.
- **Functional Verification**:
  1. Main Dashboard displays clean ChatGPT-style interface instead of middle orbit.
  2. Typing a directive streams tokens, displays reasoning accordion, and shows tool cards.
  3. Clicking Voice button triggers the Holographic Voice Orbit modal.
  4. Voice Orbit continuously transcribes speech, generates response, speaks audio, and loops.
  5. TopBar notification popover opens smoothly above all panels without being clipped.
  6. Sonner toast notifications render properly positioned with HUD styling.
