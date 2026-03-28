const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/DailyReportPage.tsx", "utf8");
src = src.replace(/\r\n/g, "\n");

// Add inventory query after the existing queries (after activeMachines)
src = src.replace(
  "  const reportFault = useMutation((api as any).maintenanceTickets.reportFault);",
  `  const reportFault = useMutation((api as any).maintenanceTickets.reportFault);
  const stationInventory = useQuery(
    (api as any).inventory.getStationInventory,
    stationToken ? { stationToken } : "skip"
  ) ?? [];
  const soapInventoryItems = (stationInventory as any[]).filter(
    (item: any) => item.category === "cleaning_supplies"
  );`
);

// Replace the soap input section with one that shows live inventory reference
src = src.replace(
  `          {/* Soap Used */}
          <div>
            <label className="text-sm text-muted-foreground font-medium block mb-1.5">Soap Used</label>
            <div className="relative">
              <Input type="number" min={0} value={soapUnits}
                onChange={e => setSoapUnits(parseFloat(e.target.value) || 0)}
                disabled={isSubmitted} className="pr-14" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Units</span>
            </div>
          </div>`,
  `          {/* Soap Used */}
          <div>
            <label className="text-sm text-muted-foreground font-medium block mb-1.5">Soap Used</label>
            {soapInventoryItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {soapInventoryItems.map((item: any) => (
                  <div key={item._id} className={"flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border " + (item.status === "critical" ? "bg-red-50 border-red-200 text-red-700" : item.status === "low" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-green-50 border-green-200 text-green-700")}>
                    <span>{item.name}</span>
                    <span className="font-bold">{item.currentStock} {item.unit}</span>
                    <span className="opacity-60">in stock</span>
                  </div>
                ))}
              </div>
            )}
            <div className="relative">
              <Input type="number" min={0} value={soapUnits}
                onChange={e => setSoapUnits(parseFloat(e.target.value) || 0)}
                disabled={isSubmitted} className="pr-14"
                placeholder="Enter units used today" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Units</span>
            </div>
            {soapInventoryItems.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">Stock shown above updates automatically as orders complete.</p>
            )}
          </div>`
);

fs.writeFileSync("components/washstation/pages/DailyReportPage.tsx", src);
console.log("soap inventory query added:", src.includes("getStationInventory") ? "YES" : "NO");
console.log("soap UI updated:", src.includes("soapInventoryItems") ? "YES" : "NO");
