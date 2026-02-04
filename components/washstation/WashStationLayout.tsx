'use client';

import { useState, useEffect } from 'react';
import WashStationSidebar from './WashStationSidebar';
import { MobileSidebar } from './MobileSidebar';
import WashStationHeader from './WashStationHeader';
import { useOrders } from '@/context/OrderContext';
import { useStationSession } from '@/hooks/useStationSession';
import { useStationAttendance } from '@/hooks/useStationAttendance';

interface WashStationLayoutProps {
  children: React.ReactNode;
  title: string;
  branchName?: string;
  terminalId?: string;
  pendingCount?: number;
  onNotificationClick?: () => void;
}

export function WashStationLayout({
  children,
  title,
  branchName,
  terminalId,
  pendingCount,
  onNotificationClick,
}: WashStationLayoutProps) {
  const { getPendingOrders } = useOrders();
  const { stationToken, sessionData } = useStationSession();
  const { attendances } = useStationAttendance(stationToken);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [currentBranchName, setCurrentBranchName] = useState(
    branchName || 'Central Branch'
  );

  // Determine pending orders count
  const actualPendingCount =
    pendingCount !== undefined ? pendingCount : getPendingOrders().length;

  // Load branch name & sidebar collapse from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Branch name
    const storedBranchName = localStorage.getItem('station_branch_name');
    if (storedBranchName) {
      setCurrentBranchName(storedBranchName);
    } else if (branchName) {
      setCurrentBranchName(branchName);
    }

    // Sidebar collapse state
    const storedCollapsed = localStorage.getItem('sidebar_collapsed');
    if (storedCollapsed === 'true') setCollapsed(true);
  }, [branchName]);

  // Persist collapse state
  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const newState = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar_collapsed', newState.toString());
      }
      return newState;
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <WashStationSidebar
        branchName={currentBranchName}
        collapsed={collapsed}
        onToggle={handleToggleCollapse}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
        branchName={currentBranchName}
      />

      {/* Main Content */}
      <main
        className={`flex-1 min-w-0 overflow-x-hidden transition-all duration-300 ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Header */}
        <WashStationHeader
          title={title}
          branchName={currentBranchName}
          activeAttendances={attendances}
          pendingCount={actualPendingCount}
          onNotificationClick={onNotificationClick}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        {/* Page Content */}
        <div className="p-4 md:p-6 min-w-0 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
