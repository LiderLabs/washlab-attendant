const fs = require("fs");
let src = fs.readFileSync("components/washstation/OrderCard.tsx", "utf8");

// 1. Add serviceType, estimatedLoads, whitesSeparate to interface
src = src.replace(
  "    finalPrice: number\r\n    createdAt: number",
  "    finalPrice: number\r\n    createdAt: number\r\n    serviceType?: string\r\n    estimatedLoads?: number\r\n    whitesSeparate?: boolean\r\n    totalPrice?: number"
);

// 2. Add whites badge after order number
src = src.replace(
  "<OrderStatusBadge status={order.status} />\r\n        </div>\r\n      </CardHeader>",
  "<OrderStatusBadge status={order.status} />\r\n        </div>\r\n        {order.serviceType && (\r\n          <div className=\"flex flex-wrap gap-2 mt-2\">\r\n            <span className=\"text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium\">\r\n              {order.serviceType === 'wash_and_dry' ? 'Wash & Dry' : order.serviceType === 'wash_only' ? 'Wash Only' : 'Dry Only'}\r\n              {order.estimatedLoads ? ` · ${order.estimatedLoads} load${order.estimatedLoads > 1 ? 's' : ''}` : ''}\r\n            </span>\r\n            {order.whitesSeparate && (\r\n              <span className=\"text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium\">\r\n                ⚠️ Whites Separate (+1 load)\r\n              </span>\r\n            )}\r\n          </div>\r\n        )}\r\n      </CardHeader>"
);

fs.writeFileSync("components/washstation/OrderCard.tsx", src, "utf8");
console.log("Fixed:", src.includes("whitesSeparate"));
