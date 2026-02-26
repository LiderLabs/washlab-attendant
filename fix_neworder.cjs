const fs = require('fs');
let src = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8');

// Fix 1: Remove 0 from weight input - use empty string when 0
src = src.replace(
  'value={weight} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}',
  'value={weight === 0 ? "" : weight} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}'
);

// Fix 2: Remove 0 from item count input
src = src.replace(
  'value={itemCount} onChange={(e) => setItemCount(parseInt(e.target.value) || 0)}',
  'value={itemCount === 0 ? "" : itemCount} onChange={(e) => setItemCount(parseInt(e.target.value) || 0)}'
);

// Fix 3: Remove the custom note textarea
src = src.replace(
  /\s*<textarea[\s\S]*?Add any specific instructions here[\s\S]*?\/>/,
  ''
);

// Fix 4: Show only 5 bag cards
src = src.replace(
  'while (available.length < 10)',
  'while (available.length < 5)'
);

// Fix 5: Move Extra Loads section from sidebar to after weight section
// First extract the extra loads JSX from sidebar
const extraLoadsBlock = 
              {/* Extra Loads */}
              {serviceType && (
                <div className='mt-4 p-3 bg-muted/50 rounded-xl border border-border'>
                  <p className='text-xs font-semibold text-muted-foreground mb-2'>EXTRA LOADS</p>
                  <div className='space-y-2'>
                    {(serviceType === 'wash_and_dry' || serviceType === 'wash_only') && (
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-foreground'>Extra Wash</span>
                        <div className='flex items-center gap-2'>
                          <button onClick={() => setExtraWashLoads(Math.max(0, extraWashLoads - 1))} className='w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-sm font-bold hover:bg-muted/80'>-</button>
                          <span className='text-sm font-bold w-5 text-center'>{extraWashLoads}</span>
                          <button onClick={() => setExtraWashLoads(extraWashLoads + 1)} className='w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold'>+</button>
                        </div>
                      </div>
                    )}
                    {(serviceType === 'wash_and_dry' || serviceType === 'dry_only') && (
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-foreground'>Extra Dry</span>
                        <div className='flex items-center gap-2'>
                          <button onClick={() => setExtraDryLoads(Math.max(0, extraDryLoads - 1))} className='w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-sm font-bold hover:bg-muted/80'>-</button>
                          <span className='text-sm font-bold w-5 text-center'>{extraDryLoads}</span>
                          <button onClick={() => setExtraDryLoads(extraDryLoads + 1)} className='w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold'>+</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )};

// Insert extra loads after the weight quick buttons
src = src.replace(
                    <button onClick={() => setWeight(20)} className='px-3 sm:px-4 py-2 bg-muted rounded-lg text-xs sm:text-sm hover:bg-muted/80'>Max</button>
                </div>
              </div>,
                    <button onClick={() => setWeight(20)} className='px-3 sm:px-4 py-2 bg-muted rounded-lg text-xs sm:text-sm hover:bg-muted/80'>Max</button>
                </div>
                
              </div>
);

// Fix 6: Remove Extra Loads from sidebar
src = src.replace(
  /\s*\{\/\* Extra Loads Controls \*\/\}\s*\{serviceType && \(\s*<div className='mb-4 p-3[\s\S]*?<\/div>\s*\)\}/,
  ''
);

// Also remove the other extra loads block in sidebar (without comment)
src = src.replace(
  /\{serviceType && \(\s*<div className='mb-4 p-3 bg-muted\/50 rounded-xl border border-border'>[\s\S]*?<\/div>\s*\)\}\s*<div className='space-y-3/,
  "<div className='space-y-3"
);

// Fix 7: Make order summary non-fixed, move to bottom of page (not sidebar)
src = src.replace(
              {/* Right - Order Summary (fixed sidebar) */}
            <div className='bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 fixed top-24 right-6 w-[20rem]'>,
              {/* Order Summary - bottom card */}
            <div className='bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full lg:w-80 lg:flex-shrink-0'>
);

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', src, 'utf8');
console.log('Done');
