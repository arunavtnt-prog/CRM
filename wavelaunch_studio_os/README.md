# Wavelaunch Studio OS (WLOS)

**Single-Tenant, Internal Full-Stack CRM & Automation Platform**

A secure, founder-only system for managing creator brand lifecycles, automating deliverables, and eliminating manual tracking overhead.

---

## 🎯 Project Goals

- **KPI Target**: Reduce daily manual tracking time by 90-95%
- **Vision**: Single source of truth for all creator/brand data, credentials, and deliverables
- **Security**: Enterprise-grade encryption, 2FA, comprehensive audit logging

---

## 📋 Epic 1: Creator Data & Identity Management ✅

### Completed Features

✅ **Story 1.1**: Creator/Brand List View with filters
✅ **Story 1.2**: Comprehensive Creator Profile (24+ fields)
✅ **Story 1.3**: Flexible custom fields via JSONB
✅ **Story 1.4**: Secure credential vault with encryption
✅ **Story 1.5**: Audit logging for all sensitive changes

### Data Models Created

1. **Creator** - Core entity with 26+ fields covering:
   - Personal info (name, email, phone, location, timezone)
   - Brand identity (name, tagline, niche, logo, website)
   - Journey status (Onboarding → Brand Building → Launch → Live)
   - Health score (auto-calculated: Green/Yellow/Red)
   - Social media links (Instagram, YouTube, TikTok, Twitter, LinkedIn)
   - Communication tracking (last contact, next follow-up)
   - Custom fields (JSONB for unlimited extensibility)

2. **CreatorCredential** - Encrypted credential vault:
   - Platform-specific login URLs (encrypted)
   - Passwords (encrypted)
   - 2FA backup codes (encrypted)
   - API keys (encrypted)
   - All access logged automatically

3. **Milestone** - Project timeline tracking:
   - Target dates and completion tracking
   - Linked to journey stages
   - Visual completion indicators

4. **AuditLog** - Immutable security log:
   - User, timestamp, IP address
   - Action type (CREATE, UPDATE, DELETE, VIEW)
   - Before/after change tracking
   - Read-only, cannot be edited or deleted

5. **AIDeliverable** - AI-generated assets:
   - Document/asset type tracking
   - Prompt and context storage
   - Generation status monitoring
   - Output storage and retrieval

---

## 🛠️ Tech Stack

- **Backend**: Django 4.2 + Django REST Framework
- **Database**: PostgreSQL (with JSONB support)
- **Security**:
  - `django-encrypted-model-fields` for credential encryption
  - `django-otp` for 2FA
  - Comprehensive audit logging via signals
- **Frontend** (Next Phase): React SPA
- **AI Integration**: Anthropic Claude / OpenAI GPT

---

## 🚀 Setup Instructions

### Prerequisites

- Python 3.10+
- PostgreSQL 14+
- Git

### 1. Clone and Navigate

```bash
cd wavelaunch_studio_os
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r ../requirements.txt
```

### 4. Set Up Environment Variables

```bash
# Copy the example env file
cp ../.env.example .env

# Edit .env and fill in your values:
nano .env
```

**Required Variables**:
```env
SECRET_KEY=your-secret-key-here-generate-a-strong-one
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_NAME=wavelaunch_studio_os
DATABASE_USER=postgres
DATABASE_PASSWORD=your-secure-password
DATABASE_HOST=localhost
DATABASE_PORT=5432

FIELD_ENCRYPTION_KEY=your-32-byte-encryption-key-base64-encoded
```

**Generate a secure encryption key**:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### 5. Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE wavelaunch_studio_os;
CREATE USER wlos_admin WITH PASSWORD 'your-secure-password';
ALTER ROLE wlos_admin SET client_encoding TO 'utf8';
ALTER ROLE wlos_admin SET default_transaction_isolation TO 'read committed';
ALTER ROLE wlos_admin SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE wavelaunch_studio_os TO wlos_admin;
\q
```

### 6. Run Migrations

```bash
# Create initial migrations
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate

# Output will show:
#   Operations to perform:
#     Apply all migrations: admin, auth, contenttypes, sessions, studio_crm, django_otp
#   Running migrations:
#     Applying studio_crm.0001_initial... OK
```

### 7. Create Superuser (Founder Account)

```bash
python manage.py createsuperuser

# Follow prompts:
# Username: [your-email@wavelaunch.com]
# Email: [your-email@wavelaunch.com]
# Password: [secure-password]
```

### 8. Run Development Server

```bash
python manage.py runserver

# Access admin interface at:
# http://localhost:8000/admin
```

---

## 📊 Database Schema

### Core Tables Created

```
studio_crm_creator
├── id (UUID, PK)
├── created_at, updated_at
├── creator_name, creator_email, creator_phone
├── brand_name, brand_tagline, brand_niche
├── journey_status (ENUM: Onboarding, Brand Building, Launch, Live, Paused, Closed)
├── health_score (ENUM: Green, Yellow, Red)
├── instagram_handle, youtube_channel, tiktok_handle, twitter_handle
├── communication_notes, internal_notes
├── custom_fields (JSONB)
└── tags (JSONB Array)

studio_crm_creatorcredential
├── id (UUID, PK)
├── creator_id (FK → Creator)
├── platform_name
├── account_identifier
├── login_url (ENCRYPTED)
├── password (ENCRYPTED)
├── two_factor_backup_codes (ENCRYPTED)
├── api_keys (ENCRYPTED)
└── last_verified_date

