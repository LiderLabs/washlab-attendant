const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

src = src.replace(
  `        setLoaded(false);\n      }, 2000`,
  `        setLoaded(false);\n      }, 2000)`
);

fs.writeFileSync("components/washstation/pages/ReportsContent.tsx", src, "utf8");
console.log("Fixed:", src.includes("}, 2000)"));
