const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

src = src.replace(
  "  ChevronLeft,\r\n  ChevronRight,\r\n  X,\r\n} from \"lucide-react\"",
  "  ChevronLeft,\r\n  ChevronRight,\r\n} from \"lucide-react\""
);

fs.writeFileSync("components/washstation/pages/NewOrderContent.tsx", src, "utf8");

// Verify only one X remains
const matches = src.match(/\bX,/g);
console.log("X count:", matches?.length, "(should be 1)");
