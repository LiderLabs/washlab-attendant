'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, User, Menu, LogOut, Clock, Timer, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { useStationSession } from '@/hooks/useStationSession';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@devlider001/washlab-backend/api';
import { useToast } from '@/hooks/use-toast';

interface AttendanceInfo {
  _id: string;
  clockInAt: number;
  attendant: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

interface HeaderProps {
  title: string;
  branchName?: string;
  activeAttendances?: AttendanceInfo[];
  pendingCount?: number;
  onNotificationClick?: () => void;
  onMenuClick?: () => void;
}

const WashStationHeader = ({ 
  title, 
  branchName = 'Central Branch',
  activeAttendances = [],
  pendingCount = 0,
  onNotificationClick,
  onMenuClick
}: HeaderProps) => {
  const router = useRouter();
  const { stationToken, clearSession } = useStationSession();
  const logoutStation = useMutation(api.stations.logoutStation);
  const { toast } = useToast();

  // Get unread notification count from backend
  const unreadCount = useQuery(
    api.stations.getStationUnreadCount,
    stationToken ? { stationToken } : 'skip'
  ) ?? 0;

  const handleSignOut = async () => {
    try {
      // Clear session first to stop queries from executing
      clearSession();
      
      // Then try to logout on server if we have a token
      if (stationToken) {
        try {
          await logoutStation({ stationToken });
        } catch (error) {
          // Ignore server logout errors - we're already logged out locally
          console.warn('Server logout error (ignored):', error);
        }
      }
      
      // Redirect immediately
      router.push('/login');
      
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure session is cleared and redirect
      clearSession();
      router.push('/login');
    }
  };
  // Track current time for elapsed time calculation
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        {/* Mobile Menu Button */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden -ml-2"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-base md:text-lg font-semibold text-foreground truncate">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        {/* Attendance Status Dropdown - shows all active attendants */}
        {activeAttendances.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-rowmd:flex items-center gap-2 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg border border-green-200 dark:border-green-900 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="hidden md:block text-sm font-medium text-green-600 dark:text-green-400">
                    {activeAttendances.length} Active
                  </span>
                </div>
                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Attendants</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900">
                    {activeAttendances.length}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                {activeAttendances.map((attendance) => {
                  const clockInTime = new Date(attendance.clockInAt);
                  const diff = currentTime - attendance.clockInAt;
                  const hours = Math.floor(diff / (1000 * 60 * 60));
                  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                  return (
                    <div key={attendance._id} className="px-2 py-2 hover:bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-xs">
                          {attendance.attendant?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {attendance.attendant?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {attendance.attendant?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground ml-10">
                        <Clock className="w-3 h-3" />
                        <span>Clocked in {formatDistanceToNow(clockInTime, { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400 ml-10 mt-1">
                        <Timer className="w-3 h-3" />
                        <span>{timeString}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border border-border">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No active attendants</span>
          </div>
        )}

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Notifications */}
        <button 
          onClick={() => {
            if (onNotificationClick) {
              onNotificationClick();
            } else {
              router.push('/washstation/notifications');
            }
          }}
          className="p-2 rounded-lg hover:bg-muted transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Station Status with Sign Out */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 md:pl-3 border-l border-border hover:bg-muted/50 rounded-lg p-2 transition-colors">
              <div className="hidden md:block text-right">
                <p className="text-xs text-muted-foreground">Wash Site</p>
                <p className="font-medium text-foreground text-sm">{branchName}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Station</p>
                <p className="text-xs leading-none text-muted-foreground">{branchName}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/washstation/notifications" className="flex items-center cursor-pointer">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default WashStationHeader;
