# MADAD — National-Level Social Impact Help-Discovery & Resolution Platform

> **"You explain your problem. MADAD finds the way forward."**  
> **"Every request deserves an answer."**

---

## 1. Most Important Product Principle

MADAD is not a static directory website, contact list, or college toy project.

Its sole purpose is to help a person move from having a critical problem to receiving actual, verified assistance.

> ### The Most Important Product Principle:
> **Finding a provider is not success. Resolving the person's problem is success.**

A request is **never** marked successfully resolved simply because:
* A provider was displayed on screen.
* A user clicked the call button.
* A provider answered the telephone.
* A provider promised assistance.
* A provider or volunteer offered help.

**Only the beneficiary's explicit confirmation that assistance was actually received marks the request as `resolved_by_user_confirmation`.**

---

## 2. Complete Application Architecture

MADAD is implemented with a clean monorepo architecture:

- **Frontend (`/client`)**: React 18+ (Vite), Tailwind CSS v4, Lucide React icons, browser native `MediaRecorder` API for consent-based voice notes.
- **Backend (`/server`)**: Node.js & Express.js REST API with Helmet security, CORS, Rate Limiting, and Zod input validation schemas.
- **Data & Matching Engine**:
  - **Deterministic Matching Engine**: 100% free, deterministic, transparent, and explainable. No billable OpenAI or Gemini API calls required.
  - **Dual-Mode Persistence**: 
    1. Built-in resilient in-memory / JSON store pre-seeded with realistic data across all 5 categories for immediate zero-cost local execution and hackathon demonstration.
    2. Supabase PostgreSQL schema with Row Level Security (RLS) policies for full production cloud deployment.

---

## 3. The 10 Core Application Pages

1. **Home / Landing Page (`/`)**: Preserves the original warm off-white and deep teal branding (`#fbfaf6`, `#087c70`, `#e47c68`), featuring the hero section, the 5 assistance categories, the 4-step help journey, and community calls to action.
2. **Find Help (`/find-help`)**: Searchable directory with filters for Category, City/District, Verification Status, and Availability. Every provider card displays audited contact history and confirmed resolutions.
3. **Request Help (`/request-help`)**: Accessible, structured intake form supporting text and browser MediaRecorder voice notes with explicit user consent, urgency triage, and PII protection.
4. **Matching Results (`/matching-results`)**: Displays the generated Tracking Code (e.g. `MD-2026-X891`), the Top 1 Best Match (with detailed explainable scoring criteria), and up to 2 verified Alternative Providers.
5. **Give Help (`/give-help`)**: Public feed for volunteers and donors to offer assistance with beneficiary phone numbers strictly masked to preserve dignity and privacy.
6. **Track Request (`/track-request`)**: Complete case lifecycle timeline tracking every status change, call outcome, and the two critical user actions:
   - **"Yes, I received help"**: Records rating and marks case `resolved_by_user_confirmation`.
   - **"No, I still need help"**: Keeps case open (`unresolved`) and activates alternative providers.
7. **About Us (`/about`)**: Honest mission statement, problem definition, and transparent operating principles without fabricated partnerships.
8. **Safety & Privacy (`/safety`)**: Explains emergency medical guidance (immediate 112 / 108 direct call), PII data protection, verification audit standards, and misuse reporting.
9. **Login & Role Selector (`/login`)**: Role-based access control supporting Beneficiary, Volunteer Helper, Provider Organisation, and Administrator, complete with one-click instant role switchers for hackathon demonstrations.
10. **Admin Dashboard (`/admin`)**: Real-time administrative governance displaying un-fabricated database counts, provider verification review queue with approve/reject actions, and audit trail logs.

---

## 4. Assistance Categories Supported

1. **Education**: Books, school stationery kits, tuition guidance, learning support, scholarship information.
2. **Food and Essentials**: Cooked hot meals, dry grocery ration kits, community kitchens, emergency food relief.
3. **Medical Assistance**: Hospital patient navigation, blood donor connections, generic pharmacy guidance *(Life-threatening emergencies are explicitly directed to 112 / 108)*.
4. **Shelter and Basic Support**: Temporary night shelter, emergency accommodation info, bedding, hygiene kits.
5. **Community Support**: Senior citizen escort, disability aids, women and child welfare assistance.

---

## 5. Intelligent Deterministic Matching Engine

MADAD's matching engine (`server/src/services/matcher.js`) computes a transparent 100-point match score based on 5 weighted criteria:

