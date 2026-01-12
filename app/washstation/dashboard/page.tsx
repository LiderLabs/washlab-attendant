import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { DashboardContent } from '@/components/washstation/pages/DashboardContent';

export default function POSDashboard() {
  return (
    <WashStationLayout title="Dashboard">
      <DashboardContent />
    </WashStationLayout>
  );
}
