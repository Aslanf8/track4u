# OpenAI Agents SDK (JavaScript/TypeScript) - Complete Reference

> A lightweight, powerful framework for building multi-agent workflows and voice agents in JavaScript and TypeScript.

**Repository:** [github.com/openai/openai-agents-js](https://github.com/openai/openai-agents-js)  
**Documentation:** [openai.github.io/openai-agents-js](https://openai.github.io/openai-agents-js/)  
**Current Version:** v0.3.7 (December 2025)  
**License:** MIT

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Installation and Setup](#2-installation-and-setup)
3. [Quickstart](#3-quickstart)
4. [Agent Configuration](#4-agent-configuration)
5. [Running Agents](#5-running-agents)
6. [Results](#6-results)
7. [Tools System](#7-tools-system)
8. [Multi-Agent Orchestration](#8-multi-agent-orchestration)
9. [Handoffs](#9-handoffs)
10. [Context Management](#10-context-management)
11. [Sessions](#11-sessions)
12. [Models](#12-models)
13. [Guardrails](#13-guardrails)
14. [Streaming](#14-streaming)
15. [Human-in-the-Loop](#15-human-in-the-loop)
16. [Model Context Protocol (MCP)](#16-model-context-protocol-mcp)
17. [Tracing](#17-tracing)
18. [Error Handling](#18-error-handling)
19. [Configuration](#19-configuration)
20. [Voice/Realtime Agents](#20-voicerealtime-agents)

---

## 1. Introduction

The OpenAI Agents SDK for TypeScript enables you to build agentic AI applications with a lightweight, easy-to-use package with minimal abstractions. It's a production-ready upgrade of the experimental [Swarm](https://github.com/openai/swarm) framework.

### Design Principles

1. **Enough features to be worth using, but few enough primitives to make it quick to learn**
2. **Works great out of the box, but you can customize exactly what happens**

### Core Primitives

| Primitive      | Description                                                      |
| -------------- | ---------------------------------------------------------------- |
| **Agents**     | LLMs equipped with instructions, tools, guardrails, and handoffs |
| **Handoffs**   | Specialized tool calls for transferring control between agents   |
| **Guardrails** | Configurable safety checks for input and output validation       |
| **Tracing**    | Built-in tracking of agent runs for debugging and optimization   |

### Key Features

- **Agent Loop**: Built-in loop that handles tool calls, sends results to the LLM, and loops until completion
- **TypeScript-First**: Use built-in language features to orchestrate agents rather than learning new abstractions
- **Handoffs**: Powerful coordination and delegation between multiple agents
- **Guardrails**: Run input validations in parallel, breaking early if checks fail
- **Function Tools**: Turn any TypeScript function into a tool with automatic schema generation and Zod validation
- **Tracing**: Built-in tracing for visualization, debugging, monitoring, and fine-tuning
- **Realtime Agents**: Build voice agents with interruption detection, context management, and guardrails
- **MCP Support**: Integrate with Model Context Protocol servers for external tools
- **Broader Model Support**: Use non-OpenAI models through the Vercel AI SDK adapter

---

## 2. Installation and Setup

### Installation

```bash
npm install @openai/agents zod@3
```

For voice/realtime agents:

```bash
npm install @openai/agents-realtime
```

### Supported Environments

| Environment        | Support Level                           |
| ------------------ | --------------------------------------- |
| Node.js 22+        | Full support                            |
| Deno               | Full support                            |
| Bun                | Full support                            |
| Cloudflare Workers | Experimental (requires `nodejs_compat`) |

### Environment Variables

```bash
# Required: OpenAI API key
export OPENAI_API_KEY=sk-...

# Optional: Set default model for all agents
export OPENAI_DEFAULT_MODEL=gpt-5

# Optional: Disable tracing
export OPENAI_AGENTS_DISABLE_TRACING=1

# Optional: Disable sensitive data in logs
export OPENAI_AGENTS_DONT_LOG_MODEL_DATA=1
export OPENAI_AGENTS_DONT_LOG_TOOL_DATA=1

# Optional: Enable debug logging
export DEBUG=openai-agents*
```

### Programmatic Configuration

```typescript
import {
  setDefaultOpenAIKey,
  setDefaultOpenAIClient,
  setOpenAIAPI,
  setTracingExportApiKey,
  setTracingDisabled,
} from "@openai/agents";
import { OpenAI } from "openai";

// Set API key programmatically
setDefaultOpenAIKey("sk-...");

// Use custom OpenAI client
const customClient = new OpenAI({ baseURL: "...", apiKey: "..." });
setDefaultOpenAIClient(customClient);

// Switch between APIs ('responses' is default, 'chat_completions' also available)
setOpenAIAPI("responses");

// Configure tracing
setTracingExportApiKey("sk-...");
setTracingDisabled(false);
```

---

## 3. Quickstart

### Hello World

```typescript
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

const result = await run(
  agent,
  "Write a haiku about recursion in programming."
);

console.log(result.finalOutput);
// Code within the code,
// Functions calling themselves,
// Infinite loop's dance.
```

### Agent with Tools

```typescript
import { Agent, tool, run } from "@openai/agents";
import { z } from "zod";

const getWeather = tool({
  name: "get_weather",
  description: "Get the weather for a given city",
  parameters: z.object({ city: z.string() }),
  execute: async ({ city }) => {
    return `The weather in ${city} is sunny.`;
  },
});

const agent = new Agent({
  name: "Weather Bot",
  instructions: "You are a helpful weather assistant.",
  tools: [getWeather],
});

const result = await run(agent, "What is the weather in Tokyo?");
console.log(result.finalOutput);
```

### Multi-Agent with Handoffs

```typescript
import { Agent, run } from "@openai/agents";

const historyTutorAgent = new Agent({
  name: "History Tutor",
  instructions: "You provide assistance with historical queries.",
});

const mathTutorAgent = new Agent({
  name: "Math Tutor",
  instructions: "You provide help with math problems.",
});

// Use Agent.create for type-safe handoff output types
const triageAgent = Agent.create({
  name: "Triage Agent",
  instructions: "Determine which agent to use based on the user's question",
  handoffs: [historyTutorAgent, mathTutorAgent],
});

const result = await run(triageAgent, "What is the capital of France?");
console.log(result.finalOutput);
console.log(result.lastAgent.name); // Which agent handled the request
```

---

## 4. Agent Configuration

### Constructor Properties

| Property           | Required | Type                      | Description                                 |
| ------------------ | -------- | ------------------------- | ------------------------------------------- |
| `name`             | Yes      | `string`                  | Human-readable identifier                   |
| `instructions`     | Yes      | `string \| Function`      | System prompt (static or dynamic)           |
| `model`            | No       | `string \| Model`         | Model name or custom Model implementation   |
| `modelSettings`    | No       | `ModelSettings`           | Tuning parameters (temperature, topP, etc.) |
| `tools`            | No       | `Tool[]`                  | Array of Tool instances the model can call  |
| `handoffs`         | No       | `(Agent \| Handoff)[]`    | Agents or handoff objects for delegation    |
| `outputType`       | No       | `ZodSchema \| JSONSchema` | Schema for structured output                |
| `inputGuardrails`  | No       | `InputGuardrail[]`        | Input validation guardrails                 |
| `outputGuardrails` | No       | `OutputGuardrail[]`       | Output validation guardrails                |
| `mcpServers`       | No       | `MCPServer[]`             | MCP servers providing tools                 |

### Basic Agent

```typescript
import { Agent } from "@openai/agents";

const agent = new Agent({
  name: "Haiku Agent",
  instructions: "Always respond in haiku form.",
  model: "gpt-4.1", // Optional - falls back to default model
});
```

### Agent with Context (Generic Types)

Agents are generic on their context type: `Agent<TContext, TOutput>`. Context is a dependency-injection object passed to every tool, guardrail, and handoff.

```typescript
import { Agent, run } from "@openai/agents";

interface UserContext {
  uid: string;
  isProUser: boolean;
  fetchPurchases(): Promise<Purchase[]>;
}

const agent = new Agent<UserContext>({
  name: "Personal Shopper",
  instructions: "Recommend products the user will love.",
});

const result = await run(agent, "Find me running shoes", {
  context: {
    uid: "abc",
    isProUser: true,
    fetchPurchases: async () => [],
  },
});
```

### Structured Output with Zod

```typescript
import { Agent } from "@openai/agents";
import { z } from "zod";

const CalendarEvent = z.object({
  name: z.string(),
  date: z.string(),
  participants: z.array(z.string()),
});

const extractor = new Agent({
  name: "Calendar Extractor",
  instructions: "Extract calendar events from the supplied text.",
  outputType: CalendarEvent,
});
```

### Dynamic Instructions

Instructions can be a function that receives `RunContext` and returns a string:

```typescript
import { Agent, RunContext } from "@openai/agents";

interface UserContext {
  name: string;
}

function buildInstructions(runContext: RunContext<UserContext>) {
  return `The user's name is ${runContext.context.name}. Be extra friendly!`;
}

const agent = new Agent<UserContext>({
  name: "Personalized Helper",
  instructions: buildInstructions,
});
```

### Lifecycle Hooks

```typescript
import { Agent } from "@openai/agents";

const agent = new Agent({
  name: "Verbose Agent",
  instructions: "Explain things thoroughly.",
});

agent.on("agent_start", (ctx, agent) => {
  console.log(`[${agent.name}] started`);
});

agent.on("agent_end", (ctx, output) => {
  console.log(`[agent] produced:`, output);
});
```

### Cloning Agents

```typescript
const pirateAgent = new Agent({
  name: "Pirate",
  instructions: 'Respond like a pirate – lots of "Arrr!"',
  model: "gpt-4.1-mini",
});

const robotAgent = pirateAgent.clone({
  name: "Robot",
  instructions: "Respond like a robot – be precise and factual.",
});
```

### Forcing Tool Use

```typescript
const agent = new Agent({
  name: "Strict Tool User",
  instructions: "Always answer using the calculator tool.",
  tools: [calculatorTool],
  modelSettings: {
    toolChoice: "required", // 'auto' | 'required' | 'none' | specific tool name
  },
});
```

### Preventing Infinite Loops

```typescript
const agent = new Agent({
  // ...
  toolUseBehavior: "stop_on_first_tool", // Stop after first tool result
  // Or: { stopAtToolNames: ['my_tool'] }
  // Or: (context, toolResults) => boolean
});
```

---

## 5. Running Agents

### Basic Execution

```typescript
import { Agent, run, Runner } from "@openai/agents";

const agent = new Agent({
  name: "Assistant",
  instructions: "You are a helpful assistant",
});

// Option 1: Use run() utility (singleton Runner)
const result = await run(agent, "Hello!");

// Option 2: Create custom Runner instance
const runner = new Runner();
const result2 = await runner.run(agent, "Hello!");
```

### The Agent Loop

When you call `run()`, the SDK executes a loop:

```
┌─────────────────────────────────────────────────────────┐
│                    Agent Loop                           │
├─────────────────────────────────────────────────────────┤
│ 1. Call current agent's model with input                │
│ 2. Inspect LLM response:                                │
│    ├─ Final output → Return result                      │
│    ├─ Handoff → Switch agent, keep history, goto 1      │
│    └─ Tool calls → Execute tools, append results, goto 1│
│ 3. Throw MaxTurnsExceededError if maxTurns reached      │
└─────────────────────────────────────────────────────────┘
```

**Final Output Rule:** The LLM output is "final" when it produces text with the desired type and there are no tool calls.

### Run Arguments

| Option     | Default | Description                                                |
| ---------- | ------- | ---------------------------------------------------------- |
| `stream`   | `false` | Return `StreamedRunResult` and emit events                 |
| `context`  | –       | Context object forwarded to tools/guardrails/handoffs      |
| `maxTurns` | `10`    | Safety limit - throws `MaxTurnsExceededError` when reached |
| `signal`   | –       | `AbortSignal` for cancellation                             |

### RunConfig Options

When creating a `Runner` instance:

| Field                       | Type                  | Purpose                                   |
| --------------------------- | --------------------- | ----------------------------------------- |
| `model`                     | `string \| Model`     | Force specific model for all agents       |
| `modelProvider`             | `ModelProvider`       | Resolves model names (defaults to OpenAI) |
| `modelSettings`             | `ModelSettings`       | Global tuning parameters                  |
| `handoffInputFilter`        | `HandoffInputFilter`  | Mutates input items during handoffs       |
| `inputGuardrails`           | `InputGuardrail[]`    | Guardrails for initial user input         |
| `outputGuardrails`          | `OutputGuardrail[]`   | Guardrails for final output               |
| `tracingDisabled`           | `boolean`             | Disable OpenAI Tracing                    |
| `traceIncludeSensitiveData` | `boolean`             | Exclude LLM/tool inputs from traces       |
| `workflowName`              | `string`              | Appears in Traces dashboard               |
| `traceId` / `groupId`       | `string`              | Manually specify trace or group ID        |
| `traceMetadata`             | `Record<string, any>` | Metadata for every span                   |

### Conversation Management

#### Local History Management

```typescript
import { Agent, run } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";

let thread: AgentInputItem[] = [];

const agent = new Agent({ name: "Assistant" });

async function userSays(text: string) {
  const result = await run(
    agent,
    thread.concat({ role: "user", content: text })
  );
  thread = result.history; // Carry over history + new items
  return result.finalOutput;
}

await userSays("What city is the Golden Gate Bridge in?"); // "San Francisco"
await userSays("What state is it in?"); // "California"
```

#### Server-Managed Conversations (conversationId)

```typescript
import { Agent, run } from "@openai/agents";
import { OpenAI } from "openai";

const agent = new Agent({
  name: "Assistant",
  instructions: "Reply very concisely.",
});

const client = new OpenAI();
const { id: conversationId } = await client.conversations.create({});

const first = await run(agent, "What city is the Golden Gate Bridge in?", {
  conversationId,
});
console.log(first.finalOutput); // "San Francisco"

const second = await run(agent, "What state is it in?", { conversationId });
console.log(second.finalOutput); // "California"
```

#### Chaining with previousResponseId

```typescript
const first = await run(agent, "What city is the Golden Gate Bridge in?");
console.log(first.finalOutput); // "San Francisco"

const previousResponseId = first.lastResponseId;
const second = await run(agent, "What state is it in?", { previousResponseId });
console.log(second.finalOutput); // "California"
```

---

## 6. Results

### RunResult vs StreamedRunResult

- **`RunResult`**: Returned when `stream: false` (default)
- **`StreamedRunResult`**: Returned when `stream: true`

### Key Properties

| Property                 | Description                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| `finalOutput`            | Final output of the last agent (string, parsed object, or undefined) |
| `lastAgent`              | The agent that produced the final output                             |
| `history`                | Full conversation history (input + output)                           |
| `output`                 | Only the output items from the run                                   |
| `newItems`               | New items generated during this run                                  |
| `state`                  | Serializable run state for resumption                                |
| `interruptions`          | Tool approval items requiring human intervention                     |
| `rawResponses`           | Raw LLM responses                                                    |
| `lastResponseId`         | ID of the last response                                              |
| `inputGuardrailResults`  | Results from input guardrails                                        |
| `outputGuardrailResults` | Results from output guardrails                                       |
| `input`                  | Original input provided                                              |

### Final Output Type Inference

Use `Agent.create()` for type-safe handoff output types:

```typescript
import { Agent, run } from "@openai/agents";
import { z } from "zod";

const refundAgent = new Agent({
  name: "Refund Agent",
  outputType: z.object({ refundApproved: z.boolean() }),
});

const orderAgent = new Agent({
  name: "Order Agent",
  outputType: z.object({ orderId: z.string() }),
});

const triageAgent = Agent.create({
  name: "Triage Agent",
  handoffs: [refundAgent, orderAgent],
});

const result = await run(triageAgent, "I need a refund");
// result.finalOutput type: { refundApproved: boolean } | { orderId: string } | string | undefined
```

### RunItem Types

| Item Type               | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `RunMessageOutputItem`  | Message from the LLM                             |
| `RunHandoffCallItem`    | LLM called the handoff tool                      |
| `RunHandoffOutputItem`  | Handoff occurred (includes source/target agents) |
| `RunToolCallItem`       | LLM invoked a tool                               |
| `RunToolCallOutputItem` | Tool was executed (includes tool output)         |
| `RunReasoningItem`      | Reasoning item from the LLM                      |
| `RunToolApprovalItem`   | LLM requested approval for a tool call           |

---

## 7. Tools System

The SDK supports four categories of tools:

### 7.1 Hosted Tools

Tools that run alongside the model on OpenAI servers:

| Tool             | Type String          | Purpose                              |
| ---------------- | -------------------- | ------------------------------------ |
| Web Search       | `'web_search'`       | Internet search                      |
| File Search      | `'file_search'`      | Query vector stores hosted on OpenAI |
| Computer Use     | `'computer'`         | Automate GUI interactions            |
| Shell            | `'shell'`            | Run shell commands on the host       |
| Apply Patch      | `'apply_patch'`      | Apply V4A diffs to local files       |
| Code Interpreter | `'code_interpreter'` | Run code in a sandboxed environment  |
| Image Generation | `'image_generation'` | Generate images based on text        |

```typescript
import { Agent, webSearchTool, fileSearchTool } from "@openai/agents";

const agent = new Agent({
  name: "Travel Assistant",
  tools: [webSearchTool(), fileSearchTool("VS_ID")],
});
```

### 7.2 Function Tools

Turn any function into a tool with `tool()`:

```typescript
import { tool } from "@openai/agents";
import { z } from "zod";

const getWeatherTool = tool({
  name: "get_weather",
  description: "Get the weather for a given city",
  parameters: z.object({ city: z.string() }),
  async execute({ city }, runContext) {
    return `The weather in ${city} is sunny.`;
  },
});
```

#### Function Tool Options

| Field           | Required | Description                                                 |
| --------------- | -------- | ----------------------------------------------------------- |
| `name`          | No       | Defaults to function name                                   |
| `description`   | Yes      | Human-readable description for the LLM                      |
| `parameters`    | Yes      | Zod schema or raw JSON schema                               |
| `strict`        | No       | When `true` (default), returns error if args don't validate |
| `execute`       | Yes      | `(args, context) => string \| Promise<string>`              |
| `errorFunction` | No       | Custom handler `(context, error) => string`                 |

#### Non-Strict JSON Schema Tools

```typescript
const looseTool = tool({
  description: "Echo input; be forgiving about typos",
  strict: false,
  parameters: {
    type: "object",
    properties: { text: { type: "string" } },
    required: ["text"],
    additionalProperties: true,
  },
  execute: async (input) => {
    if (typeof input !== "object" || !("text" in input)) {
      return "Invalid input. Please try again";
    }
    return input.text;
  },
});
```

### 7.3 Agents as Tools

Expose an agent as a callable tool:

```typescript
import { Agent } from "@openai/agents";

const summarizer = new Agent({
  name: "Summarizer",
  instructions: "Generate a concise summary of the supplied text.",
});

const summarizerTool = summarizer.asTool({
  toolName: "summarize_text",
  toolDescription: "Generate a concise summary of the supplied text.",
});

const mainAgent = new Agent({
  name: "Research Assistant",
  tools: [summarizerTool],
});
```

#### Streaming Events from Agent Tools

```typescript
const billingTool = billingAgent.asTool({
  toolName: "billing_agent",
  toolDescription: "Handles customer billing questions.",
  // Catch-all handler
  onStream: (event) => {
    console.log(`[onStream] ${event.event.type}`, event);
  },
});

// Or use selective event handlers
billingTool.on("run_item_stream_event", (event) => {
  console.log("[run_item_stream_event]", event);
});
billingTool.on("raw_model_stream_event", (event) => {
  console.log("[raw_model_stream_event]", event);
});
```

### 7.4 MCP Servers

Connect to Model Context Protocol servers:

```typescript
import { Agent, MCPServerStdio } from "@openai/agents";

const server = new MCPServerStdio({
  fullCommand: "npx -y @modelcontextprotocol/server-filesystem ./sample_files",
});

await server.connect();

const agent = new Agent({
  name: "Assistant",
  mcpServers: [server],
});
```

---

## 8. Multi-Agent Orchestration

### LLM-Driven Orchestration

Best for open-ended tasks where you want the LLM to plan and decide:

- Invest in good prompts
- Monitor and iterate
- Allow introspection and self-improvement
- Use specialized agents for specific tasks
- Invest in evaluations

### Code-Driven Orchestration

Best for deterministic, predictable workflows:

- Use structured outputs to inspect and branch
- Chain agents by transforming outputs
- Run evaluation loops
- Run agents in parallel with `Promise.all`

### Manager Pattern (Agents as Tools)

The manager owns the conversation and invokes specialized agents:

```typescript
const bookingAgent = new Agent({
  name: "Booking Expert",
  instructions: "Answer booking questions and modify reservations.",
});

const refundAgent = new Agent({
  name: "Refund Expert",
  instructions: "Help customers process refunds and credits.",
});

const customerFacingAgent = new Agent({
  name: "Customer-facing Agent",
  instructions: "Talk to the user directly. Call tools when needed.",
  tools: [
    bookingAgent.asTool({
      toolName: "booking_expert",
      toolDescription: "Handles booking questions and requests.",
    }),
    refundAgent.asTool({
      toolName: "refund_expert",
      toolDescription: "Handles refund questions and requests.",
    }),
  ],
});
```

### Handoffs Pattern

Agents delegate entire conversations to specialists:

```typescript
const bookingAgent = new Agent({
  name: "Booking Agent",
  instructions: "Help users with booking requests.",
});

const refundAgent = new Agent({
  name: "Refund Agent",
  instructions: "Process refund requests politely and efficiently.",
});

const triageAgent = Agent.create({
  name: "Triage Agent",
  instructions: `Help the user with their questions.
    If the user asks about booking, hand off to the booking agent.
    If the user asks about refunds, hand off to the refund agent.`,
  handoffs: [bookingAgent, refundAgent],
});
```

---

## 9. Handoffs

Handoffs let an agent delegate part of a conversation to another agent. They're represented as tools to the LLM (e.g., `transfer_to_refund_agent`).

### Creating Handoffs

```typescript
import { Agent, handoff } from "@openai/agents";

const billingAgent = new Agent({ name: "Billing Agent" });
const refundAgent = new Agent({ name: "Refund Agent" });

const triageAgent = Agent.create({
  name: "Triage Agent",
  handoffs: [billingAgent, handoff(refundAgent)],
});
```

### Customizing Handoffs

```typescript
import { z } from "zod";
import { Agent, handoff, RunContext } from "@openai/agents";

const FooSchema = z.object({ foo: z.string() });

function onHandoff(ctx: RunContext, input?: { foo: string }) {
  console.log("Handoff called with:", input?.foo);
}

const handoffObj = handoff(agent, {
  onHandoff,
  inputType: FooSchema,
  toolNameOverride: "custom_handoff_tool",
  toolDescriptionOverride: "Custom description",
  inputFilter: removeAllTools, // Filter history passed to next agent
});
```

### Handoff Options

| Option                    | Description                                 |
| ------------------------- | ------------------------------------------- |
| `agent`                   | The agent to hand off to                    |
| `toolNameOverride`        | Override default `transfer_to_<agent_name>` |
| `toolDescriptionOverride` | Override default tool description           |
| `onHandoff`               | Callback when handoff occurs                |
| `inputType`               | Expected input schema for the handoff       |
| `inputFilter`             | Filter history passed to the next agent     |

### Handoff Inputs

```typescript
import { z } from "zod";
import { Agent, handoff, RunContext } from "@openai/agents";

const EscalationData = z.object({ reason: z.string() });

async function onHandoff(
  ctx: RunContext,
  input: z.infer<typeof EscalationData> | undefined
) {
  console.log(`Escalation called with reason: ${input?.reason}`);
}

const handoffObj = handoff(escalationAgent, {
  onHandoff,
  inputType: EscalationData,
});
```

### Input Filters

```typescript
import { Agent, handoff } from "@openai/agents";
import { removeAllTools } from "@openai/agents-core/extensions";

const handoffObj = handoff(agent, {
  inputFilter: removeAllTools,
});
```

### Recommended Prompts

```typescript
import { Agent } from "@openai/agents";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";

const billingAgent = new Agent({
  name: "Billing Agent",
  instructions: `${RECOMMENDED_PROMPT_PREFIX}
Fill in the rest of your prompt here.`,
});
```

---

## 10. Context Management

### Local Context (RunContext)

Local context is your dependency-injection object passed to tools, callbacks, and hooks:

```typescript
import { Agent, run, RunContext, tool } from "@openai/agents";
import { z } from "zod";

interface UserInfo {
  name: string;
  uid: number;
}

const fetchUserAge = tool({
  name: "fetch_user_age",
  description: "Return the age of the current user",
  parameters: z.object({}),
  execute: async (_args, runContext?: RunContext<UserInfo>) => {
    return `User ${runContext?.context.name} is 47 years old`;
  },
});

const agent = new Agent<UserInfo>({
  name: "Assistant",
  tools: [fetchUserAge],
});

const result = await run(agent, "What is the age of the user?", {
  context: { name: "John", uid: 123 },
});
```

**Use local context for:**

- Data about the run (user name, IDs)
- Dependencies (loggers, data fetchers)
- Helper functions

> **Note:** Context is NOT sent to the LLM. It's purely local.

### Agent/LLM Context

To make information available to the LLM:

1. **Add to Agent instructions** (static string or dynamic function)
2. **Include in input** when calling `run()`
3. **Expose via function tools** for on-demand fetching
4. **Use retrieval or web search tools** for grounding

---

## 11. Sessions

Sessions provide a persistent memory layer for conversations.

### Session Interface

```typescript
interface Session {
  getSessionId(): Promise<string>;
  getItems(limit?: number): Promise<AgentInputItem[]>;
  addItems(items: AgentInputItem[]): Promise<void>;
  popItem(): Promise<AgentInputItem | undefined>;
  clearSession(): Promise<void>;
}
```

### OpenAI Conversations Session

```typescript
import { Agent, OpenAIConversationsSession, run } from "@openai/agents";

const agent = new Agent({
  name: "TourGuide",
  instructions: "Answer with compact travel facts.",
});

const session = new OpenAIConversationsSession();

const firstTurn = await run(agent, "What city is the Golden Gate Bridge in?", {
  session,
});
console.log(firstTurn.finalOutput); // "San Francisco"

const secondTurn = await run(agent, "What state is it in?", { session });
console.log(secondTurn.finalOutput); // "California"
```

### Memory Session (Local Development)

```typescript
import { Agent, MemorySession, run } from "@openai/agents";

const session = new MemorySession();

const result = await run(agent, "Hello!", { session });
```

### Session Operations

```typescript
const history = await session.getItems();
console.log(`Loaded ${history.length} prior items.`);

await session.addItems([
  {
    type: "message",
    role: "user",
    content: [{ type: "input_text", text: "Let's continue later." }],
  },
]);

const undone = await session.popItem(); // Remove last entry

await session.clearSession(); // Clear all history
```

### Custom Session Implementation

```typescript
import type { AgentInputItem, Session } from "@openai/agents-core";

class CustomSession implements Session {
  private items: AgentInputItem[] = [];
  private sessionId: string;

  constructor(sessionId?: string) {
    this.sessionId = sessionId ?? crypto.randomUUID();
  }

  async getSessionId() {
    return this.sessionId;
  }
  async getItems(limit?: number) {
    /* ... */
  }
  async addItems(items: AgentInputItem[]) {
    /* ... */
  }
  async popItem() {
    /* ... */
  }
  async clearSession() {
    this.items = [];
  }
}
```

### Session Input Callback

Control how history and new items merge:

```typescript
await run(agent, todoUpdate, {
  session,
  sessionInputCallback: (history, newItems) => {
    const recentHistory = history.slice(-8); // Keep only last 8 items
    return [...recentHistory, ...newItems];
  },
});
```

### Auto-Compaction Session

```typescript
import {
  Agent,
  MemorySession,
  OpenAIResponsesCompactionSession,
  run,
} from "@openai/agents";

const session = new OpenAIResponsesCompactionSession({
  underlyingSession: new MemorySession(),
  model: "gpt-4.1",
  shouldTriggerCompaction: ({ compactionCandidateItems }) => {
    return compactionCandidateItems.length >= 12;
  },
});

await run(agent, "Hello!", { session });

// Force compaction manually
await session.runCompaction({ force: true });
```

---

## 12. Models

### Specifying Models

```typescript
import { Agent } from "@openai/agents";

const agent = new Agent({
  name: "Creative Writer",
  model: "gpt-4.1",
});
```

### Default Model

The default model is `gpt-4.1`. To change:

```bash
export OPENAI_DEFAULT_MODEL=gpt-5
```

Or set on Runner:

```typescript
const runner = new Runner({ model: "gpt-4.1-mini" });
```

### GPT-5 Models

When using GPT-5 models (`gpt-5`, `gpt-5-mini`, `gpt-5-nano`), the SDK applies default settings:

```typescript
const agent = new Agent({
  name: "My Agent",
  model: "gpt-5",
  modelSettings: {
    reasoning: { effort: "low" }, // 'minimal' | 'low' | 'medium' | 'high'
    text: { verbosity: "low" }, // 'low' | 'medium' | 'high'
  },
});
```

### ModelSettings Reference

| Field               | Type                                       | Description                   |
| ------------------- | ------------------------------------------ | ----------------------------- |
| `temperature`       | `number`                                   | Creativity vs. determinism    |
| `topP`              | `number`                                   | Nucleus sampling              |
| `frequencyPenalty`  | `number`                                   | Penalize repeated tokens      |
| `presencePenalty`   | `number`                                   | Encourage new tokens          |
| `toolChoice`        | `'auto' \| 'required' \| 'none' \| string` | Tool selection behavior       |
| `parallelToolCalls` | `boolean`                                  | Allow parallel function calls |
| `truncation`        | `'auto' \| 'disabled'`                     | Token truncation strategy     |
| `maxTokens`         | `number`                                   | Maximum tokens in response    |
| `store`             | `boolean`                                  | Persist response for RAG      |
| `reasoning.effort`  | `'minimal' \| 'low' \| 'medium' \| 'high'` | Reasoning effort (GPT-5)      |
| `text.verbosity`    | `'low' \| 'medium' \| 'high'`              | Text verbosity (GPT-5)        |

### Server-Stored Prompts

```typescript
const agent = new Agent({
  name: "Assistant",
  prompt: {
    promptId: "pmpt_68d50b26524c81958c1425070180b5e10ab840669e470fc7",
    variables: { name: "Kaz" },
  },
});
```

### Custom Model Provider

```typescript
import {
  ModelProvider,
  Model,
  ModelRequest,
  ModelResponse,
} from "@openai/agents-core";

class EchoModel implements Model {
  name = "Echo";

  async getResponse(request: ModelRequest): Promise<ModelResponse> {
    return {
      usage: {},
      output: [{ role: "assistant", content: request.input as string }],
    } as any;
  }

  async *getStreamedResponse(request: ModelRequest) {
    yield {
      type: "response.completed",
      response: { output: [], usage: {} },
    } as any;
  }
}

class EchoProvider implements ModelProvider {
  getModel(modelName?: string): Model {
    return new EchoModel();
  }
}

const runner = new Runner({ modelProvider: new EchoProvider() });
```

---

## 13. Guardrails

Guardrails validate or transform user input and agent output.

### Input Guardrails

Run on the initial user input:

```typescript
import { Agent, run, InputGuardrail } from "@openai/agents";
import { z } from "zod";

const guardrailAgent = new Agent({
  name: "Guardrail Check",
  instructions: "Check if the user is asking you to do their math homework.",
  outputType: z.object({
    isMathHomework: z.boolean(),
    reasoning: z.string(),
  }),
});

const mathHomeworkGuardrail: InputGuardrail = {
  name: "Math Homework Guardrail",
  execute: async ({ input, context }) => {
    const result = await run(guardrailAgent, input, { context });
    return {
      outputInfo: result.finalOutput,
      tripwireTriggered: result.finalOutput?.isMathHomework ?? false,
    };
  },
};

const agent = new Agent({
  name: "Customer Support Agent",
  instructions: "You help customers with their questions.",
  inputGuardrails: [mathHomeworkGuardrail],
});
```

### Output Guardrails

Run on the final agent output:

```typescript
const outputGuardrail: OutputGuardrail = {
  name: "PII Check",
  execute: async ({ output }) => {
    const hasPII = checkForPII(output);
    return {
      outputInfo: { hasPII },
      tripwireTriggered: hasPII,
    };
  },
};

const agent = new Agent({
  outputGuardrails: [outputGuardrail],
});
```

### GuardrailFunctionOutput

```typescript
interface GuardrailFunctionOutput {
  outputInfo?: any; // Optional info to store
  tripwireTriggered: boolean; // If true, throws error
}
```

---

## 14. Streaming

### Basic Streaming

```typescript
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

const result = await run(agent, "Tell me a story", { stream: true });

for await (const event of result) {
  console.log(event.type, event);
}

console.log(result.finalOutput);
```

### Stream Event Types

| Event Type                   | Description               |
| ---------------------------- | ------------------------- |
| `raw_model_stream_event`     | Raw events from the model |
| `run_item_stream_event`      | Run item events           |
| `agent_updated_stream_event` | Agent changed during run  |

### StreamedRunResult

`StreamedRunResult` extends `RunResult` with:

- Async iteration over events
- `currentAgent` property for the currently running agent
- Progressive access to `finalOutput` as streaming completes

---

## 15. Human-in-the-Loop

### Tool Approval

```typescript
const sensitiveOperation = tool({
  name: "delete_account",
  description: "Delete a user account",
  parameters: z.object({ userId: z.string() }),
  needsApproval: true, // Requires human approval
  execute: async ({ userId }) => {
    // Perform deletion
    return `Account ${userId} deleted`;
  },
});
```

### Handling Interruptions

```typescript
const result = await run(agent, "Delete my account", { stream: true });

if (result.interruptions.length > 0) {
  // Present to user for approval
  for (const interruption of result.interruptions) {
    console.log("Approval needed for:", interruption);
  }

  // After user approves, resume from state
  const continuation = await run(agent, result.state, { session });
  console.log(continuation.finalOutput);
}
```

### Resuming from RunState

```typescript
try {
  const result = await run(agent, input);
} catch (error) {
  if (error instanceof GuardrailExecutionError && error.state) {
    // Retry with different settings
    agent.inputGuardrails = [fallbackGuardrail];
    const retryResult = await run(agent, error.state);
  }
}
```

---

## 16. Model Context Protocol (MCP)

MCP standardizes how applications provide tools and context to LLMs.

### MCP Server Types

| Type                 | Description                                          | Recommended For                          |
| -------------------- | ---------------------------------------------------- | ---------------------------------------- |
| **Hosted MCP tools** | Remote servers used as tools by OpenAI Responses API | Publicly accessible remote servers       |
| **Streamable HTTP**  | Local or remote servers with HTTP transport          | Remote servers with local tool execution |
| **Stdio**            | Servers accessed via standard input/output           | Local development (simplest option)      |

### Using MCP Servers

```typescript
import {
  Agent,
  MCPServerStdio,
  MCPServerSSE,
  MCPServerStreamableHttp,
} from "@openai/agents";

// Stdio server (simplest)
const stdioServer = new MCPServerStdio({
  fullCommand: "npx -y @modelcontextprotocol/server-filesystem ./sample_files",
});

// SSE server
const sseServer = new MCPServerSSE({
  url: "http://localhost:8080/sse",
});

// Streamable HTTP server
const httpServer = new MCPServerStreamableHttp({
  url: "http://localhost:8080/mcp",
});

await stdioServer.connect();

const agent = new Agent({
  name: "Assistant",
  mcpServers: [stdioServer],
});
```

### Tool Filtering

```typescript
const agent = new Agent({
  mcpServers: [server],
  mcpToolFilter: {
    include: ["read_file", "write_file"], // Only include these tools
    // Or: exclude: ['dangerous_tool']
  },
});
```

---

## 17. Tracing

Tracing is enabled by default and collects events during agent runs: LLM generations, tool calls, handoffs, guardrails, and custom events.

### Traces and Spans

**Traces** represent end-to-end operations with:

- `workflow_name`: Logical workflow name (e.g., "Customer Service")
- `trace_id`: Unique ID (format: `trace_<32_alphanumeric>`)
- `group_id`: Optional ID to link related traces
- `disabled`: If true, trace won't be recorded
- `metadata`: Optional metadata

**Spans** represent operations with start/end times:

- `started_at` / `ended_at` timestamps
- `trace_id`: Parent trace
- `parent_id`: Parent span (if nested)
- `span_data`: Type-specific data (AgentSpanData, GenerationSpanData, etc.)

### Default Tracing

The SDK automatically traces:

- Entire `run()` wrapped in a Trace
- Agent runs wrapped in AgentSpan
- LLM generations in GenerationSpan
- Tool calls in FunctionSpan
- Guardrails in GuardrailSpan
- Handoffs in HandoffSpan

### Higher-Level Traces

```typescript
import { Agent, run, withTrace } from "@openai/agents";

await withTrace("Joke Workflow", async () => {
  const result = await run(agent, "Tell me a joke");
  const rating = await run(agent, `Rate this joke: ${result.finalOutput}`);
  console.log(`Joke: ${result.finalOutput}`);
  console.log(`Rating: ${rating.finalOutput}`);
});
```

### Custom Spans

```typescript
import { createCustomSpan } from "@openai/agents";

const span = createCustomSpan("my-operation");
// ... do work
span.end();
```

### Sensitive Data

```typescript
// Disable sensitive data in traces
const runner = new Runner({
  traceIncludeSensitiveData: false,
});
```

Or via environment variables:

```bash
export OPENAI_AGENTS_DONT_LOG_MODEL_DATA=1
export OPENAI_AGENTS_DONT_LOG_TOOL_DATA=1
```

### Custom Trace Processors

```typescript
import { addTraceProcessor, setTraceProcessors } from "@openai/agents";

// Add additional processor (traces still go to OpenAI)
addTraceProcessor(myCustomProcessor);

// Replace all processors (traces won't go to OpenAI unless you add one)
setTraceProcessors([myCustomProcessor]);
```

### Export Loop Lifecycle

In browser or Cloudflare Workers, use manual flushing:

```typescript
import { getGlobalTraceProvider } from "@openai/agents";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    try {
      // Your agent code
      return new Response("success");
    } finally {
      ctx.waitUntil(getGlobalTraceProvider().forceFlush());
    }
  },
};
```

---

## 18. Error Handling

### Error Types

| Error                              | Description                                                  |
| ---------------------------------- | ------------------------------------------------------------ |
| `MaxTurnsExceededError`            | `maxTurns` limit reached                                     |
| `ModelBehaviorError`               | Model produced invalid output (malformed JSON, unknown tool) |
| `InputGuardrailTripwireTriggered`  | Input guardrail violated                                     |
| `OutputGuardrailTripwireTriggered` | Output guardrail violated                                    |
| `GuardrailExecutionError`          | Guardrail failed to complete                                 |
| `ToolCallError`                    | Function tool call failed                                    |
| `UserError`                        | Error from configuration or user input                       |

All errors extend `AgentsError`, which may include a `state` property for recovery.

### Error Handling Example

```typescript
import {
  Agent,
  run,
  GuardrailExecutionError,
  InputGuardrailTripwireTriggered,
  MaxTurnsExceededError,
} from "@openai/agents";

try {
  const result = await run(agent, input);
  console.log(result.finalOutput);
} catch (error) {
  if (error instanceof MaxTurnsExceededError) {
    console.error("Agent took too many turns");
  } else if (error instanceof GuardrailExecutionError) {
    console.error("Guardrail failed:", error.message);
    // Retry with fallback guardrail
    if (error.state) {
      agent.inputGuardrails = [fallbackGuardrail];
      const retryResult = await run(agent, error.state);
    }
  } else if (error instanceof InputGuardrailTripwireTriggered) {
    console.error("Input validation failed");
  } else {
    throw error;
  }
}
```

---

## 19. Configuration

### API Keys

```typescript
import { setDefaultOpenAIKey, setTracingExportApiKey } from "@openai/agents";

// Set main API key
setDefaultOpenAIKey("sk-...");

// Set separate key for tracing (optional)
setTracingExportApiKey("sk-...");
```

### Custom OpenAI Client

```typescript
import { OpenAI } from "openai";
import { setDefaultOpenAIClient } from "@openai/agents";

const customClient = new OpenAI({
  baseURL: "https://custom-endpoint.com",
  apiKey: "sk-...",
});
setDefaultOpenAIClient(customClient);
```

### API Selection

```typescript
import { setOpenAIAPI } from "@openai/agents";

// Use Responses API (default)
setOpenAIAPI("responses");

// Use Chat Completions API
setOpenAIAPI("chat_completions");
```

### Tracing Configuration

```typescript
import { setTracingDisabled } from "@openai/agents";

// Disable tracing globally
setTracingDisabled(true);
```

### Debug Logging

```bash
# Enable all debug logs
export DEBUG=openai-agents*
```

```typescript
import { getLogger } from "@openai/agents";

const logger = getLogger("my-app");
logger.debug("something happened");
```

### Sensitive Data in Logs

```bash
# Disable LLM input/output logging
export OPENAI_AGENTS_DONT_LOG_MODEL_DATA=1

# Disable tool input/output logging
export OPENAI_AGENTS_DONT_LOG_TOOL_DATA=1
```

---

## 20. Voice/Realtime Agents

Build voice agents with the `@openai/agents-realtime` package.

### Installation

```bash
npm install @openai/agents-realtime
```

### Basic Voice Agent

```typescript
import { z } from "zod";
import { RealtimeAgent, RealtimeSession, tool } from "@openai/agents-realtime";

const getWeatherTool = tool({
  name: "get_weather",
  description: "Get the weather for a given city",
  parameters: z.object({ city: z.string() }),
  execute: async ({ city }) => {
    return `The weather in ${city} is sunny`;
  },
});

const agent = new RealtimeAgent({
  name: "Weather Agent",
  instructions:
    "You are a weather assistant. Use tools when asked about weather.",
  tools: [getWeatherTool],
});

// Browser usage with ephemeral key
const { apiKey } = await fetch("/api/ephemeral-key").then((r) => r.json());

const session = new RealtimeSession(agent);
await session.connect({ apiKey });
// Audio input/output configured automatically
```

### Transport Mechanisms

- **WebRTC**: Low-latency, browser-optimized
- **WebSocket**: Server-side or custom transports

### Features

- Automatic interruption detection
- Context management
- Guardrails support
- Built-in tracing (can be disabled with `tracingDisabled: true`)

### Disabling Voice Tracing

```typescript
const session = new RealtimeSession(agent, {
  tracingDisabled: true,
});
```

Or via environment:

```bash
export OPENAI_AGENTS_DISABLE_TRACING=1
```

---

## Quick Reference

### Imports

```typescript
// Core
import { Agent, run, Runner, tool, handoff, withTrace } from "@openai/agents";

// Types
import type {
  AgentInputItem,
  RunContext,
  RunResult,
  StreamedRunResult,
  InputGuardrail,
  OutputGuardrail,
} from "@openai/agents";

// MCP
import {
  MCPServerStdio,
  MCPServerSSE,
  MCPServerStreamableHttp,
} from "@openai/agents";

// Sessions
import {
  MemorySession,
  OpenAIConversationsSession,
  OpenAIResponsesCompactionSession,
} from "@openai/agents";

// Hosted Tools
import { webSearchTool, fileSearchTool } from "@openai/agents";

// Configuration
import {
  setDefaultOpenAIKey,
  setDefaultOpenAIClient,
  setOpenAIAPI,
  setTracingDisabled,
  setTracingExportApiKey,
  getLogger,
  getGlobalTraceProvider,
} from "@openai/agents";

// Extensions
import {
  removeAllTools,
  RECOMMENDED_PROMPT_PREFIX,
} from "@openai/agents-core/extensions";

// Realtime (separate package)
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";
```

### Environment Variables

| Variable                            | Purpose                                 |
| ----------------------------------- | --------------------------------------- |
| `OPENAI_API_KEY`                    | OpenAI API key                          |
| `OPENAI_DEFAULT_MODEL`              | Default model for all agents            |
| `OPENAI_AGENTS_DISABLE_TRACING`     | Disable tracing (`1` to disable)        |
| `OPENAI_AGENTS_DONT_LOG_MODEL_DATA` | Don't log LLM data (`1` to disable)     |
| `OPENAI_AGENTS_DONT_LOG_TOOL_DATA`  | Don't log tool data (`1` to disable)    |
| `DEBUG`                             | Enable debug logging (`openai-agents*`) |

---

## Resources

- **GitHub Repository:** [github.com/openai/openai-agents-js](https://github.com/openai/openai-agents-js)
- **Official Documentation:** [openai.github.io/openai-agents-js](https://openai.github.io/openai-agents-js/)
- **Examples:** [github.com/openai/openai-agents-js/tree/main/examples](https://github.com/openai/openai-agents-js/tree/main/examples)
- **Python SDK:** [github.com/openai/openai-agents-python](https://github.com/openai/openai-agents-python)

---

_Last updated: December 2025_
