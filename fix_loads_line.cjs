const fs = require('fs');
const lines = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('load{Math.ceil(weight / 8)') && lines[i].includes('basePrice.toFixed')) {
    // This line needs its closing </div> restored - the extra loads block was inserted before it closed
    // Current: "      {Math.ceil...}" then immediately the extra loads block then </div>
    // Fix: close the loads line first, then extra loads, then close parent </div>
    lines[i] = lines[i] + '</div>';
    // Remove the duplicate </div> that closes this line further down
    for (let j = i + 5; j < i + 10; j++) {
      if (lines[j] && lines[j].trim() === '</div>' && 
          lines[j+1] && lines[j+1].trim() === ')}') {
        lines.splice(j, 1);
        console.log('Removed duplicate closing div at line', j);
        break;
      }
    }
    console.log('Fixed loads line at', i);
    break;
  }
}

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', lines.join('\n'), 'utf8');
console.log('Done');
