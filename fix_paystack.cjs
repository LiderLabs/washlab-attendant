const fs = require('fs');
let src = fs.readFileSync('app/washstation/payment/page.tsx', 'utf8');

src = src.replace(
  'if (!paystackLoaded && effectivePaymentMethod !== "cash") {\n      toast.error("Payment processor not ready. Please wait a moment and try again.");\n      return;\n    }',
  'if (!paystackLoaded && effectivePaymentMethod !== "cash") {\n      toast.loading("Loading payment processor...", { id: "ps-load" });\n      let attempts = 0;\n      const wait = setInterval(() => {\n        attempts++;\n        if ((window as any).PaystackPop) {\n          clearInterval(wait);\n          toast.dismiss("ps-load");\n          setStage("verification");\n          setShowVerification(true);\n        } else if (attempts > 10) {\n          clearInterval(wait);\n          toast.dismiss("ps-load");\n          toast.error("Payment processor unavailable. Check internet and try again.");\n        }\n      }, 500);\n      return;\n    }'
);

src = src.replace(
  'if (effectivePaymentMethod !== "cash") {\n        await initiatePayment({ paymentId });\n        pendingVerificationId.current = verificationId;\n        openPaystack(effectivePaymentMethod as "card" | "mobile_money", verificationId);\n        return;\n      }',
  'if (effectivePaymentMethod !== "cash") {\n        pendingVerificationId.current = verificationId;\n        openPaystack(effectivePaymentMethod as "card" | "mobile_money", verificationId);\n        return;\n      }'
);

fs.writeFileSync('app/washstation/payment/page.tsx', src, 'utf8');
console.log('Done - replaced:', src.includes('Loading payment processor') ? 'fix1 OK' : 'fix1 MISSED', src.includes('await initiatePayment') ? 'fix2 MISSED' : 'fix2 OK');
