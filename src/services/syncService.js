// Real-Time Sync Service for Multi-Device Presentations, Dual-Screen Emulation, and Cross-Tab Sync
// Uses ntfy.sh open pub/sub + SSE + Local BroadcastChannel + URL Payload Decoders

const BROADCAST_CHANNEL_NAME = 'bantaybayad_sync_bus';
const NTFY_BASE = 'https://ntfy.sh';

let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported:', e);
  }
}

/**
 * Broadcast transaction update locally (cross-tab & dual-screen simulator)
 */
export function broadcastLocalUpdate(transaction) {
  if (broadcastChannel && transaction) {
    try {
      broadcastChannel.postMessage({
        type: 'TXN_SYNC',
        transaction,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.warn('Failed to broadcast update:', e);
    }
  }
}

/**
 * Listen for local updates from other tabs or frames
 */
export function subscribeLocalUpdates(callback) {
  if (!broadcastChannel) return () => {};
  const handler = (event) => {
    if (event.data?.type === 'TXN_SYNC' && event.data.transaction) {
      callback(event.data.transaction);
    }
  };
  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel.removeEventListener('message', handler);
  };
}

/**
 * Publish transaction state to live cloud bus for cross-device presentation
 */
export async function pushToCloudStore(transaction) {
  if (!transaction || !transaction.id) return null;

  const topic = `bb_sync_${transaction.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  try {
    // 1. Publish to ntfy open pub/sub channel
    const res = await fetch(`${NTFY_BASE}/${topic}`, {
      method: 'POST',
      headers: {
        'Title': 'BantayBayad Deal Update',
        'Priority': 'default',
        'Tags': 'shield,moneybag'
      },
      body: JSON.stringify(transaction),
    });

    if (res.ok) {
      return topic;
    }
  } catch (e) {
    console.warn('Cloud bus broadcast warning (local fallback active):', e);
  }

  return topic;
}

/**
 * Fetch latest remote transaction from cloud bus (polling fallback)
 */
export async function fetchFromCloudStore(txnId) {
  if (!txnId) return null;
  const topic = `bb_sync_${txnId.replace(/[^a-zA-Z0-9]/g, '')}`;

  try {
    const res = await fetch(`${NTFY_BASE}/${topic}/json?poll=1&since=1h`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const text = await res.text();
      const lines = text.trim().split('\n').filter(Boolean);
      // Grab latest message event
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const item = JSON.parse(lines[i]);
          if (item.event === 'message' && item.message) {
            const parsedTxn = JSON.parse(item.message);
            if (parsedTxn && parsedTxn.id) {
              return parsedTxn;
            }
          }
        } catch (err) {}
      }
    }
  } catch (e) {
    // quiet
  }
  return null;
}

/**
 * Subscribe to real-time Server-Sent Events (SSE) across physical devices
 */
export function subscribeRemoteRealtime(txnId, onRemoteUpdate) {
  if (!txnId || typeof window === 'undefined') return () => {};
  const topic = `bb_sync_${txnId.replace(/[^a-zA-Z0-9]/g, '')}`;
  let eventSource = null;

  try {
    eventSource = new EventSource(`${NTFY_BASE}/${topic}/sse`);
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === 'message' && payload.message) {
          const updatedTxn = JSON.parse(payload.message);
          if (updatedTxn && updatedTxn.id) {
            onRemoteUpdate(updatedTxn);
          }
        }
      } catch (err) {}
    };
    eventSource.onerror = () => {
      // Quiet error fallback to polling
    };
  } catch (err) {
    console.warn('SSE subscription notice:', err);
  }

  return () => {
    if (eventSource) {
      eventSource.close();
    }
  };
}

/**
 * Encode transaction into a safe base64 URL string
 */
export function encodeTransactionPayload(txn) {
  try {
    const payload = {
      id: txn.id,
      itemName: txn.itemName,
      price: txn.price,
      condition: txn.condition,
      role: txn.role,
      counterparty: txn.counterparty,
      counterpartyPhone: txn.counterpartyPhone || '',
      status: txn.status,
      fee: txn.fee,
      courierStatus: txn.courierStatus,
      trackingId: txn.trackingId,
      courier: txn.courier,
      paymentMethod: txn.paymentMethod,
      countdownEnd: txn.countdownEnd,
      buyerApproved: txn.buyerApproved,
      sellerApproved: txn.sellerApproved,
      disputeReason: txn.disputeReason,
      disputeDescription: txn.disputeDescription,
      timeline: txn.timeline,
      createdAt: txn.createdAt,
      updatedAt: txn.updatedAt,
    };
    const jsonStr = JSON.stringify(payload);
    return btoa(encodeURIComponent(jsonStr));
  } catch (e) {
    console.warn('Encoding failed:', e);
    return '';
  }
}

/**
 * Decode transaction payload from URL string
 */
export function decodeTransactionPayload(encodedStr) {
  if (!encodedStr) return null;
  try {
    const jsonStr = decodeURIComponent(atob(encodedStr));
    return JSON.parse(jsonStr);
  } catch (e) {
    console.warn('Decoding failed:', e);
    return null;
  }
}

/**
 * Build shareable link for buyer or seller, fully compatible with GitHub Pages HashRouter
 */
export function generateShareableLink(txnId, role = 'buyer', txn = null) {
  let basePath = 'http://localhost:5173';
  if (typeof window !== 'undefined') {
    // Strip hash or trailing slashes to preserve exact GitHub Pages root path
    basePath = window.location.href.split('#')[0].replace(/\/+$/, '');
  }

  let url = `${basePath}/#/transaction/${txnId}?role=${role}`;
  if (txn) {
    const encoded = encodeTransactionPayload(txn);
    if (encoded) {
      url += `&data=${encodeURIComponent(encoded)}`;
    }
  }
  return url;
}