studio_crm_milestone
├── id (UUID, PK)
├── creator_id (FK → Creator)
├── title, description
├── target_date, completed_date
├── is_completed
└── related_journey_stage

studio_crm_auditlog
├── id (UUID, PK)
├── timestamp (indexed)
├── user_id (FK → User)
├── user_email (snapshot)
├── ip_address
├── action_type (CREATE, UPDATE, DELETE, VIEW)
├── target_model, target_id
└── changes (JSONB)

studio_crm_aideliverable
├── id (UUID, PK)
├── creator_id (FK → Creator)
├── deliverable_type
├── prompt_used, context_data (JSONB)
├── generated_content
├── status (Pending, Generating, Completed, Failed)
└── ai_model
```

---

## 🔐 Security Features (Epic 0 + Story 1.4)

### ✅ Implemented

1. **Field-Level Encryption**
   - All credentials encrypted at rest using `django-encrypted-model-fields`
   - Fernet symmetric encryption (AES-128)

2. **Audit Logging**
   - Every CREATE, UPDATE, DELETE automatically logged
   - Tracks user, timestamp, IP address, before/after values
   - Immutable logs (cannot be edited or deleted)

3. **Password Security**
   - Minimum 12 characters enforced
   - Django's built-in password validators

4. **CSRF & XSS Protection**
   - CSRF tokens on all forms
   - X-Frame-Options: DENY
   - Content-Type nosniff

### 🔜 Next Phase (Epic 0.1)

- Google OAuth integration
- 2FA enforcement for all users
- IP whitelisting
- Session timeout configuration

---

## 🎨 Admin Interface (Story 1.1, 1.2)

### Features

- **Creator List**: Filterable by status, health, niche
- **Color-coded badges**: Visual health scores and journey stages
- **Credential management**: Masked passwords with audit trail
- **Milestone tracking**: Visual completion indicators
- **Audit log viewer**: Read-only security log

### Access

```
http://localhost:8000/admin
```

**Login with your superuser credentials**

---

## 📈 Health Score Logic (Story 2.3)

The system automatically calculates health scores based on:

| Condition | Health Score |
|-----------|-------------|
| No update in 30+ days | 🔴 RED |
| Onboarding/Brand-Building stage + 14+ days no update | 🔴 RED |
| Overdue follow-up date | 🟡 YELLOW |
| Paused status + 7+ days | 🟡 YELLOW |
| Onboarding/Brand-Building stage + 7+ days no update | 🟡 YELLOW |
| All other cases | 🟢 GREEN |

---

## 🧪 Testing

```bash
# Run all tests
python manage.py test

# Check for model issues
python manage.py check

# Validate migrations
python manage.py makemigrations --check --dry-run
```

---

## 📝 Migration Commands Reference

```bash
# Create migrations for model changes
python manage.py makemigrations studio_crm

# Show SQL that will be executed
python manage.py sqlmigrate studio_crm 0001

# Apply migrations
python manage.py migrate

# Rollback migrations (if needed)
python manage.py migrate studio_crm 0000  # Back to initial state

# List all migrations
python manage.py showmigrations
```

---

## 🗂️ Project Structure

```
wavelaunch_studio_os/
├── manage.py                          # Django management script
├── wavelaunch_studio_os/              # Project settings
│   ├── __init__.py
│   ├── settings.py                    # Main configuration
│   ├── urls.py                        # URL routing
│   ├── wsgi.py                        # WSGI server config
│   └── asgi.py                        # ASGI server config
├── studio_crm/                        # Main CRM app
│   ├── __init__.py
│   ├── models.py                      # ✅ Data models (Epic 1)
│   ├── admin.py                       # ✅ Admin interface
│   ├── apps.py                        # App configuration
│   ├── signals.py                     # ✅ Audit logging
│   ├── urls.py                        # API routes (TODO)
│   ├── views.py                       # API views (TODO)
│   ├── serializers.py                 # DRF serializers (TODO)
│   └── migrations/                    # Database migrations
├── logs/                              # Application logs
│   └── wlos.log
└── media/                             # User-uploaded files
    ├── creator_avatars/
    └── brand_logos/
```

---

## 🚧 Next Steps: Epic 2 & 3

### Epic 2: Project Lifecycle Visibility
- [ ] Visual journey timeline component
- [ ] Milestone management UI
- [ ] Health score dashboard
- [ ] Priority filtering and sorting

### Epic 3: AI Deliverable Generation
- [ ] API integration (Claude/OpenAI)
- [ ] Prompt template system
- [ ] Document generation workflows
- [ ] Preview and download interface

---

## 🔧 Development Commands

```bash
# Create a new Django app
python manage.py startapp app_name

# Generate a new secret key
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Open Django shell
python manage.py shell

# Create database backup
pg_dump wavelaunch_studio_os > backup_$(date +%Y%m%d).sql

# Restore database
psql wavelaunch_studio_os < backup_20250101.sql
```

---

## 📞 Support

This is an internal system for Wavelaunch Studio. For issues or questions:
- Check the audit log at `/admin/studio_crm/auditlog/`
- Review application logs at `logs/wlos.log`
- Contact: founders@wavelaunch.com

---

## 📄 License

**Internal & Proprietary** - Wavelaunch Studio
Not for public distribution or use.

---

**Built with Django + PostgreSQL**
Epic 1: Creator Data & Identity Management ✅ COMPLETE
