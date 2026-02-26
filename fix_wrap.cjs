const fs = require('fs');
let src = fs.readFileSync('components/washstation/WashStationLayout.tsx', 'utf8');

src = src.replace(
  '  return (\n      <WashStationSidebar',
  '  return (\n    <div className="flex min-h-screen w-full bg-background">\n      <WashStationSidebar'
);

fs.writeFileSync('components/washstation/WashStationLayout.tsx', src, 'utf8');
console.log('Done');
