// SMS Adapter - console (default) or Twilio stub
// Usage: await smsAdapter.send(message, requestId, phone)
// Returns a Promise<void>

const adapter = process.env.SMS_ADAPTER?.toLowerCase() || "console";

async function send(message, requestId, phone) {
  const masked = maskPhone(phone);
  if (adapter === "twilio") {
    // Stub implementation – just log. Real integration would use Twilio SDK.
    console.log(`[Twilio] SMS to ${masked} (Request ${requestId}): ${message}`);
    return;
  }
  // console fallback
  console.log(`[Console SMS] To ${masked} (Request ${requestId}): ${message}`);
}

function maskPhone(phone) {
  if (!phone) return "";
  const clean = phone.trim();
  if (clean.length < 6) return "••••••";
  return clean.slice(0, 6) + " •••• " + clean.slice(-2);
}

export default { send };

