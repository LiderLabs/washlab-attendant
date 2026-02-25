const fs = require('fs');
let src = fs.readFileSync('components/washstation/WashStationLayout.tsx', 'utf8');
src = src.replace(
  '<MobileSidebar\n        open={mobileSidebarOpen}\n        onOpenChange={setMobileSidebarOpen}\n      />',
  '<MobileSidebar\n        open={mobileSidebarOpen}\n        onOpenChange={setMobileSidebarOpen}\n        branchName={sessionData?.branchName}\n      />'
);
fs.writeFileSync('components/washstation/WashStationLayout.tsx', src, 'utf8');
console.log('branchName passed to MobileSidebar');
