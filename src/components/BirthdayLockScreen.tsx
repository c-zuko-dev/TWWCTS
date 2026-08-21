import React, { useState } from 'react';
import { KeyRound, Sparkles, Heart, Globe, Lock, Unlock, Moon, Star, Sun, Monitor } from 'lucide-react';
import { Language } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';

interface BirthdayLockScreenProps {
  onUnlock: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

type CinematicUnlockPhase = 'locked' | 'seal_breaking' | 'celestial_circle' | 'starlight_bloom';

export const BirthdayLockScreen: React.FC<BirthdayLockScreenProps> = ({
  onUnlock,
  language,
  onToggleLanguage,
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [unlockPhase, setUnlockPhase] = useState<CinematicUnlockPhase>('locked');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPasscode(passcode);
  };

  const verifyPasscode = (code: string) => {
    const cleaned = code.replace(/[^0-9]/g, '');
    // Supports 8271996, 08271996, 1996827, etc.
    if (cleaned === '8271996' || cleaned === '08271996' || code.trim() === '8271996') {
      setErrorMsg('');
      setUnlockPhase('seal_breaking');
      audioSynth.playSoundEffect('magic_sparkle');

      // 1. Stage 1: Card radiates and breaks the ancient padlock into glowing runes
      setTimeout(() => {
        setUnlockPhase('celestial_circle');
        audioSynth.playSoundEffect('sunrise_chime');
        audioSynth.playSoundEffect('celebration_chimes');

        // 2. Stage 2: Full-screen celestial constellation & magic seal expand
        setTimeout(() => {
          setUnlockPhase('starlight_bloom');
          audioSynth.playSoundEffect('starlight');

          // 3. Stage 3: Warm starlight bloom dissolution into Title Screen
          setTimeout(() => {
            onUnlock();
          }, 850);
        }, 1800);
      }, 700);
    } else {
      setIsShaking(true);
      audioSynth.playSoundEffect('click');
      setErrorMsg(
        language === 'en'
          ? 'A magical seal protects this tale... Enter the special date ✦'
          : 'Un sceau magique protège ce conte... Entrez la date spéciale ✦'
      );
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  const handleDigitClick = (digit: string) => {
    if (unlockPhase !== 'locked') return;
    if (passcode.length < 10) {
      const next = passcode + digit;
      setPasscode(next);
      audioSynth.playSoundEffect('starlight');
      setErrorMsg('');
      if (next.replace(/[^0-9]/g, '') === '8271996' || next.replace(/[^0-9]/g, '') === '08271996') {
        verifyPasscode(next);
      }
    }
  };

  const handleSkipAnimation = () => {
    if (unlockPhase !== 'locked') {
      onUnlock();
    }
  };

  return (
    <div
      onClick={handleSkipAnimation}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 px-4 sm:px-6 overflow-hidden select-none"
    >
      {/* Ambient background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        
        {/* Floating Stars */}
        <div className="absolute top-12 left-12 text-amber-300/30 text-2xl animate-float">✦</div>
        <div className="absolute top-1/3 right-16 text-amber-200/20 text-xl animate-float-gentle">✨</div>
        <div className="absolute bottom-20 left-1/5 text-amber-300/25 text-3xl animate-float">✦</div>
        <div className="absolute bottom-16 right-1/4 text-amber-200/30 text-lg animate-float-gentle">⋆</div>
      </div>

      {/* Language Switcher Pill (during lock state) */}
      {unlockPhase === 'locked' && (
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800/80 border border-amber-500/30 text-amber-200 text-xs font-serif shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">{language.toUpperCase()}</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL-SCREEN CINEMATIC MAGICAL UNLOCK CEREMONY OVERLAY */}
      {/* ========================================================================= */}
      {unlockPhase !== 'locked' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-fade-in text-center px-4 overflow-hidden pointer-events-auto cursor-pointer">
          {/* Radiant Golden Cosmic Backlight */}
          <div className="absolute inset-0 bg-radial from-amber-500/25 via-purple-950/20 to-slate-950 pointer-events-none" />

          {/* Expanding Celestial Magic Seal SVG */}
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[480px] md:h-[480px] flex items-center justify-center mb-6 animate-seal-burst">
            <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_0_50px_rgba(245,158,11,0.6)]">
              <defs>
                <linearGradient id="sealGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="45%" stopColor="#fbbf24" />
                  <stop offset="80%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
                <radialGradient id="sunCoreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="35%" stopColor="#fef08a" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Outer Golden Concentric Ring */}
              <circle cx="200" cy="200" r="185" fill="none" stroke="url(#sealGoldGrad)" strokeWidth="2.5" strokeDasharray="6 4" className="animate-celestial-spin-cw" />
              <circle cx="200" cy="200" r="172" fill="none" stroke="#fbbf24" strokeWidth="1.2" opacity="0.65" />

              {/* Counter-rotating Rune Ring with 12 Celestial Glyphs */}
              <g className="animate-celestial-spin-ccw">
                <circle cx="200" cy="200" r="150" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="14 8" opacity="0.8" />
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const x = 200 + 160 * Math.cos(angle);
                  const y = 200 + 160 * Math.sin(angle);
                  return (
                    <text
                      key={i}
                      x={x}
                      y={y + 4}
                      fontSize="11"
                      fill="#fef08a"
                      textAnchor="middle"
                      fontFamily="serif"
                      opacity="0.85"
                    >
                      {['✦', '✧', '☉', '☽', '⋆', 'ᚱ', 'ᚹ', 'ᛊ', '☼', '✨', 'ᛟ', '☾'][i]}
                    </text>
                  );
                })}
              </g>

              {/* Interlocking 8-Pointed Star of Twilight */}
              <g stroke="url(#sealGoldGrad)" strokeWidth="2" fill="none" opacity="0.75" className="animate-celestial-spin-cw">
                <polygon points="200,60 340,200 200,340 60,200" />
                <polygon points="200,60 340,200 200,340 60,200" transform="rotate(45 200 200)" />
              </g>

              {/* Inner Sacred Sun Disc */}
              <circle cx="200" cy="200" r="85" fill="url(#sunCoreGlow)" className="animate-pulse" />
              <circle cx="200" cy="200" r="45" fill="#ffffff" />
              <circle cx="200" cy="200" r="95" fill="none" stroke="#fbbf24" strokeWidth="2" />

              {/* Radiating Sun Beams */}
              <g stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" className="animate-spin-slow origin-center">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const angle = (idx * 22.5 * Math.PI) / 180;
                  const x1 = 200 + 55 * Math.cos(angle);
                  const y1 = 200 + 55 * Math.sin(angle);
                  const x2 = 200 + (idx % 2 === 0 ? 88 : 72) * Math.cos(angle);
                  const y2 = 200 + (idx % 2 === 0 ? 88 : 72) * Math.sin(angle);
                  return <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} />;
                })}
              </g>

              {/* Center Emblem Icon */}
              <g transform="translate(182, 182)">
                <path
                  d="M18 4 L22 13 L31 13 L24 19 L27 28 L18 22 L9 28 L12 19 L5 13 L14 13 Z"
                  fill="#78350f"
                  stroke="#d97706"
                  strokeWidth="1.5"
                />
              </g>
            </svg>

            {/* Orbiting Sparkles */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-full h-full animate-spin-slow">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-amber-200 text-xl animate-glint-flash">✨</div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-yellow-300 text-xl animate-glint-flash">✦</div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 text-amber-300 text-lg animate-glint-flash">🌟</div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 text-amber-100 text-lg animate-glint-flash">⋆</div>
              </div>
            </div>
          </div>

          {/* Magical Celestial Announcement */}
          <div className="relative z-10 max-w-lg mx-auto">
            <p className="text-amber-400 font-serif text-xs sm:text-sm tracking-[0.45em] uppercase mb-2 animate-pulse flex items-center justify-center gap-2">
              <span>✦</span>
              <span>
                {language === 'en'
                  ? 'THE SEAL OF TWILIGHT AWAKENS'
                  : 'LE SCEAU DU CRÉPUSCULE S’ÉVEILLE'}
              </span>
              <span>✦</span>
            </p>

            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 tracking-wide mb-3 drop-shadow-md">
              {language === 'en'
                ? 'Welcome to the Tale of the Sun'
                : 'Bienvenue dans le Conte du Soleil'}
            </h2>

            <p className="text-sm font-serif italic text-amber-200/80 max-w-md mx-auto mb-4">
              {language === 'en'
                ? 'A story of shared light, gentle warmth, and friends who walk beside you.'
                : 'Une histoire de lumière partagée, de douce chaleur et d’amis qui marchent à vos côtés.'}
            </p>

            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400/60 font-serif">
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>{language === 'en' ? 'Unfolding memories...' : 'Déploiement des souvenirs...'}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </div>
          </div>

          {/* Starlight Bloom Final Dissolve Flash */}
          {unlockPhase === 'starlight_bloom' && (
            <div className="fixed inset-0 z-60 bg-gradient-to-t from-amber-200/40 via-amber-100/50 to-white/60 pointer-events-none animate-starlight-bloom" />
          )}
        </div>
      )}

      {/* Main Lock Card (when locked) */}
      {unlockPhase === 'locked' && (
        <div
          className={`relative z-10 w-full max-w-md p-6 sm:p-8 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-amber-500/40 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.2)] text-center transition-transform duration-300 ${
            isShaking ? 'animate-wiggle' : ''
          }`}
        >
          {/* Top Decorative Emblem */}
          <div className="relative mx-auto w-16 h-16 mb-5 flex items-center justify-center rounded-full bg-gradient-to-b from-amber-500/20 to-amber-900/30 border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
            <Lock className="w-7 h-7 text-amber-300" />
            <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-spin" style={{ animationDuration: '6s' }} />
          </div>

          {/* Primary Prompt in English and French */}
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-400 tracking-wide mb-2">
            {language === 'en'
              ? 'Something special is waiting...'
              : 'Quelque chose de spécial vous attend...'}
          </h1>

          <p className="text-sm font-serif text-amber-200/75 italic mb-3">
            {language === 'en'
              ? 'Enter the key to unlock the tale ✦'
              : 'Entrez la clé pour ouvrir ce conte ✦'}
          </p>

          {/* Desktop/Laptop Optimization Pill */}
          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1 mb-5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-serif shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Monitor className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold tracking-wide">
              {language === 'en' ? 'Best with desktop mode.' : 'Optimisé pour le mode bureau.'}
            </span>
          </div>

          {/* Code Input Form */}
          <form onSubmit={handleSubmit} className="mb-5">
            <div className="relative mb-3">
              <input
                type="password"
                inputMode="numeric"
                maxLength={10}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="•••••••"
                className="w-full text-center text-2xl sm:text-3xl tracking-[0.35em] font-mono py-2.5 px-4 rounded-xl bg-slate-950/80 border border-amber-500/40 text-amber-100 placeholder-amber-500/30 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 transition-all shadow-inner"
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-amber-400/50 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Quick Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✦'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === 'C') {
                      setPasscode('');
                      audioSynth.playSoundEffect('click');
                    } else if (key === '✦') {
                      handleSubmit(new Event('submit') as unknown as React.FormEvent);
                    } else {
                      handleDigitClick(key);
                    }
                  }}
                  className={`py-2 rounded-lg font-serif text-base transition-all active:scale-95 border cursor-pointer ${
                    key === '✦'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold border-amber-400 hover:brightness-110 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : key === 'C'
                      ? 'bg-slate-950/70 text-amber-300/70 border-slate-800 hover:bg-slate-800/80'
                      : 'bg-slate-950/80 text-amber-100 border-amber-500/25 hover:border-amber-400/50 hover:bg-amber-500/10'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-6 rounded-xl font-serif text-sm sm:text-base font-semibold tracking-wider uppercase bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:brightness-110 active:scale-98 transition-all shadow-[0_4px_15px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 border border-amber-300/50 cursor-pointer"
            >
              <Heart className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>{language === 'en' ? 'Open Storybook' : 'Ouvrir le Conte'}</span>
            </button>
          </form>

          {/* Error message */}
          {errorMsg && (
            <p className="text-xs font-serif text-rose-300/90 animate-fade-in mt-1">
              {errorMsg}
            </p>
          )}

          {/* Quiet footer signature */}
          <div className="mt-5 pt-4 border-t border-amber-500/20 flex items-center justify-center gap-1.5 text-amber-400/50 text-xs font-serif">
            <Moon className="w-3 h-3 text-amber-400/60" />
            <span>The Witch Who Carried the Sun</span>
            <Star className="w-2.5 h-2.5 text-amber-400/60" />
          </div>
        </div>
      )}
    </div>
  );
};
