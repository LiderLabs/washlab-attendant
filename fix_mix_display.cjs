const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");

src = src.replace(
  "{selectedOrder.whitesSeparate && (\r\n              <div className=\"flex justify-between items-center bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2\">\r\n                <span className=\"text-yellow-800 font-medium text-sm\">⚠️ Whites Separate</span>\r\n                <span className=\"text-yellow-800 font-medium text-sm\">+1 extra load</span>\r\n              </div>\r\n            )}",
  "{selectedOrder.whitesSeparate && (\r\n              <div className=\"flex justify-between items-center bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2\">\r\n                <span className=\"text-yellow-800 font-medium text-sm\">⚠️ Whites Separate</span>\r\n                <span className=\"text-yellow-800 font-medium text-sm\">+1 extra load</span>\r\n              </div>\r\n            )}\r\n            {(selectedOrder as any).mixWithColors && (\r\n              <div className=\"flex justify-between items-center bg-blue-50 border border-blue-200 rounded-lg px-3 py-2\">\r\n                <span className=\"text-blue-800 font-medium text-sm\">🎨 Mix with Colors</span>\r\n                <span className=\"text-blue-800 font-medium text-sm\">Wash together</span>\r\n              </div>\r\n            )}"
);

fs.writeFileSync("components/washstation/pages/OnlineOrdersContent.tsx", src, "utf8");
console.log("Fixed:", src.includes("mixWithColors"));
