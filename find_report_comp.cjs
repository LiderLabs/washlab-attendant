const fs = require("fs");
const path = require("fs");

// Check the components pages file
const files = require("fs").readdirSync("components/washstation/pages");
console.log("Pages components:", files.filter(f => f.toLowerCase().includes("report")));
