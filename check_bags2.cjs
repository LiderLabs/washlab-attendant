const fs = require("fs");
const path = require("path");

function searchFiles(dir, term) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) results.push(...searchFiles(full, term));
    else if (f.name.endsWith(".tsx") || f.name.endsWith(".ts")) {
      const src = fs.readFileSync(full, "utf8");
      if (src.includes(term)) results.push(full);
    }
  }
  return results;
}

const terms = ["activeBagNumbers", "getActiveBagNumbers", "bagCardNumber", "bagCard"];
for (const t of terms) {
  const found = searchFiles(".", t);
  if (found.length) console.log(t + ":", found.join(", "));
}
