const fs = require("fs");
const {execSync} = require("child_process");
const result = execSync('findstr /s /r "activeBag\\|getActiveBag\\|bagCard" components\\washstation\\*.tsx app\\washstation\\*.tsx 2>nul').toString();
console.log(result.substring(0, 1500));
