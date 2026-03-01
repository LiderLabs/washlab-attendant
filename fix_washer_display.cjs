const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

src = src.replace(
  `<p className="text-2xl font-bold text-foreground w-full p-0" />`,
  `<p className="text-2xl font-bold text-foreground">{washerTokens}</p>`
);

fs.writeFileSync("components/washstation/pages/ReportsContent.tsx", src, "utf8");
console.log("Fixed:", src.includes("{washerTokens}</p>"));
