const fs = require("fs");
let src = fs.readFileSync("components/washstation/OrderRowExpander.tsx", "utf8");

// Fix 1: handleStart goes to washing
src = src.replace(
  `setLocalStatus("checked_in" as OrderStatus)
    try {
      await changeStatus(order._id as Id<"orders">, "checked_in" as OrderStatus)
      toast.success("Order checked in")`,
  `setLocalStatus("washing" as OrderStatus)
    try {
      await changeStatus(order._id as Id<"orders">, "washing" as OrderStatus)
      toast.success("Order started")`
);

// Fix 2: Single button - replace two separate buttons with one smart button
src = src.replace(
  `{isNotStarted && (
        <button
          onClick={(e) => { e.stopPropagation(); handleStart() }}
          disabled={isMoving}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isMoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          Start
        </button>
      )}

      {(isInProgress || isReady) && (
        <button
          onClick={(e) => { e.stopPropagation(); handleDone() }}
          disabled={isMoving}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isMoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
          Done
        </button>
      )}`,
  `{(isNotStarted || isInProgress || isReady) && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            isNotStarted ? handleStart() : handleDone()
          }}
          disabled={isMoving}
          className={\`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 \${isNotStarted ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-green-600 text-white hover:bg-green-700"}\`}
        >
          {isMoving ? <Loader2 className="w-3 h-3 animate-spin" /> : isNotStarted ? <Play className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
          {isNotStarted ? "Start" : "Done"}
        </button>
      )}`
);

fs.writeFileSync("components/washstation/OrderRowExpander.tsx", src, "utf8");
console.log("1. Start->washing:", src.includes('"washing" as OrderStatus)\n      toast.success("Order started")'));
console.log("2. Single button:", src.includes("isNotStarted ? handleStart() : handleDone()"));
