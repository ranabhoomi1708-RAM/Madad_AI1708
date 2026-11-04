// SQLite wrapper for MADAD backend
// Using better-sqlite3 for synchronous queries (suitable for simple API server)

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB file lives in the server folder; will be created automatically if missing
const dbPath = path.resolve(__dirname, '../madad.db');
const db = new Database(dbPath);

// Initialise schema if not present
function initSchema() {
  // Providers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      categories TEXT,          -- JSON array
      city TEXT,
      state TEXT,
      service_areas TEXT,       -- JSON array of strings
      contact_phone TEXT,
      contact_email TEXT,
      eligibility TEXT,        -- free‑form text
      documentation TEXT,       -- free‑form text
      source TEXT,
      last_checked TEXT,
      verification_status TEXT,
      availability_status TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  // Requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      tracking_code TEXT UNIQUE,
      beneficiary_id TEXT,
      beneficiary_name TEXT,
      category TEXT,
      title TEXT,
      description TEXT,
      city TEXT,
      state TEXT,
      pin_code TEXT,
      urgency TEXT,
      assistance_type TEXT,
      preferred_contact_method TEXT,
      contact_phone TEXT,
      contact_phone_masked TEXT,
      voice_note_path TEXT,
      consent_given INTEGER,
      status TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  // Request timeline / case updates
  db.exec(`
    CREATE TABLE IF NOT EXISTS case_updates (
      id TEXT PRIMARY KEY,
      request_id TEXT,
      status_to TEXT,
      update_title TEXT,
      update_description TEXT,
      created_at TEXT,
      FOREIGN KEY(request_id) REFERENCES requests(id)
    );
  `);

  // Contact attempts
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_attempts (
      id TEXT PRIMARY KEY,
      request_id TEXT,
      provider_id TEXT,
      provider_name TEXT,
      outcome TEXT,
      notes TEXT,
      attempted_at TEXT,
      FOREIGN KEY(request_id) REFERENCES requests(id),
      FOREIGN KEY(provider_id) REFERENCES providers(id)
    );
  `);

  // Assistance offers (give‑help)
  db.exec(`
    CREATE TABLE IF NOT EXISTS assistance_offers (
      id TEXT PRIMARY KEY,
      request_id TEXT,
      helper_name TEXT,
      helper_email TEXT,
      helper_phone_masked TEXT,
      message TEXT,
      status TEXT,
      created_at TEXT,
      FOREIGN KEY(request_id) REFERENCES requests(id)
    );
  `);

  // Provider safety reports
  db.exec(`
    CREATE TABLE IF NOT EXISTS safety_reports (
      id TEXT PRIMARY KEY,
      provider_id TEXT,
      reporter_name TEXT,
      reporter_email TEXT,
      allegation TEXT,
      evidence TEXT,
      status TEXT,
      created_at TEXT,
      FOREIGN KEY(provider_id) REFERENCES providers(id)
    );
  `);

  // Users table – includes password hash for real auth.
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      role TEXT,
      full_name TEXT,
      city TEXT,
      state TEXT,
      password_hash TEXT,
      reset_token TEXT,
      reset_expires TEXT
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      role TEXT,
      full_name TEXT,
      city TEXT,
      state TEXT
    );
  `);
}

initSchema();

export const DB = db;
