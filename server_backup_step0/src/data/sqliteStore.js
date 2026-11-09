import { DB } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { matchProviders } from '../../services/matcher.js';
import { maskPhone } from '../../services/utils.js'; // we'll create a simple util

/** Helper to parse JSON columns */
function parseJSON(col) {
  try {
    return JSON.parse(col);
  } catch {
    return [];
  }
}

export const sqliteStore = {
  // ---------- PROVIDERS ----------
  getProviders(filters = {}) {
    let query = `SELECT * FROM providers`;
    const conditions = [];
    const params = {};
    if (filters.category && filters.category !== 'all') {
      conditions.push(`json_each.value = @category`);
      params.category = filters.category;
    }
    if (filters.city) {
      conditions.push(`(city LIKE @city OR service_areas LIKE @city)`);
      params.city = `%${filters.city}%`;
    }
    if (filters.state) {
      conditions.push(`state = @state`);
      params.state = filters.state;
    }
    if (filters.verification_status && filters.verification_status !== 'all') {
      conditions.push(`verification_status = @vs`);
      params.vs = filters.verification_status;
    }
    if (filters.availability_status && filters.availability_status !== 'all') {
      conditions.push(`availability_status = @as`);
      params.as = filters.availability_status;
    }
    if (filters.search) {
      conditions.push(`(name LIKE @search OR description LIKE @search OR documentation LIKE @search)`);
      params.search = `%${filters.search}%`;
    }
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    const stmt = DB.prepare(query);
    const rows = stmt.all(params);
    // parse JSON columns
    return rows.map(p => ({
      ...p,
      categories: parseJSON(p.categories),
      service_areas: parseJSON(p.service_areas)
    }));
  },

  getProviderById(id) {
    const row = DB.prepare('SELECT * FROM providers WHERE id = ?').get(id);
    if (!row) return null;
    return { ...row, categories: parseJSON(row.categories), service_areas: parseJSON(row.service_areas) };
  },

  // ---------- REQUESTS ----------
  createRequest(data, user = null) {
    const trackingCode = `MD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2,7).toUpperCase()}`;
    const requestId = `req-${Date.now()}`;
    const now = new Date().toISOString();
    const masked = maskPhone(data.phone);
    const newReq = {
      id: requestId,
      tracking_code: trackingCode,
      beneficiary_id: user ? user.id : (data.beneficiary_id || `guest-${Date.now()}`),
      beneficiary_name: user ? user.full_name : (data.beneficiary_name || 'Beneficiary'),
      category: data.category,
      title: data.title,
      description: data.description,
      city: data.city,
      state: data.state || 'State',
      pin_code: data.pin_code || '',
      urgency: data.urgency || 'standard',
      assistance_type: data.assistance_type || `${data.category.replace(/_/g, ' ')} Support`,
      preferred_contact_method: data.preferred_contact_method || 'phone',
      contact_phone: data.phone || '',
      contact_phone_masked: masked,
      voice_note_path: data.voice_note_path || null,
      consent_given: data.consent_given ? 1 : 0,
      status: 'matched',
      created_at: now,
      updated_at: now
    };
    const insert = DB.prepare(`INSERT INTO requests (${Object.keys(newReq).join(',')}) VALUES (${Object.keys(newReq).map(k=>`@${k}`).join(',')})`);
    insert.run(newReq);

    // compute matches using matcher against providers
    const providers = this.getProviders();
    const matches = matchProviders(newReq, providers);
    // store matches as JSON in a separate table or embed in request (for simplicity, we embed as a virtual field, not persisted)
    newReq.matches = matches;

    // initial timeline entry
    DB.prepare(`INSERT INTO case_updates (id, request_id, status_to, update_title, update_description, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(
      `upd-${Date.now()}`,
      requestId,
      'matched',
      'Request Registered & Initial Matches Identified',
      `Case initialized in ${newReq.city}. Found ${matches.length} matching support providers.`,
      now
    );
    return newReq;
  },

  getRequestByTrackingCode(trackingCode) {
    const req = DB.prepare('SELECT * FROM requests WHERE tracking_code = ?').get(trackingCode);
    if (!req) return null;
    // retrieve matches on the fly
    const providers = this.getProviders();
    const matches = matchProviders(req, providers);
    // timeline
    const timeline = DB.prepare('SELECT * FROM case_updates WHERE request_id = ? ORDER BY created_at').all(req.id);
    const attempts = DB.prepare('SELECT * FROM contact_attempts WHERE request_id = ? ORDER BY attempted_at DESC').all(req.id);
    const offers = DB.prepare('SELECT * FROM assistance_offers WHERE request_id = ?').all(req.id);
    return { ...req, matches, timeline, contact_attempts: attempts, assistance_offers: offers };
  },

  // ---------- CONTACT ATTEMPTS ----------
  recordContactAttempt(requestId, providerId, outcome, notes = '', userId = null) {
    const req = DB.prepare('SELECT * FROM requests WHERE id = ?').get(requestId);
    if (!req) throw new Error('Request not found');
    const provider = this.getProviderById(providerId);
    const now = new Date().toISOString();
    const attempt = {
      id: `att-${Date.now()}`,
      request_id: requestId,
      provider_id: providerId,
      provider_name: provider ? provider.name : 'Provider',
      outcome,
      notes,
      attempted_at: now
    };
    DB.prepare(`INSERT INTO contact_attempts (${Object.keys(attempt).join(',')}) VALUES (${Object.keys(attempt).map(k=>`@${k}`).join(',')})`).run(attempt);

    // Update request status based on outcome (same logic as in-memory store)
    let newStatus = req.status;
    let title = `Contact Attempt: ${attempt.provider_name}`;
    let description = `Outcome recorded as: ${outcome.replace(/_/g, ' ')}. ${notes}`;
    if (outcome === 'help_promised') {
      newStatus = 'assistance_promised';
      title = `Assistance Promised by ${attempt.provider_name}`;
      description = 'Provider indicated willingness to assist. Waiting for actual delivery of support.';
    } else if (outcome === 'provider_cannot_help' || outcome === 'number_unavailable') {
      newStatus = 'unresolved';
      title = `${attempt.provider_name} Unable to Assist — Smart Fallback Activated`;
      description = 'Provider could not assist. Suggesting alternative verified resources.';
    } else {
      newStatus = 'contact_attempted';
    }
    DB.prepare('UPDATE requests SET status = ?, updated_at = ? WHERE id = ?').run(newStatus, now, requestId);
    DB.prepare(`INSERT INTO case_updates (id, request_id, status_to, update_title, update_description, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(
      `upd-${Date.now()}`,
      requestId,
      newStatus,
      title,
      description,
      now
    );
    // return refreshed request data with timeline
    const refreshed = this.getRequestByTrackingCode(req.tracking_code);
    return { attempt, request: refreshed };
  },

  // ---------- USER CONFIRMED RESOLUTION ----------
  confirmResolution(requestId, feedbackData = {}) {
    const req = DB.prepare('SELECT * FROM requests WHERE id = ?').get(requestId);
    if (!req) throw new Error('Request not found');
    const now = new Date().toISOString();
    DB.prepare('UPDATE requests SET status = ?, updated_at = ?, resolved_confirmed_at = ?, resolution_notes = ? WHERE id = ?')
      .run('resolved_by_user_confirmation', now, now, feedbackData.comments || 'Beneficiary confirmed help was received.', requestId);
    // feedback record (optional)
    DB.prepare(`INSERT INTO feedback (id, request_id, provider_id, help_received, rating, comments, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      `fb-${Date.now()}`,
      requestId,
      feedbackData.provider_id || null,
      1,
      feedbackData.rating || 5,
      feedbackData.comments || '',
      now
    );
    DB.prepare(`INSERT INTO case_updates (id, request_id, status_to, update_title, update_description, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(
      `upd-${Date.now()}`,
      requestId,
      'resolved_by_user_confirmation',
      'Help Confirmed by Beneficiary',
      'User explicitly verified that assistance was received. Case marked successfully resolved.',
      now
    );
    return this.getRequestByTrackingCode(req.tracking_code);
  },

  // ---------- STILL NEED HELP ----------
  stillNeedHelp(requestId, notes = '') {
    const req = DB.prepare('SELECT * FROM requests WHERE id = ?').get(requestId);
    if (!req) throw new Error('Request not found');
    const now = new Date().toISOString();
    DB.prepare('UPDATE requests SET status = ?, updated_at = ? WHERE id = ?').run('unresolved', now, requestId);
    DB.prepare(`INSERT INTO case_updates (id, request_id, status_to, update_title, update_description, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(
      `upd-${Date.now()}`,
      requestId,
      'unresolved',
      'Continued Support Requested',
      `Beneficiary confirmed assistance is still needed. Note: ${notes}`,
      now
    );
    return this.getRequestByTrackingCode(req.tracking_code);
  },

  // ---------- ASSISTANCE OFFERS ----------
  submitAssistanceOffer(requestId, helperData) {
    const req = DB.prepare('SELECT * FROM requests WHERE id = ?').get(requestId);
    if (!req) throw new Error('Request not found');
    const now = new Date().toISOString();
    const offer = {
      id: `off-${Date.now()}`,
      request_id: requestId,
      helper_name: helperData.helper_name || 'Community Volunteer',
      helper_email: helperData.email || '',
      helper_phone_masked: maskPhone(helperData.phone || ''),
      message: helperData.message,
      status: 'offered',
      created_at: now
    };
    DB.prepare(`INSERT INTO assistance_offers (${Object.keys(offer).join(',')}) VALUES (${Object.keys(offer).map(k=>`@${k}`).join(',')})`).run(offer);
    DB.prepare('UPDATE requests SET status = ?, updated_at = ? WHERE id = ?').run('assistance_offered', now, requestId);
    DB.prepare(`INSERT INTO case_updates (id, request_id, status_to, update_title, update_description, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(
      `upd-${Date.now()}`,
      requestId,
      'assistance_offered',
      'Assistance Offered by Community Helper',
      `Volunteer offered: "${helperData.message}". Waiting for beneficiary coordination.`,
      now
    );
    return offer;
  },

  // ---------- SAFETY REPORTS ----------
  createSafetyReport(providerId, report) {
    const now = new Date().toISOString();
    const sr = {
      id: `sr-${Date.now()}`,
      provider_id: providerId,
      reporter_name: report.reporter_name,
      reporter_email: report.reporter_email,
      allegation: report.allegation,
      evidence: report.evidence || '',
      status: 'pending',
      created_at: now
    };
    DB.prepare(`INSERT INTO safety_reports (${Object.keys(sr).join(',')}) VALUES (${Object.keys(sr).map(k=>`@${k}`).join(',')})`).run(sr);
    return sr;
  },

  // ---------- ADMIN METRICS ----------
  getAdminMetrics() {
    const totalRequests = DB.prepare('SELECT COUNT(*) as c FROM requests').get().c;
    const newRequests = DB.prepare('SELECT COUNT(*) as c FROM requests WHERE status IN ("submitted", "matching_in_progress")').get().c;
    const matchedRequests = DB.prepare('SELECT COUNT(*) as c FROM requests WHERE status = "matched"').get().c;
    const inProgress = DB.prepare('SELECT COUNT(*) as c FROM requests WHERE status IN ("contact_attempted", "awaiting_provider_response", "assistance_offered", "assistance_promised")').get().c;
    const resolved = DB.prepare('SELECT COUNT(*) as c FROM requests WHERE status = "resolved_by_user_confirmation"').get().c;
    const unresolved = DB.prepare('SELECT COUNT(*) as c FROM requests WHERE status = "unresolved"').get().c;
    const totalProviders = DB.prepare('SELECT COUNT(*) as c FROM providers').get().c;
    const verifiedProviders = DB.prepare('SELECT COUNT(*) as c FROM providers WHERE verification_status = "verified"').get().c;
    const pendingProviders = DB.prepare('SELECT COUNT(*) as c FROM providers WHERE verification_status IN ("pending", "unverified")').get().c;
    const totalOffers = DB.prepare('SELECT COUNT(*) as c FROM assistance_offers').get().c;
    return {
      requests: { total: totalRequests, new: newRequests, matched: matchedRequests, inProgress, resolved, unresolved },
      providers: { total: totalProviders, verified: verifiedProviders, pending: pendingProviders },
      offers: totalOffers
    };
  }
};
