const fs = require("fs");
const path = require("path");
function walk(dir) {
  let results = [];
  try {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory() && !["node_modules",".next","dist",".git"].includes(f)) {
        results = results.concat(walk(full));
      } else if (f.endsWith(".ts") || f.endsWith(".tsx")) {
        results.push(full);
      }
    }
  } catch {}
  return results;
}
const files = walk(".");
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  if (src.includes("service") && src.includes("branchId") && (src.includes("useQuery") || src.includes("api."))) {
    const lines = src.split("\n").filter(l => l.includes("api.") && l.toLowerCase().includes("service"));
    if (lines.length > 0) {
      console.log("FILE:", f);
      lines.forEach(l => console.log(" ", l.trim()));
    }
  }
}
