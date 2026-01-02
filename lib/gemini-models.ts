// Client-safe Gemini models metadata
// This file can be imported on both client and server

export const GEMINI_MODELS = [
  {
    id: "gemini-3-flash-preview",
    name: "Gemini 3 Flash Preview",
    description: "Most intelligent model built for speed, combining frontier intelligence with superior search",
    inputPrice: 0.50,
    outputPrice: 3.00,
    freeTier: true,
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Hybrid reasoning model with 1M token context window and thinking budgets",
    inputPrice: 0.30,
    outputPrice: 2.50,
    freeTier: true,
  },
  {
    id: "gemini-2.5-flash-preview-09-2025",
    name: "Gemini 2.5 Flash Preview",
    description: "Latest 2.5 Flash optimized for large scale processing, low-latency, high volume tasks",
    inputPrice: 0.30,
    outputPrice: 2.50,
    freeTier: true,
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash-Lite",
    description: "Smallest and most cost-effective model, built for at-scale usage",
    inputPrice: 0.10,
    outputPrice: 0.40,
    freeTier: true,
  },
  {
    id: "gemini-2.5-flash-lite-preview-09-2025",
    name: "Gemini 2.5 Flash-Lite Preview",
    description: "Latest Flash-Lite optimized for cost-efficiency, high throughput and high quality",
    inputPrice: 0.10,
    outputPrice: 0.40,
    freeTier: true,
  },
] as const;

export type GeminiModelId = typeof GEMINI_MODELS[number]["id"];

