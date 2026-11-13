// Mock Payment service - simulates Xendit / QR Ph payments
import QRCode from 'qrcode';

const delay = (ms) => new Promise(res => setTimeout(res, ms));
const randomDelay = () => delay(400 + Math.random() * 300);

export async function generateQRCode(amount) {
  await randomDelay();
  let qrCodeUrl = '';
  try {
    qrCodeUrl = await QRCode.toDataURL(`BANTAYBAYAD-QRPH-VAULT-PHP-${amount}`, {
      width: 250,
      margin: 1,
      color: { dark: '#002d72', light: '#ffffff' }
    });
  } catch (e) {
    qrCodeUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" text-anchor="middle" fill="%23002d72" font-size="12">QR Ph Vault</text></svg>';
  }

  return {
    success: true,
    data: {
      qrCodeUrl,
      referenceId: 'QR-' + Date.now().toString(36).toUpperCase(),
      amount,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
  };
}

export async function processPayment(method, amount) {
  await delay(1500);
  return {
    success: true,
    data: {
      transactionId: 'PAY-' + Math.random().toString(36).substring(2, 12).toUpperCase(),
      method,
      amount,
      status: 'completed',
      timestamp: new Date().toISOString(),
      fee: amount * 0.025,
    },
  };
}

export async function releaseFunds(transactionId, sellerAccount) {
  await delay(1200);
  return {
    success: true,
    data: {
      disbursementId: 'DIS-' + Math.random().toString(36).substring(2, 12).toUpperCase(),
      transactionId,
      amount: sellerAccount,
      status: 'disbursed',
      timestamp: new Date().toISOString(),
    },
  };
}
