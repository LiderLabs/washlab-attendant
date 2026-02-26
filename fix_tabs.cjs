const fs = require("fs");
let content = fs.readFileSync("components/washstation/pages/OrdersContent.tsx", "utf8");

// Fix 1: Change useState type and default
content = content.replace(
  "filter, setFilter] = useState<'all' | 'processing' | 'ready' | 'completed'>('all')",
  "filter, setFilter] = useState<'orders' | 'completed'>('orders')"
);

// Fix 2: Find and replace the tabs array definition
const tabsStart = content.indexOf("const TABS") !== -1 ? content.indexOf("const TABS") : content.indexOf("{ id: 'all'");
if (tabsStart !== -1) {
  console.log("Found tabs at:", tabsStart);
  console.log("Tabs:", content.substring(tabsStart, tabsStart + 300));
}

// Fix 3: Replace tabs inline - find the array with all/processing/ready/completed
content = content.replace(
  /\[\s*\{[^}]*id:\s*['"]all['"][^}]*\}[^\]]*\]/s,
  `[
    { id: 'orders', label: 'Orders' },
    { id: 'completed', label: 'Completed' },
  ]`
);

// Fix 4: Replace filter logic
const oldFilter = content.match(/const filteredOrders[\s\S]*?(?=\n\s*(?:return|const|if))/)?.[0];
if (oldFilter) console.log("Found filter logic:", oldFilter.substring(0, 200));

content = content.replace(
  /const filteredOrders[\s\S]*?(?=\n  (return|const [a-z]))/,
  `const filteredOrders = orders
    .filter((o: any) => {
      if (filter === 'completed') return o.status === 'completed' || o.status === 'delivered';
      return o.status !== 'completed' && o.status !== 'delivered' && o.status !== 'cancelled';
    })
    .filter((o: any) =>
      !searchQuery ||
      o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  `
);

fs.writeFileSync("components/washstation/pages/OrdersContent.tsx", content, "utf8");
console.log("Done");
