const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");

// Fix weight input - show blank not 0
src = src.replace(
  'value={weight}',
  'value={weight === "0" ? "" : weight}'
);

fs.writeFileSync("components/washstation/pages/OnlineOrdersContent.tsx", src, "utf8");
console.log("Done");
