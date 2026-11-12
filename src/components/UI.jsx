import React from 'react';

export function StatusChip({ status }) {
  const chipClass = `chip-${status.toLowerCase()}`;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${chipClass}`}>
      {status}
    </span>
  );
}

export function VerifiedBadge({ verified }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-green/10 text-accent-green">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-text-muted">
      Unverified
    </span>
  );
}

export function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size]} animate-spin rounded-full border-2 border-primary/20 border-t-primary`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-text-secondary text-sm font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-primary/40" />
        </div>
      )}
      <h3 className="text-lg font-bold text-text mb-1">{title}</h3>
      <p className="text-sm text-text-secondary mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  );
}

export function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`bg-surface rounded-2xl border border-border p-4 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/20 active:scale-[0.99] transition-all' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', className = '', disabled = false, ...props }) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20 active:shadow-sm',
    secondary: 'bg-primary/5 text-primary hover:bg-primary/10',
    success: 'bg-accent-green text-white hover:bg-accent-green/90 shadow-md shadow-accent-green/20',
    danger: 'bg-accent-red text-white hover:bg-accent-red/90 shadow-md shadow-accent-red/20',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface-alt',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/5',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
