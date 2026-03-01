const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Find ALL paystack references in UI
const all = [...src.matchAll(/[Pp]aystack/g)];
all.forEach(m => console.log(m.index, JSON.stringify(src.substring(m.index - 50, m.index + 100))));
