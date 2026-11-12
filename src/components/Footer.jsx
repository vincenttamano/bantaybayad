import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-surface-alt border-t border-border px-4 py-6 pb-20 text-center">
      <p className="text-xs text-text-muted font-medium mb-3">
        Possible partners: eKYC, Xendit, QR Ph, Lalamove
      </p>
      <div className="flex items-center justify-center gap-3 mb-3">
        {/* UN SDG 10 badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-100/80">
          <div className="w-5 h-5 rounded bg-[#DD1367] flex items-center justify-center">
            <span className="text-white text-[8px] font-extrabold">10</span>
          </div>
          <span className="text-[9px] font-bold text-[#DD1367]">Reduced Inequalities</span>
        </div>
        {/* UN SDG 16 badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-100/80">
          <div className="w-5 h-5 rounded bg-[#00689D] flex items-center justify-center">
            <span className="text-white text-[8px] font-extrabold">16</span>
          </div>
          <span className="text-[9px] font-bold text-[#00689D]">Peace & Justice</span>
        </div>
      </div>
      <p className="text-[10px] text-text-muted">
        © 2026 BantayBayad. FIV Developers. All rights reserved.
      </p>
    </footer>
  );
}
