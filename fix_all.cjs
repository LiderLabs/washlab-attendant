const fs = require('fs');

// ── Fix 1: Start Order button in header ─────────────────────────────────
let header = fs.readFileSync('components/washstation/WashStationHeader.tsx', 'utf8');

header = header.replace(
  "import { Bell, User, Menu, LogOut, Clock, Timer, Users } from 'lucide-react';",
  "import { Bell, User, Menu, LogOut, Clock, Timer, Users, Plus } from 'lucide-react';"
);
header = header.replace(
  "import { useRouter } from 'next/navigation';",
  "import { useRouter, usePathname } from 'next/navigation';"
);
header = header.replace(
  "  const router = useRouter();",
  "  const router = useRouter();\n  const pathname = usePathname();\n  const isNewOrderPage = pathname === '/washstation/new-order';"
);
header = header.replace(
  '      <div className="flex items-center gap-2 md:gap-3">',
  '      <div className="flex items-center gap-2 md:gap-3">\n        {!isNewOrderPage && (\n          <Button onClick={() => router.push(\'/washstation/new-order\')} size="sm" className="h-8 md:h-9 px-3 md:px-4 bg-primary text-primary-foreground rounded-lg font-medium text-xs md:text-sm flex items-center gap-1.5 shadow-sm">\n            <Plus className="w-3.5 h-3.5" />\n            <span className="hidden sm:inline">Start Order</span>\n            <span className="sm:hidden">Order</span>\n          </Button>\n        )}'
);
fs.writeFileSync('components/washstation/WashStationHeader.tsx', header, 'utf8');
console.log('Fix 1 done: Start Order button added to header');

// ── Fix 2: Phone input readOnly + remove Clear button ───────────────────
let order = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8');

order = order.replace(
  "                  type='tel'\n                  inputMode='numeric'\n                  value={formatPhoneDisplay(phone)}\n                  onChange={handlePhoneInputChange}\n                  placeholder='024 XXX XXXX'\n                  className='h-12 sm:h-14 text-xl sm:text-2xl font-semibold bg-muted border-0 rounded-xl px-3 sm:px-4 pr-10 text-foreground'\n                  autoComplete='off'",
  "                  type='tel'\n                  inputMode='none'\n                  readOnly\n                  value={formatPhoneDisplay(phone)}\n                  onChange={handlePhoneInputChange}\n                  placeholder='024 XXX XXXX'\n                  className='h-12 sm:h-14 text-xl sm:text-2xl font-semibold bg-muted border-0 rounded-xl px-3 sm:px-4 pr-10 text-foreground cursor-default'\n                  autoComplete='off'"
);
order = order.replace(
  "              {phone.length > 0 && (\n                <button\n                  onClick={() => { setPhone(\"\"); hasNavigatedFromPhoneRef.current = false }}\n                  className='flex items-center justify-center gap-2 h-12 sm:h-14 px-5 w-full rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 transition-colors'\n                >\n                  <ChevronLeft className='w-5 h-5' />\n                  Clear\n                </button>\n              )}",
  ""
);
fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', order, 'utf8');
console.log('Fix 2 done: readOnly input, Clear button removed');

console.log('All fixes done!');
