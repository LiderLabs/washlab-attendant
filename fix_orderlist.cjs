const fs = require("fs");
let src = fs.readFileSync("components/washstation/OrderList.tsx", "utf8");

// Add new fields to Order interface
src = src.replace(
  "  finalPrice: number;\n  createdAt: number;\n  customer?: {\n    name: string;\n    phoneNumber: string;\n    email?: string;\n  } | null;\n}",
  "  finalPrice: number;\n  createdAt: number;\n  serviceType?: string;\n  estimatedLoads?: number;\n  whitesSeparate?: boolean;\n  totalPrice?: number;\n  customer?: {\n    name: string;\n    phoneNumber: string;\n    email?: string;\n  } | null;\n}"
);

// Pass new fields to OrderCard
src = src.replace(
  "<OrderCard\n          order={order}",
  "<OrderCard\n          order={order}"
);

fs.writeFileSync("components/washstation/OrderList.tsx", src, "utf8");
console.log("Fixed:", src.includes("whitesSeparate"));
