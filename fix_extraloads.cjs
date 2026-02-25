const fs = require('fs');
const lines = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8').split('\n');

// Find where extraLoads state is or add it near weight state
let stateAdded = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const [bagCardNumber, setBagCardNumber]') && !stateAdded) {
    lines.splice(i + 1, 0,
      '  const [extraWashLoads, setExtraWashLoads] = useState(0)',
      '  const [extraDryLoads, setExtraDryLoads] = useState(0)'
    );
    stateAdded = true;
    console.log('State added at line', i + 1);
    break;
  }
}

// Find the weight quick buttons (+ 1kg, + 5kg, Max) and insert extra loads section after
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("className='px-3 sm:px-4 py-2 bg-muted rounded-lg text-xs sm:text-sm hover:bg-muted/80'>Max</button>")) {
    // Find the closing </div> of the weight section
    for (let j = i + 1; j < i + 10; j++) {
      if (lines[j] && lines[j].trim() === '</div>') {
        lines.splice(j + 1, 0,
          '',
          "              {/* Extra Loads */}",
          "              {serviceType && (",
          "                <div className='mt-4 p-4 bg-muted/50 rounded-xl border border-border'>",
          "                  <p className='text-xs font-semibold text-muted-foreground mb-3'>ADDITIONAL LOADS (attendant override)</p>",
          "                  <div className='grid grid-cols-2 gap-3'>",
          "                    {(serviceType === 'wash_and_dry' || serviceType === 'wash_only') && (",
          "                      <div className='flex items-center justify-between bg-card rounded-lg px-3 py-2 border border-border'>",
          "                        <span className='text-xs font-medium text-foreground'>Extra Wash</span>",
          "                        <div className='flex items-center gap-2'>",
          "                          <button onClick={() => setExtraWashLoads(Math.max(0, extraWashLoads - 1))} className='w-6 h-6 rounded bg-muted flex items-center justify-center text-sm font-bold hover:bg-muted/80'>−</button>",
          "                          <span className='text-sm font-bold w-4 text-center'>{extraWashLoads}</span>",
          "                          <button onClick={() => setExtraWashLoads(extraWashLoads + 1)} className='w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold hover:bg-primary/90'>+</button>",
          "                        </div>",
          "                      </div>",
          "                    )}",
          "                    {(serviceType === 'wash_and_dry' || serviceType === 'dry_only') && (",
          "                      <div className='flex items-center justify-between bg-card rounded-lg px-3 py-2 border border-border'>",
          "                        <span className='text-xs font-medium text-foreground'>Extra Dry</span>",
          "                        <div className='flex items-center gap-2'>",
          "                          <button onClick={() => setExtraDryLoads(Math.max(0, extraDryLoads - 1))} className='w-6 h-6 rounded bg-muted flex items-center justify-center text-sm font-bold hover:bg-muted/80'>−</button>",
          "                          <span className='text-sm font-bold w-4 text-center'>{extraDryLoads}</span>",
          "                          <button onClick={() => setExtraDryLoads(extraDryLoads + 1)} className='w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold hover:bg-primary/90'>+</button>",
          "                        </div>",
          "                      </div>",
          "                    )}",
          "                  </div>",
          "                  {(extraWashLoads > 0 || extraDryLoads > 0) && (",
          "                    <p className='text-xs text-primary mt-2'>+{extraWashLoads + extraDryLoads} extra load(s) added to price</p>",
          "                  )}",
          "                </div>",
          "              )}"
        );
        console.log('Extra loads UI added at line', j + 1);
        break;
      }
    }
    break;
  }
}

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', lines.join('\n'), 'utf8');
console.log('Done. Lines:', lines.length);
