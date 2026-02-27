const fs = require("fs");

// Fix walk-in
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");
src = src.replace(
  "const result = await createWalkInOrder({",
  "const result = await (createWalkInOrder as any)({"
);
fs.writeFileSync("components/washstation/pages/NewOrderContent.tsx", src, "utf8");
console.log("Walk-in fixed:", src.includes("createWalkInOrder as any"));

// Fix online
let online = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
online = online.replace(
  "await checkInOrder({",
  "await (checkInOrder as any)({"
);
fs.writeFileSync("components/washstation/pages/OnlineOrdersContent.tsx", online, "utf8");
console.log("Online fixed:", online.includes("checkInOrder as any"));
