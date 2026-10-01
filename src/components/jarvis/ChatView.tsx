import React, { useRef, useEffect } from "react";
import { Sparkles, Trash2, Cpu, Mic, ShieldCheck, Zap } from "lucide-react";
import type { AGUIMessage } from "@/lib/agui-types";
import { ChatMessageItem } from "./ChatMessageItem";
import { PromptBar } from "./PromptBar";

interface ChatViewProps {
  messages: AGUIMessage[];
  isStreaming?: boolean;
  onSendMessage: (text: string) => void;
  onStopStreaming?: () => void;
  onClearMessages?: () => void;
  onOpenVoice: () => void;
}

export function ChatView({
  messages,
  isStreaming = false,
  onSendMessage,
  onStopStreaming,
  onClearMessages,
  onOpenVoice,
}: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as new tokens arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  return (
    <div className="flex h-full w-full flex-col min-h-0 overflow-hidden">
      {/* Top Protocol Status Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-hairline px-4 py-2.5 bg-black/15">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-hud opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-hud" />
          </span>
          <span className="font-mono text-xs font-bold tracking-wider text-cyan-hud">
            AG-UI PROTOCOL ACTIVE
          </span>
          <span className="hidden sm:inline-block text-[11px] text-muted-foreground font-mono">
            | STREAMING LATENCY &lt; 20ms
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVoice}
            className="neu-sm flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold text-cyan-hud hover:text-white transition-colors"
            title="Launch Continuous Voice Orbit"
          >
            <Mic className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Voice Mode</span>
          </button>

          {onClearMessages && messages.length > 0 && (
            <button
              onClick={onClearMessages}
              className="key grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:text-destructive"
              title="Clear Session Stream"
              aria-label="Clear Session Stream"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Messages Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth">
        <div className="mx-auto max-w-3xl">
          {messages.length === 0 ? (
            /* Welcome / Starter View */
            <div className="my-10 flex flex-col items-center text-center animate-rise-in">
              <div className="neu relative mb-6 grid h-20 w-20 place-items-center rounded-3xl border border-cyan-hud/30 shadow-[0_0_30px_rgba(45,212,235,0.2)]">
                <div className="absolute inset-2 animate-ping-ring rounded-2xl border border-cyan-hud/30" />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-10 w-10 drop-shadow-[0_0_12px_var(--cyan-hud)]"
                >
                  <path
                    d="M12 2L2 8l10 6 10-6-10-6z"
                    stroke="var(--cyan-hud)"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 16l10 6 10-6M2 12l10 6 10-6"
                    stroke="var(--cyan-hud)"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2 className="font-display text-xl font-bold tracking-[0.25em] text-foreground sm:text-2xl">
                JARVIS COMMAND STREAM
              </h2>
              <p className="mt-2 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Autonomous voice & agent orchestrator powered by the AG-UI Protocol. Issue
                directives below or activate hands-free continuous voice mode.
              </p>

              {/* Feature Pill Matrix */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-left">
                <div
                  onClick={() =>
                    onSendMessage("Run complete system diagnostic across active nodes")
                  }
                  className="neu-sm cursor-pointer rounded-2xl p-4 transition-all hover:border-cyan-hud/40 hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-2 text-cyan-hud mb-1.5">
                    <Zap className="h-4 w-4" />
                    <span className="font-display text-xs font-bold tracking-wider">
                      DIAGNOSTIC
                    </span>
                  </div>
                  <p className="text-[11.5px] text-muted-foreground group-hover:text-foreground/90 transition-colors">
                    Probe node cluster latencies, memory integrity, and network packets.
                  </p>
                </div>

                <div
                  onClick={() =>
                    onSendMessage("Deploy autonomous mission to scan and index intelligence feeds")
                  }
                  className="neu-sm cursor-pointer rounded-2xl p-4 transition-all hover:border-amber-hud/40 hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-2 text-amber-hud mb-1.5">
                    <Cpu className="h-4 w-4" />
                    <span className="font-display text-xs font-bold tracking-wider">MISSION</span>
                  </div>
                  <p className="text-[11.5px] text-muted-foreground group-hover:text-foreground/90 transition-colors">
                    Dispatch multi-step operational task to the sub-agent swarm matrix.
                  </p>
                </div>

                <div
                  onClick={onOpenVoice}
                  className="neu-sm cursor-pointer rounded-2xl p-4 transition-all hover:border-violet-hud/40 hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-2 text-violet-hud mb-1.5">
                    <Mic className="h-4 w-4" />
                    <span className="font-display text-xs font-bold tracking-wider">
                      VOICE ORBIT
                    </span>
                  </div>
                  <p className="text-[11.5px] text-muted-foreground group-hover:text-foreground/90 transition-colors">
                    Launch holographic Arc Reactor hands-free voice dialogue loop.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Render Message History */
            messages.map((msg) => <ChatMessageItem key={msg.id} message={msg} />)
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Sticky Prompt Deck */}
      <div className="shrink-0 border-t border-hairline bg-[oklch(0.2_0.012_256/_90%)] p-4 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl">
          <PromptBar
            onSend={onSendMessage}
            onStop={onStopStreaming}
            onOpenVoice={onOpenVoice}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
