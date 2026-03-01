const fs = require("fs");
let src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");

// Remove voucherValidation from before order declaration
src = src.replace(
  `  const applyVoucherMutation = useMutation((api as any).vouchers.applyToOrder);\r\n  const voucherValidation = useQuery(\r\n    (api as any).vouchers.validate,\r\n    voucherCode.length >= 6 && order ? { code: voucherCode.toUpperCase(), orderTotal: order.totalPrice ?? 1, branchId: order.branchId } : "skip"\r\n  );\r\n  const orderIdParam = searchParams?.get("orderId");`,
  `  const applyVoucherMutation = useMutation((api as any).vouchers.applyToOrder);\r\n  const orderIdParam = searchParams?.get("orderId");`
);

// Add voucherValidation AFTER order is declared
src = src.replace(
  `  const deliveryFee = order?.deliveryFee || 0;`,
  `  const voucherValidation = useQuery(\r\n    (api as any).vouchers.validate,\r\n    voucherCode.length >= 6 && order ? { code: voucherCode.toUpperCase(), orderTotal: order.totalPrice ?? 1, branchId: order.branchId } : "skip"\r\n  );\r\n\r\n  const deliveryFee = order?.deliveryFee || 0;`
);

fs.writeFileSync("app/washstation/payment/page.tsx", src, "utf8");
console.log("Fixed:", src.indexOf("voucherValidation") > src.indexOf("const { order,"));
