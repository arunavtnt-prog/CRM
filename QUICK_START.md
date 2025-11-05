# Wavelaunch OS - Quick Start Guide

## TL;DR - Get Running in 5 Minutes

```bash
# 1. Navigate to project
cd wavelaunch-os

# 2. Install dependencies
npm install

# 3. Generate Prisma Client (may require internet connection)
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Seed database
npm run db:seed

# 6. Start dev server
npm run dev
```

Visit http://localhost:3000 and sign in with:
- **Email**: `admin@wavelaunch.test`
- **Password**: `Test1234!`

## What You Get

✅ **Authentication** - Email/password with role-based access
✅ **Dashboard** - KPI cards and activity feed
✅ **Creator Management** - Full CRUD with search/filter
✅ **Modern UI** - shadcn-style components
✅ **API Endpoints** - RESTful API for all operations
✅ **SQLite Database** - Zero infrastructure, ready to go

## Key Files

- `app/` - Next.js pages and API routes
- `components/` - React components
- `prisma/schema.prisma` - Database models
- `.env` - Environment configuration
- `README.md` - Full documentation

## Common Commands

```bash
npm run dev              # Start development server
npm run prisma:studio    # Open database GUI
npm run migrate          # Run database migrations
npm run db:seed          # Seed sample data
npm test                 # Run API tests
```

## Next Steps

1. ✅ Sign in and explore the dashboard
2. ✅ Create/edit/delete creators
3. ✅ Try search and filter
4. ✅ Check Prisma Studio (`npm run prisma:studio`)
5. 📖 Read `USAGE.md` for detailed workflows
6. 📖 Read `NEXT_STEPS.md` for Phase 2 features

## Troubleshooting

### Prisma Generate Fails

```bash
# Set environment variable to skip checksum
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

### Database Locked

```bash
# Reset database
npx prisma migrate reset
```

### Port 3000 Taken

```bash
PORT=3001 npm run dev
```

## For Production

See `TRADEOFFS.md` section on migrating from SQLite to PostgreSQL before deploying to production.

---

**Phase 1 Complete!** 🎉

For full documentation, see `README.md`.
