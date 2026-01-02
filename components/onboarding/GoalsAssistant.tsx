"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface GoalsAssistantProps {
  currentStep: string;
  currentGoal?: string;
}

const QUICK_QUESTIONS: Record<string, string[]> = {
  welcome: ["How does this work?", "What info do you need?"],
  basics: ["Why does age matter?", "How does gender affect calories?"],
  body: ["Should I use morning weight?", "How accurate is BMI?"],
  activity: [
    "How do I pick my activity level?",
    "Does my job count?",
    "I work out but have a desk job",
  ],
  goal: [
    "How fast can I lose weight safely?",
    "Best approach to build muscle?",
    "Should I bulk or cut first?",
  ],
  macros: [
    "Are these targets right for me?",
    "Should I eat more protein?",
    "How important are exact macros?",
  ],
  openai: [
    "Why do I need an API key?",
    "Is my key secure?",
    "What if I skip this?",
  ],
  confirm: ["Do these goals look balanced?", "Can I change these later?"],
};

export function GoalsAssistant({
  currentStep,
  currentGoal,
}: GoalsAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      content:
        "Hi! I'm your nutrition assistant. Ask me anything about setting your daily goals — I'll keep answers short and actionable.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context: { step: currentStep, currentGoal },
        }),
      });

      const data = await response.json();

      // Handle no API key error
      if (data.code === "NO_API_KEY") {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "🔑 To use the AI assistant, you'll need to add your OpenAI API key first. Complete the 'AI Setup' step or add it later in Settings.",
          },
        ]);
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.response ||
          data.error ||
          "Sorry, I couldn't process that. Try again?",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Connection issue. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions =
    QUICK_QUESTIONS[currentStep] || QUICK_QUESTIONS.welcome;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white"
            >
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M15 13v2" />
              <path d="M9 13v2" />
            </svg>
          </div>
          <div>
            <p className="text-xs lg:text-sm font-medium text-zinc-900 dark:text-zinc-100">
              AI Assistant
            </p>
            <p className="text-[10px] lg:text-xs text-zinc-500">
              Ask about nutrition goals
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                message.role === "user"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-2.5">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions */}
      <div className="px-4 pb-2 flex-shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-wrap scrollbar-hide">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={isLoading}
              className="text-xs px-2.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 lg:p-4 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-0 text-xs lg:text-sm h-9 lg:h-10"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 h-9 w-9 lg:h-10 lg:w-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </Button>
        </form>
      </div>
    </div>
  );
}
