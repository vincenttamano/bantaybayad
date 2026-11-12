import React, { useState } from 'react';
import { HashRouter as Router, MemoryRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import DemoControls from './components/DemoControls';
import ToastContainer from './components/ToastContainer';
import PhoneStatusBar from './components/PhoneStatusBar';
import { RoleProvider } from './context/RoleContext';
import useStore from './store/useStore';

// Pages
import Landing from './pages/Landing';
import Verification from './pages/Verification';
import Dashboard from './pages/Dashboard';
import CreateTransaction from './pages/CreateTransaction';
import ReVerify from './pages/ReVerify';
import DepositFunds from './pages/DepositFunds';
import TransactionDetail from './pages/TransactionDetail';
import EvidenceReport from './pages/EvidenceReport';
import Pricing from './pages/Pricing';

// Mobile layout shell managing viewports, status bar, and pinned navigation
function AppLayout() {
  const location = useLocation();
  const isEvidence = location.pathname.startsWith('/evidence');
  const isLanding = location.pathname === '/';
  const isReverify = location.pathname.startsWith('/reverify');

  return (
    <div className="flex flex-col h-full w-full bg-bg text-text select-none overflow-hidden relative">
      {/* 1. Phone Status Bar (Time, Dynamic Island, Battery/Signal) */}
      <PhoneStatusBar />

      {/* 2. Brand Header of BantayBayad (Logo, Prototype warning, Language switch) */}
      <Header />

      {/* 3. Main Content: Only this region scrolls */}
      <main className="flex-1 w-full overflow-y-auto overscroll-contain relative focus:outline-none">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/verify" element={<Verification />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateTransaction />} />
          <Route path="/reverify/:id" element={<ReVerify />} />
          <Route path="/deposit/:id" element={<DepositFunds />} />
          <Route path="/transaction/:id" element={<TransactionDetail />} />
          <Route path="/evidence/:id" element={<EvidenceReport />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {isLanding && <Footer />}
      </main>

      {/* 4. Bottom Navigation: Firmly pinned at the bottom, never scrolls */}
      {!isEvidence && !isReverify && <BottomNav />}

      {/* 5. In-Screen Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

// Presentation bar shared across modes
function PresentationBar({ deviceMode, setDeviceMode }) {
  return (
    <div className="hidden sm:flex items-center justify-between w-full max-w-5xl px-4 py-2.5 text-xs text-slate-300">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-accent-green animate-pulse" />
        <span className="font-extrabold text-white tracking-wide">BantayBayad Prototype</span>
        <span className="text-slate-400">| Escrow & eKYC Platform (AFASA RA 12010)</span>
      </div>
      <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 shadow-lg">
        <button
          onClick={() => setDeviceMode('phone')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            deviceMode === 'phone'
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📱 Single Phone
        </button>
        <button
          onClick={() => setDeviceMode('dual')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            deviceMode === 'dual'
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          👥 Dual Screen (Buyer & Seller)
        </button>
        <button
          onClick={() => setDeviceMode('fluid')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            deviceMode === 'fluid'
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          💻 Responsive View
        </button>
      </div>
    </div>
  );
}

// Dual Screen View Component (renders two synchronized phones side-by-side)
function DualScreenView({ deviceMode, setDeviceMode }) {
  const transactions = useStore((s) => s.transactions);
  
  // Detect if a specific deal is in the URL hash
  const hashMatch = typeof window !== 'undefined' ? window.location.hash.match(/\/transaction\/([a-zA-Z0-9_-]+)/) : null;
  const initialTxnId = (hashMatch && transactions.some((t) => t.id === hashMatch[1]))
    ? hashMatch[1]
    : (transactions[1]?.id || transactions[0]?.id || 'txn-002');

  const [dualTxnId, setDualTxnId] = useState(initialTxnId);
  const [syncKey, setSyncKey] = useState(0);

  const selectedTxn = transactions.find((t) => t.id === dualTxnId) || transactions[0];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start sm:py-3 px-2 selection:bg-primary/20">
      <PresentationBar deviceMode={deviceMode} setDeviceMode={setDeviceMode} />

      <div className="flex flex-col items-center gap-3 w-full max-w-6xl my-auto py-2">
        {/* Deal controller toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 w-full bg-slate-800/95 border border-slate-700/80 px-4 py-2.5 rounded-2xl text-xs text-white shadow-xl">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <div>
              <span className="font-extrabold text-sm block leading-none">
                Live Dual Screen Simulator
              </span>
              <span className="text-slate-400 text-[11px]">
                Both screens interact simultaneously on the exact same escrow state
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-semibold">Active Deal:</span>
            <select
              value={dualTxnId}
              onChange={(e) => {
                setDualTxnId(e.target.value);
                setSyncKey((k) => k + 1);
              }}
              className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-primary cursor-pointer"
            >
              {transactions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.itemName} ({t.status}) — ₱{t.price?.toLocaleString()}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSyncKey((k) => k + 1)}
              className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-dark font-bold text-white text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Dual Phone Frames Container */}
        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10 w-full py-2">
          {/* Left Phone: BUYER */}
          <div className="flex flex-col items-center">
            <div className="bg-primary text-white text-xs font-extrabold px-3.5 py-1 rounded-full mb-2 shadow-lg shadow-primary/25 flex items-center gap-1.5">
              <span>🛒 BUYER DEVICE</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
                {selectedTxn?.status}
              </span>
            </div>
            <div className="phone-frame ring-2 ring-primary/40">
              <div className="phone-frame-inner">
                <RoleProvider role="buyer">
                  <MemoryRouter
                    key={`buyer-${dualTxnId}-${syncKey}`}
                    initialEntries={[`/transaction/${dualTxnId}?role=buyer`]}
                  >
                    <AppLayout />
                  </MemoryRouter>
                </RoleProvider>
              </div>
            </div>
          </div>

          {/* Right Phone: SELLER */}
          <div className="flex flex-col items-center">
            <div className="bg-emerald-600 text-white text-xs font-extrabold px-3.5 py-1 rounded-full mb-2 shadow-lg shadow-emerald-600/25 flex items-center gap-1.5">
              <span>🏪 SELLER DEVICE</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
                {selectedTxn?.status}
              </span>
            </div>
            <div className="phone-frame ring-2 ring-emerald-500/40">
              <div className="phone-frame-inner">
                <RoleProvider role="seller">
                  <MemoryRouter
                    key={`seller-${dualTxnId}-${syncKey}`}
                    initialEntries={[`/transaction/${dualTxnId}?role=seller`]}
                  >
                    <AppLayout />
                  </MemoryRouter>
                </RoleProvider>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DemoControls />
    </div>
  );
}

export default function App() {
  // Check if opened via deep link (e.g. #/transaction/..., #/verify, #/deposit) or on mobile viewport
  const isDirectRoute = typeof window !== 'undefined' &&
    window.location.hash &&
    window.location.hash !== '#/' &&
    window.location.hash !== '';
  const isMobileViewport = typeof window !== 'undefined' && window.innerWidth < 768;

  // If opening a shared deal or on a mobile phone, render the real single-app experience!
  // On desktop home, default to 'dual' for presenter dual-screen simulation
  const [deviceMode, setDeviceMode] = useState(() => {
    if (isDirectRoute || isMobileViewport) return 'device';
    return 'dual';
  });

  // If dual screen simulator is selected on desktop AND not opening a direct deep route
  if (deviceMode === 'dual' && !isDirectRoute && !isMobileViewport) {
    return <DualScreenView deviceMode={deviceMode} setDeviceMode={setDeviceMode} />;
  }

  // Standard Native Router View (runs the real route for this device)
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start sm:py-4 selection:bg-primary/20">
        {!isMobileViewport && <PresentationBar deviceMode={deviceMode} setDeviceMode={setDeviceMode} />}

        {/* Main Application Container */}
        {deviceMode === 'phone' ? (
          <div className="phone-frame my-auto transition-all duration-300">
            <div className="phone-frame-inner">
              <AppLayout />
            </div>
          </div>
        ) : deviceMode === 'device' ? (
          <div className="w-full max-w-md h-[100dvh] sm:h-[820px] bg-bg sm:rounded-3xl sm:shadow-2xl overflow-hidden sm:my-auto sm:border sm:border-slate-800 flex flex-col">
            <AppLayout />
          </div>
        ) : (
          <div className="w-full max-w-md h-[800px] bg-bg sm:rounded-3xl sm:shadow-2xl overflow-hidden my-auto border border-slate-800 flex flex-col">
            <AppLayout />
          </div>
        )}

        {/* Floating Demo Controls */}
        <DemoControls />
      </div>
    </Router>
  );
}
