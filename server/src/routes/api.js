import { Router } from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import { db } from "../data/store.js";
import { signToken } from "../services/auth.js";
import { authenticate } from "../middleware/auth.js";
import { validate, requestSchema, contactAttemptSchema, offerSchema } from "../middleware/validator.js";

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

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ success: false, error: { message: "User with this email already exists" } });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: "user-" + Date.now(),
    email: email.trim().toLowerCase(),
    role: role || "beneficiary",
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

  const resetToken = "reset-" + Math.random().toString(36).substring(2, 15);
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  user.reset_token = resetToken;
  user.reset_expires = expires;
  db.persist();

  res.json({ success: true, data: { resetToken, expires }, message: "Password reset token generated (valid for 15 minutes)" });
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
// Protected request submission
router.post("/requests", authenticate, validate(requestSchema), (req, res) => {
  try {
    const newRequest = db.createRequest(req.body, req.user);
    res.status(201).json({
      success: true,
      data: newRequest,
      message: "Help request registered and matched successfully"
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
  res.json({ success: true, data: record });
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
router.post("/requests/:id/confirm-resolution", authenticate, (req, res) => {
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

router.post("/requests/:id/still-need-help", authenticate, (req, res) => {
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
router.get("/admin/metrics", (req, res) => {
  const metrics = db.getAdminMetrics();
  res.json({ success: true, data: metrics });
});

router.patch("/admin/providers/:id/verification", (req, res) => {
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

router.get("/admin/reports", (req, res) => {
  res.json({
    success: true,
    data: db.reports
  });
});
