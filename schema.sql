-- Project Nexus Database Schema
-- PostgreSQL Database Schema with MySQL compatibility comments
-- This schema is designed to work with PostgreSQL but includes MySQL equivalent syntax in comments

-- Enable UUID extension for PostgreSQL
-- MySQL equivalent: Use CHAR(36) for UUID fields
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - Core user information
-- Supports both custom auth (email/password) and social OAuth
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- MySQL: id CHAR(36) PRIMARY KEY DEFAULT (UUID())
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NULL, -- NULL for social auth users
    full_name VARCHAR(255) NOT NULL,
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'custom', -- 'custom', 'google', 'facebook', etc.
    provider_id VARCHAR(255) NULL, -- External provider user ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- MySQL: Use TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index for fast email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(auth_provider, provider_id);

-- Social Profiles table - Links social media accounts to users
-- Stores encrypted access tokens and connection status
CREATE TABLE social_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- MySQL: id CHAR(36) PRIMARY KEY DEFAULT (UUID())
    user_id UUID NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'
    username VARCHAR(255) NOT NULL,
    access_token TEXT NULL, -- Encrypted in application layer
    refresh_token TEXT NULL, -- Encrypted in application layer
    token_expires_at TIMESTAMP WITH TIME ZONE NULL,
    is_connected INTEGER DEFAULT 1 NOT NULL, -- 1 = connected, 0 = disconnected
    followers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    -- MySQL: CONSTRAINT fk_social_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for social profiles
CREATE INDEX idx_social_profiles_user_id ON social_profiles(user_id);
CREATE INDEX idx_social_profiles_platform ON social_profiles(platform);
CREATE UNIQUE INDEX idx_social_profiles_user_platform ON social_profiles(user_id, platform);

-- Posts table - Stores content to be published across platforms
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- MySQL: id CHAR(36) PRIMARY KEY DEFAULT (UUID())
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]'::jsonb, -- Array of media file URLs
    -- MySQL: media_urls JSON DEFAULT ('[]')
    platforms JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of target platforms
    -- MySQL: platforms JSON NOT NULL DEFAULT ('[]')
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'failed'
    scheduled_at TIMESTAMP WITH TIME ZONE NULL,
    published_at TIMESTAMP WITH TIME ZONE NULL,
    error_message TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    -- MySQL: CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for posts
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Content Library table - Media file storage and organization
CREATE TABLE content_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- MySQL: id CHAR(36) PRIMARY KEY DEFAULT (UUID())
    user_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'document'
    file_size INTEGER NOT NULL, -- Size in bytes
    tags JSONB DEFAULT '[]'::jsonb, -- Array of tags for organization
    -- MySQL: tags JSON DEFAULT ('[]')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    -- MySQL: CONSTRAINT fk_content_library_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for content library
CREATE INDEX idx_content_library_user_id ON content_library(user_id);
CREATE INDEX idx_content_library_file_type ON content_library(file_type);
CREATE INDEX idx_content_library_created_at ON content_library(created_at DESC);

-- Analytics table - Performance tracking and engagement metrics
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- MySQL: id CHAR(36) PRIMARY KEY DEFAULT (UUID())
    user_id UUID NOT NULL,
    post_id UUID NULL, -- NULL for general platform analytics
    platform VARCHAR(50) NOT NULL,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    engagement_rate INTEGER DEFAULT 0, -- Stored as percentage * 100 (e.g., 1485 = 14.85%)
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    -- MySQL: 
    -- CONSTRAINT fk_analytics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    -- CONSTRAINT fk_analytics_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Indexes for analytics
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_post_id ON analytics(post_id);
CREATE INDEX idx_analytics_platform ON analytics(platform);
CREATE INDEX idx_analytics_recorded_at ON analytics(recorded_at DESC);

-- AI Generations table - Track Gemini AI generated content
CREATE TABLE ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- MySQL: id CHAR(36) PRIMARY KEY DEFAULT (UUID())
    user_id UUID NOT NULL,
    generation_type VARCHAR(50) NOT NULL, -- 'content', 'image', 'hashtags', 'caption'
    prompt TEXT NOT NULL,
    generated_content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional generation metadata
    -- MySQL: metadata JSON DEFAULT ('{}')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    -- MySQL: CONSTRAINT fk_ai_generations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for AI generations
CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX idx_ai_generations_type ON ai_generations(generation_type);
CREATE INDEX idx_ai_generations_created_at ON ai_generations(created_at DESC);

