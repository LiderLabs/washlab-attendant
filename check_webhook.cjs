const fs = require("fs");
let src = fs.readFileSync("convex/http.ts", "utf8");

// Check what's already in the webhook handler
const idx = src.indexOf("confirmByReference");
console.log(src.substring(idx - 100, idx + 300));
