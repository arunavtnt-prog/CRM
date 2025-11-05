# Wavelaunch OS - Data Model Documentation

This document describes the database schema, relationships, and data flow for Wavelaunch OS.

## Overview

Wavelaunch OS uses a relational database structure with 5 core models that work together to manage creators, campaigns, deals, and user activities.

## Entity Relationship Diagram

```
┌─────────────┐           ┌──────────────┐           ┌─────────────┐
│    User     │──────────→│   Creator    │──────────→│    Deal     │
│             │  owns     │              │  has      │             │
│  - id       │           │  - id        │           │  - id       │
│  - email    │           │  - name      │           │  - value    │
│  - role     │           │  - social... │           │  - status   │
└─────────────┘           └──────────────┘           └─────────────┘
      │                                                      │
      │ creates                                    connects  │
      ↓                                                      ↓
┌─────────────┐                                    ┌─────────────┐
│  Activity   │                                    │  Campaign   │
│             │                                    │             │
│  - id       │                                    │  - id       │
│  - action   │                                    │  - title    │
│  - entity   │                                    │  - brand    │
└─────────────┘                                    │  - budget   │
                                                   └─────────────┘
```

## Data Models

### 1. User

Represents authenticated users of the system.

**Fields:**
- `id` (String, Primary Key): Unique identifier
- `email` (String, Unique): User email address
- `name` (String, Optional): User's full name
- `passwordHash` (String): Bcrypt hashed password
- `role` (Enum): User role (ADMIN, OPERATOR, CREATOR)
- `createdAt` (DateTime): When user was created
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- One user can own many Creators (`ownedCreators`)
- One user can create many Activities (`activities`)

**Roles:**
- `ADMIN`: Full system access (all CRUD operations)
- `OPERATOR`: Can manage creators, campaigns, and deals
- `CREATOR`: Limited access to own data only

**Indexes:**
- Email (for login lookups)

---

### 2. Creator

Represents influencers and content creators.

**Fields:**
- `id` (String, Primary Key): Unique identifier
- `name` (String, Required): Creator's full name
- `email` (String, Optional): Contact email
- `phone` (String, Optional): Contact phone number
- `instagramHandle` (String, Optional): Instagram @handle
- `tiktokHandle` (String, Optional): TikTok @handle
- `youtubeHandle` (String, Optional): YouTube @handle
- `twitterHandle` (String, Optional): Twitter/X @handle
- `status` (Enum): Current status
- `notes` (String, Optional): Additional notes
- `ownerId` (String, Foreign Key): Reference to User who owns this creator
- `createdAt` (DateTime): When creator was added
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Belongs to one User (`owner`)
- Has many Deals (`deals`)

**Status Values:**
- `ACTIVE`: Currently working with the platform
- `INACTIVE`: Temporarily not working
- `PENDING`: Awaiting approval or contract
- `ARCHIVED`: No longer working with platform

**Indexes:**
- Name (for search)
- Status (for filtering)
- OwnerId (for ownership queries)

---

### 3. Campaign

Represents marketing campaigns for brands.

**Fields:**
- `id` (String, Primary Key): Unique identifier
- `title` (String, Required): Campaign name
- `brand` (String, Required): Brand/company name
- `description` (String, Optional): Campaign details
- `startDate` (DateTime, Optional): When campaign starts
- `endDate` (DateTime, Optional): When campaign ends
- `budget` (Float, Optional): Total budget in USD
- `status` (Enum): Current campaign status
- `createdAt` (DateTime): When campaign was created
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Has many Deals (`deals`)

**Status Values:**
- `PLANNING`: Campaign is being planned
- `ACTIVE`: Campaign is currently running
- `COMPLETED`: Campaign has finished
- `CANCELLED`: Campaign was cancelled

**Indexes:**
- Brand (for filtering)
- Status (for filtering)

---

### 4. Deal

Represents agreements between campaigns and creators. This is the junction table that connects campaigns with creators.

**Fields:**
- `id` (String, Primary Key): Unique identifier
- `campaignId` (String, Foreign Key, Required): Reference to Campaign
- `creatorId` (String, Foreign Key, Required): Reference to Creator
- `value` (Float, Required): Deal value in USD
- `status` (Enum): Current deal status
- `signedAt` (DateTime, Optional): When deal was signed
- `notes` (String, Optional): Additional deal notes
- `createdAt` (DateTime): When deal was created
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Belongs to one Campaign (`campaign`)
- Belongs to one Creator (`creator`)

**Status Values:**
- `PENDING`: Deal proposed, awaiting response
- `NEGOTIATING`: In negotiation phase
- `SIGNED`: Deal has been signed
- `ACTIVE`: Deal is active/in progress
- `COMPLETED`: Deal deliverables completed
- `CANCELLED`: Deal was cancelled

**Indexes:**
- CampaignId (for campaign queries)
- CreatorId (for creator queries)
- Status (for filtering)

**Cascade Behavior:**
- If a Campaign is deleted, all related Deals are deleted
- If a Creator is deleted, all related Deals are deleted

---

### 5. Activity

Audit log for tracking user actions.

