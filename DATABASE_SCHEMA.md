# Wavelaunch Studio OS - Database Schema Documentation

## Overview

This document describes the complete database schema for WLOS Epic 1: Creator Data & Identity Management.

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────┐
│                         User (Django Auth)                   │
│  - id (int)                                                  │
│  - username, email, password                                 │
│  - is_staff, is_superuser                                    │
└────────────┬────────────────────────────────────────────────┘
             │ created_by / last_updated_by
             ▼
┌─────────────────────────────────────────────────────────────┐
│                         Creator                              │
│  - id (UUID) PK                                             │
│  - created_at, updated_at                                    │
│                                                              │
│  CREATOR INFO:                                               │
│  - creator_name, creator_email, creator_phone               │
│  - creator_location, creator_timezone, creator_avatar       │
│                                                              │
│  BRAND INFO:                                                 │
│  - brand_name, brand_tagline, brand_niche                   │
│  - brand_logo, brand_website, brand_description             │
│                                                              │
│  STATUS:                                                     │
│  - journey_status (enum)                                    │
│  - health_score (enum, auto-calculated)                     │
│  - last_status_change                                        │
│  - priority_level                                            │
│                                                              │
│  SOCIAL:                                                     │
│  - instagram_handle, youtube_channel                        │
│  - tiktok_handle, twitter_handle, linkedin_profile          │
│  - other_social_links (JSONB)                               │
│                                                              │
│  COMMUNICATION:                                              │
│  - primary_communication_channel                             │
│  - last_contacted_date, next_follow_up_date                 │
│  - communication_notes                                       │
│                                                              │
│  FLEXIBLE:                                                   │
│  - custom_fields (JSONB) - unlimited extensibility          │
│  - tags (JSONB Array)                                        │
│  - internal_notes                                            │
│  - is_active                                                 │
└────────────┬───────────────────┬──────────────┬─────────────┘
             │                   │              │
             │                   │              │
    ┌────────▼────────┐  ┌──────▼──────┐  ┌───▼────────────┐
    │ CreatorCredential│  │  Milestone  │  │ AIDeliverable  │
    │                  │  │             │  │                │
    │ - id (UUID) PK   │  │ - id (UUID) │  │ - id (UUID) PK │
    │ - creator_id FK  │  │ - creator FK│  │ - creator_id FK│
    │                  │  │ - title     │  │ - deliverable  │
    │ PLATFORM:        │  │ - descrip.  │  │   _type        │
    │ - platform_name  │  │ - target_dt │  │ - ai_model     │
    │ - account_id     │  │ - completed │  │ - prompt_used  │
    │                  │  │ - is_done   │  │ - context_data │
    │ ENCRYPTED:       │  │ - journey_  │  │ - generated_   │
    │ - login_url 🔒   │  │   stage     │  │   content      │
    │ - password 🔒    │  │             │  │ - file_url     │
    │ - 2fa_codes 🔒   │  └─────────────┘  │ - status       │
    │ - api_keys 🔒    │                   │ - error_msg    │
    │                  │                   └────────────────┘
    │ METADATA:        │
    │ - notes          │
    │ - verified_date  │
    │ - expires_on     │
    │ - is_active      │
    └──────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         AuditLog                             │
│  - id (UUID) PK                                             │
│  - timestamp (indexed)                                       │
│  - user_id FK → User                                        │
│  - user_email (snapshot)                                     │
│  - ip_address                                                │
│  - action_type (CREATE, UPDATE, DELETE, VIEW)               │
│  - target_model, target_id                                   │
│  - target_display (human-readable)                           │
│  - changes (JSONB) - before/after values                    │
│  - notes                                                     │
│                                                              │
│  READ-ONLY (no updates or deletes allowed)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Table Details

### 1. `studio_crm_creator`

