import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Zap, Shield, Sparkles, ArrowRight,
  CreditCard, Wallet, Building2, CheckCircle2,
  AlertCircle, HelpCircle
} from 'lucide-react';
import { Button, Card } from '../components/UI';
import useStore from '../store/useStore';
import { PLANS } from '../data/seedData';

export default function Pricing() {
  const navigate = useNavigate();
  const { user, upgradePlan, addToast } = useStore();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('gcash');
  const [upgrading, setUpgrading] = useState(false);

  const currentPlan = PLANS[user.plan] || PLANS.free;
  const isPremium = user.plan === 'premium';

  const freeDealsLeft = Math.max(0, currentPlan.freeTxPerMonth - (user.freeTxUsed || 0));

  const handleUpgradeSubmit = () => {
    setUpgrading(true);
    setTimeout(() => {
      upgradePlan();
      setUpgrading(false);
      setShowUpgradeModal(false);
      addToast('🎉 Welcome to BantayBayad Premium!', 'success');
    }, 1200);
  };

  return (
    <div className="p-3.5 sm:p-4 space-y-4 pb-6">
      {/* Title Header */}
      <div className="text-center space-y-1">
        <span className="text-[10px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          Transparent Pricing
        </span>
        <h1 className="text-2xl font-black text-text tracking-tight mt-2">
          Simple, Fair Protection
        </h1>
        <p className="text-xs text-text-secondary max-w-xs mx-auto">
          Every deal is backed by identity-verified escrow and AFASA dispute insurance.
        </p>
      </div>

      {/* User Current Plan Status Banner */}
      <Card className="bg-gradient-to-r from-primary/5 via-primary-light/5 to-transparent border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-text-muted">Your Current Plan</div>
            <div className="text-base font-extrabold text-primary flex items-center gap-1.5 mt-0.5">
              {currentPlan.name}
              {isPremium && <Sparkles className="w-4 h-4 text-accent-yellow fill-accent-yellow" />}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold text-text-secondary block">Free deals this month:</span>
            <span className="text-xs font-bold text-accent-green">
              {freeDealsLeft} of {currentPlan.freeTxPerMonth} deals left
            </span>
          </div>
        </div>

        {/* Free Transaction Counter bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-text-muted mb-1 font-semibold">
            <span>Monthly Free Allowance</span>
            <span>{user.freeTxUsed || 0} / {currentPlan.freeTxPerMonth} used</span>
          </div>
          <div className="h-2 w-full bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, ((user.freeTxUsed || 0) / currentPlan.freeTxPerMonth) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-text-muted mt-1.5">
            First 3 deals every month are 100% free. Afterwards, a low 1.5% escrow fee applies (drops to 0.5% on larger deals ₱15,000+).
          </p>
        </div>
      </Card>

      {/* Plan Cards Grid */}
      <div className="space-y-4">
        {/* Freemium Card */}
        <div className={`relative bg-surface rounded-2xl border ${!isPremium ? 'border-primary ring-2 ring-primary/20' : 'border-border'} p-5 shadow-sm`}>
          {!isPremium && (
            <span className="absolute -top-2.5 right-4 text-[10px] font-bold bg-primary text-white px-2.5 py-0.5 rounded-full shadow-sm">
              Current Plan
            </span>
          )}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-text">Freemium</h2>
              <p className="text-xs text-text-secondary mt-0.5">For casual buyers and occasional marketplace sellers</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-text">₱0</span>
              <span className="text-xs text-text-muted block">forever</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border space-y-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent-green shrink-0" />
              <span><strong>₱10,000</strong> max daily transaction limit</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent-green shrink-0" />
              <span><strong>3 free deals</strong> per month (0% platform fee)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent-green shrink-0" />
              <span><strong>1.5% fee per deal</strong> (drops to <strong>0.5%</strong> on deals ₱15k+)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent-green shrink-0" />
              <span>Full PhilSys/Gov ID eKYC & Device Lock</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent-green shrink-0" />
              <span>Automated AFASA evidence dossier</span>
            </div>
          </div>
        </div>

        {/* Premium Card */}
        <div className={`relative bg-surface rounded-2xl border ${isPremium ? 'border-accent-yellow ring-2 ring-accent-yellow/20' : 'border-primary/40 bg-gradient-to-b from-primary/[0.02] to-transparent'} p-5 shadow-md`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Recommended for Active Sellers
            </span>
            {isPremium && (
              <span className="text-[10px] font-bold bg-accent-green text-white px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>

          <div className="flex justify-between items-start mt-3">
            <div>
              <h2 className="text-lg font-black text-primary">BantayBayad Pro</h2>
              <p className="text-xs text-text-secondary mt-0.5">High volume escrow, high limits, and priority resolution</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-primary">₱299</span>
              <span className="text-xs text-text-muted block">/ month</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border space-y-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span><strong>₱50,000</strong> max daily transaction limit</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span><strong>10 free deals</strong> per month + priority processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>Reduced <strong>1.0% fee</strong> (drops to <strong>0.5%</strong> on deals ₱15k+)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>Verified Pro Seller badge on all deal links</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>Priority Lalamove courier dispatch & tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>Dedicated AFASA Dispute Concierge</span>
            </div>
          </div>

          <div className="mt-5">
            {isPremium ? (
              <Button variant="ghost" size="md" className="w-full text-accent-green font-bold bg-green-50" disabled>
                <CheckCircle2 className="w-4 h-4" /> You're on Premium
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-lg shadow-primary/25"
                onClick={() => setShowUpgradeModal(true)}
              >
                <Zap className="w-4 h-4" /> Upgrade to Pro (₱299/mo)
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Escrow Fee Transparency Breakdown */}
      <Card className="bg-surface-alt">
        <h2 className="text-xs font-bold text-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-primary" /> Fair Escrow Pricing Structure
        </h2>
        <p className="text-xs text-text-secondary leading-relaxed mb-3">
          Our fee is <strong>1.5% falling to 0.5%</strong> on larger deals (with your first 3 deals free every month). Unlike direct GCash transfers with zero recourse, this funds:
        </p>
        <div className="space-y-1.5 text-[11px] text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Bank-grade vaulted escrow hold via BSP-licensed payment rails (Maya / GCash / QR Ph)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Biometric liveness verification and national ID authentication</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Official digital evidence dossier compliant with the AFASA Law (RA 12010)</span>
          </div>
        </div>
      </Card>

      {/* Mock Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-surface rounded-3xl max-w-xs w-full p-4 shadow-2xl border border-border my-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-extrabold text-text">Upgrade to Pro</h3>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-text-muted hover:text-text text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="bg-surface-alt rounded-2xl p-4 mb-4 text-xs">
                <div className="flex justify-between font-bold text-text mb-1">
                  <span>BantayBayad Premium Monthly</span>
                  <span className="text-primary text-sm">₱299.00</span>
                </div>
                <p className="text-[11px] text-text-secondary">
                  Expands your limit to ₱50,000/day, gives you Gold Seller verification, and priority dispute protection.
                </p>
              </div>

              <div className="space-y-2 mb-5">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                  Select Mock Payment Rail
                </label>
                <div
                  onClick={() => setSelectedMethod('gcash')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedMethod === 'gcash' ? 'border-primary bg-primary/5' : 'border-border bg-surface'}`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <div className="w-6 h-6 rounded bg-blue-500 text-white text-[10px] flex items-center justify-center font-black">G</div>
                    GCash e-Wallet
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethod === 'gcash' ? 'border-primary' : 'border-text-muted'}`}>
                    {selectedMethod === 'gcash' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </div>

                <div
                  onClick={() => setSelectedMethod('maya')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedMethod === 'maya' ? 'border-primary bg-primary/5' : 'border-border bg-surface'}`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <div className="w-6 h-6 rounded bg-green-500 text-white text-[10px] flex items-center justify-center font-black">M</div>
                    Maya
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethod === 'maya' ? 'border-primary' : 'border-text-muted'}`}>
                    {selectedMethod === 'maya' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </div>

                <div
                  onClick={() => setSelectedMethod('card')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border bg-surface'}`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <CreditCard className="w-5 h-5 text-gray-700" />
                    Credit / Debit Card (via Xendit)
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethod === 'card' ? 'border-primary' : 'border-text-muted'}`}>
                    {selectedMethod === 'card' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={upgrading}
                  onClick={handleUpgradeSubmit}
                >
                  {upgrading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Processing ₱299 payment...
                    </div>
                  ) : (
                    <>Confirm & Pay ₱299</>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-text-muted"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
