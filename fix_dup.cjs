const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Remove WashStationLayout import
src = src.replace(
  "import { WashStationLayout } from '@/components/washstation/WashStationLayout';\n",
  ""
);

// Remove WashStationLayout wrapper - replace opening tag
src = src.replace(
  /return \(\s*<WashStationLayout[^>]*>/,
  "return (\n    <>"
);

// Replace closing tag
src = src.replace(
  /<\/WashStationLayout>\s*\);?\s*\}?\s*$/,
  "</>\n  );\n}"
);

fs.writeFileSync("components/washstation/pages/ReportsContent.tsx", src, "utf8");
console.log("Fixed:", !src.includes("WashStationLayout"));
