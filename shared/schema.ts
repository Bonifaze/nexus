import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password"),
  fullName: text("full_name").notNull(),
  authProvider: text("auth_provider").notNull().default("custom"),
  providerId: text("provider_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const socialProfiles = pgTable("social_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // instagram, facebook, twitter, linkedin, tiktok
  username: text("username").notNull(),
  accessToken: text("access_token"), // encrypted in storage
  refreshToken: text("refresh_token"), // encrypted in storage
  tokenExpiresAt: timestamp("token_expires_at"),
  isConnected: integer("is_connected").default(1).notNull(), // 1 = connected, 0 = disconnected
  followers: integer("followers").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  mediaUrls: json("media_urls").$type<string[]>().default([]),
  platforms: json("platforms").$type<string[]>().notNull(),
  status: text("status").notNull().default("draft"), // draft, scheduled, published, failed
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contentLibrary = pgTable("content_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // image, video, document
  fileSize: integer("file_size").notNull(),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: varchar("post_id").references(() => posts.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  views: integer("views").default(0),
  engagementRate: integer("engagement_rate").default(0), // stored as percentage * 100
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const aiGenerations = pgTable("ai_generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  generationType: text("generation_type").notNull(), // 'content', 'image', 'hashtags', 'caption'
  prompt: text("prompt").notNull(),
  generatedContent: text("generated_content").notNull(),
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSocialProfileSchema = createInsertSchema(socialProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
});

export const insertContentLibrarySchema = createInsertSchema(contentLibrary).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  recordedAt: true,
});

export const insertAiGenerationSchema = createInsertSchema(aiGenerations).omit({
  id: true,
  createdAt: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Register schema
export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SocialProfile = typeof socialProfiles.$inferSelect;
export type InsertSocialProfile = z.infer<typeof insertSocialProfileSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type ContentLibraryItem = typeof contentLibrary.$inferSelect;
export type InsertContentLibraryItem = z.infer<typeof insertContentLibrarySchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type AiGeneration = typeof aiGenerations.$inferSelect;
export type InsertAiGeneration = z.infer<typeof insertAiGenerationSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
