import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Runner, setDefaultOpenAIClient } from "@openai/agents";
import { nutritionAgent } from "@/lib/agents/nutrition-agent";
import { getOpenAIClient, NoApiKeyError, categorizeOpenAIError } from "@/lib/openai";
import type { AgentInputItem } from "@openai/agents";

// UserContext is defined in nutrition-tools.ts

// POST: Run the nutrition agent with streaming support
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get user's OpenAI API key (required for agent)
    let client;
    try {
      const clientResult = await getOpenAIClient(session.user.id);
      client = clientResult.client;
    } catch (error) {
      if (error instanceof NoApiKeyError) {
        return NextResponse.json(
          {
            error: "NO_API_KEY",
            message:
              "OpenAI API key is required for the nutrition agent. Please add your API key in Settings.",
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Set the user's client as default for this request
    setDefaultOpenAIClient(client);

    // Create Runner (will use the default client we just set)
    const runner = new Runner();

    // Build conversation history
    const inputItems: AgentInputItem[] = [];
    
    // Add history if provided (for conversation continuity)
    if (Array.isArray(history)) {
      // Ensure history items are in the correct format for AgentInputItem
      for (const item of history) {
        if (item && typeof item === "object" && "role" in item && "content" in item) {
          const role = item.role;
          const content = item.content;
          
          // For user messages, content should be a string
          if (role === "user") {
            const contentStr = typeof content === "string" ? content : String(content || "");
            inputItems.push({
              role: "user",
              content: contentStr,
            } as AgentInputItem);
          }
          // For assistant messages, we'll skip them in history to avoid format issues
          // The SDK will handle assistant responses internally
        }
      }
    }
    
    // Add current message
    inputItems.push({
      role: "user",
      content: message.trim(),
    } as AgentInputItem);

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const sendEvent = (type: string, data: Record<string, unknown>) => {
          const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          // Run the agent with streaming enabled
          const result = await runner.run(nutritionAgent, inputItems, {
            context: {
              userId: session.user.id,
            },
            maxTurns: 10,
            stream: true, // Enable streaming
          });

          // Track what we've sent to avoid duplicates
          const sentItems = new Set<string>();
          let lastHistoryLength = 0;
          let accumulatedText = "";

          // Process events as they arrive - this is the key: iterate immediately
          for await (const event of result) {
            // Log for debugging
            console.log("[STREAM EVENT]", event.type, JSON.stringify(event).substring(0, 200));

            try {
              // Handle run_item_stream_event - these fire when items are added
              if (event.type === "run_item_stream_event") {
                // Access the runItem from the event - structure is { item: { type, rawItem: { providerData: {...} } } }
                const eventWithItem = event as unknown as { 
                  item?: { 
                    type?: string;
                    name?: string;
                    rawItem?: {
                      providerData?: {
                        type?: string;
                        content?: unknown;
                        summary?: string;
                        name?: string;
                        arguments?: unknown;
                      };
                      type?: string;
                      name?: string;
                      content?: unknown;
                      output?: unknown;
                      arguments?: unknown;
                    };
                    [key: string]: unknown;
                  };
                };
                
                const item = eventWithItem.item;
                if (!item) continue;

                // Extract actual data from rawItem.providerData structure
                const rawItem = item.rawItem as {
                  providerData?: {
                    type?: string;
                    content?: unknown;
                    summary?: string;
                    name?: string;
                    arguments?: unknown;
                  };
                  type?: string;
                  name?: string;
                  content?: unknown;
                  output?: unknown;
                  result?: unknown;
                  arguments?: unknown;
                  summary?: string;
                } | undefined;
                const providerData = rawItem?.providerData || rawItem;
                
                // Create unique ID for this item
                const itemId = `${item.type}-${providerData?.name || item.name || ""}-${Date.now()}`;
                
                if (sentItems.has(itemId)) {
                  continue; // Already sent
                }
                sentItems.add(itemId);

                // Handle reasoning items - extract content from providerData
                if (item.type === "reasoning_item" || providerData?.type === "reasoning") {
                  // Extract reasoning content - could be in summary, content, or providerData
                  const reasoningContent = 
                    rawItem?.summary || 
                    providerData?.summary || 
                    providerData?.content ||
                    rawItem?.content ||
                    "Analyzing your request...";
                  
                  const contentStr = typeof reasoningContent === "string" 
                    ? reasoningContent 
                    : JSON.stringify(reasoningContent);
                  
                  // Only send if we have actual content (not empty)
                  if (contentStr && contentStr.trim() && contentStr !== "[]" && contentStr !== "{}") {
                    sendEvent("thinking", {
                      content: contentStr,
                    });
                  }
                }

                // Handle tool calls - send as part of thinking flow
                if (item.type === "tool_call_item" || providerData?.type === "function_call") {
                  const toolName = providerData?.name || item.name;
                  if (toolName) {
                    sendEvent("tool_call", {
                      toolName: String(toolName),
                      arguments: providerData?.arguments || item.arguments ? JSON.stringify(providerData?.arguments || item.arguments) : undefined,
                      status: "calling",
                    });
                  }
                }

                // Handle tool results
                if (item.type === "tool_call_output_item" || rawItem?.type === "function_call_result") {
                  const toolName = rawItem?.name || item.name;
                  if (toolName) {
                    const rawItemWithOutput = rawItem as { output?: unknown; result?: unknown };
                    const output = rawItemWithOutput?.output || rawItemWithOutput?.result;
                    const outputStr = typeof output === "string" 
                      ? output.substring(0, 150) + (output.length > 150 ? "..." : "")
                      : "Completed";
                    
                    sendEvent("tool_result", {
                      toolName: String(toolName),
                      output: outputStr,
                      status: "completed",
                    });
                  }
                }

                // Handle assistant messages
                const itemWithRole = item as { role?: string; content?: unknown };
                if (item.type === "message" && itemWithRole.role === "assistant") {
                  const content = itemWithRole.content || providerData?.content;
                  let text = "";
                  
                  if (typeof content === "string") {
                    text = content;
                  } else if (Array.isArray(content)) {
                    text = content
                      .filter((c: { type?: string; text?: string }) => c.type === "text")
                      .map((c: { type?: string; text?: string }) => c.text || "")
                      .join("\n");
                  }

                  if (text && text !== accumulatedText) {
                    accumulatedText = text;
                    sendEvent("message_chunk", {
                      content: text,
                      isComplete: false,
                    });
                  }
                }
              }

              // Handle raw model stream events for token-by-token streaming
              if (event.type === "raw_model_stream_event") {
                const rawEvent = event as unknown as { 
                  event?: { 
                    type?: string; 
                    delta?: string;
                    text?: string;
                  };
                };
                const modelEvent = rawEvent.event;
                
                // Handle text deltas
                if (modelEvent?.type === "response.text.delta" && modelEvent.delta) {
                  accumulatedText += modelEvent.delta;
                  sendEvent("text_delta", {
                    delta: modelEvent.delta,
                  });
                }
                
                // Handle text completion
                if (modelEvent?.type === "response.text.done" && modelEvent.text) {
                  accumulatedText = modelEvent.text;
                  sendEvent("message_chunk", {
                    content: modelEvent.text,
                    isComplete: false,
                  });
                }
              }

              // Also check if history has grown (fallback for items we might have missed)
              if (result.history && result.history.length > lastHistoryLength) {
                const newItems = result.history.slice(lastHistoryLength);
                lastHistoryLength = result.history.length;

                for (const item of newItems) {
                  const historyItem = item as { 
                    type?: string; 
                    name?: string;
                    role?: string;
                    content?: unknown;
                    output?: unknown;
                    arguments?: unknown;
                    [key: string]: unknown;
                  };
                  
                  const itemId = `${historyItem.type}-${historyItem.name || historyItem.role || ""}-${JSON.stringify(historyItem.content || historyItem.arguments || "").substring(0, 50)}`;
                  
                  if (sentItems.has(itemId)) continue;
                  sentItems.add(itemId);

                  // Process new history items
                  if ((historyItem.type === "function_call" || historyItem.type === "hosted_tool_call") && historyItem.name) {
                    sendEvent("tool_call", {
                      toolName: String(historyItem.name),
                      arguments: historyItem.arguments ? JSON.stringify(historyItem.arguments) : undefined,
                      status: "calling",
                    });
                  }

                  if (historyItem.type === "function_call_result" && historyItem.name) {
                    const output = historyItem.output;
                    const outputStr = typeof output === "string" 
                      ? output.substring(0, 200) + (output.length > 200 ? "..." : "")
                      : "Tool executed successfully";
                    
                    sendEvent("tool_result", {
                      toolName: String(historyItem.name),
                      output: outputStr,
                      status: "completed",
                    });
                  }

                  if (historyItem.type === "reasoning" && historyItem.content !== undefined) {
                    const content = historyItem.content;
                    const contentStr = typeof content === "string" 
                      ? content 
                      : JSON.stringify(content);
                    
                    sendEvent("thinking", {
                      content: contentStr,
                    });
                  }
                }
              }
            } catch (e) {
              console.error("[ERROR processing event]", e);
            }
          }

          // Extract final output
          let finalOutput = result.finalOutput;
          if (typeof finalOutput !== "string") {
            if (finalOutput !== null && finalOutput !== undefined) {
              finalOutput = JSON.stringify(finalOutput, null, 2);
            } else {
              finalOutput = accumulatedText || "I couldn't generate a response. Please try again.";
            }
          } else if (!accumulatedText) {
            accumulatedText = finalOutput;
          }

          // Send final message - ensure content is always a string
          const messageContent = finalOutput || accumulatedText || "I couldn't generate a response. Please try again.";
          sendEvent("message_complete", {
            content: typeof messageContent === "string" ? messageContent : String(messageContent),
            history: result.history,
          });

          // Send done event
          sendEvent("done", {});
        } catch (error) {
          console.error("Streaming error:", error);
          
          if (error instanceof NoApiKeyError) {
            sendEvent("error", {
              code: "NO_API_KEY",
              message: "OpenAI API key is required. Please add your API key in Settings.",
            });
          } else {
            const categorized = categorizeOpenAIError(error);
            sendEvent("error", {
              code: categorized.code,
              message: categorized.message,
            });
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error("Nutrition agent error:", error);

    // Handle OpenAI-specific errors
    if (error instanceof NoApiKeyError) {
      return NextResponse.json(
        {
          error: "NO_API_KEY",
          message:
            "OpenAI API key is required. Please add your API key in Settings.",
        },
        { status: 400 }
      );
    }

    const categorized = categorizeOpenAIError(error);
    return NextResponse.json(
      {
        error: categorized.code,
        message: categorized.message,
      },
      { status: categorized.status || 500 }
    );
  }
}
