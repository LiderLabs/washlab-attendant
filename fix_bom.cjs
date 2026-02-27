const fs = require("fs");
let src = fs.readFileSync("app/washstation/reports/page.tsx", "utf8");

// Remove BOM and duplicate use client
src = src.replace(/^\ufeff/, ""); // Remove BOM
src = src.replace("'use client';\n\ufeff'use client';", "'use client';");
src = src.replace("'use client';\n'use client';", "'use client';");

fs.writeFileSync("app/washstation/reports/page.tsx", src, "utf8");
console.log("First line:", src.substring(0, 30));
