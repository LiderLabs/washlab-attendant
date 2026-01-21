import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { NewOrderContent } from '@/components/washstation/pages/NewOrderContent';

export default function NewOrderPage() {
  return (
    <WashStationLayout title="Start Walk-in Order">
      <NewOrderContent />
    </WashStationLayout>
  );
}
