const fs = require("fs");
let src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");

// Remove debug line if added
src = src.replace(
  "console.log('DEBUG branchId:', branchId, 'isSessionValid:', isSessionValid, 'autoData:', autoData);\n  const autoData = useQuery(",
  "const autoData = useQuery("
);

// Fix: skip condition - just use stationToken, dont require isSessionValid
src = src.replace(
  "branchId && isSessionValid ? { branchId, date: today() } : 'skip'",
  "branchId ? { branchId, date: today() } : 'skip'"
);

// Same for existingDraft
src = src.replace(
  "branchId && isSessionValid ? { branchId, date: today() } : 'skip'\n  );\n\n  const saveDraftMutation",
  "branchId ? { branchId, date: today() } : 'skip'\n  );\n\n  const saveDraftMutation"
);

fs.writeFileSync("app/washstation/report/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("branchId ? { branchId, date: today() }"));
