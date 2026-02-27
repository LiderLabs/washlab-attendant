const fs = require("fs");
let src = fs.readFileSync("app/washstation/reports/page.tsx", "utf8");

// Add 'use client' at the top if not there
if (!src.startsWith("'use client'")) {
  src = "'use client';\n" + src;
  console.log("Added use client");
} else {
  console.log("Already has use client");
}

fs.writeFileSync("app/washstation/reports/page.tsx", src, "utf8");
