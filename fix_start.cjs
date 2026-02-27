const fs = require("fs");
let src = fs.readFileSync("components/washstation/OrderRowExpander.tsx", "utf8");

// Fix handleStart - don't jump localStatus to folding, keep it as checked_in
src = src.replace(
  `    setLocalStatus("folding" as OrderStatus) // jump UI to in-progress immediately
    try {
      await changeStatus(order._id as Id<"orders">, "checked_in" as OrderStatus)
      const backgroundAdvance = async () => {
        const stages: OrderStatus[] = ["sorting", "washing", "drying", "folding"]
        for (const stage of stages) {
          await new Promise(res => setTimeout(res, 600))
          await changeStatus(order._id as Id<"orders">, stage)
        }
      }
      backgroundAdvance().catch(() => {})
      toast.success("Order started")`,
  `    setLocalStatus("checked_in" as OrderStatus)
    try {
      await changeStatus(order._id as Id<"orders">, "checked_in" as OrderStatus)
      toast.success("Order started")`
);

fs.writeFileSync("components/washstation/OrderRowExpander.tsx", src, "utf8");
console.log("Fixed:", src.includes('setLocalStatus("checked_in"'));
