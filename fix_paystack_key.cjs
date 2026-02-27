const fs = require("fs");
let src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");

src = src.replace(
  'key: "pk_test_0bcc36edcd86cbe2439fc3274f5e6b6e501c4730",',
  'key: process.env.NEXT_PUBLIC_PAYSTACK_KEY || "pk_test_0bcc36edcd86cbe2439fc3274f5e6b6e501c4730",'
);

fs.writeFileSync("app/washstation/payment/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("NEXT_PUBLIC_PAYSTACK_KEY"));
