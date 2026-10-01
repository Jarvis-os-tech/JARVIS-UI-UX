import React, { useRef, useEffect } from "react";
import { Trash2, Cpu, Zap, Volume2 } from "lucide-react";
import type { AGUIMessage } from "@/lib/agui-types";
import { ChatMessageItem } from "./ChatMessageItem";
import { PromptBar } from "./PromptBar";
import { LiveVoiceOrbit } from "./LiveVoiceOrbit";
import { useJarvis } from "./JarvisProvider";
import { cn } from "@/lib/utils";

interface ChatViewProps {
  messages: AGUIMessage[];
  isStreaming?: boolean;
  onSendMessage: (text: string) => void;
  onStopStreaming?: () => void;
  onClearMessages?: () => void;
}

export function ChatView({
  messages,
  isStreaming = false,
  onSendMessage,
  onStopStreaming,
  onClearMessages,
}: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    voiceListening,
    voiceThinking,
    voiceSpeaking,
    voiceTranscript,
    voiceAudioLevel,
    toggleVoiceMic,
    interruptVoiceSpeech,
  } = useJarvis();

  // Auto-scroll to bottom as new tokens arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  return (
    <div className="flex h-full w-full flex-col min-h-0 overflow-hidden">
      {/* Top Protocol Status Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-hairline px-4 py-2.5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
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

        <div className="flex items-center gap-2.5">
          {/* Continuous Voice Status Indicator (No separate button, pure status) */}
          <div className="neu-inset flex items-center gap-2 rounded-xl px-3 py-1 border border-hairline">
            <span className="relative flex h-2 w-2">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full animate-ping opacity-75",
                  voiceSpeaking
                    ? "bg-violet-hud"
                    : voiceListening
                      ? "bg-cyan-hud"
                      : "bg-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  voiceSpeaking
                    ? "bg-violet-hud"
                    : voiceListening
                      ? "bg-cyan-hud"
                      : "bg-muted-foreground",
                )}
              />
            </span>
            <span className="font-mono text-[11px] font-bold tracking-wider text-foreground">
              {voiceSpeaking
                ? "JARVIS SPEAKING"
                : voiceThinking
                  ? "PROCESSING"
                  : voiceListening
                    ? "VOICE CONTINUOUS"
                    : "VOICE MUTED"}
            </span>

            {/* Mini Audio Equalizer Bars */}
            <span className="flex items-end gap-[2px] h-3 ml-0.5">
              {[0.4, 0.9, 0.6, 1, 0.5, 0.8].map((h, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-[2px] rounded-full transition-all duration-75",
                    voiceSpeaking ? "bg-violet-hud" : "bg-cyan-hud",
                  )}
                  style={{
                    height: `${Math.max(
                      2,
                      Math.min(
                        12,
                        voiceListening || voiceSpeaking
                          ? Math.max(0.15, voiceAudioLevel) * 12 * h
                          : 2,
                      ),
                    )}px`,
                  }}
                />
              ))}
            </span>
          </div>

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
            /* Welcome / Starter View with Living Center Holographic Orbit */
            <div className="my-8 flex flex-col items-center text-center animate-rise-in">
              <div className="relative mb-6">
                <LiveVoiceOrbit
                  size="lg"
                  isListening={voiceListening}
                  isThinking={voiceThinking || isStreaming}
                  isSpeaking={voiceSpeaking}
                  audioLevel={voiceAudioLevel}
                  transcript={voiceTranscript}
                  onClick={voiceSpeaking ? interruptVoiceSpeech : toggleVoiceMic}
                />
              </div>

              <h2 className="font-display text-xl font-bold tracking-[0.25em] text-foreground sm:text-2xl">
                JARVIS VOICE COMMAND STREAM
              </h2>
              <p className="mt-2 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Autonomous voice-first orchestrator. JARVIS is listening continuously — speak your
                directive aloud, or transmit instructions using the console below.
              </p>

              {/* Feature Pill Matrix */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-left">
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
              </div>
            </div>
          ) : (
            /* Render Message History */
            messages.map((msg) => <ChatMessageItem key={msg.id} message={msg} />)
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Sticky Prompt Deck with Embedded Live Small Orbit */}
      <div className="shrink-0 border-t border-hairline bg-[oklch(0.2_0.012_256/_90%)] p-4 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl">
          <PromptBar
            onSend={onSendMessage}
            onStop={onStopStreaming}
            isStreaming={isStreaming}
            voiceListening={voiceListening}
            voiceThinking={voiceThinking}
            voiceSpeaking={voiceSpeaking}
            voiceTranscript={voiceTranscript}
            voiceAudioLevel={voiceAudioLevel}
            onToggleMic={toggleVoiceMic}
            onInterruptSpeech={interruptVoiceSpeech}
          />
        </div>
      </div>
    </div>
  );
}
