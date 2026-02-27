const fs = require("fs");

// Make the page.tsx a simple wrapper (no use client needed)
const pageSrc = `import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { ReportsContent } from '@/components/washstation/pages/ReportsContent';

export default function DailyReportPage() {
  return (
    <WashStationLayout title="Daily Report">
      <ReportsContent />
    </WashStationLayout>
  );
}`;

// Read existing reports page and convert to component
let src = fs.readFileSync("app/washstation/reports/page.tsx", "utf8");

// Remove the WashStationLayout wrapper from the component since page.tsx will handle it
src = src.replace("'use client';\n", "'use client';\n");

// Save as component
fs.writeFileSync("components/washstation/pages/ReportsContent.tsx", src, "utf8");

// Save simple page wrapper
fs.writeFileSync("app/washstation/reports/page.tsx", pageSrc, "utf8");

console.log("Done - page refactored to component");
