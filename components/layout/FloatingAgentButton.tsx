"use client";

import { Button } from "@/components/ui/button";

interface FloatingAgentButtonProps {
  onClick: () => void;
}

export function FloatingAgentButton({ onClick }: FloatingAgentButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-36 right-4 md:bottom-24 md:right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all hover:scale-105 active:scale-95"
      size="icon"
      aria-label="Open Nutrition Agent"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 text-white"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </Button>
  );
}

