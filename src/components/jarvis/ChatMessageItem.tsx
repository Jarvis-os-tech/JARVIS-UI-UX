import React, { useState } from "react";
import { Copy, Check, Volume2, ThumbsUp, ThumbsDown, Bot, User, Sparkles } from "lucide-react";
import type { AGUIMessage } from "@/lib/agui-types";
import { ThoughtAccordion } from "./ThoughtAccordion";
import { ToolExecutionCard } from "./ToolExecutionCard";
import { cn } from "@/lib/utils";

interface ChatMessageItemProps {
  message: AGUIMessage;
  onSpeak?: (text: string) => void;
}

export function ChatMessageItem({ message, onSpeak }: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(message.content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (onSpeak) {
      onSpeak(message.content);
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const clean = message.content.replace(/[*#`_~]/g, " ").trim();
      const utter = new SpeechSynthesisUtterance(clean);
      window.speechSynthesis.speak(utter);
    }
  };

  // Helper to render formatted text with basic markdown styling (bold, bullets, code)
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Check for bullet list
      if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
        const text = line.slice(2);
        return (
          <div key={idx} className="flex items-start gap-2 py-0.5">
            <span className="text-cyan-hud font-bold mt-1 text-xs">•</span>
            <span className="flex-1">{formatInline(text)}</span>
          </div>
        );
      }

      // Check for numbered list
      const numMatch = line.match(/^(\d+\.)\s+(.+)$/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 py-0.5">
            <span className="font-mono text-cyan-hud font-bold text-xs">{numMatch[1]}</span>
            <span className="flex-1">{formatInline(numMatch[2])}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="py-0.5 leading-relaxed">
          {formatInline(line)}
        </p>
      );
    });
  };

  // Parse **bold** and `code` inline
  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[11.5px] text-cyan-hud border border-white/5"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 animate-rise-in">
        <div className="flex max-w-[85%] sm:max-w-[75%] items-end gap-3">
          <div className="relative rounded-2xl rounded-tr-sm bg-gradient-to-br from-cyan-hud/20 to-[oklch(0.24_0.013_256)] border border-cyan-hud/30 p-4 text-sm text-foreground shadow-lg backdrop-blur-md">
            <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
            <div className="mt-1 flex items-center justify-end gap-1.5 font-mono text-[10px] text-muted-foreground/75">
              <span>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="neu-inset grid h-9 w-9 shrink-0 place-items-center rounded-xl text-cyan-hud">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex justify-start mb-8 animate-rise-in">
      <div className="flex max-w-full sm:max-w-[95%] items-start gap-3 w-full">
        {/* JARVIS Avatar */}
        <div className="neu relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-cyan-hud/30">
          <div className="absolute inset-1 animate-ping-ring rounded-xl border border-cyan-hud/30" />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5 drop-shadow-[0_0_8px_var(--cyan-hud)]"
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

        {/* Assistant Content Container */}
        <div className="min-w-0 flex-1">
          {/* Header Tag */}
          <div className="mb-2 flex items-center gap-2">
            <span className="font-display text-xs font-bold tracking-[0.2em] text-foreground">
              JARVIS
            </span>
            <span className="rounded bg-cyan-hud/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-cyan-hud border border-cyan-hud/20">
              AG-UI / MK-VII
            </span>
            {message.isStreaming && (
              <span className="flex items-center gap-1 font-mono text-[10px] text-amber-hud animate-pulse">
                <Sparkles className="h-3 w-3" />
                Streaming...
              </span>
            )}
            <span className="font-mono text-[10px] text-muted-foreground ml-auto">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Thought Accordion (if any) */}
          {message.thoughts && message.thoughts.length > 0 && (
            <ThoughtAccordion thoughts={message.thoughts} isStreaming={message.isStreaming} />
          )}

          {/* In-stream Tool Execution Cards */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mb-3 space-y-2">
              {message.toolCalls.map((tc) => (
                <ToolExecutionCard key={tc.id} toolCall={tc} />
              ))}
            </div>
          )}

          {/* Message Text Card */}
          <div className="glass rounded-2xl rounded-tl-sm border border-hairline bg-[oklch(0.23_0.013_256/_80%)] p-4 text-sm text-foreground/95 shadow-md backdrop-blur-xl">
            <div className="prose prose-invert max-w-none text-[13.5px]">
              {renderFormattedContent(message.content)}
            </div>

            {/* Action Toolbar */}
            <div className="mt-3.5 flex items-center justify-between border-t border-hairline pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  title="Copy message"
                  className="key flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] hover:text-cyan-hud"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-hud" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>

                <button
                  onClick={handleSpeak}
                  title="Read message aloud"
                  className="key flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] hover:text-cyan-hud"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  Read
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFeedback(feedback === "up" ? null : "up")}
                  className={cn(
                    "key grid h-6 w-6 place-items-center rounded-lg hover:text-emerald-hud",
                    feedback === "up" ? "text-emerald-hud" : "",
                  )}
                  title="Helpful"
                >
                  <ThumbsUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setFeedback(feedback === "down" ? null : "down")}
                  className={cn(
                    "key grid h-6 w-6 place-items-center rounded-lg hover:text-destructive",
                    feedback === "down" ? "text-destructive" : "",
                  )}
                  title="Not helpful"
                >
                  <ThumbsDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
