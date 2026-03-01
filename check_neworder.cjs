const fs = require("fs");
const src = fs.readFileSync("app/washstation/new-order/page.tsx", "utf8");

// Find service/pricing queries
const matches = [...src.matchAll(/useQuery[^;]{1,150}/g)];
matches.forEach((m, i) => console.log(i, JSON.stringify(m[0])));