**Purpose**: Core entity representing creator/brand projects

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `created_at` | TIMESTAMP | NOT NULL | Auto-set on creation |
| `updated_at` | TIMESTAMP | NOT NULL | Auto-update on save |
| `created_by_id` | INT | FK → auth_user | Who created this record |
| `last_updated_by_id` | INT | FK → auth_user | Last modifier |
| `creator_name` | VARCHAR(200) | NOT NULL | Full name |
| `creator_email` | VARCHAR(254) | UNIQUE, NOT NULL | Email (validated) |
| `creator_phone` | VARCHAR(20) | NULL | Phone number |
| `creator_location` | VARCHAR(200) | NULL | City, Country |
| `creator_timezone` | VARCHAR(50) | DEFAULT 'UTC' | Timezone |
| `creator_avatar` | VARCHAR(100) | NULL | Image path |
| `brand_name` | VARCHAR(200) | NOT NULL, INDEXED | Brand name |
| `brand_tagline` | VARCHAR(500) | NULL | Tagline |
| `brand_niche` | VARCHAR(200) | NOT NULL | Industry/niche |
| `brand_logo` | VARCHAR(100) | NULL | Logo path |
| `brand_website` | VARCHAR(200) | NULL | Website URL |
| `brand_description` | TEXT | NULL | Brand positioning |
| `journey_status` | VARCHAR(20) | NOT NULL, INDEXED | See enum below |
| `health_score` | VARCHAR(10) | NOT NULL, INDEXED | GREEN/YELLOW/RED |
| `last_status_change` | TIMESTAMP | NOT NULL | Last status update |
| `priority_level` | INT | DEFAULT 3 | 1 (highest) to 5 |
| `instagram_handle` | VARCHAR(100) | NULL | @username |
| `youtube_channel` | VARCHAR(200) | NULL | Full URL |
| `tiktok_handle` | VARCHAR(100) | NULL | @username |
| `twitter_handle` | VARCHAR(100) | NULL | @username |
| `linkedin_profile` | VARCHAR(200) | NULL | Full URL |
| `other_social_links` | JSONB | DEFAULT '{}' | Flexible links |
| `primary_communication_channel` | VARCHAR(50) | DEFAULT 'Email' | Preferred channel |
| `last_contacted_date` | DATE | NULL | Last contact |
| `next_follow_up_date` | DATE | NULL | Next scheduled follow-up |
| `communication_notes` | TEXT | NULL | Conversation history |
| `custom_fields` | JSONB | DEFAULT '{}' | Story 1.3: Unlimited fields |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `internal_notes` | TEXT | NULL | Private studio notes |
| `tags` | JSONB | DEFAULT '[]' | Tag array |

**Enums**:
- `journey_status`: ONBOARDING, BRAND_BUILDING, LAUNCH, LIVE, PAUSED, CLOSED
- `health_score`: GREEN, YELLOW, RED

**Indexes**:
1. `(journey_status, health_score)` - Dashboard queries
2. `brand_name` - Search optimization
3. `last_status_change DESC` - Recent activity sorting

---

### 2. `studio_crm_creatorcredential`

**Purpose**: Encrypted storage for operational login credentials (Story 1.4)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `creator_id` | UUID | FK → Creator, CASCADE | Parent creator |
| `created_at` | TIMESTAMP | NOT NULL | Auto-set |
| `updated_at` | TIMESTAMP | NOT NULL | Auto-update |
| `created_by_id` | INT | FK → auth_user | Who added this |
| `platform_name` | VARCHAR(100) | NOT NULL | E.g., "Instagram Business" |
| `account_identifier` | VARCHAR(200) | NOT NULL | Username/email for login |
| `login_url` | ENCRYPTED TEXT | NULL | 🔒 Direct login link |
| `password` | ENCRYPTED TEXT | NULL | 🔒 Account password |
| `two_factor_backup_codes` | ENCRYPTED TEXT | NULL | 🔒 2FA recovery codes |
| `api_keys` | ENCRYPTED TEXT | NULL | 🔒 API keys (JSON format) |
| `notes` | TEXT | NULL | Access instructions |
| `last_verified_date` | DATE | NULL | Last verified working |
| `expires_on` | DATE | NULL | Password expiration |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active credential |

