# DocuAI System Features

This file documents what the current codebase can do, based on implemented routes, actions, and libraries.

## 1. Core Product Capabilities

- AI-powered document generation from structured template inputs.
- Multi-format export: `DOCX`, `PDF`, `XLSX`.
- Asynchronous generation pipeline with background processing and status tracking (`PROCESSING`, `COMPLETED`, `FAILED`).
- Per-user document library with preview, download, clone, delete, favorite, and tag management.
- Subscription-aware access control for templates and monthly generation limits.
- Admin suite for analytics, user management, template management, quota visibility, subscription visibility, and feedback triage.

## 2. End-User Features

### Authentication and Session

- Register and login flows (`/register`, `/login`).
- Two auth modes depending on DB provider:
  - SQLite mode: custom JWT auth with `auth-token` cookie.
  - PostgreSQL mode: Supabase Auth session flow.
- Logout endpoint clears JWT cookie or Supabase session.

### Dashboard (`/dashboard`)

- Shows user-specific analytics:
  - Total generated documents.
  - Total AI tokens used.
  - Number of accessible active templates for the user tier.
- Navigation to Generate, Documents, and Admin (for admins).

### Document Generation (`/generate`)

- Template browsing with:
  - Category filtering.
  - Tier filtering.
  - Search.
  - Grid/List views.
  - Pagination.
- Lock indicators for templates above user subscription tier.
- Dynamic template form rendering from template JSON structure.
- Smart template suggestions via AI from free-text user intent.
- Optional tone input for generation style.
- Format selection: `DOCX`, `PDF`, `XLSX`.
- Generation limit guard by subscription tier.

### Document Library (`/documents`)

- List user documents with status indicators.
- Auto-polling for in-progress generation status updates.
- Actions per document:
  - Quick view modal (`PDF` iframe, `DOCX` render via `docx-preview`, `XLSX` HTML preview).
  - Download via `/api/files/[filename]`.
  - Clone/regenerate document from original metadata.
  - Delete document and underlying local file.
  - Toggle favorite.
  - Edit/save tags.
- Filtering:
  - Favorites-only.
  - Tag filter.

### Pricing and Subscription (`/pricing`)

- Tier comparison UI with monthly/annual billing toggle.
- In-app subscription tier change action for current user.
- Shows current active tier and usage context.

### Support and Feedback (`/support`)

- Users can submit feedback entries:
  - Type: `ERROR` or `SUGGESTION`.
  - Priority: `LOW`, `MEDIUM`, `HIGH`.
  - Title and details.
- Feedback is stored and surfaced in admin feedback queue.

### Theme / UX

- Global light/dark theme toggle with localStorage persistence.
- Responsive navbar and mobile menu.

## 3. Admin Features (`/admin/*`)

Admin routes are protected by role check (`ADMIN`) in `app/admin/layout.tsx`.

### Admin Dashboard (`/admin`)

- Aggregate business and usage analytics:
  - User count.
  - Document count.
  - Total tokens.
  - Computed MRR and potential MRR.
  - Top template performance and average tokens per template.
  - Recent document activity stream.

### User Management (`/admin/users`)

- List users with role and document counts.
- Toggle user role via admin action.

### Template Engine (`/admin/templates`)

- View templates.
- Toggle active/inactive status.
- Update supported formats per template (`DOCX`, `PDF`, `XLSX`).
- Backend includes create/update template actions.

### AI Quota / Usage (`/admin/quota`)

- Provider breakdown of token usage.
- Total token and document counts.
- 7-day daily token usage trend.

### Subscription Oversight (`/admin/subscriptions`)

- View all users with subscription tier, role, and monthly usage counts.
- Search by email/tier.

### Feedback Inbox (`/admin/feedback`)

- View all user feedback entries.
- Filter by feedback type and status.
- Update feedback status (`PENDING`, `IN_PROGRESS`, `RESOLVED`).

## 4. AI and Template System

### AI Provider Support

- Provider factory supports runtime switching via `AI_PROVIDER` env:
  - `ollama` (local).
  - `openai`.
  - `gemini`.
- JSON output enforcement/validation in providers.
- Usage tracking per generated document (tokens + provider).

### Prompting and Output Shaping

- Prompt builders for each template type.
- Prompt output expected as strict JSON structures per template.
- Philippines-specific context is injected (currency, context, locale guidance).

### Template Catalog and Tier Gating

Current template type catalog includes 38 types across tiers:

- FREE-level examples: `INVOICE`, `MEMO`, `RESUME`, `THANK_YOU_NOTE`, `EXPENSE_REPORT`, `DAILY_STANDUP`, `FEEDBACK_FORM`, `EVENT_INVITATION`.
- STARTER-level examples: `REPORT`, `CONTENT`, `JOB_DESCRIPTION`, `COVER_LETTER`, `SOCIAL_MEDIA_PLAN`, `SOP`, `MEETING_AGENDA`, plus onboarding/performance/training/incident/quarterly goals.
- PRO-level examples: `PRESENTATION`, `LEGAL_CONTRACT`, `NEWSLETTER`, `MEETING_MINUTES`, `WHITE_PAPER`, `RFP_RESPONSE`, `EXECUTIVE_SUMMARY`, `BUSINESS_PLAN`, `SWOT_ANALYSIS`.
- ENTERPRISE-level examples: `PROJECT_PROPOSAL`, `PRODUCT_SPEC`, `PRESS_RELEASE`, `CASE_STUDY`, `ANNUAL_REPORT`, `BOARD_PRESENTATION`, `COMPLIANCE_AUDIT`, `MERGER_PROPOSAL`, `INVESTOR_PITCH`.

## 5. File Generation and Storage

- `DOCX` generation with template-specific and generic document builders.
- `PDF` generation via Puppeteer-rendered HTML templates.
- `XLSX` generation via ExcelJS worksheets.
- Files stored on local filesystem under `uploads/`.
- Public serving endpoint: `/api/files/[filename]` with inline/attachment support.

## 6. Subscription and Usage Enforcement

Server-side subscription limits configured in `lib/subscription.ts`:

- `FREE`: 3 completed generations / month
- `STARTER`: 15 / month
- `PRO`: 50 / month
- `ENTERPRISE`: 200 / month

Generation actions enforce limits before creating new jobs.

## 7. Data Model (Prisma)

Main entities:

- `User`: role, subscription tier, billing cycle, auth linkage.
- `Template`: schema/structure, type, active status, supported formats.
- `Document`: generated content metadata, status, tags, favorites, file URL.
- `Usage`: token/provider usage linked to user and document.
- `Feedback`: support/bug/suggestion tracking with status and priority.

## 8. API Endpoints

Implemented API routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/callback` (Supabase OAuth/session exchange)
- `GET /api/files/[filename]` (download or inline render)
- `GET /api/health`

## 9. Runtime and Deployment Capabilities

- Next.js App Router application with server actions.
- Local DB switching utility (`scripts/switch-db.js`) between SQLite and PostgreSQL schema/env setup.
- Dockerized deployment (`Dockerfile`, `docker-compose.yml`) with health check.
- Windows helper scripts for quick start/stop/log viewing (`START-DOCUAI.bat`, `STOP-DOCUAI.bat`, `VIEW-LOGS.bat`).

## 10. Notable Technical Characteristics

- Background generation uses `after()` to return quickly while generation continues.
- Revalidation hooks keep dashboard/documents/admin views fresh after mutations.
- Route-level and action-level auth checks protect sensitive operations.
- Role-based access control applied to admin operations.
