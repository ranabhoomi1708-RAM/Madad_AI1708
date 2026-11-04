# MADAD REST API Contract

Base URL: `/api/v1`

## Standard Envelope
All API endpoints return JSON conforming to this response envelope:
```json
{
  "success": true,
  "data": {},
  "message": "Optional human-readable notification",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

In error scenarios:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Specific explanation of error",
    "details": []
  }
}
```

---

## 1. System & Health
- `GET /health`
  - Response: `{ status: "ok", mode: "live" | "demo", version: "1.0.0", timestamp: "..." }`

## 2. Authentication & Profiles
- `POST /auth/register`
  - Body: `{ email, password, role: "beneficiary"|"helper"|"provider", full_name, phone, city, state, pin_code }`
- `POST /auth/login`
  - Body: `{ email, password }`
  - Response: `{ user, token }`
- `GET /auth/me`
  - Headers: `Authorization: Bearer <token>`
- `PUT /profiles/me`
  - Updates profile metadata.

## 3. Providers Directory
- `GET /providers`
  - Query Params: `category`, `city`, `state`, `verification_status`, `availability_status`, `search`, `page`, `limit`
  - Response: List of providers with public fields.
- `GET /providers/:id`
  - Response: Full public provider profile, including stats (total contact attempts, resolution count, verification audit notes).
- `POST /providers` (Auth: Provider / Admin)
  - Create or claim provider listing.

## 4. Help Requests
- `POST /requests`
  - Auth: Beneficiary (or guest token if sessionless tracking enabled)
  - Body: `{ category, title, description, city, state, pin_code, urgency, assistance_type, preferred_contact_method, phone, consent_given }`
  - Actions: Saves request, generates unique tracking code (e.g. `MD-2026-X891`), initiates deterministic matching engine, creates initial case_update entry.
  - Response: `{ request, matches: [ { rank: 1, provider, match_score, rationale } ] }`
- `GET /requests/track/:trackingCode`
  - Open tracking endpoint with masked phone numbers.
  - Response: Complete request timeline, matching providers, contact attempts history, offers, feedback.
- `GET /requests/my-requests`
  - Auth: Beneficiary. Returns all requests created by the user.

## 5. Contact Attempts & Provider Lifecycle
- `POST /requests/:id/contact-attempts`
  - Auth: Required (or request owner session)
  - Body: `{ provider_id, outcome: "connected"|"no_answer"|"number_unavailable"|"provider_cannot_help"|"asked_to_call_later"|"help_promised"|"other", notes }`
  - Effect: Updates request status to `contact_attempted` or `awaiting_provider_response`. If outcome is `provider_cannot_help` or `number_unavailable`, automatically promotes the next best alternative provider in ranking without re-submitting request.

## 6. Help Confirmation & Resolution (Core Tenet)
- `POST /requests/:id/confirm-resolution`
  - Auth: Beneficiary owner
  - Body: `{ help_received: true, provider_id, feedback_rating, comments }`
  - Effect: Sets status strictly to `resolved_by_user_confirmation`. Updates provider's verified resolution score.
- `POST /requests/:id/still-need-help`
  - Auth: Beneficiary owner
  - Body: `{ reason, notes }`
  - Effect: Maintains status as `unresolved`, unlocks next alternative provider recommendations, logs to timeline.

## 7. Give Help (Helper Network)
- `GET /give-help/feed`
  - Query: `category`, `city`, `urgency`
  - Beneficiary phone and identity masked.
- `POST /give-help/requests/:id/offer`
  - Auth: Helper
  - Body: `{ message, contact_preference }`
  - Effect: Creates `assistance_offers` entry, notifies timeline.

## 8. Admin & Verification
- `GET /admin/metrics`
  - Returns real DB aggregated metrics: Total, New, Matched, In-Progress, Resolved by Confirmation, Unresolved.
- `GET /admin/providers/pending`
- `PATCH /admin/providers/:id/verification`
  - Body: `{ status: "verified"|"rejected"|"suspended", verification_notes }`
- `GET /admin/audit-logs`

## 9. Voice Notes
- `POST /requests/:id/voice-note`
  - Multipart audio upload (`MediaRecorder` webm/wav). Max 5MB. Explicit consent required.
