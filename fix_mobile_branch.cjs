const fs = require('fs');
let src = fs.readFileSync('components/washstation/MobileSidebar.tsx', 'utf8');

// Replace branchName prop default with sessionData lookup
src = src.replace(
  "export function MobileSidebar({ open, onOpenChange, branchName = 'Central Branch' }: MobileSidebarProps) {",
  "export function MobileSidebar({ open, onOpenChange, branchName }: MobileSidebarProps) {\n  const { sessionData } = useStationSession();\n  const resolvedBranchName = branchName || (sessionData as any)?.branchName || sessionData?.branchCode || 'Branch';"
);

// Replace all uses of branchName in JSX with resolvedBranchName
src = src.replace(/\{branchName\}/g, '{resolvedBranchName}');
src = src.replace(/branchName\.split/g, 'resolvedBranchName.split');

fs.writeFileSync('components/washstation/MobileSidebar.tsx', src, 'utf8');
console.log('Branch name fix done');
