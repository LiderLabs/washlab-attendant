const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (['node_modules', '.next', '.git'].includes(f)) continue;
    if (fs.statSync(full).isDirectory()) { walk(full); continue; }
    if (!full.endsWith('.tsx') && !full.endsWith('.ts')) continue;
    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split('\n');
    lines.forEach((l, i) => {
      const rel = full.replace(process.cwd() + path.sep, '');
      if (l.includes('type="tel"') || l.includes('phoneNumber') || (l.includes('phone') && l.includes('input'))) {
        console.log(`[PHONE] ${rel}:${i+1}: ${l.trim()}`);
      }
      if (l.includes('"$"') || l.includes("'$'") || l.includes('>${') && l.includes('$') || l.match(/>\s*\$\s*</)) {
        console.log(`[DOLLAR] ${rel}:${i+1}: ${l.trim()}`);
      }
    });
  }
}
walk('.');
