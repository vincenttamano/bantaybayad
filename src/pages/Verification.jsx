import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Camera, CheckCircle, Shield, Smartphone,
  ArrowRight, ScanFace, AlertCircle, FileCheck
} from 'lucide-react';
import { Button, Card, LoadingSpinner, VerifiedBadge } from '../components/UI';
import useStore from '../store/useStore';
import { verifyGovernmentId, performLivenessScan } from '../services/ekycService';

export default function Verification() {
  const navigate = useNavigate();
  const { user, setUser, verifyUser, addToast } = useStore();
  const [step, setStep] = useState(user.verified ? 'done' : 'upload'); // upload | scanning-id | liveness | scanning-face | done
  const [idPreview, setIdPreview] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [idData, setIdData] = useState(null);
  const [deviceId, setDeviceId] = useState(user.deviceId);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check camera availability
  useEffect(() => {
    navigator.mediaDevices?.getUserMedia?.({ video: true })
      .then(stream => {
        setCameraAvailable(true);
        stream.getTracks().forEach(t => t.stop());
      })
      .catch(() => setCameraAvailable(false));
  }, []);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setIdPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyId = async () => {
    setStep('scanning-id');
    try {
      const result = await verifyGovernmentId(idFile);
      setIdData(result.data);
      setUser({ govIdUploaded: true });
      addToast('Government ID verified!', 'success');
      setStep('liveness');
    } catch {
      addToast('ID verification failed. Try again.', 'error');
      setStep('upload');
    }
  };

  const startLivenessScan = async () => {
    setStep('scanning-face');
    setScanProgress(0);

    // Start camera if available
    if (cameraAvailable) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setCameraAvailable(false);
      }
    }

    // Fast, crisp animation for live demos (~600ms)
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 6;
      });
    }, 30);

    try {
      const result = await performLivenessScan();
      clearInterval(interval);
      setScanProgress(100);

      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      setDeviceId(result.data.deviceId);
      verifyUser(result.data.deviceId);
      addToast('Identity verified! Device bound.', 'success');
      setStep('done');
    } catch {
      clearInterval(interval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      addToast('Liveness scan failed. Try again.', 'error');
      setStep('liveness');
    }
  };

  return (
    <div className="p-3.5 sm:p-4 space-y-3 pb-6">
      <h1 className="text-xl font-extrabold text-text mb-1">Identity Verification</h1>
      <p className="text-sm text-text-secondary mb-6">Secure your account with eKYC</p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {['Upload ID', 'Liveness Scan', 'Device Bound'].map((label, idx) => {
          const stepMap = { 0: ['upload', 'scanning-id'], 1: ['liveness', 'scanning-face'], 2: ['done'] };
          const active = stepMap[idx].includes(step);
          const done = idx === 0 ? ['liveness', 'scanning-face', 'done'].includes(step) :
                       idx === 1 ? step === 'done' : false;
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done ? 'bg-accent-green text-white' :
                  active ? 'bg-primary text-white ring-2 ring-primary/30 ring-offset-2' :
                  'bg-gray-100 text-text-muted'
                }`}>
                  {done ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-[10px] mt-1 font-semibold ${done ? 'text-accent-green' : active ? 'text-primary' : 'text-text-muted'}`}>
                  {label}
                </span>
              </div>
              {idx < 2 && <div className={`flex-1 h-0.5 rounded-full ${done ? 'bg-accent-green' : 'bg-gray-200'}`} />}
            </React.Fragment>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Upload ID */}
        {step === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-bold">Government ID</h2>
              </div>
              <p className="text-xs text-text-secondary mb-4">
                Upload a clear photo of your Philippine National ID, Driver's License, Passport, or other valid government ID.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="id-upload"
                aria-label="Upload government ID"
              />

              {!idPreview ? (
                <label
                  htmlFor="id-upload"
                  className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5 cursor-pointer hover:bg-primary/10 transition-all"
                >
                  <Upload className="w-10 h-10 text-primary/50 mb-2" />
                  <span className="text-sm font-semibold text-primary/70">Tap to upload</span>
                  <span className="text-xs text-text-muted mt-1">JPG, PNG, or HEIC</span>
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={idPreview}
                    alt="Government ID preview"
                    className="w-full h-44 object-cover rounded-2xl"
                  />
                  <button
                    onClick={() => { setIdPreview(null); setIdFile(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                  <div className="absolute bottom-2 left-2 bg-accent-green/90 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Uploaded
                  </div>
                </div>
              )}
            </Card>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!idPreview}
              onClick={handleVerifyId}
            >
              Verify Government ID
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {/* Scanning ID */}
        {step === 'scanning-id' && (
          <motion.div key="scanning-id" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/10 pulse-ring" />
              <div className="absolute inset-0 rounded-full bg-primary/20 pulse-ring" style={{ animationDelay: '0.5s' }} />
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <ScanFace className="w-12 h-12 text-primary" />
              </div>
            </div>
            <p className="text-sm font-bold text-text">Verifying your ID...</p>
            <p className="text-xs text-text-secondary mt-1">Please wait while we process your document</p>
            <LoadingSpinner size="md" />
          </motion.div>
        )}

        {/* Step 2: Liveness */}
        {step === 'liveness' && (
          <motion.div key="liveness" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-accent-green" />
                <h2 className="text-sm font-bold text-accent-green">ID Verified</h2>
              </div>
              {idData && (
                <div className="bg-surface-alt rounded-xl p-3 text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-text-muted">Name</span><span className="font-semibold">{idData.fullName}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">ID Type</span><span className="font-semibold">{idData.idType}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">ID Number</span><span className="font-semibold">{idData.idNumber}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Confidence</span><span className="font-semibold text-accent-green">{(idData.confidence * 100).toFixed(0)}%</span></div>
                </div>
              )}
            </Card>

            <Card className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-bold">Liveness Scan</h2>
              </div>
              <p className="text-xs text-text-secondary mb-4">
                {cameraAvailable
                  ? 'We\'ll use your camera for a quick face scan to confirm you\'re a real person.'
                  : 'Camera not available. We\'ll use an animated scan simulation.'
                }
              </p>

              <div className="w-full h-48 bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden mb-4">
                <div className="w-28 h-28 border-4 border-dashed border-white/40 rounded-full flex items-center justify-center">
                  <ScanFace className="w-16 h-16 text-white/50" />
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/10 text-white text-xs font-medium px-3 py-1 rounded-lg backdrop-blur-sm">
                  Position your face in the circle
                </div>
              </div>
            </Card>

            <Button variant="primary" size="lg" className="w-full" onClick={startLivenessScan}>
              <Camera className="w-5 h-5" />
              Start Liveness Scan
            </Button>
          </motion.div>
        )}

        {/* Scanning Face */}
        {step === 'scanning-face' && (
          <motion.div key="scanning-face" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="overflow-hidden">
              <div className="relative w-full h-64 bg-gray-900 rounded-2xl overflow-hidden">
                {cameraAvailable ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-32 h-32 border-4 border-primary/50 rounded-full flex items-center justify-center animate-pulse">
                      <ScanFace className="w-16 h-16 text-primary" />
                    </div>
                  </div>
                )}

                {/* Scan line overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent scan-line" />
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-2xl" />
                </div>

                {/* Progress */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white text-xs font-semibold">Scanning...</span>
                      <span className="text-white text-xs font-bold">{scanProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-100"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <p className="text-center text-xs text-text-secondary mt-4">
              Hold still... verifying liveness and matching against your ID
            </p>
          </motion.div>
        )}

        {/* Done */}
        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                className="w-20 h-20 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-accent-green" />
              </motion.div>
              <h2 className="text-xl font-extrabold text-text mb-1">Identity Verified!</h2>
              <VerifiedBadge verified={true} />
            </div>

            <Card className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-bold">Device Bound</h2>
              </div>
              <div className="bg-surface-alt rounded-xl p-3 text-center">
                <p className="text-[10px] text-text-muted mb-1">Device ID</p>
                <p className="text-sm font-mono font-bold text-primary">{deviceId || user.deviceId}</p>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Your identity is now bound to this device. Transactions will require face re-verification.
              </p>
            </Card>

            <div className="space-y-2">
              <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="md" className="w-full" onClick={() => navigate('/create')}>
                Create New Transaction
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
