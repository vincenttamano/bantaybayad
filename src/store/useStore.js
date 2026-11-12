import { create } from 'zustand';
import { SEED_TRANSACTIONS, VALID_TRANSITIONS, DEFAULT_USER, PLANS } from '../data/seedData';
import {
  broadcastLocalUpdate,
  subscribeLocalUpdates,
  pushToCloudStore,
} from '../services/syncService';

// Load from localStorage
function loadState() {
  try {
    const saved = localStorage.getItem('bantaybayad-state');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to load state:', e);
  }
  return null;
}

// Save to localStorage
function saveState(state) {
  try {
    const toSave = {
      user: state.user,
      transactions: state.transactions,
      language: state.language,
      demoRole: state.demoRole,
      toasts: [],
    };
    localStorage.setItem('bantaybayad-state', JSON.stringify(toSave));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

const saved = loadState();

const useStore = create((set, get) => ({
  // Language
  language: saved?.language || 'en',
  setLanguage: (lang) => {
    set({ language: lang });
    saveState(get());
  },

  // Demo role toggle
  demoRole: saved?.demoRole || 'buyer',
  setDemoRole: (role) => {
    set({ demoRole: role });
    saveState(get());
  },

  // User
  user: saved?.user || { ...DEFAULT_USER },
  setUser: (updates) => {
    set((state) => ({ user: { ...state.user, ...updates } }));
    saveState(get());
  },
  verifyUser: (deviceId) => {
    set((state) => ({
      user: { ...state.user, verified: true, deviceId, govIdUploaded: true, livenessPassed: true },
    }));
    saveState(get());
  },

  // Transactions
  transactions: saved?.transactions || [...SEED_TRANSACTIONS],

  addTransaction: (txn) => {
    const newTxn = {
      ...txn,
      id: txn.id || 'txn-' + Date.now().toString(36),
      status: txn.status || 'DRAFT',
      createdAt: txn.createdAt || new Date().toISOString(),
      updatedAt: txn.updatedAt || new Date().toISOString(),
      courierStatus: txn.courierStatus || null,
      trackingId: txn.trackingId || null,
      courier: txn.courier || null,
      paymentMethod: txn.paymentMethod || null,
      countdownEnd: txn.countdownEnd || null,
      buyerApproved: txn.buyerApproved || false,
      sellerApproved: txn.sellerApproved || false,
      disputeReason: txn.disputeReason || null,
      disputeDescription: txn.disputeDescription || null,
      disputeEvidence: txn.disputeEvidence || null,
      cloudId: txn.cloudId || null,
      timeline: txn.timeline || [
        { status: 'DRAFT', time: new Date().toISOString(), label: 'Transaction created' },
      ],
    };

    set((state) => ({ transactions: [newTxn, ...state.transactions.filter(t => t.id !== newTxn.id)] }));
    saveState(get());
    get().addToast('Transaction created!', 'success');

    // Real-time broadcast & cloud push
    broadcastLocalUpdate(newTxn);
    pushToCloudStore(newTxn).then((cloudId) => {
      if (cloudId) {
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === newTxn.id ? { ...t, cloudId } : t)),
        }));
        saveState(get());
      }
    });

    return newTxn.id;
  },

  updateTransaction: (id, updates) => {
    let updatedTxn = null;
    set((state) => {
      const nextList = state.transactions.map((t) => {
        if (t.id === id) {
          updatedTxn = { ...t, ...updates, updatedAt: new Date().toISOString() };
          return updatedTxn;
        }
        return t;
      });
      return { transactions: nextList };
    });

    if (updatedTxn) {
      saveState(get());
      broadcastLocalUpdate(updatedTxn);
      pushToCloudStore(updatedTxn).then((cloudId) => {
        if (cloudId && !updatedTxn.cloudId) {
          set((s) => ({
            transactions: s.transactions.map((t) => (t.id === id ? { ...t, cloudId } : t)),
          }));
          saveState(get());
        }
      });
    }
  },

  transitionTransaction: (id, newStatus, label) => {
    const state = get();
    const txn = state.transactions.find((t) => t.id === id);
    if (!txn) return false;

    const validNext = VALID_TRANSITIONS[txn.status];
    if (!validNext || !validNext.includes(newStatus)) {
      state.addToast(`Invalid transition: ${txn.status} → ${newStatus}`, 'error');
      return false;
    }

    const timelineEntry = {
      status: newStatus,
      time: new Date().toISOString(),
      label: label || `Status changed to ${newStatus}`,
    };

    let updatedTxn = null;
    set((s) => {
      const nextList = s.transactions.map((t) => {
        if (t.id === id) {
          updatedTxn = {
            ...t,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            timeline: [...t.timeline, timelineEntry],
          };
          return updatedTxn;
        }
        return t;
      });
      return { transactions: nextList };
    });

    if (updatedTxn) {
      saveState(get());
      state.addToast(`Transaction ${newStatus.toLowerCase()}!`, 'success');
      broadcastLocalUpdate(updatedTxn);
      pushToCloudStore(updatedTxn).then((cloudId) => {
        if (cloudId && !updatedTxn.cloudId) {
          set((s) => ({
            transactions: s.transactions.map((t) => (t.id === id ? { ...t, cloudId } : t)),
          }));
          saveState(get());
        }
      });
    }
    return true;
  },

  // Merge remote updates from another tab, phone, or cloud
  mergeRemoteTransaction: (remoteTxn) => {
    if (!remoteTxn || !remoteTxn.id) return;
    set((state) => {
      const exists = state.transactions.some((t) => t.id === remoteTxn.id);
      let nextTransactions;
      if (exists) {
        nextTransactions = state.transactions.map((t) => {
          if (t.id === remoteTxn.id) {
            // Keep if remote is newer or has progressed
            return { ...t, ...remoteTxn };
          }
          return t;
        });
      } else {
        nextTransactions = [remoteTxn, ...state.transactions];
      }
      return { transactions: nextTransactions };
    });
    saveState(get());
  },

  // Plan
  upgradePlan: () => {
    set((state) => ({
      user: { ...state.user, plan: 'premium' },
    }));
    saveState(get());
    get().addToast('Upgraded to Premium!', 'success');
  },

  getPlan: () => {
    return PLANS[get().user.plan];
  },

  // Free transaction tracking
  useFreeTx: () => {
    set((state) => ({
      user: { ...state.user, freeTxUsed: state.user.freeTxUsed + 1 },
    }));
    saveState(get());
  },

  // Toast notifications
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3500);
  },

  // Reset
  resetDemo: () => {
    localStorage.removeItem('bantaybayad-state');
    set({
      user: { ...DEFAULT_USER },
      transactions: [...SEED_TRANSACTIONS],
      language: 'en',
      demoRole: 'buyer',
      toasts: [],
    });
    get().addToast('Demo reset!', 'info');
  },
}));

// Setup cross-tab / cross-frame listener
if (typeof window !== 'undefined') {
  subscribeLocalUpdates((remoteTxn) => {
    useStore.getState().mergeRemoteTransaction(remoteTxn);
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'bantaybayad-state' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed?.transactions) {
          useStore.setState({ transactions: parsed.transactions });
        }
      } catch (err) {
        console.warn('Storage sync error:', err);
      }
    }
  });
}

export default useStore;
