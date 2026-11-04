import { db } from "./src/data/store.js";
import { matchProviders } from "./src/services/matcher.js";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("==================================================");
console.log("       MADAD AUTOMATED QA & INTEGRITY SUITE       ");
console.log("==================================================");

// TEST 1 — SUBMIT HELP REQUEST
console.log("\n[1] Testing Help Request Submission & ID Generation...");
const testReqPayload = {
  category: "education",
  title: "School books needed for 7th class student",
  description: "Unable to buy science textbook and notebook set in Janakpuri New Delhi.",
  city: "New Delhi",
  state: "Delhi",
  pin_code: "110058",
  urgency: "urgent",
  assistance_type: "Books & Study Materials",
  phone: "+91 98119 87654",
  consent_given: true
};

const created = db.createRequest(testReqPayload);
assert(created.id && created.id.startsWith("req-"), "Genuine request ID generated");
assert(created.tracking_code && created.tracking_code.startsWith("MD-"), "Valid tracking code generated");
assert(created.status === "matched", "Request status initiated as matched");
assert(created.contact_phone_masked.includes("••••"), "Beneficiary telephone number is masked for privacy");

// TEST 2 — PROVIDER MATCHING ENGINE
console.log("\n[2] Testing Deterministic Provider Matching...");
const matches = created.matches;
assert(matches.length >= 2, "Matching returned top match and alternatives");
assert(matches[0].is_best_match === true, "Top ranked match designated as best match");
assert(matches[0].match_score > 70, "Best match achieved high relevance score");
assert(matches[0].rationale.length > 0, "Deterministic explainable rationale provided");
console.log(`   Best Match: "${matches[0].provider.name}" (${matches[0].match_score}% Score)`);
console.log(`   Rationale: ${matches[0].rationale.join(" | ")}`);

// TEST 3 — CONTACT PROVIDER
console.log("\n[3] Testing Calling Provider & Outcome Recording...");
const providerId = matches[0].provider.id;
const contactRes = db.recordContactAttempt(created.id, providerId, "connected", "Spoke with coordinator; asked to visit center.");
assert(contactRes.attempt.outcome === "connected", "Contact outcome recorded accurately");
assert(contactRes.request.status === "contact_attempted", "Case status transitioned to contact_attempted");

// TEST 4 — SMART FALLBACK (First Provider Cannot Help)
console.log("\n[4] Testing Smart Fallback when Provider Cannot Help...");
const fallbackRes = db.recordContactAttempt(created.id, providerId, "provider_cannot_help", "Stock of textbooks currently exhausted.");
assert(fallbackRes.request.status === "unresolved", "Request remains active/unresolved instead of dead-ending");
assert(fallbackRes.request.matches.length > 1, "Alternative providers remain readily available for contact");
assert(fallbackRes.request.timeline.some(t => t.update_title.includes("Smart Fallback")), "Timeline records smart fallback event");

// TEST 5 — HELP PROMISED BUT NOT CONFIRMED RESOLVED
console.log("\n[5] Testing Help Promised (Must NOT close case prematurely)...");
const altProviderId = matches[1].provider.id;
const promisedRes = db.recordContactAttempt(created.id, altProviderId, "help_promised", "Agreed to supply books tomorrow.");
assert(promisedRes.request.status === "assistance_promised", "Status is assistance_promised");
assert(promisedRes.request.status !== "resolved_by_user_confirmation", "Case is strictly NOT marked resolved merely on promise");

// TEST 6 — USER-CONFIRMED RESOLUTION (Most Important Product Principle)
console.log("\n[6] Testing User-Confirmed Resolution...");
const resolved = db.confirmResolution(created.id, {
  feedback_rating: 5,
  comments: "Received all textbooks directly from Vidya Deep. Extremely grateful.",
  provider_id: altProviderId
});
assert(resolved.status === "resolved_by_user_confirmation", "Status is strictly resolved_by_user_confirmation");
assert(resolved.resolved_confirmed_at !== null, "Confirmation timestamp recorded");
assert(resolved.timeline.some(t => t.update_title === "Help Confirmed by Beneficiary"), "Confirmed milestone in timeline");

// TEST 7 — STILL NEED HELP HANDLING (Never Force Close)
console.log("\n[7] Testing 'No, I Still Need Help' Workflow...");
const req2 = db.createRequest({
  category: "food_and_essentials",
  title: "Dry ration kit needed",
  description: "Temporary wage loss in Lucknow",
  city: "Lucknow",
  phone: "+91 94151 22334",
  consent_given: true
});
const stillNeed = db.stillNeedHelp(req2.id, "Prior provider was out of stock.");
assert(stillNeed.status === "unresolved", "Status maintained as unresolved");
assert(stillNeed.timeline.some(t => t.update_title.includes("Continued Support Requested")), "Continuity logged in timeline");

// TEST 8 — GIVE HELP & PRIVACY SHIELD
console.log("\n[8] Testing Give Help Feed & Assistance Offer...");
const publicFeed = db.getGiveHelpFeed();
assert(publicFeed.length > 0, "Public feed populated with open cases");
assert(!publicFeed[0].phone, "Beneficiary phone number is NOT exposed in public feed");

const offer = db.submitAssistanceOffer(req2.id, {
  message: "Can provide 5kg flour and rice pack.",
  helper_name: "Anita Deshmukh",
  phone: "+91 98200 11223"
});
assert(offer.id && offer.status === "offered", "Assistance offer created");
const updatedReq2 = db.getRequestByTrackingCode(req2.tracking_code);
assert(updatedReq2.status !== "resolved_by_user_confirmation", "Volunteer offer does NOT prematurely mark request resolved");

// TEST 9 — ADMIN VERIFICATION AUDIT
console.log("\n[9] Testing Admin Provider Verification...");
const unverifiedProvider = db.providers.find(p => p.verification_status === "unverified") || db.providers[db.providers.length - 1];
const prevStatus = unverifiedProvider.verification_status;
const audited = db.updateProviderVerification(unverifiedProvider.id, "verified", "80G registration and on-site inspection verified.");
assert(audited.verification_status === "verified", "Verification status updated to verified");
assert(audited.verified_at !== null, "Verification audit timestamp saved");

// TEST 10 — REAL DATABASE METRICS
console.log("\n[10] Testing Platform Governance Metrics...");
const metrics = db.getAdminMetrics();
assert(metrics.requests.total >= 4, "Metrics accurately reflect total request count");
assert(metrics.requests.resolved_by_user_confirmation >= 2, "Only explicitly confirmed resolutions counted in metrics");
assert(metrics.providers.verified >= 1, "Verified provider count is accurate");

console.log("\n==================================================");
console.log("       ALL 10 QA & LIFECYCLE TESTS PASSED!        ");
console.log("==================================================");
