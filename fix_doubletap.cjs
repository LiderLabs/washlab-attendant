const fs = require('fs');
let src = fs.readFileSync('app/washstation/confirm-clock-in/page.tsx', 'utf8');

// Fix 1: Remove duplicate const existingStaff line
src = src.replace(
  `    const existingStaff = sessionStorage.getItem('washlab_active_staff');
    const existingStaff = sessionStorage.getItem('washlab_active_staff');`,
  `    const existingStaff = sessionStorage.getItem('washlab_active_staff');`
);

// Fix 2: Add isConfirming state to prevent double-tap
src = src.replace(
  `  const [currentTime, setCurrentTime] = useState(new Date());`,
  `  const [currentTime, setCurrentTime] = useState(new Date());
  const [isConfirming, setIsConfirming] = useState(false);`
);

// Fix 3: Guard handleConfirm against double-tap
src = src.replace(
  `  const handleConfirm = () => {
    if (!staffData || typeof window === 'undefined') return;`,
  `  const handleConfirm = () => {
    if (!staffData || typeof window === 'undefined' || isConfirming) return;
    setIsConfirming(true);`
);

// Fix 4: Add loading indicator to the Confirm button
src = src.replace(
  `onClick={handleConfirm}`,
  `onClick={handleConfirm} disabled={isConfirming}`
);

fs.writeFileSync('app/washstation/confirm-clock-in/page.tsx', src, 'utf8');
console.log('Double-tap fix done');