| Dimension | Points | Description |
| :--- | :---: | :--- |
| **Category Compatibility** | 40 pts | Direct match with provider's supported categories. |
| **Keyword & Context Relevance** | 25 pts | Tokenized match of request title, description, and assistance type against provider service records. |
| **Geographic Proximity** | 20 pts | Exact PIN code (20 pts), City/Service Area (16 pts), State (10 pts), or Regional/National (4 pts). |
| **Verification Status** | 10 pts | Verified non-profit audit boost (10 pts), Pending (3 pts), Unverified (0 pts). |
| **Current Availability** | 5 pts | Active intake (5 pts), Limited capacity (2 pts), Unavailable (-25 pts penalty). |

Every recommendation returned includes a human-readable `rationale` array explaining why the provider was matched.

---

## 6. Smart Fallback & Contact Tracking

When a beneficiary clicks **"Call Provider"**, MADAD opens their native device telephone dialer (`tel:`) outside the browser.

After the call, MADAD prompts the user to record the outcome:
- **Connected / Spoke with staff**
- **Help Promised** *(Transitions status to `assistance_promised` — pending delivery)*
- **Provider Cannot Help / Switched Off** *(Activates **Smart Fallback**: status remains `unresolved`, and Alternative Match #1 is promoted to prevent dead-ends)*
- **No Answer / Line Busy**

---

## 7. Automated QA Test Suite Results

A comprehensive 10-point end-to-end verification suite (`server/test_runner.js`) has been executed:

```
[1] Testing Help Request Submission & ID Generation...
✅ PASSED: Genuine request ID generated
✅ PASSED: Valid tracking code generated
✅ PASSED: Request status initiated as matched
✅ PASSED: Beneficiary telephone number is masked for privacy

[2] Testing Deterministic Provider Matching...
✅ PASSED: Matching returned top match and alternatives
✅ PASSED: Top ranked match designated as best match
✅ PASSED: Best match achieved high relevance score
✅ PASSED: Deterministic explainable rationale provided

[3] Testing Calling Provider & Outcome Recording...
✅ PASSED: Contact outcome recorded accurately
✅ PASSED: Case status transitioned to contact_attempted

[4] Testing Smart Fallback when Provider Cannot Help...
✅ PASSED: Request remains active/unresolved instead of dead-ending
✅ PASSED: Alternative providers remain readily available for contact
✅ PASSED: Timeline records smart fallback event

[5] Testing Help Promised (Must NOT close case prematurely)...
✅ PASSED: Status is assistance_promised
✅ PASSED: Case is strictly NOT marked resolved merely on promise

[6] Testing User-Confirmed Resolution...
✅ PASSED: Status is strictly resolved_by_user_confirmation
✅ PASSED: Confirmation timestamp recorded
✅ PASSED: Confirmed milestone in timeline

[7] Testing 'No, I Still Need Help' Workflow...
✅ PASSED: Status maintained as unresolved
✅ PASSED: Continuity logged in timeline

[8] Testing Give Help Feed & Assistance Offer...
✅ PASSED: Public feed populated with open cases
✅ PASSED: Beneficiary phone number is NOT exposed in public feed
✅ PASSED: Assistance offer created
✅ PASSED: Volunteer offer does NOT prematurely mark request resolved

[9] Testing Admin Provider Verification...
✅ PASSED: Verification status updated to verified
✅ PASSED: Verification audit timestamp saved

[10] Testing Platform Governance Metrics...
✅ PASSED: Metrics accurately reflect total request count
✅ PASSED: Only explicitly confirmed resolutions counted in metrics
✅ PASSED: Verified provider count is accurate
```

---

## 8. How to Run Locally

### Prerequisites
- Node.js (v18+) and npm installed.

### Step 1: Start the Backend Server
```powershell
cd server
npm start
```
The server will start on `http://localhost:5000`.  
Health check endpoint: `http://localhost:5000/api/v1/health`

### Step 2: Start the React Frontend
In a separate terminal window:
```powershell
cd client
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 9. Live Supabase Deployment Instructions (Optional)

To connect MADAD to a live PostgreSQL Supabase database:
1. Create a free project on [supabase.com](https://supabase.com).
2. Go to the SQL Editor and paste the contents of `MADAD_DATABASE_SCHEMA.md`.
3. In `server/.env`, configure:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
4. Restart the server. The server automatically detects Supabase credentials and switches to Live Database Mode.

---

## 10. Free Hosting Deployment Guidelines

- **Frontend**: Deploy the `/client` directory to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) for free.  
  Build command: `npm run build`, Output directory: `dist`.
- **Backend**: Deploy the `/server` directory to [Render](https://render.com) or [Railway](https://railway.app) free tier.  
  Start command: `node src/index.js`.
