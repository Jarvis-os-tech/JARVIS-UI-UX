import React, { useState } from "react";
import { AlertTriangle, Check, X, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApprovalCardProps {
  title: string;
  description: string;
  actionPayload?: Record<string, unknown>;
  onApprove: () => void;
  onReject: () => void;
}

export function ApprovalCard({
  title,
  description,
  actionPayload,
  onApprove,
  onReject,
}: ApprovalCardProps) {
  const [decision, setDecision] = useState<"pending" | "approved" | "rejected">("pending");

  const handleApprove = () => {
    setDecision("approved");
    onApprove();
  };

  const handleReject = () => {
    setDecision("rejected");
    onReject();
  };

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-amber-hud/40 bg-[oklch(0.22_0.015_256)] p-4 shadow-[0_4px_24px_rgba(235,175,45,0.15)]">
      <div className="flex items-start gap-3">
        <div className="neu-inset grid h-9 w-9 shrink-0 place-items-center rounded-xl text-amber-hud">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-amber-hud">
              {title}
            </h4>
            <span className="rounded bg-amber-hud/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-hud uppercase">
              CONFIRMATION REQUIRED
            </span>
          </div>
          <p className="mt-1 text-xs text-foreground/90 leading-relaxed">{description}</p>

          {actionPayload && (
            <pre className="mt-2.5 max-h-32 overflow-x-auto rounded-lg bg-black/40 p-2 font-mono text-[10.5px] text-muted-foreground">
              {JSON.stringify(actionPayload, null, 2)}
            </pre>
          )}

          {decision === "pending" ? (
            <div className="mt-3.5 flex items-center gap-2.5">
              <button
                onClick={handleApprove}
                className="key flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-cyan-hud glow-ring transition-transform active:scale-95"
              >
                <Check className="h-3.5 w-3.5" />
                Approve Directive
              </button>
              <button
                onClick={handleReject}
                className="key flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </button>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 font-mono text-xs">
              <span
                className={cn(
                  "font-bold uppercase",
                  decision === "approved" ? "text-emerald-hud" : "text-destructive",
                )}
              >
                [{decision === "approved" ? "DIRECTIVE APPROVED" : "DIRECTIVE REJECTED"}]
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
