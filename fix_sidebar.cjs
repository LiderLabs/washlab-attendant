const fs = require('fs');
const lines = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8').split('\n');

// 1. Remove the extra loads block from the left column
let removeStart = -1, removeEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* Extra Loads */}')) { removeStart = i - 1; }
  if (removeStart > -1 && lines[i].trim() === ')}' && i > removeStart + 5) {
    removeEnd = i;
    break;
  }
}
if (removeStart > -1 && removeEnd > -1) {
  lines.splice(removeStart, removeEnd - removeStart + 1);
  console.log('Removed extra loads from left column, lines', removeStart, '-', removeEnd);
}

// 2. Find the order summary loads line and add extra loads display after it
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('load{Math.ceil(weight / 8)') && lines[i].includes('basePrice.toFixed')) {
    lines.splice(i + 1, 0,
      "                  {(extraWashLoads > 0 || extraDryLoads > 0) && (",
      "                    <div className='text-xs sm:text-sm text-primary pl-2'>",
      "                      +{extraWashLoads + extraDryLoads} extra load(s) × ₵{selectedService?.basePrice.toFixed(2)}",
      "                    </div>",
      "                  )}"
    );
    console.log('Added extra loads display in order summary at line', i + 1);
    break;
  }
}

// 3. Add the extra loads control panel INSIDE the right sidebar, after the order summary header
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Order Summary") && lines[i].includes('font-semibold')) {
    lines.splice(i + 1, 0,
      "                {/* Extra Loads Controls */}",
      "                {serviceType && (",
      "                  <div className='mb-4 p-3 bg-muted/50 rounded-xl border border-border'>",
      "                    <p className='text-xs font-semibold text-muted-foreground mb-2'>EXTRA LOADS</p>",
      "                    <div className='space-y-2'>",
      "                      {(serviceType === 'wash_and_dry' || serviceType === 'wash_only') && (",
      "                        <div className='flex items-center justify-between'>",
      "                          <span className='text-xs text-foreground'>Extra Wash</span>",
      "                          <div className='flex items-center gap-1'>",
      "                            <button onClick={() => setExtraWashLoads(Math.max(0, extraWashLoads - 1))} className='w-5 h-5 rounded bg-muted flex items-center justify-center text-xs font-bold hover:bg-muted/80'>−</button>",
      "                            <span className='text-xs font-bold w-4 text-center'>{extraWashLoads}</span>",
      "                            <button onClick={() => setExtraWashLoads(extraWashLoads + 1)} className='w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold'>+</button>",
      "                          </div>",
      "                        </div>",
      "                      )}",
      "                      {(serviceType === 'wash_and_dry' || serviceType === 'dry_only') && (",
      "                        <div className='flex items-center justify-between'>",
      "                          <span className='text-xs text-foreground'>Extra Dry</span>",
      "                          <div className='flex items-center gap-1'>",
      "                            <button onClick={() => setExtraDryLoads(Math.max(0, extraDryLoads - 1))} className='w-5 h-5 rounded bg-muted flex items-center justify-center text-xs font-bold hover:bg-muted/80'>−</button>",
      "                            <span className='text-xs font-bold w-4 text-center'>{extraDryLoads}</span>",
      "                            <button onClick={() => setExtraDryLoads(extraDryLoads + 1)} className='w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold'>+</button>",
      "                          </div>",
      "                        </div>",
      "                      )}",
      "                    </div>",
      "                  </div>",
      "                )}"
    );
    console.log('Added extra loads controls in sidebar at line', i + 1);
    break;
  }
}

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', lines.join('\n'), 'utf8');
console.log('Done. Lines:', lines.length);
