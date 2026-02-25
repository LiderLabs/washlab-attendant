const fs = require('fs');
const lines = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8').split('\n');

// Find the orphaned fragment - starts with serviceType wash_and_dry dry_only check right after </div> of weight buttons
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("serviceType === 'wash_and_dry' || serviceType === 'dry_only'") &&
      lines[i-1] && lines[i-1].trim() === '</div>' &&
      lines[i-2] && lines[i-2].includes('Max</button>')) {
    // Find the end - two closing </div></div>)} after
    let end = i;
    let depth = 0;
    for (let j = i; j < i + 20; j++) {
      if (lines[j].includes('<div')) depth++;
      if (lines[j].includes('</div>')) depth--;
      if (depth <= 0 && j > i) {
        // also consume the )} line after
        if (lines[j+1] && lines[j+1].trim() === ')}') end = j + 1;
        else end = j;
        break;
      }
    }
    lines.splice(i, end - i + 1);
    console.log('Removed orphaned extra dry block, lines', i, '-', end);
    break;
  }
}

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', lines.join('\n'), 'utf8');
console.log('Done. Lines:', lines.length);
