const fs = require('fs');
const lines = fs.readFileSync('components/washstation/OrdersTable.tsx', 'utf8').split('\n');

// Find the action TableCell and rewrite it completely
let startCell = -1, endCell = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('flex items-center gap-2')) { startCell = i - 1; }
  if (startCell > -1 && lines[i].includes('</TableCell>') && i > startCell + 2) { endCell = i; break; }
}

if (startCell > -1 && endCell > -1) {
  const replacement = [
    '            <TableCell className="whitespace-nowrap" onClick={e => e.stopPropagation()}>',
    '              <OrderRowExpander order={order} stationToken={stationToken ?? null} />',
    '            </TableCell>'
  ];
  lines.splice(startCell, endCell - startCell + 1, ...replacement);
  console.log('Action cell rewritten at line', startCell);
}

// Also remove the time cell that is still there at line 143
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('formatDistanceToNow') && lines[i].includes('TableCell')) {
    lines.splice(i, 1);
    console.log('Removed time cell at line', i);
    break;
  }
}

fs.writeFileSync('components/washstation/OrdersTable.tsx', lines.join('\n'), 'utf8');
console.log('Done');
