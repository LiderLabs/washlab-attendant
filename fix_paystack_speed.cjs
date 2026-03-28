const fs = require("fs");
const path = "app/washstation/payment/page.tsx";
let src = fs.readFileSync(path, "utf8");

// Remove the cleanup that removes the script on unmount
src = src.replace(
  `    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };`,
  `    // Don't remove on unmount — keep script loaded for faster subsequent payments`
);

fs.writeFileSync(path, src);
console.log("patched:", src.includes("keep script loaded") ? "YES" : "NO");
