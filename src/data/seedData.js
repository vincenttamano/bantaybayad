// Seed data for demo transactions and Lean Canvas business model
export const SEED_TRANSACTIONS = [
  {
    id: 'txn-001',
    itemName: 'iPhone 15 Pro Max 256GB',
    itemPhoto: null,
    price: 45000,
    condition: 'Like New',
    role: 'buyer',
    counterparty: 'maria_santos',
    counterpartyPhone: '+639171234567',
    status: 'DELIVERED',
    // Lean Canvas: 0.5% on larger deals (>= ₱15k)
    fee: 225,
    createdAt: '2026-10-25T10:30:00+08:00',
    updatedAt: '2026-10-27T08:00:00+08:00',
    courierStatus: 'Delivered',
    trackingId: 'LLM-2026-78432',
    courier: 'Lalamove',
    paymentMethod: 'GCash',
    countdownEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    buyerApproved: false,
    sellerApproved: false,
    disputeReason: null,
    disputeDescription: null,
    disputeEvidence: null,
    timeline: [
      { status: 'DRAFT', time: '2026-10-25T10:30:00+08:00', label: 'Transaction created' },
      { status: 'REVERIFIED', time: '2026-10-25T10:35:00+08:00', label: 'Identity re-verified via PhilSys' },
      { status: 'FUNDED', time: '2026-10-25T11:00:00+08:00', label: 'Funds vaulted in escrow via GCash' },
      { status: 'SHIPPED', time: '2026-10-26T09:00:00+08:00', label: 'Shipped via Lalamove API' },
      { status: 'DELIVERED', time: '2026-10-27T08:00:00+08:00', label: 'Package delivered by courier' },
    ],
  },
  {
    id: 'txn-002',
    itemName: 'Nintendo Switch OLED',
    itemPhoto: null,
    price: 8500,
    condition: 'Used',
    role: 'seller',
    counterparty: 'juan_delacruz',
    counterpartyPhone: '+639189876543',
    status: 'FUNDED',
    // Lean Canvas: 1.5% fee on standard deals (< ₱15k)
    fee: 127.5,
    createdAt: '2026-10-26T14:00:00+08:00',
    updatedAt: '2026-10-26T15:30:00+08:00',
    courierStatus: null,
    trackingId: null,
    courier: null,
    paymentMethod: 'Maya (QR Ph)',
    countdownEnd: null,
    buyerApproved: false,
    sellerApproved: false,
    disputeReason: null,
    disputeDescription: null,
    disputeEvidence: null,
    timeline: [
      { status: 'DRAFT', time: '2026-10-26T14:00:00+08:00', label: 'Transaction created' },
      { status: 'REVERIFIED', time: '2026-10-26T14:10:00+08:00', label: 'Identity re-verified via PhilSys' },
      { status: 'FUNDED', time: '2026-10-26T15:30:00+08:00', label: 'Funds vaulted in escrow via Maya' },
    ],
  },
  {
    id: 'txn-003',
    itemName: 'Vintage Polaroid Camera',
    itemPhoto: null,
    price: 3200,
    condition: 'For Parts',
    role: 'buyer',
    counterparty: 'pedro_garcia',
    counterpartyPhone: '+639201112233',
    status: 'DISPUTED',
    // Lean Canvas: 1.5% fee
    fee: 48,
    createdAt: '2026-10-20T09:00:00+08:00',
    updatedAt: '2026-10-24T16:00:00+08:00',
    courierStatus: 'Delivered',
    trackingId: 'LLM-2026-55219',
    courier: 'Lalamove',
    paymentMethod: 'Bank Transfer (QR Ph)',
    countdownEnd: null,
    buyerApproved: false,
    sellerApproved: false,
    disputeReason: 'Item not as described',
    disputeDescription: 'Item arrived completely destroyed with missing lens assembly that was clearly intact in the listing photos.',
    disputeEvidence: 'polaroid_damaged_lens.jpg',
    timeline: [
      { status: 'DRAFT', time: '2026-10-20T09:00:00+08:00', label: 'Transaction created' },
      { status: 'REVERIFIED', time: '2026-10-20T09:15:00+08:00', label: 'Identity re-verified via PhilSys' },
      { status: 'FUNDED', time: '2026-10-20T10:00:00+08:00', label: 'Funds vaulted via Bank Transfer' },
      { status: 'SHIPPED', time: '2026-10-21T08:00:00+08:00', label: 'Dispatched via Lalamove' },
      { status: 'DELIVERED', time: '2026-10-23T11:30:00+08:00', label: 'Package delivered by courier' },
      { status: 'DISPUTED', time: '2026-10-24T16:00:00+08:00', label: 'Dispute filed: Item not as described' },
    ],
  },
];

export const VALID_TRANSITIONS = {
  DRAFT: ['REVERIFIED'],
  REVERIFIED: ['FUNDED'],
  FUNDED: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['RELEASED', 'DISPUTED'],
  RELEASED: [],
  DISPUTED: [],
};

export const STATUS_LABELS = {
  DRAFT: 'Draft',
  REVERIFIED: 'Re-verified',
  FUNDED: 'Funded',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  RELEASED: 'Released',
  DISPUTED: 'Disputed',
};

export const STATUS_STEPS = ['DRAFT', 'REVERIFIED', 'FUNDED', 'SHIPPED', 'DELIVERED', 'RELEASED'];

export const COURIER_STATUSES = ['Booked', 'Picked up', 'In transit', 'Delivered'];

export const DISPUTE_REASONS = [
  'Item not as described',
  'Item not received',
  'Wrong item sent',
  'Item damaged during shipping',
  'Counterfeit or fake item',
  'Incomplete item / missing parts',
  'Other',
];

// Lean Canvas Revenue Model:
// "1.5% fee per deal that falls to 0.5% on larger deals (first 3 deals a month free; Premium pays less)
// and a ₱299/month Premium plan with a ₱50k/day limit."
export const PLANS = {
  free: {
    name: 'Freemium',
    price: 0,
    dailyLimit: 10000,
    txFeePercent: 1.5,
    largeTxFeePercent: 0.5,
    largeThreshold: 15000,
    freeTxPerMonth: 3,
    description: 'First 3 deals/month free. 1.5% escrow fee (falls to 0.5% on deals ₱15,000+). ₱10,000/day limit.',
  },
  premium: {
    name: 'Premium',
    price: 299,
    dailyLimit: 50000,
    txFeePercent: 1.0,
    largeTxFeePercent: 0.5,
    largeThreshold: 15000,
    freeTxPerMonth: 10,
    description: '₱299/month with ₱50,000 daily limit. Reduced 1.0% escrow fee (falls to 0.5% on deals ₱15,000+). 10 free deals/month.',
  },
};

export function calculateEscrowFee(price, planKey = 'free', isFreeDeal = false) {
  if (isFreeDeal || price <= 0) return 0;
  const plan = PLANS[planKey] || PLANS.free;
  const rate = price >= (plan.largeThreshold || 15000)
    ? plan.largeTxFeePercent / 100
    : plan.txFeePercent / 100;
  return Math.round(price * rate * 100) / 100;
}

export const DEFAULT_USER = {
  name: 'Demo User',
  username: 'demo_user',
  phone: '+639151234567',
  verified: false,
  deviceId: null,
  govIdUploaded: false,
  livenessPassed: false,
  plan: 'free',
  freeTxUsed: 0,
  dailySpent: 0,
};
