const fs = require('fs');
let src = fs.readFileSync('components/washstation/MobileSidebar.tsx', 'utf8');

// Fix 1: Add Daily Report to nav items
src = src.replace(
  "{ id: 'inventory',     label: 'Inventory',     icon: Package,         path: '/washstation/inventory' },",
  "{ id: 'inventory',     label: 'Inventory',     icon: Package,         path: '/washstation/inventory' },\n    { id: 'reports',       label: 'Daily Report',  icon: FileText,        path: '/washstation/reports' },"
);

// Fix 2: Import FileText if not already imported
if (!src.includes('FileText')) {
  src = src.replace(
    "import {",
    "import { FileText,"
  );
}

fs.writeFileSync('components/washstation/MobileSidebar.tsx', src, 'utf8');
console.log('Daily Report added to mobile sidebar');
