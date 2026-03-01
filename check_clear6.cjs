const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

const clearBtnEnd = src.indexOf("<ChevronLeft className='w-5 h-5' />\r\n                  Clear\r\n                </button>\r\n              )}");
const blockStart = src.lastIndexOf("\r\n              {", clearBtnEnd);
const blockEnd = clearBtnEnd + "<ChevronLeft className='w-5 h-5' />\r\n                  Clear\r\n                </button>\r\n              )}".length;

console.log("Block to remove:");
console.log(JSON.stringify(src.substring(blockStart, blockEnd)));
