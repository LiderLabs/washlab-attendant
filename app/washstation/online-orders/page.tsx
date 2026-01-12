import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { OnlineOrdersContent } from '@/components/washstation/pages/OnlineOrdersContent';

export default function OnlineOrdersPage() {
  return (
    <WashStationLayout title="Online Orders">
      <OnlineOrdersContent />
    </WashStationLayout>
  );
}
