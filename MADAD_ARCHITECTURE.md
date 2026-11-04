# MADAD Architecture Specification

## 1. System Overview
MADAD ("Help") is a national-level social-impact help-discovery and help-resolution platform.
Its primary objective is: **"You explain your problem. MADAD finds the way forward."**
Key Tenet: **Finding a provider is not success. Resolving the person's problem is success.**

## 2. Technology Stack
- **Frontend**: React 18+ (Vite), Tailwind CSS v4, Lucide React icons, Vanilla MediaRecorder API for voice notes.
- **Backend**: Node.js, Express.js REST API with Helmet security, CORS, Rate Limiting, and Zod input validation.
- **Data & Auth Layer**:
  - Live Mode: Supabase (PostgreSQL, Supabase Auth, Row Level Security, Storage for audio blobs).
  - Demo/Local Mode: In-memory/filesystem reliable fallback store populated with comprehensive, realistic sample data spanning all 5 categories, matching engine, and simulated resolution states without paid API dependencies.
- **Zero Paid Dependencies**: Deterministic TF-IDF / weighted keyword and geographic matching. No OpenAI / Gemini billable calls required for matching.

## 3. High-Level Architecture
```
+-------------------------------------------------------------+
|                      MADAD Frontend                         |
|  - Home / Landing                                           |
|  - Find Help (Filterable Provider Directory)                |
|  - Request Help (Voice/Text Input, Consent, Triage)         |
|  - Matching Results (Best Match + Alternatives + Rationale) |
|  - Give Help (Helper feed, Offer Help, Protected PII)       |
|  - Track Request (Timeline, Outcomes, User Confirmation)    |
|  - Admin Dashboard (Metrics, Verification, Audit)           |
+-------------------------------------------------------------+
                               |
                        HTTPS REST / JSON
                               v
+-------------------------------------------------------------+
|                      Express.js Server                      |
|  - Security Middleware (Helmet, CORS, Rate Limiters)        |
|  - Zod Request Validators                                   |
|  - Authentication & Role-Based Access Control (RBAC)        |
|  - Deterministic Matching Engine                            |
|  - Smart Fallback & Contact Attempt Lifecycle Tracker       |
+-------------------------------------------------------------+
                               |
              +----------------+---------------+
              v                                v
+-----------------------------+  +----------------------------+
|   Supabase PostgreSQL / RLS |  | Demo/Local Memory Provider |
|   (Live Mode Database)      |  | (Deterministic Fallback)   |
+-----------------------------+  +----------------------------+
```

## 4. User Roles & RBAC Matrix
1. **Beneficiary**:
   - Create and manage their own help requests.
   - Record voice notes with explicit consent.
   - Log contact attempts with providers (Connected, No Answer, Help Promised, Cannot Help, etc.).
   - Explicitly confirm problem resolution ("Yes, I received help").
   - Cannot view other beneficiaries' unmasked PII.
2. **Helper / Donor**:
   - Browse public requests (with beneficiary PII strictly anonymized).
   - Submit assistance offers to open requests.
   - Track active offers.
3. **Provider / Organisation**:
   - Manage provider profiles, service areas, eligibility, categories, availability.
   - Acknowledge or update responses to inbound requests.
4. **Administrator**:
   - Review provider verification proofs, update verification status (Verified, Pending, Rejected).
   - Review duplicate flags and abuse reports.
   - Access real aggregate platform resolution statistics (never fabricated).

## 5. Request Lifecycle States
```
submitted
   │
   ▼
matching_in_progress ──► matched
                           │
                           ▼
                   contact_attempted ◄────────┐
                           │                  │ (Alternative provider fallback)
                           ▼                  │
               awaiting_provider_response     │
                           │                  │
                           ▼                  │
                   assistance_offered         │
                           │                  │
                           ▼                  │
                   assistance_promised        │
                           │                  │
                           ▼                  │
                 awaiting_user_feedback       │
                           │                  │
            ┌──────────────┴──────────────┐   │
            ▼                             ▼   │
resolved_by_user_confirmation         unresolved
```

## 6. Directory Layout
```
Madad_AI1/
├── client/                 # React Vite frontend
│   ├── src/
│   │   ├── components/     # UI primitives & design system components
│   │   ├── context/        # Auth and Toast/Alert context
│   │   ├── pages/          # 10 dedicated pages
│   │   ├── services/       # API client & local mock bridge
│   │   └── data/           # Demo seed data (clearly marked as demo)
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Supabase & environment config
│   │   ├── controllers/    # API endpoint controllers
│   │   ├── middleware/     # Auth, RLS, validation, rate-limiting
│   │   ├── routes/         # Express router modules
│   │   ├── services/       # Matching engine & business logic
│   │   └── data/           # In-memory repository & seeders
├── MADAD_ARCHITECTURE.md
├── MADAD_DATABASE_SCHEMA.md
├── MADAD_API_CONTRACT.md
└── MADAD_IMPLEMENTATION_PLAN.md
```
