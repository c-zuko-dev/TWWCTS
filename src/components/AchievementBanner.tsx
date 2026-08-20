import React, { useEffect } from 'react';
import { Sparkles, X, Sprout, Flame, Heart, Sun } from 'lucide-react';
import { LightItem, Language } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';

interface AchievementBannerProps {
  lightReward: LightItem | null;
  language: Language;
  onClose: () => void;
}

export const AchievementBanner: React.FC<AchievementBannerProps> = ({
  lightReward,
  language,
  onClose,
}) => {
  useEffect(() => {
    if (lightReward) {
      audioSynth.playSoundEffect('magic_surge');
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lightReward, onClose]);

  if (!lightReward) return null;

  const name = lightReward.name[language] || lightReward.name.en;
  const desc = lightReward.description[language] || lightReward.description.en;

  const getIcon = () => {
    switch (lightReward.icon) {
      case 'seed':
      case 'Sprout':
        return <Sprout className="w-6 h-6 text-emerald-300" />;
      case 'fire':
      case 'Flame':
        return <Flame className="w-6 h-6 text-amber-300" />;
      case 'heart':
      case 'Heart':
        return <Heart className="w-6 h-6 text-pink-300" />;
      case 'sparkles':
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-sky-300" />;
      default:
        return <Sun className="w-6 h-6 text-yellow-300" />;
    }
  };

  return (
    <div
      id="achievement-popup-card"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce duration-500 max-w-md w-[92%] sm:w-auto select-none pointer-events-auto"
    >
      <div className="relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/95 border-2 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.6)] backdrop-blur-xl">
        {/* Glowing Aura Effect */}
        <div
          className="absolute inset-0 rounded-2xl opacity-20 blur-md pointer-events-none"
          style={{ backgroundColor: lightReward.color || '#f59e0b' }}
        />

        {/* Icon Emblem with Pulse */}
        <div
          className="relative flex-shrink-0 w-12 h-12 rounded-xl border border-white/25 flex items-center justify-center shadow-lg"
          style={{ backgroundColor: `${lightReward.color}40` }}
        >
          {getIcon()}
          <div className="absolute inset-0 rounded-xl border border-amber-300 animate-ping opacity-60 pointer-events-none" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-2 text-left">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] sm:text-xs font-serif uppercase tracking-widest font-bold text-amber-400">
              {language === 'en' ? '🏆 Achievement Unlocked!' : '🏆 Succès Débloqué !'}
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-serif font-bold text-amber-100 truncate drop-shadow-sm">
            {name}
          </h4>
          <p className="text-[11px] sm:text-xs text-amber-200/85 font-serif line-clamp-2 leading-tight">
            {desc}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
