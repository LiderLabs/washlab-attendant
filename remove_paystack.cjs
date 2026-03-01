const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

src = src.replace(
  `{paystackAmount > 0 && (\n              <div className="border-l-4 border-l-purple-500 pl-3 py-1 flex items-center justify-between">\n                <p className="text-sm text-muted-foreground">Paystack</p>\n                <p className="text-lg font-bold text-foreground">{fmt(paystackAmount)}</p>\n              </div>\n            )}\n          </div>`,
  `</div>`
);

fs.writeFileSync("components/washstation/pages/ReportsContent.tsx", src, "utf8");
console.log("Paystack block removed:", !src.includes("{paystackAmount > 0 &&"));
