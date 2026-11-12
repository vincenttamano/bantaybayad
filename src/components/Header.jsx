import React from 'react';
import Logo from './Logo';
import useStore from '../store/useStore';
import { Globe } from 'lucide-react';
import translations from '../data/translations';

export default function Header() {
  const { language, setLanguage } = useStore();
  const t = translations[language] || translations.en;

  return (
    <header className="shrink-0 bg-surface/95 backdrop-blur-xl border-b border-border z-30">
      {/* Prototype banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 text-[11px] font-medium text-center py-1 px-3 flex items-center justify-center gap-1.5 select-none">
        <span className="font-bold">⚠️ Prototype</span>
        <span className="text-amber-700/80">· {t.prototypeBanner}</span>
      </div>

      <div className="flex items-center justify-between px-3.5 py-2">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <div>
            <h1 className="text-sm font-extrabold text-primary leading-none flex items-center gap-1">
              {t.appName}
            </h1>
            <p className="text-[9px] text-text-muted font-medium mt-0.5">{t.tagline}</p>
          </div>
        </div>

        <button
          onClick={() => setLanguage(language === 'en' ? 'fil' : 'en')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface-alt text-[11px] font-bold text-text-secondary hover:bg-primary/5 transition-all border border-border/60 active:scale-95"
          aria-label="Toggle language"
        >
          <Globe className="w-3 h-3 text-primary" />
          {language === 'en' ? 'EN' : 'FIL'}
        </button>
      </div>
    </header>
  );
}
