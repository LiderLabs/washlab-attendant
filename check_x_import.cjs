const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");
console.log("X imported:", src.includes("import") && src.includes(", X,") || src.includes("{X}") || src.includes(", X }"));
const idx = src.indexOf("from \"lucide-react\"");
console.log(JSON.stringify(src.substring(idx - 100, idx + 50)));
