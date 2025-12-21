# Track4U

An open source calorie tracking app powered by AI. You bring your own OpenAI API key.

## Why I Built This

Tracking food is tedious. Searching databases, measuring portions, logging every ingredient—it kills consistency. Most people give up because it takes too long.

I wanted something different: **snap a photo and move on**. That's it.

The goal isn't 100% accuracy. It's 70-80% accuracy with minimal friction. A rough estimate you actually log beats a perfect entry you skip. Consistency > precision.

And no subscriptions. No ads. No monthly fees. You use your own OpenAI API key and pay only for what you use (usually pennies per scan).

## Features

- **AI Food Scanning** - Photo → macros in seconds
- **Goal Setting** - AI-guided setup for your nutrition targets
- **Progress Tracking** - Simple charts, no bloat
- **History** - Search past meals
- **Dark/Light Mode**

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Drizzle ORM + Turso (SQLite)
- NextAuth.js
- OpenAI API (GPT-4o Vision)

## Getting Started

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in:

   - `AUTH_SECRET` - Generate with `npx auth secret`
   - `DATABASE_URL` - Your Turso database URL
   - `DATABASE_AUTH_TOKEN` - Your Turso auth token
   - `ENCRYPTION_KEY` - 32-byte hex key for API key encryption

4. Push the database schema:

   ```bash
   npm run db:push
   ```

5. Run the dev server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## How It Works

Add your OpenAI API key in settings. It's encrypted and stored securely. When you scan food, the image goes to GPT-4o Vision which returns the nutritional breakdown.

**Cost**: ~$0.01-0.03 per scan depending on image size. No markup. No middleman.

## Philosophy

- Speed over perfection
- Logging something beats logging nothing
- Your API key, your usage costs
- No subscriptions, ever

## License

MIT
