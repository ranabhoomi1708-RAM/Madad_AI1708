import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SEED_PROVIDERS, SEED_REQUESTS } from "./seedData.js";
import { matchProviders } from "../services/matcher.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_FILE = process.env.MADAD_DATA_FILE ? path.resolve(process.env.MADAD_DATA_FILE) : path.resolve(__dirname, "../../data/madad_store.json");
class DataStore {
  constructor() {
    this.providers = [...SEED_PROVIDERS];
    this.requests = [...SEED_REQUESTS];
    this.contactAttempts = [];
    this.caseUpdates = [];
    this.assistanceOffers = [];
    this.feedback = [];
    this.reports = [];
    this.users = [
      {
        id: "user-admin-01",
        email: "admin@madad.gov.in",
        role: "admin",
        full_name: "MADAD Lead Administrator",
        city: "New Delhi",
        state: "Delhi"
      },
      {
        id: "user-demo-ben1",
        email: "ramesh@example.com",
        role: "beneficiary",
        full_name: "Ramesh Sharma",
        city: "New Delhi",
        state: "Delhi"
      },
      {
        id: "user-demo-helper1",
        email: "helper@example.com",
        role: "helper",
        full_name: "Anita Deshmukh",
        city: "Mumbai",
        state: "Maharashtra"
      }
    ];

    this.initSeedRelations();
    this.loadFromDisk();
  }

  initSeedRelations() {
    for (const req of this.requests) {
      const matches = matchProviders(req, this.providers);
      req.matches = matches;

      this.caseUpdates.push({
        id: `upd-${req.id}-0`,
        request_id: req.id,
        status_to: req.status,
        update_title: "Request Registered",
        update_description: `Request created under ${req.category} for ${req.city}. Initial automated matching completed.`,
        created_at: req.created_at
      });

      if (req.status === "resolved_by_user_confirmation") {
        this.caseUpdates.push({
          id: `upd-${req.id}-1`,
          request_id: req.id,
          status_to: "resolved_by_user_confirmation",
          update_title: "Assistance Confirmed by Beneficiary",
          update_description: req.resolution_notes || "Beneficiary explicitly confirmed receipt of required assistance.",
          created_at: req.resolved_confirmed_at
        });
      }
    }
  }

