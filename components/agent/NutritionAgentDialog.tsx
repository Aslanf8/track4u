"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Sparkles, Brain, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

interface ToolCall {
  id: string;
  toolName: string;
  arguments?: string;
  status: "calling" | "completed";
  output?: string;
  timestamp: number;
}

interface ThinkingStep {
  id: string;
  content: string;
  timestamp: number;
}

interface NutritionAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NutritionAgentDialog({
  open,
  onOpenChange,
}: NutritionAgentDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when content changes - improved smooth scrolling
  useEffect(() => {
    const scrollContainer = messagesEndRef.current?.parentElement;
    if (scrollContainer) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: "smooth",
          });
        }, 100);
      });
    }
  }, [messages, toolCalls, thinkingSteps, streamingText]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);
    setToolCalls([]);
    setThinkingSteps([]);
    setStreamingText("");

    // Add user message immediately
    const newUserMessage: Message = {
      role: "user",
      content: userMessage,
      id: `user-${Date.now()}`,
    };
    setMessages((prev) => [...prev, newUserMessage]);

    setIsLoading(true);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/nutrition-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Failed to get response"
        );
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const assistantMessageId = `assistant-${Date.now()}`;
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";

        for (const chunk of chunks) {
          if (!chunk.trim()) continue;

          let eventType = "";
          let eventData = null;

          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.substring(7).trim();
            } else if (line.startsWith("data: ")) {
              try {
                eventData = JSON.parse(line.substring(6));
              } catch (e) {
                console.error("Failed to parse SSE data:", e);
                continue;
              }
            }
          }

          if (eventType && eventData) {
            switch (eventType) {
              case "thinking":
                setThinkingSteps((prev) => [
                  ...prev,
                  {
                    id: `thinking-${Date.now()}-${prev.length}`,
                    content: eventData.content,
                    timestamp: Date.now(),
                  },
                ]);
                break;

              case "tool_call":
                setToolCalls((prev) => [
                  ...prev,
                  {
                    id: `tool-${Date.now()}-${prev.length}`,
                    toolName: eventData.toolName,
                    arguments: eventData.arguments,
                    status: "calling",
                    timestamp: Date.now(),
                  },
                ]);
                break;

              case "tool_result":
                setToolCalls((prev) =>
                  prev.map((tool) =>
                    tool.toolName === eventData.toolName
                      ? {
                          ...tool,
                          status: "completed",
                          output: eventData.output,
                        }
                      : tool
                  )
                );
                break;

              case "text_delta":
                // Ensure delta is a string
                const delta =
                  typeof eventData.delta === "string"
                    ? eventData.delta
                    : String(eventData.delta || "");
                accumulatedText += delta;
                setStreamingText(accumulatedText);
                break;

              case "message_chunk":
                // Ensure content is a string
                const chunkContent =
                  typeof eventData.content === "string"
                    ? eventData.content
                    : String(eventData.content || "");
                accumulatedText = chunkContent;
                setStreamingText(accumulatedText);
                break;

              case "message_complete":
                // Add final assistant message
                // Ensure content is always a string
                let finalContent = eventData.content;
                if (typeof finalContent !== "string") {
                  if (Array.isArray(finalContent)) {
                    finalContent = finalContent
                      .map((c: unknown) => {
                        if (typeof c === "string") return c;
                        if (
                          typeof c === "object" &&
                          c !== null &&
                          "text" in c
                        ) {
                          return String((c as { text?: unknown }).text || "");
                        }
                        return String(c || "");
                      })
                      .join("\n");
                  } else {
                    finalContent = String(finalContent || "");
                  }
                }

                setMessages((prev) => [
                  ...prev,
                  {
                    role: "assistant",
                    content: finalContent,
                    id: assistantMessageId,
                  },
                ]);
                setStreamingText("");
                setToolCalls([]);
                setThinkingSteps([]);
                break;

              case "error":
                throw new Error(
                  eventData.message || eventData.code || "Unknown error"
                );

              case "done":
                // Cleanup
                setStreamingText("");
                break;
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // User cancelled, don't show error
        return;
      }
      console.error("Error sending message:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to get response from agent";
      setError(errorMessage);
      setMessages((prev) => prev.filter((msg) => msg.id !== newUserMessage.id));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleClear = () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setError(null);
    setToolCalls([]);
    setThinkingSteps([]);
    setStreamingText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatToolName = (toolName: string) => {
    return toolName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-[85vh] max-h-[85vh] flex flex-col p-0 overflow-hidden transition-all duration-200">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <DialogTitle className="text-zinc-900 dark:text-zinc-100">
                Nutrition Coach
              </DialogTitle>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Clear
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Messages Area - Fixed height with smooth scrolling */}
        <div
          className="flex-1 px-6 py-4 overflow-y-auto min-h-0 scroll-smooth overscroll-contain"
          style={{
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "thin",
          }}
        >
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
              <div className="p-4 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20">
                <Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Ask me anything about your nutrition
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md">
                  I have access to all your nutrition data. Try asking:
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {[
                    "What can I eat today?",
                    "How am I doing this week?",
                    "What's my protein goal?",
                    "Am I on track?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-3 py-1.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex transition-all duration-300 ease-in-out",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2.5 transition-all duration-200",
                      message.role === "user"
                        ? "bg-violet-500 text-white shadow-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:font-semibold prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-code:bg-zinc-200 dark:prose-code:bg-zinc-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs"
                        components={{
                          p: ({ children }: { children?: React.ReactNode }) => (
                            <p className="text-sm my-2">{children}</p>
                          ),
                          h1: ({
                            children,
                          }: {
                            children?: React.ReactNode;
                          }) => (
                            <h1 className="text-xl font-semibold mt-4 mb-2 text-zinc-900 dark:text-zinc-100">
                              {children}
                            </h1>
                          ),
                          h2: ({
                            children,
                          }: {
                            children?: React.ReactNode;
                          }) => (
                            <h2 className="text-lg font-semibold mt-4 mb-2 text-zinc-900 dark:text-zinc-100">
                              {children}
                            </h2>
                          ),
                          h3: ({
                            children,
                          }: {
                            children?: React.ReactNode;
                          }) => (
                            <h3 className="text-base font-semibold mt-4 mb-2 text-zinc-900 dark:text-zinc-100">
                              {children}
                            </h3>
                          ),
                          ul: ({
                            children,
                          }: {
                            children?: React.ReactNode;
                          }) => (
                            <ul className="list-disc list-inside my-2 space-y-1 ml-4">
                              {children}
                            </ul>
                          ),
                          ol: ({
                            children,
                          }: {
                            children?: React.ReactNode;
                          }) => (
                            <ol className="list-decimal list-inside my-2 space-y-1 ml-4">
                              {children}
                            </ol>
                          ),
                          li: ({
                            children,
                          }: {
                            children?: React.ReactNode;
                          }) => <li className="text-sm">{children}</li>,
                          strong: ({
                            children,
                          }: {
                            children?: React.ReactNode;
                          }) => (
                            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {children}
                            </strong>
                          ),
                          code: ({
                            children,
                          }: {
                            children?: React.ReactNode;
                          }) => (
                            <code className="bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-xs font-mono">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {typeof message.content === "string"
                          ? message.content
                          : String(message.content || "")}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Show thinking steps with nested tool calls */}
              {thinkingSteps.length > 0 && (
                <div className="space-y-3 pb-2">
                  {thinkingSteps.map((step) => {
                    // Find tool calls that belong to this thinking step (by timestamp)
                    const relatedTools = toolCalls.filter(
                      (tool) =>
                        tool.timestamp >= step.timestamp - 2000 &&
                        tool.timestamp <= step.timestamp + 10000
                    );

                    return (
                      <div
                        key={step.id}
                        className="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 overflow-hidden transition-all duration-300 ease-in-out"
                      >
                        <div className="flex items-start gap-2 p-3">
                          <Brain className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-amber-900 dark:text-amber-300 mb-1">
                              Thinking...
                            </p>
                            {step.content &&
                              step.content.trim() &&
                              step.content !== "[]" &&
                              step.content !== "{}" && (
                                <p className="text-xs text-amber-700 dark:text-amber-400 whitespace-pre-wrap break-words">
                                  {step.content}
                                </p>
                              )}
                          </div>
                        </div>

                        {/* Nested tool calls - more subtle */}
                        {relatedTools.length > 0 && (
                          <div className="ml-6 mr-3 mb-2 space-y-1.5 border-l-2 border-amber-200 dark:border-amber-800/50 pl-3">
                            {relatedTools.map((tool) => (
                              <div
                                key={tool.id}
                                className="flex items-center gap-1.5 py-1.5 px-2 rounded bg-amber-100/50 dark:bg-amber-900/5 border border-amber-200/50 dark:border-amber-800/30"
                              >
                                {tool.status === "completed" ? (
                                  <CheckCircle2 className="w-3 h-3 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                                ) : (
                                  <Loader2 className="w-3 h-3 text-amber-600 dark:text-amber-500 flex-shrink-0 animate-spin" />
                                )}
                                <p className="text-[10px] font-medium text-amber-800 dark:text-amber-400">
                                  {formatToolName(tool.toolName)}
                                </p>
                                {tool.status === "calling" && (
                                  <span className="text-[10px] text-amber-600 dark:text-amber-500">
                                    ...
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Show tool calls that don't belong to any thinking step */}
              {toolCalls.length > 0 && thinkingSteps.length === 0 && (
                <div className="space-y-1.5">
                  {toolCalls.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center gap-1.5 py-1.5 px-2 rounded bg-zinc-100/50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/50"
                    >
                      {tool.status === "completed" ? (
                        <CheckCircle2 className="w-3 h-3 text-zinc-600 dark:text-zinc-400 flex-shrink-0" />
                      ) : (
                        <Loader2 className="w-3 h-3 text-zinc-600 dark:text-zinc-400 flex-shrink-0 animate-spin" />
                      )}
                      <p className="text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                        {formatToolName(tool.toolName)}
                      </p>
                      {tool.status === "calling" && (
                        <span className="text-[10px] text-zinc-600 dark:text-zinc-400">
                          ...
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Show streaming text */}
              {streamingText && (
                <div className="flex justify-start transition-all duration-300 ease-in-out">
                  <div className="max-w-[80%] rounded-lg px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm transition-all duration-200">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:font-semibold prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-code:bg-zinc-200 dark:prose-code:bg-zinc-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs"
                      components={{
                        p: ({ children }: { children?: React.ReactNode }) => (
                          <p className="text-sm my-2">
                            {children}
                            <span className="inline-block w-2 h-4 bg-violet-500 animate-pulse ml-1" />
                          </p>
                        ),
                        h1: ({ children }: { children?: React.ReactNode }) => (
                          <h1 className="text-xl font-semibold mt-4 mb-2 text-zinc-900 dark:text-zinc-100">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }: { children?: React.ReactNode }) => (
                          <h2 className="text-lg font-semibold mt-4 mb-2 text-zinc-900 dark:text-zinc-100">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }: { children?: React.ReactNode }) => (
                          <h3 className="text-base font-semibold mt-4 mb-2 text-zinc-900 dark:text-zinc-100">
                            {children}
                          </h3>
                        ),
                        ul: ({ children }: { children?: React.ReactNode }) => (
                          <ul className="list-disc list-inside my-2 space-y-1 ml-4">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }: { children?: React.ReactNode }) => (
                          <ol className="list-decimal list-inside my-2 space-y-1 ml-4">
                            {children}
                          </ol>
                        ),
                        li: ({ children }: { children?: React.ReactNode }) => (
                          <li className="text-sm">{children}</li>
                        ),
                        strong: ({
                          children,
                        }: {
                          children?: React.ReactNode;
                        }) => (
                          <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {children}
                          </strong>
                        ),
                        code: ({
                          children,
                        }: {
                          children?: React.ReactNode;
                        }) => (
                          <code className="bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {typeof streamingText === "string"
                        ? streamingText
                        : String(streamingText || "")}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Loading indicator when no streaming text yet */}
              {isLoading &&
                !streamingText &&
                thinkingSteps.length === 0 &&
                toolCalls.length === 0 && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg px-4 py-2.5">
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-600 dark:text-zinc-400" />
                    </div>
                  </div>
                )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-6 py-3 bg-red-500/10 border-t border-red-500/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your nutrition..."
              disabled={isLoading}
              className="flex-1 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:border-violet-500 dark:focus:border-violet-500"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
