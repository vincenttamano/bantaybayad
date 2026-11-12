import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import useStore from '../store/useStore';

const iconMap = {
  success: <CheckCircle className="w-4 h-4 text-accent-green shrink-0" />,
  error: <XCircle className="w-4 h-4 text-accent-red shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-accent-yellow shrink-0" />,
  info: <Info className="w-4 h-4 text-primary-light shrink-0" />,
};

const bgMap = {
  success: 'bg-green-50 border-accent-green/30 text-green-950',
  error: 'bg-red-50 border-accent-red/30 text-red-950',
  warning: 'bg-yellow-50 border-accent-yellow/30 text-yellow-950',
  info: 'bg-blue-50 border-primary-light/30 text-blue-950',
};

export default function ToastContainer() {
  const toasts = useStore((s) => s.toasts);

  return (
    <div className="absolute bottom-16 left-3 right-3 z-50 pointer-events-none flex flex-col gap-2 items-center">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border shadow-lg backdrop-blur-md w-full max-w-[340px] text-xs font-semibold ${
              bgMap[toast.type] || bgMap.info
            }`}
          >
            {iconMap[toast.type] || iconMap.info}
            <span className="flex-1">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
