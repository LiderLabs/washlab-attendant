import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { TransactionsContent } from '@/components/washstation/pages/TransactionsContent';

export default function TransactionsPage() {
  return (
    <WashStationLayout title="Transactions">
      <TransactionsContent />
    </WashStationLayout>
  );
}
