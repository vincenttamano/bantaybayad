import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScanFace, ShieldCheck, ArrowRight, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import { Button, Card, LoadingSpinner } from '../components/UI';
import useStore from '../store/useStore';
import { useActiveRole } from '../context/RoleContext';
import { reVerifyIdentity } from '../services/ekycService';

export default function ReVerify() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const contextRole = useActiveRole();
  const urlRole = searchParams.get('role');

  const { transactions, transitionTransaction, addToast, demoRole } = useStore();
  const txn = transactions.find((t) => t.id === id);

  const [phase, setPhase] = useState('ready'); // ready | scanning | done
  const [progress, setProgress] = useState(0);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const effectiveRole = urlRole || contextRole || demoRole || txn?.role || 'buyer';
  const isBuyer = effectiveRole === 'buyer';

  useEffect(() => {
    navigator.mediaDevices?.getUserMedia?.({ video: true })
      .then((s) => {
        setCameraAvailable(true);
        s.getTracks().forEach((t) => t.stop());
      })
      .catch(() => setCameraAvailable(false));
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startScan = async () => {
    setPhase('scanning');
    setProgress(0);

    if (cameraAvailable) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setCameraAvailable(false);
      }
    }

    // Fast biometric sweep for snappy live presentations (~600ms)
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 6;
      });
    }, 30);

    try {
      const result = await reVerifyIdentity();
      clearInterval(interval);
      setProgress(100);
      streamRef.current?.getTracks().forEach((t) => t.stop());

      const ok = transitionTransaction(
        id,
        'REVERIFIED',
        `Identity re-verified via biometric liveness scan`
      );
      if (ok) {
        setPhase('done');
      }
    } catch {
      clearInterval(interval);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      addToast('Re-verification failed. Try again.', 'error');
      setPhase('ready');
    }
  };

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
          <h1 className="text-base font-extrabold text-text">Biometric Re-Verification</h1>
          <p className="text-[11px] text-text-muted">AFASA RA 12010 Credential Lock</p>
        </div>
      </div>

      {/* Transaction summary */}
      <Card className="!bg-primary/5 !border-primary/20 !p-3">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-text-muted">Item</span>
            <span className="font-semibold text-text truncate max-w-[180px]">{txn.itemName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Total Escrow</span>
            <span className="font-bold text-primary">₱{Number(total).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Current View Role</span>
            <span className="font-semibold text-primary capitalize">{effectiveRole}</span>
          </div>
        </div>
      </Card>

      {phase === 'ready' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <Card className="!p-4 text-center">
            <div className="w-full h-44 bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden mb-3">
              <div className="w-24 h-24 border-3 border-dashed border-white/40 rounded-full flex items-center justify-center">
                <ScanFace className="w-12 h-12 text-white/50" />
              </div>
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-white/10 text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap">
                {cameraAvailable ? 'Camera ready for facial scan' : 'Simulation scan available'}
              </div>
            </div>
            <h3 className="text-sm font-bold text-text mb-1">Quick Facial Liveness Scan</h3>
            <p className="text-xs text-text-secondary">
              Confirms you are the registered account holder before activating the escrow vault.
            </p>
          </Card>

          <Button variant="primary" size="lg" className="w-full text-xs font-bold" onClick={startScan}>
            <ScanFace className="w-4 h-4" />
            Start 2-Second Biometric Scan
          </Button>
        </motion.div>
      )}

      {phase === 'scanning' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <Card className="!p-4 text-center">
            <div className="w-full h-44 bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden mb-3">
              {cameraAvailable ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="w-24 h-24 border-3 border-dashed border-primary/50 rounded-full flex items-center justify-center">
                  <ScanFace className="w-12 h-12 text-primary animate-pulse" />
                </div>
              )}
              {/* Scan beam */}
              <div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent scan-line shadow-lg shadow-cyan-400/50"
              />
              <div className="absolute top-2.5 right-2.5 bg-black/50 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-md">
                LIVENESS: CHECKING
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-text">Analyzing biometric markers...</span>
                <span className="text-primary font-mono">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {phase === 'done' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
          <Card className="!p-5 text-center">
            <div className="w-16 h-16 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-9 h-9 text-accent-green" />
            </div>
            <h2 className="text-base font-extrabold text-text mb-1">Identity Confirmed!</h2>
            <p className="text-xs text-text-secondary">
              Facial liveness matched your government eKYC profile. Device credentials locked.
            </p>
            <div className="mt-3 bg-surface-alt rounded-xl p-2 text-[11px] text-text-muted border border-border">
              AFASA RA 12010 Audit Timestamp: {new Date().toLocaleTimeString()}
            </div>
          </Card>

          <Button
            variant="primary"
            size="lg"
            className="w-full text-xs font-bold"
            onClick={() => {
              if (isBuyer) {
                navigate(`/deposit/${id}`);
              } else {
                navigate(`/transaction/${id}`);
              }
            }}
          >
            {isBuyer ? (
              <>
                <Lock className="w-4 h-4" />
                Proceed to Deposit ₱{Number(total).toLocaleString()}
              </>
            ) : (
              <>
                View Transaction Status
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
