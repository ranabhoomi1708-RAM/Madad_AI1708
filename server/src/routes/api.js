import { randomBytes } from "crypto"; import { Router } from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import { db } from "../data/store.js";
import { signToken } from "../services/auth.js";
import { authenticate, optionalAuth, requireAdmin, isAdminUser } from "../middleware/auth.js";
import { validate, requestSchema, contactAttemptSchema, offerSchema } from "../middleware/validator.js";
import smsAdapter from '../services/smsAdapter.js';
import { createRateLimiter } from "../middleware/rateLimit.js";

const requestLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, name: "requests" });

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  }
});

export const router = Router();

// 1. Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "operational",
      platform: "MADAD Social Impact Engine",
      mode: process.env.SUPABASE_URL ? "live" : "demo_resilient",
      providers_count: db.providers.length,
      requests_count: db.requests.length,
      timestamp: new Date().toISOString()
    }
  });
});

// 2. Authentication
router.post("/auth/register", async (req, res) => {
  const { email, full_name, password, city, state, role } = req.body;
  if (!email || !full_name || !password) {
    return res.status(400).json({ success: false, error: { message: "Email, full name and password required" } });
  }

  const requestedRole = String(role || "beneficiary").toLowerCase();
  if (!["beneficiary", "volunteer"].includes(requestedRole)) {
    return res.status(400).json({ success: false, error: { message: "Role must be beneficiary or volunteer" } });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ success: false, error: { message: "User with this email already exists" } });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: "user-" + Date.now(),
    email: email.trim().toLowerCase(),
    role: requestedRole,
    full_name: full_name.trim(),
    city: city || "Delhi",
    state: state || "Delhi",
    password_hash: passwordHash,
    reset_token: null,
    reset_expires: null
  };

  db.users.push(newUser);
  db.persist();

  const token = signToken({ id: newUser.id, email: newUser.email, role: newUser.role });
  const { password_hash, ...safeUser } = newUser;
  res.status(201).json({ success: true, data: { user: safeUser, token }, message: "Account registered successfully" });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: { message: "Email and password required" } });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ success: false, error: { message: "Invalid credentials" } });
  }

  if (user.password_hash) {
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: { message: "Invalid credentials" } });
    }
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  const { password_hash, ...safeUser } = user;
  res.json({ success: true, data: { user: safeUser, token }, message: "Authenticated successfully" });
});

router.post("/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: { message: "Email required" } });

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(404).json({ success: false, error: { message: "User not found" } });

  const resetToken = "reset-" + randomBytes(16).toString("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  user.reset_token = resetToken;
  user.reset_expires = expires;
  db.persist();

  console.log("[Password reset] Token for " + user.email + ": " + resetToken + " (valid 15 min)"); if (process.env.EXPOSE_RESET_TOKEN === "true") { return res.json({ success: true, data: { resetToken, expires }, message: "Password reset token generated (valid for 15 minutes)" }); } res.json({ success: true, message: "If this email is registered, a reset code has been issued." });
});

router.post("/auth/reset-password", async (req, res) => {
  const { email, resetToken, newPassword } = req.body;
  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({ success: false, error: { message: "Email, reset token and new password required" } });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(404).json({ success: false, error: { message: "User not found" } });

  if (user.reset_token !== resetToken || new Date() > new Date(user.reset_expires)) {
    return res.status(400).json({ success: false, error: { message: "Invalid or expired reset token" } });
  }

  user.password_hash = await bcrypt.hash(newPassword, 10);
  user.reset_token = null;
  user.reset_expires = null;
  db.persist();

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  const { password_hash, ...safeUser } = user;
  res.json({ success: true, data: { user: safeUser, token }, message: "Password reset successful" });
});

// 3. Providers
router.get("/providers", (req, res) => {
  const { category, city, state, verification_status, availability_status, search } = req.query;
  const providers = db.getProviders({ category, city, state, verification_status, availability_status, search });
  res.json({
    success: true,
    data: providers,
    meta: { total: providers.length }
  });
});

router.get("/providers/:id", (req, res) => {
  const provider = db.getProviderById(req.params.id);
  if (!provider) {
    return res.status(404).json({ success: false, error: { message: "Provider not found" } });
  }
  res.json({ success: true, data: provider });
});

// 4. Assistance Requests
// Anonymous beneficiaries are allowed. Helper mode (filing on someone's behalf)
// needs a logged-in Volunteer, and helper_id always comes from the login.
router.post("/requests", requestLimiter, optionalAuth, (req, res, next) => {
  if (req.body && req.body.helper_mode === true) {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Login required to submit a request on someone's behalf" } });
    }
    if (String(req.user.role).toLowerCase() !== "volunteer") {
      return res.status(403).json({ success: false, error: { message: "Only volunteers can submit a request on someone's behalf" } });
    }
  }
  next();
}, validate(requestSchema), async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.helper_id; // never trust a client-sent helper id

    const helperMode = body.helper_mode === true;
    if (helperMode) {
      if (body.proxy_consent !== true) {
        return res.status(400).json({ success: false, error: { message: "The beneficiary's consent is required to submit on their behalf" } });
      }
      body.helper_id = req.user.id;
    } else {
      delete body.proxy_consent;
    }
    delete body.helper_mode;

    const countBefore = db.requests.length;
    const newRequest = await db.createRequest(body, helperMode ? null : req.user);
    const isDuplicate = db.requests.length === countBefore;

    // SMS only for genuinely new requests; a failed SMS must not fail the request
    if (!isDuplicate) {
      try {
        const smsMsg = `Your MADAD request ${newRequest.tracking_code} has been registered. Our team will contact you soon.`;
        await smsAdapter.send(smsMsg, newRequest.id, newRequest.contact_phone);
      } catch (smsErr) {
        console.error("SMS send failed:", smsErr.message);
      }
    }

    // Never send the full phone number back
    const { contact_phone, ...safeRequest } = newRequest;
    res.status(isDuplicate ? 200 : 201).json({
      success: true,
      data: safeRequest,
      message: isDuplicate
        ? "You already have an open request in this category. We linked you to it."
        : "Help request registered and matched successfully"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// Public case tracking by unique code
router.get("/requests/track/:code", (req, res) => {
  const record = db.getRequestByTrackingCode(req.params.code);
  if (!record) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: `No request found with tracking code: ${req.params.code}` }
    });
  }
  // Public endpoint: expose only non-sensitive fields (never the phone number)
  const { contact_phone, helper_id, beneficiary_id, voice_note_url, ...publicRecord } = record;
  res.json({ success: true, data: publicRecord });
});

