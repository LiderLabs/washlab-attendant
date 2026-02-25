const fs = require('fs');
let src = fs.readFileSync('components/washstation/MobileSidebar.tsx', 'utf8');

// Find the lucide-react import and add FileText
src = src.replace(
  /import \{([^}]+)\} from ['"]lucide-react['"]/,
  (match, imports) => {
    if (imports.includes('FileText')) return match;
    return match.replace(imports, imports.trimEnd() + ',\n  FileText');
  }
);

fs.writeFileSync('components/washstation/MobileSidebar.tsx', src, 'utf8');
console.log('FileText import added');
