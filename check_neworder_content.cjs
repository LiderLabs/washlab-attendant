const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");
console.log("Length:", src.length);

// Find all useQuery calls
const matches = [...src.matchAll(/useQuery[^;]{1,150}/g)];
matches.forEach((m, i) => console.log(i, JSON.stringify(m[0])));

// Find service references
const idx = src.indexOf("service");
console.log("service at:", JSON.stringify(src.substring(idx - 20, idx + 200)));
