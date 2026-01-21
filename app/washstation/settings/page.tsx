import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { SettingsContent } from '@/components/washstation/pages/SettingsContent';

export default function SettingsPage() {
  return (
    <WashStationLayout title="Settings">
      <SettingsContent />
    </WashStationLayout>
  );
}
