const fs = require('fs');
const path = require('path');

const dir = 'app/washstation/report';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Read the existing broken file and rewrite clean
const content = fs.readFileSync('app/washstation/report/page.tsx', 'utf8');
// Strip any non-utf8 by re-encoding
const clean = Buffer.from(content, 'utf8').toString('utf8');
fs.writeFileSync('app/washstation/report/page.tsx', clean, { encoding: 'utf8' });
console.log('Done, lines:', clean.split('\n').length);
