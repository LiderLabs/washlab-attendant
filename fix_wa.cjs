const fs = require('fs');
let src = fs.readFileSync('app/washstation/order-complete/page.tsx', 'utf8');

// Replace the broken handleWhatsAppReceipt with the working OrderCard logic
const oldFn =   const handleWhatsAppReceipt = () => {
    const customerPhone = order?.customer?.phoneNumber || order?.customerPhoneNumber || '';
    if (!customerPhone) {
      toast.error('No phone number found for this customer');
      return;
    }

    // Reuse existing link if already generated
    if (waLinkRef.current) {
      window.location.href = waLinkRef.current;
      return;
    }

    let digits = customerPhone.replace(/\\D/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('2330')) digits = '233' + digits.slice(4);
    if (digits.startsWith('0')) digits = '233' + digits.slice(1);
    if (digits.length === 9) digits = '233' + digits;

    if (digits.length < 11 || digits.length > 13) {
      toast.error('Invalid phone number format: ' + digits);
      return;
    }

    const message = encodeURIComponent(;

const newFn =   const handleWhatsAppReceipt = () => {
    const customerPhone = order?.customer?.phoneNumber || order?.customerPhoneNumber || '';
    if (!customerPhone) {
      toast.error('No phone number on file for this customer');
      return;
    }
    const phone = customerPhone.replace(/\\D/g, '');
    const message = encodeURIComponent(;

src = src.replace(oldFn, newFn);

// Fix the closing of the function - remove old waLinkRef logic
src = src.replace(
      waLinkRef.current = \https://wa.me/\?text=\\;
    window.location.href = waLinkRef.current;
  };,
      window.open(\https://wa.me/\?text=\\, '_blank');
    toast.success('WhatsApp receipt sent!');
  };
);

fs.writeFileSync('app/washstation/order-complete/page.tsx', src, 'utf8');
console.log('WhatsApp fix done');
