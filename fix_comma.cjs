const fs = require('fs');
let src = fs.readFileSync('components/washstation/MobileSidebar.tsx', 'utf8');
src = src.replace('Bell,,\n  FileText', 'Bell,\n  FileText');
fs.writeFileSync('components/washstation/MobileSidebar.tsx', src, 'utf8');
console.log('Done');
