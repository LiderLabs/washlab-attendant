const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

const start = src.indexOf("<ChevronLeft className='w-5 h-5' />\r\n                  Clear\r\n                </button>\r\n              )}");
const fullStart = src.lastIndexOf("{", start);
const fullEnd = src.indexOf(")}", start) + 2;

console.log("Found block:", JSON.stringify(src.substring(fullStart, fullEnd)));
