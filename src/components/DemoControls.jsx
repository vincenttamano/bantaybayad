import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, RefreshCcw, FastForward, AlertTriangle,
  RotateCcw, ChevronDown, ChevronUp, Users, Zap, CheckCircle2,
  Lock, Truck, ShieldCheck
} from 'lucide-react';
import useStore from '../store/useStore';
import { COURIER_STATUSES } from '../data/seedData';

export default function DemoControls() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const {
    demoRole,
    setDemoRole,
    transactions,
    updateTransaction,
    transitionTransaction,
    resetDemo,
    addToast
  } = useStore();

  const advanceCourier = (txnId) => {
    const txn = transactions.find((t) => t.id === txnId);
    if (!txn || !txn.courierStatus) return;
    const idx = COURIER_STATUSES.indexOf(txn.courierStatus);
    if (idx < COURIER_STATUSES.length - 1) {
      const next = COURIER_STATUSES[idx + 1];
      updateTransaction(txnId, { courierStatus: next });
      if (next === 'Delivered') {
        transitionTransaction(txnId, 'DELIVERED', 'Package delivered by courier');
        updateTransaction(txnId, { countdownEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() });
      }
      addToast(`Courier status → ${next}`, 'info');
    }
  };

  const fastForwardCountdown = (txnId) => {
    updateTransaction(txnId, { countdownEnd: new Date(Date.now() + 4000).toISOString() });
    addToast('Countdown fast-forwarded!', 'info');
  };

  const triggerDispute = (txnId) => {
    const txn = transactions.find((t) => t.id === txnId);
    if (txn && txn.status === 'DELIVERED') {
      transitionTransaction(txnId, 'DISPUTED', 'Item not as described (Demo)');
      updateTransaction(txnId, {
        disputeReason: 'Item not as described',
        disputeDescription: 'Demo dispute filed from developer controls.',
      });
    } else {
      addToast('Transaction must be DELIVERED to dispute', 'warning');
    }
  };

  // Direct state jumper for rapid demo testing
  const setDirectStatus = (txnId, newStatus) => {
    const timelineEntry = {
      status: newStatus,
      time: new Date().toISOString(),
      label: `Jumped to ${newStatus} (Demo)`,
    };
    const extra = {};
    if (newStatus === 'FUNDED') {
      extra.paymentMethod = 'Maya (QR Ph)';
    } else if (newStatus === 'SHIPPED') {
      extra.courier = 'Lalamove';
      extra.trackingId = 'LLM-2026-99120';
      extra.courierStatus = 'In transit';
    } else if (newStatus === 'DELIVERED') {
      extra.courierStatus = 'Delivered';
      extra.countdownEnd = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    } else if (newStatus === 'DISPUTED') {
      extra.disputeReason = 'Item not as described';
    }
    updateTransaction(txnId, {
      status: newStatus,
      ...extra,
      timeline: [...(transactions.find(t => t.id === txnId)?.timeline || []), timelineEntry],
    });
    addToast(`Status set to ${newStatus}`, 'success');
  };

  return (
    <>
      {/* Floating Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-[300] w-12 h-12 rounded-full bg-primary text-white shadow-xl shadow-primary/30 flex items-center justify-center hover:bg-primary-dark transition-all active:scale-90"
        aria-label="Toggle demo controls"
        title="Developer / Presenter Demo Tools"
      >
        <Zap className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-18 right-4 z-[300] w-84 max-h-[75vh] bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary text-white px-4 py-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="font-bold text-xs">Demo State Controller</span>
              </div>
              <button
                onClick={() => setMinimized(!minimized)}
                className="hover:bg-white/20 rounded-lg p-1 transition-all"
              >
                {minimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {!minimized && (
              <div className="p-3.5 space-y-3 overflow-y-auto max-h-[60vh] text-xs">
                {/* Global Role Switch */}
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                    Global Perspective
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setDemoRole('buyer')}
                      className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
                        demoRole === 'buyer'
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-surface-alt text-text-secondary hover:bg-border'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" /> Buyer 🛒
                    </button>
                    <button
                      onClick={() => setDemoRole('seller')}
                      className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
                        demoRole === 'seller'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-surface-alt text-text-secondary hover:bg-border'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" /> Seller 🏪
                    </button>
                  </div>
                </div>

                {/* Deal Quick Jumper */}
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                    Quick Jump Deal State
                  </label>
                  <div className="space-y-2">
                    {transactions.slice(0, 3).map((txn) => (
                      <div key={txn.id} className="bg-surface-alt rounded-2xl p-2.5 border border-border">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-text truncate max-w-[160px]">{txn.itemName}</span>
                          <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                            {txn.status}
                          </span>
                        </div>

                        {/* Direct Jump Pills */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {['DRAFT', 'REVERIFIED', 'FUNDED', 'SHIPPED', 'DELIVERED', 'RELEASED'].map((st) => (
                            <button
                              key={st}
                              onClick={() => setDirectStatus(txn.id, st)}
                              className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold transition-all ${
                                txn.status === st
                                  ? 'bg-primary text-white'
                                  : 'bg-surface border border-border text-text-secondary hover:text-primary'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>

                        {/* Extra controls */}
                        <div className="flex gap-1 mt-2">
                          {txn.status === 'SHIPPED' && (
                            <button
                              onClick={() => advanceCourier(txn.id)}
                              className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-lg hover:bg-primary/20 flex-1 text-center"
                            >
                              <FastForward className="w-3 h-3 inline mr-0.5" /> Next courier
                            </button>
                          )}
                          {txn.status === 'DELIVERED' && (
                            <>
                              <button
                                onClick={() => fastForwardCountdown(txn.id)}
                                className="text-[10px] font-bold bg-accent-yellow/15 text-yellow-800 px-2 py-0.5 rounded-lg hover:bg-accent-yellow/25 flex-1 text-center"
                              >
                                <FastForward className="w-3 h-3 inline mr-0.5" /> FF Timer
                              </button>
                              <button
                                onClick={() => triggerDispute(txn.id)}
                                className="text-[10px] font-bold bg-accent-red/10 text-accent-red px-2 py-0.5 rounded-lg hover:bg-accent-red/20 flex-1 text-center"
                              >
                                <AlertTriangle className="w-3 h-3 inline mr-0.5" /> Dispute
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reset All */}
                <button
                  onClick={resetDemo}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset All Data to Default
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
