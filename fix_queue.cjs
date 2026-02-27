const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");

// Find and replace the entire QueuePanel const with a clean version
const queueStart = src.indexOf("  const QueuePanel = (");
const queueEnd = src.indexOf("  // ── Detail Panel", queueStart);

const newQueuePanel = `  const QueuePanel = (
    <div className={\`
      \${mobileView === "queue" ? "flex" : "hidden"}
      lg:flex w-full lg:w-72 border-r border-border bg-card flex-col flex-shrink-0 h-full
    \`}>
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {isLoadingOrders ? (
          <div className="p-8 text-center text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-50 animate-pulse" />
            <p className="text-sm">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <button
              key={order._id}
              onClick={() => handleSelectOrder(order)}
              className={\`w-full p-3 sm:p-4 text-left transition-colors \${
                selectedOrder?._id === order._id
                  ? "bg-primary/10 border-l-4 border-primary"
                  : "hover:bg-muted/50"
              }\`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground text-sm truncate">
                  {order.customer?.name || "Unknown"}
                </span>
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                  {getTimeAgo(order.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-primary font-medium">#{order.orderNumber}</span>
                <span>·</span>
                <span className="truncate">{getServiceName(order.serviceType || "wash_and_fold")}</span>
                {order.isDelivery && <><span>·</span><span className="text-amber-500">Delivery</span></>}
              </div>
            </button>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No pending orders</p>
          </div>
        )}
      </div>
    </div>
  )

  `;

src = src.substring(0, queueStart) + newQueuePanel + src.substring(queueEnd);
fs.writeFileSync("components/washstation/pages/OnlineOrdersContent.tsx", src, "utf8");
console.log("QueuePanel rewritten");
