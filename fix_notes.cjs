const fs = require('fs');
const lines = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('notes: [customNote, ...orderNotes,') && lines[i].includes('extra wash')) {
    lines[i] = "        notes: [customNote, ...orderNotes, extraWashLoads > 0 ? extraWashLoads + ' extra wash load(s)' : '', extraDryLoads > 0 ? extraDryLoads + ' extra dry load(s)' : ''].filter(Boolean).join(', ') || undefined,";
    console.log('Fixed notes line at', i);
    break;
  }
}

// Also fix weight line if it wasn't replaced
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === 'weight,' && lines[i-1] && lines[i-1].includes('serviceType')) {
    lines[i] = '        weight: weight + (extraWashLoads + extraDryLoads) * 8,';
    console.log('Fixed weight line at', i);
    break;
  }
}

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', lines.join('\n'), 'utf8');
console.log('Done');