  // --- PERSISTENCE: Save & Load from persistent JSON disk storage ---
  loadFromDisk() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
        const data = JSON.parse(raw);
        if (Array.isArray(data.users) && data.users.length) {
          // Merge users without losing existing demo users
          for (const u of data.users) {
            if (!this.users.find(existing => existing.id === u.id || existing.email.toLowerCase() === u.email.toLowerCase())) {
              this.users.push(u);
            }
          }
        }
        if (Array.isArray(data.requests) && data.requests.length) {
          for (const r of data.requests) {
            if (!this.requests.find(existing => existing.id === r.id)) {
              this.requests.unshift(r);
            }
          }
        }
        if (Array.isArray(data.contactAttempts)) this.contactAttempts = data.contactAttempts;
        if (Array.isArray(data.caseUpdates)) this.caseUpdates = data.caseUpdates;
        if (Array.isArray(data.assistanceOffers)) this.assistanceOffers = data.assistanceOffers;
        if (Array.isArray(data.feedback)) this.feedback = data.feedback;
        if (Array.isArray(data.reports)) this.reports = data.reports;
        console.log(`[DataStore] Loaded persistent storage from ${STORAGE_FILE}`);
      }
    } catch (err) {
      console.warn(`[DataStore] Could not load from disk storage:`, err.message);
    }
  }

  persist() {
    try {
      const dir = path.dirname(STORAGE_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const snapshot = {
        users: this.users,
        requests: this.requests,
        contactAttempts: this.contactAttempts,
        caseUpdates: this.caseUpdates,
        assistanceOffers: this.assistanceOffers,
        feedback: this.feedback,
        reports: this.reports,
        updated_at: new Date().toISOString()
      };
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(snapshot, null, 2), "utf-8");
    } catch (err) {
      console.warn(`[DataStore] Failed to write persistent storage:`, err.message);
    }
  }

  // Helper: Mask phone numbers for public display
  maskPhone(phone) {
    if (!phone) return "";
    const clean = phone.trim();
    if (clean.length < 6) return "••••••";
    return clean.slice(0, 6) + " •••• " + clean.slice(-2);
  }

  // --- PROVIDERS ---
  getProviders(filters = {}) {
    let result = [...this.providers];

    if (filters.category && filters.category !== "all") {
      result = result.filter(p => p.categories.includes(filters.category));
    }
    if (filters.city) {
      const c = filters.city.toLowerCase();
      result = result.filter(p => p.city.toLowerCase().includes(c) || p.service_areas.some(a => a.toLowerCase().includes(c)));
    }
    if (filters.state) {
      result = result.filter(p => p.state.toLowerCase() === filters.state.toLowerCase());
    }
    if (filters.verification_status && filters.verification_status !== "all") {
      result = result.filter(p => p.verification_status === filters.verification_status);
    }
    if (filters.availability_status && filters.availability_status !== "all") {
      result = result.filter(p => p.availability_status === filters.availability_status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.assistance_types.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }

  getProviderById(id) {
    return this.providers.find(p => p.id === id) || null;
  }

  updateProviderVerification(id, status, notes, adminName = "Admin") {
    const provider = this.getProviderById(id);
    if (!provider) return null;
    provider.verification_status = status;
    provider.verification_notes = notes || provider.verification_notes;
    provider.verified_at = new Date().toISOString();
    provider.verified_by = adminName;
    this.persist();
    return provider;
  }

  // --- HELP REQUESTS ---
  createRequest(data, user = null) {
      // Duplicate detection: same masked phone and category within 48h -> link to existing request
      const maskedPhone = this.maskPhone(data.phone);
      const now = Date.now();
      const existing = this.requests.find(r =>
        r.contact_phone === (data.phone || "") &&
        r.category === data.category &&
        r.status !== "resolved_by_user_confirmation" &&
        now - new Date(r.created_at).getTime() <= 48 * 60 * 60 * 1000);
      if (existing) {
        // Return existing request without creating a new one
        return existing;
      }

      const trackingCode = "MD-" + new Date().getFullYear() + "-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      const requestId = "req-" + Date.now();

      const newRequest = {
        id: requestId,
        tracking_code: trackingCode,
        beneficiary_id: user ? user.id : (data.beneficiary_id || "guest-" + Date.now()),
        beneficiary_name: user ? user.full_name : (data.beneficiary_name || "Beneficiary"),
        category: data.category,
        title: data.title,
        description: data.description,
        city: data.city,
        state: data.state || "State",
        pin_code: data.pin_code || "",
        urgency: data.urgency || "standard",
        assistance_type: data.assistance_type || "General Support",
        preferred_contact_method: data.preferred_contact_method || "phone",
        contact_phone: data.phone || "",
        contact_phone_masked: this.maskPhone(data.phone),
        status: "matched",
        voice_note_url: data.voice_note_url || null,
        consent_given: data.consent_given === true || data.consent_given === "true",
        helper_id: data.helper_id || null,
        proxy_consent: data.proxy_consent === true,
        // Store consent timestamp if proxy consent provided
        consent_timestamp: data.proxy_consent === true ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

    const matches = matchProviders(newRequest, this.providers);
    newRequest.matches = matches;

    this.requests.unshift(newRequest);

    this.caseUpdates.push({
      id: "upd-" + Date.now(),
      request_id: requestId,
      status_to: "matched",
      update_title: "Request Registered & Initial Matches Identified",
      update_description: `Case initialized in ${newRequest.city}. Found ${matches.length} matching support providers.`,
      created_at: newRequest.created_at
    });

    this.persist();
    return newRequest;
  }

  getRequestByTrackingCode(trackingCode) {
    const req = this.requests.find(r => r.tracking_code.toUpperCase() === trackingCode.toUpperCase());
    if (!req) return null;

    const matches = req.matches || matchProviders(req, this.providers);
    const timeline = this.caseUpdates.filter(u => u.request_id === req.id).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
    const attempts = this.contactAttempts.filter(a => a.request_id === req.id).sort((a,b) => new Date(b.attempted_at) - new Date(a.attempted_at));
    const offers = this.assistanceOffers.filter(o => o.request_id === req.id);

    return {
      ...req,
      matches,
      timeline,
      contact_attempts: attempts,
      assistance_offers: offers
    };
  }

  getRequestById(id) {
    return this.requests.find(r => r.id === id) || null;
  }

  // --- CONTACT ATTEMPTS & SMART FALLBACK ---
  recordContactAttempt(requestId, providerId, outcome, notes = "", userId = null) {
    const req = this.getRequestById(requestId);
    if (!req) throw new Error("Request not found");

    const provider = this.getProviderById(providerId);
    const provName = provider ? provider.name : "Provider";

    const attempt = {
      id: "att-" + Date.now(),
      request_id: requestId,
      provider_id: providerId,
      provider_name: provName,
      outcome,
      notes,
      attempted_at: new Date().toISOString()
    };

    this.contactAttempts.push(attempt);

    if (provider) {
      provider.total_contact_attempts = (provider.total_contact_attempts || 0) + 1;
    }

    let newStatus = req.status;
    let timelineTitle = `Contact Attempt: ${provName}`;
    let timelineDesc = `Outcome recorded as: ${outcome.replace(/_/g, ' ')}. ${notes}`;

    if (outcome === "help_promised") {
      newStatus = "assistance_promised";
      timelineTitle = `Assistance Promised by ${provName}`;
      timelineDesc = `Provider indicated willingness to assist. Waiting for actual delivery of support.`;
    } else if (outcome === "provider_cannot_help" || outcome === "number_unavailable") {
      newStatus = "unresolved";
      timelineTitle = `${provName} Unable to Assist — Smart Fallback Activated`;
      timelineDesc = `Provider could not assist. Suggesting alternative verified resources.`;
    } else {
      newStatus = "contact_attempted";
    }

    req.status = newStatus;
    req.updated_at = new Date().toISOString();

    this.caseUpdates.push({
      id: "upd-" + Date.now(),
      request_id: requestId,
      status_to: newStatus,
      update_title: timelineTitle,
      update_description: timelineDesc,
      created_at: new Date().toISOString()
    });

    this.persist();
    return { attempt, request: this.getRequestByTrackingCode(req.tracking_code) };
  }

  // --- USER-CONFIRMED RESOLUTION ---
  confirmResolution(requestId, feedbackData = {}) {
    const req = this.getRequestById(requestId);
    if (!req) throw new Error("Request not found");

    req.status = "resolved_by_user_confirmation";
    req.resolved_confirmed_at = new Date().toISOString();
    req.resolution_notes = feedbackData.comments || "Beneficiary confirmed help was received.";
    req.updated_at = new Date().toISOString();

    if (feedbackData.provider_id) {
      const provider = this.getProviderById(feedbackData.provider_id);
      if (provider) {
        provider.successful_resolutions = (provider.successful_resolutions || 0) + 1;
      }
    }

    this.feedback.push({
      id: "fb-" + Date.now(),
      request_id: requestId,
      provider_id: feedbackData.provider_id || null,
      help_received: true,
      rating: feedbackData.rating || 5,
      comments: feedbackData.comments || "",
      created_at: new Date().toISOString()
    });

    this.caseUpdates.push({
      id: "upd-" + Date.now(),
      request_id: requestId,
      status_to: "resolved_by_user_confirmation",
      update_title: "Help Confirmed by Beneficiary",
      update_description: `User explicitly verified that assistance was received. Case marked successfully resolved.`,
      created_at: req.resolved_confirmed_at
    });

    this.persist();
    return this.getRequestByTrackingCode(req.tracking_code);
  }

  // --- STILL NEED HELP ---
  stillNeedHelp(requestId, notes = "") {
    const req = this.getRequestById(requestId);
    if (!req) throw new Error("Request not found");

    req.status = "unresolved";
    req.updated_at = new Date().toISOString();

    this.caseUpdates.push({
      id: "upd-" + Date.now(),
      request_id: requestId,
      status_to: "unresolved",
      update_title: "Continued Support Requested",
      update_description: `Beneficiary confirmed assistance is still needed. Alternative options and community helper pool kept active. Note: ${notes}`,
      created_at: new Date().toISOString()
    });

    this.persist();
    return this.getRequestByTrackingCode(req.tracking_code);
  }

  // --- GIVE HELP ---
  getGiveHelpFeed(filters = {}) {
    let feed = this.requests.filter(r => r.status !== "resolved_by_user_confirmation" && r.status !== "cancelled");

    if (filters.category && filters.category !== "all") {
      feed = feed.filter(r => r.category === filters.category);
    }
    if (filters.city) {
      feed = feed.filter(r => r.city.toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.urgency && filters.urgency !== "all") {
      feed = feed.filter(r => r.urgency === filters.urgency);
    }

    return feed.map(r => ({
      id: r.id,
      tracking_code: r.tracking_code,
      category: r.category,
      title: r.title,
      description: r.description,
      city: r.city,
      state: r.state,
      urgency: r.urgency,
      assistance_type: r.assistance_type,
      status: r.status,
      created_at: r.created_at,
      beneficiary_initial: r.beneficiary_name ? r.beneficiary_name[0] + "." : "B."
    }));
  }

  submitAssistanceOffer(requestId, helperData) {
    const req = this.getRequestById(requestId);
    if (!req) throw new Error("Request not found");

    const offer = {
      id: "off-" + Date.now(),
      request_id: requestId,
      helper_name: helperData.helper_name || "Community Volunteer",
      helper_email: helperData.email || "",
      helper_phone_masked: this.maskPhone(helperData.phone || ""),
      message: helperData.message,
      status: "offered",
      created_at: new Date().toISOString()
    };

    this.assistanceOffers.push(offer);

    req.status = "assistance_offered";
    req.updated_at = new Date().toISOString();

    this.caseUpdates.push({
      id: "upd-" + Date.now(),
      request_id: requestId,
      status_to: "assistance_offered",
      update_title: "Assistance Offered by Community Helper",
      update_description: `Volunteer offered: "${helperData.message}". Waiting for beneficiary coordination.`,
      created_at: offer.created_at
    });

    this.persist();
    return offer;
  }

  // --- ADMIN METRICS ---
  getAdminMetrics() {
    const totalRequests = this.requests.length;
    const newRequests = this.requests.filter(r => r.status === "submitted" || r.status === "matching_in_progress").length;
    const matchedRequests = this.requests.filter(r => r.status === "matched").length;
    const inProgressRequests = this.requests.filter(r => ["contact_attempted", "awaiting_provider_response", "assistance_offered", "assistance_promised"].includes(r.status)).length;
    const resolvedConfirmed = this.requests.filter(r => r.status === "resolved_by_user_confirmation").length;
    const unresolved = this.requests.filter(r => r.status === "unresolved").length;

    const totalProviders = this.providers.length;
    const verifiedProviders = this.providers.filter(p => p.verification_status === "verified").length;
    const pendingProviders = this.providers.filter(p => p.verification_status === "pending" || p.verification_status === "unverified").length;
    const totalOffers = this.assistanceOffers.length;

    return {
      requests: {
        total: totalRequests,
        new: newRequests,
        matched: matchedRequests,
        in_progress: inProgressRequests,
        resolved_by_user_confirmation: resolvedConfirmed,
        unresolved: unresolved
      },
      providers: {
        total: totalProviders,
        verified: verifiedProviders,
        pending_verification: pendingProviders
      },
      offers: {
        total: totalOffers
      },
      case_updates_count: this.caseUpdates.length
    };
  }
}

export const db = new DataStore();
