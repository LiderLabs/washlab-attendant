const fs = require("fs");

const pageSrc = `import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import ReportsContent from '@/components/washstation/pages/ReportsContent';

export default function DailyReportPage() {
  return (
    <WashStationLayout title="Daily Report">
      <ReportsContent />
    </WashStationLayout>
  );
}`;

fs.writeFileSync("app/washstation/reports/page.tsx", pageSrc, "utf8");
console.log("Done");
