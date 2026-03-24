const fs = require("fs");
let src = fs.readFileSync("components/washstation/WashStationSidebar.tsx", "utf8");

// Add Banknote to the lucide import
src = src.replace(
  "} from 'lucide-react'",
  "  Banknote,\n} from 'lucide-react'"
);

// Add reconciliation nav item after reports
src = src.replace(
  "{ id: 'reports', label: 'Reports', icon: BarChart3, path: '/washstation/reports' },",
  "{ id: 'reports', label: 'Reports', icon: BarChart3, path: '/washstation/reports' },\n  { id: 'reconciliation', label: 'Cash Reconciliation', icon: Banknote, path: '/washstation/reconciliation' },"
);

fs.writeFileSync("components/washstation/WashStationSidebar.tsx", src, "utf8");
console.log("Banknote added:", src.includes("Banknote,"));
console.log("Nav item added:", src.includes("Cash Reconciliation"));
