# Wavelaunch OS

A modern, centralized web platform for managing creators, campaigns, deals, and creative workflows. Built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Overview

Wavelaunch OS replaces ad-hoc spreadsheets and fragmented tools with a unified, secure platform featuring:

- **Authentication & Authorization**: Email/password authentication with role-based access (Admin, Operator, Creator)
- **Dashboard**: Real-time KPIs showing total creators, active campaigns, and open deals
- **Creator Management**: Full CRUD operations with search and filtering capabilities
- **Modern UI**: Built with shadcn-inspired components and Tailwind CSS
- **API-First Design**: RESTful API endpoints with proper validation and error handling
- **Activity Logging**: Automatic tracking of all major actions for audit purposes

## Tech Stack Justification

After evaluating several options, I chose the following stack for Phase 1:

### Core Stack
- **Next.js 14** (App Router): Provides server-side rendering, API routes, and excellent TypeScript support out of the box
- **TypeScript**: Ensures type safety and better developer experience
- **Tailwind CSS**: Rapid UI development with utility-first approach
- **Prisma ORM**: Type-safe database access with excellent migration tooling
- **PostgreSQL**: Robust, production-ready relational database
- **NextAuth.js**: Battle-tested authentication solution with minimal configuration

### Why This Stack?
1. **Next.js 14**: Single framework for both frontend and backend reduces complexity
2. **Prisma**: Intuitive schema definition and automatic migrations
3. **PostgreSQL**: ACID compliance and mature ecosystem (can use SQLite locally if preferred)
4. **TypeScript throughout**: Catch errors at compile time, not runtime
5. **shadcn/ui pattern**: Modern, accessible components without heavy dependencies

This stack prioritizes:
- Developer experience (hot reload, TypeScript, clear patterns)
- Production readiness (well-tested libraries, security best practices)
- Easy handoff (clear file structure, documented code)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **Git** (optional, for version control)

That's it! SQLite is used for local development, so no database server installation needed.

## Quick Start

Follow these steps to get Wavelaunch OS running locally:

### 1. Clone and Install

```bash
# Navigate to the project directory
cd wavelaunch-os

# Install dependencies
npm install
```

### 2. Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env

# The default values work for local development (uses SQLite)
# For PostgreSQL, see docker-compose.yml and update DATABASE_URL
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create tables
npm run migrate

# Seed the database with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
# Start the Next.js development server
npm run dev
```

The application will be available at **http://localhost:3000**

### 5. Sign In

Use these test credentials to sign in:

**Admin Account:**
- Email: `admin@wavelaunch.test`
- Password: `Test1234!`

**Operator Account:**
- Email: `operator@wavelaunch.test`
- Password: `Test1234!`

## Project Structure

```
wavelaunch-os/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── auth/             # NextAuth endpoints
│   │   └── creators/         # Creator CRUD endpoints
│   ├── auth/                 # Authentication pages
│   ├── dashboard/            # Dashboard page
│   ├── creators/             # Creator management
│   ├── campaigns/            # Campaigns (Phase 2)
│   ├── deals/                # Deals (Phase 2)
│   ├── settings/             # Settings (Phase 2)
│   └── layout.tsx            # Root layout with providers
├── components/               # React components
│   ├── ui/                   # Base UI components (Button, Card, etc.)
│   ├── layout/               # Layout components (Header, Sidebar)
│   └── creators/             # Creator-specific components
├── lib/                      # Utility functions and configurations
│   ├── auth/                 # Authentication logic
│   ├── utils/                # Helper utilities
│   └── prisma.ts             # Prisma client singleton
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma         # Database models
│   └── seed.ts               # Seed script
├── public/                   # Static assets
├── scripts/                  # Utility scripts
├── types/                    # TypeScript type definitions
├── docker-compose.yml        # PostgreSQL container config
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

npm run migrate          # Run Prisma migrations
npm run migrate:reset    # Reset database and re-run migrations
npm run db:push          # Push schema changes without migration
npm run db:seed          # Seed database with sample data
npm run prisma:generate  # Generate Prisma Client
npm run prisma:studio    # Open Prisma Studio (database GUI)

npm test                 # Run API tests
```

## Features Implemented (Phase 1)

### ✅ Authentication
- Email/password authentication
- Secure password hashing (bcrypt)
- JWT-based sessions
- Role-based access control (Admin, Operator, Creator)
- Protected routes

### ✅ Dashboard
- KPI cards showing:
  - Total creators and active count
  - Active campaigns count
  - Open deals count
- Recent activity feed
- Clean, modern UI

### ✅ Creator Management
- List view with pagination-ready structure
- Search by name, email, or social handles
- Filter by status (Active, Inactive, Pending, Archived)
- Create new creators with comprehensive form
- Edit existing creators
- Delete creators (with confirmation)
- Track social media handles (Instagram, TikTok, YouTube, Twitter)

### ✅ API Endpoints
- `POST /api/auth/signin` - Sign in
- `GET /api/creators` - List creators (with search/filter)
- `POST /api/creators` - Create creator
- `GET /api/creators/[id]` - Get single creator
- `PUT /api/creators/[id]` - Update creator
- `DELETE /api/creators/[id]` - Delete creator

### ✅ Database
- PostgreSQL with Prisma ORM
- Full schema with migrations
- Seed script with 10 creators, 3 campaigns, 5 deals
- Activity logging system

### ✅ Documentation
- Comprehensive README
- Usage guide
- Phase 1 completion checklist
- Tradeoffs documentation
- Next steps for Phase 2

## Database Schema

The application uses the following core models:

- **User**: Authentication and access control
- **Creator**: Influencers and content creators
- **Campaign**: Marketing campaigns
- **Deal**: Agreements between campaigns and creators
- **Activity**: Audit log for tracking actions

See `prisma/schema.prisma` for full details.

## Environment Variables

Required environment variables (see `.env.example`):

```env
DATABASE_URL="postgresql://wavelaunch:wavelaunch@localhost:5432/wavelaunch_os?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NODE_ENV="development"
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# View logs
docker logs wavelaunch-db

# Restart the database
docker-compose restart
```

### Prisma Issues

```bash
# Regenerate Prisma Client
npm run prisma:generate

# Reset database completely
npm run migrate:reset

# Re-seed
npm run db:seed
```

### Port Already in Use

```bash
# If port 3000 is taken, you can specify a different port:
PORT=3001 npm run dev
```

## Testing

```bash
# Run basic API tests
npm test

# For manual testing:
# 1. Start the dev server
# 2. Sign in with test credentials
# 3. Test creator CRUD operations
# 4. Check dashboard for updated stats
```

## Security Notes

### For Development
- Default credentials are publicly documented (by design for easy testing)
- NEXTAUTH_SECRET should be changed for any non-local environment

### For Production (Phase 3+)
- Change all default passwords
- Use strong NEXTAUTH_SECRET (generate with: `openssl rand -base64 32`)
- Set up environment variables properly
- Enable HTTPS
- Review and harden CORS settings
- Implement rate limiting
- Add input sanitization
- Set up proper backup procedures

## Browser Support

Tested on:
- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+

## Contributing

This is a Phase 1 MVP. Phase 2 will include:
- Full campaign management
- Deal management and tracking
- Enhanced reporting
- Export functionality
- Email notifications
- And more (see NEXT_STEPS.md)

## License

MIT

## Support

For issues or questions:
1. Check USAGE.md for common tasks
2. Review TRADEOFFS.md for known limitations
3. See NEXT_STEPS.md for planned features

---

**Built with ❤️ using Next.js, TypeScript, and Prisma**
