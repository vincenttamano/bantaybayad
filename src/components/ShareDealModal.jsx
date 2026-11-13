import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Copy, Check, ExternalLink, QrCode,
  Smartphone, Users, X, ArrowRight, CloudUpload, CheckCircle2
} from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from './UI';
import { generateShareableLink, pushToCloudStore } from '../services/syncService';

export default function ShareDealModal({ isOpen, onClose, txn }) {
  if (!isOpen || !txn) return null;

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(txn.role === 'buyer' ? 'seller' : 'buyer');
  const [copiedRole, setCopiedRole] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [cloudPushed, setCloudPushed] = useState(false);
  const [cloudPushing, setCloudPushing] = useState(false);

  // Push deal to cloud bus the moment modal opens so QR scan on fresh device works
  useEffect(() => {
    if (!txn) return;
    setCloudPushing(true);
    setCloudPushed(false);
    pushToCloudStore(txn)
      .then(() => {
        setCloudPushed(true);
        setCloudPushing(false);
      })
      .catch(() => {
        setCloudPushing(false);
      });
  }, [txn?.id, txn?.status]);

  // Links with compact data payload embedded (guarantees immediate zero-DB load)
  const buyerLink = generateShareableLink(txn.id, 'buyer', txn, 'full');
  const sellerLink = generateShareableLink(txn.id, 'seller', txn, 'full');
  const activeLink = activeTab === 'buyer' ? buyerLink : sellerLink;

  // Generate QR code locally as a clean data URL (works 100% offline, zero network error)
  useEffect(() => {
    if (!activeLink) return;
    QRCode.toDataURL(activeLink, {
      width: 250,
      margin: 1,
      color: {
        dark: '#002d72',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR data URL:', err));
  }, [activeLink]);

  const handleCopy = (link, role) => {
    navigator.clipboard.writeText(link);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(null), 2500);
  };

  const handleOpenWindow = (link) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-surface rounded-3xl w-full max-w-sm p-4 shadow-2xl border border-border relative my-auto max-h-[92%] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-text text-sm leading-snug">
                Share Deal Links
              </h3>
              <p className="text-[11px] text-text-muted">
                Test together in real-time on 2 devices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-surface-alt hover:bg-border text-text-muted hover:text-text flex items-center justify-center transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable middle */}
        <div className="overflow-y-auto space-y-3 pr-0.5">
          {/* Live sync banner */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-emerald-800 text-[11px]">
                {cloudPushing ? 'Broadcasting Deal...' : cloudPushed ? 'Cloud Sync Ready' : 'Live Sync Active'}
              </span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
              Realtime P2P
            </span>
          </div>

          {/* Role tab selector */}
          <div className="flex rounded-xl bg-surface-alt p-1">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'buyer'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <Users className="w-3 h-3" />
              Buyer Link
            </button>
            <button
              onClick={() => setActiveTab('seller')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'seller'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              Seller Link
            </button>
          </div>

          {/* Item context & Guidance */}
          <div className="bg-surface-alt rounded-xl p-2.5 text-xs space-y-1 border border-border">
            <div className="flex justify-between font-bold text-text">
              <span className="truncate max-w-[180px]">{txn.itemName}</span>
              <span className="text-primary font-mono">₱{txn.price?.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-text-secondary">
              {activeTab === 'seller' ? (
                <><strong>For Seller:</strong> Open on Phone 2 to accept deal and dispatch package via courier.</>
              ) : (
                <><strong>For Buyer:</strong> Open on Phone 1 to deposit into escrow and confirm delivery satisfaction.</>
              )}
            </p>
          </div>

          {/* Link input with copy button */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                readOnly
                value={activeLink}
                className="w-full pl-2.5 pr-20 py-2 rounded-xl bg-surface-alt border border-border text-[11px] font-mono text-text outline-none focus:border-primary select-all"
              />
              <button
                onClick={() => handleCopy(activeLink, activeTab)}
                className="absolute right-1 top-1 bottom-1 px-2.5 rounded-lg bg-primary text-white text-[11px] font-bold flex items-center gap-1 hover:bg-primary-dark transition-all active:scale-95"
              >
                {copiedRole === activeTab ? (
                  <>
                    <Check className="w-3 h-3 text-accent-green" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQr(!showQr)}
                className="w-full flex items-center justify-center gap-1 !py-1.5 text-[11px]"
              >
                <QrCode className="w-3.5 h-3.5" />
                {showQr ? 'Hide QR' : 'Show Phone QR'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenWindow(activeLink)}
                className="w-full flex items-center justify-center gap-1 !py-1.5 text-[11px]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open New Tab
              </Button>
            </div>
          </div>

          {/* QR Code Container */}
          <AnimatePresence>
            {showQr && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-surface-alt rounded-xl p-3 flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-bold text-text-secondary mb-1.5">
                    Scan with phone camera — opens as {activeTab.toUpperCase()}:
                  </p>
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-border">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={`QR Code for ${activeTab}`}
                        className="w-44 h-44 object-contain mx-auto"
                      />
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                        Generating QR Code...
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] font-mono text-text-muted mt-2 text-center break-all px-1 max-w-xs line-clamp-2">
                    {activeLink}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer flow actions */}
        <div className="pt-3 mt-2 border-t border-border shrink-0 flex flex-col gap-2">
          {txn.status === 'DRAFT' && (
            <Button
              variant="primary"
              size="md"
              className="w-full text-xs font-bold"
              onClick={() => {
                onClose();
                navigate(`/reverify/${txn.id}`);
              }}
            >
              Continue to Biometric Re-Verify
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-[11px] text-text-secondary"
            onClick={() => {
              onClose();
              navigate(`/transaction/${txn.id}`);
            }}
          >
            View Deal Details
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
