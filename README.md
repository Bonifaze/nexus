# Project Nexus - Social Media Management Platform

Project Nexus is a comprehensive social media management platform that enables users to create, schedule, and publish content across multiple social media platforms from a unified dashboard. The platform features AI-powered content generation, analytics tracking, and team collaboration tools.

## 🚀 Features

### Core Features
- **Multi-Platform Publishing**: Support for Instagram, Facebook, Twitter/X, LinkedIn, and TikTok
- **Content Scheduling**: Calendar-based post scheduling with timezone support
- **AI Content Generation**: Powered by Google Gemini AI for content optimization
- **Analytics Dashboard**: Real-time engagement metrics and performance tracking
- **Content Library**: Centralized media asset management
- **Team Collaboration**: User management and role-based access

### AI-Powered Features
- **Content Generation**: Generate engaging posts based on prompts
- **Hashtag Generation**: Smart hashtag suggestions for increased visibility
- **Content Optimization**: Platform-specific content optimization
- **Sentiment Analysis**: Content sentiment scoring and improvement suggestions
- **Content Ideas**: Topic-based content idea generation

### Technical Features
- **JWT Authentication**: Secure custom authentication system
- **PostgreSQL Database**: Robust data storage with MySQL compatibility
- **Responsive Design**: Modern UI with dark/light mode support
- **Real-time Updates**: Live data synchronization across the platform

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TanStack React Query** for server state management
- **Wouter** for lightweight routing
- **shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** for styling

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **JWT** for authentication
- **bcrypt** for password hashing

### Database
- **PostgreSQL** (primary)
- **MySQL** compatible schema design
- **UUID** primary keys for scalability

### AI Integration
- **Google Gemini AI** (gemini-2.5-flash, gemini-2.5-pro)
- **Content generation and optimization**
- **Image generation capabilities** (gemini-2.0-flash-preview)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+ or MySQL 8+
- Google Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-nexus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables in `.env`:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/project_nexus
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key
   
   # Gemini AI (optional)
   GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Set up the database**
   ```bash
   # For PostgreSQL
   psql $DATABASE_URL -f schema.sql
   
   # Or push schema using Drizzle
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

### Default Login Credentials
- **Email**: `demo@projectnexus.com`
- **Password**: `password123`

## 🗄 Database Setup

### PostgreSQL Setup

1. **Install PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create database and user**
   ```sql
   CREATE DATABASE project_nexus;
   CREATE USER nexus_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE project_nexus TO nexus_user;
   ```

3. **Run the schema**
   ```bash
   psql -d project_nexus -U nexus_user -f schema.sql
   ```

### MySQL Setup

1. **Install MySQL**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server
   
   # macOS
   brew install mysql
   brew services start mysql
   
   # Windows
   # Download from https://dev.mysql.com/downloads/mysql/
   ```

2. **Create database and user**
   ```sql
   CREATE DATABASE project_nexus;
   CREATE USER 'nexus_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON project_nexus.* TO 'nexus_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Convert PostgreSQL schema to MySQL**
   
   The `schema.sql` file includes MySQL-compatible syntax in comments. To use MySQL:
   
   - Replace `UUID` with `CHAR(36)` 
   - Replace `JSONB` with `JSON`
   - Replace `TIMESTAMP WITH TIME ZONE` with `TIMESTAMP`
   - Use `ON UPDATE CURRENT_TIMESTAMP` instead of triggers
   - Add `ENGINE=InnoDB` to table definitions

   Example MySQL table:
   ```sql
   CREATE TABLE users (
       id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
       email VARCHAR(255) UNIQUE NOT NULL,
       password_hash VARCHAR(255) NULL,
       full_name VARCHAR(255) NOT NULL,
       auth_provider VARCHAR(50) NOT NULL DEFAULT 'custom',
       provider_id VARCHAR(255) NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   ) ENGINE=InnoDB;
   ```

### Database Migration

The project uses Drizzle ORM for schema management:

```bash
# Push schema changes to database
npm run db:push

# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate
```

## 🤖 AI Integration Setup

### Getting Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com)
2. Sign in with your Google account
3. Create a new API key
4. Add the key to your `.env` file as `GEMINI_API_KEY`

### AI Features Available

- **Content Generation**: Generate posts based on prompts
- **Hashtag Suggestions**: Smart hashtag recommendations
- **Platform Optimization**: Optimize content for specific platforms
- **Sentiment Analysis**: Analyze content engagement potential
- **Content Ideas**: Generate topic-based content suggestions
- **Image Generation**: Create images for posts (requires specific Gemini model)

### API Endpoints

```typescript
// Generate content
POST /api/ai/generate-content
Body: { prompt: string }

// Generate hashtags
POST /api/ai/generate-hashtags
Body: { content: string }

