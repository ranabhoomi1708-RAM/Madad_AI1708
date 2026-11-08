const buckets = new Map();

export function createRateLimiter({ windowMs, max, name = "default" }) {
  return (req, res, next) => {
    const key = name + ":" + (req.ip || "unknown");
    const now = Date.now();
    const entry = buckets.get(key);
    if (!entry || now > entry.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, error: { message: "Too many requests. Please try again later." } });
    }
    next();
  };
}

export function resetRateLimits() {
  buckets.clear();
}
