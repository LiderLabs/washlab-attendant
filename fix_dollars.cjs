const fs = require('fs');
const path = require('path');

// Fix 1: CustomersContent.tsx - the one confirmed dollar sign
let f1 = fs.readFileSync('components/washstation/pages/CustomersContent.tsx', 'utf8');
f1 = f1.replace(
  `<td className="py-3 font-medium text-foreground">\${order.total.toFixed(2)}</td>`,
  `<td className="py-3 font-medium text-foreground">₵{order.total.toFixed(2)}</td>`
);
fs.writeFileSync('components/washstation/pages/CustomersContent.tsx', f1);
console.log('CustomersContent done');

// Fix 2: Scan for any literal $ followed by a number/variable in JSX text across all files
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (['node_modules', '.next', '.git'].includes(f)) continue;
    if (fs.statSync(full).isDirectory()) { walk(full); continue; }
    if (!full.endsWith('.tsx')) continue;
    let content = fs.readFileSync(full, 'utf8');
    // Match literal $ in JSX text (not in template literals or imports)
    if (content.includes('>${') || content.match(/>[^<]*\$[0-9{]/)) {
      const lines = content.split('\n');
      lines.forEach((l, i) => {
        if (l.match(/>[^<`]*\$[0-9{]/) && !l.includes('//')) {
          console.log(`FOUND: ${full.replace(process.cwd() + path.sep, '')}:${i+1}: ${l.trim()}`);
        }
      });
    }
  }
}
walk('.');
