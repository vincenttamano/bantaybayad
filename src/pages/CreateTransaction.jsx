import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Camera, DollarSign, ArrowRight, AlertTriangle,
  Upload, User, Phone, Tag, Info, ShieldCheck, ArrowLeft
} from 'lucide-react';
import { Button, Card } from '../components/UI';
import ShareDealModal from '../components/ShareDealModal';
import useStore from '../store/useStore';
import { PLANS, calculateEscrowFee } from '../data/seedData';

const CONDITIONS = ['New', 'Like New', 'Used', 'For Parts'];

export default function CreateTransaction() {
  const navigate = useNavigate();
  const { user, addTransaction, addToast, transactions } = useStore();
  const plan = PLANS[user.plan] || PLANS.free;

  const [createdTxnId, setCreatedTxnId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const [form, setForm] = useState({
    itemName: '',
    itemPhoto: null,
    photoPreview: null,
    price: '',
    condition: 'Used',
    role: 'buyer',
    counterparty: '',
  });

  const price = parseFloat(form.price) || 0;
  const freeRemaining = Math.max(0, plan.freeTxPerMonth - (user.freeTxUsed || 0));
  const isFree = freeRemaining > 0;
  const actualFee = calculateEscrowFee(price, user.plan, isFree);
  const total = price + actualFee;
  const feeRatePercent = price >= 15000 ? '0.5%' : (user.plan === 'premium' ? '1.0%' : '1.5%');
  const exceedsLimit = price > (plan.dailyLimit - (user.dailySpent || 0));

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setForm((f) => ({ ...f, itemPhoto: file, photoPreview: ev.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!form.itemName || !form.price || !form.counterparty) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }
    if (!user.verified) {
      addToast('Please complete identity verification first', 'warning');
      navigate('/verify');
      return;
    }
    if (exceedsLimit) {
      addToast('Price exceeds your daily limit!', 'error');
      return;
    }

    const txnId = addTransaction({
      itemName: form.itemName,
      itemPhoto: form.photoPreview,
      price,
      condition: form.condition,
      role: form.role,
      counterparty: form.counterparty.replace('@', ''),
      counterpartyPhone: '',
      fee: actualFee,
    });

    setCreatedTxnId(txnId);
    setShowShareModal(true);
  };

  const createdTxn = transactions.find((t) => t.id === createdTxnId);
  const formatCurrency = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });

  return (
    <div className="p-3.5 sm:p-4 space-y-3.5 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-8 h-8 rounded-xl bg-surface-alt flex items-center justify-center hover:bg-border transition-all shrink-0 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-text-secondary" />
        </button>
        <div>
          <h1 className="text-base font-extrabold text-text">Create Escrow Deal</h1>
          <p className="text-[11px] text-text-muted">AFASA RA 12010 Protected Transaction</p>
        </div>
      </div>

      {/* Role Selection */}
      <Card className="!p-3">
        <label className="text-xs font-bold text-text-secondary mb-1.5 block">I am creating this deal as:</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, role: 'buyer' }))}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
              form.role === 'buyer'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-surface-alt text-text-secondary border-border hover:bg-border/60'
            }`}
          >
            🛒 Buyer
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, role: 'seller' }))}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
              form.role === 'seller'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-surface-alt text-text-secondary border-border hover:bg-border/60'
            }`}
          >
            🏪 Seller
          </button>
        </div>
      </Card>

      {/* Item Details */}
      <Card className="!p-3.5 space-y-3">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-text-secondary mb-1" htmlFor="item-name">
            <Package className="w-3.5 h-3.5 text-primary" /> Item Name *
          </label>
          <input
            id="item-name"
            type="text"
            className="w-full px-3 py-2 rounded-xl bg-surface-alt border border-border text-xs font-medium text-text placeholder:text-text-muted focus:border-primary outline-none"
            placeholder="e.g., Nintendo Switch OLED / iPhone 15"
            value={form.itemName}
            onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-text-secondary mb-1" htmlFor="price">
              <DollarSign className="w-3.5 h-3.5 text-primary" /> Price (PHP) *
            </label>
            <input
              id="price"
              type="number"
              className="w-full px-3 py-2 rounded-xl bg-surface-alt border border-border text-xs font-semibold text-text placeholder:text-text-muted focus:border-primary outline-none"
              placeholder="e.g., 8500"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-text-secondary mb-1" htmlFor="condition">
              <Tag className="w-3.5 h-3.5 text-primary" /> Condition
            </label>
            <select
              id="condition"
              className="w-full px-2.5 py-2 rounded-xl bg-surface-alt border border-border text-xs font-medium text-text focus:border-primary outline-none"
              value={form.condition}
              onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-text-secondary mb-1" htmlFor="counterparty">
            <User className="w-3.5 h-3.5 text-primary" /> Counterparty Username / Phone *
          </label>
          <input
            id="counterparty"
            type="text"
            className="w-full px-3 py-2 rounded-xl bg-surface-alt border border-border text-xs font-medium text-text placeholder:text-text-muted focus:border-primary outline-none"
            placeholder="e.g., maria_santos or 09171234567"
            value={form.counterparty}
            onChange={(e) => setForm((f) => ({ ...f, counterparty: e.target.value }))}
          />
        </div>
      </Card>

      {/* Escrow Fee Calculation */}
      {price > 0 && (
        <Card className="!p-3.5 bg-gradient-to-br from-primary/[0.04] to-transparent border-primary/20">
          <h3 className="text-xs font-bold text-text-secondary mb-2">Escrow Pricing Summary</h3>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted">Item Subtotal</span>
              <span className="font-semibold">{formatCurrency(price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">
                Escrow Protection Fee {isFree ? '(Free deal used)' : `(${feeRatePercent})`}
              </span>
              <span className={isFree ? 'text-accent-green font-bold' : 'font-semibold'}>
                {isFree ? '₱0.00 FREE' : formatCurrency(actualFee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-1 font-bold text-text">
              <span>Total Escrow Amount</span>
              <span className="text-primary font-black">{formatCurrency(total)}</span>
            </div>
          </div>
        </Card>
      )}

      {exceedsLimit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-accent-red" />
          <span>Amount exceeds your daily limit of {formatCurrency(plan.dailyLimit)}.</span>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full text-xs font-bold"
        disabled={!form.itemName || !form.price || !form.counterparty || exceedsLimit}
        onClick={handleSubmit}
      >
        Create Deal & Generate Counterparty Link
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>

      {/* Share Deal Modal */}
      {createdTxn && (
        <ShareDealModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            navigate(`/reverify/${createdTxnId}`);
          }}
          txn={createdTxn}
        />
      )}
    </div>
  );
}
