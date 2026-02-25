const fs = require('fs');
const lines = fs.readFileSync('components/washstation/pages/OnlineOrdersContent.tsx', 'utf8').split('\n');

// Fix 1: Customer instructions - make read-only (lines ~460-466, find textarea)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('value={notes}') && lines[i+1] && lines[i+1].includes('onChange={(e) => setNotes')) {
    // Find the textarea block start
    let start = i;
    while (start > 0 && !lines[start].includes('<textarea')) start--;
    let end = i + 3;
    while (end < lines.length && !lines[end].includes('/>')) end++;
    lines.splice(start, end - start + 1,
      `                <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground text-sm sm:text-base min-h-[5rem] whitespace-pre-wrap">`,
      `                  {(selectedOrder as any).notes || (selectedOrder as any).customerNotes || (selectedOrder as any).specialInstructions || <span className="text-muted-foreground italic">No instructions from customer</span>}`,
      `                </div>`
    );
    console.log('Fix 1 done: customer instructions read-only at line', start);
    break;
  }
}

// Fix 2: Replace Service Details panel - find by h3 text
let panelStart = -1, panelEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Right: Service Details')) panelStart = i - 0;
  if (panelStart > 0 && lines[i].includes('View Order History') && lines[i+1] && lines[i+1].includes('</Button>')) {
    // find closing </div> </div> )}
    panelEnd = i + 5;
    while (panelEnd < lines.length && !lines[panelEnd].includes(')}')) panelEnd++;
    break;
  }
}

if (panelStart > 0 && panelEnd > 0) {
  const newPanel = [
    `      {/* Right: Order Summary */}`,
    `      {selectedOrder && (`,
    `        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-card p-4 overflow-y-auto flex-shrink-0">`,
    `          <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>`,
    `          <div className="space-y-3">`,
    `            <div className="flex justify-between text-sm">`,
    `              <span className="text-muted-foreground">Service</span>`,
    `              <span className="font-medium">{getServiceName(selectedOrder.serviceType || "wash_and_fold")}</span>`,
    `            </div>`,
    `            <div className="flex justify-between text-sm">`,
    `              <span className="text-muted-foreground">Est. Weight</span>`,
    `              <span className="font-medium">{selectedOrder.estimatedWeight?.toFixed(1) || "0.0"} kg</span>`,
    `            </div>`,
    `            {weight > 0 && (`,
    `              <div className="flex justify-between text-sm">`,
    `                <span className="text-muted-foreground">Actual Weight</span>`,
    `                <span className="font-medium text-primary">{weight.toFixed(1)} kg</span>`,
    `              </div>`,
    `            )}`,
    `            {weight > 0 ? (`,
    `              <div className="pt-3 border-t border-border space-y-2">`,
    `                <div className="flex justify-between text-sm">`,
    `                  <span className="text-muted-foreground">{pricing.numberOfLoads} load{pricing.numberOfLoads !== 1 ? "s" : ""} x {pricing.pricePerLoad.toFixed(2)}</span>`,
    `                  <span>GHS {(pricing.numberOfLoads * pricing.pricePerLoad).toFixed(2)}</span>`,
    `                </div>`,
    `                {pricing.whitesExtraLoad > 0 && (`,
    `                  <div className="flex justify-between text-sm">`,
    `                    <span className="text-muted-foreground">Whites (extra load)</span>`,
    `                    <span>GHS {pricing.pricePerLoad.toFixed(2)}</span>`,
    `                  </div>`,
    `                )}`,
    `                {selectedOrder.isDelivery && pricing.deliveryFee > 0 && (`,
    `                  <div className="flex justify-between text-sm">`,
    `                    <span className="text-muted-foreground">Delivery Fee</span>`,
    `                    <span>GHS {pricing.deliveryFee.toFixed(2)}</span>`,
    `                  </div>`,
    `                )}`,
    `                <div className="flex justify-between text-xs text-muted-foreground">`,
    `                  <span>Total loads: {pricing.totalLoads}</span>`,
    `                  <span>{weight.toFixed(1)} kg actual</span>`,
    `                </div>`,
    `              </div>`,
    `            ) : (`,
    `              <div className="pt-3 border-t border-border">`,
    `                <p className="text-xs text-muted-foreground italic">Enter weight above to see breakdown</p>`,
    `              </div>`,
    `            )}`,
    `            <div className="flex justify-between pt-3 border-t border-border">`,
    `              <span className="font-semibold text-foreground">Estimated Total</span>`,
    `              <span className="text-xl font-bold text-success">`,
    `                GHS {weight > 0 ? pricing.total.toFixed(2) : ((selectedOrder as any).totalPrice || (selectedOrder as any).estimatedPrice || (selectedOrder as any).finalPrice || 0).toFixed(2)}`,
    `              </span>`,
    `            </div>`,
    `            <button`,
    `              className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 mt-2 py-2"`,
    `              onClick={() => router.push('/washstation/orders/' + selectedOrder._id)}`,
    `            >`,
    `              View Order History`,
    `            </button>`,
    `          </div>`,
    `        </div>`,
    `      )}`,
  ];
  lines.splice(panelStart, panelEnd - panelStart + 1, ...newPanel);
  console.log('Fix 2 done: replaced Service Details with Order Summary, start:', panelStart, 'end:', panelEnd);
} else {
  console.log('Fix 2 FAILED - panel not found. panelStart:', panelStart, 'panelEnd:', panelEnd);
}

fs.writeFileSync('components/washstation/pages/OnlineOrdersContent.tsx', lines.join('\n'), 'utf8');
console.log('Done! Lines:', lines.length);
