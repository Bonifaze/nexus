import { 
  users,
  posts,
  socialProfiles,
  contentLibrary,
  analytics,
  aiGenerations,
  type User, 
  type InsertUser, 
  type SocialProfile, 
  type InsertSocialProfile,
  type Post,
  type InsertPost,
  type ContentLibraryItem,
  type InsertContentLibraryItem,
  type Analytics,
  type InsertAnalytics,
  type AiGeneration,
  type InsertAiGeneration
} from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, desc, and, sql } from "drizzle-orm";
import { Pool } from "@neondatabase/serverless";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Social profile methods
  getSocialProfiles(userId: string): Promise<SocialProfile[]>;
  getSocialProfile(id: string): Promise<SocialProfile | undefined>;
  createSocialProfile(profile: InsertSocialProfile): Promise<SocialProfile>;
  updateSocialProfile(id: string, updates: Partial<SocialProfile>): Promise<SocialProfile | undefined>;
  deleteSocialProfile(id: string): Promise<boolean>;
  
  // Post methods
  getPosts(userId: string): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  getScheduledPosts(userId: string): Promise<Post[]>;
  getRecentPosts(userId: string, limit?: number): Promise<Post[]>;
  
  // Content library methods
  getContentLibrary(userId: string): Promise<ContentLibraryItem[]>;
  getContentLibraryItem(id: string): Promise<ContentLibraryItem | undefined>;
  createContentLibraryItem(item: InsertContentLibraryItem): Promise<ContentLibraryItem>;
  deleteContentLibraryItem(id: string): Promise<boolean>;
  
  // Analytics methods
  getAnalytics(userId: string): Promise<Analytics[]>;
  getAnalyticsForPost(postId: string): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalyticsByPlatform(userId: string, platform: string): Promise<Analytics[]>;
  
  // AI Generation methods
  getAiGenerations(userId: string): Promise<AiGeneration[]>;
  createAiGeneration(generation: InsertAiGeneration): Promise<AiGeneration>;
}

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export class DatabaseStorage implements IStorage {
  constructor() {
    console.log('Using PostgreSQL database storage');
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = insertUser.passwordHash ? await bcrypt.hash(insertUser.passwordHash, 10) : null;
    const [user] = await db.insert(users).values({
      ...insertUser,
      passwordHash: hashedPassword,
    }).returning();
    return user;
  }

  // Social Profile methods
  async getSocialProfiles(userId: string): Promise<SocialProfile[]> {
    return await db.select().from(socialProfiles).where(eq(socialProfiles.userId, userId));
  }

  async getSocialProfile(id: string): Promise<SocialProfile | undefined> {
    const result = await db.select().from(socialProfiles).where(eq(socialProfiles.id, id)).limit(1);
    return result[0] || undefined;
  }

  async createSocialProfile(insertProfile: InsertSocialProfile): Promise<SocialProfile> {
    const [profile] = await db.insert(socialProfiles).values(insertProfile).returning();
    return profile;
  }

  async updateSocialProfile(id: string, updates: Partial<SocialProfile>): Promise<SocialProfile | undefined> {
    const result = await db.update(socialProfiles)
      .set(updates)
      .where(eq(socialProfiles.id, id))
      .returning();
    return result[0] || undefined;
  }

  async deleteSocialProfile(id: string): Promise<boolean> {
    const result = await db.delete(socialProfiles).where(eq(socialProfiles.id, id));
    return result.rowCount > 0;
  }

  // Post methods
  async getPosts(userId: string): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt));
  }

  async getPost(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0] || undefined;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(insertPost).returning();
    return post;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const result = await db.update(posts)
      .set(updates)
      .where(eq(posts.id, id))
      .returning();
    return result[0] || undefined;
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return result.rowCount > 0;
  }

  async getScheduledPosts(userId: string): Promise<Post[]> {
    return await db.select().from(posts)
      .where(and(eq(posts.userId, userId), eq(posts.status, "scheduled")))
      .orderBy(posts.scheduledAt);
  }

  async getRecentPosts(userId: string, limit = 10): Promise<Post[]> {
    return await db.select().from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  // Content Library methods
  async getContentLibrary(userId: string): Promise<ContentLibraryItem[]> {
    return await db.select().from(contentLibrary).where(eq(contentLibrary.userId, userId)).orderBy(desc(contentLibrary.createdAt));
  }

  async getContentLibraryItem(id: string): Promise<ContentLibraryItem | undefined> {
    const result = await db.select().from(contentLibrary).where(eq(contentLibrary.id, id)).limit(1);
    return result[0] || undefined;
  }

  async createContentLibraryItem(insertItem: InsertContentLibraryItem): Promise<ContentLibraryItem> {
    const [item] = await db.insert(contentLibrary).values(insertItem).returning();
    return item;
  }

  async deleteContentLibraryItem(id: string): Promise<boolean> {
    const result = await db.delete(contentLibrary).where(eq(contentLibrary.id, id));
    return result.rowCount > 0;
  }

  // Analytics methods
  async getAnalytics(userId: string): Promise<Analytics[]> {
    return await db.select().from(analytics).where(eq(analytics.userId, userId)).orderBy(desc(analytics.recordedAt));
  }

  async getAnalyticsForPost(postId: string): Promise<Analytics[]> {
    return await db.select().from(analytics).where(eq(analytics.postId, postId));
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const [analyticsResult] = await db.insert(analytics).values(insertAnalytics).returning();
    return analyticsResult;
  }

  async getAnalyticsByPlatform(userId: string, platform: string): Promise<Analytics[]> {
    return await db.select().from(analytics)
      .where(and(eq(analytics.userId, userId), eq(analytics.platform, platform)))
      .orderBy(desc(analytics.recordedAt));
  }

  // AI Generation methods
  async getAiGenerations(userId: string): Promise<AiGeneration[]> {
    return await db.select().from(aiGenerations).where(eq(aiGenerations.userId, userId)).orderBy(desc(aiGenerations.createdAt));
  }

  async createAiGeneration(generation: InsertAiGeneration): Promise<AiGeneration> {
    const [aiGeneration] = await db.insert(aiGenerations).values(generation).returning();
    return aiGeneration;
  }
}

export const storage = new DatabaseStorage();
