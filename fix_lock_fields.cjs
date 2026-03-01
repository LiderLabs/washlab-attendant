const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Fix 1: Lock dryer tokens - replace input with display text
src = src.replace(
  `{isSubmitted ? (\n                <p className="text-2xl font-bold text-foreground">{dryerTokens}</p>\n              ) : (\n                <input type="number" min={0} value={dryerTokens}\n                  onChange={e => setDryerTokens(parseInt(e.target.value) || 0)}\n                  className="text-2xl font-bold bg-transparent border-none outline-none text-foreground`,
  `{true ? (\n                <p className="text-2xl font-bold text-foreground">{dryerTokens}</p>\n              ) : (\n                <input type="number" min={0} value={dryerTokens}\n                  onChange={e => setDryerTokens(parseInt(e.target.value) || 0)}\n                  className="text-2xl font-bold bg-transparent border-none outline-none text-foreground`
);

// Fix 2: Lock payment fields - always show as text, never editable
src = src.replace(
  `{isSubmitted ? (\n                  <p className="text-lg font-bold text-foreground">{fmt(value)}</p>\n                ) : (\n                  <div className="flex items-center gap-1">\n                    <span className="text-xs text-muted-foreground">GHS</span>\n                    <input type="number" min={0} value={value}\n                      onChange={`,
  `{true ? (\n                  <p className="text-lg font-bold text-foreground">{fmt(value)}</p>\n                ) : (\n                  <div className="flex items-center gap-1">\n                    <span className="text-xs text-muted-foreground">GHS</span>\n                    <input type="number" min={0} value={value}\n                      onChange={`
);

fs.writeFileSync("components/washstation/pages/ReportsContent.tsx", src, "utf8");
console.log("1. Dryer locked:", !src.includes("onChange={e => setDryerTokens") || src.includes("{true ? (\n                <p className=\"text-2xl font-bold text-foreground\">{dryerTokens}"));
console.log("2. Payments locked:", src.includes("{true ? (\n                  <p className=\"text-lg font-bold text-foreground\">{fmt(value)}"));
