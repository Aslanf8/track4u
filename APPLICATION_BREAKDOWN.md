# Track4U Application Breakdown

## 🎯 Application Overview

**Track4U** is a nutrition tracking application that uses AI vision models to analyze food images and extract nutritional information. Users can scan meals, track macros, set goals, and interact with an AI nutrition coach.

---

## 🔍 AI Food Scanning System (Core Feature)

### Flow Diagram

```
User Action → Image Capture → AI Analysis → Review/Edit → Save to DB
     ↓              ↓              ↓            ↓            ↓
  Camera/Upload  Base64 String  Vision API   Edit Form   Food Entry
```

### Detailed Flow

#### 1. **Image Capture** (`FoodScanner.tsx`)
- **Entry Points:**
  - Camera capture (mobile/desktop with camera switching)
  - File upload (single or multiple images, max 5)
- **Image Storage:** Base64 data URLs stored in component state
- **Features:**
  - Multi-image support (up to 5 images per meal)
  - Context input (optional user hints: "half portion", "no sauce", etc.)
  - Camera switching (front/back on mobile, dropdown on desktop)

#### 2. **AI Analysis** (`/api/analyze` route)

**Provider Selection:**
- Checks user's `preferredProvider` (OpenAI or Google)
- Defaults to OpenAI if not set

**OpenAI Path** (`lib/openai.ts`):
```typescript
analyzeFoodImage(images: string[], userId: string, context?: string)
```
- **Model:** `gpt-5.2` (vision-capable)
- **Input:** Array of base64 images + optional context
- **Prompt:** Structured JSON extraction request
- **Output:** `FoodAnalysisResult` with:
  - `name`: Food name
  - `calories`, `protein`, `carbs`, `fat`, `fiber`: Nutritional values
  - `description`: AI-generated description
  - `confidence`: "low" | "medium" | "high"

**Google Gemini Path** (`lib/gemini.ts`):
```typescript
analyzeFoodImageGemini(images: string[], userId: string, context?: string, modelId?: string)
```
- **Model:** User-selectable (default: `gemini-2.5-flash`)
- **Input:** Base64 images (cleaned of data URI prefix)
- **Prompt:** Same structured JSON format
- **Output:** Same `FoodAnalysisResult` structure

**Key Implementation Details:**
- Images sent as base64 strings (data URLs)
- Context appended to prompt for better accuracy
- Error handling for missing API keys, rate limits, quota issues
- User's API keys stored encrypted in database

#### 3. **Review & Edit** (`FoodScanner.tsx` - Review Step)

**Features:**
- Editable fields (name, calories, macros)
- Shows confidence level
- Displays AI description
- Shows percentage of daily goals (if goals set)
- **Refine with AI:** Can re-analyze with additional context/images

**Refinement Flow:**
- User adds more images or context
- Calls `/api/analyze` again with all images + new context
- Updates analysis results

#### 4. **Save to Database** (`/api/food` POST)

**Data Structure:**
```typescript
{
  id: UUID,
  userId: string,
  name: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber: number,
  description: string | null,
  imageUrl: string | null, // Single image as string, multiple as JSON array
  consumedAt: Date,
  createdAt: Date
}
```

**Image Storage:**
- Single image: stored as base64 string
- Multiple images: stored as JSON stringified array
- Backward compatible parsing in `FoodEntryDialog`

---

## 🧠 Nutrition Agent System

### Architecture

**Agent Definition** (`lib/agents/nutrition-agent.ts`):
- Uses OpenAI Agents SDK
- Model: `gpt-5.2`
- Configured with 7 nutrition tools

**Tools Available** (`lib/agents/nutrition-tools.ts`):

1. **`get_nutrition_context`**
   - Complete snapshot: goals, today's progress, 7/30 day trends, metabolic metrics, recent entries, streaks
   - Primary tool for general questions

2. **`get_today_totals`**
   - Today's consumption + remaining targets
   - Use for: "What do I need to eat today?"

