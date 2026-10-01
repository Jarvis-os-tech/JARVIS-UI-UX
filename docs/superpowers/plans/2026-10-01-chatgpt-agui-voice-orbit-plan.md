# ChatGPT-Style Interface with AG-UI Protocol & Continuous Voice Orbit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the JARVIS agent console from a dashboard gauge layout into a ChatGPT-style conversational workspace powered by the AG-UI (Agent-User Interaction) Protocol, featuring an audio-reactive continuous Holographic Voice Orbit modal, in-stream generative tool execution cards, thought accordions, and resolved notification overlay styling.

**Architecture:** Replace the static middle orbit on the dashboard with a full-height centered ChatGPT message column. Implement an AG-UI protocol client engine handling standard lifecycle, reasoning, streaming tokens, tool calls, and state deltas. Build an audio-reactive, continuous hands-free voice loop using Web Speech API and Web Audio API that powers an Arc Reactor / Friday holographic orbit modal. Fix Sonner toast styles and popover clipping.

**Tech Stack:** React 19, Vite 8, TanStack Router/Start, Tailwind CSS v4, Lucide React, Sonner, Web Speech API (`SpeechRecognition` & `speechSynthesis`), Web Audio API.

**Spec:** [`docs/superpowers/specs/2026-10-01-chatgpt-agui-voice-orbit-design.md`](file:///home/g0pi/Downloads/aurora-ace/docs/superpowers/specs/2026-10-01-chatgpt-agui-voice-orbit-design.md)

## Global Constraints
- Single persistent chat session (no multi-thread session switching or "New Chat" clutter).
- Main view middle space replaces the static orbit with the full ChatGPT conversation stream.
- Voice Orbit runs as an on-demand popup overlay and loops continuously (hands-free: listen -> think -> speak -> listen).
- Zero build or lint regressions (`npm run build` and `npm run lint` must pass cleanly).
- Preserve existing theme tokens (`--cyan-hud`, `--amber-hud`, `--emerald-hud`, `--violet-hud`).

---

### Task 1: Fix Sonner Toast Styling, Popover Clipping, and TopBar Notifications

**Files:**
- Modify: `src/routes/__root.tsx:1-25`
- Modify: `src/styles.css:200-240`
- Modify: `src/components/jarvis/TopBar.tsx:40-155`
- Modify: `src/components/ui/sonner.tsx:1-24`

**Interfaces:**
- Consumes: `toast` from `sonner`, `useJarvis` notifications store.
- Produces: Working unclipped notifications popover and sci-fi styled Sonner toast notifications visible above all panels.

- [ ] **Step 1: Import Sonner CSS and configure sci-fi styling in `styles.css`**

Add Sonner styles and custom toast styling in `src/styles.css`:
```css
/* Sonner Toast Base & HUD Styling */
[data-sonner-toaster] {
  font-family: var(--font-sans);
  z-index: 99999 !important;
}

[data-sonner-toast] {
  background: oklch(0.24 0.013 256 / 94%) !important;
  border: 1px solid var(--hairline) !important;
  color: var(--foreground) !important;
  backdrop-filter: blur(20px) !important;
  box-shadow: 0 12px 32px oklch(0.08 0 0 / 60%), 0 0 16px color-mix(in oklab, var(--cyan-hud) 20%, transparent) !important;
  border-radius: var(--radius-xl) !important;
}

[data-sonner-toast] [data-title] {
  font-weight: 700 !important;
  color: var(--cyan-hud) !important;
  letter-spacing: 0.05em;
}

[data-sonner-toast] [data-description] {
  color: var(--muted-foreground) !important;
  font-size: 11.5px !important;
}
```

- [ ] **Step 2: Fix TopBar header clipping and popover z-indexing in `src/components/jarvis/TopBar.tsx`**

Remove `overflow: hidden` caused by `gloss` on `<header>` or move `gloss` overlay to an absolute child pointer-events-none layer, ensuring `<header>` does not clip dropdowns/popovers:
```tsx
<header className="bezel relative z-50 flex h-[4.25rem] items-center justify-between gap-4 rounded-2xl px-4 sm:px-5">
  <div className="gloss pointer-events-none absolute inset-0 rounded-2xl" />
```
Update `PopoverContent`:
```tsx
<PopoverContent
  align="end"
  sideOffset={14}
  className="glass z-[9999] w-[min(24rem,calc(100vw-2rem))] border-hairline bg-[oklch(0.24_0.013_256/_95%)] p-0 shadow-2xl backdrop-blur-2xl"
>
```
Allow clicking a notification to navigate to the associated view or dispatch toast.

- [ ] **Step 3: Run build to verify styling and header changes**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit changes**

```bash
git add src/styles.css src/routes/__root.tsx src/components/jarvis/TopBar.tsx src/components/ui/sonner.tsx
git commit -m "fix(ui): resolve sonner toast styling and topbar popover clipping"
```

---

### Task 2: Implement AG-UI Protocol Engine & Event Types

**Files:**
- Create: `src/lib/agui-types.ts`
- Create: `src/lib/agui-client.ts`

**Interfaces:**
- Consumes: None (base protocol definitions)
- Produces:
  ```ts
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

  export interface AGUIClient {
    dispatch(directive: string, onEvent: (event: AGUIEvent) => void): Promise<void>;
    connect(endpointUrl: string): void;
  }
  ```

- [ ] **Step 1: Write `src/lib/agui-types.ts` with AG-UI protocol event definitions**

Define all event interfaces, message structures, tool call payloads, and state delta definitions adhering to the CopilotKit AG-UI open standard.

- [ ] **Step 2: Write `src/lib/agui-client.ts` with autonomous simulator & SSE support**

Implement `runSimulatedAGUIAgent(directive, state, emit)`:
- Emits `RunStarted`
- Inspects directive for tool triggers (e.g. "mission", "diagnostics", "agent", "scan", "workflow", "clear")
- Emits `StepStarted` (e.g. `"Decomposing objective"`, `"Probing agent swarm"`)
- Simulates realistic token streaming by emitting `TextMessageStart` followed by `TextMessageContent` token chunks with 20ms delays
- Emits `ToolCallStart` and `ToolCallResult` with generative UI payloads
- Emits `StateDelta` to dynamically modify live missions, telemetry, or agent loads
- Emits `StepFinished` and `RunFinished`

- [ ] **Step 3: Add unit test in `src/lib/agui-client.test.ts` or verify through standalone execution**

Verify event stream ordering: `RunStarted` -> `StepStarted` -> `TextMessageStart` -> `TextMessageContent`* -> `TextMessageEnd` -> `RunFinished`.

- [ ] **Step 4: Commit changes**

```bash
git add src/lib/agui-types.ts src/lib/agui-client.ts
git commit -m "feat(agui): implement AG-UI protocol event types and client engine"
```

---

### Task 3: Continuous Holographic Voice Orbit Modal & Audio Loop

**Files:**
- Create: `src/hooks/useContinuousVoice.ts`
- Create: `src/components/jarvis/VoiceOrbitModal.tsx`
- Modify: `src/components/jarvis/JarvisProvider.tsx`

**Interfaces:**
- Consumes: `useJarvis().sendMessage`, Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`), `speechSynthesis`.
- Produces:
  ```ts
  export function useContinuousVoice(onCommand: (text: string) => Promise<string>): {
    isListening: boolean;
    isSpeaking: boolean;
    isThinking: boolean;
    transcript: string;
    lastSpoken: string;
    audioLevel: number;
    startVoice: () => void;
    stopVoice: () => void;
  };
  ```

- [ ] **Step 1: Implement `src/hooks/useContinuousVoice.ts`**

Features:
- Browser SpeechRecognition with `continuous: true` and `interimResults: true`.
- Real-time Web Audio API `AudioContext` + `AnalyserNode` monitoring microphone volume and outputting normalized `audioLevel` (0 to 1).
- Automatic silence timeout detection: when user stops speaking for 1200ms, triggers `onCommand(transcript)`.
- Enters `isThinking = true`.
- Upon receiving response text, initiates Web Speech Synthesis (`speechSynthesis.speak(utterance)`).
- On utterance end (`utterance.onend`), resets `isSpeaking` and immediately restarts `SpeechRecognition` to maintain a continuous, hands-free loop.
- Graceful fallbacks for browsers without speech API.

- [ ] **Step 2: Implement `src/components/jarvis/VoiceOrbitModal.tsx`**

Design:
- Holographic Stark Arc Reactor / Friday modal overlay (`z-[1000]`) with frosted glass backdrop blur.
- Multi-ring rotating SVG gyro with radial ticks, glowing energy arcs, and pulsing cyan/gold core.
- SVG wave lines and equalizer bars scaled dynamically by `audioLevel`.
- Live subtitle transcription area showing what the user is saying in real-time.
- Status HUD badge: `[LISTENING...]`, `[ANALYZING DIRECTIVE...]`, `[JARVIS SPEAKING...]`.
- Floating controls: Mute/Pause button, Interrupt button, Close modal button (`Esc`).

- [ ] **Step 3: Test voice hook and modal rendering**

Verify continuous speech synthesis onend triggers recognition restart without crashing.

- [ ] **Step 4: Commit changes**

```bash
git add src/hooks/useContinuousVoice.ts src/components/jarvis/VoiceOrbitModal.tsx
git commit -m "feat(voice): create continuous holographic voice orbit modal"
```

---

### Task 4: ChatGPT Chat Interface & In-Stream Generative Tool Cards

**Files:**
- Create: `src/components/jarvis/ThoughtAccordion.tsx`
- Create: `src/components/jarvis/ToolExecutionCard.tsx`
- Create: `src/components/jarvis/ApprovalCard.tsx`
- Create: `src/components/jarvis/ChatMessageItem.tsx`
- Create: `src/components/jarvis/PromptBar.tsx`
- Create: `src/components/jarvis/ChatView.tsx`

**Interfaces:**
- Consumes: AG-UI Message types, `useJarvis()`, `openVoiceOrbit()`.
- Produces: Full-featured ChatGPT conversation stream replacing the static middle orbit.

- [ ] **Step 1: Implement `ThoughtAccordion.tsx`**

Collapsible "Thought Process" block:
- Pulsing animated cyan spark when active (`StepStarted`).
- List of thought step titles (e.g. `1. Scanning memory database`, `2. Formulating response`).
- Execution duration timer badge.

- [ ] **Step 2: Implement `ToolExecutionCard.tsx` & `ApprovalCard.tsx`**

- `ToolExecutionCard`:
  - Visual card showing tool name (`web_search`, `mcp_connector`, `mission_dispatch`), input parameters formatted as code, and result payload.
  - Success checkmark or running spinner.
- `ApprovalCard`:
  - High-visibility action gate with `[Approve Directive]` and `[Reject]` buttons.
  - On approve, emits confirmation and executes action.

- [ ] **Step 3: Implement `ChatMessageItem.tsx`**

- User message: Clean bubble with avatar on right/left, timestamp, copy button.
- Assistant message:
  - JARVIS / FRIDAY avatar with model tag (`AG-UI / MK-VII`).
  - ThoughtAccordion (if thoughts exist).
  - In-stream ToolExecutionCards.
  - Streaming or final markdown response text.
  - Action buttons: Copy message, Speak aloud, Thumbs up/down.

- [ ] **Step 4: Implement `PromptBar.tsx`**

- Auto-resizing multi-line textarea with placeholder `"Directive for JARVIS... (Shift+Enter for newline)"`.
- Quick suggestion chips ("Status report", "Run diagnostic", "List agents", "Dispatch mission").
- Prominent **Voice Chat Button** with glowing cyan/amber animated ripple ring that triggers the Voice Orbit modal.
- Send button (`Enter` key handler) & Stop button during streaming runs.

- [ ] **Step 5: Assemble `ChatView.tsx`**

- Centered `max-w-3xl` message stream container with smooth auto-scroll to bottom.
- Header with model indicator, status pill (`AG-UI Engine Online`), and clear console button.
- Replaces the previous `OrbStage` on the dashboard.

- [ ] **Step 6: Run build check**

Run: `npm run build`
Expected: PASS

- [ ] **Step 7: Commit changes**

```bash
git add src/components/jarvis/ThoughtAccordion.tsx src/components/jarvis/ToolExecutionCard.tsx src/components/jarvis/ApprovalCard.tsx src/components/jarvis/ChatMessageItem.tsx src/components/jarvis/PromptBar.tsx src/components/jarvis/ChatView.tsx
git commit -m "feat(chat): build ChatGPT stream with AG-UI generative tool cards"
```

---

### Task 5: Wire AG-UI Engine, Voice Orbit & ChatView into Jarvis App

**Files:**
- Modify: `src/components/jarvis/JarvisProvider.tsx`
- Modify: `src/components/jarvis/views/DashboardView.tsx`
- Modify: `src/components/jarvis/JarvisApp.tsx`
- Modify: `src/components/jarvis/Sidebar.tsx`

**Interfaces:**
- Consumes: `ChatView`, `VoiceOrbitModal`, `aguiClient`.
- Produces: Complete end-to-end user experience with ChatGPT main chat, persistent session, continuous voice orbit, and AG-UI event handling.

- [ ] **Step 1: Update `JarvisProvider.tsx` with AG-UI message state & continuous voice triggers**

- Enhance `messages` state to store AG-UI messages (`thoughts`, `toolCalls`, `isStreaming`).
- Implement `sendDirective(text: string)` using the AG-UI client engine.
- Add `voiceModalOpen` state and `setVoiceModalOpen`.
- Add external AG-UI endpoint configuration setting.

- [ ] **Step 2: Replace middle orbit in `src/components/jarvis/views/DashboardView.tsx`**

Replace:
```tsx
<OrbStage />
<Conversation />
```
With:
```tsx
<ChatView onOpenVoice={() => setVoiceModalOpen(true)} />
```

- [ ] **Step 3: Mount `VoiceOrbitModal` in `JarvisApp.tsx`**

Render `<VoiceOrbitModal isOpen={voiceModalOpen} onClose={() => setVoiceModalOpen(false)} />` alongside `<Shell />`.

- [ ] **Step 4: Update Sidebar with direct Voice Mode button & clean single-session layout**

Ensure navigation focuses on views without redundant "New Chat" buttons, keeping one unified persistent console session.

- [ ] **Step 5: Run build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit changes**

```bash
git add src/components/jarvis/JarvisProvider.tsx src/components/jarvis/views/DashboardView.tsx src/components/jarvis/JarvisApp.tsx src/components/jarvis/Sidebar.tsx
git commit -m "feat(core): integrate AG-UI chat view and continuous voice orbit into shell"
```

---

### Task 6: Formatting, Linting & End-to-End Verification

**Files:**
- Modify: Codebase formatting fixes (`eslint`, `prettier`)

- [ ] **Step 1: Run linter and formatting auto-fix**

Run: `npm run format && npm run lint`
Expected: Fix all 72 Prettier/ESLint issues.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Build passes with 0 errors.

- [ ] **Step 3: Verify all user requirements**
1. Middle static orbit is completely removed from the main view.
2. Full ChatGPT-style conversational stream is rendered with auto-scroll and prompt deck.
3. Typing directives triggers AG-UI streaming with reasoning accordions and tool cards.
4. Voice button triggers the Holographic Voice Orbit modal with audio wave reactivity.
5. Voice loop runs continuously (hands-free Speech-to-Text -> response -> Speech Synthesis -> auto-resumes listening).
6. Sonner toasts render with sci-fi HUD styling.
7. TopBar popover opens cleanly without clipping.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: format codebase and complete AG-UI ChatGPT voice overhaul"
```
