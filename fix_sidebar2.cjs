const fs = require("fs");
let src = fs.readFileSync("components/washstation/WashStationSidebar.tsx", "utf8");

src = src.replace(
  "{ id: 'reports', label: 'Daily Report', icon: FileText, path: '/washstation/reports' },\r\n  ];",
  "{ id: 'reports', label: 'Daily Report', icon: FileText, path: '/washstation/reports' },\r\n    { id: 'reconciliation', label: 'Cash Reconciliation', icon: Banknote, path: '/washstation/reconciliation' },\r\n  ];"
);

fs.writeFileSync("components/washstation/WashStationSidebar.tsx", src, "utf8");
console.log("Nav item added:", src.includes("Cash Reconciliation"));
