import React, { useEffect, useState } from 'react';
import { SceneLocation, LightItem, Language } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';

interface EnvironmentalFXProps {
  location: SceneLocation;
  sceneId: string;
  isTransitioning: boolean;
  language: Language;
  activeLightReward?: LightItem | null;
}

export const EnvironmentalFX: React.FC<EnvironmentalFXProps> = ({
  location,
  sceneId,
  isTransitioning,
  language,
  activeLightReward,
}) => {
  const [showRewardFX, setShowRewardFX] = useState(false);

  // Ambient subtle bird chirping sound effects for peaceful natural scenes (cottage, meadow)
  useEffect(() => {
    if (location !== 'cottage' && location !== 'meadow') return;

    let timeoutId: number;
    const scheduleNextChirp = () => {
      // Random delay between 6.5s and 14s for natural ambience
      const delay = Math.floor(Math.random() * 7500) + 6500;
      timeoutId = window.setTimeout(() => {
        try {
          audioSynth.playSoundEffect('bird_chirp');
        } catch {
          // Non-fatal audio catch
        }
        scheduleNextChirp();
      }, delay);
    };

    // Initial gentle delay before first chirp on scene enter
    const initialTimeout = window.setTimeout(() => {
      try {
        audioSynth.playSoundEffect('bird_chirp');
      } catch {}
      scheduleNextChirp();
    }, 2800);

    return () => {
      window.clearTimeout(initialTimeout);
      window.clearTimeout(timeoutId);
    };
  }, [location]);

  useEffect(() => {
    if (activeLightReward) {
      setShowRewardFX(true);
      const timer = setTimeout(() => setShowRewardFX(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [activeLightReward]);

  // Is this the dramatic Sun Release moment?
  const isSunRelease = sceneId === 'chapter7_2' || sceneId === 'chapter7_3' || sceneId === 'chapter8_1' || sceneId === 'chapter8_2';

  // Is this Wendy's magical transformation sequence (when giving the Sun / becoming Wendy)?
  const isWendyTransformation = sceneId === 'chapter7_3' || sceneId === 'chapter7_4';

  // Is this the Magic Mirror transformation moment?
  const isMirrorTransformation = sceneId === 'chapter9_1' || sceneId === 'chapter9_2' || sceneId === 'chapter9_3' || sceneId === 'chapter9_4' || location === 'magic_mirror';

  // Is this the Dark Lord's subtle heartbeat scene before halting?
  const isDarkLordHeartbeat = sceneId === 'chapter5_2c_heartbeat';

  // Is this the Dark Lord's celestial white light transformation back into gentleman form?
  const isDarkLordTransformation = sceneId === 'chapter8_3b' || sceneId === 'chapter8_4';

  // Is this Dark Lord's initial Abyss reveal?
  const isDarkLordEncounter = sceneId === 'chapter5_1' || sceneId === 'chapter5_2' || sceneId === 'chapter5_3';

  // Is this the Abyss Glowing Bottle sequence?
  const isAbyssBottleGlow = sceneId === 'chapter5_bottle_glow';

  // Is this Mélo Clown giving Wendy her share & plushie?
  const isPlushieGiftScene = sceneId === 'chapter8_6';

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden select-none">
      {/* 1. SCENE CHANGE / TRANSITION FLASH & OVERLAY */}
      {isTransitioning && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            location === 'whispering_forest'
              ? 'bg-emerald-950/40 backdrop-blur-[2px]'
              : location === 'velvet_abyss'
              ? 'bg-purple-950/60 backdrop-blur-[3px]'
              : location === 'sea_shore_dusk'
              ? 'bg-sky-950/50 backdrop-blur-[2px]'
              : location === 'sea_shore_sunrise'
              ? 'bg-amber-900/40 backdrop-blur-[2px]'
              : location === 'magic_mirror'
              ? 'bg-indigo-950/50 backdrop-blur-[3px]'
              : location === 'birthday_feast'
              ? 'bg-amber-950/40 backdrop-blur-[2px]'
              : 'bg-black/30 backdrop-blur-[1px]'
          }`}
        >
          {/* Specific environmental transition particle sweeps */}
          {location === 'whispering_forest' && (
            <div className="absolute inset-0 flex items-center justify-around opacity-75">
              <div className="w-4 h-4 bg-emerald-400 rounded-full blur-sm animate-ping" />
              <div className="w-6 h-6 bg-green-300 rounded-full blur-md animate-bounce" />
              <div className="w-3 h-3 bg-amber-300 rounded-full blur-sm animate-pulse" />
            </div>
          )}

          {location === 'velvet_abyss' && (
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-slate-950 to-transparent opacity-80 animate-void-pulse" />
          )}

          {location === 'sea_shore_sunrise' && (
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 via-yellow-200/40 to-amber-600/30 animate-pulse" />
          )}

          {location === 'birthday_feast' && (
            <div className="absolute inset-0 bg-gradient-to-b from-amber-400/20 via-pink-500/10 to-transparent" />
          )}
        </div>
      )}

      {/* SUBTLE LIGHTNING FLASH OVERLAY (Sea Shore Dusk) */}
      {location === 'sea_shore_dusk' && (
        <div className="absolute inset-0 bg-white/20 animate-lightning-flash pointer-events-none" />
      )}

      {/* 2. CELESTIAL WHITE LIGHT TRANSFORMATION (Dark Lord Abyss -> Gentleman Form) */}
      {isDarkLordTransformation && (
        <div className="absolute inset-0 flex items-center justify-center animate-fade-in pointer-events-none">
          <div className="w-[500px] h-[500px] sm:w-[800px] sm:h-[800px] rounded-full bg-gradient-to-tr from-white via-amber-100 to-purple-200 blur-3xl opacity-60 animate-pulse" />
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-12">
            <div className="w-4 h-4 bg-white rounded-full blur-sm animate-ping" />
            <div className="w-6 h-6 bg-amber-200 rounded-full blur-md animate-ping" />
            <div className="w-4 h-4 bg-purple-300 rounded-full blur-sm animate-ping" />
          </div>
        </div>
      )}

      {/* 2. DARK LORD ENCOUNTER SHADOW PULSE */}
      {isDarkLordEncounter && (
        <div className="absolute inset-0 bg-radial from-transparent via-purple-950/30 to-black/70 animate-void-pulse" />
      )}

      {/* 2b. DARK LORD HEARTBEAT TRANSITION PULSE BEFORE HALTING */}
      {isDarkLordHeartbeat && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          {/* Subtle rhythmic heartbeat vignette */}
          <div className="absolute inset-0 bg-radial from-transparent via-rose-950/25 to-black/70 animate-pulse" />
          {/* Central Heartbeat Starlight Resonance Ripple */}
          <div className="relative flex items-center justify-center">
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border-2 border-rose-400/40 animate-ping opacity-60" />
            <div className="absolute w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-rose-500/10 blur-xl animate-pulse" />
            {/* Heartbeat pulse icon indicator */}
            <div className="absolute text-3xl sm:text-4xl text-rose-300 drop-shadow-[0_0_15px_rgba(244,63,94,0.9)] animate-bounce">
              💓
            </div>
          </div>
        </div>
      )}

      {/* ABYSS SCENE GLOWING BOTTLE ILLUMINATION FX */}
      {isAbyssBottleGlow && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-40 animate-fade-in">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
            {/* Brilliant Azure-Gold Starlight Aura */}
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-500/40 via-sky-300/60 to-amber-300/50 blur-3xl animate-pulse" />
            <svg viewBox="0 0 200 240" className="w-48 h-56 drop-shadow-[0_0_45px_rgba(56,189,248,0.95)] animate-bounce">
              {/* Bottle body */}
              <ellipse cx="100" cy="200" rx="55" ry="14" fill="#0284c7" opacity="0.4" />
              <path d="M70 90 C70 60, 85 55, 85 35 L115 35 C115 55, 130 60, 130 90 L130 180 C130 200, 70 200, 70 180 Z" fill="#38bdf8" fillOpacity="0.35" stroke="#bae6fd" strokeWidth="3" />
              <rect x="88" y="22" width="24" height="14" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1" />
              {/* Glowing golden letter inside */}
              <rect x="85" y="110" width="30" height="50" rx="4" fill="#fef08a" transform="rotate(-10 100 135)" stroke="#fbbf24" strokeWidth="2" />
              <line x1="90" y1="122" x2="110" y2="122" stroke="#d97706" strokeWidth="2" transform="rotate(-10 100 135)" />
              <line x1="90" y1="132" x2="110" y2="132" stroke="#d97706" strokeWidth="2" transform="rotate(-10 100 135)" />
              {/* Magic sparkles */}
              <circle cx="100" cy="130" r="4" fill="#ffffff" className="animate-ping" />
              <circle cx="70" cy="140" r="2.5" fill="#fde047" className="animate-pulse" />
              <circle cx="130" cy="110" r="3" fill="#fde047" className="animate-ping" />
            </svg>
          </div>
        </div>
      )}

      {/* MÉLO CLOWN GLOWING ANIMAL PLUSHIE GIFT FX */}
      {isPlushieGiftScene && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50">
          <div className="animate-plushie-gift flex flex-col items-center bg-slate-950/85 backdrop-blur-md border-2 border-pink-400/60 rounded-3xl p-6 shadow-[0_0_50px_rgba(244,114,182,0.6)]">
            {/* Cute Glowing Hippo Plushie with star */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center mb-2">
              <div className="absolute inset-0 bg-pink-400/30 rounded-full blur-xl animate-pulse" />
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]">
                {/* Round cozy body */}
                <ellipse cx="50" cy="60" rx="32" ry="26" fill="#f472b6" />
                <ellipse cx="50" cy="62" rx="20" ry="16" fill="#fbcfe8" />
                {/* Ears */}
                <circle cx="28" cy="28" r="8" fill="#f472b6" />
                <circle cx="28" cy="28" r="4.5" fill="#fbcfe8" />
                <circle cx="72" cy="28" r="8" fill="#f472b6" />
                <circle cx="72" cy="28" r="4.5" fill="#fbcfe8" />
                {/* Snout */}
                <ellipse cx="50" cy="46" rx="26" ry="19" fill="#f472b6" stroke="#db2777" strokeWidth="1.2" />
                {/* Nostrils */}
                <ellipse cx="42" cy="48" rx="3.5" ry="4" fill="#9d174d" />
                <ellipse cx="58" cy="48" rx="3.5" ry="4" fill="#9d174d" />
                {/* Happy closed sleepy eyes */}
                <path d="M36 34 Q41 38 46 34" stroke="#831843" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M54 34 Q59 38 64 34" stroke="#831843" strokeWidth="2" strokeLinecap="round" fill="none" />
                {/* Rosy cheeks */}
                <ellipse cx="30" cy="42" rx="5" ry="3.5" fill="#fb7185" opacity="0.6" />
                <ellipse cx="70" cy="42" rx="5" ry="3.5" fill="#fb7185" opacity="0.6" />
                {/* Golden star held in hands */}
                <polygon points="50,66 53,74 61,75 55,80 57,88 50,84 43,88 45,80 39,75 47,74" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" className="animate-pulse" />
                <circle cx="50" cy="78" r="2" fill="#ffffff" className="animate-ping" />
              </svg>
            </div>
            <span className="text-amber-200 font-serif text-xs sm:text-sm font-semibold tracking-wider">
              {language === 'en' ? '✨ A Cozy Plushie Gift from Mélo Clown ✨' : '✨ Un Doux Cadeau Peluche du Clown Mélo ✨'}
            </span>
          </div>
        </div>
      )}

      {/* 3. DRAMATIC SUN RELEASE & WENDY'S PURPLE HEARTS TRANSFORMATION */}
      {isSunRelease && (
        <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
          {/* Radiant expanding golden sun flare */}
          <div className="w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] rounded-full bg-gradient-to-r from-amber-300/40 via-yellow-200/50 to-amber-500/30 blur-3xl animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-t from-amber-600/20 via-orange-400/10 to-transparent" />
        </div>
      )}

      {/* Wendy's Magical Purple Hearts Transformation Aura */}
      {isWendyTransformation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 overflow-hidden">
          {/* Swirling Magical Heart & Sparkle Emitter */}
          <div className="relative w-full h-full max-w-2xl mx-auto flex items-center justify-center">
            {/* Soft Purple & Pink Magical Glow Behind Character */}
            <div className="absolute w-72 h-96 sm:w-96 sm:h-[450px] rounded-full bg-gradient-to-tr from-purple-600/30 via-pink-400/30 to-amber-300/25 blur-3xl animate-pulse" />

            {/* Floating Purple Hearts */}
            <div className="absolute bottom-1/4 left-1/3 text-2xl sm:text-3xl text-purple-400 animate-heart-float opacity-90 drop-shadow-[0_0_12px_rgba(192,132,252,0.8)]">
              💜
            </div>
            <div className="absolute bottom-1/3 right-1/3 text-xl sm:text-2xl text-pink-400 animate-heart-float opacity-80 drop-shadow-[0_0_12px_rgba(244,114,182,0.8)] [animation-delay:0.4s]">
              💜
            </div>
            <div className="absolute bottom-1/5 right-1/4 text-3xl sm:text-4xl text-purple-300 animate-heart-float opacity-90 drop-shadow-[0_0_15px_rgba(216,180,254,0.9)] [animation-delay:0.8s]">
              ✨💜✨
            </div>
            <div className="absolute bottom-2/5 left-1/4 text-xl sm:text-2xl text-fuchsia-400 animate-heart-float opacity-85 drop-shadow-[0_0_12px_rgba(232,121,249,0.8)] [animation-delay:1.2s]">
              💜
            </div>
            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl text-purple-400 animate-heart-float opacity-90 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] [animation-delay:1.6s]">
              ✨
            </div>
          </div>
        </div>
      )}

      {/* 4. MAGIC MIRROR TRANSFORMATION SHIMMER & FLOATING PURPLE HEARTS */}
      {isMirrorTransformation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Prismatic starlight rings */}
          <div className="w-[450px] h-[600px] rounded-full border border-purple-400/40 bg-gradient-to-b from-indigo-500/20 via-purple-300/25 to-pink-500/20 blur-xl animate-mirror-shimmer" />
          
          {/* Floating Stardust Motes */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8 opacity-85">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
            <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />
          </div>

          {/* Floating Purple Heart Effect for Mirror Transformation */}
          <div className="relative w-full h-full max-w-2xl mx-auto flex items-center justify-center">
            <div className="absolute bottom-1/4 left-1/4 text-2xl sm:text-3xl text-purple-400 animate-heart-float opacity-90 drop-shadow-[0_0_15px_rgba(192,132,252,0.9)]">
              💜
            </div>
            <div className="absolute bottom-1/3 right-1/4 text-xl sm:text-2xl text-fuchsia-400 animate-heart-float opacity-85 drop-shadow-[0_0_12px_rgba(232,121,249,0.9)] [animation-delay:0.5s]">
              💜
            </div>
            <div className="absolute bottom-1/5 right-1/3 text-2xl sm:text-3xl text-purple-300 animate-heart-float opacity-90 drop-shadow-[0_0_15px_rgba(216,180,254,0.9)] [animation-delay:1.0s]">
              ✨💜✨
            </div>
            <div className="absolute bottom-2/5 left-1/3 text-xl sm:text-2xl text-pink-400 animate-heart-float opacity-80 drop-shadow-[0_0_12px_rgba(244,114,182,0.8)] [animation-delay:1.5s]">
              💜
            </div>
            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl text-purple-400 animate-heart-float opacity-90 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] [animation-delay:2.0s]">
              ✨
            </div>
          </div>
        </div>
      )}

      {/* 5. LIGHT REWARD SHARING / TRANSFER ANIMATION */}
      {showRewardFX && activeLightReward && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in z-50">
          <div className="relative flex flex-col items-center p-6 sm:p-8 rounded-2xl bg-slate-950/90 border border-amber-400/60 shadow-2xl shadow-amber-500/30 max-w-sm mx-4 text-center">
            {/* Glowing Light Orb */}
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-[0_0_35px_rgba(251,191,36,0.9)] animate-pulse flex items-center justify-center text-2xl">
                ✨
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-amber-300 animate-ping opacity-75" />
            </div>

            <h4 className="text-amber-300 font-serif text-lg sm:text-xl font-bold tracking-wide mb-1">
              {activeLightReward.name[language] || activeLightReward.name.en}
            </h4>
            <p className="text-amber-100/90 font-serif text-xs sm:text-sm italic">
              {activeLightReward.description[language] || activeLightReward.description.en}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

