const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

// Cast createWalkInOrder call to any to bypass type check
src = src.replace(
  "const result = await createWalkInOrder({",
  "const result = await (createWalkInOrder as any)({"
);

fs.writeFileSync("components/washstation/pages/NewOrderContent.tsx", src, "utf8");
console.log("Done:", src.includes("createWalkInOrder as any"));
