// Real-Time Sync Service for Multi-Device Presentations
// Uses ntfy.sh (Open Public SSE pub/sub — Zero signup / Zero API keys needed)
// + URL Data Payload (Instant Zero-DB bootstrap) + BroadcastChannel (cross-tab)

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
 * Save transaction to localStorage bin index (maps txnId → ntfy topic)
 */
function saveBinMapping(txnId, topic) {
  try {
    const bins = JSON.parse(localStorage.getItem('bb_bins') || '{}');
    bins[txnId] = topic;
    localStorage.setItem('bb_bins', JSON.stringify(bins));
  } catch (e) {}
}

/**
 * Publish transaction state to ntfy.sh cloud bus for cross-device real-time sync.
 * Also saves a compact snapshot to localStorage so QR scan on fresh device can bootstrap.
 */
export async function pushToCloudStore(transaction) {
  if (!transaction || !transaction.id) return null;

  const topic = `bb_sync_${transaction.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  // Always persist full snapshot to localStorage (available to same device / tabs)
  try {
    const snapshots = JSON.parse(localStorage.getItem('bb_snapshots') || '{}');
    snapshots[transaction.id] = {
      ...transaction,
      _syncedAt: Date.now(),
    };
    localStorage.setItem('bb_snapshots', JSON.stringify(snapshots));
  } catch (e) {}

  saveBinMapping(transaction.id, topic);

  // Push to ntfy.sh
  try {
    await fetch(`${NTFY_BASE}/${topic}`, {
      method: 'POST',
      headers: {
        'Title': 'BantayBayad Deal Update',
        'Priority': 'default',
        'Tags': 'shield,moneybag',
      },
      body: JSON.stringify(transaction),
    });
  } catch (e) {
    console.warn('ntfy push warning:', e);
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
    const res = await fetch(`${NTFY_BASE}/${topic}/json?poll=1&since=24h`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const text = await res.text();
      const lines = text.trim().split('\n').filter(Boolean);
      // Grab latest message
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
 * Subscribe to real-time SSE across physical devices
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
    eventSource.onerror = () => {};
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
 * Encode transaction into a compact base64 URL-safe string
 * Only includes essential fields — keeps QR code scannable
 */
export function encodeTransactionPayload(txn) {
  try {
    // Only pack the essential fields — no large timeline arrays
    const payload = {
      id: txn.id,
      itemName: txn.itemName,
      price: txn.price,
      condition: txn.condition || 'Used',
      role: txn.role,
      counterparty: txn.counterparty,
      status: txn.status,
      fee: txn.fee || 0,
      courierStatus: txn.courierStatus || null,
      trackingId: txn.trackingId || null,
      paymentMethod: txn.paymentMethod || null,
      countdownEnd: txn.countdownEnd || null,
      buyerApproved: txn.buyerApproved || false,
      sellerApproved: txn.sellerApproved || false,
      disputeReason: txn.disputeReason || null,
      createdAt: txn.createdAt || new Date().toISOString(),
      updatedAt: txn.updatedAt || new Date().toISOString(),
      // Always ensure timeline has at least the creation entry
      timeline: txn.timeline?.slice(0, 3) || [
        { status: txn.status, time: txn.createdAt || new Date().toISOString(), label: 'Transaction synced from device' }
      ],
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
 * Build a shareable link for buyer or seller.
 * - 'full': includes compact encoded payload in URL (for copy-paste & QR with <300 chars)
 * - 'short': no payload (for displays/printouts where you just need the URL)
 */
export function generateShareableLink(txnId, role = 'buyer', txn = null, format = 'full') {
  let origin = 'https://vincenttamano.github.io/bantaybayad';
  if (typeof window !== 'undefined') {
    const { protocol, host } = window.location;
    // Determine base path: strip hash and trailing slashes
    const rawPath = window.location.pathname.replace(/\/+$/, '');
    // On GitHub Pages: rawPath = '/bantaybayad'
    // On localhost: rawPath = '' or '/'
    const basePath = rawPath.endsWith('index.html')
      ? rawPath.substring(0, rawPath.lastIndexOf('/'))
      : rawPath;
    origin = `${protocol}//${host}${basePath}`;
  }

  if (format === 'short') {
    return `${origin}/#/transaction/${txnId}?role=${role}`;
  }

  // Full format: include compact payload so the second device can bootstrap without cloud
  let url = `${origin}/#/transaction/${txnId}?role=${role}`;
  if (txn) {
    const encoded = encodeTransactionPayload(txn);
    if (encoded && encoded.length < 1500) {
      // Only include data= if it won't blow up the QR code
      url += `&data=${encodeURIComponent(encoded)}`;
    }
  }
  return url;
}
