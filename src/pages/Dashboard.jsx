import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, ShieldCheck, Gauge, ArrowRight, Package,
  AlertCircle, TrendingUp, Sparkles
} from 'lucide-react';
import { Button, Card, StatusChip, VerifiedBadge, EmptyState } from '../components/UI';
import useStore from '../store/useStore';
import translations from '../data/translations';
import { PLANS } from '../data/seedData';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, transactions, language } = useStore();
  const t = translations[language] || translations.en;
  const plan = PLANS[user.plan] || PLANS.free;

  const userTxns = transactions;
  const dailyUsed = user.dailySpent || 0;
  const dailyPercent = Math.min((dailyUsed / plan.dailyLimit) * 100, 100);

  const formatCurrency = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 0 });

  return (
    <div className="p-3.5 sm:p-4 space-y-3.5 pb-6">
      {/* User Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-text leading-tight">{t.dashboard}</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <VerifiedBadge verified={user.verified} />
            <span className="text-[11px] text-text-muted">@{user.username}</span>
          </div>
        </div>
        {!user.verified && (
          <Button variant="secondary" size="sm" className="text-xs" onClick={() => navigate('/verify')}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {t.verify}
          </Button>
        )}
      </div>

      {/* Daily Limit Meter */}
      <Card className="!p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-text">{t.dailyLimit}</span>
          </div>
          <span className="text-xs font-bold text-primary">{plan.name}</span>
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
          <span className="text-text-secondary">{formatCurrency(dailyUsed)} used</span>
          <span className="text-text-muted">{formatCurrency(plan.dailyLimit)} limit</span>
        </div>
      </Card>

      {/* Free tx counter */}
      <Card className="!p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">{t.freeTx} this month</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  i < (user.freeTxUsed || 0)
                    ? 'bg-gray-200 text-text-muted line-through'
                    : 'bg-accent-green/10 text-accent-green'
                }`}
              >
                {i < (user.freeTxUsed || 0) ? '✓' : i + 1}
              </div>
            ))}
          </div>
        </div>
      </Card>

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
            {userTxns.map((txn, i) => (
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
                      <div className="flex items-center gap-2 mt-1.5">
                        <StatusChip status={txn.status} />
                        <span className="text-xs font-bold text-text">{formatCurrency(txn.price)}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted shrink-0" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
