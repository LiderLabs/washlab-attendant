const fs = require('fs');
let src = fs.readFileSync('components/washstation/WashStationHeader.tsx', 'utf8');

// Add Plus import
src = src.replace(
  "import { Bell, User, Menu, LogOut, Clock, Timer, Users } from 'lucide-react';",
  "import { Bell, User, Menu, LogOut, Clock, Timer, Users, Plus } from 'lucide-react';"
);

// Add usePathname import
src = src.replace(
  "import { useRouter } from 'next/navigation';",
  "import { useRouter, usePathname } from 'next/navigation';"
);

// Add usePathname hook after useRouter
src = src.replace(
  "  const router = useRouter();",
  "  const router = useRouter();\n  const pathname = usePathname();\n  const isNewOrderPage = pathname === '/washstation/new-order';"
);

// Add Start Order button before the attendance status dropdown
src = src.replace(
  "      <div className=\"flex items-center gap-2 md:gap-3\">",
        <div className="flex items-center gap-2 md:gap-3">
        {/* Start Order Button - visible on all pages except new-order */}
        {!isNewOrderPage && (
          <Button
            onClick={() => router.push('/washstation/new-order')}
            size="sm"
            className="h-8 md:h-9 px-3 md:px-4 bg-primary text-primary-foreground rounded-lg font-medium text-xs md:text-sm flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Start Order</span>
            <span className="sm:hidden">Order</span>
          </Button>
        )}
);

fs.writeFileSync('components/washstation/WashStationHeader.tsx', src, 'utf8');
console.log('Start Order button added to header');
