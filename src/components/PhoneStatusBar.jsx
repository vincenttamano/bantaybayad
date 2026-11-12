import React, { useState, useEffect } from 'react';
import { Wifi } from 'lucide-react';

export default function PhoneStatusBar() {
  const [time, setTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="shrink-0 h-9 bg-surface/95 backdrop-blur-md px-4 flex items-center justify-between text-xs font-semibold text-text select-none border-b border-border/20 z-40">
      {/* Time */}
      <span className="text-[11px] font-bold tracking-tight text-slate-800 dark:text-slate-200 w-12">
        {time}
      </span>

      {/* Dynamic Island Notch */}
      <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2.5 shadow-sm border border-slate-800">
        <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700/60" />
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/90 animate-pulse" />
      </div>

      {/* Connectivity & Battery */}
      <div className="flex items-center justify-end gap-1.5 text-slate-700 dark:text-slate-300 w-12">
        {/* Signal Bars */}
        <div className="flex items-end gap-0.5 h-2.5">
          <span className="w-0.5 h-1 bg-current rounded-full" />
          <span className="w-0.5 h-1.5 bg-current rounded-full" />
          <span className="w-0.5 h-2 bg-current rounded-full" />
          <span className="w-0.5 h-2.5 bg-current rounded-full" />
        </div>
        {/* WiFi */}
        <Wifi className="w-3 h-3 stroke-[2.5]" />
        {/* Battery Icon */}
        <div className="w-4 h-2.5 border border-current rounded-xs p-0.5 flex items-center">
          <div className="w-full h-full bg-accent-green rounded-2xs" />
        </div>
      </div>
    </div>
  );
}

