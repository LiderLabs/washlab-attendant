const fs = require("fs");

// Fix 1: DashboardContent - move midnight refresh to a stable module-level approach
let dash = fs.readFileSync("components/washstation/pages/DashboardContent.tsx", "utf8");

dash = dash.replace(
  `  // Optional: 24h refresh logic (reload page if day changes)
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msToMidnight = midnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      window.location.reload();
    }, msToMidnight);

    return () => clearTimeout(timer);
  }, []);`,
  `  // Midnight refresh — recalculates on mount, chains to next midnight after reload
  useEffect(() => {
    function scheduleReload() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const msToMidnight = midnight.getTime() - now.getTime();
      return setTimeout(() => { window.location.reload(); }, msToMidnight);
    }
    const timer = scheduleReload();
    return () => clearTimeout(timer);
  }, []);`
);

fs.writeFileSync("components/washstation/pages/DashboardContent.tsx", dash, "utf8");

// Fix 2: order-complete page - add collapsed state so sidebar toggle works
let oc = fs.readFileSync("app/washstation/order-complete/page.tsx", "utf8");

oc = oc.replace(
  `import { CheckCircle, Plus, MessageSquare, LayoutDashboard, Loader2 } from 'lucide-react';`,
  `import { CheckCircle, Plus, MessageSquare, LayoutDashboard, Loader2 } from 'lucide-react';`
);

oc = oc.replace(
  `  const { stationToken, isSessionValid } = useStationSession();`,
  `  const { stationToken, isSessionValid } = useStationSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);`
);

oc = oc.replace(
  `      <WashStationSidebar collapsed={false} onToggle={() => {}} />
      <main className="flex-1 ml-64">`,
  `      <WashStationSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      <main className={\`flex-1 transition-all duration-300 \${sidebarCollapsed ? 'ml-16' : 'ml-64'}\`}>`
);

fs.writeFileSync("app/washstation/order-complete/page.tsx", oc, "utf8");
console.log("Done");
