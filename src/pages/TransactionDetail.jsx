import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, XCircle, Truck, Package, Timer,
  FileText, Shield, Lock, AlertTriangle, Clock, FastForward,
  Send, Camera, Upload, ChevronDown, Eye, Share2, RefreshCw,
  Sparkles, Check, Info, ArrowRight, UserCheck
} from 'lucide-react';
import { Button, Card, StatusChip, LoadingSpinner } from '../components/UI';
import ProgressStepper from '../components/ProgressStepper';
import ShareDealModal from '../components/ShareDealModal';
import PaymentModal from '../components/PaymentModal';
import useStore from '../store/useStore';
import { useActiveRole } from '../context/RoleContext';
import { COURIER_STATUSES, DISPUTE_REASONS } from '../data/seedData';
import translations from '../data/translations';
import { bookCourier } from '../services/courierService';
import {
  decodeTransactionPayload,
  fetchFromCloudStore,
  subscribeRemoteRealtime,
  subscribeLocalUpdates
} from '../services/syncService';

export default function TransactionDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const contextRole = useActiveRole();
  const urlRole = searchParams.get('role');
  const urlData = searchParams.get('data');

  const {
    transactions,
    transitionTransaction,
    updateTransaction,
    mergeRemoteTransaction,
    addToast,
    demoRole,
    language,
  } = useStore();

  const t = translations[language] || translations.en;
  const isFil = language === 'fil';

  const [localRoleOverride, setLocalRoleOverride] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);
  const [disputeForm, setDisputeForm] = useState({ reason: '', description: '', evidence: null });
  const [countdown, setCountdown] = useState(null);
  const [bookingCourier, setBookingCourier] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCloudFetching, setIsCloudFetching] = useState(false);

  // Synchronous extraction on first render from URL data payload!
  const decodedFromUrl = React.useMemo(() => {
    if (!urlData) return null;
    return decodeTransactionPayload(urlData);
  }, [urlData]);

  // Synchronously ensure store has this deal
  useEffect(() => {
    if (decodedFromUrl && decodedFromUrl.id === id) {
      mergeRemoteTransaction(decodedFromUrl);
    }
  }, [decodedFromUrl, id, mergeRemoteTransaction]);

  // Fallback cloud fetch if transaction is not in local storage and not in URL
  useEffect(() => {
    if (!decodedFromUrl && !transactions.some((t) => t.id === id)) {
      setIsCloudFetching(true);
      fetchFromCloudStore(id)
        .then((remote) => {
          setIsCloudFetching(false);
          if (remote && remote.id === id) {
            mergeRemoteTransaction(remote);
          }
        })
        .catch(() => setIsCloudFetching(false));
    }
  }, [id, decodedFromUrl, transactions, mergeRemoteTransaction]);

  // Resolve txn immediately: either from local list or from synchronously decoded URL payload
  const txn = transactions.find((t) => t.id === id) || (decodedFromUrl?.id === id ? decodedFromUrl : null);

  // Real-time Cloud + SSE + Local Cross-Device Synchronization
  useEffect(() => {
    if (!id) return;

    // 1. Subscribe to local broadcast channel (for dual screen / cross tab)
    const unsubLocal = subscribeLocalUpdates((remote) => {
      if (remote && remote.id === id) {
        setIsSyncing(true);
        mergeRemoteTransaction(remote);
        setTimeout(() => setIsSyncing(false), 800);
      }
    });

    // 2. Subscribe to real-time Server-Sent Events (SSE) across physical devices
    const unsubSSE = subscribeRemoteRealtime(id, (remote) => {
      if (remote && remote.id === id) {
        setIsSyncing(true);
        mergeRemoteTransaction(remote);
        setTimeout(() => setIsSyncing(false), 800);
      }
    });

    // 3. Fallback polling every 2.5s for devices with constrained mobile data
    const pollInterval = setInterval(async () => {
      try {
        const remote = await fetchFromCloudStore(id);
        if (remote && remote.updatedAt && remote.updatedAt !== txn?.updatedAt) {
          setIsSyncing(true);
          mergeRemoteTransaction(remote);
          setTimeout(() => setIsSyncing(false), 800);
        }
      } catch (e) {}
    }, 2500);

    return () => {
      unsubLocal();
      unsubSSE();
      clearInterval(pollInterval);
    };
  }, [id, txn?.updatedAt, mergeRemoteTransaction]);

  // Manual force sync action for live presentations
  const handleManualSync = async () => {
    setIsSyncing(true);
    addToast('Checking live cloud bus...', 'info');
    try {
      const remote = await fetchFromCloudStore(id);
      if (remote) {
        mergeRemoteTransaction(remote);
        addToast('Synced with cloud!', 'success');
      } else {
        addToast('Already up to date', 'info');
      }
    } catch {
      addToast('Sync check complete', 'info');
    }
    setTimeout(() => setIsSyncing(false), 800);
  };

  // Countdown timer for Delivered state
  useEffect(() => {
    if (!txn?.countdownEnd || txn.status !== 'DELIVERED') return;
    const interval = setInterval(() => {
      const diff = new Date(txn.countdownEnd) - Date.now();
      if (diff <= 0) {
        setCountdown('00:00:00');
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setCountdown(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [txn?.countdownEnd, txn?.status]);

  if (!txn) {
    if (isCloudFetching) {
      return (
        <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh] space-y-3">
          <LoadingSpinner size="md" />
          <p className="text-xs font-bold text-text">Connecting to Live Deal Telemetry...</p>
          <p className="text-[10px] text-text-muted">Fetching deal state from cloud</p>
        </div>
      );
    }
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-text-secondary">Transaction not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // Determine active view role
  const effectiveRole = localRoleOverride || urlRole || contextRole || demoRole || txn.role || 'buyer';
  const isBuyer = effectiveRole === 'buyer';
  const isSeller = effectiveRole === 'seller';

  const formatCurrency = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });
  const totalAmount = txn.price + (txn.fee || 0);

  // Seller books courier
  const handleBookCourier = async () => {
    setBookingCourier(true);
    try {
      const result = await bookCourier('Iloilo Business Park Hub, Mandurriao', 'Jaro, Iloilo City Customer', txn.itemName);
      updateTransaction(id, {
        courier: result.data.courier,
        trackingId: result.data.trackingId,
        courierStatus: result.data.status,
      });
      transitionTransaction(id, 'SHIPPED', `Booked courier (${result.data.courier})`);
    } catch {
      addToast('Failed to book courier', 'error');
    }
    setBookingCourier(false);
  };

  // Courier advance simulation
  const handleAdvanceCourier = () => {
    const idx = COURIER_STATUSES.indexOf(txn.courierStatus || 'Booked');
    if (idx < COURIER_STATUSES.length - 1) {
      const next = COURIER_STATUSES[idx + 1];
      updateTransaction(id, { courierStatus: next });
      if (next === 'Delivered') {
        transitionTransaction(id, 'DELIVERED', 'Package delivered by courier');
        updateTransaction(id, {
          countdownEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }
  };

  // Confirm Release Execution
  const handleExecuteRelease = () => {
    setShowReleaseConfirm(false);
    updateTransaction(id, { buyerApproved: true });
    transitionTransaction(id, 'RELEASED', 'Buyer confirmed item satisfaction — funds released');
    addToast('Funds released to seller! Deal completed.', 'success');
  };

  // Dispute filing
  const handleFileDispute = () => {
    if (!disputeForm.reason) {
      addToast('Please select a dispute reason', 'warning');
      return;
    }
    transitionTransaction(id, 'DISPUTED', `Dispute: ${disputeForm.reason}`);
    updateTransaction(id, {
      disputeReason: disputeForm.reason,
      disputeDescription: disputeForm.description,
      disputeEvidence: disputeForm.evidence?.name || null,
    });
    setShowDispute(false);
  };

  // Fast forward countdown
  const handleFastForward = () => {
    updateTransaction(id, { countdownEnd: new Date(Date.now() + 3000).toISOString() });
    addToast('Countdown fast-forwarded!', 'info');
  };

  return (
    <div className="p-3.5 sm:p-4 space-y-3.5 pb-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-8 h-8 rounded-xl bg-surface-alt flex items-center justify-center hover:bg-border transition-all shrink-0 active:scale-95"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-extrabold text-text truncate">
              {txn.itemName}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StatusChip status={txn.status} />
              <button
                onClick={handleManualSync}
                className="text-[10px] text-emerald-600 font-bold hover:bg-emerald-50 px-1.5 py-0.2 rounded transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                title="Tap to force sync with cloud"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Live Sync'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Share counterparty links button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-primary text-white text-[11px] font-bold shadow-sm hover:bg-primary-dark transition-all active:scale-95 shrink-0"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      {/* Perspective / Role Bar */}
      <div className="flex items-center justify-between bg-surface-alt border border-border px-3 py-1.5 rounded-xl text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isBuyer ? 'bg-primary' : 'bg-emerald-500'}`} />
          <span className="font-semibold text-text truncate">
            {isFil ? 'Pananaw:' : 'Viewing:'} <strong className={isBuyer ? 'text-primary' : 'text-emerald-600'}>
              {isBuyer ? 'Buyer 🛒' : 'Seller 🏪'}
            </strong>
          </span>
        </div>
        <button
          onClick={() => setLocalRoleOverride(isBuyer ? 'seller' : 'buyer')}
          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-primary transition-all shrink-0 active:scale-95"
        >
          {isFil ? `Lumipat kay ${isBuyer ? 'Seller' : 'Buyer'}` : `Switch to ${isBuyer ? 'Seller' : 'Buyer'}`}
        </button>
      </div>

      {/* Progress Stepper */}
      <Card className="!p-3">
        <ProgressStepper currentStatus={txn.status} />
      </Card>

      {/* HERO ACTION CARD: State-Driven Clarity */}
      {/* 1. DRAFT STATE */}
      {txn.status === 'DRAFT' && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/[0.04] to-transparent !p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              Step 1 of 5 · Action Required
            </span>
          </div>
          <h2 className="text-sm font-extrabold text-text mb-1 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-primary" /> Biometric Re-Verification
          </h2>
          <p className="text-xs text-text-secondary mb-3 leading-relaxed">
            Under AFASA RA 12010, you must confirm your identity via a 2-second facial scan to lock your device credentials before funds can be deposited.
          </p>
          <div className="space-y-2">
            <Button
              variant="primary"
              size="md"
              className="w-full text-xs font-bold"
              onClick={() => navigate(`/reverify/${id}`)}
            >
              <UserCheck className="w-4 h-4" />
              Scan Face & Re-Verify Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-[11px]"
              onClick={() => setShowShareModal(true)}
            >
              <Share2 className="w-3.5 h-3.5" />
              Send Deal Link to @{txn.counterparty}
            </Button>
          </div>
        </Card>
      )}

      {/* 2. REVERIFIED STATE */}
      {txn.status === 'REVERIFIED' && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/[0.04] to-transparent !p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              Step 2 of 5 · Escrow Funding
            </span>
          </div>
          {isBuyer ? (
            <div>
              <h2 className="text-sm font-extrabold text-text mb-1 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-primary" /> Deposit Funds to Escrow Vault
              </h2>
              <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                Biometric identity is locked. Please deposit <strong className="text-primary">{formatCurrency(totalAmount)}</strong> into the protected escrow vault. Seller cannot touch these funds until you inspect and approve delivery.
              </p>
              <Button
                variant="primary"
                size="md"
                className="w-full text-xs font-bold"
                onClick={() => setShowPaymentModal(true)}
              >
                <Lock className="w-4 h-4" />
                Proceed to Deposit {formatCurrency(totalAmount)}
              </Button>
            </div>
          ) : (
            <div>
              <h2 className="text-sm font-extrabold text-text mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-accent-yellow" /> Awaiting Buyer's Deposit
              </h2>
              <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                Buyer (@{txn.counterparty}) has been verified and notified to deposit <strong className="text-text">{formatCurrency(totalAmount)}</strong> into escrow. You will be alerted the instant funds are locked.
              </p>
              <div className="bg-surface-alt rounded-xl p-2.5 text-[11px] text-text-muted flex items-center gap-2 border border-border">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span>Do not ship until the deal status displays "FUNDED".</span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 3. FUNDED STATE */}
      {txn.status === 'FUNDED' && (
        <Card className="border-emerald-300 bg-emerald-50/40 !p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Step 3 of 5 · Escrow Locked
            </span>
          </div>
          {isSeller ? (
            <div>
              <h2 className="text-sm font-extrabold text-emerald-950 mb-1 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-accent-green" /> Funds Vaulted! Dispatch Item Now
              </h2>
              <p className="text-xs text-emerald-900 mb-3 leading-relaxed">
                <strong className="text-emerald-950 font-bold">{formatCurrency(totalAmount)}</strong> is safely locked in the escrow vault. You can now dispatch the item with 100% payment guarantee.
              </p>
              <Button
                variant="primary"
                size="md"
                className="w-full text-xs font-bold"
                onClick={handleBookCourier}
                disabled={bookingCourier}
              >
                {bookingCourier ? <LoadingSpinner size="sm" /> : <Truck className="w-4 h-4" />}
                Book Courier (Lalamove Partner API)
              </Button>
            </div>
          ) : (
            <div>
              <h2 className="text-sm font-extrabold text-emerald-950 mb-1 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-accent-green" /> Payment Vaulted in Escrow
              </h2>
              <p className="text-xs text-emerald-900 mb-2 leading-relaxed">
                Your payment of <strong className="font-bold">{formatCurrency(totalAmount)}</strong> is secured in the vault. The seller has been authorized to dispatch your package via Lalamove.
              </p>
              <div className="bg-white/80 rounded-xl p-2.5 text-[11px] text-emerald-800 border border-emerald-200">
                ⏳ Awaiting seller to book and dispatch courier.
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 4. SHIPPED STATE & COURIER TRACKING */}
      {txn.status === 'SHIPPED' && (
        <Card className="border-primary/20 !p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-primary">
              Step 4 of 5 · Dispatched via {txn.courier || 'Lalamove'}
            </span>
            <span className="text-[10px] font-mono font-bold text-primary">
              {txn.trackingId}
            </span>
          </div>

          <h2 className="text-sm font-extrabold text-text mb-2 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-primary" /> Live Courier Logistics
          </h2>

          <div className="flex justify-between text-xs bg-surface-alt rounded-xl p-2.5 mb-3 border border-border">
            <div>
              <span className="text-text-muted text-[10px] uppercase font-bold block">Tracking #</span>
              <span className="font-mono font-bold text-primary">{txn.trackingId}</span>
            </div>
            <div className="text-right">
              <span className="text-text-muted text-[10px] uppercase font-bold block">Current Stage</span>
              <span className="font-bold text-accent-green">{txn.courierStatus}</span>
            </div>
          </div>

          {/* Courier Status Timeline */}
          <div className="flex justify-between items-center px-1 mb-3">
            {COURIER_STATUSES.map((status, idx) => {
              const currentIdx = COURIER_STATUSES.indexOf(txn.courierStatus || 'Booked');
              const isDone = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div key={status} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDone
                        ? 'bg-accent-green text-white shadow-sm'
                        : 'bg-surface-alt text-text-muted border border-border'
                    } ${isCurrent ? 'ring-2 ring-accent-green/40' : ''}`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`text-[9px] mt-1 text-center font-medium ${isDone ? 'text-text' : 'text-text-muted'}`}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Advance status simulation button */}
          {txn.courierStatus !== 'Delivered' && (
            <button
              onClick={handleAdvanceCourier}
              className="w-full text-center py-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all border border-primary/20 active:scale-98"
            >
              ⚡ Simulate Courier Progress
            </button>
          )}
        </Card>
      )}

      {/* 5. DELIVERED STATE & 24H INSPECTION */}
      {txn.status === 'DELIVERED' && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/[0.03] to-transparent !p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              Step 5 of 5 · Inspection Window
            </span>
            <button
              onClick={handleFastForward}
              className="text-[10px] font-bold text-accent-yellow bg-accent-yellow/10 hover:bg-accent-yellow/20 px-2 py-0.5 rounded-lg flex items-center gap-0.5"
            >
              <FastForward className="w-3 h-3" /> Fast-Forward
            </button>
          </div>

          <div className="bg-surface rounded-2xl p-3 text-center border border-border mb-3 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-text-muted block">Time Remaining to Inspect</span>
            <span className="text-2xl font-black font-mono text-primary tracking-wider countdown-pulse">
              {countdown || '23:59:45'}
            </span>
            <p className="text-[10px] text-text-muted mt-1">
              Funds auto-release to seller once approved or when inspection timer expires.
            </p>
          </div>

          {isBuyer ? (
            <div className="space-y-2">
              <Button
                variant="success"
                size="md"
                className="w-full shadow-md shadow-accent-green/20 text-xs font-bold"
                onClick={() => setShowReleaseConfirm(true)}
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Item & Release {formatCurrency(txn.price)}
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="w-full text-xs font-bold"
                onClick={() => setShowDispute(true)}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Report Problem / Lodge Dispute
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="bg-surface-alt p-3 rounded-xl text-center text-xs text-text-secondary border border-border">
                <span className="font-bold text-text block mb-0.5">Buyer is Inspecting Item</span>
                Package has been marked delivered. Once buyer confirms satisfaction (or timer reaches zero), {formatCurrency(txn.price)} dispatches to your account.
              </div>
              <Button
                variant="danger"
                size="sm"
                className="w-full text-xs font-bold"
                onClick={() => setShowDispute(true)}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Seller Item Issue / Dispute
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* 6. RELEASED STATE */}
      {txn.status === 'RELEASED' && (
        <Card className="bg-emerald-50/80 border-emerald-300 !p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-green text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-emerald-950">Escrow Completed & Released</h2>
              <p className="text-xs text-emerald-800">
                {formatCurrency(txn.price)} has been disbursed to the seller. Both parties are fully protected under BantayBayad.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 7. DISPUTED STATE */}
      {txn.status === 'DISPUTED' && (
        <Card className="bg-red-50/80 border-red-300 !p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-red text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-red-950">Dispute Lodged — Escrow Frozen</h2>
              <p className="text-xs text-red-800">
                Reason: <strong>{txn.disputeReason}</strong>. All funds are frozen and evidence has been gathered for AFASA RA 12010 resolution.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Transaction Details Summary */}
      <Card className="!p-3.5">
        <h2 className="text-xs font-bold text-text-secondary mb-2 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-primary" /> Deal Summary
        </h2>
        <div className="text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-text-muted">Item</span>
            <span className="font-semibold text-text truncate max-w-[180px]">{txn.itemName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Condition</span>
            <span className="font-semibold">{txn.condition}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Item Price</span>
            <span className="font-bold text-primary">{formatCurrency(txn.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Escrow Protection Fee</span>
            <span className="font-semibold">{formatCurrency(txn.fee)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5 font-bold">
            <span>Total Escrow Amount</span>
            <span className="font-extrabold text-primary">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Payment Rail</span>
            <span className="font-semibold">{txn.paymentMethod || 'GCash / Maya (QR Ph)'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Counterparty</span>
            <span className="font-semibold text-primary">@{txn.counterparty}</span>
          </div>
        </div>
      </Card>

      {/* Immutable Audit Timeline */}
      <Card className="!p-3.5">
        <h2 className="text-xs font-bold text-text-secondary mb-3 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" /> Immutable Audit Timeline
        </h2>
        <div className="space-y-0">
          {txn.timeline?.map((entry, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <div className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    entry.status === 'DISPUTED'
                      ? 'bg-accent-red'
                      : entry.status === 'RELEASED'
                      ? 'bg-accent-green'
                      : 'bg-primary'
                  } text-white`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                {idx < txn.timeline.length - 1 && <div className="w-0.5 h-6 bg-border" />}
              </div>
              <div className="pb-2 text-xs">
                <p className="font-semibold text-text leading-tight">{entry.label}</p>
                <p className="text-[10px] text-text-muted">{new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom Certified Dossier Action */}
      {(txn.status === 'RELEASED' || txn.status === 'DISPUTED') && (
        <Button
          variant="outline"
          size="md"
          className="w-full text-xs font-bold"
          onClick={() => navigate(`/evidence/${id}`)}
        >
          <FileText className="w-4 h-4" />
          View Certified AFASA RA 12010 Dossier
        </Button>
      )}

      {/* Release Confirmation Modal */}
      {showReleaseConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface rounded-3xl max-w-xs w-full p-5 shadow-2xl border border-border text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-accent-green/10 text-accent-green flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-text text-sm mb-1">Confirm Release of Funds?</h3>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              Are you satisfied with the delivered item? Releasing <strong className="text-primary font-bold">{formatCurrency(txn.price)}</strong> will disburse payment directly to the seller.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowReleaseConfirm(false)}>
                Cancel
              </Button>
              <Button variant="success" size="sm" className="flex-1 text-xs font-bold" onClick={handleExecuteRelease}>
                Confirm Release
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDispute && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface rounded-3xl max-w-xs w-full p-4 shadow-2xl border border-border my-auto"
          >
            <h3 className="font-extrabold text-text text-sm mb-1">File Dispute</h3>
            <p className="text-[11px] text-text-muted mb-3 leading-tight">
              Escrow will be frozen immediately and evidence gathered for AFASA RA 12010 complaint filing.
            </p>

            <div className="mb-2.5">
              <label className="text-[11px] font-bold text-text-secondary mb-1 block">Reason *</label>
              <select
                className="w-full px-2.5 py-2 rounded-xl bg-surface-alt border border-border text-xs font-medium outline-none focus:border-primary"
                value={disputeForm.reason}
                onChange={(e) => setDisputeForm((f) => ({ ...f, reason: e.target.value }))}
              >
                <option value="">Select reason...</option>
                {DISPUTE_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="text-[11px] font-bold text-text-secondary mb-1 block">Description *</label>
              <textarea
                className="w-full px-2.5 py-2 rounded-xl bg-surface-alt border border-border text-xs font-medium outline-none focus:border-primary resize-none"
                rows={3}
                placeholder="Explain the defect or discrepancy..."
                value={disputeForm.description}
                onChange={(e) => setDisputeForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowDispute(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" className="flex-1 text-xs font-bold" onClick={handleFileDispute}>
                Confirm Dispute
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Share Deal Modal */}
      <ShareDealModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} txn={txn} />

      {/* Full-Screen Payment Popup covering the entire screen */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        txn={txn}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);
          addToast('Funds successfully vaulted in escrow!', 'success');
        }}
      />
    </div>
  );
}
