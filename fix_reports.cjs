const fs = require("fs");
let src = fs.readFileSync("app/washstation/reports/page.tsx", "utf8");

// Fix session valid field
src = src.replace(
  "const { stationToken, isSessionValid, branchId, branchName } = useStationSession() as any;",
  "const { stationToken, valid, branchId, branchName } = useStationSession() as any;\n  const isSessionValid = valid;"
);

// Fix query skip condition
src = src.replace(/branchId && isSessionValid \? \{ branchId/g, "branchId ? { branchId");

fs.writeFileSync("app/washstation/reports/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("const isSessionValid = valid"));
