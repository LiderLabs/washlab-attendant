const fs = require("fs");
const src = fs.readFileSync("convex/admin.ts", "utf8");
console.log("has getBranchServicesPublic:", src.includes("getBranchServicesPublic"));
