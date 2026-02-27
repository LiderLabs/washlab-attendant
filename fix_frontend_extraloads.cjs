const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

src = src.replace(
  `          notes: [customNote, ...orderNotes, extraWashLoads > 0 ? extraWashLoads + ' extra wash load(s)' : '',
extraDryLoads > 0 ? extraDryLoads + ' extra dry load(s)' : ''].filter(Boolean).join(', ') || undefined,
          isDelivery: false,`,
  `          notes: [customNote, ...orderNotes, extraWashLoads > 0 ? extraWashLoads + ' extra wash load(s)' : '',
extraDryLoads > 0 ? extraDryLoads + ' extra dry load(s)' : ''].filter(Boolean).join(', ') || undefined,
          isDelivery: false,
          extraWashLoads: extraWashLoads || undefined,
          extraDryLoads: extraDryLoads || undefined,`
);

fs.writeFileSync("components/washstation/pages/NewOrderContent.tsx", src, "utf8");
console.log("Frontend done");
