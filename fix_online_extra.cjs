const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");

src = src.replace(
  `          notes: notes || undefined,
          } as Parameters<typeof checkInOrder>[0])`,
  `          notes: notes || undefined,
          extraWashLoads: extraWashLoads || undefined,
          extraDryLoads: extraDryLoads || undefined,
          } as Parameters<typeof checkInOrder>[0])`
);

fs.writeFileSync("components/washstation/pages/OnlineOrdersContent.tsx", src, "utf8");
console.log("Frontend done");
