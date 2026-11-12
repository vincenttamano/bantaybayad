// Mock Payment service - simulates Xendit / QR Ph payments
// Will be replaced with real Xendit API integration

const delay = (ms) => new Promise(res => setTimeout(res, ms));
const randomDelay = () => delay(800 + Math.random() * 700);

export async function generateQRCode(amount) {
  await randomDelay();
  return {
    success: true,
    data: {
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=BANTAYBAYAD-' + amount,
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
