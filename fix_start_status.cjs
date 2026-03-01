const fs = require("fs");
let src = fs.readFileSync("components/washstation/OrderRowExpander.tsx", "utf8");

src = src.replace(
  `const handleStart = async () => {
    setIsMoving(true)
    setLocalStatus("washing" as OrderStatus)
    try {
      await changeStatus(order._id as Id<"orders">, "washing" as OrderStatus)
      toast.success("Order started")
    } catch (e) {
      setLocalStatus(null)
      toast.error("Failed to start order")
    } finally {
      setIsMoving(false)
    }
  }`,
  `const handleStart = async () => {
    setIsMoving(true)
    setLocalStatus("checked_in" as OrderStatus)
    try {
      await changeStatus(order._id as Id<"orders">, "checked_in" as OrderStatus)
      toast.success("Order checked in")
    } catch (e) {
      setLocalStatus(null)
      toast.error("Failed to check in order")
    } finally {
      setIsMoving(false)
    }
  }`
);

fs.writeFileSync("components/washstation/OrderRowExpander.tsx", src, "utf8");
console.log("Fixed:", src.includes('"checked_in" as OrderStatus)\n      toast.success("Order checked in")'));
