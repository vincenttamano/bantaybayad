import React from 'react';
import { STATUS_STEPS } from '../data/seedData';
import { CheckCircle, Circle, AlertTriangle } from 'lucide-react';

const STEP_LABELS = {
  DRAFT: 'Draft',
  REVERIFIED: 'Verified',
  FUNDED: 'Funded',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  RELEASED: 'Released',
};

export default function ProgressStepper({ currentStatus }) {
  const isDisputed = currentStatus === 'DISPUTED';
  const currentIdx = isDisputed
    ? STATUS_STEPS.indexOf('DELIVERED')
    : STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="flex items-center justify-between w-full" role="progressbar" aria-label="Transaction progress">
      {STATUS_STEPS.map((step, idx) => {
        const isDone = idx <= currentIdx;
        const isCurrent = step === currentStatus;
        const isLast = idx === STATUS_STEPS.length - 1;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center min-w-0 flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isDone
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-alt border border-border text-text-muted'
                } ${isCurrent && !isDisputed ? 'ring-2 ring-primary/40 ring-offset-1' : ''}`}
              >
                {isDone ? (
                  <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <span className="text-[9px]">{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[9px] mt-1 text-center font-medium truncate max-w-[48px] leading-none ${
                  isCurrent
                    ? 'text-primary font-bold'
                    : isDone
                    ? 'text-text font-semibold'
                    : 'text-text-muted'
                }`}
              >
                {STEP_LABELS[step] || step}
              </span>
            </div>
            {!isLast && (
              <div
                className={`h-0.5 flex-1 mx-0.5 rounded-full transition-all shrink-0 ${
                  idx < currentIdx ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}

      {isDisputed && (
        <>
          <div className="h-0.5 flex-1 mx-0.5 rounded-full bg-accent-red shrink-0" />
          <div className="flex flex-col items-center min-w-0 flex-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-accent-red text-white shadow-xs ring-2 ring-accent-red/40 ring-offset-1">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] mt-1 text-center font-bold text-accent-red leading-none truncate max-w-[48px]">
              Disputed
            </span>
          </div>
        </>
      )}
    </div>
  );
}
