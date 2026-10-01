import React, { useState, useRef, useEffect } from "react";
import { Send, Square, Mic, Sparkles, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptBarProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  onOpenVoice: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
}

const SUGGESTIONS = [
  { label: "System Diagnostic", prompt: "Run complete system diagnostic across active nodes" },
  { label: "Status Report", prompt: "Summarize active agent status, memory, and telemetry" },
  { label: "Deploy Mission", prompt: "Deploy autonomous mission to scan and index intelligence feeds" },
  { label: "Query Swarm", prompt: "Inspect agent swarm workloads and queued execution tasks" },
];

export function PromptBar({
  onSend,
  onStop,
  onOpenVoice,
  isStreaming = false,
  disabled = false,
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
    <div className="w-full space-y-3">
      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
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

      {/* Main Input Capsule */}
      <div className="glass relative flex items-end gap-2 rounded-2xl border border-hairline bg-[oklch(0.22_0.013_256/_92%)] p-2 shadow-2xl backdrop-blur-xl">
        {/* Glow Voice Orbit Button */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={onOpenVoice}
            title="Activate Continuous Voice Orbit (FRIDAY)"
            aria-label="Activate Continuous Voice Orbit"
            className="neu relative grid h-11 w-11 place-items-center rounded-xl text-cyan-hud transition-transform hover:scale-105 active:scale-95 group"
          >
            {/* Animated glowing ring */}
            <span className="absolute inset-0 rounded-xl border border-cyan-hud/40 animate-ping-ring" />
            <Mic className="h-5 w-5 drop-shadow-[0_0_8px_var(--cyan-hud)] transition-colors group-hover:text-white" />
          </button>
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Directive for JARVIS... (Shift+Enter for newline)"
          rows={1}
          disabled={disabled}
          className="max-h-36 min-h-[2.75rem] flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        {/* Send / Stop Button */}
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
