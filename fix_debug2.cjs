const fs = require("fs");
let src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");

// Hardcode branchId temporarily to test if query works at all
src = src.replace(
  "const { stationToken, valid: isSessionValid, branchId, branchName } = useStationSession() as any;",
  "const { stationToken, valid: isSessionValid, branchId: _branchId, branchName } = useStationSession() as any;\n  console.log('SESSION:', { stationToken: !!stationToken, isSessionValid, _branchId });\n  const branchId = _branchId;"
);

fs.writeFileSync("app/washstation/report/page.tsx", src, "utf8");
console.log("Done");
