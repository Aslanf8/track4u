-- Migration SQL for Gemini Integration & Transparency Features
-- Run these ALTER TABLE statements if you need to manually update the database
-- Otherwise, use: npm run db:push

-- Add Google Gemini API key fields
ALTER TABLE users ADD COLUMN encrypted_google_key TEXT;
ALTER TABLE users ADD COLUMN google_key_last_four TEXT;
ALTER TABLE users ADD COLUMN google_key_added_at INTEGER;

-- Add AI Provider Preferences
ALTER TABLE users ADD COLUMN preferred_provider TEXT DEFAULT 'openai';
ALTER TABLE users ADD COLUMN preferred_gemini_model TEXT DEFAULT 'gemini-2.5-flash';

-- Note: The user_goals table already has all necessary columns (age, sex, weight, height, activityLevel)
-- No changes needed for user_goals table

-- Add ingredient breakdown field for transparent ingredient reasoning
ALTER TABLE food_entries ADD COLUMN ingredient_breakdown TEXT;

