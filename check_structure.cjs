const fs = require("fs");
const walkDir = (dir, depth = 0) => {
  if (depth > 2) return;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  items.forEach(item => {
    if (["node_modules", ".next", ".git"].includes(item.name)) return;
    console.log("  ".repeat(depth) + item.name);
    if (item.isDirectory()) walkDir(dir + "/" + item.name, depth + 1);
  });
};
walkDir("app/washstation");
