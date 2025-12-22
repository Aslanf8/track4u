<p align="center">
  <img src="https://via.placeholder.com/120x120/f59e0b/ffffff?text=🍽️" alt="Track4U Logo" width="120" height="120" />
</p>

<h1 align="center">Track4U</h1>

<p align="center">
  <strong>AI-powered calorie tracking. No subscriptions. Open source.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/next.js-16-black" alt="Next.js 16" />
</p>

---

## Why I Built This

I'm [Aslan Farboud](https://www.aslanfarboud.com), and I built Track4U because I wanted it for myself.

I needed an efficient way to track my food intake. Every existing app felt painfully slow — searching databases, estimating portions, manually entering ingredients. The friction was killing my consistency.

Then I realized: **GPT-5.2 Vision is now incredibly good at analyzing food photos, and it costs about $0.01 per scan.** The software to tie it together isn't rocket science. So I built what I wanted to use.

The technology finally made this obvious to build, and I cared enough about the problem to build it properly.

### How It Works

Take a photo → AI analyzes it → Get macros in seconds. That's it.

### Why No Subscription?

You bring your own OpenAI API key. You pay OpenAI directly (~$0.01/scan). I don't take a cut. The software is free and open source.

---

## Features

### 📸 AI Food Scanning

Point, shoot, done. Vision AI identifies food items and estimates nutritional content from a single photo.

- Recognizes complex multi-item meals
- Estimates portion sizes automatically
- Returns calories, protein, carbs, fat, and fiber
- Add context like "half portion" for better accuracy

### 🎯 Smart Goal Setup

Science-backed macro calculations based on your body, activity level, and goals.

- Mifflin-St Jeor equation for accurate TDEE
- Support for lose, maintain, or gain goals
- AI assistant to answer nutrition questions
- Fully adjustable targets

### 📊 Progress Analytics

Beautiful charts show calorie trends and macro distribution over time.

- 7-day and 30-day calorie trends
- Macro distribution pie charts
- Daily averages and streak tracking

### 📜 Meal History

Browse past meals grouped by date, search by name, and track patterns.

- Grouped by Today, Yesterday, or date
- Daily calorie totals per group
- Quick search functionality
- Full edit/delete capabilities

### 🔐 Security

Your data stays yours.

- API keys encrypted with AES-256-GCM
- Only last 4 characters visible in UI
- No API key logging or transmission
- BYOK model — your billing stays between you and the AI provider

---

## How It Works

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  1. Snap Photo  │ -> │  2. AI Analyzes │ -> │  3. Track       │
│                 │    │                 │    │                 │
│  Point camera   │    │  Vision AI      │    │  Review results │
│  at your meal   │    │  identifies     │    │  Save to diary  │
│                 │    │  food & macros  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### The BYOK Model

**BYOK = Bring Your Own Key**

Instead of paying us a monthly subscription, you use your own AI API key and pay the provider directly.

| Metric            | Track4U (BYOK) | Subscription Apps |
| ----------------- | -------------- | ----------------- |
| Monthly cost      | $0-3\*         | $10-15            |
| Yearly cost       | $0-18\*        | $80-180           |
| Pay when inactive | No             | Yes               |
| Data sold         | Never          | Maybe             |

\*Based on ~$0.01 per scan with GPT-5.2, 3-5 scans/day

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Turso database (or any LibSQL-compatible database)
- An AI API key (for food scanning)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Aslanf8/track4u.git
cd track4u

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

```env
# Generate with: npx auth secret
AUTH_SECRET=your-auth-secret

# Turso database credentials
DATABASE_URL=libsql://your-database.turso.io
DATABASE_AUTH_TOKEN=your-turso-auth-token

# Encryption key for API key storage
ENCRYPTION_SECRET=your-32-char-secret-key
```

---

## Tech Stack

| Layer      | Technology                    |
| ---------- | ----------------------------- |
| Framework  | Next.js 16 (App Router)       |
| Language   | TypeScript (strict)           |
| Styling    | Tailwind CSS + shadcn/ui      |
| Database   | Turso (SQLite) + Drizzle ORM  |
| Auth       | NextAuth.js (Credentials)     |
| AI         | Vision AI (provider-agnostic) |
| Charts     | Recharts                      |
| Encryption | Node.js crypto (AES-256-GCM)  |

### Project Structure

```
app/
├── (auth)/           # Sign-in/sign-up pages
├── (main)/           # Protected app routes
│   ├── dashboard/    # Daily progress hub
│   ├── history/      # Meal history
│   ├── progress/     # Analytics
│   └── settings/     # User settings
├── (marketing)/      # Public marketing pages
└── api/              # API routes

components/
├── dashboard/        # Progress rings, stats
├── food/             # Scanner, entry cards
├── layout/           # Navigation components
├── marketing/        # Landing page sections
├── onboarding/       # Goal wizard
└── ui/               # shadcn/ui components

lib/
├── auth.ts           # NextAuth configuration
├── db/               # Drizzle schema & client
├── encryption.ts     # AES-256-GCM utilities
└── openai.ts         # AI integration
```

---

## Database Schema

### Users

```
id, email, passwordHash, name, encryptedApiKey, apiKeyLastFour, apiKeyAddedAt, createdAt
```

### User Goals

```
id, userId, age, sex, weight, height, activityLevel, goalType, dailyCalories, dailyProtein, dailyCarbs, dailyFat
```

### Food Entries

```
id, userId, imageUrl, name, calories, protein, carbs, fat, fiber, description, consumedAt, createdAt
```

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
npm run lint         # Run ESLint
```

---

## Self-Hosting

Track4U is designed to be self-hostable. Deploy to any platform that supports Next.js:

- **Vercel** — One-click deploy
- **Railway** — Simple container deployment
- **Docker** — Build your own container
- **VPS** — Manual deployment

See the [self-hosting guide](docs/self-hosting.md) for detailed instructions.

---

## Contributing

Contributions are welcome! Whether it's bug fixes, new features, or documentation improvements.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read the [Contributing Guide](CONTRIBUTING.md) for details.

---

## License

MIT License — use it, fork it, make it your own.

See [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Built by <a href="https://www.aslanfarboud.com">Aslan Farboud</a> — because I wanted this tool to exist.</strong>
</p>

<p align="center">
  <a href="https://github.com/Aslanf8/track4u">GitHub</a> •
  <a href="https://www.aslanfarboud.com">Portfolio</a>
</p>
