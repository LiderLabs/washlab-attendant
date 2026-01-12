'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Wifi,
  WifiOff,
  Printer,
  Bell,
  Moon,
  Sun,
  Shield,
  RefreshCw,
  HardDrive,
  Volume2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export function SettingsContent() {
  const { theme, setTheme } = useTheme();
  
  // Settings state
  const [branchOnline, setBranchOnline] = useState(true);
  const [darkMode, setDarkMode] = useState(theme === 'dark');
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [printerConnected, setPrinterConnected] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Load saved settings
    const storedStatus = sessionStorage.getItem('washlab_branch_status');
    if (storedStatus) {
      setBranchOnline(storedStatus === 'online');
    }
    
    // Sync theme with next-themes
    if (theme) {
      setDarkMode(theme === 'dark');
    }
  }, [theme]);

  const toggleBranchStatus = () => {
    const newStatus = !branchOnline;
    setBranchOnline(newStatus);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('washlab_branch_status', newStatus ? 'online' : 'offline');
    }
    toast.success(`Branch is now ${newStatus ? 'online' : 'offline'}`);
  };

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    setTheme(checked ? 'dark' : 'light');
    toast.success(`Switched to ${checked ? 'dark' : 'light'} mode`);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Branch Status */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Branch Status</h2>
        
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-4">
            {branchOnline ? (
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Wifi className="w-6 h-6 text-success" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <WifiOff className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-medium text-foreground">
                Branch is {branchOnline ? 'Online' : 'Offline'}
              </p>
              <p className="text-sm text-muted-foreground">
                {branchOnline 
                  ? 'Accepting new orders from customers' 
                  : 'Not accepting new orders'}
              </p>
            </div>
          </div>
          <Button 
            onClick={toggleBranchStatus}
            variant={branchOnline ? 'destructive' : 'default'}
            className="min-w-[120px]"
          >
            {branchOnline ? 'Go Offline' : 'Go Online'}
          </Button>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">System Settings</h2>
        
        <div className="space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Notifications</p>
                <p className="text-sm text-muted-foreground">Show alerts for new orders</p>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Sound Effects</p>
                <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
              </div>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>

          {/* Auto Refresh */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Auto Refresh</p>
                <p className="text-sm text-muted-foreground">Automatically refresh order list</p>
              </div>
            </div>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
        </div>
      </div>

      {/* Hardware Status */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Hardware Status</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              printerConnected ? 'bg-success/10' : 'bg-destructive/10'
            }`}>
              <Printer className={`w-5 h-5 ${printerConnected ? 'text-success' : 'text-destructive'}`} />
            </div>
            <div>
              <p className="font-medium text-foreground">Receipt Printer</p>
              <p className={`text-sm ${printerConnected ? 'text-success' : 'text-destructive'}`}>
                {printerConnected ? '● Connected' : '● Disconnected'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">Database</p>
              <p className="text-sm text-success">● Synced</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">Network</p>
              <p className="text-sm text-success">● Strong</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">Security</p>
              <p className="text-sm text-success">● Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">System Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="text-foreground font-medium">2.4.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Terminal ID</span>
            <span className="text-foreground font-medium">POS-04</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Sync</span>
            <span className="text-foreground font-medium">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