**Unique Constraint**: `(creator_id, platform_name, account_identifier)`

**Encryption**: All fields marked 🔒 use Fernet symmetric encryption (AES-128)

**Audit**: All access is logged to `AuditLog` via signals

---

### 3. `studio_crm_milestone`

**Purpose**: Track project milestones and deliverables (Story 2.1)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `creator_id` | UUID | FK → Creator, CASCADE | Parent creator |
| `created_at` | TIMESTAMP | NOT NULL | Auto-set |
| `title` | VARCHAR(200) | NOT NULL | Milestone name |
| `description` | TEXT | NULL | Details |
| `target_date` | DATE | NULL | Target completion |
| `completed_date` | DATE | NULL | Actual completion |
| `is_completed` | BOOLEAN | DEFAULT FALSE | Completion status |
| `related_journey_stage` | VARCHAR(20) | NOT NULL | Which stage this belongs to |

**Ordering**: `target_date ASC, is_completed DESC`

---

### 4. `studio_crm_auditlog`

**Purpose**: Immutable security log for all sensitive actions (Epic 0.4)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `timestamp` | TIMESTAMP | NOT NULL, INDEXED | When action occurred |
| `user_id` | INT | FK → auth_user | Who performed action |
| `user_email` | VARCHAR(254) | NOT NULL | Email snapshot |
| `ip_address` | INET | NULL | IP address |
| `action_type` | VARCHAR(50) | NOT NULL, INDEXED | CREATE/UPDATE/DELETE/VIEW |
| `target_model` | VARCHAR(50) | NOT NULL | Model name |
| `target_id` | UUID | NOT NULL | Affected object ID |
| `target_display` | VARCHAR(200) | NOT NULL | Human-readable name |
| `changes` | JSONB | DEFAULT '{}' | Before/after values |
| `notes` | TEXT | NULL | Additional context |

**Permissions**:
- ❌ No manual creation
- ❌ No updates
- ❌ No deletes
- ✅ Read-only access

**Indexes**:
1. `(timestamp DESC, action_type)` - Recent action queries
2. `(user_id, timestamp DESC)` - Per-user audit trails

---

### 5. `studio_crm_aideliverable`

**Purpose**: Track AI-generated documents and assets (Epic 3)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `creator_id` | UUID | FK → Creator, CASCADE | Parent creator |
| `created_at` | TIMESTAMP | NOT NULL | Auto-set |
| `created_by_id` | INT | FK → auth_user | Who triggered generation |
| `deliverable_type` | VARCHAR(100) | NOT NULL | Report, Guidelines, etc. |
| `prompt_used` | TEXT | NOT NULL | AI prompt template |
| `context_data` | JSONB | NOT NULL | Creator data snapshot |
| `ai_model` | VARCHAR(50) | DEFAULT 'claude-3-5-sonnet' | Model used |
| `generated_content` | TEXT | NOT NULL | Raw AI output |
| `file_url` | VARCHAR(200) | NULL | Link to PDF/asset |
| `status` | VARCHAR(20) | NOT NULL | PENDING/GENERATING/COMPLETED/FAILED |
| `error_message` | TEXT | NULL | Error details if failed |

**Status Enum**: PENDING, GENERATING, COMPLETED, FAILED

---

## Field Counts by Model

| Model | Total Fields | Required Fields | Encrypted Fields | JSONB Fields |
|-------|-------------|-----------------|------------------|--------------|
| Creator | 32 | 6 | 0 | 2 |
| CreatorCredential | 14 | 3 | 4 | 0 |
| Milestone | 8 | 2 | 0 | 0 |
| AuditLog | 11 | 7 | 0 | 1 |
| AIDeliverable | 12 | 5 | 0 | 1 |