3. **`get_historical_data`**
   - Aggregated data for date range
   - Returns: totals, averages, consistency, all entries

4. **`get_food_entries`**
   - Filtered food entries (by date range or search term)
   - Use for: finding specific foods, analyzing patterns

5. **`calculate_remaining_macros`**
   - Exact amounts needed to hit goals
   - Includes suggestions for each macro

6. **`get_trend_analysis`**
   - Compares periods (7 days, 30 days, custom)
   - Shows averages vs goals, consistency metrics

7. **`get_metabolic_metrics`**
   - BMR, TDEE, deficit, projected weight change
   - Uses Mifflin-St Jeor equation

**Context Builder** (`lib/agents/nutrition-context.ts`):
- Aggregates all user data in single call
- Calculates:
  - Today's totals and remaining
  - 7-day and 30-day averages
  - Consistency (percentage of days with entries)
  - Streaks (current and longest)
  - Metabolic metrics (BMR, TDEE, deficit)

**API Endpoint** (`/api/nutrition-agent`):
- Streaming SSE (Server-Sent Events)
- Events: `thinking`, `tool_call`, `tool_result`, `text_delta`, `message_complete`
- Handles conversation history
- Uses user's OpenAI API key

**UI Component** (`NutritionAgentDialog.tsx`):
- Real-time streaming display
- Shows thinking steps and tool calls
- Markdown rendering for responses
- Conversation history

---

## 📊 Data Architecture

### Database Schema (`lib/db/schema.ts`)

**Tables:**

1. **`users`**
   - Auth info (email, passwordHash)
   - Encrypted API keys (OpenAI, Google)
   - Provider preferences
   - Gemini model preference

2. **`user_goals`**
   - Profile: age, sex, weight, height, activity level, goal type
   - Macro targets: daily calories, protein, carbs, fat

3. **`food_entries`**
   - All logged meals
   - Nutritional data
   - Image storage (base64)
   - Timestamps (consumedAt, createdAt)

### Calculations (`lib/calculations.ts`)

**Metabolic Calculations:**
- **BMR:** Mifflin-St Jeor equation
- **TDEE:** BMR × activity multiplier
- **Deficit:** TDEE - target calories
- **Projected Loss:** (deficit × 7) / 3500 lbs per week

**Activity Multipliers:**
- Sedentary: 1.2
- Light: 1.375
- Moderate: 1.55
- Active: 1.725
- Very Active: 1.9

---

## 🎨 Component Architecture

### Core Components

**Food Scanning:**
- `FoodScanner.tsx`: Main scanning dialog with multi-step flow
- `FoodEntryDialog.tsx`: View/edit existing entries, reanalyze with AI
- `GlobalScanner.tsx`: Wrapper with floating button

**Dashboard:**
- `DailyProgress.tsx`: Today's macro progress
- `MacroRing.tsx`: Visual macro breakdown
- `QuickStats.tsx`: Summary statistics

**Agent:**
- `NutritionAgentDialog.tsx`: Chat interface for nutrition coach
- `GlobalAgent.tsx`: Wrapper with floating button

### State Management

**Food Entries Hook** (`lib/hooks/use-food-entries.tsx`):
- React Context for shared food entries state
- Optimistic updates
- Refresh triggers

---

## 🔐 Security & API Keys

### Encryption (`lib/encryption.ts`)
- API keys encrypted before storage
- Decrypted on-demand for API calls
- Never exposed to client

### Key Management
- Users provide their own API keys
- Stored per-user in database
- Last 4 digits shown for verification
- Supports both OpenAI and Google Gemini

### Error Handling
- `NoApiKeyError`: Custom error for missing keys
- `categorizeOpenAIError`: User-friendly error messages
- Handles: invalid keys, rate limits, quota exceeded, network errors

---

## 🔄 Complete User Flows

### Flow 1: New Food Entry via Scan

