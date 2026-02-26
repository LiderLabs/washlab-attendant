const fs = require("fs");
let src = fs.readFileSync("app/washstation/orders/page.tsx", "utf8");

// Replace statusOptions array
src = src.replace(
  `const statusOptions: {
  value: OrderStatus | "all" | "processing" | "cancelled"
  label: string
}[] = [
  { value: "all", label: "All" },
  { value: "processing", label: "Processing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]`,
  `const statusOptions: {
  value: OrderStatus | "all" | "completed"
  label: string
}[] = [
  { value: "all", label: "Orders" },
  { value: "completed", label: "Completed" },
]`
);

// Fix useState type
src = src.replace(
  `const [selectedStatus, setSelectedStatus] = useState
    OrderStatus | "all" | "processing"
  >("all")`,
  `const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all" | "completed">("all")`
);

// Fix setSelectedStatus cast
src = src.replace(
  `option.value as OrderStatus | "all" | "processing"`,
  `option.value as OrderStatus | "all" | "completed"`
);

// Fix filter logic for completed tab
src = src.replace(
  `    } else if (selectedStatus === "processing") {
      if (
        !["checked_in", "sorting", "washing", "drying", "folding"].includes(
          order.status
        )
      ) {
        return false
      }
    } else {`,
  `    } else if (selectedStatus === "completed") {
      if (!["completed", "delivered"].includes(order.status)) return false
    } else {`
);

fs.writeFileSync("app/washstation/orders/page.tsx", src, "utf8");
console.log("Done");
