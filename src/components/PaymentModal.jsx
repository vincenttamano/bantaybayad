import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ShieldCheck, QrCode, Wallet, CreditCard, Building2,
  CheckCircle2, Lock, ArrowRight, RefreshCw, AlertCircle, Clock
} from 'lucide-react';
import { Button, Card, LoadingSpinner } from './UI';
import useStore from '../store/useStore';
import { generateQRCode, processPayment } from '../services/paymentService';
import { calculateEscrowFee } from '../data/seedData';

const PAYMENT_METHODS = [
  { id: 'gcash', name: 'GCash', icon: Wallet, color: 'bg-blue-600', sub: 'Instant QR Ph / E-Wallet', badge: 'Most Popular' },
  { id: 'maya', name: 'Maya', icon: CreditCard, color: 'bg-emerald-600', sub: 'Instant QR Ph / Card', badge: 'Fastest' },
  { id: 'bank', name: 'BDO / BPI / UnionBank', icon: Building2, color: 'bg-slate-800', sub: 'InstaPay QR Transfer', badge: 'Zero Fee Rail' },
];

export default function PaymentModal({ isOpen, onClose, txn, onPaymentSuccess }) {
  const { transitionTransaction, updateTransaction, addToast, useFreeTx, user } = useStore();
  const [phase, setPhase] = useState('select'); // 'select' | 'qr' | 'processing' | 'success'
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);
  const [qrUrl, setQrUrl] = useState('');
  const [loadingQr, setLoadingQr] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins

  // Reset phase whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase('select');
      setTimeLeft(900);
      setSelectedMethod(PAYMENT_METHODS[0]);
    }
  }, [isOpen]);

  // Countdown timer for QR
  useEffect(() => {
    if (!isOpen || phase !== 'qr') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, phase]);

  if (!isOpen || !txn) return null;

  const fee = calculateEscrowFee(txn.price, user.plan, (user.freeTxUsed || 0) < 3);
  const totalAmount = txn.price + fee;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectMethod = async (method) => {
    setSelectedMethod(method);
    setLoadingQr(true);
    try {
      const result = await generateQRCode(totalAmount);
      setQrUrl(result.data.qrCodeUrl);
      setPhase('qr');
    } catch {
      addToast('Failed to generate payment QR code', 'error');
    } finally {
      setLoadingQr(false);
    }
  };

  const handleSimulatePayment = async () => {
    setPhase('processing');
    try {
      await processPayment(selectedMethod.name, totalAmount);
      const ok = transitionTransaction(txn.id, 'FUNDED', `Funds vaulted in escrow via ${selectedMethod.name}`);
      if (ok) {
        updateTransaction(txn.id, {
          paymentMethod: selectedMethod.name,
          fee: fee,
        });
        if ((user.freeTxUsed || 0) < 3) {
          useFreeTx();
        }
        setPhase('success');
        if (onPaymentSuccess) onPaymentSuccess();
      }
    } catch (err) {
      console.error(err);
      addToast('Payment simulation failed', 'error');
      setPhase('qr');
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col overflow-hidden select-none animate-in fade-in duration-200">
      {/* 1. Full Screen Modal Top Bar */}
      <div className="bg-[#002d72] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-wide uppercase leading-tight">
              BantayBayad Escrow Vault
            </h2>
            <span className="text-[9px] text-white/80 font-mono">
              BSP LICENSED · AFASA RA 12010 COMPLIANT
            </span>
          </div>
        </div>

        {phase !== 'processing' && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-90"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* 2. Amount Summary Banner */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 shrink-0">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Total Escrow Deposit
          </span>
          <span className="text-2xl font-black text-[#002d72] tracking-tight">
            ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="mt-2 bg-white rounded-xl p-2.5 border border-slate-200 text-[11px] space-y-1">
          <div className="flex justify-between text-slate-600">
            <span className="truncate max-w-[200px] font-semibold text-slate-900">{txn.itemName}</span>
            <span className="font-mono">₱{txn.price?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-500 text-[10px]">
            <span>
              Escrow Protection Fee ({txn.price >= 15000 ? '0.5% Large Deal' : '1.5%'}
              {(user.freeTxUsed || 0) < 3 ? ' · FREE DEAL' : ''})
            </span>
            <span className="font-mono font-bold text-emerald-600">
              {fee === 0 ? '₱0.00 (Free)' : `₱${fee.toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Modal Body: Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Phase: Method Selection */}
        {phase === 'select' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select BSP-Regulated Payment Rail
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Vaulted
              </span>
            </div>

            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => handleSelectMethod(method)}
                    disabled={loadingQr}
                    className="w-full text-left bg-white border-2 border-slate-200 hover:border-[#002d72] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all active:scale-98 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${method.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-extrabold text-slate-900 group-hover:text-[#002d72]">
                            {method.name}
                          </span>
                          <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                            {method.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {method.sub}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#002d72] group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Escrow Guarantee Notice */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 flex items-start gap-2.5 text-[11px] text-blue-900 leading-snug">
              <ShieldCheck className="w-4 h-4 text-[#002d72] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">AFASA RA 12010 Buyer Protection</strong>
                <span>
                  Funds are held in high-security escrow. The seller (@{txn.counterparty}) does NOT receive payment until you inspect and approve the delivered item.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Phase: QR Ph Display */}
        {phase === 'qr' && (
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>QR Ph Session expires in {formatTimer(timeLeft)}</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border-2 border-slate-300 shadow-lg inline-block mx-auto max-w-[260px]">
              <div className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest py-1 px-3 rounded-lg mb-2">
                Scan via {selectedMethod.name} or Any Banking App
              </div>
              <img
                src={qrUrl}
                alt="QR Ph Payment Code"
                className="w-48 h-48 object-contain mx-auto rounded-xl"
              />
              <div className="mt-2 text-[10px] font-mono text-slate-500">
                REF: <strong className="text-slate-900">BB-ESCROW-{txn.id.toUpperCase()}</strong>
              </div>
            </div>

            <div className="space-y-2 max-w-xs mx-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full text-xs font-bold bg-[#002d72] hover:bg-[#002052] shadow-md py-3 flex items-center justify-center gap-2"
                onClick={handleSimulatePayment}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Instant Payment Confirmation</span>
              </Button>

              <button
                onClick={() => setPhase('select')}
                className="text-xs text-slate-500 hover:text-slate-900 font-bold underline block mx-auto py-1"
              >
                ← Choose another payment rail
              </button>
            </div>
          </div>
        )}

        {/* Phase: Processing Animation */}
        {phase === 'processing' && (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-blue-50 border-4 border-[#002d72]/20 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-4 border-[#002d72] border-t-transparent animate-spin" />
              <Lock className="w-8 h-8 text-[#002d72]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Vaulting Funds in Escrow...</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Confirming settlement via Bangko Sentral ng Pilipinas payment rail and locking transaction hash.
              </p>
            </div>
          </div>
        )}

        {/* Phase: Success Screen */}
        {phase === 'success' && (
          <div className="py-6 text-center flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Status: FUNDED & PROTECTED
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">
                ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} Vaulted in Escrow!
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1 leading-relaxed">
                Your payment is safely vaulted. Seller <strong>@{txn.counterparty}</strong> has been notified to dispatch the package via courier. Funds will not be released until you confirm delivery satisfaction.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left text-[11px] space-y-1.5 w-full max-w-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900">{txn.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Rail:</span>
                <span className="font-bold text-slate-900">{selectedMethod.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AFASA Audit Seal:</span>
                <span className="font-mono text-emerald-700 font-bold">VERIFIED-VAULT</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full max-w-xs text-xs font-bold bg-[#002d72] hover:bg-[#002052] py-3 shadow-md"
              onClick={onClose}
            >
              Done · Return to Deal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
