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
  const [currentBranchName, setCurrentBranchName] = useState(branchName || 'Central Branch');
  
  // Get pending orders count if not provided
  const actualPendingCount = pendingCount !== undefined ? pendingCount : getPendingOrders().length;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Get branch name from localStorage
    const storedBranchName = localStorage.getItem('station_branch_name');
    if (storedBranchName) {
      setCurrentBranchName(storedBranchName);
    } else if (branchName) {
      setCurrentBranchName(branchName);
    }
  }, [branchName]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <WashStationSidebar 
        branchName={currentBranchName}
      />
      
      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
        branchName={currentBranchName}
      />
      
      <main className="flex-1 lg:ml-64 min-w-0 overflow-x-hidden">
        {/* Header */}
        <WashStationHeader 
          title={title}
          branchName={currentBranchName}
          terminalId={terminalId || sessionData?.terminalId || undefined}
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
