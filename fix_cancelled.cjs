const fs = require('fs');
let src = fs.readFileSync('app/washstation/orders/page.tsx', 'utf8');

// Add cancelled to status options
src = src.replace(
  '  { value: "completed", label: "Completed" },\n]',
  '  { value: "completed", label: "Completed" },\n  { value: "cancelled", label: "Cancelled" },\n]'
);

// Fix type to include cancelled
src = src.replace(
  'OrderStatus | "all" | "processing"\n  >("all")',
  'OrderStatus | "all" | "processing" | "cancelled"\n  >("all")'
);

src = src.replace(
  'value: OrderStatus | "all" | "processing"\n  label: string',
  'value: OrderStatus | "all" | "processing" | "cancelled"\n  label: string'
);

// Fix the else branch to handle ready, completed, cancelled properly
src = src.replace(
  '    } else {\n      // selectedStatus is a specific OrderStatus\n      if (order.status !== selectedStatus) {\n        return false\n      }\n    }',
  '    } else if (selectedStatus === "ready") {\n      if (order.status !== "ready" && order.status !== "ready_for_pickup") return false\n    } else if (selectedStatus === "completed") {\n      if (order.status !== "completed" && order.status !== "delivered") return false\n    } else if (selectedStatus === "cancelled") {\n      if (order.status !== "cancelled") return false\n    } else {\n      if (order.status !== selectedStatus) return false\n    }'
);

fs.writeFileSync('app/washstation/orders/page.tsx', src, 'utf8');
console.log('Done - cancelled:', src.includes('"cancelled", label: "Cancelled"') ? 'OK' : 'MISSED');
