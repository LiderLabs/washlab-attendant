const fs = require("fs");

// ── Fix 1: DashboardContent - pass today's date range to useStationStats
let src = fs.readFileSync("components/washstation/pages/DashboardContent.tsx", "utf8");
src = src.replace(
  "import { useStationStats } from '@/hooks/useStationStats';",
  "import { useStationStats } from '@/hooks/useStationStats';\nimport { startOfToday, endOfToday } from 'date-fns';"
);
src = src.replace(
  "const { stats, isLoading: statsLoading } = useStationStats(stationToken);",
  "const todayStart = startOfToday().getTime();\n  const todayEnd = endOfToday().getTime();\n  const { stats, isLoading: statsLoading } = useStationStats(stationToken, todayStart, todayEnd);"
);
fs.writeFileSync("components/washstation/pages/DashboardContent.tsx", src, "utf8");
console.log("Fix 1: Revenue today only - done");

// ── Fix 2: CustomersContent - remove clear button, lifetime value, fix last visit
src = fs.readFileSync("components/washstation/pages/CustomersContent.tsx", "utf8");

// Remove clear button
src = src.replace(
  `          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCustomer(null); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              âœ•
            </button>
          )}`,
  ""
);

// Remove Lifetime Value stat box (store credit box)
src = src.replace(
  `            <div className="p-5 border-r border-border">
              <p className="text-sm text-muted-foreground">Store Credit</p>
              <p className="text-2xl font-bold text-success mt-1">
                \${(selectedCustomer.storeCredit || 24.50).toFixed(2)}
              </p>
            </div>`,
  ""
);

// Fix Last Visit to use real data
src = src.replace(
  `              <p className="text-lg font-bold text-foreground mt-1">
                {selectedCustomer.lastVisit || 'Oct 12, 2023'}
              </p>`,
  `              <p className="text-lg font-bold text-foreground mt-1">
                {selectedCustomer.lastVisit || selectedCustomer.lastOrderDate
                  ? new Date(selectedCustomer.lastVisit || selectedCustomer.lastOrderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'No visits yet'}
              </p>`
);

fs.writeFileSync("components/washstation/pages/CustomersContent.tsx", src, "utf8");
console.log("Fix 2: Customer page - done");

// ── Fix 3: WashStationSidebar - remove branch name display
src = fs.readFileSync("components/washstation/WashStationSidebar.tsx", "utf8");
const branchIdx = src.indexOf("branchName");
console.log("Sidebar branch context:", src.substring(branchIdx - 50, branchIdx + 200));

// ── Fix 4: MobileSidebar - remove branch name display  
src = fs.readFileSync("components/washstation/MobileSidebar.tsx", "utf8");
const mobileIdx = src.indexOf("resolvedBranchName");
console.log("Mobile branch context:", src.substring(mobileIdx - 50, mobileIdx + 300));
