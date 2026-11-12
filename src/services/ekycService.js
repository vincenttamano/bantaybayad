// Mock eKYC service - simulates Philippine government eKYC & AFASA biometric verification
// Snappy response times optimized for live presentations

const delay = (ms) => new Promise(res => setTimeout(res, ms));

export async function verifyGovernmentId(imageFile) {
  await delay(450);
  return {
    success: true,
    data: {
      fullName: 'Juan Dela Cruz',
      idType: 'Philippine National ID (PhilSys)',
      idNumber: '****-****-' + Math.floor(1000 + Math.random() * 9000),
      birthDate: '1995-03-15',
      address: 'Mandurriao, Iloilo City, Western Visayas',
      expiryDate: '2032-12-31',
      confidence: 0.98,
    },
  };
}

export async function performLivenessScan() {
  await delay(600); // Snappy, responsive biometric liveness scan
  return {
    success: true,
    data: {
      livenessScore: 0.99,
      matchScore: 0.98,
      deviceId: 'DEV-ILO-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      timestamp: new Date().toISOString(),
    },
  };
}

export async function reVerifyIdentity() {
  await delay(500); // 0.5s biometric re-verification
  return {
    success: true,
    data: {
      matchScore: 0.99,
      verified: true,
      timestamp: new Date().toISOString(),
    },
  };
}
