import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("==========================================================");
console.log("           MADAD PLATFORM — ALL-IN-ONE RUNNER             ");
console.log("==========================================================");
console.log("Starting backend Express server on port 5000...");
console.log("Starting frontend Vite React dev server on port 5173...");
console.log("----------------------------------------------------------");

// 1. Start Server
const serverProcess = spawn('node', ['src/index.js'], {
  cwd: path.join(__dirname, 'server'),
  shell: true,
  stdio: 'inherit'
});

// 2. Start Client
const clientProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  shell: true,
  stdio: 'inherit'
});

function cleanup() {
  console.log("\nShutting down MADAD services...");
  try { serverProcess.kill(); } catch (e) {}
  try { clientProcess.kill(); } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
