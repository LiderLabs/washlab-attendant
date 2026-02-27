const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");

// 1. Remove "Intake Queue / Pending / Estimated Volume" header block
src = src.replace(
  `        <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Intake Queue</h2>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {pendingOrders.length} Pending
          </span>
        </div>
        <div className="text-sm">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Estimated Volume</p>
          <p className="text-xl font-bold text-foreground">{totalVolume.toFixed(1)} kg</p>
        </div>
      </div>`,
  `        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Intake Queue</h2>
        </div>`
);

// 2. Remove Items Verification section
const itemsStart = src.indexOf("        {/* Items Verification */}");
const itemsEnd = src.indexOf("        {/* Order Summary", itemsStart);
if (itemsStart !== -1 && itemsEnd !== -1) {
  src = src.substring(0, itemsStart) + src.substring(itemsEnd);
  console.log("Items Verification removed");
} else {
  console.log("Items Verification markers not found:", itemsStart, itemsEnd);
}

// 3. Remove Est. Weight row from Order Summary
src = src.replace(
  `            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Weight</span>
              <span className="font-medium">{selectedOrder.estimatedWeight?.toFixed(1) || "0.0"} kg</span>
            </div>`,
  ``
);

// 4. Change "Estimated Total" to "Total"
src = src.replace(
  `                  <span className="font-semibold text-foreground">Estimated Total</span>`,
  `                  <span className="font-semibold text-foreground">Total</span>`
);

fs.writeFileSync("components/washstation/pages/OnlineOrdersContent.tsx", src, "utf8");
console.log("Done");
