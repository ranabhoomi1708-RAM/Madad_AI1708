# MADAD — 3-Minute Hackathon Demonstration Script

This walkthrough script is designed for presenting or testing MADAD step-by-step. It demonstrates a complete, real-world help journey without hitting dead-ends or showing fake data.

---

## Quick Start (One Command)
In your terminal, run:
```powershell
npm start
```
This boots both the **Express API backend (port 5000)** and the **Vite React frontend (port 5173)**.  
Open your browser to: **`http://localhost:5173`**

---

## 1. Landing Page & Visual Identity (30 seconds)
- **Visuals**: Observe the clean, warm off-white (`#fbfaf6`) background with deep teal (`#087c70`) and coral (`#e47c68`) accents.
- **Core Message**: Notice the prominent platform purpose:  
  *"You explain your problem. MADAD finds the way forward."*  
  *"Finding a provider is not success. Resolving the person's problem is success."*
- Click any of the **5 Category Cards** (Education, Food, Medical, Shelter, Community) to immediately filter verified resources.

---

## 2. Resource Directory & Verified Records (30 seconds)
- Navigate to **Find Help** in the top navigation.
- Search for `"books"` or filter by City: `"New Delhi"`.
- Observe the **Verified Badge**, **Availability status**, and audited track record:  
  *e.g. "42 contact attempts · 38 confirmed resolutions"*.
- Click **"View Details"** to see exact eligibility criteria and physical address.

---

## 3. Explain Your Problem & Voice Recording (45 seconds)
- Click **"Request Help"** in the navigation bar.
- Notice the **Medical Emergency Notice** warning users to dial 112 / 108 directly in life-threatening scenarios.
- Choose Category: **Education**.
- Enter:
  - Title: *"Need 8th standard NCERT science & math books"*
  - Description: *"Daily wage family in Janakpuri needing textbook support for new academic term."*
  - City: *"New Delhi"*, PIN: *"110058"*
  - Phone: `+91 98112 34567` (Protected by Privacy Guard).
- *(Optional)* Test the **Voice Recorder**: Check the consent box and click *"Start Recording"*. Record a brief voice message, stop, preview the audio playback.
- Check the consent box and click **"Submit & Match Providers"**.

---

## 4. Explainable Matching & Smart Fallback (45 seconds)
- The system generates a genuine tracking code (e.g. `MD-2026-X891`).
- **Best Recommended Match** card displays:
  - Match score (e.g., 95% - High Relevance)
  - Transparent rationale: Direct category match, keyword relevance, PIN code proximity, verified status, active capacity.
- **Alternative Providers (Smart Fallback)** are displayed side-by-side so the user is never stuck if the first provider is full.
- Click **"Call Provider"**:
  - Opens the native telephone dialer (`tel:`).
  - Prompts you to log the call outcome. Select: *"Connected / Spoke with staff"*.
  - Notice the case timeline updates immediately!

---

## 5. User-Confirmed Resolution (The Core Product Principle) (30 seconds)
- Click **"Open Case Tracker"** or search tracking code `MD-2026-EDU1`.
- View the complete case history timeline.
- Test the two milestone buttons:
  1. Click **"No, I still need help"**: Notice the case **remains open** and alternative providers are highlighted. Unresolved cases are never swept under the rug.
  2. Click **"Yes, I received help"**:
     - Provide a 5-star rating and confirmation note: *"Received textbook kit today."*
     - Click **"Verify & Mark Resolved"**.
     - Status updates officially to: **`★ Resolved by User Confirmation`**.

---

## 6. Give Help & Admin Audit (30 seconds)
- Go to **Give Help**: Notice that beneficiary phone numbers are masked (`+91 98711 ••••5`) to protect privacy. Click *"Offer Assistance"* to submit a volunteer offer.
- Go to **Admin Dashboard**:
  - View real-time database counts (Total Requests, In-Progress, User Confirmed Resolutions, Verified NGOs).
  - Review the **Provider Verification Queue** and click *"Audit / Verify"* to verify pending community organisations.

---

## Running the Automated QA Test Suite
To verify all 10 core lifecycle criteria programmatically at any time:
```powershell
npm test
```
Result: 100% assertions pass across all 10 acceptance tests.
