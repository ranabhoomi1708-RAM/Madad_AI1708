# MADAD Database Schema Specification

This schema is designed for PostgreSQL on Supabase, with comprehensive constraints, foreign keys, indexes, and Row Level Security (RLS) policies.

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role AS ENUM ('beneficiary', 'helper', 'provider', 'admin');
CREATE TYPE request_category AS ENUM ('education', 'food_and_essentials', 'medical_assistance', 'shelter_and_support', 'community_support');
CREATE TYPE urgency_level AS ENUM ('standard', 'urgent', 'critical_emergency');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected', 'suspended');
CREATE TYPE availability_status AS ENUM ('available', 'limited', 'unavailable', 'unknown');
CREATE TYPE request_status AS ENUM (
  'submitted',
  'matching_in_progress',
  'matched',
  'contact_attempted',
  'awaiting_provider_response',
  'assistance_offered',
  'assistance_promised',
  'awaiting_user_feedback',
  'unresolved',
  'resolved_by_user_confirmation',
  'cancelled'
);
CREATE TYPE contact_outcome AS ENUM (
  'connected',
  'no_answer',
  'number_unavailable',
  'provider_cannot_help',
  'asked_to_call_later',
  'help_promised',
  'other'
);

-- 1. PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'beneficiary',
  full_name TEXT NOT NULL,
  phone_masked TEXT,
  phone_encrypted TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pin_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROVIDERS
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  categories request_category[] NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pin_code TEXT,
  service_areas TEXT[] NOT NULL,
  eligibility_criteria TEXT,
  assistance_types TEXT[] NOT NULL,
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  availability_status availability_status NOT NULL DEFAULT 'unknown',
  verification_notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  total_contact_attempts INT NOT NULL DEFAULT 0,
  successful_resolutions INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. HELP REQUESTS
CREATE TABLE help_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_code TEXT UNIQUE NOT NULL,
  beneficiary_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category request_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pin_code TEXT,
  urgency urgency_level NOT NULL DEFAULT 'standard',
  assistance_type TEXT NOT NULL,
  preferred_contact_method TEXT NOT NULL DEFAULT 'phone',
  contact_phone_masked TEXT,
  contact_phone_encrypted TEXT,
  status request_status NOT NULL DEFAULT 'submitted',
  resolved_confirmed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  consent_given BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. REQUEST MATCHES
CREATE TABLE request_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  rank INT NOT NULL DEFAULT 1,
  match_score NUMERIC(5,2) NOT NULL,
  rationale JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CONTACT ATTEMPTS
CREATE TABLE contact_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  outcome contact_outcome NOT NULL,
  notes TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CASE UPDATES (Audit Trail & Timeline)
CREATE TABLE case_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  status_from request_status,
  status_to request_status NOT NULL,
  update_title TEXT NOT NULL,
  update_description TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ASSISTANCE OFFERS (Give Help)
CREATE TABLE assistance_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  helper_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offered', -- offered, accepted, completed, declined
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ASSISTANCE FEEDBACK
CREATE TABLE assistance_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id),
  beneficiary_id UUID NOT NULL REFERENCES profiles(id),
  help_received BOOLEAN NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. VOICE NOTES
CREATE TABLE voice_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  duration_seconds INT,
  consent_recorded BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. REPORTS & ABUSE
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id),
  target_type TEXT NOT NULL, -- 'provider', 'request', 'offer'
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, investigated, resolved, dismissed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. AUDIT LOGS
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_requests_status ON help_requests(status);
CREATE INDEX idx_requests_category ON help_requests(category);
CREATE INDEX idx_requests_city ON help_requests(city);
CREATE INDEX idx_requests_tracking ON help_requests(tracking_code);
CREATE INDEX idx_providers_categories ON providers USING GIN (categories);
CREATE INDEX idx_providers_service_areas ON providers USING GIN (service_areas);
CREATE INDEX idx_providers_city ON providers(city);
CREATE INDEX idx_matches_request ON request_matches(request_id);
CREATE INDEX idx_attempts_request ON contact_attempts(request_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Providers: Publicly viewable
CREATE POLICY "Providers are viewable by all" ON providers FOR SELECT USING (true);
CREATE POLICY "Admins can manage providers" ON providers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Help Requests: Beneficiaries manage their own; Helpers view masked open requests
CREATE POLICY "Beneficiaries can see their own requests" ON help_requests FOR SELECT USING (
  beneficiary_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Helpers can view un-confidential request info" ON help_requests FOR SELECT USING (
  status NOT IN ('cancelled')
);
CREATE POLICY "Beneficiaries can insert requests" ON help_requests FOR INSERT WITH CHECK (
  auth.uid() = beneficiary_id
);
CREATE POLICY "Beneficiaries can update their requests" ON help_requests FOR UPDATE USING (
  auth.uid() = beneficiary_id
);
```
