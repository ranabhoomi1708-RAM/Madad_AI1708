import os from "os";
import path from "path";
import fs from "fs";
import http from "http";

// Use a temporary data file so these tests never touch data/madad_store.json
const tmpFile = path.join(os.tmpdir(), "madad_test_" + Date.now() + ".json");
process.env.MADAD_DATA_FILE = tmpFile;

const { default: app } = await import("./src/app.js");
const { resetRateLimits } = await import("./src/middleware/rateLimit.js");

const server = http.createServer(app);
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = "http://127.0.0.1:" + server.address().port + "/api/v1";

let passed = 0;
let failed = 0;
function check(name, ok, detail) {
  if (ok) {
    passed++;
    console.log("✅ PASSED: " + name);
  } else {
    failed++;
    console.log("❌ FAILED: " + name + (detail ? "  -> " + detail : ""));
  }
}

async function call(method, url, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(base + url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) {}
  return { status: res.status, json, text };
}

function validBody(phone, extra) {
  return Object.assign({
    category: "education",
    title: "Need school books",
    description: "Need books for a class 8 student",
    city: "Delhi",
    assistance_type: "books",
    phone: phone,
    consent_given: true
  }, extra || {});
}

const run = Date.now();
console.log("==================================================");
console.log("       MADAD SECURITY TESTS (real HTTP, temp data)");
console.log("==================================================");

// Create test accounts
const volReg = await call("POST", "/auth/register", {
  email: "vol_" + run + "@test.com", full_name: "Test Volunteer", password: "Passw0rd!", role: "volunteer"
});
const benReg = await call("POST", "/auth/register", {
  email: "ben_" + run + "@test.com", full_name: "Test Beneficiary", password: "Passw0rd!", role: "beneficiary"
});
const volToken = volReg.json?.data?.token;
const volId = volReg.json?.data?.user?.id;
const benToken = benReg.json?.data?.token;
check("Test accounts created (volunteer and beneficiary)", !!volToken && !!benToken);

// a) helper request, no login
resetRateLimits();
let r = await call("POST", "/requests", validBody("9811100001", { helper_mode: true, proxy_consent: true }));
check("a) Helper request with no login -> 401", r.status === 401, "got " + r.status);

// b) helper request as beneficiary
resetRateLimits();
r = await call("POST", "/requests", validBody("9811100002", { helper_mode: true, proxy_consent: true }), benToken);
check("b) Helper request as beneficiary -> 403", r.status === 403, "got " + r.status);

// c) volunteer without proxy_consent
resetRateLimits();
r = await call("POST", "/requests", validBody("9811100003", { helper_mode: true }), volToken);
check("c) Helper request without proxy_consent -> 400", r.status === 400, "got " + r.status);

// d) volunteer with consent
resetRateLimits();
r = await call("POST", "/requests", validBody("9811100004", { helper_mode: true, proxy_consent: true }), volToken);
check("d) Volunteer helper request with consent -> 201", r.status === 201, "got " + r.status);
check("d) helper_id equals the logged-in volunteer", r.json?.data?.helper_id === volId);
check("d) consent_timestamp is stored", !!r.json?.data?.consent_timestamp);

// e) spoofed helper_id
resetRateLimits();
r = await call("POST", "/requests", validBody("9811100005", { helper_mode: true, proxy_consent: true, helper_id: "fake123" }), volToken);
check("e) Spoofed helper_id in body is ignored", r.status === 201 && r.json?.data?.helper_id === volId, "helper_id was " + r.json?.data?.helper_id);

// f) admin signup blocked
r = await call("POST", "/auth/register", {
  email: "adm_" + run + "@test.com", full_name: "Sneaky Admin", password: "Passw0rd!", role: "admin"
});
check("f) Signing up with role admin -> 400", r.status === 400, "got " + r.status);

// g) anonymous normal request
resetRateLimits();
const anon = await call("POST", "/requests", validBody("9811100007"));
check("g) Anonymous normal request -> 201", anon.status === 201, "got " + anon.status);
check("g) Response does not contain full phone number", anon.json?.data && !("contact_phone" in anon.json.data));

// h) duplicate within 48h
resetRateLimits();
const dup = await call("POST", "/requests", validBody("9811100007"));
check("h) Duplicate request -> 200 and same request id", dup.status === 200 && dup.json?.data?.id === anon.json?.data?.id, "status " + dup.status);

// i) rate limit
resetRateLimits();
for (let i = 0; i < 10; i++) {
  await call("POST", "/requests", {});
}
r = await call("POST", "/requests", {});
check("i) 11th request within 15 minutes -> 429", r.status === 429, "got " + r.status);
resetRateLimits();

// j) public feed does not expose the full phone
r = await call("GET", "/give-help/feed");
check("j) Public Give Help feed does not expose full phone", r.status === 200 && !r.text.includes("9811100007"));

// k) public tracking does not expose the full phone
const code = anon.json?.data?.tracking_code;
r = await call("GET", "/requests/track/" + code);
check("k) Public tracking endpoint does not expose full phone", r.status === 200 && !r.text.includes("9811100007"));

console.log("==================================================");
console.log("  RESULT: " + passed + " passed, " + failed + " failed");
console.log("==================================================");

server.close();
try { fs.unlinkSync(tmpFile); } catch (e) {}
process.exit(failed > 0 ? 1 : 0);