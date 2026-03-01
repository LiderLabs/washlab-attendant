const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

// Show all lucide import blocks
const regex = /import \{[^}]+\} from ["']lucide-react["']/gs;
const matches = [...src.matchAll(regex)];
matches.forEach((m, i) => {
  console.log(`Block ${i+1} at ${m.index}:`);
  console.log(m[0]);
  console.log("---");
});
