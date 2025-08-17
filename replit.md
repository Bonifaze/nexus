# Project Nexus - Social Media Management Platform

## Overview

Project Nexus is a comprehensive social media management platform that allows users to create, schedule, and publish content across multiple social media platforms from a unified dashboard. The application provides features for content creation, scheduling, analytics tracking, and social account management. Built with a modern full-stack architecture, it uses React with TypeScript for the frontend, Express.js for the backend, and PostgreSQL with Drizzle ORM for data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for development tooling
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Context-based auth system with JWT token management
- **Form Handling**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Custom JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API structure with organized route handlers
- **Development**: Hot reloading with Vite integration for seamless development

### Database Design
- **Database**: PostgreSQL with UUID primary keys
- **Schema Management**: Drizzle migrations with automated schema generation
- **Key Tables**:
  - Users: Core user information with support for custom and social OAuth
  - Social Profiles: Connected social media accounts with encrypted tokens
  - Posts: Content management with scheduling and multi-platform publishing
  - Content Library: Media file storage and organization
  - Analytics: Performance tracking and engagement metrics

### Authentication System
- **Primary Method**: Custom email/password authentication
- **Token Management**: JWT tokens with refresh capability
- **Security**: Bcrypt password hashing and secure token storage
- **Protected Routes**: Client-side route protection with automatic redirects

### Content Management
- **Post Creation**: Rich text editor with multi-platform publishing
- **Scheduling**: Calendar-based post scheduling with timezone support
- **Media Handling**: File upload and content library management
- **Platform Integration**: Support for Instagram, Facebook, Twitter/X, and LinkedIn

### Data Storage Strategy
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations
- **Schema**: UUID primary keys with foreign key constraints for data integrity
- **Compatibility**: MySQL-compatible schema design with conversion notes
- **Caching**: React Query for client-side caching and offline support
- **Connection**: Neon serverless PostgreSQL with connection pooling

## External Dependencies

### Database Services
- **PostgreSQL**: Primary database (configured via DATABASE_URL environment variable)
- **Neon Database**: Serverless PostgreSQL provider integration (@neondatabase/serverless)

### UI/UX Dependencies
- **Radix UI**: Comprehensive component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Font Integration**: Google Fonts (Inter, Geist Mono) for typography

### Development Tools
- **Vite**: Build tool with hot module replacement
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundling for production builds
- **Drizzle Kit**: Database migration and schema management

### Authentication & Security
- **bcrypt**: Password hashing library
- **jsonwebtoken**: JWT token generation and verification
- **Zod**: Schema validation for API endpoints and forms

### State Management & API
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Wouter**: Lightweight routing solution

### Planned Social Media Integrations
- **Instagram API**: Content publishing and analytics
- **Facebook Graph API**: Page management and posting
- **Twitter/X API**: Tweet publishing and engagement tracking
- **LinkedIn API**: Professional content distribution