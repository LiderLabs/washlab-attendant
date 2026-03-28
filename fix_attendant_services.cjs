const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");
src = src.replace(/\r\n/g, "\n");

src = src.replace(
  "(api as any).admin.getBranchServicesPublic,",
  "(api as any).admin.getBranchServices,"
);

fs.writeFileSync("components/washstation/pages/NewOrderContent.tsx", src);
console.log("fixed:", src.includes("getBranchServices,") && !src.includes("getBranchServicesPublic") ? "YES" : "NO");
