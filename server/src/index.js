import app from "./app.js";

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`===============================================`);
  console.log(` MADAD API Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(` Mode: ${process.env.SUPABASE_URL ? "Supabase Live" : "Persistent File + In-Memory"}`);
  console.log(`===============================================`);
});