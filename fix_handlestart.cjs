const fs = require("fs");
let src = fs.readFileSync("components/washstation/OrderRowExpander.tsx", "utf8");

src = src.replace(
  `setLocalStatus("checked_in" as OrderStatus)\n    try {\n      await changeStatus(order._id as Id<"orders">, "checked_in" as OrderStatus)`,
  `setLocalStatus("washing" as OrderStatus)\n    try {\n      await changeStatus(order._id as Id<"orders">, "washing" as OrderStatus)`
);

fs.writeFileSync("components/washstation/OrderRowExpander.tsx", src, "utf8");
console.log("Fixed:", src.includes('"washing" as OrderStatus'));
