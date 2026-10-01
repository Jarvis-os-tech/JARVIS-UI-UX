import React, { useState, useRef, useEffect } from "react";
import { Send, Square, Terminal, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiveVoiceOrbit } from "./LiveVoiceOrbit";

interface PromptBarProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  voiceListening?: boolean;
  voiceThinking?: boolean;
  voiceSpeaking?: boolean;
  voiceTranscript?: string;
  voiceAudioLevel?: number;
  onToggleMic?: () => void;
  onInterruptSpeech?: () => void;
}

const SUGGESTIONS = [
  { label: "System Diagnostic", prompt: "Run complete system diagnostic across active nodes" },
  { label: "Status Report", prompt: "Summarize active agent status, memory, and telemetry" },
  {
    label: "Deploy Mission",
    prompt: "Deploy autonomous mission to scan and index intelligence feeds",
  },
  { label: "Query Swarm", prompt: "Inspect agent swarm workloads and queued execution tasks" },
];

export function PromptBar({
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
  voiceListening = true,
  voiceThinking = false,
  voiceSpeaking = false,
  voiceTranscript = "",
  voiceAudioLevel = 0,
  onToggleMic,
  onInterruptSpeech,
}: PromptBarProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isStreaming) {
      onStop?.();
      return;
    }
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    if (disabled || isStreaming) return;
    onSend(prompt);
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Live Voice Real-Time Feedback Pill */}
      {voiceTranscript && (
        <div className="flex items-center gap-2 rounded-xl border border-cyan-hud/40 bg-cyan-hud/10 px-3.5 py-1.5 text-xs font-mono text-cyan-hud backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-hud opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-hud" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
            JARVIS Hearing:
          </span>
          <span className="truncate italic text-foreground max-w-lg">"{voiceTranscript}"</span>
          <span className="ml-auto font-mono text-[9.5px] text-cyan-hud/80 shrink-0 hidden sm:inline-block">
            [processing on silence]
          </span>
        </div>
      )}

      {/* Speaking State Banner with Quick Interrupt */}
      {voiceSpeaking && (
        <div className="flex items-center gap-2 rounded-xl border border-violet-hud/40 bg-violet-hud/10 px-3.5 py-1.5 text-xs font-mono text-violet-hud backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <Volume2 className="h-3.5 w-3.5 shrink-0 text-violet-hud animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-hud shrink-0">
            JARVIS Speaking Out Loud
          </span>
          {onInterruptSpeech && (
            <button
              type="button"
              onClick={onInterruptSpeech}
              className="ml-auto text-[10.5px] text-violet-hud/80 hover:text-white underline"
            >
              Interrupt speech
            </button>
          )}
        </div>
      )}

      {/* Quick Suggestion Directives */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground shrink-0 uppercase tracking-wider">
          <Terminal className="h-3 w-3 text-cyan-hud" />
          Directives:
        </span>
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSuggestionClick(s.prompt)}
            disabled={disabled || isStreaming}
            className="neu-sm shrink-0 rounded-xl px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground hover:text-cyan-hud transition-colors border border-hairline hover:border-cyan-hud/40 active:scale-95 disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main Input Deck with Embedded Live Small Orbit */}
      <div className="glass relative flex items-end gap-2.5 rounded-2xl border border-hairline bg-[oklch(0.22_0.013_256/_92%)] p-2 shadow-2xl backdrop-blur-xl">
        {/* Living Small Holographic Voice Orbit */}
        <div className="relative shrink-0 flex items-center justify-center p-0.5">
          <LiveVoiceOrbit
            size="sm"
            isListening={voiceListening}
            isThinking={voiceThinking || isStreaming}
            isSpeaking={voiceSpeaking}
            audioLevel={voiceAudioLevel}
            transcript={voiceTranscript}
            onClick={voiceSpeaking ? onInterruptSpeech : onToggleMic}
          />
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Speak directive aloud, or type for JARVIS... (Shift+Enter for newline)"
          rows={1}
          disabled={disabled}
          className="max-h-36 min-h-[2.75rem] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        {/* Send / Stop Action Button */}
        <div className="shrink-0">
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              title="Halt generation"
              aria-label="Halt generation"
              className="key grid h-11 w-11 place-items-center rounded-xl text-amber-hud border border-amber-hud/40 glow-ring"
            >
              <Square className="h-4 w-4 fill-amber-hud" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!input.trim() || disabled}
              title="Transmit directive (Enter)"
              aria-label="Transmit directive"
              className={cn(
                "key grid h-11 w-11 place-items-center rounded-xl transition-all",
                input.trim()
                  ? "text-cyan-hud border-cyan-hud/40 glow-ring scale-100"
                  : "text-muted-foreground/40 cursor-not-allowed",
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
