import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { InventoryContent } from '@/components/washstation/pages/InventoryContent';

export default function InventoryPage() {
  return (
    <WashStationLayout title="Inventory">
      <InventoryContent />
    </WashStationLayout>
  );
}
