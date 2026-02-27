const fs = require("fs");
let src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");

src = src.replace(
  "const { stationToken, isSessionValid, branchId, branchName } = useStationSession() as any;",
  "const { stationToken, valid: isSessionValid, branchId, branchName } = useStationSession() as any;"
);

fs.writeFileSync("app/washstation/report/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("valid: isSessionValid"));
