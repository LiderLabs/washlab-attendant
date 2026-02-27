const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

src = src.replace(
  "const { stationToken, valid, branchId, branchName } = useStationSession() as any;\n  const isSessionValid = valid;",
  "const { stationToken, sessionData, isSessionValid } = useStationSession() as any;\n  const branchId = sessionData?.branchId;\n  const branchName = sessionData?.branchName;"
);

fs.writeFileSync("components/washstation/pages/ReportsContent.tsx", src, "utf8");
console.log("Fixed:", src.includes("sessionData?.branchId"));
