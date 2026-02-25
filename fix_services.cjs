const fs = require('fs');
const lines = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const dbServices = branchServices.map')) {
    // Find end of the map block
    let end = i;
    let depth = 0;
    for (let j = i; j < lines.length; j++) {
      if (lines[j].includes('(')) depth += (lines[j].match(/\(/g) || []).length;
      if (lines[j].includes(')')) depth -= (lines[j].match(/\)/g) || []).length;
      if (depth <= 0 && j > i) { end = j; break; }
    }
    // Insert sort after the map closes
    lines.splice(end + 1, 0,
      `  const serviceOrder = ['wash_and_dry', 'dry_only', 'wash_only'];`,
      `  dbServices.sort((a: any, b: any) => {`,
      `    const ai = serviceOrder.indexOf(a.code) === -1 ? 99 : serviceOrder.indexOf(a.code);`,
      `    const bi = serviceOrder.indexOf(b.code) === -1 ? 99 : serviceOrder.indexOf(b.code);`,
      `    return ai - bi;`,
      `  });`
    );
    console.log('Fix 4 done: service order sorted at line', end + 1);
    break;
  }
}

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', lines.join('\n'), 'utf8');
console.log('Done. Lines:', lines.length);
