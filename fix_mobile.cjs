const fs = require("fs");
let src = fs.readFileSync("app/washstation/order-complete/page.tsx", "utf8");

// Fix mobile layout - sidebar should not push content on mobile
src = src.replace(
  `      <main className={\`flex-1 transition-all duration-300 \${sidebarCollapsed ? 'ml-16' : 'ml-64'} lg:ml-auto\`}>`,
  `      <main className={\`flex-1 transition-all duration-300 lg:\${sidebarCollapsed ? 'ml-16' : 'ml-64'}\`}>`
);

fs.writeFileSync("app/washstation/order-complete/page.tsx", src, "utf8");
console.log("Done");
