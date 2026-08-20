import React from 'react';
import { BookmarkCheck, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface AutoSaveToastProps {
  isVisible: boolean;
  language: Language;
}

export const AutoSaveToast: React.FC<AutoSaveToastProps> = ({ isVisible, language }) => {
  return (
    <div
      aria-live="polite"
      className={`fixed top-4 right-4 z-50 pointer-events-none transition-all duration-500 ease-out transform ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-3 scale-95'
      }`}
    >
      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/40 text-amber-200 text-xs font-serif shadow-[0_4px_20px_rgba(0,0,0,0.6),0_0_15px_rgba(245,158,11,0.2)]">
        <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-300">
          <BookmarkCheck className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <Sparkles className="w-2.5 h-2.5 text-amber-200 absolute -top-1 -right-1 animate-ping opacity-75" />
        </div>
        <span className="tracking-wide font-medium">
          {language === 'en' ? 'Progress Saved ✦' : 'Progression sauvegardée ✦'}
        </span>
      </div>
    </div>
  );
};
