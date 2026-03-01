const fs = require("fs");
const src = fs.readFileSync("app/washstation/new-order/page.tsx", "utf8");
console.log("Length:", src.length);
console.log(JSON.stringify(src.substring(0, 1500)));
