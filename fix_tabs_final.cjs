const fs = require("fs");
let src = fs.readFileSync("app/washstation/orders/page.tsx", "utf8");

// Find the statusOptions block and replace everything between [ and the closing ]
const start = src.indexOf("const statusOptions");
const arrStart = src.indexOf("[", start);
const arrEnd = src.indexOf("]", arrStart) + 1;

const newArr = `const statusOptions: { value: OrderStatus | "all" | "completed"; label: string }[] = [
  { value: "all", label: "Orders" },
  { value: "completed", label: "Completed" },
]`;

src = src.substring(0, start) + newArr + src.substring(arrEnd);

// Fix types
src = src.replace(/OrderStatus \| "all" \| "processing"/g, 'OrderStatus | "all" | "completed"');
src = src.replace(/"all" \| "processing"/g, '"all" | "completed"');

// Fix filter - replace processing block with completed block
src = src.replace(
  /} else if \(selectedStatus === "processing"\) \{[\s\S]*?} else \{/,
  `} else if (selectedStatus === "completed") {
      if (!["completed", "delivered"].includes(order.status)) return false
    } else {`
);

fs.writeFileSync("app/washstation/orders/page.tsx", src, "utf8");
console.log("Done");
