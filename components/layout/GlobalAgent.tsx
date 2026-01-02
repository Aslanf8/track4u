"use client";

import { useState } from "react";
import { FloatingAgentButton } from "./FloatingAgentButton";
import { NutritionAgentDialog } from "@/components/agent/NutritionAgentDialog";

export function GlobalAgent() {
  const [agentOpen, setAgentOpen] = useState(false);

  return (
    <>
      <FloatingAgentButton onClick={() => setAgentOpen(true)} />
      <NutritionAgentDialog open={agentOpen} onOpenChange={setAgentOpen} />
    </>
  );
}

