const fs = require("fs");
let src = fs.readFileSync("components/washstation/OrdersTable.tsx", "utf8");

// Remove the duplicate closing block
src = src.replace(
  `    [orders, onCollectPayment]
  );
      }),
    [orders, onCollectPayment, onOrderClick]
  );`,
  `    [orders, onCollectPayment]
  );`
);

fs.writeFileSync("components/washstation/OrdersTable.tsx", src, "utf8");
console.log("Done");
