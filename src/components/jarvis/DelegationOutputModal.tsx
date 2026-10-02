import React, { useEffect } from "react";
import type { DelegatedOutputCard as CardType } from "@/lib/jarvis-data";
import { DelegationOutputCard } from "./DelegationOutputCard";

interface DelegationOutputModalProps {
  card: CardType | null;
  onClose: () => void;
}

export function DelegationOutputModal({ card, onClose }: DelegationOutputModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (card) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [card, onClose]);

  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl transform transition-all animate-rise-in"
        onClick={(e) => e.stopPropagation()}
      >
        <DelegationOutputCard card={card} onClose={onClose} isModal />
      </div>
    </div>
  );
}
