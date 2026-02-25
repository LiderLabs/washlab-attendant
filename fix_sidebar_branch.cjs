const fs = require('fs');

// Fix 1: WashStationSidebar - pull branchName from sessionData and pass to MobileSidebar
let src = fs.readFileSync('components/washstation/WashStationSidebar.tsx', 'utf8');

src = src.replace(
  'const { stationToken } = useStationSession();',
  'const { stationToken, sessionData } = useStationSession();\n  const branchName = (sessionData as any)?.branchName || sessionData?.branchName || sessionData?.branchCode || \'Branch\';'
);

// Pass branchName to MobileSidebar
src = src.replace(
  '<MobileSidebar\n        open={mobileSidebarOpen}\n        onOpenChange={setMobileSidebarOpen}',
  '<MobileSidebar\n        open={mobileSidebarOpen}\n        onOpenChange={setMobileSidebarOpen}\n        branchName={branchName}'
);

fs.writeFileSync('components/washstation/WashStationSidebar.tsx', src, 'utf8');
console.log('Sidebar branchName fix done');

// Fix 2: Daily report nav path - report vs reports
src = fs.readFileSync('components/washstation/WashStationSidebar.tsx', 'utf8');
src = src.replace(
  "{ id: 'report', label: 'Daily Report', icon: FileText, path: '/washstation/report' }",
  "{ id: 'reports', label: 'Daily Report', icon: FileText, path: '/washstation/reports' }"
);
fs.writeFileSync('components/washstation/WashStationSidebar.tsx', src, 'utf8');
console.log('Report path fix done');
