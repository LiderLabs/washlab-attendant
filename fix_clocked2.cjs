const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

src = src.replace(
  "const clockedInStaff = useQuery(\n    'skip',\n    {}\n  );",
  "const clockedInStaff = null;"
);

fs.writeFileSync("components/washstation/pages/ReportsContent.tsx", src, "utf8");
console.log("Fixed:", src.includes("const clockedInStaff = null"));
