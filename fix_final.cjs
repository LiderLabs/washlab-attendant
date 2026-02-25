const fs = require('fs');
let src = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8');

src = src.replace(
                        {Math.ceil(weight / 8)} load{Math.ceil(weight / 8) !== 1 ? "s" : ""} × ₵{selectedService.basePrice.toFixed(2)}\n</div>\n                  {(extraWashLoads > 0 || extraDryLoads > 0) && (\n                    <div className='text-xs sm:text-sm text-primary pl-2'>\n                      +{extraWashLoads + extraDryLoads} extra load(s) × ₵{selectedService?.basePrice.toFixed(2)}\n                    </div>\n                  )}\n                  )},
                        {Math.ceil(weight / 8)} load{Math.ceil(weight / 8) !== 1 ? "s" : ""} × ₵{selectedService.basePrice.toFixed(2)}\n                      {(extraWashLoads > 0 || extraDryLoads > 0) && (\n                        <span className='block text-primary'>+{extraWashLoads + extraDryLoads} extra load(s) × ₵{selectedService?.basePrice.toFixed(2)}</span>\n                      )}\n                    </div>\n                  )}
);

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', src, 'utf8');
console.log('Done:', src.includes('</div>\n                  {(extraWashLoads') ? 'STILL BROKEN' : 'FIXED');