// Optimize content for platform
POST /api/ai/optimize-content
Body: { content: string, platform: string }

// Analyze sentiment
POST /api/ai/analyze-sentiment
Body: { content: string }

// Generate content ideas
POST /api/ai/generate-ideas
Body: { topic: string, platform: string }

// Get AI generation history
GET /api/ai/generations
```

## 🏗 Project Structure

```
project-nexus/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── contexts/       # React contexts
│   └── index.html
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database layer
│   ├── gemini.ts          # AI integration
│   └── vite.ts            # Vite integration
├── shared/                 # Shared TypeScript types
│   └── schema.ts          # Database schema & validation
├── schema.sql             # Database schema
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL/MySQL connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `GEMINI_API_KEY` | Google Gemini AI API key | No | - |
| `NODE_ENV` | Environment mode | No | development |
| `PORT` | Server port | No | 5000 |

### Drizzle Configuration

The project uses Drizzle ORM with the following configuration in `drizzle.config.ts`:

```typescript
export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg", // or "mysql2" for MySQL
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

## 🚀 Deployment

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure `JWT_SECRET`
4. Configure reverse proxy (nginx/Apache)
5. Set up SSL certificates
6. Configure monitoring and logging

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

### Database Considerations

- Use connection pooling in production
- Set up database backups
- Configure read replicas for scaling
- Monitor query performance
- Use environment-specific migrations

## 📊 Database Schema

### Core Tables

- **users**: User accounts and authentication
- **social_profiles**: Connected social media accounts
- **posts**: Content to be published
- **content_library**: Media file storage
- **analytics**: Performance metrics
- **ai_generations**: AI-generated content history

### Key Features

- **UUID Primary Keys**: Scalable and secure identifiers
- **Foreign Key Constraints**: Data integrity and relationships
- **JSON Columns**: Flexible data storage for arrays and objects
- **Indexes**: Optimized query performance
- **Triggers**: Automatic timestamp updates

### Schema Compatibility

The schema is designed to work with both PostgreSQL and MySQL:
- PostgreSQL-native features (JSONB, UUID, timezone-aware timestamps)
- MySQL compatibility comments throughout the schema
- Migration guide for switching between databases

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full application flow testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure database migrations are reversible

## 📝 API Documentation

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Core Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Posts
- `GET /api/posts` - Get user posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/recent` - Get recent posts

#### Social Profiles
- `GET /api/social-profiles` - Get connected profiles
- `POST /api/social-profiles` - Connect new profile
- `PUT /api/social-profiles/:id` - Update profile
- `DELETE /api/social-profiles/:id` - Disconnect profile

#### Analytics
- `GET /api/analytics` - Get analytics data
- `GET /api/analytics/platform/:platform` - Platform-specific analytics

#### AI Features
- `POST /api/ai/generate-content` - Generate content
- `POST /api/ai/generate-hashtags` - Generate hashtags
- `POST /api/ai/optimize-content` - Optimize content
- `POST /api/ai/analyze-sentiment` - Analyze sentiment
- `POST /api/ai/generate-ideas` - Generate content ideas

## 🛡 Security

### Authentication Security
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with configurable expiration
- Secure token storage recommendations
- Environment-based secrets management

### Database Security
- Parameterized queries (SQL injection protection)
- Foreign key constraints for data integrity
- UUID primary keys (no sequential ID exposure)
- Connection string security best practices

### API Security
- Input validation with Zod schemas
- Rate limiting recommendations
- CORS configuration
- Request body size limits

## 📈 Performance

### Database Optimization
- Proper indexing on frequently queried columns
- Connection pooling for concurrent requests
- Query optimization with Drizzle ORM
- Database-specific optimizations

### Frontend Optimization
- React Query for efficient data fetching
- Component lazy loading
- Bundle optimization with Vite
- Image optimization recommendations

### Caching Strategy
- Client-side caching with React Query
- Database query result caching
- Static asset caching
- CDN recommendations for media files

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify DATABASE_URL format
- Check database server status
- Confirm user permissions
- Test connection outside the application

**AI Features Not Working**
- Verify GEMINI_API_KEY is set
- Check API key permissions
- Monitor API usage limits
- Review error logs for specific issues

**Authentication Issues**
- Verify JWT_SECRET is set
- Check token expiration settings
- Confirm password hashing compatibility
- Review client-side token storage

**Build Errors**
- Clear node_modules and reinstall
- Check TypeScript configuration
- Verify all environment variables
- Review import statements

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check existing documentation
- Review troubleshooting guide
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern React and Node.js technologies
- Powered by Google Gemini AI for intelligent features
- UI components from shadcn/ui and Radix UI
- Database management with Drizzle ORM
- Icons from Lucide React