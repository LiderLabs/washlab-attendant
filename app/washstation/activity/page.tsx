import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { ActivityContent } from '@/components/washstation/pages/ActivityContent';

export default function ActivityLogPage() {
  return (
    <WashStationLayout title="Activity Log">
      <ActivityContent />
    </WashStationLayout>
  );
}
