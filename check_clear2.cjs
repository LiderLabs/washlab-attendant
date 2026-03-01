const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");
const idx = src.indexOf("ChevronLeft className=\\'w-5 h-5\\' />\r\n                  Clear");
console.log(JSON.stringify(src.substring(idx - 300, idx + 200)));
