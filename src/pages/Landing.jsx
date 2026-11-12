import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, ShieldCheck, UserCheck, Lock, Truck, CheckCircle,
  AlertTriangle, TrendingDown, Users, ArrowRight, Star, Zap
} from 'lucide-react';
import Logo from '../components/Logo';
import { Button } from '../components/UI';
import Footer from '../components/Footer';
import useStore from '../store/useStore';
import translations from '../data/translations';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } }),
};

const stats = [
  { icon: AlertTriangle, color: 'text-accent-red', bg: 'bg-red-50', key: 'stat1', descKey: 'stat1desc' },
  { icon: TrendingDown, color: 'text-accent-yellow', bg: 'bg-yellow-50', key: 'stat2', descKey: 'stat2desc' },
  { icon: Users, color: 'text-accent-orange', bg: 'bg-orange-50', key: 'stat3', descKey: 'stat3desc' },
];

const steps = [
  { icon: UserCheck, key: 'step1', descKey: 'step1desc', num: 1 },
  { icon: Zap, key: 'step2', descKey: 'step2desc', num: 2 },
  { icon: ShieldCheck, key: 'step3', descKey: 'step3desc', num: 3 },
  { icon: Lock, key: 'step4', descKey: 'step4desc', num: 4 },
  { icon: Truck, key: 'step5', descKey: 'step5desc', num: 5 },
  { icon: CheckCircle, key: 'step6', descKey: 'step6desc', num: 6 },
];

export default function Landing() {
  const navigate = useNavigate();
  const lang = useStore((s) => s.language);
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary px-5 pt-12 pb-16">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <Logo size={56} className="mb-4" />
        </motion.div>

        <motion.h1
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="text-3xl font-extrabold text-white leading-tight mb-2"
        >
          Bantay<span className="text-secondary">Bayad</span>
        </motion.h1>

        <motion.p
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="text-white/70 text-sm font-semibold mb-1 italic"
        >
          {t.tagline}
        </motion.p>

        <motion.p
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="text-white/90 text-base font-medium mb-6 max-w-sm"
        >
          {t.heroSubtitle}
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
          <Button
            variant="primary"
            size="lg"
            className="!bg-white !text-primary hover:!bg-white/90 !shadow-xl !shadow-black/10"
            onClick={() => navigate('/verify')}
          >
            {t.getStarted}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={5}
          className="flex items-center gap-4 mt-8"
        >
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-secondary" />
            <span className="text-white/60 text-[10px] font-medium">Escrow Protected</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span className="text-white/60 text-[10px] font-medium">ID Verified</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-4 h-4 text-secondary" />
            <span className="text-white/60 text-[10px] font-medium">AFASA Ready</span>
          </div>
        </motion.div>
      </section>

      {/* Problem Stats */}
      <section className="px-5 py-8">
        <h2 className="text-lg font-extrabold text-text mb-1">The Problem</h2>
        <p className="text-xs text-text-secondary mb-5">Online trading in the Philippines runs on trust, not protection.</p>

        <div className="space-y-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.key}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              className={`flex items-start gap-3 p-4 rounded-2xl ${stat.bg} border border-transparent`}
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">{t[stat.key]}</h3>
                <p className="text-xs text-text-secondary mt-0.5">{t[stat.descKey]}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 py-8 bg-surface-alt">
        <h2 className="text-lg font-extrabold text-text mb-5">{t.howItWorks}</h2>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.key}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              className="flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-extrabold text-primary">{step.num}</span>
              </div>
              <div className="flex-1 bg-surface rounded-2xl p-3.5 border border-border shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <step.icon className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-text">{t[step.key]}</h3>
                </div>
                <p className="text-xs text-text-secondary">{t[step.descKey]}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="px-5 py-8">
        <h2 className="text-lg font-extrabold text-text mb-1">{t.pricing}</h2>
        <p className="text-xs text-text-secondary mb-5">Simple, transparent pricing for every Filipino trader.</p>

        <div className="grid grid-cols-2 gap-3">
          {/* Free */}
          <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
            <h3 className="text-sm font-extrabold text-text">{t.freePlan}</h3>
            <p className="text-2xl font-extrabold text-primary mt-1">₱0</p>
            <p className="text-[10px] text-text-muted mb-3">{t.perMonth}</p>
            <ul className="space-y-1.5 text-[11px] text-text-secondary">
              <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-accent-green" /> Up to ₱10,000/day</li>
              <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-accent-green" /> 2.5% per deal</li>
              <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-accent-green" /> {t.firstThree}</li>
            </ul>
          </div>
          {/* Premium */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-4 shadow-lg shadow-primary/20 relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-secondary/30 rounded-lg px-1.5 py-0.5">
              <Star className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-sm font-extrabold text-white">{t.premiumPlan}</h3>
            <p className="text-2xl font-extrabold text-white mt-1">₱299</p>
            <p className="text-[10px] text-white/60 mb-3">{t.perMonth}</p>
            <ul className="space-y-1.5 text-[11px] text-white/80">
              <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-secondary" /> Up to ₱50,000/day</li>
              <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-secondary" /> 2.5% per deal</li>
              <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-secondary" /> {t.firstThree}</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/verify')}>
            {t.getStarted}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
