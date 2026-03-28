const fs = require("fs");
const path = require("path");
function walk(dir) {
  let results = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory() && !["node_modules",".next","dist"].includes(f)) results = results.concat(walk(full));
    else if (f.endsWith(".ts") || f.endsWith(".tsx")) results.push(full);
  }
  return results;
}
const files = walk(".");
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  if (src.includes("getBranchServicesPublic") || src.includes("getBranchServices")) {
    console.log(f);
  }
}
