# Wavelaunch OS - Usage Guide

This guide covers common tasks and workflows in Wavelaunch OS.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Managing Creators](#managing-creators)
4. [Dashboard Overview](#dashboard-overview)
5. [Database Management](#database-management)
6. [Common Tasks](#common-tasks)

---

## Getting Started

### First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL
docker-compose up -d

# 3. Set up database
npm run prisma:generate
npm run migrate
npm run db:seed

# 4. Start the app
npm run dev
```

Visit http://localhost:3000 and sign in with:
- Email: `admin@wavelaunch.test`
- Password: `Test1234!`

---

## Authentication

### Sign In

1. Navigate to http://localhost:3000
2. You'll be redirected to the sign-in page
3. Enter your credentials
4. Click "Sign In"

### Default User Accounts

After running `npm run db:seed`, you'll have:

**Admin User:**
- Email: admin@wavelaunch.test
- Password: Test1234!
- Role: ADMIN (full access)

**Operator User:**
- Email: operator@wavelaunch.test
- Password: Test1234!
- Role: OPERATOR (manage creators, campaigns, deals)

### Creating New Users

Currently, new users must be added directly to the database. In Phase 2, we'll add a user management UI.

```bash
# Open Prisma Studio
npm run prisma:studio

# Navigate to the User model and add a new record
# Make sure to hash the password using bcrypt
```

### Sign Out

Click the "Sign Out" button in the top-right corner of the header.

---

## Managing Creators

### Viewing Creators

1. Sign in to the application
2. Click "Creators" in the left sidebar
3. You'll see a list of all creators with:
   - Name and email
   - Social media handles
   - Status badge
   - Number of deals
   - Owner information

### Creating a New Creator

1. Go to the Creators page
2. Click "+ Create Creator" button
3. Fill in the form:
   - **Name** (required): Creator's full name
   - **Email** (optional): Contact email
   - **Phone** (optional): Contact phone number
   - **Status**: Active, Inactive, Pending, or Archived
   - **Social Handles**: Instagram, TikTok, YouTube, Twitter
   - **Notes**: Additional information or context
4. Click "Create Creator"

### Editing a Creator

1. Go to the Creators page
2. Find the creator you want to edit
3. Click the "Edit" button in their row
4. Update the form fields
5. Click "Update Creator"

### Deleting a Creator

1. Go to the Creators page
2. Find the creator you want to delete
3. Click the "Delete" button
4. Confirm the deletion in the popup

⚠️ **Warning**: Deleting a creator will also delete all associated deals due to cascade delete constraints.

### Searching Creators

Use the search box at the top of the Creators page to search by:
- Name
- Email
- Instagram handle
- TikTok handle

The search is case-insensitive and updates as you type.

### Filtering by Status

Use the status dropdown to filter creators:
- **All Statuses**: Show all creators
- **Active**: Currently active creators
- **Inactive**: Inactive creators
- **Pending**: Creators pending approval or contract
- **Archived**: Archived creators

---

## Dashboard Overview

### KPI Cards

The dashboard displays three key metrics:

1. **Total Creators**: Total number of creators with active count
2. **Active Campaigns**: Number of active campaigns and total
3. **Open Deals**: Number of pending/negotiating deals and total

### Recent Activity

Shows the 10 most recent actions in the system:
- Who performed the action
- What entity was affected (creator, campaign, deal)
- When it occurred
- Additional details

---

## Database Management

### Viewing Data with Prisma Studio

Prisma Studio provides a GUI for viewing and editing database records:

```bash
npm run prisma:studio
```

This opens a browser at http://localhost:5555 where you can:
- View all tables
- Edit records
- Create new records
- Delete records
- Run queries

### Resetting the Database

If you need to start fresh:

```bash
# This will drop all tables, run migrations, and re-seed
npm run migrate:reset
```

### Running Migrations

After modifying `prisma/schema.prisma`:

```bash
# Create and run a new migration
npm run migrate
```

### Seeding the Database

To add sample data:

```bash
npm run db:seed
```

This creates:
- 2 users (admin and operator)
- 10 sample creators
- 3 sample campaigns
- 5 sample deals
- Activity logs

### Database Backup

To backup your PostgreSQL database:

```bash
# Backup
docker exec wavelaunch-db pg_dump -U wavelaunch wavelaunch_os > backup.sql

# Restore
docker exec -i wavelaunch-db psql -U wavelaunch wavelaunch_os < backup.sql
```

---

## Common Tasks

### Changing Your Password

Currently, passwords must be changed via Prisma Studio:

1. Run `npm run prisma:studio`
2. Go to the User table
3. Find your user
4. Hash your new password using bcrypt (strength 10)
5. Update the `passwordHash` field

In Phase 2, we'll add a password change UI.

### Checking Application Logs

```bash
# View Next.js dev server logs (in terminal where npm run dev is running)

# View PostgreSQL logs
docker logs wavelaunch-db

# View PostgreSQL logs (follow)
docker logs -f wavelaunch-db
```

### Stopping the Application

```bash
# Stop the Next.js dev server
# Press Ctrl+C in the terminal where it's running

# Stop PostgreSQL
docker-compose down

# Stop PostgreSQL and remove data
docker-compose down -v
```

### Updating Dependencies

```bash
# Update all dependencies to latest compatible versions
npm update

# Update to latest versions (may have breaking changes)
npm install <package>@latest
```

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Environment-Specific Configuration

Create environment-specific `.env` files:

```bash
.env.development  # Development settings
.env.production   # Production settings
.env.test         # Test settings
```

---

## Troubleshooting

### "Database not found" Error

```bash
# Restart PostgreSQL
docker-compose restart

# Or recreate from scratch
docker-compose down -v
docker-compose up -d
npm run migrate
npm run db:seed
```

### "Prisma Client not generated" Error

```bash
npm run prisma:generate
```

### Port 3000 Already in Use

```bash
# Use a different port
PORT=3001 npm run dev
```

### Port 5432 Already in Use

If you have PostgreSQL running locally, either:
1. Stop your local PostgreSQL
2. Or change the port in `docker-compose.yml`:
   ```yaml
   ports:
     - "5433:5432"  # Use 5433 on host
   ```
   Then update `DATABASE_URL` in `.env` to use port 5433.

---

## Tips and Best Practices

1. **Always seed after reset**: Run `npm run db:seed` after `npm run migrate:reset`
2. **Use Prisma Studio for debugging**: Great for inspecting database state
3. **Check the browser console**: Useful for debugging API errors
4. **Review activity logs**: Check the dashboard for recent actions
5. **Keep your dependencies updated**: Run `npm update` regularly

---

## API Usage

If you want to interact with the API directly:

### Authentication

All API endpoints (except auth) require authentication via NextAuth session.

### Example: List Creators

```bash
# You need to be authenticated (use browser session or implement token auth)
curl http://localhost:3000/api/creators
```

### Example: Create Creator

```bash
curl -X POST http://localhost:3000/api/creators \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Creator",
    "email": "creator@example.com",
    "status": "ACTIVE",
    "instagramHandle": "@newcreator"
  }'
```

---

## Next Steps

- See `NEXT_STEPS.md` for planned Phase 2 features
- See `TRADEOFFS.md` for known limitations
- See `README.md` for setup instructions

---

**Need Help?**

1. Check this guide for common tasks
2. Review `README.md` for setup issues
3. Check `TRADEOFFS.md` for known limitations
