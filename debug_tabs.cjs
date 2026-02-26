const fs = require("fs");
let content = fs.readFileSync("components/washstation/pages/OrdersContent.tsx", "utf8");

// Find filter/tab related code
const filterIdx = content.indexOf("filter");
console.log("Filter context:", content.substring(filterIdx, filterIdx + 800));
