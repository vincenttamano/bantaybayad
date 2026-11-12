import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, ShieldCheck, Gauge, ArrowRight, Package,
  AlertCircle, TrendingUp, Sparkles, HelpCircle, Check, Zap
} from 'lucide-react';
import { Button, Card, StatusChip, VerifiedBadge, EmptyState } from '../components/UI';
import useStore from '../store/useStore';
import translations from '../data/translations';
import { PLANS, calculateEscrowFee } from '../data/seedData';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, transactions, language, upgradePlan, addToast } = useStore();
  const t = translations[language] || translations.en;
  const plan = PLANS[user.plan] || PLANS.free;
  const isPremium = user.plan === 'premium';

  const userTxns = transactions;
  const dailyUsed = user.dailySpent || 0;
  const dailyPercent = Math.min((dailyUsed / plan.dailyLimit) * 100, 100);

  const formatCurrency = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 0 });

  const handleQuickUpgrade = () => {
    if (isPremium) {
      navigate('/pricing');
    } else {
      upgradePlan();
      addToast('🎉 Upgraded to Premium! ₱50,000 daily limit unlocked.', 'success');
    }
  };

  return (
    <div className="p-3.5 sm:p-4 space-y-3.5 pb-6">
      {/* User Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-text leading-tight">{t.dashboard}</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <VerifiedBadge verified={user.verified} />
            <span className="text-[11px] text-text-muted">@{user.username}</span>
            {isPremium && (
              <span className="text-[9px] font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-1.5 py-0.2 rounded-full uppercase">
                Premium
              </span>
            )}
          </div>
        </div>
        {!user.verified && (
          <Button variant="secondary" size="sm" className="text-xs" onClick={() => navigate('/verify')}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {t.verify}
          </Button>
        )}
      </div>

      {/* Daily Limit Meter (Lean Canvas: Freemium ₱10k / Premium ₱50k) */}
      <Card className="!p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-text">{t.dailyLimit}</span>
          </div>
          <span className="text-xs font-bold text-primary flex items-center gap-1">
            {plan.name}
            {isPremium && <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />}
          </span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-1.5 border border-border">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${dailyPercent}%` }}
            className={`h-full rounded-full ${
              dailyPercent > 80 ? 'bg-accent-red' : dailyPercent > 50 ? 'bg-accent-yellow' : 'bg-accent-green'
            }`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-text-secondary">{formatCurrency(dailyUsed)} used today</span>
          <span className="text-text-muted font-bold">{formatCurrency(plan.dailyLimit)} max limit</span>
        </div>
      </Card>

      {/* Free Deals Counter (Lean Canvas: First 3 deals free every month) */}
      <Card className="!p-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-text-secondary block">
              {t.freeTx} this month
            </span>
            <span className="text-[10px] text-text-muted">
              {Math.max(0, 3 - (user.freeTxUsed || 0))} of 3 free deals remaining
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-bold transition-all ${
                  i < (user.freeTxUsed || 0)
                    ? 'bg-gray-200 text-text-muted line-through border border-gray-300'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs'
                }`}
              >
                {i < (user.freeTxUsed || 0) ? '✓' : `0%`}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Lean Canvas Fair Escrow Pricing Structure Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#002d72]">
            <HelpCircle className="w-4 h-4 text-[#002d72]" />
            <h2 className="text-xs font-black uppercase tracking-wider">
              Fair Escrow Pricing Structure
            </h2>
          </div>
          <span className="text-[9px] font-bold text-[#002d72] bg-blue-100/60 px-2 py-0.5 rounded-full border border-blue-200">
            Lean Canvas Model
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Our fee is <strong className="text-slate-900 font-bold">1.5% falling to 0.5%</strong> on larger deals (with your first 3 deals free every month). Unlike direct GCash transfers with zero recourse, this funds:
        </p>

        <ul className="space-y-1.5 text-[11px] text-slate-700">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#002d72] mt-1.5 shrink-0" />
            <span>Bank-grade vaulted escrow hold via BSP-licensed payment rails (Maya / GCash / QR Ph)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#002d72] mt-1.5 shrink-0" />
            <span>Biometric liveness verification and national ID authentication</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#002d72] mt-1.5 shrink-0" />
            <span>Official digital evidence dossier compliant with the AFASA Law (RA 12010)</span>
          </li>
        </ul>

        {/* Upgrade Button matching media_1794503060896_eb078378.png */}
        <Button
          variant="primary"
          size="md"
          className="w-full text-xs font-bold bg-[#002d72] hover:bg-[#002052] text-white shadow-sm flex items-center justify-center gap-1.5 !py-2.5"
          onClick={handleQuickUpgrade}
        >
          {isPremium ? (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Premium Active (₱299/mo · ₱50k Limit)</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Upgrade to Pro / Premium (₱299/mo)</span>
            </>
          )}
        </Button>
      </div>

      {/* New Transaction CTA */}
      <Button
        variant="primary"
        size="lg"
        className="w-full text-xs font-bold shadow-md shadow-primary/20"
        onClick={() => {
          if (!user.verified) {
            navigate('/verify');
          } else {
            navigate('/create');
          }
        }}
      >
        <Plus className="w-4 h-4" />
        {t.newTransaction}
      </Button>

      {/* Transactions List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Deals</h2>
          <span className="text-[11px] text-text-muted">{userTxns.length} deals</span>
        </div>

        {userTxns.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No transactions yet"
            description="Create your first secure transaction to get started."
            action={
              <Button variant="secondary" size="sm" onClick={() => navigate('/create')}>
                <Plus className="w-4 h-4" /> Create Transaction
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {userTxns.map((txn, i) => {
              const fee = calculateEscrowFee(txn.price, user.plan, i < 3);
              const feePercent = txn.price >= 15000 ? '0.5%' : '1.5%';
              return (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    onClick={() => navigate(`/transaction/${txn.id}`)}
                    className="!p-3 hover:border-primary/40 cursor-pointer active:scale-99 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-text truncate">{txn.itemName}</h3>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-muted">
                          <span>
                            {txn.role === 'buyer' ? 'Buying from' : 'Selling to'} @{txn.counterparty}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-1.5">
                            <StatusChip status={txn.status} />
                            <span className="text-xs font-bold text-text">{formatCurrency(txn.price)}</span>
                          </div>
                          <span className="text-[10px] font-mono font-semibold text-slate-500">
                            Fee: {fee === 0 ? '₱0 (Free Deal)' : `₱${fee.toLocaleString()} (${feePercent})`}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-muted shrink-0" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
