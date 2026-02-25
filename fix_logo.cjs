const fs = require('fs');

// Fix login page - still has duplicate header
let src = fs.readFileSync('app/washstation/page.tsx', 'utf8');
src = src.replace(
  `      {/* Header */}
      <header className="p-6">
        <header className="p-6">
       <Logo size="sm" className="h-10" />
       </header>
      </header>`,
  `      {/* Header */}
      <header className="p-6">
        <Logo size="sm" />
      </header>`
);
fs.writeFileSync('app/washstation/page.tsx', src, 'utf8');
console.log('Login header fixed:', src.includes('duplicate') ? 'still has issue' : 'OK');

// Fix confirm-clock-in page logo if it exists
try {
  let cc = fs.readFileSync('app/washstation/confirm-clock-in/page.tsx', 'utf8');
  if (cc.includes('<Logo size="md"') || cc.includes('<Logo size="lg"')) {
    cc = cc.replace(/<Logo size="md"/g, '<Logo size="sm"').replace(/<Logo size="lg"/g, '<Logo size="sm"');
    fs.writeFileSync('app/washstation/confirm-clock-in/page.tsx', cc, 'utf8');
    console.log('confirm-clock-in logo fixed');
  }
} catch(e) { console.log('no confirm-clock-in logo change needed'); }

console.log('Done');