1. User clicks floating camera button
2. `FoodScanner` opens → Capture/upload images
3. Optional: Add context ("half portion")
4. Click "Analyze" → POST `/api/analyze`
5. Backend:
   - Checks user's preferred provider
   - Gets encrypted API key
   - Calls OpenAI/Gemini vision API
   - Returns structured JSON
6. Frontend shows review step with editable fields
7. Optional: Refine with more images/context
8. User edits if needed
9. Click "Save" → POST `/api/food`
10. Entry saved to database
11. Optimistic update to UI
12. Toast notification

### Flow 2: Reanalyze Existing Entry

1. User opens `FoodEntryDialog` for existing entry
2. Clicks "Reanalyze with AI"
3. Can add additional images (camera/upload)
4. Can add context
5. POST `/api/analyze` with original + new images
6. Updates form data with new analysis
7. User reviews and saves → PATCH `/api/food/[id]`

### Flow 3: Nutrition Agent Query

1. User opens nutrition agent dialog
2. Types question: "What can I eat today?"
3. POST `/api/nutrition-agent` with message + history
4. Agent:
   - Analyzes question
   - Calls `calculate_remaining_macros` tool
   - Gets today's totals and goals
   - Generates response with specific recommendations
5. Streaming response displayed in real-time
6. User can ask follow-ups (history maintained)

---

## 🛠️ Technical Stack

**Frontend:**
- Next.js 14+ (App Router)
- React 18+
- TypeScript (strict)
- shadcn/ui components
- Tailwind CSS

**Backend:**
- Next.js API routes
- Drizzle ORM
- SQLite database
- Server-side encryption

**AI Integration:**
- OpenAI GPT-5.2 (vision)
- Google Gemini 2.5 Flash
- OpenAI Agents SDK (for nutrition coach)

**State:**
- React Context (food entries)
- Optimistic updates
- Server state via API calls

---

## 📝 Key Files Reference

**AI Analysis:**
- `app/api/analyze/route.ts` - Main analysis endpoint
- `lib/openai.ts` - OpenAI integration
- `lib/gemini.ts` - Gemini integration

**Food Management:**
- `components/food/FoodScanner.tsx` - Scanning UI
- `components/food/FoodEntryDialog.tsx` - Entry view/edit
- `app/api/food/route.ts` - CRUD operations

**Nutrition Agent:**
- `lib/agents/nutrition-agent.ts` - Agent definition
- `lib/agents/nutrition-tools.ts` - Available tools
- `lib/agents/nutrition-context.ts` - Data aggregation
- `app/api/nutrition-agent/route.ts` - Streaming API
- `components/agent/NutritionAgentDialog.tsx` - UI

**Data:**
- `lib/db/schema.ts` - Database schema
- `lib/calculations.ts` - Metabolic calculations
- `lib/hooks/use-food-entries.tsx` - State management

---

## 🎯 Key Design Decisions

1. **Multi-Image Support:** Up to 5 images per meal for better accuracy
2. **Provider Flexibility:** Users choose OpenAI or Google, bring own keys
3. **Context-Aware:** Optional user hints improve AI accuracy
4. **Refinement Loop:** Can re-analyze with more context/images
5. **Streaming Agent:** Real-time responses with tool call visibility
6. **Optimistic Updates:** Immediate UI feedback
7. **Backward Compatibility:** Handles both single image (string) and multiple (JSON array)

---

## 🚀 Future Enhancement Opportunities

1. **Image Storage:** Currently base64 in DB - could move to object storage
2. **Caching:** Cache analysis results for similar images
3. **Batch Analysis:** Analyze multiple meals at once
4. **Food Database:** Pre-populated food database for faster lookup
5. **Offline Support:** Cache recent entries for offline viewing
6. **Export:** CSV/PDF export of nutrition data
7. **Meal Plans:** AI-generated meal plans based on goals
8. **Barcode Scanning:** Alternative to image analysis

