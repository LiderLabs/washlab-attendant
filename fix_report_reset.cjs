const fs = require("fs");
let src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");

// Fix: After successful submit, reset all state so next day is fresh
src = src.replace(
  `toast.success('Daily report submitted successfully!');`,
  `toast.success('Daily report submitted successfully!');
      // Reset for next day
      setTimeout(() => {
        setWasherTokens(0); setDryerTokens(0);
        setCashAmount(0); setMobileMoneyAmount(0); setCardAmount(0); setPaystackAmount(0);
        setSoapUnits(0); setFreeWashCount(0); setWashingPlanCount(0);
        setTechnicalFaults(0); setFaultNotes(''); setNotes('');
        setServiceBreakdown([]); setAttendants(['']); setLoaded(false);
      }, 2000);`
);

fs.writeFileSync("app/washstation/report/page.tsx", src, "utf8");
console.log("Reset after submit:", src.includes("Reset for next day"));