// User-specific requests
router.get("/users/:id/requests", authenticate, (req, res) => {
  const requestedId = req.params.id;
  if (req.user.id !== requestedId) {
    return res.status(403).json({ success: false, error: { message: "Access denied" } });
  }
  const userRequests = db.requests.filter(r => r.beneficiary_id === requestedId);
  res.json({ success: true, data: userRequests });
});

// Only the request owner, the volunteer who filed it, an admin, or someone holding the tracking code may act on a request
function ownsRequest(req, res, next) {
  const record = db.getRequestById(req.params.id);
  if (!record) {
    return res.status(404).json({ success: false, error: { message: "Request not found" } });
  }
  const u = req.user;
  const isOwner = record.beneficiary_id === u.id || record.helper_id === u.id;
  const hasCode = !!(req.body && req.body.tracking_code && req.body.tracking_code === record.tracking_code);
  if (isOwner || hasCode || isAdminUser(u)) return next();
  return res.status(403).json({ success: false, error: { message: "You can only update your own request" } });
}

// 5. Contact Attempts & Smart Fallback
router.post("/requests/:id/contact-attempts", authenticate, validate(contactAttemptSchema), (req, res) => {
  try {
    const { provider_id, outcome, notes } = req.body;
    const result = db.recordContactAttempt(req.params.id, provider_id, outcome, notes, req.user.id);
    res.status(201).json({
      success: true,
      data: result,
      message: "Contact attempt recorded and timeline updated"
    });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// 6. User-Confirmed Resolution
router.post("/requests/:id/confirm-resolution", authenticate, ownsRequest, (req, res) => {
  try {
    const { feedback_rating, comments, provider_id } = req.body;
    const updated = db.confirmResolution(req.params.id, { rating: feedback_rating, comments, provider_id });
    res.json({
      success: true,
      data: updated,
      message: "Thank you for confirming. Your case has been marked as resolved by user confirmation."
    });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post("/requests/:id/still-need-help", authenticate, ownsRequest, (req, res) => {
  try {
    const { notes } = req.body;
    const updated = db.stillNeedHelp(req.params.id, notes);
    res.json({
      success: true,
      data: updated,
      message: "Case kept open. Alternative providers are ready for contact."
    });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// 7. Give Help
router.get("/give-help/feed", (req, res) => {
  const { category, city, urgency } = req.query;
  const feed = db.getGiveHelpFeed({ category, city, urgency });
  res.json({ success: true, data: feed });
});

router.post("/give-help/requests/:id/offer", authenticate, validate(offerSchema), (req, res) => {
  try {
    const offer = db.submitAssistanceOffer(req.params.id, req.body);
    res.status(201).json({
      success: true,
      data: offer,
      message: "Your assistance offer was recorded. Beneficiary will be notified."
    });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// 8. Admin Dashboard
router.get("/admin/metrics", requireAdmin, (req, res) => {
  const metrics = db.getAdminMetrics();
  res.json({ success: true, data: metrics });
});

router.patch("/admin/providers/:id/verification", requireAdmin, (req, res) => {
  const { status, notes, admin_name } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, error: { message: "Status required" } });
  }
  const updated = db.updateProviderVerification(req.params.id, status, notes, admin_name);
  if (!updated) {
    return res.status(404).json({ success: false, error: { message: "Provider not found" } });
  }
  res.json({ success: true, data: updated, message: "Provider verification status updated" });
});

// 9. Voice Notes Upload
router.post("/requests/:id/voice-note", upload.single("voice"), (req, res) => {
  try {
    const reqRecord = db.getRequestById(req.params.id);
    if (!reqRecord) {
      return res.status(404).json({ success: false, error: { message: "Request not found" } });
    }
    const voiceUrl = `/uploads/voice-${req.params.id}-${Date.now()}.webm`;
    reqRecord.voice_note_url = voiceUrl;
    db.persist();

    res.status(201).json({
      success: true,
      data: { voice_note_url: voiceUrl },
      message: "Consent-based voice note uploaded and securely attached to case."
    });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// 10. Abuse & Suspicious Activity Reporting
router.post("/reports", (req, res) => {
  try {
    const { target_type, target_id, target_name, reason, reporter_contact } = req.body;
    if (!reason || !target_id) {
      return res.status(400).json({ success: false, error: { message: "Target ID and reason are required" } });
    }

    const report = {
      id: "rep-" + Date.now(),
      target_type: target_type || "provider",
      target_id,
      target_name: target_name || "Unknown Entity",
      reason,
      reporter_contact: reporter_contact ? db.maskPhone(reporter_contact) : "Anonymous",
      status: "pending_investigation",
      created_at: new Date().toISOString()
    };

    db.reports.push(report);
    db.persist();

    res.status(201).json({
      success: true,
      data: report,
      message: "Report logged. Platform administrator will investigate."
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get("/admin/reports", requireAdmin, (req, res) => {
  res.json({
    success: true,
    data: db.reports
  });
});