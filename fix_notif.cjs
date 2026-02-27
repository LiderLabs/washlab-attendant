const fs = require("fs");

// Fix MobileSidebar - remove notifications badge reference
let mobile = fs.readFileSync("components/washstation/MobileSidebar.tsx", "utf8");

// Remove the unreadCount query since notifications is gone
mobile = mobile.replace(
  /\s*const unreadCount = useQuery\([\s\S]*?\) \?\? 0;/,
  ""
);

// Remove showBadge badge logic
mobile = mobile.replace(
  /\s*const badgeCount = item\.showBadge && item\.id === ['"]notifications['"] \? unreadCount : 0;/,
  "\n            const badgeCount = 0;"
);

// Remove showBadge from navItems entries
mobile = mobile.replace(/,?\s*showBadge:\s*true/g, "");

fs.writeFileSync("components/washstation/MobileSidebar.tsx", mobile, "utf8");
console.log("Mobile sidebar cleaned");

// Also clean WashStationSidebar of any badge/unread references
let sidebar = fs.readFileSync("components/washstation/WashStationSidebar.tsx", "utf8");
sidebar = sidebar.replace(/,?\s*showBadge:\s*true/g, "");
fs.writeFileSync("components/washstation/WashStationSidebar.tsx", sidebar, "utf8");
console.log("Sidebar cleaned");
