const fs = require("fs");

// Find customer-facing tracking page
const files = require("fs").readdirSync("app", { recursive: true });
console.log(files.filter(f => f.includes("track") || f.includes("status")));
