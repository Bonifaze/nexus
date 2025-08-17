import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { 
  registerSchema, 
  loginSchema, 
  insertPostSchema, 
  insertSocialProfileSchema 
} from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const user = await storage.createUser({
        email: validatedData.email,
        password: validatedData.password,
        fullName: validatedData.fullName,
        authProvider: "custom",
        providerId: null,
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.fullName,
      }
    });
  });

  // Social Profiles routes
  app.get("/api/social-profiles", authenticateToken, async (req: any, res) => {
    try {
      const profiles = await storage.getSocialProfiles(req.user.id);
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social profiles" });
    }
  });

  app.post("/api/social-profiles", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertSocialProfileSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      const profile = await storage.createSocialProfile(validatedData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create social profile" });
    }
  });

  app.put("/api/social-profiles/:id", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const profile = await storage.updateSocialProfile(id, req.body);
      
      if (!profile) {
        return res.status(404).json({ message: "Social profile not found" });
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update social profile" });
    }
  });

  app.delete("/api/social-profiles/:id", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSocialProfile(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Social profile not found" });
      }

      res.json({ message: "Social profile deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete social profile" });
    }
  });

  // Posts routes
  app.get("/api/posts", authenticateToken, async (req: any, res) => {
    try {
      const posts = await storage.getPosts(req.user.id);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/recent", authenticateToken, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const posts = await storage.getRecentPosts(req.user.id, limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent posts" });
    }
  });

  app.get("/api/posts/scheduled", authenticateToken, async (req: any, res) => {
    try {
      const posts = await storage.getScheduledPosts(req.user.id);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scheduled posts" });
    }
  });

  app.post("/api/posts", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertPostSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // If no scheduled time, mark as published immediately
      if (!validatedData.scheduledAt) {
        validatedData.status = "published";
      }

      const post = await storage.createPost(validatedData);

      // If published immediately, update publishedAt timestamp
      if (post.status === "published") {
        await storage.updatePost(post.id, { publishedAt: new Date() });
      }

      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.put("/api/posts/:id", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const post = await storage.updatePost(id, req.body);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePost(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Content Library routes
  app.get("/api/content-library", authenticateToken, async (req: any, res) => {
    try {
      const items = await storage.getContentLibrary(req.user.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content library" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", authenticateToken, async (req: any, res) => {
    try {
      const analytics = await storage.getAnalytics(req.user.id);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/platform/:platform", authenticateToken, async (req: any, res) => {
    try {
      const { platform } = req.params;
      const analytics = await storage.getAnalyticsByPlatform(req.user.id, platform);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platform analytics" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", authenticateToken, async (req: any, res) => {
    try {
      const posts = await storage.getPosts(req.user.id);
      const scheduledPosts = posts.filter(p => p.status === "scheduled");
      const profiles = await storage.getSocialProfiles(req.user.id);
      const analytics = await storage.getAnalytics(req.user.id);

      // Calculate total followers
      const totalFollowers = profiles.reduce((sum, profile) => sum + (profile.followers || 0), 0);

      // Calculate average engagement rate
      const avgEngagement = analytics.length > 0 
        ? analytics.reduce((sum, a) => sum + a.engagementRate, 0) / analytics.length / 100 
        : 0;

      const stats = {
        totalPosts: posts.length,
        scheduled: scheduledPosts.length,
        engagement: Math.round(avgEngagement * 10) / 10, // Round to 1 decimal
        followers: totalFollowers > 1000 ? `${Math.round(totalFollowers / 100) / 10}K` : totalFollowers.toString()
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
