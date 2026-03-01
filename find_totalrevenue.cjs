const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Find all remaining totalRevenue references
const all = [...src.matchAll(/totalRevenue/g)];
all.forEach(m => console.log(m.index, JSON.stringify(src.substring(m.index - 50, m.index + 100))));
