const fs = require("fs");
const path = require("path");

function walk(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
      walk(full, results);
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

const files = walk(".");
const keywords = ["reconcil", "Reconcil", "cash reconcil", "CashReconcil"];

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  if (keywords.some(k => src.includes(k))) {
    console.log("FOUND:", file);
    const idx = src.search(/reconcil/i);
    if (idx !== -1) console.log("  snippet:", src.substring(Math.max(0, idx - 50), idx + 100).replace(/\n/g, " ↵ "));
  }
}