**Fields:**
- `id` (String, Primary Key): Unique identifier
- `userId` (String, Foreign Key, Required): User who performed the action
- `action` (String, Required): Action performed (created, updated, deleted)
- `entity` (String, Required): Entity type (creator, campaign, deal)
- `entityId` (String, Optional): ID of the affected entity
- `details` (String, Optional): Additional action details
- `createdAt` (DateTime): When action occurred

**Relations:**
- Belongs to one User (`user`)

**Indexes:**
- UserId (for user activity queries)
- Entity (for entity-specific queries)
- CreatedAt (for chronological sorting)

**Cascade Behavior:**
- If a User is deleted, all their Activities are deleted

---

## Data Relationships

### Many-to-Many: Campaigns ↔ Creators

Campaigns and Creators have a many-to-many relationship through the Deal model:

- One Campaign can have many Deals (with different Creators)
- One Creator can have many Deals (with different Campaigns)
- Each Deal connects exactly one Campaign to one Creator

**Example:**
```
Campaign: "Summer Fashion 2024"
├── Deal 1: Sarah Johnson ($5,000)
├── Deal 2: Emma Rodriguez ($4,500)
└── Deal 3: Lisa Thompson ($3,000)

Creator: Sarah Johnson
├── Deal 1: Summer Fashion 2024 ($5,000)
├── Deal 2: Tech Product Launch ($7,500)
└── Deal 3: Holiday Beauty ($5,500)
```

### One-to-Many: User → Creator

- One User can own multiple Creators
- Each Creator has one owner (or none if ownerId is null)

This allows assigning responsibility for managing creator relationships.

### One-to-Many: User → Activity

- One User creates multiple Activity records
- Each Activity belongs to one User

This creates an audit trail of who did what in the system.

---

## Common Query Patterns

### Get all Deals for a Campaign with Creator info
```typescript
const deals = await prisma.deal.findMany({
  where: { campaignId: 'campaign-id' },
  include: {
    creator: {
      select: { name: true, email: true, instagramHandle: true }
    }
  }
});
```

### Get all Campaigns a Creator is involved in
```typescript
const campaigns = await prisma.deal.findMany({
  where: { creatorId: 'creator-id' },
  include: {
    campaign: true
  }
});
```

### Get User's activity log
```typescript
const activities = await prisma.activity.findMany({
  where: { userId: 'user-id' },
  orderBy: { createdAt: 'desc' },
  take: 20
});
```

### Get Campaign summary with deal stats
```typescript
const campaign = await prisma.campaign.findUnique({
  where: { id: 'campaign-id' },
  include: {
    deals: {
      include: {
        creator: {
          select: { name: true }
        }
      }
    },
    _count: {
      select: { deals: true }
    }
  }
});
```

---

## Data Constraints

### Required Fields
- User: email, passwordHash
- Creator: name
- Campaign: title, brand
- Deal: campaignId, creatorId, value
- Activity: userId, action, entity

### Unique Constraints
- User.email must be unique

### Cascade Deletes
- Deleting a User deletes their Activities
- Deleting a Campaign deletes all associated Deals
- Deleting a Creator deletes all associated Deals
- Deleting a User does NOT delete Creators they own (ownerId becomes null)

---

## Data Validation

### API Layer (Zod Schemas)

All API endpoints validate input using Zod:

**Creator:**
- Name: Required, min 1 character
- Email: Valid email format (optional)
- Status: Must be one of ACTIVE, INACTIVE, PENDING, ARCHIVED

**Campaign:**
- Title: Required, min 1 character
- Brand: Required, min 1 character
- Budget: Positive number (optional)
- Status: Must be one of PLANNING, ACTIVE, COMPLETED, CANCELLED

**Deal:**
- CampaignId: Required, valid campaign ID
- CreatorId: Required, valid creator ID
- Value: Required, positive number
- Status: Must be one of PENDING, NEGOTIATING, SIGNED, ACTIVE, COMPLETED, CANCELLED

---

## Performance Considerations

### Indexes

Strategic indexes are placed on:
- Foreign keys (campaignId, creatorId, userId, ownerId)
- Frequently filtered fields (status, email)
- Frequently sorted fields (createdAt, name)

### Query Optimization

- Use `select` to limit returned fields
- Use `include` only when related data is needed
- Use `_count` for counting related records without loading them
- Add pagination for large result sets (to be implemented in Phase 3)

---

## Future Enhancements (Phase 3+)

1. **File Attachments**: Add a Files model for contracts and media
2. **Comments**: Add a Comments model for collaboration
3. **Tags**: Add a Tags model for categorization
4. **Notifications**: Add a Notifications model for alerts
5. **Soft Deletes**: Add deletedAt field for data recovery
6. **Versioning**: Track changes to entities over time
7. **Permissions**: Fine-grained permissions beyond roles

---

## Migration Strategy

The schema uses Prisma migrations. To modify the schema:

1. Edit `prisma/schema.prisma`
2. Run `npm run migrate` to create and apply migration
3. Update seed script if needed
4. Update TypeScript types (automatic with Prisma)
5. Update API validation schemas
6. Update UI forms

---

**Last Updated**: November 2025 (Phase 2)
**Database**: SQLite (local), PostgreSQL-ready
**ORM**: Prisma 6.x
