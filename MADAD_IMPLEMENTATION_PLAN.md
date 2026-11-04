# MADAD Implementation & Execution Plan

This document defines the sequential execution roadmap for developing MADAD without exceeding limited AI credits and ensuring every feature is functional, robust, and genuine.

---

## Phase 1: Architecture & Foundation (Completed)
- [x] Project code and asset audit
- [x] System architecture blueprint (`MADAD_ARCHITECTURE.md`)
- [x] PostgreSQL & RLS Schema specification (`MADAD_DATABASE_SCHEMA.md`)
- [x] Complete REST API Contract specification (`MADAD_API_CONTRACT.md`)
- [x] React (Vite) client initialized with Lucide React & Tailwind CSS
- [x] Express.js server initialized with dependencies (Helmet, CORS, Zod, Rate Limiter, Supabase SDK)

---

## Phase 2: Backend Core, Matching Engine & Store (Agent 2)
- [ ] Build Express Server entrypoint `src/index.js` with security middleware, error handlers, and `/health` route.
- [ ] Implement dual-mode data repository (`src/data/store.js`):
  - In-memory / JSON persistence for zero-cost immediate out-of-the-box local demo and verification.
  - Live Supabase connection layer for real production deployments.
- [ ] Implement the **Deterministic Matching Engine** (`src/services/matcher.js`):
  - Category exact match (40 pts)
  - Keyword & problem description relevance (25 pts)
  - Geographic compatibility: same PIN (20 pts), same city (15 pts), same state/regional (10 pts)
  - Verification boost (10 pts)
  - Availability status weighting (5 pts)
  - Returns best match + 2 alternatives with transparent explainability rationale.
- [ ] Implement controllers & routes:
  - Auth & Profile routes (`/api/v1/auth`)
  - Provider directory & query routes (`/api/v1/providers`)
  - Help Requests & Smart Matching (`/api/v1/requests`)
  - Contact Attempts & Smart Fallback (`/api/v1/requests/:id/contact-attempts`)
  - User-Confirmed Resolution (`/api/v1/requests/:id/confirm-resolution`)
  - Give Help feeds & offers (`/api/v1/give-help`)
  - Admin metrics & verification review (`/api/v1/admin`)

---

## Phase 3: Frontend Integration & 10 Core Pages (Agent 3)
- [ ] Setup Tailwind & design tokens matching the original design:
  - Background: `#fbfaf6`
  - Primary: `#087c70`
  - Accent Coral: `#e47c68`
  - Text: `#173b39`
  - Fonts: Inter
- [ ] Core UI components: Navbar, Footer, StatusBadge, ProviderCard, TimelineView, Modal, Alert.
- [ ] Page 1: **Home / Landing Page** (Preserves existing layout and aesthetic with live interactive navigation).
- [ ] Page 2: **Find Help** (Filterable directory with category, city, verification, availability filters).
- [ ] Page 3: **Request Help** (Structured intake form, voice recording with consent, PII protection notice).
- [ ] Page 4: **Matching Results** (Best match + 2 alternatives + transparent matching rationale + Call button).
- [ ] Page 5: **Give Help** (Helper public feed with masked beneficiary details, Offer Help modal).
- [ ] Page 6: **Track Request** (Full case lifecycle timeline, "Yes, I received help" vs "No, I still need help").
- [ ] Page 7: **About Us** (Honest mission, problem statement, transparent operations).
- [ ] Page 8: **Safety & Privacy** (Data protection, medical disclaimers, reporting suspicious actors).
- [ ] Page 9: **Login / Signup** (Role-based access: Beneficiary, Helper, Provider, Admin).
- [ ] Page 10: **Admin Dashboard** (Live DB aggregate metrics, provider verification review, reports).

---

## Phase 4: Voice Notes, Smart Fallback & Polish (Agent 4)
- [ ] Browser MediaRecorder voice recording with permissions check, audio preview, and playback.
- [ ] Smart fallback workflow: if provider cannot help, seamlessly display alternate match #2 and update timeline.
- [ ] Comprehensive validation & edge-case testing (missing data, network errors, empty states).
- [ ] Documentation for running locally and configuring Supabase live credentials.
