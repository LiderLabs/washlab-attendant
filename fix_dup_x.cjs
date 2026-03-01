const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

// Remove the X we added since it already exists elsewhere
src = src.replace(
  "  ChevronLeft,\r\n  ChevronRight,\r\n  X,\r\n} from \"lucide-react\"",
  "  ChevronLeft,\r\n  ChevronRight,\r\n} from \"lucide-react\""
);

// Show all lucide imports to find where X already comes from
const matches = [...src.matchAll(/from "lucide-react"/g)];
matches.forEach(m => {
  console.log(JSON.stringify(src.substring(m.index - 150, m.index + 20)));
});