-- Update triggers for PostgreSQL (MySQL uses ON UPDATE CURRENT_TIMESTAMP)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_profiles_updated_at BEFORE UPDATE ON social_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_library_updated_at BEFORE UPDATE ON content_library 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- MySQL Alternative Trigger Syntax (commented out):
-- CREATE TRIGGER update_users_updated_at 
--     BEFORE UPDATE ON users 
--     FOR EACH ROW SET NEW.updated_at = CURRENT_TIMESTAMP;

-- Insert sample data for development
-- First, create a demo user with a known UUID
WITH demo_user AS (
    INSERT INTO users (id, email, password_hash, full_name, auth_provider) VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440000'::uuid,
        'demo@projectnexus.com',
        '$2b$10$8K1p/a0dK.6liKGgQxHCOOigLsNFwvqvY9nT.Rg1sS.Cxne5e.IFW', -- password123
        'Demo User',
        'custom'
    )
    RETURNING id
)

-- Sample social profiles
INSERT INTO social_profiles (id, user_id, platform, username, access_token, refresh_token, token_expires_at, is_connected, followers)
SELECT 
    profiles.id::uuid,
    demo_user.id,
    profiles.platform,
    profiles.username,
    profiles.access_token,
    profiles.refresh_token,
    profiles.token_expires_at,
    profiles.is_connected,
    profiles.followers
FROM demo_user, (VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'instagram', '@brandname', 'mock-instagram-token', 'mock-instagram-refresh', CURRENT_TIMESTAMP + INTERVAL '1 hour', 1, 12500),
    ('550e8400-e29b-41d4-a716-446655440002', 'facebook', 'Brand Page', 'mock-facebook-token', 'mock-facebook-refresh', CURRENT_TIMESTAMP + INTERVAL '1 hour', 1, 8200),
    ('550e8400-e29b-41d4-a716-446655440003', 'twitter', '@company', NULL, NULL, NULL, 0, 5800),
    ('550e8400-e29b-41d4-a716-446655440004', 'linkedin', 'Company LinkedIn', 'mock-linkedin-token', 'mock-linkedin-refresh', CURRENT_TIMESTAMP + INTERVAL '1 hour', 1, 6400)
) AS profiles(id, platform, username, access_token, refresh_token, token_expires_at, is_connected, followers);

-- Sample posts
INSERT INTO posts (id, user_id, content, media_urls, platforms, status, scheduled_at, published_at) VALUES
(
    '550e8400-e29b-41d4-a716-446655440010'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '🚀 Excited to share our latest product update! New features that will revolutionize your workflow. Stay tuned for more details! #ProductUpdate #Innovation #TechNews',
    '[]'::jsonb,
    '["instagram", "facebook", "linkedin"]'::jsonb,
    'published',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
),
(
    '550e8400-e29b-41d4-a716-446655440011'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Team collaboration is the key to success! Here''s how we''ve improved our processes to deliver better results for our clients. What strategies work best for your team? #Teamwork #Productivity #Business',
    '[]'::jsonb,
    '["linkedin", "facebook"]'::jsonb,
    'scheduled',
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    NULL
);

-- Sample analytics
INSERT INTO analytics (id, user_id, post_id, platform, likes, comments, shares, views, engagement_rate) VALUES
('550e8400-e29b-41d4-a716-446655440020'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid, 'instagram', 245, 18, 12, 1850, 1485),
('550e8400-e29b-41d4-a716-446655440021'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid, 'facebook', 156, 24, 8, 1200, 1567);

-- MySQL Conversion Notes:
-- 1. Replace UUID with CHAR(36) and uuid_generate_v4() with UUID()
-- 2. Replace JSONB with JSON
-- 3. Replace TIMESTAMP WITH TIME ZONE with TIMESTAMP
-- 4. Use ON UPDATE CURRENT_TIMESTAMP instead of triggers
-- 5. Replace TEXT with LONGTEXT for large content
-- 6. Add ENGINE=InnoDB for tables
-- 7. Use AUTO_INCREMENT for ID columns if not using UUIDs

-- Example MySQL table creation:
-- CREATE TABLE users (
--     id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NULL,
--     full_name VARCHAR(255) NOT NULL,
--     auth_provider VARCHAR(50) NOT NULL DEFAULT 'custom',
--     provider_id VARCHAR(255) NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB;