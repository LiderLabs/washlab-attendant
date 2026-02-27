const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");

// Add whites display after the service type line
src = src.replace(
  "<span className=\"font-medium\">{getServiceName(selectedOrder.serviceType || \"wash_and_fold\")}</span>\r\n            </div>",
  "<span className=\"font-medium\">{getServiceName(selectedOrder.serviceType || \"wash_and_fold\")}</span>\r\n            </div>\r\n            {selectedOrder.whitesSeparate && (\r\n              <div className=\"flex justify-between items-center bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2\">\r\n                <span className=\"text-yellow-800 font-medium text-sm\">⚠️ Whites Separate</span>\r\n                <span className=\"text-yellow-800 font-medium text-sm\">+1 extra load</span>\r\n              </div>\r\n            )}"
);

fs.writeFileSync("components/washstation/pages/OnlineOrdersContent.tsx", src, "utf8");
console.log("Fixed:", src.includes("Whites Separate"));
