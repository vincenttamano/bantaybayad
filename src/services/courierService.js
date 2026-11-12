// Mock Courier service - simulates Lalamove delivery
// Will be replaced with real Lalamove API integration

const delay = (ms) => new Promise(res => setTimeout(res, ms));
const randomDelay = () => delay(800 + Math.random() * 700);

export async function bookCourier(pickupAddress, deliveryAddress, itemDescription) {
  await randomDelay();
  return {
    success: true,
    data: {
      trackingId: 'LLM-2026-' + Math.floor(10000 + Math.random() * 90000),
      courier: 'Lalamove',
      estimatedDelivery: '2-4 hours',
      driverName: 'Carlos M.',
      driverPhone: '+6391700000' + Math.floor(10 + Math.random() * 90),
      status: 'Booked',
      bookedAt: new Date().toISOString(),
    },
  };
}

export async function getCourierStatus(trackingId) {
  await randomDelay();
  return {
    success: true,
    data: {
      trackingId,
      status: 'In transit',
      lastUpdate: new Date().toISOString(),
    },
  };
}

export async function advanceCourierStatus(currentStatus) {
  await delay(500);
  const statuses = ['Booked', 'Picked up', 'In transit', 'Delivered'];
  const currentIndex = statuses.indexOf(currentStatus);
  const nextIndex = Math.min(currentIndex + 1, statuses.length - 1);
  return {
    success: true,
    data: {
      previousStatus: currentStatus,
      newStatus: statuses[nextIndex],
      timestamp: new Date().toISOString(),
    },
  };
}
