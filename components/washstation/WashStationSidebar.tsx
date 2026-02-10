'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  branchName?: string;
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * WashStation Sidebar (Retractable)
 */
const WashStationSidebar = ({
  branchName = 'Central Branch',
  collapsed,
  onToggle,
}: SidebarProps) => {
  const pathname = usePathname();
  const { stationToken } = useStationSession();

  const unreadCount =
    useQuery(
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

  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(path + '/');

  return (
    <aside
      className={`hidden lg:flex ${
        collapsed ? 'w-20' : 'w-64'
      } bg-card border-r border-border flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300`}
    >
      {/* Logo + Toggle */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link href="/washstation/dashboard" className="flex items-center">
          {/* Full Logo */}
          {!collapsed && (
            <Image
              src="/washlab-logo.png"
              alt="WashLab"
              width={140}   // rectangular logo
              height={40}
              className="transition-transform duration-300 scale-100"
              priority
            />
          )}

          {/* Favicon */}
          {collapsed && (
            <Image
              src="/washlab-favicon1.png"
              alt="WashLab"
              width={500}    // square favicon
              height={500}
              className="transition-transform duration-300 scale-100"
              priority
            />
          )}
        </Link>

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className="p-1 rounded-md hover:bg-muted"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const badgeCount =
            item.showBadge && item.id === 'notifications' ? unreadCount : 0;

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                active
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                {!collapsed && <span>{item.label}</span>}
              </div>

              {badgeCount > 0 && !collapsed && (
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

      {/* Settings */}
      <div className="p-3 border-t border-border">
        <Link
          href="/washstation/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive('/washstation/settings')
              ? 'bg-primary text-primary-foreground font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>

      {/* Branch Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold border-2 border-primary">
            {branchName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Branch</p>
              <p className="font-medium text-foreground text-sm truncate">
                {branchName}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default WashStationSidebar;
