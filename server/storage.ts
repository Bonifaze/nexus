import { 
  type User, 
  type InsertUser, 
  type SocialProfile, 
  type InsertSocialProfile,
  type Post,
  type InsertPost,
  type ContentLibraryItem,
  type InsertContentLibraryItem,
  type Analytics,
  type InsertAnalytics
} from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private socialProfiles: Map<string, SocialProfile> = new Map();
  private posts: Map<string, Post> = new Map();
  private contentLibrary: Map<string, ContentLibraryItem> = new Map();
  private analytics: Map<string, Analytics> = new Map();

  constructor() {
    this.seedData();
  }

  private async seedData() {
    // Create a demo user
    const hashedPassword = await bcrypt.hash("password123", 10);
    const demoUser: User = {
      id: "demo-user-id",
      email: "demo@projectnexus.com",
      password: hashedPassword,
      fullName: "Demo User",
      authProvider: "custom",
      providerId: null,
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);

    // Create demo social profiles
    const instagramProfile: SocialProfile = {
      id: "instagram-profile",
      userId: demoUser.id,
      platform: "instagram",
      username: "@brandname",
      accessToken: "mock-instagram-token",
      refreshToken: "mock-instagram-refresh",
      tokenExpiresAt: new Date(Date.now() + 3600000),
      isConnected: 1,
      followers: 12500,
      createdAt: new Date(),
    };

    const facebookProfile: SocialProfile = {
      id: "facebook-profile", 
      userId: demoUser.id,
      platform: "facebook",
      username: "Brand Page",
      accessToken: "mock-facebook-token",
      refreshToken: "mock-facebook-refresh", 
      tokenExpiresAt: new Date(Date.now() + 3600000),
      isConnected: 1,
      followers: 8200,
      createdAt: new Date(),
    };

    const twitterProfile: SocialProfile = {
      id: "twitter-profile",
      userId: demoUser.id,
      platform: "twitter", 
      username: "@company",
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      isConnected: 0,
      followers: 5800,
      createdAt: new Date(),
    };

    const linkedinProfile: SocialProfile = {
      id: "linkedin-profile",
      userId: demoUser.id,
      platform: "linkedin",
      username: "Company LinkedIn",
      accessToken: "mock-linkedin-token", 
      refreshToken: "mock-linkedin-refresh",
      tokenExpiresAt: new Date(Date.now() + 3600000),
      isConnected: 1,
      followers: 6400,
      createdAt: new Date(),
    };

    this.socialProfiles.set(instagramProfile.id, instagramProfile);
    this.socialProfiles.set(facebookProfile.id, facebookProfile);
    this.socialProfiles.set(twitterProfile.id, twitterProfile);
    this.socialProfiles.set(linkedinProfile.id, linkedinProfile);

    // Create demo posts
    const publishedPost: Post = {
      id: "published-post-1",
      userId: demoUser.id,
      content: "🚀 Excited to share our latest product update! New features that will revolutionize your workflow. Stay tuned for more details! #ProductUpdate #Innovation #TechNews",
      mediaUrls: [],
      platforms: ["instagram", "facebook", "linkedin"],
      status: "published",
      scheduledAt: null,
      publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
      errorMessage: null,
      createdAt: new Date(Date.now() - 7200000),
    };

    const scheduledPost: Post = {
      id: "scheduled-post-1",
      userId: demoUser.id,
      content: "Team collaboration is the key to success! Here's how we've improved our processes to deliver better results for our clients. What strategies work best for your team? #Teamwork #Productivity #Business",
      mediaUrls: [],
      platforms: ["linkedin", "facebook"],
      status: "scheduled",
      scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
      publishedAt: null,
      errorMessage: null,
      createdAt: new Date(),
    };

    this.posts.set(publishedPost.id, publishedPost);
    this.posts.set(scheduledPost.id, scheduledPost);

    // Create demo analytics
    const instagramAnalytics: Analytics = {
      id: "analytics-1",
      userId: demoUser.id,
      postId: publishedPost.id,
      platform: "instagram",
      likes: 245,
      comments: 18,
      shares: 12,
      views: 1850,
      engagementRate: 1485, // 14.85% stored as 1485
      recordedAt: new Date(),
    };

    const facebookAnalytics: Analytics = {
      id: "analytics-2", 
      userId: demoUser.id,
      postId: publishedPost.id,
      platform: "facebook",
      likes: 156,
      comments: 24,
      shares: 8,
      views: 1200,
      engagementRate: 1567, // 15.67%
      recordedAt: new Date(),
    };

    this.analytics.set(instagramAnalytics.id, instagramAnalytics);
    this.analytics.set(facebookAnalytics.id, facebookAnalytics);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = insertUser.password ? await bcrypt.hash(insertUser.password, 10) : null;
    const user: User = { 
      ...insertUser, 
      id,
      password: hashedPassword,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getSocialProfiles(userId: string): Promise<SocialProfile[]> {
    return Array.from(this.socialProfiles.values()).filter(profile => profile.userId === userId);
  }

  async getSocialProfile(id: string): Promise<SocialProfile | undefined> {
    return this.socialProfiles.get(id);
  }

  async createSocialProfile(insertProfile: InsertSocialProfile): Promise<SocialProfile> {
    const id = randomUUID();
    const profile: SocialProfile = {
      ...insertProfile,
      id,
      createdAt: new Date()
    };
    this.socialProfiles.set(id, profile);
    return profile;
  }

  async updateSocialProfile(id: string, updates: Partial<SocialProfile>): Promise<SocialProfile | undefined> {
    const existing = this.socialProfiles.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.socialProfiles.set(id, updated);
    return updated;
  }

  async deleteSocialProfile(id: string): Promise<boolean> {
    return this.socialProfiles.delete(id);
  }

  async getPosts(userId: string): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(post => post.userId === userId);
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...insertPost,
      id,
      publishedAt: null,
      createdAt: new Date()
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const existing = this.posts.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.posts.set(id, updated);
    return updated;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  async getScheduledPosts(userId: string): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      post => post.userId === userId && post.status === "scheduled"
    );
  }

  async getRecentPosts(userId: string, limit = 10): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getContentLibrary(userId: string): Promise<ContentLibraryItem[]> {
    return Array.from(this.contentLibrary.values()).filter(item => item.userId === userId);
  }

  async getContentLibraryItem(id: string): Promise<ContentLibraryItem | undefined> {
    return this.contentLibrary.get(id);
  }

  async createContentLibraryItem(insertItem: InsertContentLibraryItem): Promise<ContentLibraryItem> {
    const id = randomUUID();
    const item: ContentLibraryItem = {
      ...insertItem,
      id,
      createdAt: new Date()
    };
    this.contentLibrary.set(id, item);
    return item;
  }

  async deleteContentLibraryItem(id: string): Promise<boolean> {
    return this.contentLibrary.delete(id);
  }

  async getAnalytics(userId: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(analytics => analytics.userId === userId);
  }

  async getAnalyticsForPost(postId: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(analytics => analytics.postId === postId);
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const analytics: Analytics = {
      ...insertAnalytics,
      id,
      recordedAt: new Date()
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async getAnalyticsByPlatform(userId: string, platform: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      analytics => analytics.userId === userId && analytics.platform === platform
    );
  }
}

export const storage = new MemStorage();
