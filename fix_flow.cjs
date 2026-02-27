const fs = require("fs");
let src = fs.readFileSync("components/washstation/OrderRowExpander.tsx", "utf8");

// 1. Remove handleReady function
src = src.replace(
  `  const handleReady = () => {
    moveToStatus("ready" as OrderStatus)
  }

  `,
  ""
);

// 2. Remove isReady and isInProgress distinctions - treat both as "in progress, show Done"
// Replace the isInProgress block (Ready button) with Done button directly
src = src.replace(
  `      {isInProgress && (
        <button
          onClick={(e) => { e.stopPropagation(); handleReady() }}
          disabled={isMoving}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isMoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
          Ready
        </button>
      )}

      {isReady && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handleWhatsApp() }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-green-500 text-green-600 text-xs font-semibold hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
            Notify
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDone() }}
            disabled={isMoving}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isMoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
            Done
          </button>
        </>
      )}`,
  `      {(isInProgress || isReady) && (
        <button
          onClick={(e) => { e.stopPropagation(); handleDone() }}
          disabled={isMoving}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isMoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
          Done
        </button>
      )}`
);

// 3. Remove unused MessageCircle import
src = src.replace(
  `import { Play, CheckCircle, MessageCircle, Loader2, CreditCard } from "lucide-react"`,
  `import { Play, CheckCircle, Loader2, CreditCard } from "lucide-react"`
);

fs.writeFileSync("components/washstation/OrderRowExpander.tsx", src, "utf8");
console.log("Expander fixed");

// Fix refresh button on orders page
let orders = fs.readFileSync("app/washstation/orders/page.tsx", "utf8");
orders = orders.replace(
  `<Button variant="outline" size="icon"><RefreshCw className="w-4 h-4" /></Button>`,
  `<Button variant="outline" size="icon" onClick={() => window.location.reload()}><RefreshCw className="w-4 h-4" /></Button>`
);
fs.writeFileSync("app/washstation/orders/page.tsx", orders, "utf8");
console.log("Refresh button fixed");

// Remove Notifications from WashStationSidebar
let sidebar = fs.readFileSync("components/washstation/WashStationSidebar.tsx", "utf8");
sidebar = sidebar.replace(
  /\s*\{ id: 'notifications'[^\}]*\},?/,
  ""
);
fs.writeFileSync("components/washstation/WashStationSidebar.tsx", sidebar, "utf8");
console.log("Sidebar notifications removed");

// Remove Notifications from MobileSidebar
let mobile = fs.readFileSync("components/washstation/MobileSidebar.tsx", "utf8");
mobile = mobile.replace(
  /\s*\{ id: 'notifications'[^\}]*\},?/,
  ""
);
fs.writeFileSync("components/washstation/MobileSidebar.tsx", mobile, "utf8");
console.log("Mobile sidebar notifications removed");
