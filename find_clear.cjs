const fs = require("fs");
const path = require("path");

const walk = (d) => {
  const entries = fs.readdirSync(d, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".next") continue;
    const full = path.join(d, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith(".tsx")) {
      const src = fs.readFileSync(full, "utf8");
      if (src.includes("Clear") && src.includes("Customer Phone")) {
        console.log("Found in:", full);
      }
    }
  }
};
walk(".");
