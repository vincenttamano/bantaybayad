import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, CreditCard, Wallet, Building2, ArrowRight,
  CheckCircle, Lock, Shield, ArrowLeft, RefreshCw
} from 'lucide-react';
import { Button, Card, LoadingSpinner } from '../components/UI';
import useStore from '../store/useStore';
import { generateQRCode, processPayment } from '../services/paymentService';

const PAYMENT_METHODS = [
  { id: 'gcash', name: 'GCash', icon: Wallet, color: 'bg-blue-600', sub: 'Instant QR Ph / Wallet' },
  { id: 'maya', name: 'Maya', icon: CreditCard, color: 'bg-emerald-600', sub: 'Instant QR Ph / Card' },
  { id: 'bank', name: 'BDO / BPI / UnionBank', icon: Building2, color: 'bg-slate-700', sub: 'InstaPay QR Transfer' },
];

export default function DepositFunds() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions, transitionTransaction, updateTransaction, addToast, useFreeTx, user } = useStore();
  const txn = transactions.find((t) => t.id === id);

  const [phase, setPhase] = useState('select'); // select | qr | processing | locked
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!txn) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-text-secondary">Transaction not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const total = txn.price + (txn.fee || 0);

  const handleSelectMethod = async (method) => {
    setSelectedMethod(method);
    setLoading(true);
    try {
      const result = await generateQRCode(total);
      setQrUrl(result.data.qrCodeUrl);
      setPhase('qr');
    } catch {
      addToast('Failed to generate payment QR. Try again.', 'error');
    }
    setLoading(false);
  };

  const handlePaid = async () => {
    setPhase('processing');
    try {
      await processPayment(selectedMethod.name, total);
      const ok = transitionTransaction(id, 'FUNDED', `Funds deposited via ${selectedMethod.name}`);
      if (ok) {
        updateTransaction(id, { paymentMethod: selectedMethod.name });
        if (user.freeTxUsed < 3) useFreeTx();
        setPhase('locked');
      }
    } catch {
      addToast('Payment processing failed.', 'error');
      setPhase('qr');
    }
  };

  return (
    <div className="p-3.5 sm:p-4 space-y-3 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={() => navigate(`/transaction/${id}`)}
          className="w-8 h-8 rounded-xl bg-surface-alt flex items-center justify-center hover:bg-border transition-all shrink-0 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-text-secondary" />
        </button>
        <div>
          <h1 className="text-base font-extrabold text-text">Deposit into Escrow</h1>
          <p className="text-[11px] text-text-muted">Bangko Sentral Compliant Escrow Vault</p>
        </div>
      </div>

      {/* Amount card */}
      <Card className="!bg-primary/5 !border-primary/20 text-center !p-4">
        <p className="text-[11px] font-semibold text-text-muted mb-0.5">Total Escrow Amount</p>
        <p className="text-2xl font-black text-primary">
          ₱{Number(total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-1 text-[11px] text-text-secondary">
          <span className="font-medium truncate max-w-[180px]">{txn.itemName}</span>
          <span>·</span>
          <span>Fee: ₱{Number(txn.fee || 0).toLocaleString()}</span>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {/* Payment method selection */}
        {phase === 'select' && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Select Payment Rail</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <Card
                  key={method.id}
                  onClick={() => handleSelectMethod(method)}
                  className="!flex-row flex items-center gap-3 !p-3 hover:border-primary/40 cursor-pointer active:scale-98 transition-all"
                >
                  <div className={`w-9 h-9 rounded-xl ${method.color} flex items-center justify-center text-white shrink-0`}>
                    <method.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-text truncate">{method.name}</h3>
                    <p className="text-[10px] text-text-muted">{method.sub}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted shrink-0" />
                </Card>
              ))}
            </div>

            <div className="bg-surface-alt rounded-xl p-2.5 text-[11px] text-text-muted flex items-start gap-2 border border-border mt-3">
              <Shield className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
              <span>Funds are protected under Republic Act 12010. Seller does not receive funds until you confirm package delivery.</span>
            </div>
          </motion.div>
        )}

        {/* QR Code Presentation */}
        {phase === 'qr' && (
          <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <Card className="!p-4 text-center">
              <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                QR Ph Dynamic Pay Code
              </span>
              <p className="text-xs text-text-secondary mt-2 mb-3">
                Scan using any Philippine bank or e-wallet app ({selectedMethod?.name}):
              </p>

              <div className="bg-white p-3 rounded-2xl inline-block shadow-sm border border-border mb-2">
                <img
                  src={qrUrl}
                  alt="Payment QR Code"
                  className="w-40 h-40 object-contain mx-auto"
                />
              </div>

              <p className="text-[10px] text-text-muted">
                Reference: <strong className="font-mono text-text">BB-{txn.id.toUpperCase()}</strong>
              </p>
            </Card>

            <Button
              variant="primary"
              size="lg"
              className="w-full text-xs font-bold"
              onClick={handlePaid}
            >
              <CheckCircle className="w-4 h-4" />
              Simulate Instant Payment Confirmation
            </Button>

            <button
              onClick={() => setPhase('select')}
              className="w-full text-center text-[11px] font-semibold text-text-secondary hover:text-text py-1"
            >
              Choose different payment method
            </button>
          </motion.div>
        )}

        {/* Processing State */}
        {phase === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8 text-center flex flex-col items-center">
            <div className="relative w-20 h-20 mb-4">
              <div className="absolute inset-0 rounded-full bg-primary/10 pulse-ring" />
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-9 h-9 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-sm font-bold text-text">Locking funds in escrow...</p>
            <p className="text-xs text-text-secondary mt-1">Generating immutable AFASA proof</p>
          </motion.div>
        )}

        {/* Locked Success State */}
        {phase === 'locked' && (
          <motion.div key="locked" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <Card className="!p-5 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-primary/30 vault-lock text-white"
              >
                <Lock className="w-10 h-10" />
              </motion.div>
              <h2 className="text-base font-extrabold text-text mb-0.5">Money Locked in Vault!</h2>
              <p className="text-xs text-text-secondary">
                ₱{Number(total).toLocaleString('en-PH', { minimumFractionDigits: 2 })} secured via {selectedMethod?.name}
              </p>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-accent-green text-[11px] font-semibold">
                <Shield className="w-4 h-4" />
                <span>Protected by BantayBayad Escrow</span>
              </div>
            </Card>

            <Button
              variant="primary"
              size="lg"
              className="w-full text-xs font-bold"
              onClick={() => navigate(`/transaction/${id}`)}
            >
              View Transaction Progress
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
