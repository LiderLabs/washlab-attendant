const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

const blockStart = src.indexOf("\r\n              {phone.length > 0 && (\r\n                <button\r\n                  onClick={() => { setPhone(\"\"); hasNavigatedFromPhoneRef.current = false }}");
const blockEnd = src.indexOf("              )}", blockStart) + "              )}".length;

src = src.slice(0, blockStart) + src.slice(blockEnd);
fs.writeFileSync("components/washstation/pages/NewOrderContent.tsx", src, "utf8");
console.log("Removed:", !src.includes("ChevronLeft className='w-5 h-5' />"));
