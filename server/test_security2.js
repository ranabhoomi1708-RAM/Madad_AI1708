import os from "os";
import path from "path";
import fs from "fs";
import http from "http";

const run = Date.now();
const adminEmail = "admin_" + run + "@test.com";
process.env.MADAD_DATA_FILE = path.join(os.tmpdir(), "madad_test2_" + run + ".json");
process.env.ADMIN_EMAILS = adminEmail;
delete process.env.EXPOSE_RESET_TOKEN;

const { default: app } = await import("./src/app.js");
const { resetRateLimits } = await import("./src/middleware/rateLimit.js");
const server = http.createServer(app);
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = "http://127.0.0.1:" + server.address().port + "/api/v1";

let passed = 0, failed = 0;
function check(name, ok, detail) {
  if (ok) { passed++; console.log("✅ PASSED: " + name); }
  else { failed++; console.log("❌ FAILED: " + name + (detail ? "  -> " + detail : "")); }
}
async function call(method, url, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(base + url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) {}
  return { status: res.status, json, text };
}
async function reg(email, role) {
  const r = await call("POST", "/auth/register", { email, full_name: "Test User", password: "Passw0rd!", role });
  return { token: r.json?.data?.token, id: r.json?.data?.user?.id };
}
function reqBody(phone) {
  return { category: "education", title: "Need school books", description: "Need books for a class 8 student", city: "Delhi", assistance_type: "books", phone, consent_given: true };
}

console.log("==================================================");
console.log("   MADAD SECURITY TESTS 2 (admin, reset, ownership)");
console.log("==================================================");

const admin = await reg(adminEmail, "beneficiary");
const alice = await reg("alice_" + run + "@test.com", "beneficiary");
const bob = await reg("bob_" + run + "@test.com", "beneficiary");
check("Test accounts created", !!admin.token && !!alice.token && !!bob.token);

let r = await call("GET", "/admin/metrics");
check("l) Admin metrics without login -> 401", r.status === 401, "got " + r.status);
r = await call("GET", "/admin/metrics", undefined, alice.token);
check("m) Admin metrics as normal user -> 403", r.status === 403, "got " + r.status);
r = await call("GET", "/admin/metrics", undefined, admin.token);
check("n) Admin metrics as listed admin -> 200", r.status === 200, "got " + r.status);
r = await call("GET", "/admin/reports");
check("o) Admin reports without login -> 401", r.status === 401, "got " + r.status);
r = await call("PATCH", "/admin/providers/any-id/verification", { status: "verified" });
check("p) Provider verification without login -> 401", r.status === 401, "got " + r.status);
r = await call("PATCH", "/admin/providers/any-id/verification", { status: "verified" }, alice.token);
check("q) Provider verification as normal user -> 403", r.status === 403, "got " + r.status);

r = await call("POST", "/auth/forgot-password", { email: "alice_" + run + "@test.com" });
check("r) forgot-password does not return the reset token", r.status === 200 && !r.text.includes("reset-") && !r.text.includes("resetToken"), r.text.slice(0, 120));

resetRateLimits();
const made = await call("POST", "/requests", reqBody("9822200001"), alice.token);
const rid = made.json?.data?.id;
const code = made.json?.data?.tracking_code;
check("Alice created her own request", made.status === 201 && !!rid, "got " + made.status);

r = await call("POST", "/requests/" + rid + "/confirm-resolution", { feedback_rating: 5 }, bob.token);
check("s) Another user cannot confirm Alice's request -> 403", r.status === 403, "got " + r.status);
r = await call("POST", "/requests/" + rid + "/still-need-help", { notes: "x" }, bob.token);
check("t) Another user cannot reopen Alice's request -> 403", r.status === 403, "got " + r.status);
r = await call("POST", "/requests/" + rid + "/confirm-resolution", { feedback_rating: 5 }, alice.token);
check("u) Owner is allowed (not blocked by ownership)", r.status !== 401 && r.status !== 403, "got " + r.status);
r = await call("POST", "/requests/" + rid + "/still-need-help", { notes: "x", tracking_code: code }, bob.token);
check("v) Someone holding the tracking code is allowed", r.status !== 401 && r.status !== 403, "got " + r.status);
r = await call("POST", "/requests/nope-123/confirm-resolution", {}, alice.token);
check("w) Unknown request id -> 404", r.status === 404, "got " + r.status);

console.log("==================================================");
console.log("  RESULT: " + passed + " passed, " + failed + " failed");
console.log("==================================================");
server.close();
try { fs.unlinkSync(process.env.MADAD_DATA_FILE); } catch (e) {}
process.exit(failed > 0 ? 1 : 0);