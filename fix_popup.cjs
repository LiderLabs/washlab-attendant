const fs = require('fs');
const lines = fs.readFileSync('components/washstation/WashStationLayout.tsx', 'utf8').split('\n');

// Remove showReadyPopup and readyOrder state declarations (lines with these)
// Remove the popup JSX block
// Remove the useEffect that sets showReadyPopup

let result = [];
let skipUntil = -1;

for (let i = 0; i < lines.length; i++) {
  if (i <= skipUntil) continue;

  // Skip state declarations
  if (lines[i].includes('Order Ready Notification States') ||
      lines[i].includes('showReadyPopup') ||
      lines[i].includes('readyOrder') && lines[i].includes('useState')) {
    continue;
  }

  // Skip the readyOrder state object (multi-line)
  if (lines[i].includes('const [readyOrder, setReadyOrder]')) {
    let j = i;
    while (j < lines.length && !lines[j].includes('} | null>(null)')) j++;
    skipUntil = j;
    continue;
  }

  // Skip the popup JSX block
  if (lines[i].includes('{showReadyPopup && readyOrder && (')) {
    let depth = 0, j = i;
    while (j < lines.length) {
      if (lines[j].includes('(')) depth += (lines[j].match(/\(/g) || []).length;
      if (lines[j].includes(')')) depth -= (lines[j].match(/\)/g) || []).length;
      if (depth <= 0 && j > i) { skipUntil = j; break; }
      j++;
    }
    continue;
  }

  // Remove lines that reference showReadyPopup or readyOrder
  if (lines[i].includes('showReadyPopup') || 
      lines[i].includes('setShowReadyPopup') ||
      lines[i].includes('setReadyOrder') ||
      lines[i].includes('audioRef.current?.play')) {
    continue;
  }

  result.push(lines[i]);
}

fs.writeFileSync('components/washstation/WashStationLayout.tsx', result.join('\n'), 'utf8');
console.log('Done - ready popup removed');
