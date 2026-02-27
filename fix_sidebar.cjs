const fs = require("fs");

// Fix mobile sidebar - remove branch name block
let src = fs.readFileSync("components/washstation/MobileSidebar.tsx", "utf8");

const blockStart = src.indexOf('{resolvedBranchName.split');
// Go back to find the opening div/Link
const linkStart = src.lastIndexOf('<Link', blockStart);
const linkEnd = src.indexOf('</Link>', blockStart) + '</Link>'.length;

if (linkStart !== -1 && linkEnd !== -1) {
  src = src.substring(0, linkStart) + src.substring(linkEnd);
  console.log("Mobile branch block removed");
} else {
  console.log("Could not find link block, trying div...");
  const divStart = src.lastIndexOf('<div', blockStart);
  const divEnd = src.indexOf('</div>', blockStart) + '</div>'.length;
  src = src.substring(0, divStart) + src.substring(divEnd);
  console.log("Mobile branch div removed");
}

fs.writeFileSync("components/washstation/MobileSidebar.tsx", src, "utf8");