---

## JSONB Schema Examples

### `Creator.custom_fields`

Flexible key-value pairs for project-specific data:

```json
{
  "revenue_target_monthly": 50000,
  "current_follower_count": 12500,
  "content_pillars": ["Fitness", "Nutrition", "Mindset"],
  "brand_colors": "#FF5733, #C70039",
  "special_requirements": "Vegan products only"
}
```

### `Creator.tags`

Array of tags for filtering:

```json
["VIP", "High-Revenue", "Needs-Attention", "Launch-Ready"]
```

### `Creator.other_social_links`

Additional social platforms:

```json
{
  "pinterest": "https://pinterest.com/brandname",
  "twitch": "https://twitch.tv/brandname",
  "discord": "discord.gg/invite-code"
}
```

### `AuditLog.changes`

Before/after values for updates:

```json
{
  "journey_status": {
    "from": "ONBOARDING",
    "to": "BRAND_BUILDING"
  },
  "health_score": {
    "from": "GREEN",
    "to": "YELLOW"
  }
}
```

---

## Security Considerations

### Encryption at Rest

All `CreatorCredential` sensitive fields use `django-encrypted-model-fields`:
- **Algorithm**: Fernet (symmetric encryption, AES-128-CBC)
- **Key Storage**: Environment variable `FIELD_ENCRYPTION_KEY`
- **Key Rotation**: Supported via re-encryption migration

### Audit Trail

Automatic logging via Django signals (`studio_crm/signals.py`):
1. `pre_save` - Captures original values before update
2. `post_save` - Logs CREATE and UPDATE actions
3. `post_delete` - Logs DELETE actions
4. Middleware captures request context (user, IP)

### Access Control

- All models require authentication via Django admin or API
- `AuditLog` is read-only (no add/change/delete permissions)
- Credential viewing triggers audit log entry
- Superuser required for sensitive operations

---

## Migration History

### `0001_initial.py`

Creates all tables:
- `studio_crm_creator` with full field set
- `studio_crm_creatorcredential` with encryption
- `studio_crm_milestone`
- `studio_crm_auditlog`
- `studio_crm_aideliverable`

Includes:
- All indexes
- Foreign key constraints
- Unique constraints
- Default values

---

## Query Optimization

### Common Queries

1. **Dashboard - Urgent Projects**
   ```sql
   SELECT * FROM studio_crm_creator
   WHERE health_score IN ('RED', 'YELLOW')
   ORDER BY health_score DESC, last_status_change ASC;
   ```
   - Uses composite index on `(health_score, last_status_change)`

2. **Active Creators by Status**
   ```sql
   SELECT * FROM studio_crm_creator
   WHERE journey_status = 'ONBOARDING' AND is_active = TRUE;
   ```
   - Uses index on `journey_status`

3. **Recent Audit Trail**
   ```sql
   SELECT * FROM studio_crm_auditlog
   WHERE action_type = 'UPDATE'
   ORDER BY timestamp DESC
   LIMIT 20;
   ```
   - Uses composite index on `(timestamp, action_type)`

---

## Backup Strategy

### Recommended Schedule

- **Daily**: Full database backup
- **Hourly**: Transaction log backup (critical data)
- **Retention**: 30 days online, 1 year offline

### Backup Command

```bash
pg_dump wavelaunch_studio_os > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Command

```bash
psql wavelaunch_studio_os < backup_20250101_120000.sql
```

---

## Performance Metrics (Expected)

| Operation | Expected Time | Notes |
|-----------|--------------|-------|
| Creator list (50 items) | < 100ms | With indexes |
| Creator detail view | < 50ms | Single query |
| Credential decrypt | < 10ms | Per field |
| Health score calculation | < 5ms | Python logic |
| Audit log insertion | < 20ms | Background signal |

---

**Schema Version**: 1.0.0
**Last Updated**: 2025-10-28
**Status**: ✅ Epic 1 Complete
