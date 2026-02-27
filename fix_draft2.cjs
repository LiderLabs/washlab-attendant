const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

src = src.replace(
  "handleSaveAsDraft = () => {\r\n    toast.info(\"Order saved as draft\")\r\n    router.push(\"/washstation/dashboard\")\r\n  }",
  `handleSaveAsDraft = () => {
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
