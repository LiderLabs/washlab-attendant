const fs = require("fs");
let src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");

src = src.replace(
  "const autoData = useQuery(",
  "console.log('DEBUG branchId:', branchId, 'isSessionValid:', isSessionValid, 'autoData:', autoData);\n  const autoData = useQuery("
);

fs.writeFileSync("app/washstation/report/page.tsx", src, "utf8");
console.log("Debug added");
