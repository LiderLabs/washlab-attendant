const fs = require("fs");

// FIX 1: Restore Clear button in NumberPad
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");
src = src.replace(
  "      <div className='h-12 sm:h-14' />",
  "      <button\r\n        onClick={onClear}\r\n        className='h-12 sm:h-14 rounded-xl bg-destructive/10 text-lg sm:text-xl font-semibold text-destructive hover:bg-destructive/20 transition-colors'\r\n      >\r\n        <X className='w-4 h-4 sm:w-5 sm:h-5 mx-auto' />\r\n      </button>"
);
fs.writeFileSync("components/washstation/pages/NewOrderContent.tsx", src, "utf8");
console.log("Clear button restored:", src.includes("bg-destructive/10"));
