import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"), // Nullable for OAuth users
  name: text("name").notNull(),
  // Encrypted OpenAI API key (never stored in plaintext)
  encryptedApiKey: text("encrypted_api_key"),
  apiKeyLastFour: text("api_key_last_four"), // For display purposes
  apiKeyAddedAt: integer("api_key_added_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const userGoals = sqliteTable("user_goals", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Profile info
  age: integer("age"),
  sex: text("sex"), // 'male' | 'female'
  weight: real("weight"), // in kg
  height: real("height"), // in cm
  activityLevel: text("activity_level"), // 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goalType: text("goal_type"), // 'lose' | 'maintain' | 'gain'
  // Macro targets
  dailyCalories: integer("daily_calories").notNull().default(2000),
  dailyProtein: real("daily_protein").notNull().default(50),
  dailyCarbs: real("daily_carbs").notNull().default(250),
  dailyFat: real("daily_fat").notNull().default(65),
});

export const foodEntries = sqliteTable("food_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  imageUrl: text("image_url"),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  fiber: real("fiber").default(0),
  description: text("description"),
  consumedAt: integer("consumed_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  goals: one(userGoals, {
    fields: [users.id],
    references: [userGoals.userId],
  }),
  foodEntries: many(foodEntries),
}));

export const userGoalsRelations = relations(userGoals, ({ one }) => ({
  user: one(users, {
    fields: [userGoals.userId],
    references: [users.id],
  }),
}));

export const foodEntriesRelations = relations(foodEntries, ({ one }) => ({
  user: one(users, {
    fields: [foodEntries.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserGoals = typeof userGoals.$inferSelect;
export type NewUserGoals = typeof userGoals.$inferInsert;
export type FoodEntry = typeof foodEntries.$inferSelect;
export type NewFoodEntry = typeof foodEntries.$inferInsert;

