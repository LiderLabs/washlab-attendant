const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

// Fix handleSaveAsDraft - save to sessionStorage so it can be resumed
src = src.replace(
  `  const handleSaveAsDraft = () => {
    toast.info("Order saved as draft")
    router.push("/washstation/dashboard")
  }`,
  `  const handleSaveAsDraft = () => {
    if (!foundCustomer?._id) { toast.error("No customer selected"); return }
    const draft = {
      customerId: foundCustomer._id,
      customerName: foundCustomer.name,
      customerPhone: foundCustomer.phoneNumber,
      customerEmail: foundCustomer.email,
      serviceType,
      weight,
      itemCount,
      bagCardNumber,
      orderNotes,
      extraWashLoads,
      extraDryLoads,
      savedAt: new Date().toISOString(),
    }
    sessionStorage.setItem("washlab_order_draft", JSON.stringify(draft))
    toast.success("Draft saved! You can resume it from the dashboard.")
    router.push("/washstation/dashboard")
  }`
);

fs.writeFileSync("components/washstation/pages/NewOrderContent.tsx", src, "utf8");
console.log("Draft fixed:", src.includes("washlab_order_draft"));
