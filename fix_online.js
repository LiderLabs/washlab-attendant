const fs = require('fs');
let src = fs.readFileSync('components/washstation/pages/OnlineOrdersContent.tsx', 'utf8');

// 1. Make customer instructions read-only (remove onChange, add readOnly)
src = src.replace(
  `                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add or edit customer instructions..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-muted border-0 rounded-xl text-foreground placeholder:text-muted-foreground resize-none h-20 sm:h-24 text-sm sm:text-base"
                />`,
  `                <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground text-sm sm:text-base min-h-[5rem] whitespace-pre-wrap">
                  {selectedOrder.notes || selectedOrder.customerNotes || <span className="text-muted-foreground italic">No instructions from customer</span>}
                </div>`
);

// 2. Replace the entire right Service Details panel with a clean Order Summary
const oldPanel = `      {/* \u2500\u2500 Right: Service Details \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      {selectedOrder && (
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-card p-4 overflow-y-auto flex-shrink-0">
          <h3 className="font-semibold text-foreground mb-4">Service Details</h3>

          <div className="space-y-4">
            {/* Service type */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase mb-2 block">SERVICE TYPE</Label>
              <Select value={selectedOrder.serviceType || "wash_and_fold"} onValueChange={() => {}} disabled>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wash_and_fold">Wash & Fold (Standard)</SelectItem>
                  <SelectItem value="wash_and_dry">Wash & Dry</SelectItem>
                  <SelectItem value="wash_only">Wash Only</SelectItem>
                  <SelectItem value="dry_only">Dry Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Detergent + Softener */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase mb-2 block">DETERGENT</Label>
                <Select value={detergent} onValueChange={setDetergent}>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Tide (Standard)</SelectItem>
                    <SelectItem value="sensitive">Sensitive</SelectItem>
                    <SelectItem value="eco">Eco-Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase mb-2 block">SOFTENER</Label>
                <Select value={softener} onValueChange={setSoftener}>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="fresh">Fresh Scent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* \u2705 Pricing breakdown \u2013 shows loads, whites, delivery */}
            <div className="pt-4 border-t border-border space-y-2">

              {weight > 0 ? (
                <>
                  {/* Loads row */}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {pricing.numberOfLoads} load{pricing.numberOfLoads !== 1 ? "s" : ""} \u00d7 \u20b5{pricing.pricePerLoad.toFixed(2)}
                    </span>
                    <span className="text-foreground">\u20b5{(pricing.numberOfLoads * pricing.pricePerLoad).toFixed(2)}</span>
                  </div>

                  {/* Whites extra load */}
                  {pricing.whitesExtraLoad > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-primary" />
                        Whites (extra load) \u00d7 \u20b5{pricing.pricePerLoad.toFixed(2)}
                      </span>
                      <span className="text-foreground">\u20b5{(pricing.pricePerLoad).toFixed(2)}</span>
                    </div>
                  )}

                  {/* Delivery fee */}
                  {selectedOrder.isDelivery && pricing.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span className="text-foreground">\u20b5{pricing.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Total loads summary */}
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>Total loads: {pricing.totalLoads}</span>
                    <span>{weight.toFixed(1)} kg actual</span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground italic">Enter weight to see price breakdown</p>
              )}

              {/* Total */}
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-medium text-foreground">Estimated Total</span>
                <span className="text-xl font-bold text-success">\u20b5{pricing.total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
              onClick={() => router.push(\`/washstation/orders/\${selectedOrder._id}\`)}
            >
              <Clock className="w-4 h-4" />
              View Order History
            </Button>
          </div>
        </div>
      )}`;

const newPanel = `      {/* \u2500\u2500 Right: Order Summary \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      {selectedOrder && (
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-card p-4 overflow-y-auto flex-shrink-0">
          <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
          <div className="space-y-3">
            {/* Service */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service</span>
              <span className="font-medium">{getServiceName(selectedOrder.serviceType || "wash_and_fold")}</span>
            </div>
            {/* Weight weighed vs estimated */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Est. Weight</span>
              <span className="font-medium">{selectedOrder.estimatedWeight?.toFixed(1) || "0.0"} kg</span>
            </div>
            {weight > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Actual Weight</span>
                <span className="font-medium text-primary">{weight.toFixed(1)} kg</span>
              </div>
            )}
            {/* Pricing breakdown only after weight entered */}
            {weight > 0 ? (
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {pricing.numberOfLoads} load{pricing.numberOfLoads !== 1 ? "s" : ""} \u00d7 \u20b5{pricing.pricePerLoad.toFixed(2)}
                  </span>
                  <span>\u20b5{(pricing.numberOfLoads * pricing.pricePerLoad).toFixed(2)}</span>
                </div>
                {pricing.whitesExtraLoad > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Whites (extra load)</span>
                    <span>\u20b5{pricing.pricePerLoad.toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.isDelivery && pricing.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>\u20b5{pricing.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Total loads: {pricing.totalLoads}</span>
                  <span>{weight.toFixed(1)} kg actual</span>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground italic">Enter weight above to see load breakdown</p>
              </div>
            )}
            {/* Total */}
            <div className="flex justify-between pt-3 border-t border-border">
              <span className="font-semibold text-foreground">Estimated Total</span>
              <span className="text-xl font-bold text-success">
                \u20b5{weight > 0 ? pricing.total.toFixed(2) : (selectedOrder.totalPrice || selectedOrder.estimatedPrice || 0).toFixed(2)}
              </span>
            </div>
            <Button
              variant="ghost"
              className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
              onClick={() => router.push(\`/washstation/orders/\${selectedOrder._id}\`)}
            >
              <Clock className="w-4 h-4" />
              View Order History
            </Button>
          </div>
        </div>
      )}`;

src = src.replace(oldPanel, newPanel);
fs.writeFileSync('components/washstation/pages/OnlineOrdersContent.tsx', src, 'utf8');
console.log('Done! Lines:', src.split('\n').length);
