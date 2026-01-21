'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@devlider001/washlab-backend/api';
import { useStationSession } from '@/hooks/useStationSession';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Package, 
  Settings,
  Clock,
  CreditCard,
  Activity,
  Bell,
  X
} from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchName?: string;
}

export function MobileSidebar({ open, onOpenChange, branchName = 'Central Branch' }: MobileSidebarProps) {
  const pathname = usePathname();
  const { stationToken } = useStationSession();
  
  // Get unread notification count
  const unreadCount = useQuery(
    api.stations.getStationUnreadCount,
    stationToken ? { stationToken } : 'skip'
  ) ?? 0;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/washstation/dashboard' },
    { id: 'orders', label: 'Orders', icon: ClipboardList, path: '/washstation/orders' },
    { id: 'clock-in', label: 'Clock In/Out', icon: Clock, path: '/washstation/clock-in' },
    { id: 'attendance', label: 'Attendance', icon: Clock, path: '/washstation/attendance' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/washstation/notifications', showBadge: true },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, path: '/washstation/transactions' },
    { id: 'activity', label: 'Activity Log', icon: Activity, path: '/washstation/activity' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/washstation/customers' },
    { id: 'inventory', label: 'Inventory', icon: Package, path: '/washstation/inventory' },
  ];

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Image src="/washlab-logo.png" alt="WashLab" width={120} height={40} className="h-10 w-auto" priority />
          </SheetTitle>
        </SheetHeader>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const badgeCount = item.showBadge && item.id === 'notifications' ? unreadCount : 0;
            
            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => onOpenChange(false)}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                  active 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {badgeCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className={`h-5 min-w-5 px-1.5 text-xs flex items-center justify-center ${
                      active ? 'bg-primary-foreground text-primary' : ''
                    }`}
                  >
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings - Bottom */}
        <div className="p-3 border-t border-border">
          <Link
            href="/washstation/settings"
            onClick={() => onOpenChange(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/washstation/settings')
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </div>

        {/* Staff Info */}
        {/* Branch Info */}
        {(
          <div className="p-4 border-t border-border">
            <Link 
              href="/washstation/shift"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 hover:bg-muted/50 p-2 -m-2 rounded-xl transition-colors"
            >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold border-2 border-primary">
              {branchName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Branch</p>
              <p className="font-medium text-foreground text-sm truncate">{branchName}</p>
            </div>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
