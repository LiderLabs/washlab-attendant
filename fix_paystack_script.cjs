const fs = require("fs");
const path = "app/washstation/payment/page.tsx";
let src = fs.readFileSync(path, "utf8");

src = src.replace(
`    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => console.error("Failed to load Paystack script");
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };`,
`    // Already injected into DOM but not yet executed
    const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existing) {
      existing.addEventListener("load", () => setLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => console.error("Failed to load Paystack script");
    document.body.appendChild(script);

    // No cleanup — keep script loaded for the whole session`
);

fs.writeFileSync(path, src);
console.log("fixed:", !src.includes("document.body.removeChild(script)") ? "YES" : "NO");
