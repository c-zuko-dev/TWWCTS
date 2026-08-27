import React, { useState, useEffect, useRef } from 'react';
import { CharacterExpression, CharacterId, Language } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';

interface CharacterPortraitProps {
  characterId: CharacterId;
  expression?: CharacterExpression;
  isSecondary?: boolean;
  showSwwPin?: boolean;
  isSpeaking?: boolean;
  className?: string;
  language?: Language;
}

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  characterId,
  expression = 'gentle',
  isSecondary = false,
  showSwwPin = false,
  isSpeaking = true,
  className = '',
  language = 'en',
}) => {
  const portraitRef = useRef<HTMLDivElement>(null);
  const [clickReaction, setClickReaction] = useState<{ text: string; emoji: string } | null>(null);
  const [isOrikBlushing, setIsOrikBlushing] = useState(false);
  const [isLanternGlowing, setIsLanternGlowing] = useState(false);
  const [isWendyBlushing, setIsWendyBlushing] = useState(false);
  const [floatingNotes, setFloatingNotes] = useState<Array<{ id: number; symbol: string; left: number; top: number; delay: number }>>([]);
  const [isHeartbeating, setIsHeartbeating] = useState(false);
  const [eyeTrackingOffset, setEyeTrackingOffset] = useState({ x: 0, y: 0 });
  const [isSoftSighing, setIsSoftSighing] = useState(false);
  const [isGBearBouncing, setIsGBearBouncing] = useState(false);
  const [isGBearHiding, setIsGBearHiding] = useState(false);
  const [isGBearBlinking, setIsGBearBlinking] = useState(false);
  const [gbearHearts, setGBearHearts] = useState<Array<{ id: number; symbol: string; left: number; top: number; delay: number }>>([]);
  const [gbearStars, setGBearStars] = useState<
    Array<{
      id: number;
      symbol: string;
      left: number;
      top: number;
      dx: number;
      dy: number;
      size: number;
      color: string;
      delay: number;
      duration: number;
      rotStart: number;
      rotEnd: number;
    }>
  >([]);
  const prevExpressionRef = useRef<CharacterExpression>(expression);

  // Randomized eye-blink loop for GBear while being held/presented using setTimeout to feel natural and alive
  useEffect(() => {
    const isHolding =
      (characterId === 'witch' || characterId === 'human_witch') && expression === 'holding_gbear';
    const isPresenting =
      characterId === 'clown' && expression === 'gentleman_presenting_bear';

    if (!isHolding && !isPresenting) {
      setIsGBearBlinking(false);
      return;
    }

    let blinkTimer: number;
    let resetTimer: number;

    const scheduleNextBlink = () => {
      // Natural random delay between 2.2s and 5.5s
      const nextDelay = 2200 + Math.random() * 3300;
      blinkTimer = window.setTimeout(() => {
        setIsGBearBlinking(true);
        // Realistic blink closing duration (140ms - 180ms)
        resetTimer = window.setTimeout(() => {
          setIsGBearBlinking(false);
          scheduleNextBlink();
        }, 160);
      }, nextDelay);
    };

    scheduleNextBlink();

    return () => {
      window.clearTimeout(blinkTimer);
      window.clearTimeout(resetTimer);
    };
  }, [characterId, expression]);

  // Random 5% chance event where GBear 'hides' his face in Wendy's hands for a second, then 'peeks out' with a small sparkle
  useEffect(() => {
    const isHolding =
      (characterId === 'witch' || characterId === 'human_witch') && expression === 'holding_gbear';
    if (!isHolding) {
      setIsGBearHiding(false);
      return;
    }

    const interval = window.setInterval(() => {
      if (Math.random() < 0.05 && !isGBearBouncing && !isGBearHiding) {
        setIsGBearHiding(true);
        setTimeout(() => {
          setIsGBearHiding(false);
          audioSynth.playSoundEffect('magic_sparkle');
          setClickReaction({
            text:
              language === 'fr'
                ? 'GBear jette un coup d’œil timide et scintillant ! 🧸✨'
                : 'GBear peeks out with a shy sparkle! 🧸✨',
            emoji: '💛',
          });
          setTimeout(() => setClickReaction(null), 2400);
        }, 1300);
      }
    }, 4000);

    return () => window.clearInterval(interval);
  }, [characterId, expression, isGBearBouncing, isGBearHiding]);

  // Interactive GBear Teddy Squeak, Cheerful Golden Star Particle System & 3 Rapid Happy Hops
  const handleGBearClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    audioSynth.playGBearSqueak();
    setIsGBearBouncing(true);
    setTimeout(() => setIsGBearBouncing(false), 880);

    const isWendy = characterId === 'human_witch' || characterId === 'witch';
    const isClown = characterId === 'clown';
    const originX = isWendy ? 50 : isClown ? 56 : 50;
    const originY = isWendy ? 68 : isClown ? 64 : 60;

    // 1. Tiny Golden Star Particle System radiating outwards
    const starSymbols = ['★', '✦', '✧', '⭐', '✨', '⋆'];
    const starColors = ['#fbbf24', '#fde047', '#fef08a', '#f59e0b', '#ffffff', '#ffd700'];

    const newStars = Array.from({ length: 16 }).map((_, i) => {
      const angle = (i / 16) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const distance = 40 + Math.random() * 60;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - (18 + Math.random() * 24);
      return {
        id: Date.now() + i,
        symbol: starSymbols[Math.floor(Math.random() * starSymbols.length)],
        left: originX,
        top: originY,
        dx: Math.round(dx),
        dy: Math.round(dy),
        size: 9 + Math.floor(Math.random() * 10),
        color: starColors[Math.floor(Math.random() * starColors.length)],
        delay: Math.floor(Math.random() * 100),
        duration: 950 + Math.floor(Math.random() * 450),
        rotStart: Math.floor(Math.random() * 90) - 45,
        rotEnd: Math.floor(Math.random() * 360) + 180,
      };
    });
    setGBearStars(newStars);
    setTimeout(() => setGBearStars([]), 1800);

    // 2. Ascending floating hearts and plush honey symbols
    const symbols = ['🧸', '💛', '✨', '🍯', '⭐', '💖'];
    const newHearts = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + 100 + i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      left: originX - 16 + Math.random() * 32,
      top: originY - 10 + Math.random() * 20,
      delay: i * 75,
    }));
    setGBearHearts(newHearts);
    setTimeout(() => setGBearHearts([]), 2400);

    const reactionMsg =
      characterId === 'human_witch'
        ? language === 'fr'
          ? 'Wendy serre amoureusement GBear ! 🧸💛'
          : 'Wendy lovingly hugs GBear! 🧸💛'
        : characterId === 'clown'
        ? language === 'fr'
          ? 'Mélo présente GBear ! Pouêt ! 🧸✨'
          : 'Mélo presents GBear! Squeak! 🧸✨'
        : language === 'fr'
        ? 'GBear couine et salue joyeusement ! 🧸👋✨'
        : 'GBear squeaks & waves happily! 🧸👋✨';

    setClickReaction({ text: reactionMsg, emoji: '🧸' });
    setTimeout(() => setClickReaction(null), 2400);
  };

  // Trigger randomized 'soft sigh' sound effect & gentle relief exhalation animation when Super Witch transitions from burdened/overwhelmed to calm/peaceful/gentle/relieved
  useEffect(() => {
    const prev = prevExpressionRef.current;
    if (
      (characterId === 'witch' || characterId === 'human_witch') &&
      (prev === 'burdened' || prev === 'overwhelmed') &&
      (expression === 'calm' || expression === 'peaceful' || expression === 'relieved' || expression === 'gentle')
    ) {
      audioSynth.playSoftSigh();
      setIsSoftSighing(true);
      const timer = window.setTimeout(() => setIsSoftSighing(false), 2200);
      prevExpressionRef.current = expression;
      return () => window.clearTimeout(timer);
    }
    prevExpressionRef.current = expression;
  }, [characterId, expression]);

  // Subtle interactive eye-tracking effect where character's gaze follows player cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!portraitRef.current) return;
      const rect = portraitRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.38;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Restrain within soft natural gaze range (max ~2.4px horizontally, ~1.8px vertically in SVG coords)
      const maxDistance = 420;
      const intensity = Math.min(1, dist / maxDistance);
      const targetX = (dx / dist) * intensity * 2.4;
      const targetY = (dy / dist) * intensity * 1.8;

      setEyeTrackingOffset({
        x: Math.round(targetX * 10) / 10,
        y: Math.round(targetY * 10) / 10,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (characterId === 'narrator') return null;

  const handleCharacterClick = () => {
    if (characterId === 'lezar') {
      audioSynth.playSoundEffect('lezar_meow');
      setClickReaction({ text: language === 'fr' ? 'Miaou~ 🐾' : 'Meow~ 🐾', emoji: '🐱' });
    } else if (characterId === 'orik') {
      audioSynth.playSoundEffect('orik_chirp');
      setIsOrikBlushing(true);
      setClickReaction({ text: language === 'fr' ? 'Oh... *rougit* 🌱✨' : 'Aww~ (blushes) 🌱✨', emoji: '💚' });
      setTimeout(() => setIsOrikBlushing(false), 2400);
    } else if (characterId === 'artisan') {
      const isHelped = expression === 'inspired' || expression === 'grateful' || expression === 'happy' || expression === 'warm' || expression === 'celebrating';
      if (isHelped) {
        audioSynth.playSoundEffect('vivienne_laugh');
        setClickReaction({ text: language === 'fr' ? 'Aha ! Hahaha~ 💛🔥' : 'Aha! Hahaha~ 💛🔥', emoji: '😄' });
      } else {
        audioSynth.playSoundEffect('vivienne_cry');
        setClickReaction({ text: language === 'fr' ? 'Snif... *sanglote doucement* 💧💔' : 'Sniffle... *sobs quietly* 💧💔', emoji: '😢' });
      }
    } else if (characterId === 'hypo') {
      audioSynth.playSoundEffect('hypo_squeak');
      setClickReaction({ text: language === 'fr' ? 'Pouêt ! *remue les oreilles* 🦛💧' : 'Squeak! *wiggles ears* 🦛💧', emoji: '✨' });
    } else if (characterId === 'human_witch') {
      if (expression === 'holding_gbear') {
        handleGBearClick();
        return;
      }
      // When Super Witch becomes Wendy, clicking her triggers cute giggles and a blushing smile
      audioSynth.playSoundEffect('wendy_giggle');
      setIsWendyBlushing(true);
      setClickReaction({
        text: language === 'fr' ? '« Coucou. Hi-hi *rires* » 🌸🥰' : '“Hi. Tee-hee *giggles*” 🌸🥰',
        emoji: '💖',
      });
      setTimeout(() => setIsWendyBlushing(false), 2600);
    } else if (characterId === 'witch') {
      if (expression === 'holding_gbear') {
        handleGBearClick();
        return;
      }
      // Super Witch clicked: Lantern flares with golden glow & celestial chime
      audioSynth.playLanternGlow();
      setIsLanternGlowing(true);
      setTimeout(() => setIsLanternGlowing(false), 2400);
      setClickReaction({
        text:
          language === 'fr'
            ? 'La Lanterne Solaire rayonne d’une douce lumière dorée ! ☀️✨'
            : 'The Sun Lantern flares with warm golden light! ☀️✨',
        emoji: '🌟',
      });
    } else if (characterId === 'clown') {
      if (expression === 'gentleman_presenting_bear') {
        handleGBearClick();
        return;
      }
      const isAbyssOrMad =
        expression === 'abyss_mad' ||
        expression === 'abyss_horror' ||
        expression === 'abyss_theatrical' ||
        expression === 'abyss_soft' ||
        expression === 'abyss_surprised' ||
        (typeof expression === 'string' && expression.startsWith('abyss_')) ||
        (expression !== 'holding_cake' &&
          expression !== 'waving' &&
          expression !== 'relic_smile' &&
          expression !== 'gentleman_theatrical' &&
          expression !== 'gentleman_soft' &&
          expression !== 'gentleman_presenting_bear' &&
          expression !== 'gentleman_surprised' &&
          expression !== 'gentleman_normal');

      if (isAbyssOrMad) {
        // Dark Lord in Abyss clicked: REAL synthesized sub-bass double-thump heartbeat sound
        audioSynth.playHeartbeat(1.3);
        setIsHeartbeating(true);
        setTimeout(() => setIsHeartbeating(false), 1200);
        setClickReaction({
          text:
            language === 'fr'
              ? '♥ (un battement sourd résonne dans le vide) ♥'
              : '♥ (a deep heartbeat echoes from the void) ♥',
          emoji: '🖤',
        });
      } else {
        // Reformed Mélo Clown clicked: Whimsical musical notes flourish & floating notes animation
        audioSynth.playClownMusicalNote();
        const noteSymbols = ['🎵', '🎶', '♩', '♫', '🎼', '✨'];
        const newNotes = Array.from({ length: 6 }).map((_, i) => ({
          id: Date.now() + i,
          symbol: noteSymbols[i % noteSymbols.length],
          left: 20 + Math.random() * 60,
          top: 30 + Math.random() * 35,
          delay: i * 110,
        }));
        setFloatingNotes(newNotes);
        setTimeout(() => setFloatingNotes([]), 2600);
        setClickReaction({
          text:
            language === 'fr'
              ? '♪ Tra-la-la ! Une mélodie enchanteresse ! 🎩✨'
              : '♪ Tra-la-la! A whimsical melody! 🎩✨',
          emoji: '🎶',
        });
      }
    } else {
      audioSynth.playSoundEffect('magic_sparkle');
      setClickReaction({ text: '✨', emoji: '🌟' });
    }
    setTimeout(() => setClickReaction(null), 1800);
  };

  // Character-specific breathing animations for living, organic presence
  const getCharacterBreatheClass = () => {
    switch (characterId) {
      case 'orik':
        return 'animate-orik-breathe';
      case 'artisan':
        return 'animate-vivienne-breathe';
      case 'lezar':
        return 'animate-lezar-breathe';
      case 'hypo':
        return 'animate-hypo-breathe';
      case 'clown':
        return 'animate-clown-breathe';
      case 'witch':
      case 'human_witch':
      default:
        return 'animate-character-breathe';
    }
  };

  const characterBreatheClass = getCharacterBreatheClass();

  // Subtle natural breathe animation during silence/idle pauses, or gentle speaking bob during dialogue
  const portraitMovementClass = isSecondary
    ? characterBreatheClass
    : isSpeaking
    ? 'animate-speaking-bob'
    : characterBreatheClass;

  return (
    <div
      ref={portraitRef}
      onClick={handleCharacterClick}
      data-character={characterId}
      data-interactive={characterId === 'witch' || characterId === 'human_witch' ? 'witch' : 'character'}
      className={`relative flex items-end justify-center transition-all duration-500 select-none cursor-pointer hover:scale-[1.02] ${
        isSecondary
          ? 'scale-75 opacity-80 -translate-x-4 pointer-events-none'
          : `scale-100 opacity-100 z-10 ${portraitMovementClass}`
      } ${className}`}
    >
      {/* Soft Sigh of Relief Exhalation Sparkles */}
      {isSoftSighing && (
        <div className="absolute -top-6 inset-x-0 z-40 pointer-events-none flex flex-col items-center animate-fade-in">
          <div className="px-3 py-1 rounded-full bg-amber-950/90 border border-amber-400/70 text-amber-200 text-xs font-serif shadow-xl flex items-center gap-1.5 animate-bounce">
            <span>✨</span>
            <span className="italic font-medium">~ *A quiet sigh of relief* ~</span>
            <span>🌿</span>
          </div>
          <div className="flex gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
            <span className="w-1 h-1 rounded-full bg-amber-200 animate-pulse [animation-delay:200ms]" />
          </div>
        </div>
      )}

      {/* Floating Character Click Popup */}
      {clickReaction && (
        <div className="absolute -top-3 sm:-top-1 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce px-3 py-1.5 rounded-full bg-slate-950/95 text-amber-200 border-2 border-amber-400/80 text-xs sm:text-sm font-serif shadow-2xl flex items-center gap-1.5 max-w-[92vw] whitespace-nowrap">
          <span>{clickReaction.emoji}</span>
          <span className="font-semibold tracking-wide drop-shadow-sm">{clickReaction.text}</span>
        </div>
      )}

      {/* Mélo Clown Whimsical Floating Musical Notes Animation */}
      {floatingNotes.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
          {floatingNotes.map((note) => (
            <span
              key={note.id}
              className="absolute text-xl sm:text-2xl text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-bounce font-serif"
              style={{
                left: `${note.left}%`,
                top: `${note.top}%`,
                animationDuration: '1.4s',
                animationDelay: `${note.delay}ms`,
                transition: 'all 2s ease-out',
                transform: 'translateY(-30px) scale(1.15)',
              }}
            >
              {note.symbol}
            </span>
          ))}
        </div>
      )}

      {/* Interactive GBear Heart & Sparkle Particle Burst */}
      {gbearHearts.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
          {gbearHearts.map((heart) => (
            <span
              key={heart.id}
              className="absolute text-xl sm:text-2xl text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-bounce font-serif select-none"
              style={{
                left: `${heart.left}%`,
                top: `${heart.top}%`,
                animationDuration: '1.2s',
                animationDelay: `${heart.delay}ms`,
                transition: 'all 1.8s ease-out',
                transform: 'translateY(-36px) scale(1.2)',
              }}
            >
              {heart.symbol}
            </span>
          ))}
        </div>
      )}

      {/* Interactive GBear Tiny Golden Star Particle System */}
      {gbearStars.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
          {gbearStars.map((star) => (
            <span
              key={star.id}
              className="absolute inline-block animate-gbear-star-emit font-serif select-none pointer-events-none"
              style={
                {
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  fontSize: `${star.size}px`,
                  color: star.color,
                  textShadow: `0 0 6px ${star.color}, 0 0 12px #fbbf24`,
                  '--star-dx': `${star.dx}px`,
                  '--star-dy': `${star.dy}px`,
                  '--star-delay': `${star.delay}ms`,
                  '--star-duration': `${star.duration}ms`,
                  '--star-rot-start': `${star.rotStart}deg`,
                  '--star-rot-end': `${star.rotEnd}deg`,
                } as React.CSSProperties
              }
            >
              {star.symbol}
            </span>
          ))}
        </div>
      )}

      {/* Dark Lord Heartbeat Void Pulse Visual */}
      {isHeartbeating && (
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border-2 border-purple-500/60 bg-purple-950/20 animate-ping" />
          <div className="w-32 h-32 rounded-full border border-red-500/40 bg-red-950/20 animate-pulse absolute" />
        </div>
      )}

      {/* WITCH PORTRAIT (MAGICAL) - REFINED ANATOMICAL PROPORTIONS & GRACEFUL POSTURE */}
      {characterId === 'witch' && (
        <div className="relative w-44 h-60 sm:w-56 sm:h-76 md:w-64 md:h-84 max-h-[38vh] sm:max-h-[44vh] flex items-end justify-center drop-shadow-2xl">
          <svg viewBox="0 0 300 400" className="w-full h-full max-h-full object-contain">
            <defs>
              <linearGradient id="witchCloakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3d5a49" />
                <stop offset="40%" stopColor="#2e4235" />
                <stop offset="85%" stopColor="#1e2c24" />
                <stop offset="100%" stopColor="#131d17" />
              </linearGradient>
              <linearGradient id="witchRobeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="60%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="witchHair" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#451a03" />
                <stop offset="50%" stopColor="#292524" />
                <stop offset="100%" stopColor="#1c1917" />
              </linearGradient>
              <radialGradient id="lanternPulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="25%" stopColor="#fef08a" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="lanternGlowAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fde047" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>

            {/* Glowing Celestial Ambient Aura */}
            <circle cx="150" cy="180" r="115" fill="#fef08a" opacity="0.1" />

            {/* 1. BACK HAIR (Silky cascading waves framing shoulders) */}
            <path
              d="M92 145 C72 195, 78 260, 96 300 C114 315, 138 310, 150 306 C162 310, 186 315, 204 300 C222 260, 228 195, 208 145 Z"
              fill="url(#witchHair)"
            />

            {/* 2. SLENDER NECK */}
            <path d="M142 196 L142 226 L158 226 L158 196 Z" fill="#fed7aa" />

            {/* 3. UNDER ROBE & FLOWING CLOAK (Graceful flared silhouette) */}
            {/* Inner Robe Skirt */}
            <path
              d="M120 270 C140 274, 160 274, 180 270 L220 400 L80 400 Z"
              fill="url(#witchRobeGrad)"
            />
            {/* Outer Moss Emerald Cloak Folds */}
            <path
              d="M96 226 C75 245, 62 310, 58 400 L95 400 C100 320, 115 275, 122 268 Z"
              fill="url(#witchCloakGrad)"
            />
            <path
              d="M204 226 C225 245, 238 310, 242 400 L205 400 C200 320, 185 275, 178 268 Z"
              fill="url(#witchCloakGrad)"
            />
            {/* Cloak Hem Golden Rune Embroidery */}
            <g opacity="0.45" stroke="#fbbf24" strokeWidth="1" fill="none">
              <path d="M66 392 Q80 388 94 392" />
              <path d="M206 392 Q220 388 234 392" />
              <circle cx="80" cy="390" r="1.5" fill="#fbbf24" />
              <circle cx="220" cy="390" r="1.5" fill="#fbbf24" />
            </g>

            {/* 4. FITTED WAIST & BODICE */}
            <path
              d="M112 226 C112 226, 118 270, 122 272 C138 276, 162 276, 178 272 C182 270, 188 226, 188 226 Z"
              fill="url(#witchRobeGrad)"
              stroke="#1e293b"
              strokeWidth="1"
            />
            {/* Bodice Golden Lace Details */}
            <path d="M142 238 L158 248" stroke="#fbbf24" strokeWidth="1.2" opacity="0.6" />
            <path d="M158 238 L142 248" stroke="#fbbf24" strokeWidth="1.2" opacity="0.6" />
            <path d="M142 252 L158 262" stroke="#fbbf24" strokeWidth="1.2" opacity="0.6" />
            <path d="M158 252 L142 262" stroke="#fbbf24" strokeWidth="1.2" opacity="0.6" />

            {/* 5. COZY SLATE COWL / SCARF */}
            <path
              d="M116 216 C116 208, 140 204, 150 204 C160 204, 184 208, 184 216 C184 228, 168 236, 150 236 C132 236, 116 228, 116 216 Z"
              fill="#475569"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <path
              d="M136 222 C142 236, 146 250, 144 264 L156 264 C156 250, 154 236, 148 222 Z"
              fill="#334155"
              opacity="0.85"
            />
            {/* Scarf Golden Sun Clasp */}
            <circle cx="150" cy="226" r="4.5" fill="url(#brassGrad)" stroke="#78350f" strokeWidth="1" />
            <circle cx="150" cy="226" r="1.5" fill="#fef08a" />

            {/* Optional SWTW Pin on Scarf/Cloak */}
            {showSwwPin && (
              <g transform="translate(162, 230)" className="animate-glint-flash">
                <circle cx="0" cy="0" r="7.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
                <text x="0" y="2.2" fontSize="4.2" fontWeight="bold" fill="#78350f" textAnchor="middle" fontFamily="serif" letterSpacing="0.4">SWTW</text>
              </g>
            )}

            {/* 6. SHOULDERS & ARMS */}
            {/* Left Puff Shoulder & Sleeve */}
            <path
              d="M114 224 C96 224, 84 236, 86 250 C88 262, 102 266, 112 258 C118 248, 118 234, 114 224 Z"
              fill="url(#witchCloakGrad)"
              stroke="#1e2c24"
              strokeWidth="1"
            />
            {/* Right Puff Shoulder & Sleeve (Holding Sun Lantern chain) */}
            <path
              d="M186 224 C204 224, 214 236, 212 250 C210 262, 198 266, 188 258 C182 248, 182 234, 186 224 Z"
              fill="url(#witchCloakGrad)"
              stroke="#1e2c24"
              strokeWidth="1"
            />

            {/* Left Arm & Forearm (Holding wand gracefully in front) */}
            <path d="M96 248 Q84 262 94 242" stroke="url(#witchCloakGrad)" strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d="M92 256 Q88 245 96 236" stroke="#fed7aa" strokeWidth="7.5" strokeLinecap="round" fill="none" />
            {/* Sleeve cuff with gold hem */}
            <line x1="88" y1="248" x2="96" y2="242" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />

            {/* Right Forearm (Holding Sun Lantern chain naturally on right side) */}
            <path d="M202 256 Q208 280 192 292" stroke="#fed7aa" strokeWidth="7.5" strokeLinecap="round" fill="none" />
            <ellipse cx="192" cy="292" rx="5" ry="4" fill="#fed7aa" />

            {/* 7. FACE & HEAD */}
            <ellipse cx="150" cy="168" rx="34" ry="40" fill="#fed7aa" />

            {/* Rosy Cheeks */}
            <ellipse cx="128" cy="180" rx="5.5" ry="3.5" fill="#fca5a5" opacity="0.45" />
            <ellipse cx="172" cy="180" rx="5.5" ry="3.5" fill="#fca5a5" opacity="0.45" />

            {/* Front Bangs & Side Locks */}
            <path d="M112 148 Q145 130 188 148 Q162 176 112 148 Z" fill="url(#witchHair)" />
            <path d="M116 150 Q106 185 118 210 Q112 185 120 152 Z" fill="url(#witchHair)" opacity="0.8" />
            <path d="M184 150 Q194 185 182 210 Q188 185 180 152 Z" fill="url(#witchHair)" opacity="0.8" />

            {/* Eyes (Light Green) based on expression with natural blink animation & cursor tracking */}
            {expression === 'overwhelmed' || expression === 'burdened' ? (
              <g stroke="#047857" strokeWidth="2.5" fill="none" strokeLinecap="round">
                <path d="M130 166 Q138 172 144 166" />
                <path d="M156 166 Q162 172 170 166" />
              </g>
            ) : expression === 'peaceful' || expression === 'relieved' ? (
              <g stroke="#047857" strokeWidth="2.5" fill="none" strokeLinecap="round">
                <path d="M130 168 Q138 160 144 168" />
                <path d="M156 168 Q162 160 170 168" />
              </g>
            ) : (
              <g className="animate-eye-blink">
                <g style={{ transform: `translate(${eyeTrackingOffset.x}px, ${eyeTrackingOffset.y}px)`, transition: 'transform 0.12s ease-out' }}>
                  <ellipse cx="137" cy="166" rx="4.5" ry="5.8" fill="#10b981" />
                  <ellipse cx="163" cy="166" rx="4.5" ry="5.8" fill="#10b981" />
                  <ellipse cx="137" cy="166" rx="2.5" ry="3.5" fill="#064e3b" />
                  <ellipse cx="163" cy="166" rx="2.5" ry="3.5" fill="#064e3b" />
                  <circle cx="138.5" cy="164" r="1.5" fill="#ecfdf5" />
                  <circle cx="164.5" cy="164" r="1.5" fill="#ecfdf5" />
                </g>
              </g>
            )}

            {/* The Witch's Wireframe Eyeglasses */}
            <g id="witch-eyeglasses">
              {/* Left Lens Frame */}
              <ellipse cx="137" cy="166" rx="10" ry="9.5" fill="#fef9c3" fillOpacity="0.08" stroke="#78350f" strokeWidth="1.6" />
              {/* Right Lens Frame */}
              <ellipse cx="163" cy="166" rx="10" ry="9.5" fill="#fef9c3" fillOpacity="0.08" stroke="#78350f" strokeWidth="1.6" />
              {/* Bridge over Nose */}
              <path d="M147 165 Q150 162 153 165" stroke="#78350f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              {/* Left Temple Arm */}
              <line x1="127" y1="166" x2="116" y2="162" stroke="#78350f" strokeWidth="1.4" strokeLinecap="round" />
              {/* Right Temple Arm */}
              <line x1="173" y1="166" x2="184" y2="162" stroke="#78350f" strokeWidth="1.4" strokeLinecap="round" />
              {/* Glass Specular Highlights */}
              <path d="M131 161 Q136 159 141 162" stroke="#ffffff" strokeWidth="0.9" opacity="0.75" fill="none" strokeLinecap="round" className="animate-glint-flash" />
              <path d="M157 161 Q162 159 167 162" stroke="#ffffff" strokeWidth="0.9" opacity="0.75" fill="none" strokeLinecap="round" className="animate-glint-flash" />
            </g>

            {/* Eyebrows */}
            {expression === 'burdened' || expression === 'overwhelmed' ? (
              <g stroke="#57534e" strokeWidth="2" strokeLinecap="round" fill="none">
                <path d="M128 156 Q136 153 144 158" />
                <path d="M156 158 Q164 153 172 156" />
              </g>
            ) : expression === 'determined' ? (
              <g stroke="#57534e" strokeWidth="2" strokeLinecap="round" fill="none">
                <path d="M128 158 Q136 160 144 154" />
                <path d="M156 154 Q164 160 172 158" />
              </g>
            ) : (
              <g stroke="#57534e" strokeWidth="1.8" strokeLinecap="round" fill="none">
                <path d="M128 156 Q136 152 144 155" />
                <path d="M156 155 Q164 152 172 156" />
              </g>
            )}

            {/* Nose */}
            <path d="M149 173 Q150 177 152 177" stroke="#e0a97b" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Mouth */}
            {expression === 'gentle' || expression === 'peaceful' || expression === 'relieved' || expression === 'happy' ? (
              <path d="M143 188 Q150 194 157 188" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" fill="none" />
            ) : expression === 'overwhelmed' ? (
              <path d="M145 190 Q150 186 155 190" stroke="#9f1239" strokeWidth="2" strokeLinecap="round" fill="none" />
            ) : (
              <line x1="145" y1="189" x2="155" y2="189" stroke="#be123c" strokeWidth="2" strokeLinecap="round" />
            )}

            {/* 8. WITCH HAT (Swaying gently in the breeze) */}
            <g className="animate-hat-sway">
              <path d="M68 142 Q150 118 232 142 Q150 132 68 142 Z" fill="#1c1917" />
              <polygon points="108,138 192,138 170,38 145,18 140,52" fill="#1c1917" />
              {/* Hat Ribbon */}
              <path d="M107 136 Q150 126 193 136 L190 126 Q150 118 110 126 Z" fill="#2e4235" />
              {/* Lavender twig pinned to hat */}
              <line x1="128" y1="132" x2="155" y2="102" stroke="#15803d" strokeWidth="2" />
              <circle cx="150" cy="107" r="3" fill="#a855f7" />
              <circle cx="155" cy="102" r="3" fill="#c084fc" />
              {/* Golden Star ornament on hat tip */}
              <circle cx="145" cy="18" r="4" fill="#fef08a" opacity="0.6" className="animate-pulse" />
              <polygon points="145,13 147,17 151,18 148,20 149,24 145,22 141,24 142,20 139,18 143,17" fill="#fbbf24" />
              <circle cx="145" cy="18" r="1.5" fill="#ffffff" className="animate-glint-flash" />
            </g>

            {/* 9. MAGIC WAND IN LEFT HAND (Gentle organic idle swaying when not actively casting) */}
            <g id="witch-hand-and-wand" className="animate-wand-idle-sway origin-[96px_236px]">
              {/* Hand Palm / Base */}
              <ellipse cx="96" cy="236" rx="5.5" ry="4.5" fill="#fed7aa" />

              {/* Wooden Wand Shaft with Gold Spirals Passing Through Grip */}
              <line x1="104" y1="280" x2="76" y2="126" stroke="#78350f" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M102 268 Q98 250 96 236 Q90 200 82 160 Q79 142 76 128" stroke="#d97706" strokeWidth="1.2" fill="none" opacity="0.8" />

              {/* Fingers Curled Around Wand Shaft */}
              <path d="M93 231 Q97 233 100 237" stroke="#fed7aa" strokeWidth="3.4" strokeLinecap="round" fill="none" />
              <path d="M91 235 Q95 237 98 241" stroke="#fed7aa" strokeWidth="3.4" strokeLinecap="round" fill="none" />
              <path d="M89 239 Q93 241 96 245" stroke="#fed7aa" strokeWidth="3.4" strokeLinecap="round" fill="none" />
              {/* Thumb Clasping Front of Wand */}
              <path d="M95 232 Q99 229 102 233" stroke="#fed7aa" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              {/* Delicate Finger Joint Crease Accents */}
              <path d="M96 233 L98 235" stroke="#e0a97b" strokeWidth="1" fill="none" />
              <path d="M94 237 L96 239" stroke="#e0a97b" strokeWidth="1" fill="none" />

              {/* Star Crystal Tip - Glowing Ambient Aura */}
              <circle cx="76" cy="126" r="16" fill="#fef08a" opacity="0.45" className="animate-pulse" />
              <circle cx="76" cy="126" r="26" fill="#c084fc" opacity="0.2" className="animate-ping" />

              {/* 8-Pointed Star Crystal */}
              <polygon
                points="76,113 79,122 88,122 81,129 84,138 76,133 68,138 71,129 64,122 73,122"
                fill="#fbbf24"
                stroke="#f59e0b"
                strokeWidth="1.2"
              />
              <circle cx="76" cy="126" r="2.8" fill="#ffffff" className="animate-glint-flash" />

              {/* Wand sparkles & spellcaster motes */}
              <circle cx="68" cy="116" r="1.8" fill="#fde047" className="animate-ping" />
              <circle cx="86" cy="133" r="1.5" fill="#a7f3d0" className="animate-pulse" />
              <circle cx="66" cy="137" r="1.2" fill="#f472b6" className="animate-pulse" />
            </g>

            {/* 10. HAND-HELD SUN LANTERN (Held gracefully on right side) */}
            <g transform="translate(162, 280)">
              {/* Brass Chain from Hand to Lantern */}
              <line x1="30" y1="12" x2="30" y2="28" stroke="#d97706" strokeWidth="2" strokeDasharray="2 2" />

              {/* Lantern Warm Ambient Glow + Click Sun Flare */}
              <circle cx="30" cy="62" r={isLanternGlowing ? 75 : 45} fill="url(#lanternGlowAura)" className="animate-pulse" />

              {isLanternGlowing && (
                <g>
                  <circle cx="30" cy="62" r="85" fill="#fef08a" opacity="0.35" className="animate-ping" />
                  <circle cx="30" cy="62" r="55" fill="#fbbf24" opacity="0.45" />
                  {/* Radiant solar burst beams */}
                  <g stroke="#fde047" strokeWidth="2" strokeLinecap="round" className="animate-spin-slow origin-center">
                    <line x1="30" y1="18" x2="30" y2="6" />
                    <line x1="30" y1="106" x2="30" y2="118" />
                    <line x1="-14" y1="62" x2="-2" y2="62" />
                    <line x1="62" y1="62" x2="74" y2="62" />
                    <line x1="-2" y1="30" x2="6" y2="38" />
                    <line x1="54" y1="86" x2="62" y2="94" />
                    <line x1="62" y1="30" x2="54" y2="38" />
                    <line x1="6" y1="86" x2="-2" y2="94" />
                  </g>
                </g>
              )}

              {/* Lantern Top Cap & Brass Ring */}
              <path d="M22 28 Q30 22 38 28 L42 34 L18 34 Z" fill="url(#brassGrad)" stroke="#78350f" strokeWidth="1.2" />
              <circle cx="30" cy="24" r="3.5" fill="none" stroke="#fbbf24" strokeWidth="1.5" />

              {/* Glass Housing & Ornate Filigree Frame */}
              <rect x="14" y="34" width="32" height="46" rx="6" fill="#78350f" opacity="0.3" stroke="url(#brassGrad)" strokeWidth="2" />
              {/* Vertical Brass Struts */}
              <line x1="22" y1="34" x2="22" y2="80" stroke="#b45309" strokeWidth="1.2" />
              <line x1="38" y1="34" x2="38" y2="80" stroke="#b45309" strokeWidth="1.2" />

              {/* Glowing Sun Core Inside Lantern */}
              <circle cx="30" cy="57" r="22" fill="url(#lanternPulse)" className="animate-pulse" />
              <circle cx="30" cy="57" r="9" fill="#ffffff" />
              {/* Mini Sun Rays */}
              <g stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" className="animate-spin-slow origin-center">
                <line x1="30" y1="42" x2="30" y2="45" />
                <line x1="30" y1="69" x2="30" y2="72" />
                <line x1="15" y1="57" x2="18" y2="57" />
                <line x1="42" y1="57" x2="45" y2="57" />
              </g>

              {/* Lantern Bottom Base */}
              <path d="M12 80 L48 80 L42 88 L18 88 Z" fill="url(#brassGrad)" stroke="#78350f" strokeWidth="1.2" />
              <circle cx="30" cy="88" r="2" fill="#d97706" />
            </g>
          </svg>
        </div>
      )}

      {/* HUMAN WENDY (POST-SACRIFICE & EPILOGUE) - COHESIVE, ELEGANT PRINCESS & BIRTHDAY OUTFIT */}
      {characterId === 'human_witch' && (
        <div
          className={`relative w-44 h-60 sm:w-56 sm:h-76 md:w-64 md:h-84 max-h-[38vh] sm:max-h-[44vh] flex items-end justify-center drop-shadow-2xl animate-princess-float ${
            expression === 'receiving_gbear' || expression === 'holding_gbear'
              ? 'animate-wendy-shared-glow drop-shadow-[0_0_40px_rgba(251,191,36,0.75)]'
              : ''
          }`}
        >
          {/* Ambient Rising Stardust Motes for Shared Light / GBear Moment */}
          {(expression === 'receiving_gbear' || expression === 'holding_gbear') && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute bottom-16 left-1/4 w-3 h-3 rounded-full bg-amber-300 blur-[1px] animate-stardust-rise-1" />
              <div className="absolute bottom-20 right-1/4 w-2.5 h-2.5 rounded-full bg-yellow-200 blur-[1px] animate-stardust-rise-2" />
              <div className="absolute bottom-10 left-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 blur-[1px] animate-stardust-rise-3" />
              <div className="absolute bottom-24 left-1/3 w-2 h-2 rounded-full bg-rose-300 blur-[1px] animate-stardust-rise-2" />
            </div>
          )}

          <svg viewBox="0 0 300 400" className="w-full h-full max-h-full object-contain">
            <defs>
              <linearGradient id="wendyDressSkirt" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbcfe8" />
                <stop offset="35%" stopColor="#f472b6" />
                <stop offset="75%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#be123c" />
              </linearGradient>
              <linearGradient id="wendyBodice" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fffafb" />
                <stop offset="60%" stopColor="#ffe4e6" />
                <stop offset="100%" stopColor="#fecdd3" />
              </linearGradient>
              <linearGradient id="wendyHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#451a03" />
                <stop offset="65%" stopColor="#292524" />
                <stop offset="100%" stopColor="#1c1917" />
              </linearGradient>
              <linearGradient id="goldPinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <radialGradient id="princessAuraGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={expression === 'receiving_gbear' || expression === 'holding_gbear' ? '#fef08a' : '#fef08a'} stopOpacity={expression === 'receiving_gbear' || expression === 'holding_gbear' ? '0.75' : '0.45'} />
                <stop offset="45%" stopColor={expression === 'receiving_gbear' || expression === 'holding_gbear' ? '#fbbf24' : '#f472b6'} stopOpacity={expression === 'receiving_gbear' || expression === 'holding_gbear' ? '0.45' : '0.25'} />
                <stop offset="75%" stopColor="#c084fc" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              {/* GBear Gradients */}
              <linearGradient id="gbearFurGradWendy" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="45%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
              <linearGradient id="gbearRedShirtWendy" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="35%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
            </defs>

            {/* MAGICAL PRINCESS AURORA / CELESTIAL BACKLIGHT */}
            <ellipse cx="150" cy="210" rx="120" ry="155" fill="url(#princessAuraGrad)" className="animate-princess-aura" />

            {/* Twinkling Fairytale Stardust Motes */}
            <g id="princess-stardust" className="pointer-events-none">
              <circle cx="55" cy="180" r="2.2" fill="#fef08a" className="animate-glint-flash" />
              <circle cx="70" cy="130" r="1.8" fill="#fda4af" className="animate-pulse" />
              <circle cx="245" cy="170" r="2.5" fill="#fef08a" className="animate-glint-flash" />
              <circle cx="230" cy="120" r="1.8" fill="#fbcfe8" className="animate-pulse" />
              <circle cx="95" cy="95" r="2" fill="#ffffff" className="animate-glint-flash" />
              <circle cx="205" cy="95" r="2" fill="#ffffff" className="animate-glint-flash" />
            </g>

            {/* 1. BACK HAIR (Silky cascading waves framing shoulders) */}
            <path
              d="M86 150 C62 205, 68 275, 90 320 C108 335, 138 330, 150 326 C162 330, 192 335, 210 320 C232 275, 238 205, 214 150 Z"
              fill="url(#wendyHairGrad)"
            />
            {/* Silky Hair Strands & Wave Contours */}
            <path d="M78 220 Q70 270 92 315" stroke="#78350f" strokeWidth="2" opacity="0.4" fill="none" strokeLinecap="round" />
            <path d="M222 220 Q230 270 208 315" stroke="#78350f" strokeWidth="2" opacity="0.4" fill="none" strokeLinecap="round" />
            <path d="M96 170 Q84 240 102 300" stroke="#f59e0b" strokeWidth="1.2" opacity="0.25" fill="none" />
            <path d="M204 170 Q216 240 198 300" stroke="#f59e0b" strokeWidth="1.2" opacity="0.25" fill="none" />

            {/* 2. SLENDER NECK */}
            <path d="M141 196 L141 226 L159 226 L159 196 Z" fill="#fed7aa" />

            {/* 3. DRESS SKIRT (Graceful A-Line flaring from natural waist to bottom hem) */}
            <path
              d="M116 274 C138 278, 162 278, 184 274 L236 400 L64 400 Z"
              fill="url(#wendyDressSkirt)"
            />
            {/* Subtle Fabric Fold Shadows */}
            <path d="M136 276 Q128 340 110 400" stroke="#9f1239" strokeWidth="2.5" opacity="0.3" fill="none" />
            <path d="M164 276 Q172 340 190 400" stroke="#9f1239" strokeWidth="2.5" opacity="0.3" fill="none" />
            <path d="M150 277 L150 400" stroke="#9f1239" strokeWidth="1.8" opacity="0.25" fill="none" />

            {/* Embroidered Wildflower Hem Pattern */}
            <g id="skirt-embroidery">
              {/* Golden Buttercups & Rosettes */}
              <circle cx="85" cy="382" r="4" fill="#fef08a" />
              <circle cx="85" cy="382" r="1.8" fill="#f59e0b" />
              <circle cx="115" cy="388" r="4.5" fill="#fda4af" />
              <circle cx="115" cy="388" r="2" fill="#fff" />
              <circle cx="150" cy="384" r="5" fill="#fef08a" />
              <circle cx="150" cy="384" r="2.2" fill="#f59e0b" />
              <circle cx="185" cy="388" r="4.5" fill="#fda4af" />
              <circle cx="185" cy="388" r="2" fill="#fff" />
              <circle cx="215" cy="382" r="4" fill="#fef08a" />
              <circle cx="215" cy="382" r="1.8" fill="#f59e0b" />
              {/* Dainty Leaves */}
              <path d="M96 384 Q100 380 104 384" stroke="#4ade80" strokeWidth="1.5" fill="none" />
              <path d="M130 386 Q135 382 140 386" stroke="#4ade80" strokeWidth="1.5" fill="none" />
              <path d="M160 386 Q165 382 170 386" stroke="#4ade80" strokeWidth="1.5" fill="none" />
              <path d="M196 384 Q200 380 204 384" stroke="#4ade80" strokeWidth="1.5" fill="none" />
            </g>

            {/* 4. FITTED BODICE / VEST */}
            <path
              d="M106 226 C128 220, 172 220, 194 226 L184 274 C162 278, 138 278, 116 274 Z"
              fill="url(#wendyBodice)"
              stroke="#fbcfe8"
              strokeWidth="1.2"
            />
            {/* Heart Warmth Glow Pulsing over Wendy's Chest during Bear Gift */}
            {(expression === 'receiving_gbear' || expression === 'holding_gbear') && (
              <circle cx="150" cy="254" r="18" fill="#fef08a" opacity="0.35" className="animate-wendy-heart-warmth" filter="blur(6px)" />
            )}
            {/* Golden Bodice Buttons */}
            <circle cx="150" cy="242" r="2.2" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
            <circle cx="150" cy="254" r="2.2" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
            <circle cx="150" cy="266" r="2.2" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />

            {/* 5. DELICATE PETER PAN LACE COLLAR & ROSE RIBBON BOW */}
            <ellipse cx="150" cy="224" rx="30" ry="11" fill="#ffffff" stroke="#fbcfe8" strokeWidth="1.2" />
            {/* Scalloped lace hem */}
            <path d="M124 226 Q128 232 134 228 Q140 234 150 230 Q160 234 166 228 Q172 232 176 226" stroke="#f43f5e" strokeWidth="1" fill="none" />
            {/* Pink Satin Ribbon Bow */}
            <polygon points="150,224 140,218 140,230" fill="#e11d48" />
            <polygon points="150,224 160,218 160,230" fill="#e11d48" />
            <circle cx="150" cy="224" r="3.2" fill="#fb7185" />
            <path d="M149 226 Q144 240 138 246 M151 226 Q156 240 162 246" stroke="#e11d48" strokeWidth="1.8" strokeLinecap="round" fill="none" />

            {/* 6. PUFF SLEEVES */}
            {/* Left Puff Sleeve */}
            <path
              d="M108 226 C88 226, 78 238, 80 254 C82 266, 96 270, 108 262 C114 252, 114 236, 108 226 Z"
              fill="#fda4af"
              stroke="#f43f5e"
              strokeWidth="1"
            />
            <ellipse cx="94" cy="260" rx="12" ry="4" fill="#ffffff" opacity="0.9" />

            {/* Right Puff Sleeve */}
            <path
              d="M192 226 C212 226, 222 238, 220 254 C218 266, 204 270, 192 262 C186 252, 186 236, 192 226 Z"
              fill="#fda4af"
              stroke="#f43f5e"
              strokeWidth="1"
            />
            <ellipse cx="206" cy="260" rx="12" ry="4" fill="#ffffff" opacity="0.9" />

            {/* 7. ARMS, HANDS & GBEAR EMBRACE */}
            {expression === 'holding_gbear' ? (
              /* WENDY HOLDING GBEAR SECURELY IN HER TWO HANDS WITH MAGICAL WARMTH */
              <g id="wendy-gbear-held">
                {/* Wendy's Upper Arms descending gracefully from puff sleeves */}
                <path d="M96 248 Q90 274 118 288" stroke="#fed7aa" strokeWidth="9" strokeLinecap="round" fill="none" />
                <path d="M204 248 Q210 274 182 288" stroke="#fed7aa" strokeWidth="9" strokeLinecap="round" fill="none" />

                {/* GBEAR ANCHOR: Hard-locked in SVG coordinates at (150, 274) with zero CSS translation interference */}
                <g id="gbear-wendy-anchor" transform="translate(150, 274)">
                  {/* Interactive & Animated Body: Centered precisely at (0, 0) relative to Wendy's hands */}
                  <g
                    onClick={handleGBearClick}
                    className={`cursor-pointer select-none ${
                      isGBearBouncing
                        ? 'animate-gbear-happy-dance'
                        : isGBearHiding
                        ? 'animate-gbear-hide-peek'
                        : 'animate-gbear-snuggle'
                    }`}
                  >
                    {/* Glowing Golden Honey Aura */}
                    <circle cx="0" cy="0" r="44" fill="#fbbf24" opacity="0.3" className="animate-pulse" filter="blur(8px)" />

                    {/* Plush Drop Shadow onto Wendy's Dress */}
                    <ellipse cx="0" cy="36" rx="26" ry="6" fill="#000000" opacity="0.25" />

                    {/* Chubby Little Teddy Feet Resting Snugly */}
                    <ellipse cx="-15" cy="34" rx="9" ry="6.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.2" />
                    <ellipse cx="-15" cy="33.5" rx="5.5" ry="4" fill="#fef08a" />
                    <ellipse cx="15" cy="34" rx="9" ry="6.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.2" />
                    <ellipse cx="15" cy="33.5" rx="5.5" ry="4" fill="#fef08a" />

                    {/* Plush Round Chubby Body (Pooh proportions) */}
                    <ellipse cx="0" cy="16" rx="26" ry="22" fill="url(#gbearFurGradWendy)" stroke="#ca8a04" strokeWidth="1.2" />
                    {/* Soft Warm Honey Tummy Highlight */}
                    <ellipse cx="0" cy="18" rx="18" ry="15" fill="#fef08a" opacity="0.65" />

                    {/* Cozy Red T-shirt / Vest with sweet stitched seam */}
                    <path d="-21 7 Q0 1 21 7 L18 23 Q0 27 -18 23 Z" fill="url(#gbearRedShirtWendy)" stroke="#991b1b" strokeWidth="1.2" />
                    <path d="-11 4 Q0 10 11 4" stroke="#7f1d1d" strokeWidth="1.2" fill="none" />

                    {/* Round Teddy Bear Ears with Lively Twitches */}
                    <g className="animate-bear-ear-left">
                      <circle cx="-18" cy="-20" r="8.5" fill="url(#gbearFurGradWendy)" stroke="#ca8a04" strokeWidth="1.2" />
                      <circle cx="-18" cy="-20" r="4.5" fill="#fef08a" />
                    </g>
                    <g className="animate-bear-ear-right">
                      <circle cx="18" cy="-20" r="8.5" fill="url(#gbearFurGradWendy)" stroke="#ca8a04" strokeWidth="1.2" />
                      <circle cx="18" cy="-20" r="4.5" fill="#fef08a" />
                    </g>

                    {/* Round Teddy Head */}
                    <ellipse cx="0" cy="-9" rx="23" ry="20" fill="url(#gbearFurGradWendy)" stroke="#ca8a04" strokeWidth="1.2" />

                    {/* Round Muzzle / Snout */}
                    <ellipse cx="0" cy="-4" rx="11.5" ry="9" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />

                    {/* Cute Black Button Nose with Sheen */}
                    <ellipse cx="0" cy="-7" rx="3.5" ry="2.6" fill="#18181b" />
                    <circle cx="-1" cy="-8" r="0.9" fill="#ffffff" />

                    {/* Stitched Teddy Smile */}
                    <path d="M0 -4.5 L0 -1.5" stroke="#78350f" strokeWidth="1.2" />
                    <path d="M-6 -2 Q0 2.5 6 -2" stroke="#78350f" strokeWidth="1.4" strokeLinecap="round" fill="none" />

                    {/* Soft Rosy Cheeks */}
                    <ellipse cx="-14" cy="-4" rx="3.8" ry="2.8" fill="#fb7185" opacity="0.75" />
                    <ellipse cx="14" cy="-4" rx="3.8" ry="2.8" fill="#fb7185" opacity="0.75" />

                    {/* Sparkling Dark Button Eyes with Randomized Alive setTimeout Blinking */}
                    {isGBearBlinking ? (
                      <g>
                        <path d="M-11 -12 Q-8.5 -9.5 -6 -12" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                        <path d="M6 -12 Q8.5 -9.5 11 -12" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                      </g>
                    ) : (
                      <g className="animate-bear-blink">
                        <circle cx="-8.5" cy="-12" r="2.8" fill="#0f172a" />
                        <circle cx="-7.5" cy="-13" r="0.9" fill="#ffffff" />
                        <circle cx="8.5" cy="-12" r="2.8" fill="#0f172a" />
                        <circle cx="9.5" cy="-13" r="0.9" fill="#ffffff" />
                      </g>
                    )}

                    {/* Bear's Cute Stubby Paws Cuddling the Glowing Sun Spark */}
                    <ellipse cx="-14" cy="16" rx="6.8" ry="5.8" fill="url(#gbearFurGradWendy)" stroke="#ca8a04" strokeWidth="1" />
                    <ellipse cx="14" cy="16" rx="6.8" ry="5.8" fill="url(#gbearFurGradWendy)" stroke="#ca8a04" strokeWidth="1" />

                    {/* Glowing Sun Spark / Starlight Gem between GBear's Paws */}
                    <g transform="translate(0, 16)">
                      <circle cx="0" cy="0" r="11" fill="#fbbf24" opacity="0.65" className="animate-pulse" filter="blur(3px)" />
                      <circle cx="0" cy="0" r="6" fill="#fef08a" className="animate-pulse" />
                      <polygon points="0,-8 2.2,-2.2 8,0 2.2,2.2 0,8 -2.2,2.2 -8,0 -2.2,-2.2" fill="#ffffff" className="animate-spin-slow" />
                    </g>

                    {/* Persistent magical sparkles orbiting GBear */}
                    <circle cx="-30" cy="-20" r="1.4" fill="#fef08a" className="animate-ping" />
                    <circle cx="30" cy="-14" r="1.6" fill="#fde047" className="animate-glint-flash" />
                    <polygon points="24,30 25.5,33 28.5,33.5 26.5,35.5 27,38.5 24,37 21,38.5 21.5,35.5 19.5,33.5 22.5,33" fill="#fde047" className="animate-pulse" />
                  </g>
                </g>

                {/* WENDY'S TWO GENTLE HANDS & FOREARMS WRAPPING AROUND AND HOLDING GBEAR */}
                {/* Wendy's Left Hand resting lovingly on the left side of GBear */}
                <g>
                  <path d="M96 250 Q96 280 120 288" stroke="#fed7aa" strokeWidth="8" strokeLinecap="round" fill="none" />
                  <ellipse cx="120" cy="288" rx="9" ry="7" fill="#fed7aa" stroke="#fbcfe8" strokeWidth="0.8" transform="rotate(22 120 288)" />
                  {/* Delicate Finger Contours */}
                  <path d="M122 284 Q127 286 126 290" stroke="#f472b6" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
                  <path d="M120 288 Q125 291 123 294" stroke="#f472b6" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
                </g>

                {/* Wendy's Right Hand resting lovingly on the right side of GBear */}
                <g>
                  <path d="M204 250 Q204 280 180 288" stroke="#fed7aa" strokeWidth="8" strokeLinecap="round" fill="none" />
                  <ellipse cx="180" cy="288" rx="9" ry="7" fill="#fed7aa" stroke="#fbcfe8" strokeWidth="0.8" transform="rotate(-22 180 288)" />
                  {/* Delicate Finger Contours */}
                  <path d="M178 284 Q173 286 174 290" stroke="#f472b6" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
                  <path d="M180 288 Q175 291 177 294" stroke="#f472b6" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
                </g>

                {/* Gentle under-cradle support arc */}
                <path d="M120 292 Q150 310 180 292" stroke="#fed7aa" strokeWidth="4" strokeLinecap="round" opacity="0.8" fill="none" />
              </g>
            ) : expression === 'receiving_gbear' ? (
              /* WENDY OPENING HER HANDS WITH GLOWING WONDER & RECEPTIVITY */
              <g>
                {/* Graceful Arms Reaching Forward */}
                <path d="M92 262 Q90 282 120 292" stroke="#fed7aa" strokeWidth="9" strokeLinecap="round" fill="none" />
                <path d="M208 262 Q210 282 180 292" stroke="#fed7aa" strokeWidth="9" strokeLinecap="round" fill="none" />
                {/* Cupped open hands waiting to receive */}
                <ellipse cx="126" cy="292" rx="8" ry="6" fill="#fed7aa" transform="rotate(-15 126 292)" />
                <ellipse cx="174" cy="292" rx="8" ry="6" fill="#fed7aa" transform="rotate(15 174 292)" />
                {/* Glowing Shared Light Sparkle in Wendy's Palms */}
                <g transform="translate(150, 290)">
                  <circle cx="0" cy="0" r="14" fill="#fde047" opacity="0.4" className="animate-pulse" filter="blur(4px)" />
                  <polygon points="0,-8 2.5,-2.5 8,0 2.5,2.5 0,8 -2.5,2.5 -8,0 -2.5,-2.5" fill="#ffffff" className="animate-spin-slow" />
                  <circle cx="0" cy="0" r="3" fill="#f59e0b" />
                </g>
              </g>
            ) : (
              /* Standard clasped hands */
              <g>
                <path d="M92 262 Q88 290 112 305" stroke="#fed7aa" strokeWidth="9" strokeLinecap="round" fill="none" />
                <path d="M208 262 Q212 290 188 305" stroke="#fed7aa" strokeWidth="9" strokeLinecap="round" fill="none" />
                <ellipse cx="140" cy="305" rx="7" ry="5" fill="#fed7aa" />
                <ellipse cx="160" cy="305" rx="7" ry="5" fill="#fed7aa" />
              </g>
            )}

            {/* 7. SOFT OVAL FACE */}
            <ellipse cx="150" cy="170" rx="36" ry="42" fill="#fed7aa" />

            {/* 8. FRONT BANGS, SILKY HAIR STRANDS & SWEET HIGHLIGHTS */}
            <path
              d="M110 144 C134 122, 166 122, 190 144 C170 174, 142 176, 110 144 Z"
              fill="url(#wendyHairGrad)"
            />
            {/* Soft, graceful sweeping bangs */}
            <path d="M126 138 Q142 156 160 144" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
            <path d="M140 132 Q156 150 178 140" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35" />
            {/* Soft cheek-framing tendrils */}
            <path d="M112 148 Q104 185 116 214" stroke="url(#wendyHairGrad)" strokeWidth="6.5" strokeLinecap="round" fill="none" />
            <path d="M188 148 Q196 185 184 214" stroke="url(#wendyHairGrad)" strokeWidth="6.5" strokeLinecap="round" fill="none" />
            <path d="M111 160 Q105 190 115 210" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
            <path d="M189 160 Q195 190 185 210" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />

            {/* PRINCESS FLORAL DIADEM / HEADBAND */}
            <g id="princess-tiara">
              <path d="M118 142 Q150 130 182 142" stroke="#fbbf24" strokeWidth="2" fill="none" />
              {/* Gemstone blossoms & pearls */}
              <circle cx="150" cy="133" r="3.5" fill="#f43f5e" stroke="#fbbf24" strokeWidth="1" />
              <circle cx="150" cy="133" r="1.5" fill="#ffffff" />
              <circle cx="134" cy="137" r="2.5" fill="#fef08a" />
              <circle cx="166" cy="137" r="2.5" fill="#fef08a" />
              <circle cx="122" cy="142" r="2" fill="#fda4af" />
              <circle cx="178" cy="142" r="2" fill="#fda4af" />
            </g>

            {/* 9. THE GOLDEN SWTW HAIRPIN / CELESTIAL PIN (Only when received from Mélo Clown) */}
            {showSwwPin && (
              <g id="wendy-sww-pin" className="animate-glint-flash">
                {/* Outer Warm Golden Aura */}
                <circle cx="189" cy="142" r="16" fill="#fef08a" opacity="0.6" className="animate-pulse" filter="blur(2px)" />
                <circle cx="189" cy="142" r="12" fill="#fbbf24" opacity="0.5" />
                {/* Gold Bar Pin with Rich Opacity & Crisp Borders */}
                <rect x="169" y="131" width="40" height="20" rx="5" fill="url(#goldPinGrad)" stroke="#78350f" strokeWidth="1.6" opacity="1" />
                <rect x="171" y="133" width="36" height="16" rx="3.5" fill="#fde047" stroke="#b45309" strokeWidth="0.8" opacity="0.95" />
                {/* Engraved Bold SWTW Lettering */}
                <text x="189" y="145" fontSize="8" fontWeight="900" fontFamily="serif" fill="#78350f" textAnchor="middle" letterSpacing="0.8">
                  SWTW
                </text>
                {/* Sparkling Starlight Ornament on Pin Corner */}
                <polygon points="208,126 210.5,132 216,133.5 211.5,137 213,143 208,139.5 203,143 204.5,137 200,133.5 205.5,132" fill="#ffffff" stroke="#f59e0b" strokeWidth="1" />
                <circle cx="208" cy="135" r="2" fill="#ffffff" />
              </g>
            )}

            {/* 10. LIGHT GREEN EYES (Bright, gentle, emerald sparkle with natural eye blink & cursor tracking) */}
            <g className="animate-eye-blink">
              <g style={{ transform: `translate(${eyeTrackingOffset.x}px, ${eyeTrackingOffset.y}px)`, transition: 'transform 0.12s ease-out' }}>
                <ellipse cx="137" cy="168" rx={expression === 'receiving_gbear' ? 5.2 : 4.8} ry={expression === 'receiving_gbear' ? 6.8 : 6.2} fill="#10b981" />
                <ellipse cx="163" cy="168" rx={expression === 'receiving_gbear' ? 5.2 : 4.8} ry={expression === 'receiving_gbear' ? 6.8 : 6.2} fill="#10b981" />
                <ellipse cx="137" cy="168" rx="2.6" ry="3.8" fill="#064e3b" />
                <ellipse cx="163" cy="168" rx="2.6" ry="3.8" fill="#064e3b" />
                <circle cx="138.5" cy="165.5" r={expression === 'receiving_gbear' || expression === 'holding_gbear' ? 2.5 : 2} fill="#ffffff" />
                <circle cx="164.5" cy="165.5" r={expression === 'receiving_gbear' || expression === 'holding_gbear' ? 2.5 : 2} fill="#ffffff" />
                <circle cx="140" cy="170" r="1" fill="#a7f3d0" />
                <circle cx="166" cy="170" r="1" fill="#a7f3d0" />
                {/* Additional Starlight Sparkle in Eyes when Receiving GBear */}
                {(expression === 'receiving_gbear' || expression === 'holding_gbear') && (
                  <>
                    <circle cx="135.5" cy="169" r="0.9" fill="#fef08a" />
                    <circle cx="161.5" cy="169" r="0.9" fill="#fef08a" />
                  </>
                )}
              </g>
            </g>

            {/* 11. SOFT ROSY CHEEKS - Warm emotional flush & blush on click */}
            <ellipse
              cx="126"
              cy="178"
              rx={expression === 'receiving_gbear' || expression === 'holding_gbear' || isWendyBlushing ? 10.5 : 8}
              ry={expression === 'receiving_gbear' || expression === 'holding_gbear' || isWendyBlushing ? 7 : 5}
              fill="#f43f5e"
              opacity={isWendyBlushing ? 0.8 : (expression === 'receiving_gbear' || expression === 'holding_gbear' ? 0.48 : 0.3)}
            />
            <ellipse
              cx="174"
              cy="178"
              rx={expression === 'receiving_gbear' || expression === 'holding_gbear' || isWendyBlushing ? 10.5 : 8}
              ry={expression === 'receiving_gbear' || expression === 'holding_gbear' || isWendyBlushing ? 7 : 5}
              fill="#f43f5e"
              opacity={isWendyBlushing ? 0.8 : (expression === 'receiving_gbear' || expression === 'holding_gbear' ? 0.48 : 0.3)}
            />
            {isWendyBlushing && (
              <g className="animate-bounce font-serif text-pink-500">
                <text x="110" y="170" fontSize="12">🌸</text>
                <text x="175" y="170" fontSize="12">✨</text>
              </g>
            )}

            {/* 12. EYEBROWS */}
            <g stroke="#57534e" strokeWidth="2" strokeLinecap="round" fill="none">
              {expression === 'receiving_gbear' ? (
                /* Soft surprised/touched lifted arches */
                <>
                  <path d="M127 154 Q136 148 145 153" />
                  <path d="M155 153 Q164 148 173 154" />
                </>
              ) : (
                <>
                  <path d="M128 156 Q136 151 144 155" />
                  <path d="M156 155 Q164 151 172 156" />
                </>
              )}
            </g>

            {/* 13. RADIANT, WARM PRINCESS SMILE */}
            {expression === 'receiving_gbear' ? (
              /* Soft 'ooh' touched smile */
              <ellipse cx="150" cy="192" rx="4.5" ry="3.5" fill="#e11d48" opacity="0.9" />
            ) : expression === 'holding_gbear' ? (
              /* Deep, tender joyful smile */
              <path d="M136 188 Q150 204 164 188" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" fill="none" />
            ) : (
              <path d="M138 190 Q150 202 162 190" stroke="#e11d48" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            )}
          </svg>
        </div>
      )}

      {/* LEZAR THE TONKINESE CAT (Interactive: Click to Meow!) - ULTRA FLUFFY & PLUSH */}
      {characterId === 'lezar' && (
        <div
          className="relative w-56 h-68 sm:w-64 sm:h-76 flex items-end justify-center drop-shadow-2xl cursor-pointer hover:scale-105 transition-transform"
          title="Click Lezar to hear him meow!"
        >
          <svg viewBox="0 0 240 300" className="w-full h-full">
            <defs>
              <linearGradient id="lezarBody" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ded1c1" />
                <stop offset="40%" stopColor="#c2b09a" />
                <stop offset="75%" stopColor="#968069" />
                <stop offset="100%" stopColor="#5c4837" />
              </linearGradient>
              <linearGradient id="lezarFluffLight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#fdfbf7" />
                <stop offset="100%" stopColor="#ede3d5" />
              </linearGradient>
              <radialGradient id="catEyeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="40%" stopColor="#38bdf8" />
                <stop offset="75%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </radialGradient>
              <radialGradient id="lezarFamiliarGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#818cf8" stopOpacity="0.25" />
                <stop offset="85%" stopColor="#fef08a" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Magical Familiar Soft Glow Aura */}
            <ellipse cx="120" cy="180" rx="108" ry="112" fill="url(#lezarFamiliarGlow)" className="animate-familiar-glow" />
            <circle cx="45" cy="140" r="1.8" fill="#38bdf8" className="animate-ping" />
            <circle cx="195" cy="125" r="2" fill="#fde047" className="animate-pulse" />
            <circle cx="175" cy="225" r="1.5" fill="#a78bfa" className="animate-pulse" />
            <circle cx="35" cy="210" r="1.2" fill="#fef08a" className="animate-pulse" />

            {/* Extra Fluffy Plumed Tail with Gentle Swaying Animation */}
            <g className="animate-cat-tail">
              {/* Back Fluff Layer */}
              <path
                d="M58 280 C26 240, 16 182, 34 146 C42 136, 52 144, 48 156 C36 180, 40 202, 54 218 C44 232, 50 252, 74 270 Z"
                fill="#3d2c1e"
                opacity="0.9"
              />
              {/* Soft Scalloped Fur Outlines along Tail Plume */}
              <path
                d="M60 274 C30 236, 20 185, 36 150 C44 140, 52 146, 50 156 C40 178, 44 198, 56 214 C48 226, 54 246, 76 264 Z"
                fill="#4a3728"
              />
              <path d="M36 160 Q44 165 42 176" stroke="#695340" strokeWidth="1.2" fill="none" opacity="0.6" />
              <path d="M42 188 Q50 194 48 206" stroke="#695340" strokeWidth="1.2" fill="none" opacity="0.6" />
              <path d="M50 220 Q58 226 56 238" stroke="#695340" strokeWidth="1.2" fill="none" opacity="0.6" />
            </g>

            {/* Cat Body & Fluffy Silhouette with Gentle Breathing Animation */}
            <g className="animate-cat-breathe">
              {/* Fluffy Rounded Body Backing */}
              <path
                d="M62 300 C58 270, 68 220, 88 190 C100 172, 140 172, 152 190 C172 220, 182 270, 178 300 Z"
                fill="url(#lezarBody)"
              />

              {/* Fluffy Hip & Side Fur Tufts */}
              <path d="M64 260 Q52 268 62 276 Q54 284 66 292" stroke="#5c4837" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
              <path d="M176 260 Q188 268 178 276 Q186 284 174 292" stroke="#5c4837" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />

              {/* Extra Fluffy Layered Chest Ruff (Bib) */}
              {/* Outer Cream Mane */}
              <path
                d="M82 184 C76 208, 66 230, 82 250 C72 262, 84 280, 120 286 C156 280, 168 262, 158 250 C174 230, 164 208, 158 184 Z"
                fill="url(#lezarFluffLight)"
              />
              {/* Additional Side Fluff Tufts */}
              <path d="M78 214 Q66 224 76 234 Q64 244 80 252" fill="#ede3d5" opacity="0.8" />
              <path d="M162 214 Q174 224 164 234 Q176 244 160 252" fill="#ede3d5" opacity="0.8" />
              {/* Inner Pure Fluff Highlights & Soft Scallops */}
              <path
                d="M92 192 C88 212, 80 230, 92 246 C86 256, 98 272, 120 276 C142 272, 154 256, 148 246 C160 230, 152 212, 148 192 Z"
                fill="#ffffff"
              />
              {/* Delicate Fur Strands on Chest */}
              <path d="M104 208 Q120 226 110 244" stroke="#ded1c1" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
              <path d="M136 208 Q120 226 130 244" stroke="#ded1c1" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
              <path d="M120 196 L120 254" stroke="#ede3d5" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7" />

              {/* Fluffy Front Paws Resting Neatly */}
              <g id="lezar-paws">
                <ellipse cx="102" cy="294" rx="14" ry="9" fill="#fdfbf7" stroke="#ded1c1" strokeWidth="1" />
                <ellipse cx="138" cy="294" rx="14" ry="9" fill="#fdfbf7" stroke="#ded1c1" strokeWidth="1" />
                {/* Dainty Paw Toe Separators */}
                <path d="M97 296 L97 301 M107 296 L107 301" stroke="#c2b09a" strokeWidth="1" strokeLinecap="round" />
                <path d="M133 296 L133 301 M143 296 L143 301" stroke="#c2b09a" strokeWidth="1" strokeLinecap="round" />
              </g>
            </g>

            {/* HEAD & CHEEKS (PLUSH & FLUFFY) */}
            {/* Fluffy Cheek Fur Tufts behind face */}
            {/* Left Cheek Fur Tuft */}
            <path
              d="M82 130 Q60 138 72 148 Q56 158 74 168 Q64 176 86 174 Z"
              fill="#ded1c1"
            />
            <path
              d="M84 136 Q68 142 76 150 Q64 158 78 166"
              stroke="#5c4837"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.4"
            />
            {/* Right Cheek Fur Tuft */}
            <path
              d="M158 130 Q180 138 168 148 Q184 158 166 168 Q176 176 154 174 Z"
              fill="#ded1c1"
            />
            <path
              d="M156 136 Q172 142 164 150 Q176 158 162 166"
              stroke="#5c4837"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* Main Rounded Head */}
            <ellipse cx="120" cy="140" rx="43" ry="37" fill="url(#lezarBody)" />

            {/* Seal-Mink Mask */}
            <ellipse cx="120" cy="146" rx="29" ry="23" fill="#544133" />

            {/* Ears with Twitch Animations & Inner Fluff Tufts */}
            <g className="animate-ear-left">
              <polygon points="88,122 98,72 120,110" fill="#4a3728" />
              <polygon points="92,117 100,82 116,110" fill="#f43f5e" opacity="0.25" />
              {/* White Inner Ear Fur Fluff */}
              <path d="M92 115 Q98 98 104 108 Q108 96 114 112" stroke="#ffffff" strokeWidth="2" fill="#ffffff" strokeLinecap="round" />
            </g>
            <g className="animate-ear-right">
              <polygon points="152,122 142,72 120,110" fill="#4a3728" />
              <polygon points="148,117 140,82 124,110" fill="#f43f5e" opacity="0.25" />
              {/* White Inner Ear Fur Fluff */}
              <path d="M148 115 Q142 98 136 108 Q132 96 126 112" stroke="#ffffff" strokeWidth="2" fill="#ffffff" strokeLinecap="round" />
            </g>

            {/* Cat Aquamarine Eyes with gentle blinking & cursor tracking */}
            <g className="animate-eye-blink">
              <g style={{ transform: `translate(${eyeTrackingOffset.x}px, ${eyeTrackingOffset.y}px)`, transition: 'transform 0.12s ease-out' }}>
                <ellipse cx="102" cy="140" rx="7.5" ry="9.5" fill="url(#catEyeGlow)" />
                <ellipse cx="138" cy="140" rx="7.5" ry="9.5" fill="url(#catEyeGlow)" />
                <ellipse cx="102" cy="140" rx="3.2" ry="8.5" fill="#0c4a6e" />
                <ellipse cx="138" cy="140" rx="3.2" ry="8.5" fill="#0c4a6e" />
                <circle cx="104.5" cy="136.5" r="2.8" fill="#ffffff" />
                <circle cx="140.5" cy="136.5" r="2.8" fill="#ffffff" />
                <circle cx="100.5" cy="143" r="1.2" fill="#bae6fd" />
                <circle cx="136.5" cy="143" r="1.2" fill="#bae6fd" />
              </g>
            </g>

            {/* Pink Nose & Whisker Muzzle */}
            <polygon points="116,152 124,152 120,156.5" fill="#f472b6" />
            <path d="M113 157 Q120 163 127 157" stroke="#292524" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            {/* Long Whiskers */}
            <line x1="80" y1="151" x2="105" y2="154" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
            <line x1="78" y1="158" x2="105" y2="157" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
            <line x1="82" y1="164" x2="104" y2="160" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
            <line x1="160" y1="151" x2="135" y2="154" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
            <line x1="162" y1="158" x2="135" y2="157" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
            <line x1="158" y1="164" x2="136" y2="160" stroke="#ffffff" strokeWidth="1" opacity="0.7" />

            {/* Magical Familiar Leather Collar with Gold Medallion 'R' */}
            <g id="lezar-collar">
              {/* Leather Collar Band around neck */}
              <path d="M96 182 Q120 196 144 182" stroke="#78350f" strokeWidth="5.5" strokeLinecap="round" fill="none" />
              <path d="M96 182 Q120 196 144 182" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
              {/* Golden Pendant with 'R' */}
              <circle cx="120" cy="195" r="9.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" className="animate-glint-flash" />
              <circle cx="120" cy="195" r="8" fill="#fef08a" />
              <text x="120" y="198.5" fontSize="10" fontWeight="900" fontFamily="serif" fill="#78350f" textAnchor="middle">
                R
              </text>
              {/* Star shimmer on pendant */}
              <polygon points="120,188 121,190 123,191 121,192 120,194 119,192 117,191 119,190" fill="#ffffff" />
            </g>

            {/* Magic sensing aura if sensing */}
            {expression === 'sensing' && (
              <circle cx="120" cy="140" r="62" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6,6" opacity="0.8" className="animate-spin-slow" />
            )}
          </svg>
        </div>
      )}

      {/* THE DARK LORD OF THE OBSIDIAN CHASM ("THE DARK CLOWN") */}
      {characterId === 'clown' && (
        <div className="relative w-56 h-76 sm:w-68 sm:h-92 max-h-[44vh] sm:max-h-[48vh] flex items-end justify-center drop-shadow-2xl">
          {/* ========================================================================= */}
          {/* 1. TRUE ABYSS FORM (Monstrous, ancient supernatural void entity) */}
          {/* ACTIVE THROUGHOUT THE ENTIRE ABYSS CHAPTER & JOURNEY UNTIL SUNRISE */}
          {/* ========================================================================= */}
          {expression !== 'holding_cake' && 
           expression !== 'waving' &&
           expression !== 'relic_smile' &&
           expression !== 'gentleman_theatrical' && 
           expression !== 'gentleman_soft' && 
           expression !== 'gentleman_presenting_bear' &&
           expression !== 'gentleman_surprised' && 
           expression !== 'gentleman_normal' ? (
            <svg viewBox="0 0 380 500" className="w-full h-full">
              <defs>
                {/* Abyssal Void Body Gradient */}
                <linearGradient id="abyssBodyVoid" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0a0514" />
                  <stop offset="35%" stopColor="#040208" />
                  <stop offset="70%" stopColor="#020104" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </linearGradient>

                {/* Violet Abyssal Mist Gradient */}
                <radialGradient id="abyssEnergyAura" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#581c87" stopOpacity="0.4" />
                  <stop offset="40%" stopColor="#2e1065" stopOpacity="0.25" />
                  <stop offset="75%" stopColor="#0f051d" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>

                {/* Enraged Crimson-Purple Nebula for abyss_mad */}
                <radialGradient id="abyssMadAura" cx="50%" cy="45%" r="60%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                  <stop offset="35%" stopColor="#b91c1c" stopOpacity="0.4" />
                  <stop offset="65%" stopColor="#581c87" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>

                {/* Ancient Corrupted Hat Texture */}
                <linearGradient id="corruptedHatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#150d21" />
                  <stop offset="50%" stopColor="#08040d" />
                  <stop offset="100%" stopColor="#010003" />
                </linearGradient>

                {/* Cracked Mask Fragment Gradient */}
                <linearGradient id="crackedMaskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="60%" stopColor="#e2e8f0" />
                  <stop offset="90%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>

                {/* Humanity Orb: Dark Violet-Black Sphere with Golden Light */}
                <radialGradient id="humanityOrbCore" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="18%" stopColor="#fef08a" />
                  <stop offset="40%" stopColor="#fbbf24" />
                  <stop offset="65%" stopColor="#4c1d95" />
                  <stop offset="85%" stopColor="#1e0538" />
                  <stop offset="100%" stopColor="#030106" />
                </radialGradient>
                <radialGradient id="humanityOrbAura" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.7" />
                  <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="#581c87" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Surrounding Abyssal Energy Nebula */}
              <ellipse
                cx="190"
                cy="270"
                rx={expression === 'abyss_mad' ? '190' : '170'}
                ry={expression === 'abyss_mad' ? '230' : '210'}
                fill={expression === 'abyss_mad' ? 'url(#abyssMadAura)' : 'url(#abyssEnergyAura)'}
                className="animate-pulse"
              />

              {/* Raging Crimson Flame Surge for abyss_mad */}
              {expression === 'abyss_mad' && (
                <g className="animate-pulse opacity-85">
                  <path d="M100 220 Q190 80 280 220 Q240 180 190 200 Q140 180 100 220 Z" fill="#ef4444" opacity="0.3" filter="blur(6px)" />
                  <path d="M70 300 Q190 150 310 300 Q260 250 190 270 Q120 250 70 300 Z" fill="#dc2626" opacity="0.25" filter="blur(8px)" />
                </g>
              )}

              {/* Swirling Abyss Mist Layer */}
              <g className="animate-abyss-mist opacity-70">
                <path d="M40 380 Q100 320 200 350 Q300 380 340 340 Q300 420 180 410 Q80 430 40 380 Z" fill="#2e1065" opacity="0.3" filter="blur(4px)" />
                <path d="M70 280 Q150 240 240 260 Q320 290 310 330 Q220 310 140 330 Q80 340 70 280 Z" fill="#0f051d" opacity="0.4" filter="blur(3px)" />
              </g>

              {/* Floating Shadow Fragments & Distorted Void Particles */}
              <g opacity="0.6">
                <polygon points="60,220 72,215 68,232 55,228" fill="#1e0836" className="animate-bounce" />
                <polygon points="310,260 325,252 320,270 305,268" fill="#120524" />
                <polygon points="90,340 102,335 96,350 85,348" fill="#0c0317" />
                <polygon points="280,180 292,175 288,190 275,188" fill="#1e0836" />
                {/* Tiny Distorted Stars & Golden Sparks */}
                <circle cx="110" cy="180" r="1.5" fill="#fde047" className="animate-pulse" />
                <circle cx="270" cy="220" r="1.8" fill="#c084fc" className="animate-pulse" />
                <circle cx="85" cy="290" r="1.2" fill="#fbbf24" />
                <circle cx="305" cy="320" r="1.5" fill="#fef08a" />
                <circle cx="120" cy="380" r="1" fill="#e879f9" />
              </g>

              {/* TALL, UNNATURAL SILHOUETTE: Cloak dissolving into black mist (underwater-like movement) */}
              {/* Back Shadow Tendrils */}
              <path
                d="M130 240 Q70 310 50 420 Q65 470 90 495 Q130 460 145 370 Z"
                fill="#05020a"
                opacity="0.8"
              />
              <path
                d="M250 240 Q310 310 330 420 Q315 470 290 495 Q250 460 235 370 Z"
                fill="#05020a"
                opacity="0.8"
              />

              {/* Main Dissolving Void Body (Elongated, slender, otherworldly) */}
              <path
                d="M110 200 Q190 170 270 200 Q300 290 320 460 Q270 480 250 440 Q210 495 190 440 Q170 495 130 440 Q110 480 60 460 Q80 290 110 200 Z"
                fill="url(#abyssBodyVoid)"
              />

              {/* Swirling Black Mist & Deep Violet Energy Veins along the Torso */}
              <path
                d="M140 230 Q190 210 240 230 Q220 330 250 430 Q190 450 130 430 Q160 330 140 230 Z"
                fill="#080410"
                stroke="#2e1065"
                strokeWidth="1"
                strokeDasharray="12,6"
              />
              <path d="M165 240 Q190 280 175 350 Q190 390 180 430" stroke="#4c1d95" strokeWidth="1.2" fill="none" opacity="0.5" />
              <path d="M215 240 Q190 280 205 350 Q190 390 200 430" stroke="#4c1d95" strokeWidth="1.2" fill="none" opacity="0.5" />

              {/* Glowing Heartbeat Spark In The Dark Lord's Chest */}
              <g id="darklord-chest-spark" transform="translate(190, 265)">
                {/* Expanding Heartbeat Resonance Ring */}
                <circle cx="0" cy="0" r="28" fill="url(#humanityOrbAura)" opacity="0.6" className="animate-ping" />
                <circle cx="0" cy="0" r="18" fill="url(#humanityOrbAura)" opacity="0.8" className="animate-pulse" />
                {/* Radiant 4-Point Golden Starlight Core */}
                <path
                  d="M0 -14 Q2 -4 14 0 Q2 4 0 14 Q-2 4 -14 0 Q-2 -4 0 -14 Z"
                  fill="#fef08a"
                  className="animate-pulse"
                />
                <circle cx="0" cy="0" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                <circle cx="0" cy="0" r="2.2" fill="#ffffff" className="animate-glint-flash" />
                {/* Micro Starlight Flares */}
                <circle cx="-6" cy="-6" r="1" fill="#fde047" className="animate-ping" />
                <circle cx="7" cy="5" r="1.2" fill="#c084fc" className="animate-pulse" />
              </g>

              {/* Distorted Spindly Arm Reaching Inward */}
              <path
                d="M120 220 Q70 260 85 340 Q110 370 140 350 Q105 330 98 270 Q130 230 140 225 Z"
                fill="#050208"
                stroke="#1e0836"
                strokeWidth="1"
              />
              {/* Spindly Elongated Shadow Fingers grasping near the orb */}
              <g stroke="#050208" strokeWidth="2.5" strokeLinecap="round">
                <path d="M140 345 Q160 335 172 342" />
                <path d="M142 352 Q165 348 178 355" />
                <path d="M140 360 Q162 362 174 368" />
                <path d="M136 368 Q155 375 166 380" />
              </g>

              {/* HEAD: PITCH BLACK VOID WITH A CRACKED PORCELAIN MASK FLOATING */}
              <g id="darklord-head-group" className={expression === 'abyss_surprised' ? 'animate-head-shake' : ''}>
                {/* Eerie Void Head Shadow */}
                <ellipse cx="190" cy="140" rx="38" ry="46" fill="#020104" />

                {/* CRACKED PORCELAIN CLOWN MASK (Ancient, Fragmented, Supernatural) */}
                <path
                  d="M154 110 Q190 98 226 110 Q232 150 220 180 Q190 196 160 180 Q148 150 154 110 Z"
                  fill="url(#crackedMaskGrad)"
                  stroke="#475569"
                  strokeWidth="1"
                />

                {/* Deep Visible Cracks on the Mask */}
                <path d="M188 102 L185 125 L174 135 L178 155 L168 180" stroke="#090514" strokeWidth="1.4" fill="none" />
                <path d="M185 125 L200 132 L208 126" stroke="#090514" strokeWidth="1" fill="none" />
                <path d="M174 135 L160 140 L152 136" stroke="#090514" strokeWidth="1" fill="none" />
                <path d="M178 155 L192 165" stroke="#090514" strokeWidth="0.9" fill="none" />

                {/* Left Eye: Completely Empty Deep Black Socket */}
                <ellipse cx="172" cy="136" rx="6.5" ry="8" fill="#020104" stroke="#1e293b" strokeWidth="0.8" />

                {/* Right Eye: Deep Socket with a Piercing Pinpoint Celestial Glow & subtle blink */}
                <ellipse cx="208" cy="136" rx="6.5" ry="8" fill="#020104" stroke={expression === 'abyss_mad' ? '#ef4444' : '#1e293b'} strokeWidth="1" />
                {/* Small Piercing Unnatural Glowing Pinpoint */}
                <g className="animate-eye-blink">
                  <circle
                    cx="208"
                    cy="136"
                    r={expression === 'abyss_mad' ? '7' : '3.5'}
                    fill={expression === 'abyss_mad' ? '#ef4444' : '#fbbf24'}
                    opacity={expression === 'abyss_mad' ? '0.7' : '0.3'}
                    className="animate-pulse"
                  />
                  <circle cx="208" cy="136" r="1.8" fill="#ffffff" />
                  <circle cx="208" cy="136" r="1" fill={expression === 'abyss_mad' ? '#fca5a5' : '#fef08a'} className="animate-pulse" />
                  {expression === 'abyss_mad' && (
                    <path d="M208 126 L211 133 L217 136 L211 139 L208 146 L205 139 L199 136 L205 133 Z" fill="#ef4444" opacity="0.8" className="animate-ping" />
                  )}
                </g>

                {/* Thin, Impossible, Unnerving Smile or Angry Jagged Roar for abyss_mad */}
                {expression === 'abyss_mad' ? (
                  <path
                    d="M152 174 Q190 152 228 174 L220 182 Q190 166 160 182 Z"
                    fill="#7f1d1d"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                ) : (
                  <>
                    <path
                      d="M156 166 Q190 185 224 164"
                      stroke="#090312"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path d="M155 163 L158 169" stroke="#090312" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M225 161 L222 167" stroke="#090312" strokeWidth="1.8" strokeLinecap="round" />
                  </>
                )}

                {/* ANCIENT, CORRUPTED TALL TOP HAT (Torn, Crooked, Dissolving Edges) */}
                <g transform="rotate(-8 190 85)">
                  {/* Ragged, Tattered Brim */}
                  <path
                    d="M125 98 Q190 88 255 98 Q240 108 190 106 Q140 108 125 98 Z"
                    fill="#06030a"
                    stroke="#150d21"
                    strokeWidth="1.2"
                  />
                  {/* Jagged Crown with Tears fading into smoke */}
                  <path
                    d="M145 96 L152 -6 Q190 -16 228 -6 L235 96 Q190 104 145 96 Z"
                    fill="url(#corruptedHatGrad)"
                  />
                  {/* Crown ragged holes and edge tears */}
                  <polygon points="152,30 146,42 153,46" fill="#000000" />
                  <polygon points="228,15 234,26 227,32" fill="#000000" />
                  
                  {/* Corrupted Deep Violet Band with Glowing Arcane Symbols */}
                  <polygon points="146,96 234,96 231,78 149,78" fill="#1b0638" stroke="#3b0764" strokeWidth="0.8" />
                  {/* Faint Glowing Arcane Runes */}
                  <path d="M165 87 L170 82 L175 87 M170 82 L170 92" stroke="#c084fc" strokeWidth="1" opacity="0.75" />
                  <circle cx="190" cy="87" r="3" stroke="#fbbf24" strokeWidth="1" fill="none" opacity="0.8" />
                  <path d="M205 83 L215 91 M205 91 L215 83" stroke="#c084fc" strokeWidth="1" opacity="0.75" />

                  {/* Dissolving smoke plumes at hat tip */}
                  <path d="M152 -6 Q145 -25 160 -40 Q175 -20 180 -12" fill="#0a0514" opacity="0.6" />
                  <path d="M228 -6 Q238 -28 220 -44 Q205 -22 200 -12" fill="#0a0514" opacity="0.6" />
                </g>
              </g>

              {/* SIGNATURE MAGICAL ORB: "THE LAST REMAINING FRAGMENT OF HUMANITY" */}
              {/* A Dark Violet-Black Cosmic Sphere containing a pure golden spark */}
              <g transform="translate(145, 305)">
                {/* Outer Nebula Glow */}
                <circle cx="45" cy="45" r="42" fill="url(#humanityOrbAura)" />
                {/* Core Dark Violet-Black Sphere */}
                <circle cx="45" cy="45" r="26" fill="url(#humanityOrbCore)" stroke="#a855f7" strokeWidth="1.2" />

                {/* Dark Swirling Cosmic Veins */}
                <circle cx="45" cy="45" r="10" fill="#040108" opacity="0.9" />

                {/* Pure Golden Light Spark ("Last Fragment of Humanity") */}
                <circle cx="45" cy="45" r="4" fill="#fbbf24" className="animate-pulse" />
                <circle cx="45" cy="45" r="1.8" fill="#ffffff" />

                {/* Tiny Floating Golden Light Motifs */}
                <circle cx="38" cy="38" r="1.2" fill="#fde047" />
                <circle cx="53" cy="51" r="1.4" fill="#fde047" />
                <polygon points="45,30 47,35 52,37 47,39 45,44 43,39 38,37 43,35" fill="#fef08a" />
              </g>
            </svg>
          ) : (
            /* ========================================================================= */
            /* 2. THEATRICAL GENTLEMAN / BIRTHDAY CELEBRATION (NORMAL FORM) */
            /* ONLY ACTIVE AFTER THE EXPLICIT POST-ABYSS TRANSFORMATION EVENT */
            /* ========================================================================= */
            <svg viewBox="0 0 340 460" className="w-full h-full">
              <defs>
                {/* Pitch Obsidian Coat (Almost disappears into total darkness) */}
                <linearGradient id="dlCoat" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#121114" />
                  <stop offset="35%" stopColor="#09080a" />
                  <stop offset="85%" stopColor="#030205" />
                  <stop offset="100%" stopColor="#000000" />
                </linearGradient>

                {/* Deep Midnight Violet Accents (Not bright purple) */}
                <linearGradient id="dlViolet" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#31104d" />
                  <stop offset="50%" stopColor="#1e0733" />
                  <stop offset="100%" stopColor="#10031c" />
                </linearGradient>

                {/* Deep Midnight Velvet Lapel Edge */}
                <linearGradient id="dlLapelHighlight" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#1e0538" stopOpacity="0" />
                </linearGradient>

                {/* Eerie Stark Porcelain Face Gradient */}
                <linearGradient id="porcelainSkin" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="55%" stopColor="#f1f5f9" />
                  <stop offset="85%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>

                {/* Monocle Glass Sheen */}
                <linearGradient id="monocleGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
                  <stop offset="40%" stopColor="#ffffff" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                </linearGradient>

                {/* Deep Hat Shadow Swallowing the Left Side of Face */}
                <linearGradient id="abyssHatShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#020104" stopOpacity="0.95" />
                  <stop offset="55%" stopColor="#0a0514" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </linearGradient>

                {/* Strange Black-Gold Starlight Magical Orb */}
                <radialGradient id="starlightCore" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="25%" stopColor="#fbbf24" />
                  <stop offset="55%" stopColor="#4c1d95" />
                  <stop offset="80%" stopColor="#1e0538" />
                  <stop offset="100%" stopColor="#020104" stopOpacity="0.95" />
                </radialGradient>
                <radialGradient id="starlightAura" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.55" />
                  <stop offset="45%" stopColor="#fbbf24" stopOpacity="0.2" />
                  <stop offset="85%" stopColor="#1e0538" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Faint Cosmic Void Nebula Glow from the Orb */}
              {expression !== 'holding_cake' && (
                <g className="animate-pulse opacity-40">
                  <ellipse cx="170" cy="270" rx="140" ry="160" fill="url(#starlightAura)" />
                  <circle cx="85" cy="210" r="1.2" fill="#fde047" opacity="0.6" />
                  <circle cx="255" cy="230" r="1.5" fill="#c084fc" opacity="0.6" />
                  <circle cx="105" cy="320" r="1" fill="#e879f9" opacity="0.5" />
                  <circle cx="235" cy="340" r="1.4" fill="#fbbf24" opacity="0.6" />
                </g>
              )}

              {/* Long Pitch Obsidian Coat */}
              <path
                d="M55 460 L75 220 Q170 185 265 220 L285 460 L230 460 L170 360 L110 460 Z"
                fill="url(#dlCoat)"
              />
              {/* Dark inner lining slits */}
              <polygon points="110,460 170,360 125,460" fill="#130421" />
              <polygon points="230,460 170,360 215,460" fill="#130421" />

              {/* High-Collared Charcoal Vest with Subtle Gold Accents */}
              <path d="M125 220 L170 350 L215 220 Z" fill="#111114" stroke="#050508" strokeWidth="1" />
              <circle cx="170" cy="255" r="2.2" fill="#ca8a04" stroke="#eab308" strokeWidth="0.5" />
              <circle cx="170" cy="280" r="2.2" fill="#ca8a04" stroke="#eab308" strokeWidth="0.5" />
              <circle cx="170" cy="305" r="2.2" fill="#ca8a04" stroke="#eab308" strokeWidth="0.5" />

              {/* High, Sharp Stand-up Deep Midnight Violet Velvet Lapels */}
              <path d="M100 220 L152 325 L132 208 Z" fill="url(#dlViolet)" stroke="#2e1065" strokeWidth="1.2" />
              <path d="M240 220 L188 325 L208 208 Z" fill="url(#dlViolet)" stroke="#2e1065" strokeWidth="1.2" />
              <polygon points="135,190 170,222 205,190 170,202" fill="#1e0733" />

              {/* Deep Violet Cravat with Cold Gold Pin */}
              <path d="M158 202 L170 236 L182 202 Z" fill="#24073d" />
              <circle cx="170" cy="214" r="2.2" fill="#fbbf24" stroke="#92400e" strokeWidth="0.6" />

              {/* NECK: Stark porcelain column */}
              <rect x="156" y="175" width="28" height="24" fill="url(#porcelainSkin)" />

              {/* FACE: Mask-like Oval Porcelain Face */}
              <ellipse cx="170" cy="148" rx="34" ry="40" fill="url(#porcelainSkin)" stroke="#94a3b8" strokeWidth="0.6" />

              {/* Cast Shadow from Top Hat Swallowing Left Half of Face */}
              <path d="M136 112 Q166 142 150 176 Q130 165 136 112 Z" fill="url(#abyssHatShadow)" />

              {/* EYES with cursor tracking */}
              <g className="animate-eye-blink">
                <g style={{ transform: `translate(${eyeTrackingOffset.x}px, ${eyeTrackingOffset.y}px)`, transition: 'transform 0.12s ease-out' }}>
                  {/* Left Eye (in shadow) */}
                  <ellipse cx="152" cy="146" rx="4" ry="5.2" fill="#030206" />
                  {expression === 'holding_cake' || expression === 'gentleman_soft' || expression === 'gentleman_presenting_bear' || expression === 'gentleman_surprised' ? (
                    <circle cx="153" cy="144" r="1" fill="#fef08a" opacity="0.8" />
                  ) : null}

                  {/* Right Eye (Under Monocle) */}
                  {expression === 'gentleman_surprised' ? (
                    <g fill="#09090b">
                      <circle cx="188" cy="146" r="5.5" />
                      <circle cx="189.5" cy="144.5" r="1.8" fill="#ffffff" />
                    </g>
                  ) : expression === 'gentleman_soft' || expression === 'gentleman_presenting_bear' ? (
                    <g stroke="#09090b" strokeWidth="2" strokeLinecap="round" fill="none">
                      <path d="M181 146 Q188 141 195 146" />
                    </g>
                  ) : expression === 'holding_cake' ? (
                    <g>
                      <ellipse cx="188" cy="146" rx="3.8" ry="4.8" fill="#09090b" />
                      <circle cx="189.5" cy="144" r="1.5" fill="#ffffff" />
                    </g>
                  ) : (
                    /* Smirk / Theatrical wry journey mode */
                    <g>
                      <ellipse cx="188" cy="146" rx="4" ry="5" fill="#09090b" />
                      <circle cx="189.5" cy="144.5" r="1.4" fill="#fbbf24" />
                    </g>
                  )}
                </g>
              </g>

              {/* EYEBROWS */}
              <g stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none">
                <line x1="144" y1="136" x2="160" y2="136" />
                {expression === 'gentleman_theatrical' ? (
                  <path d="M178 136 Q188 131 198 134" />
                ) : expression === 'gentleman_surprised' ? (
                  <path d="M178 128 Q188 123 198 129" />
                ) : expression === 'gentleman_soft' || expression === 'gentleman_presenting_bear' ? (
                  <path d="M178 137 Q188 134 198 137" />
                ) : (
                  <path d="M178 136 Q189 130 198 135" />
                )}
              </g>

              {/* GOLDEN THEATRICAL MONOCLE ON RIGHT EYE */}
              <circle cx="188" cy="146" r="12" fill="url(#monocleGlass)" stroke="#fbbf24" strokeWidth="1.6" />
              <line x1="182" y1="139" x2="194" y2="151" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
              <path d="M200 146 Q214 170 204 215" stroke="#ca8a04" strokeWidth="0.9" fill="none" strokeDasharray="3,2" />

              {/* MOUTH */}
              {expression === 'holding_cake' ? (
                <path d="M154 174 Q170 184 186 174" stroke="#18181b" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              ) : expression === 'gentleman_soft' || expression === 'gentleman_presenting_bear' || expression === 'relic_smile' ? (
                <path d="M154 172 Q170 182 186 172" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              ) : expression === 'gentleman_theatrical' ? (
                <g>
                  <path d="M152 173 Q168 184 192 170" stroke="#1e0b36" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  <path d="M190 168 Q193 170 192 174" stroke="#1e0b36" strokeWidth="2" strokeLinecap="round" fill="none" />
                </g>
              ) : (
                <path d="M155 173 Q170 177 185 173" stroke="#1e0b36" strokeWidth="2" strokeLinecap="round" fill="none" />
              )}

              {/* TALL TOP HAT (Tipped naturally when theatrical) */}
              <g transform={expression === 'gentleman_theatrical' ? "rotate(-12 170 90) translate(-4, -4)" : "rotate(-6 170 90)"}>
                <ellipse cx="170" cy="108" rx="55" ry="10" fill="#09080a" stroke="#121114" strokeWidth="1" />
                <polygon points="130,106 210,106 205,14 135,14" fill="url(#dlCoat)" />
                <polygon points="131,106 209,106 207,90 133,90" fill="#1b063b" />
                {/* Golden Musical Note on Hat Band */}
                <g transform="translate(162, 91)">
                  <ellipse cx="4" cy="11" rx="3" ry="2.2" fill="#fbbf24" transform="rotate(-15 4 11)" />
                  <ellipse cx="14" cy="9" rx="3" ry="2.2" fill="#fbbf24" transform="rotate(-15 14 9)" />
                  <rect x="5" y="2" width="1.8" height="9" fill="#fbbf24" />
                  <rect x="15" y="0" width="1.8" height="9" fill="#fbbf24" />
                  <polygon points="5,2 17,0 17,2.5 5,4.5" fill="#fbbf24" />
                  <circle cx="9" cy="5" r="1" fill="#ffffff" className="animate-glint-flash" />
                </g>
                <path d="M138 95 Q122 68 128 52 Q136 70 140 91 Z" fill="#3b0764" stroke="#4c1d95" strokeWidth="0.8" />
                <line x1="133" y1="91" x2="128" y2="57" stroke="#7e22ce" strokeWidth="0.6" />
              </g>

              {/* PROPS & HANDS */}
              {expression === 'holding_cake' ? (
                <g transform="translate(100, 255)">
                  <ellipse cx="70" cy="94" rx="66" ry="15" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
                  <rect x="25" y="52" width="90" height="38" rx="6" fill="#fbcfe8" stroke="#f472b6" strokeWidth="2" />
                  <rect x="25" y="70" width="90" height="5" fill="#e11d48" />
                  <rect x="42" y="30" width="56" height="24" rx="4" fill="#451a03" stroke="#78350f" strokeWidth="1.5" />
                  <path d="M42 34 Q50 42 58 34 Q66 42 74 34 Q82 42 90 34 Q98 42 98 34" stroke="#78350f" strokeWidth="3" fill="none" />
                  <circle cx="50" cy="27" r="5" fill="#ef4444" />
                  <circle cx="70" cy="25" r="6" fill="#ef4444" />
                  <circle cx="90" cy="27" r="5" fill="#ef4444" />
                  <rect x="56" y="10" width="4" height="16" fill="#38bdf8" />
                  <rect x="68" y="6" width="4" height="20" fill="#fbbf24" />
                  <rect x="80" y="10" width="4" height="16" fill="#ec4899" />
                  <circle cx="58" cy="7" r="4" fill="#fde047" className="animate-candle-flame" />
                  <circle cx="70" cy="3" r="5" fill="#fde047" className="animate-candle-flame" />
                  <circle cx="82" cy="7" r="4" fill="#fde047" className="animate-candle-flame" />
                  <ellipse cx="12" cy="90" rx="10" ry="7" fill="#09080a" stroke="#1e293b" strokeWidth="1" />
                  <ellipse cx="128" cy="90" rx="10" ry="7" fill="#09080a" stroke="#1e293b" strokeWidth="1" />
                </g>
              ) : expression === 'gentleman_presenting_bear' ? (
                /* MÉLO CLOWN CRADLING & PRESENTING THE MAGICAL YELLOW BEAR PLUSH (POOH LOOKALIKE) */
                <g id="melo-presenting-gbear" transform="translate(170, 258)">
                  {/* Glowing Honey Aura behind the plush */}
                  <circle cx="0" cy="0" r="75" fill="#fbbf24" opacity="0.25" className="animate-pulse" filter="blur(16px)" />
                  <circle cx="0" cy="0" r="50" fill="#fef08a" opacity="0.35" className="animate-pulse" filter="blur(8px)" />

                  {/* Honey-Gold Spotlight Cone from above */}
                  <polygon points="0,-180 -65,65 65,65" fill="url(#honeyAuraGlow)" opacity="0.28" className="animate-bear-spotlight" />

                  {/* Mélo's Gentle Midnight Arms Reaching Out */}
                  <path d="M-115 -15 Q-65 35 -30 22" stroke="#09080a" strokeWidth="16" strokeLinecap="round" fill="none" />
                  <path d="M-115 -15 Q-65 35 -30 22" stroke="#1e0b36" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.5" />
                  <path d="M115 -15 Q65 35 30 22" stroke="#09080a" strokeWidth="16" strokeLinecap="round" fill="none" />
                  <path d="M115 -15 Q65 35 30 22" stroke="#1e0b36" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.5" />

                  {/* THE YELLOW BEAR PLUSHIE (POOH BEAR LOOKALIKE) WITH MANIFEST POP-IN & ALIVE MOTION */}
                  <g className="animate-bear-manifest">
                    <g
                      onClick={handleGBearClick}
                      className={`cursor-pointer select-none ${
                        isGBearBouncing ? 'animate-gbear-happy-dance' : 'animate-bear-wiggle'
                      }`}
                    >
                      {/* Plush Drop Shadow */}
                      <ellipse cx="0" cy="38" rx="34" ry="8" fill="#020104" opacity="0.4" />

                      {/* Plush Little Stubby Feet */}
                      <ellipse cx="-18" cy="34" rx="12" ry="8" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
                      <ellipse cx="-18" cy="33" rx="7" ry="5" fill="#fde047" />
                      <ellipse cx="18" cy="34" rx="12" ry="8" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
                      <ellipse cx="18" cy="33" rx="7" ry="5" fill="#fde047" />

                      {/* Plush Round Chubby Body */}
                      <ellipse cx="0" cy="12" rx="33" ry="28" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                      <ellipse cx="0" cy="14" rx="24" ry="20" fill="#fde047" />

                      {/* Classic Cozy Red T-shirt / Vest */}
                      <path d="-26 2 Q0 -6 26 2 L22 20 Q0 24 -22 20 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
                      <path d="-14 -2 Q0 6 14 -2" stroke="#b91c1c" strokeWidth="1.5" fill="none" />
                      <path d="-28 4 Q-30 12 -23 15 L-19 9 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
                      <path d="M28 4 Q30 12 23 15 L19 9 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />

                      {/* Round Bear Ears with Playful Alive Ear Twitch/Wiggle */}
                      <g className="animate-bear-ear-left">
                        <circle cx="-23" cy="-40" r="10" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                        <circle cx="-23" cy="-40" r="5.5" fill="#fef08a" />
                      </g>
                      <g className="animate-bear-ear-right">
                        <circle cx="23" cy="-40" r="10" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                        <circle cx="23" cy="-40" r="5.5" fill="#fef08a" />
                      </g>

                      {/* Round Bear Head */}
                      <ellipse cx="0" cy="-24" rx="28" ry="24" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />

                      {/* Round Muzzle / Snout */}
                      <ellipse cx="0" cy="-19" rx="14" ry="11" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />

                      {/* Cute Black Button Nose with Sheen */}
                      <ellipse cx="0" cy="-23" rx="4" ry="3" fill="#18181b" />
                      <circle cx="-1" cy="-24" r="1" fill="#ffffff" />

                      {/* Stitched Teddy Smile */}
                      <path d="M0 -20 L0 -16" stroke="#78350f" strokeWidth="1.4" />
                      <path d="M-7 -17 Q0 -11 7 -17" stroke="#78350f" strokeWidth="1.6" strokeLinecap="round" fill="none" />

                      {/* Soft Rosy Cheeks */}
                      <ellipse cx="-17" cy="-19" rx="4" ry="3" fill="#fb7185" opacity="0.65" />
                      <ellipse cx="17" cy="-19" rx="4" ry="3" fill="#fb7185" opacity="0.65" />

                      {/* Sparkling Dark Button Eyes with Randomized Alive setTimeout Blinking */}
                      {isGBearBlinking ? (
                        <g>
                          <path d="M-13 -29 Q-10 -26 -7 -29" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                          <path d="M7 -29 Q10 -26 13 -29" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                        </g>
                      ) : (
                        <g className="animate-bear-blink">
                          <circle cx="-10" cy="-29" r="3.2" fill="#0f172a" />
                          <circle cx="-9" cy="-30" r="1.1" fill="#ffffff" />
                          <circle cx="10" cy="-29" r="3.2" fill="#0f172a" />
                          <circle cx="11" cy="-30" r="1.1" fill="#ffffff" />
                        </g>
                      )}

                      {/* Friendly Soft Eyebrows */}
                      <path d="-13 -34 Q-10 -36 -6 -34" stroke="#854d0e" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                      <path d="M6 -34 Q10 -36 13 -34" stroke="#854d0e" strokeWidth="1.2" strokeLinecap="round" fill="none" />

                      {/* Left Paw cradling the Glowing Starlight Sun Spark */}
                      <ellipse cx="-18" cy="12" rx="8" ry="7" fill="#facc15" stroke="#ca8a04" strokeWidth="1.2" transform="rotate(20 -18 12)" />
                      
                      {/* Right Paw - Alive Animated Waving Hello! 🧸👋 */}
                      <g className="animate-bear-paw-wave">
                        <ellipse cx="20" cy="6" rx="8.5" ry="7" fill="#facc15" stroke="#ca8a04" strokeWidth="1.2" />
                        <ellipse cx="20" cy="6" rx="4.5" ry="3.5" fill="#fef08a" opacity="0.8" />
                      </g>

                      {/* Glowing Sun Spark / Starlight Gem inside Bear's Paws */}
                      <g transform="translate(-4, 12)">
                        <circle cx="0" cy="0" r="14" fill="#fbbf24" opacity="0.5" className="animate-pulse" filter="blur(4px)" />
                        <circle cx="0" cy="0" r="8" fill="#fef08a" className="animate-pulse" />
                        <polygon points="0,-10 3,-3 10,0 3,3 0,10 -3,3 -10,0 -3,-3" fill="#ffffff" className="animate-spin-slow" />
                        <circle cx="0" cy="0" r="2.5" fill="#f59e0b" />
                      </g>

                      {/* PERSISTENT ORBITING MAGICAL PARTICLES */}
                      <g className="animate-particle-orbit-portrait-1">
                        <polygon points="0,-3 2.5,0 0,3 -2.5,0" fill="#fde047" style={{ filter: 'drop-shadow(0 0 5px #fbbf24)' }} />
                        <circle cx="0" cy="0" r="1.2" fill="#ffffff" />
                      </g>
                      <g className="animate-particle-orbit-portrait-2">
                        <circle cx="0" cy="0" r="2" fill="#c084fc" style={{ filter: 'drop-shadow(0 0 4px #e879f9)' }} />
                        <circle cx="0" cy="0" r="0.8" fill="#ffffff" />
                      </g>

                      {/* GOLDEN HONEY-DRIP PARTICLE TRAIL */}
                      <g transform="translate(0, 30)">
                        <g className="animate-honey-drip-1" transform="translate(-12, 0)">
                          <circle cx="0" cy="10" r="2" fill="#fbbf24" />
                          <circle cx="0.4" cy="9.6" r="0.6" fill="#ffffff" />
                        </g>
                        <g className="animate-honey-drip-2" transform="translate(10, 2)">
                          <circle cx="0" cy="12" r="2.4" fill="#f59e0b" />
                          <circle cx="0.5" cy="11.5" r="0.8" fill="#ffffff" />
                        </g>
                      </g>
                    </g>
                  </g>

                  {/* Left & Right Slate Gloves supporting the bear directly */}
                  <g>
                    <ellipse cx="-30" cy="22" rx="12" ry="9" fill="#1e293b" stroke="#334155" strokeWidth="1.2" transform="rotate(-15 -30 22)" />
                    <path d="M-28 17 Q-22 20 -24 26" stroke="#475569" strokeWidth="1.2" fill="none" />
                  </g>
                  <g>
                    <ellipse cx="30" cy="22" rx="12" ry="9" fill="#1e293b" stroke="#334155" strokeWidth="1.2" transform="rotate(15 30 22)" />
                    <path d="M28 17 Q22 20 24 26" stroke="#475569" strokeWidth="1.2" fill="none" />
                  </g>
                  <path d="M-30 25 Q0 42 30 25" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" fill="none" />

                  {/* Floating Golden & Violet Musical Sparks around the Gift */}
                  <g className="animate-note-float-1" transform="translate(-95, -60)">
                    <text x="0" y="0" fill="#fbbf24" fontSize="20" fontFamily="serif" opacity="0.9" style={{ filter: 'drop-shadow(0 0 6px #fde047)' }}>♪</text>
                  </g>
                  <g className="animate-note-float-2" transform="translate(70, -50)">
                    <text x="0" y="0" fill="#fde047" fontSize="18" fontFamily="serif" opacity="0.9" style={{ filter: 'drop-shadow(0 0 6px #fbbf24)' }}>✨</text>
                  </g>
                  <g className="animate-note-float-3" transform="translate(-75, 10)">
                    <text x="0" y="0" fill="#c084fc" fontSize="16" fontFamily="serif" opacity="0.85" style={{ filter: 'drop-shadow(0 0 4px #e879f9)' }}>♫</text>
                  </g>
                  <g className="animate-note-float-4" transform="translate(55, 15)">
                    <text x="0" y="0" fill="#fbbf24" fontSize="16" fontFamily="serif" opacity="0.85">💛</text>
                  </g>
                </g>
              ) : expression === 'gentleman_theatrical' ? (
                /* Distinguished Gentleman Tipping Hat */
                <g>
                  {/* Left Arm reaching gracefully to hat brim */}
                  <path d="M100 240 Q75 160 128 108" stroke="#09080a" strokeWidth="14" strokeLinecap="round" fill="none" />
                  <path d="M100 240 Q75 160 128 108" stroke="#1e0b36" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.4" />
                  {/* Gloved Hand gracefully resting on hat rim */}
                  <ellipse cx="130" cy="106" rx="8" ry="6" fill="#1e293b" stroke="#475569" strokeWidth="1" transform="rotate(-15 130 106)" />
                  {/* Right Hand resting on walking stick or orb */}
                  <g transform="translate(60, 275)">
                    <rect x="8" y="24" width="22" height="12" rx="3" fill="#1b063b" stroke="#31104d" strokeWidth="1" />
                    <circle cx="48" cy="18" r="28" fill="url(#starlightAura)" />
                    <circle cx="48" cy="18" r="16" fill="url(#starlightCore)" stroke="#6b21a8" strokeWidth="1" />
                    <circle cx="48" cy="18" r="2" fill="#fde047" className="animate-pulse" />
                  </g>
                </g>
              ) : expression === 'relic_smile' || expression === 'gentleman_soft' || expression === 'waving' ? (
                /* Warm Smiling Gentleman with Floating Magical Notes for Memory Screen */
                <g>
                  {/* Holding Sparkling Black-Gold Starlight Orb */}
                  <g transform="translate(60, 275)">
                    <rect x="8" y="24" width="22" height="12" rx="3" fill="#1b063b" stroke="#31104d" strokeWidth="1" />
                    <path d="M12 28 Q18 48 34 38 Q38 32 30 20 Z" fill="#070608" stroke="#1e293b" strokeWidth="1" />
                    <circle cx="48" cy="18" r="34" fill="url(#starlightAura)" />
                    <circle cx="48" cy="18" r="20" fill="url(#starlightCore)" stroke="#6b21a8" strokeWidth="1.2" />
                    <circle cx="48" cy="18" r="6" fill="#020104" />
                    <circle cx="48" cy="18" r="1.8" fill="#fde047" className="animate-pulse" />
                    <polygon points="48,7 49.5,11 53.5,12.5 49.5,14 48,18 46.5,14 42.5,12.5 46.5,11" fill="#fef08a" />
                  </g>

                  {/* Floating Golden & Purple Music Notes */}
                  <g className="animate-note-float-1" transform="translate(50, 180)">
                    <text x="0" y="0" fill="#fbbf24" fontSize="22" fontFamily="serif" opacity="0.9" style={{ filter: 'drop-shadow(0 0 6px #fde047)' }}>♪</text>
                  </g>
                  <g className="animate-note-float-2" transform="translate(250, 160)">
                    <text x="0" y="0" fill="#c084fc" fontSize="24" fontFamily="serif" opacity="0.9" style={{ filter: 'drop-shadow(0 0 6px #e879f9)' }}>♫</text>
                  </g>
                  <g className="animate-note-float-3" transform="translate(80, 110)">
                    <text x="0" y="0" fill="#fef08a" fontSize="18" fontFamily="serif" opacity="0.85" style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }}>♬</text>
                  </g>
                  <g className="animate-note-float-4" transform="translate(240, 240)">
                    <text x="0" y="0" fill="#f472b6" fontSize="20" fontFamily="serif" opacity="0.85" style={{ filter: 'drop-shadow(0 0 4px #f43f5e)' }}>♩</text>
                  </g>
                </g>
              ) : (
                <g transform="translate(60, 275)">
                  <rect x="8" y="24" width="22" height="12" rx="3" fill="#1b063b" stroke="#31104d" strokeWidth="1" />
                  <path d="M12 28 Q18 48 34 38 Q38 32 30 20 Z" fill="#070608" stroke="#1e293b" strokeWidth="1" />
                  <circle cx="48" cy="18" r="34" fill="url(#starlightAura)" />
                  <circle cx="48" cy="18" r="20" fill="url(#starlightCore)" stroke="#6b21a8" strokeWidth="1.2" />
                  <circle cx="48" cy="18" r="6" fill="#020104" />
                  <circle cx="48" cy="18" r="1.8" fill="#fde047" className="animate-pulse" />
                  <circle cx="43" cy="12" r="1.5" fill="#fde047" className="animate-pulse" />
                  <circle cx="55" cy="23" r="1.3" fill="#fde047" className="animate-pulse" />
                  <circle cx="38" cy="24" r="1.1" fill="#fbbf24" />
                  <circle cx="57" cy="11" r="1.2" fill="#fbbf24" />
                  <polygon points="48,7 49.5,11 53.5,12.5 49.5,14 48,18 46.5,14 42.5,12.5 46.5,11" fill="#fef08a" />
                  <polygon points="35,10 36,12 38,13 36,14 35,16 34,14 32,13 34,12" fill="#fbbf24" />
                  <polygon points="59,26 60,28 62,29 60,30 59,32 58,30 56,29 58,28" fill="#fde047" />
                </g>
              )}
            </svg>
          )}
        </div>
      )}

      {/* ORIK THE SPRITE */}
      {characterId === 'orik' && (
        <div className="relative w-48 h-64 sm:w-56 sm:h-72 flex items-end justify-center drop-shadow-xl">
          <svg viewBox="0 0 200 260" className="w-full h-full">
            <defs>
              <linearGradient id="mossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="60%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <linearGradient id="spriteWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#86efac" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2" />
              </linearGradient>
              <radialGradient id="orikSpriteGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#86efac" stopOpacity="0.65" />
                <stop offset="45%" stopColor="#fde047" stopOpacity="0.4" />
                <stop offset="80%" stopColor="#22c55e" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Radiant Sprite Glow Aura when Helped/Grateful/Inspired */}
            {(expression === 'grateful' || expression === 'happy' || expression === 'inspired') && (
              <g id="orik-magical-glow" className="animate-sprite-glow">
                <ellipse cx="100" cy="140" rx="90" ry="95" fill="url(#orikSpriteGlow)" />
                {/* Floating Starlight Green & Gold Particles */}
                <circle cx="45" cy="110" r="2" fill="#fde047" className="animate-pulse" />
                <circle cx="155" cy="100" r="2.2" fill="#86efac" className="animate-ping" />
                <circle cx="50" cy="190" r="1.8" fill="#4ade80" className="animate-pulse" />
                <circle cx="150" cy="195" r="1.5" fill="#fef08a" />
                <polygon points="100,45 102,48 106,49 102,51 100,55 98,51 94,49 98,48" fill="#fef08a" className="animate-glint-flash" />
              </g>
            )}

            {/* Gossamer Sprite Wings on Back (Gentle Floating Sway) */}
            <g id="orik-wings" className="animate-cat-tail opacity-80">
              {/* Left Wing */}
              <path d="M70 145 Q20 100 45 65 Q75 110 70 145 Z" fill="url(#spriteWingGrad)" stroke="#4ade80" strokeWidth="1" />
              <path d="M68 150 Q35 155 42 125 Q62 135 68 150 Z" fill="url(#spriteWingGrad)" stroke="#4ade80" strokeWidth="0.8" />
              {/* Right Wing */}
              <path d="M130 145 Q180 100 155 65 Q125 110 130 145 Z" fill="url(#spriteWingGrad)" stroke="#4ade80" strokeWidth="1" />
              <path d="M132 150 Q165 155 158 125 Q138 135 132 150 Z" fill="url(#spriteWingGrad)" stroke="#4ade80" strokeWidth="0.8" />
            </g>

            {/* Sprite Body (Mossy Round Physique) */}
            <ellipse cx="100" cy="190" rx="55" ry="60" fill="#3f6212" />
            {/* Sprite Soft Belly Leaf Overlay */}
            <ellipse cx="100" cy="195" rx="38" ry="42" fill="#4d7c0f" opacity="0.8" />
            {/* Sprite Twiggy Tail */}
            <path d="M55 210 Q40 230 48 245 Q55 235 60 215" fill="#365314" stroke="#15803d" strokeWidth="1" />

            {/* Whimsical Sprite Swirl Markings on Belly */}
            <path d="M90 190 Q100 180 110 190 Q100 200 95 195" stroke="#a3e635" strokeWidth="1.2" fill="none" opacity="0.6" />
            <circle cx="85" cy="180" r="1.5" fill="#fde047" opacity="0.8" />
            <circle cx="115" cy="180" r="1.5" fill="#fde047" opacity="0.8" />

            {/* Sprite Head */}
            <ellipse cx="100" cy="120" rx="38" ry="38" fill="#65a30d" />

            {/* Leaf Horns / Ears */}
            <path d="M100 85 Q120 60 132 66 Q115 85 100 85 Z" fill="url(#mossGrad)" stroke="#15803d" strokeWidth="0.8" />
            <path d="M100 85 Q80 60 68 66 Q85 85 100 85 Z" fill="url(#mossGrad)" stroke="#15803d" strokeWidth="0.8" />
            {/* Dewdrop sparkle on leaf tips */}
            <circle cx="132" cy="66" r="2" fill="#ecfdf5" stroke="#34d399" strokeWidth="0.5" className="animate-pulse" />
            <circle cx="68" cy="66" r="2" fill="#ecfdf5" stroke="#34d399" strokeWidth="0.5" className="animate-pulse" />

            {/* Flower on Orik's head (Dry initially, blooms when helped/happy/celebrating/credits) */}
            {expression === 'grateful' ||
            expression === 'happy' ||
            expression === 'inspired' ||
            expression === 'holding_sprout' ||
            expression === 'celebrating' ? (
              <g transform="translate(100, 70)">
                <line x1="0" y1="15" x2="0" y2="0" stroke="#15803d" strokeWidth="2.5" />
                {/* Blooming Petals */}
                <circle cx="-6" cy="-4" r="5" fill="#f472b6" />
                <circle cx="6" cy="-4" r="5" fill="#f472b6" />
                <circle cx="-4" cy="-10" r="5" fill="#fb7185" />
                <circle cx="4" cy="-10" r="5" fill="#fb7185" />
                <circle cx="0" cy="-13" r="5" fill="#fda4af" />
                <circle cx="0" cy="-6" r="3.5" fill="#fef08a" />
                <circle cx="0" cy="-6" r="1.5" fill="#f59e0b" />
              </g>
            ) : (
              <g transform="translate(100, 72)">
                <line x1="0" y1="12" x2="4" y2="2" stroke="#a16207" strokeWidth="2" />
                {/* Wilting / Dry Bud */}
                <ellipse cx="5" cy="0" rx="3" ry="4" fill="#a16207" opacity="0.8" transform="rotate(25 5 0)" />
                <ellipse cx="3" cy="2" rx="2" ry="3" fill="#ca8a04" opacity="0.6" transform="rotate(15 3 2)" />
              </g>
            )}

            {/* Eyes with cursor tracking */}
            <g className="animate-eye-blink">
              <g style={{ transform: `translate(${eyeTrackingOffset.x}px, ${eyeTrackingOffset.y}px)`, transition: 'transform 0.12s ease-out' }}>
                <ellipse cx="88" cy="118" rx="4.5" ry="6" fill="#14532d" />
                <ellipse cx="112" cy="118" rx="4.5" ry="6" fill="#14532d" />
                <circle cx="89" cy="116" r="1.5" fill="#ffffff" />
                <circle cx="113" cy="116" r="1.5" fill="#ffffff" />
              </g>
            </g>

            {/* Rosy Blush Cheeks when clicked or happy */}
            <g className={`transition-opacity duration-300 ${isOrikBlushing ? 'opacity-90' : 'opacity-30'}`}>
              <ellipse cx="80" cy="126" rx="6" ry="3.5" fill="#f43f5e" />
              <ellipse cx="120" cy="126" rx="6" ry="3.5" fill="#f43f5e" />
              {isOrikBlushing && (
                <g className="animate-bounce">
                  <path d="M125 110 C125 107 122 105 120 107 C118 105 115 107 115 110 C115 114 120 117 120 117 C120 117 125 114 125 110 Z" fill="#fb7185" />
                </g>
              )}
            </g>

            {expression === 'grateful' || expression === 'happy' || expression === 'inspired' || isOrikBlushing ? (
              <path d="M92 135 Q100 142 108 135" stroke="#14532d" strokeWidth="2" strokeLinecap="round" fill="none" />
            ) : (
              <path d="M94 136 Q100 132 106 136" stroke="#14532d" strokeWidth="2" strokeLinecap="round" fill="none" />
            )}

            {/* Pink Pin on Chest when in celebration/grateful */}
            {(expression === 'grateful' || expression === 'happy') && (
              <g transform="translate(85, 175)">
                <circle cx="0" cy="0" r="4.5" fill="#f472b6" stroke="#db2777" strokeWidth="1" />
                <circle cx="0" cy="0" r="2" fill="#fbcfe8" />
                <polygon points="0,-1.5 0.5,-0.5 1.5,-0.5 0.8,0.2 1,1.2 0,0.6 -1,1.2 -0.8,0.2 -1.5,-0.5 -0.5,-0.5" fill="#ffffff" />
              </g>
            )}
          </svg>
        </div>
      )}

      {/* VIVIENNE THE GLASSMAKER - PROPORTIONATE ARTISAN BODY */}
      {(characterId === 'artisan' || characterId === 'vivienne') && (
        <div className="relative w-56 h-76 sm:w-64 sm:h-88 flex items-end justify-center drop-shadow-xl">
          <svg viewBox="0 0 240 320" className="w-full h-full">
            <defs>
              <linearGradient id="leatherApron" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#854d0e" />
                <stop offset="50%" stopColor="#713f12" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
              <linearGradient id="linenBlouse" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef9c3" />
                <stop offset="70%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#fde047" />
              </linearGradient>
              <linearGradient id="vivienneHair" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9a3412" />
                <stop offset="60%" stopColor="#7c2d12" />
                <stop offset="100%" stopColor="#431407" />
              </linearGradient>
            </defs>

            {/* Flowing Auburn Hair (Back) */}
            <path
              d="M74 110 C50 160, 55 230, 78 260 C98 275, 142 275, 162 260 C185 230, 190 160, 166 110 Z"
              fill="url(#vivienneHair)"
            />

            {/* 1. SLENDER NECK */}
            <path d="M112 140 L112 165 L128 165 L128 140 Z" fill="#fed7aa" />

            {/* 2. LINEN ARTISAN BLOUSE & SHOULDERS */}
            {/* Blouse body and sleeves */}
            <path
              d="M65 180 C60 210, 62 245, 75 260 L85 260 L92 205 L148 205 L155 260 L165 260 C178 245, 180 210, 175 180 C165 168, 140 162, 120 162 C100 162, 75 168, 65 180 Z"
              fill="url(#linenBlouse)"
              stroke="#ca8a04"
              strokeWidth="1"
            />
            {/* Rolled Blouse Cuffs */}
            <rect x="70" y="248" width="16" height="8" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            <rect x="154" y="248" width="16" height="8" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />

            {/* Forearms & Resting Artisan Hands */}
            <path d="M78 256 Q85 282 105 290" stroke="#fed7aa" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M162 256 Q155 282 135 290" stroke="#fed7aa" strokeWidth="8" strokeLinecap="round" fill="none" />
            <ellipse cx="112" cy="290" rx="6" ry="4.5" fill="#fed7aa" />
            <ellipse cx="128" cy="290" rx="6" ry="4.5" fill="#fed7aa" />

            {/* 3. FITTED LEATHER APRON (With bib, straps, waist contour and tool pocket) */}
            {/* Apron Straps over shoulders */}
            <path d="M96 166 L102 205 M144 166 L138 205" stroke="#451a03" strokeWidth="4.5" strokeLinecap="round" />
            {/* Brass Buckles on straps */}
            <rect x="98" y="185" width="6" height="6" rx="1.5" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
            <rect x="136" y="185" width="6" height="6" rx="1.5" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />

            {/* Apron Main Skirt & Bib */}
            <path
              d="M98 205 L142 205 L152 320 L88 320 Z"
              fill="url(#leatherApron)"
              stroke="#451a03"
              strokeWidth="1.2"
            />
            {/* Waist Tie Band */}
            <rect x="92" y="222" width="56" height="6" rx="1.5" fill="#451a03" />

            {/* Leather Tool Pocket */}
            <rect x="100" y="240" width="40" height="34" rx="3" fill="#451a03" stroke="#854d0e" strokeWidth="1" />
            {/* Artisan Caliper / Glass Pen sticking out of pocket */}
            <line x1="108" y1="230" x2="108" y2="246" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="108" cy="228" r="2.5" fill="#fbbf24" />
            <line x1="116" y1="233" x2="116" y2="246" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />

            {/* 4. BLOUSE COLLAR */}
            <ellipse cx="120" cy="166" rx="20" ry="7" fill="#fffbeb" stroke="#ca8a04" strokeWidth="1" />

            {/* 5. SOFT OVAL FACE */}
            <ellipse cx="120" cy="120" rx="30" ry="34" fill="#fed7aa" />

            {/* 6. AUBURN HAIR FRAMING FACE */}
            <path
              d="M92 100 C110 82, 130 82, 148 100 C138 124, 102 124, 92 100 Z"
              fill="url(#vivienneHair)"
            />
            {/* Side Curls */}
            <path d="M92 108 Q84 140 96 165" stroke="url(#vivienneHair)" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <path d="M148 108 Q156 140 144 165" stroke="url(#vivienneHair)" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <path d="M96 102 Q120 90 144 102" stroke="#7c2d12" strokeWidth="1.8" fill="none" />

            {/* Amber Artisan Goggles perched on forehead */}
            <rect x="94" y="88" width="22" height="15" rx="5" fill="#b45309" stroke="#f59e0b" strokeWidth="1.8" />
            <rect x="124" y="88" width="22" height="15" rx="5" fill="#b45309" stroke="#f59e0b" strokeWidth="1.8" />
            <line x1="116" y1="95" x2="124" y2="95" stroke="#f59e0b" strokeWidth="2" />

            {/* ARTISAN HAT ON TOP OF HER HEAD (Given in her final form: helped / happy / inspired / celebrating / holding_bottle / warm) */}
            {(expression === 'inspired' ||
              expression === 'grateful' ||
              expression === 'happy' ||
              expression === 'celebrating' ||
              expression === 'holding_bottle' ||
              expression === 'warm') && (
              <g id="vivienne-artisan-hat" transform="translate(120, 72)">
                {/* Chic French Glassmaker Beret */}
                <ellipse cx="0" cy="2" rx="34" ry="11" fill="#78350f" stroke="#451a03" strokeWidth="1.2" transform="rotate(-6)" />
                <ellipse cx="-3" cy="-4" rx="26" ry="9" fill="#b45309" transform="rotate(-6)" />
                <ellipse cx="-5" cy="-7" rx="18" ry="6" fill="#d97706" transform="rotate(-6)" />
                {/* Golden Star Brooch on Hat */}
                <circle cx="18" cy="0" r="4.5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
                <polygon points="18,-3.5 19.2,-1 21.8,-1 19.8,0.8 20.5,3.2 18,1.8 15.5,3.2 16.2,0.8 14.2,-1 16.8,-1" fill="#fef08a" />
                <circle cx="18" cy="0" r="1.2" fill="#ffffff" className="animate-glint-flash" />
              </g>
            )}

            {/* Eyebrows based on emotion */}
            {expression === 'inspired' ||
            expression === 'grateful' ||
            expression === 'happy' ||
            expression === 'celebrating' ||
            expression === 'holding_bottle' ||
            expression === 'warm' ? (
              <g stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none">
                <path d="M100 110 Q108 105 116 109" />
                <path d="M124 109 Q132 105 140 110" />
              </g>
            ) : (
              /* Really Sad Drooping Eyebrows */
              <g stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" fill="none">
                <path d="M100 109 Q108 116 116 110" />
                <path d="M124 110 Q132 116 140 109" />
              </g>
            )}

            {/* Eyes with cursor tracking */}
            <g className="animate-eye-blink">
              <g style={{ transform: `translate(${eyeTrackingOffset.x}px, ${eyeTrackingOffset.y}px)`, transition: 'transform 0.12s ease-out' }}>
                <ellipse cx="108" cy="120" rx="3.8" ry="4.8" fill="#292524" />
                <ellipse cx="132" cy="120" rx="3.8" ry="4.8" fill="#292524" />
                <circle cx="109" cy="118" r="1.3" fill="#ffffff" />
                <circle cx="133" cy="118" r="1.3" fill="#ffffff" />
              </g>
            </g>

            {/* REALISTIC NATURAL TEARS STREAMING DOWN HER CHEEKS WHEN SAD (Before Helped) */}
            {expression !== 'inspired' &&
              expression !== 'grateful' &&
              expression !== 'happy' &&
              expression !== 'celebrating' &&
              expression !== 'holding_bottle' &&
              expression !== 'warm' && (
              <g id="vivienne-sad-tears">
                {/* Left Cheek Tear Stream */}
                <g className="animate-tear-stream">
                  <path d="M106 124 Q105 132 104 140 Q107 138 107 124 Z" fill="#38bdf8" opacity="0.85" />
                  <circle cx="105" cy="136" r="1.6" fill="#bae6fd" />
                  <circle cx="104" cy="144" r="1.1" fill="#ffffff" />
                </g>
                {/* Right Cheek Tear Stream */}
                <g className="animate-tear-stream-delayed">
                  <path d="M134 124 Q135 132 136 140 Q133 138 133 124 Z" fill="#38bdf8" opacity="0.85" />
                  <circle cx="135" cy="136" r="1.6" fill="#bae6fd" />
                  <circle cx="136" cy="144" r="1.1" fill="#ffffff" />
                </g>
              </g>
            )}

            {/* Rosy Cheeks when helped */}
            {(expression === 'inspired' ||
              expression === 'grateful' ||
              expression === 'happy' ||
              expression === 'celebrating' ||
              expression === 'holding_bottle' ||
              expression === 'warm') && (
              <g>
                <ellipse cx="102" cy="128" rx="5.5" ry="3.5" fill="#f43f5e" opacity="0.35" />
                <ellipse cx="138" cy="128" rx="5.5" ry="3.5" fill="#f43f5e" opacity="0.35" />
              </g>
            )}

            {/* Mouth: Happy Smile vs. Really Sad Downturned */}
            {expression === 'inspired' ||
            expression === 'grateful' ||
            expression === 'happy' ||
            expression === 'celebrating' ||
            expression === 'holding_bottle' ||
            expression === 'warm' ? (
              <path d="M113 136 Q120 145 127 136" stroke="#b91c1c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            ) : (
              /* Really Sad Trembling Mouth */
              <path d="M113 142 Q120 135 127 142" stroke="#78350f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            )}
          </svg>
        </div>
      )}

      {/* HYPO THE HIPPO PLUSHIE (HOLDING NECK PILLOW) */}
      {characterId === 'hypo' && (
        <div className="relative w-52 h-64 sm:w-60 sm:h-72 flex items-end justify-center drop-shadow-xl">
          <svg viewBox="0 0 240 280" className="w-full h-full">
            <defs>
              <linearGradient id="hypoPlush" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              <linearGradient id="neckPillowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbcfe8" />
                <stop offset="50%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
            </defs>

            {/* Plush Hippo Body */}
            <ellipse cx="120" cy="195" rx="55" ry="60" fill="url(#hypoPlush)" />
            {/* White Tummy Patch */}
            <ellipse cx="120" cy="205" rx="35" ry="40" fill="#f1f5f9" />

            {/* Plush Feet */}
            <ellipse cx="85" cy="245" rx="16" ry="12" fill="#64748b" />
            <ellipse cx="155" cy="245" rx="16" ry="12" fill="#64748b" />
            <circle cx="85" cy="245" r="7" fill="#fbcfe8" />
            <circle cx="155" cy="245" r="7" fill="#fbcfe8" />

            {/* Hippo Ears with Cute Twitch */}
            <g className="animate-ear-left">
              <circle cx="80" cy="95" r="14" fill="#94a3b8" />
              <circle cx="80" cy="95" r="8" fill="#fbcfe8" />
            </g>
            <g className="animate-ear-right">
              <circle cx="160" cy="95" r="14" fill="#94a3b8" />
              <circle cx="160" cy="95" r="8" fill="#fbcfe8" />
            </g>

            {/* Hippo Head */}
            <ellipse cx="120" cy="125" rx="42" ry="36" fill="url(#hypoPlush)" />

            {/* Big Cute Hippo Muzzle / Snout */}
            <ellipse cx="120" cy="145" rx="36" ry="24" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
            {/* Nostrils */}
            <ellipse cx="106" cy="140" rx="3.5" ry="4.5" fill="#64748b" />
            <ellipse cx="134" cy="140" rx="3.5" ry="4.5" fill="#64748b" />

            {/* Sweet Stitched Eyes with cursor tracking */}
            <g className="animate-eye-blink">
              <g style={{ transform: `translate(${eyeTrackingOffset.x}px, ${eyeTrackingOffset.y}px)`, transition: 'transform 0.12s ease-out' }}>
                <ellipse cx="102" cy="118" rx="4" ry="5.5" fill="#1e293b" />
                <ellipse cx="138" cy="118" rx="4" ry="5.5" fill="#1e293b" />
                <circle cx="103.5" cy="116" r="1.5" fill="#ffffff" />
                <circle cx="139.5" cy="116" r="1.5" fill="#ffffff" />
              </g>
            </g>

            {/* Rosy Cheeks */}
            <ellipse cx="90" cy="138" rx="7" ry="4" fill="#f43f5e" opacity="0.4" />
            <ellipse cx="150" cy="138" rx="7" ry="4" fill="#f43f5e" opacity="0.4" />

            {/* Sweet Smile */}
            <path d="M112 154 Q120 160 128 154" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* COZY U-SHAPED NECK PILLOW HELD IN ARMS */}
            <g transform="translate(120, 185)">
              {/* U-Shape Neck Pillow */}
              <path
                d="M-36 -10 C-46 15 -35 38 -15 35 C-5 33 -10 18 -18 12 C-26 7 -26 -5 -20 -15 C-12 -28 12 -28 20 -15 C26 -5 26 7 18 12 C10 18 5 33 15 35 C35 38 46 15 36 -10 C28 -32 -28 -32 -36 -10 Z"
                fill="url(#neckPillowGrad)"
                stroke="#db2777"
                strokeWidth="1.5"
              />
              {/* Star pattern on neck pillow */}
              <polygon points="0,-18 2,-14 6,-14 3,-11 4,-7 0,-10 -4,-7 -3,-11 -6,-14 -2,-14" fill="#fef08a" />
              <polygon points="-22,-5 -20,-2 -17,-2 -19,0 -18,3 -22,1 -25,3 -24,0 -27,-2 -24,-2" fill="#fef08a" />
              <polygon points="22,-5 24,-2 27,-2 25,0 26,3 22,1 19,3 20,0 17,-2 20,-2" fill="#fef08a" />
            </g>

            {/* Paws holding the pillow */}
            <ellipse cx="80" cy="190" rx="10" ry="8" fill="#94a3b8" transform="rotate(20 80 190)" />
            <ellipse cx="160" cy="190" rx="10" ry="8" fill="#94a3b8" transform="rotate(-20 160 190)" />
          </svg>
        </div>
      )}

      {/* GBEAR THE PLUSH TEDDY BEAR (STANDALONE PORTRAIT) */}
      {characterId === 'gbear' && (
        <div
          className={`relative w-48 h-56 sm:w-56 sm:h-64 flex items-end justify-center drop-shadow-2xl cursor-pointer select-none transition-transform duration-300 hover:scale-105 ${
            isGBearBouncing ? 'animate-gbear-bounce-click' : 'animate-bear-wiggle'
          }`}
          onClick={handleGBearClick}
          title="Click GBear to hear his magical giggle & see him hop!"
        >
          <svg viewBox="0 0 200 220" className="w-full h-full">
            <defs>
              <linearGradient id="gbearFurStandalone" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="30%" stopColor="#facc15" />
                <stop offset="80%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
              <linearGradient id="gbearShirtStandalone" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="60%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
              <radialGradient id="gbearHoneyAuraStandalone" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#facc15" stopOpacity="0.4" />
                <stop offset="80%" stopColor="#ca8a04" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Glowing Honey Aura */}
            <circle cx="100" cy="115" r="85" fill="url(#gbearHoneyAuraStandalone)" className="animate-pulse" />

            {/* Little Feet */}
            <ellipse cx="70" cy="190" rx="18" ry="12" fill="url(#gbearFurStandalone)" stroke="#ca8a04" strokeWidth="1.2" />
            <ellipse cx="70" cy="189" rx="10" ry="7" fill="#fef08a" />
            <ellipse cx="130" cy="190" rx="18" ry="12" fill="url(#gbearFurStandalone)" stroke="#ca8a04" strokeWidth="1.2" />
            <ellipse cx="130" cy="189" rx="10" ry="7" fill="#fef08a" />

            {/* Round Chubby Body */}
            <ellipse cx="100" cy="148" rx="46" ry="40" fill="url(#gbearFurStandalone)" stroke="#ca8a04" strokeWidth="1.5" />
            {/* Warm Belly Highlight */}
            <ellipse cx="100" cy="154" rx="30" ry="26" fill="#fef08a" opacity="0.65" />

            {/* Cozy Red T-shirt */}
            <path d="M62 130 Q100 120 138 130 L132 162 Q100 168 68 162 Z" fill="url(#gbearShirtStandalone)" stroke="#991b1b" strokeWidth="1.5" />
            <path d="M78 126 Q100 134 122 126" stroke="#7f1d1d" strokeWidth="1.5" fill="none" />

            {/* Left Arm / Paw */}
            <ellipse cx="58" cy="148" rx="12" ry="10" fill="url(#gbearFurStandalone)" stroke="#ca8a04" strokeWidth="1.2" transform="rotate(-15 58 148)" />

            {/* Right Arm / Paw (Animated Waving Paw!) */}
            <g className="animate-bear-paw-wave" style={{ transformOrigin: '142px 140px' }}>
              <ellipse cx="142" cy="130" rx="14" ry="11" fill="url(#gbearFurStandalone)" stroke="#ca8a04" strokeWidth="1.2" />
              <ellipse cx="142" cy="130" rx="7" ry="5.5" fill="#fef08a" />
            </g>

            {/* Round Bear Ears */}
            <g className="animate-bear-ear-left" style={{ transformOrigin: '68px 65px' }}>
              <circle cx="68" cy="65" r="17" fill="url(#gbearFurStandalone)" stroke="#ca8a04" strokeWidth="1.5" />
              <circle cx="68" cy="65" r="9" fill="#fef08a" />
            </g>
            <g className="animate-bear-ear-right" style={{ transformOrigin: '132px 65px' }}>
              <circle cx="132" cy="65" r="17" fill="url(#gbearFurStandalone)" stroke="#ca8a04" strokeWidth="1.5" />
              <circle cx="132" cy="65" r="9" fill="#fef08a" />
            </g>

            {/* Round Bear Head */}
            <ellipse cx="100" cy="85" rx="42" ry="36" fill="url(#gbearFurStandalone)" stroke="#ca8a04" strokeWidth="1.5" />

            {/* Muzzle */}
            <ellipse cx="100" cy="94" rx="20" ry="15" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />

            {/* Black Button Nose */}
            <ellipse cx="100" cy="88" rx="6" ry="4.5" fill="#18181b" />
            <ellipse cx="98" cy="86.5" rx="2" ry="1.2" fill="#ffffff" />

            {/* Cheerful Smile */}
            <path d="M92 98 Q100 105 108 98" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" fill="none" />

            {/* Rosy Cheeks */}
            <ellipse cx="78" cy="94" rx="7" ry="4.5" fill="#fb7185" opacity="0.7" />
            <ellipse cx="122" cy="94" rx="7" ry="4.5" fill="#fb7185" opacity="0.7" />

            {/* Blinking Eyes */}
            <g className="animate-bear-blink">
              <ellipse cx="88" cy="78" rx="4.5" ry="5.5" fill="#0f172a" />
              <circle cx="89.5" cy="76" r="1.6" fill="#ffffff" />
              <ellipse cx="112" cy="78" rx="4.5" ry="5.5" fill="#0f172a" />
              <circle cx="113.5" cy="76" r="1.6" fill="#ffffff" />
            </g>

            {/* Sparkling Golden Star in Paw */}
            <g transform="translate(155, 115)">
              <circle cx="0" cy="0" r="12" fill="#fbbf24" opacity="0.5" className="animate-pulse" filter="blur(3px)" />
              <polygon points="0,-9 2.5,-2.5 9,0 2.5,2.5 0,9 -2.5,2.5 -9,0 -2.5,-2.5" fill="#fef08a" className="animate-spin-slow" />
              <circle cx="0" cy="0" r="2" fill="#ffffff" />
            </g>

            {/* Ambient Sparkles */}
            <polygon points="45,45 47,50 52,51 48,54 49,59 45,56 41,59 42,54 38,51 43,50" fill="#fde047" className="animate-pulse" />
            <circle cx="160" cy="60" r="2.5" fill="#fef08a" className="animate-ping" />
          </svg>
        </div>
      )}

      {/* EVERYONE ENSEMBLE GATHERING (HUMAN WENDY, LEZAR, MÉLO CLOWN, ORIK, VIVIENNE, HYPO) */}
      {characterId === 'everyone' && (
        <div className="relative w-84 h-88 sm:w-112 sm:h-100 flex items-end justify-center drop-shadow-2xl">
          <svg viewBox="0 0 460 340" className="w-full h-full">
            <defs>
              <linearGradient id="ensDarkLord" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#09090b" />
              </linearGradient>
              <linearGradient id="ensWendySweater" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#9a3412" />
              </linearGradient>
              <linearGradient id="ensCake" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbcfe8" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
              <linearGradient id="ensVivienneHair" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9a3412" />
                <stop offset="100%" stopColor="#431407" />
              </linearGradient>
            </defs>

            {/* Background Glow */}
            <ellipse cx="230" cy="180" rx="200" ry="130" fill="#fef08a" opacity="0.15" />

            {/* 1. MÉLO CLOWN (Back Left) */}
            <g transform="translate(20, 20)">
              {/* Tall Top Hat */}
              <polygon points="52,100 88,100 85,32 55,32" fill="#09090b" />
              <ellipse cx="70" cy="100" rx="26" ry="6" fill="#09090b" />
              <polygon points="53,99 87,99 86,86 54,86" fill="#3b0764" />
              {/* Music note on hat */}
              <text x="65" y="96" fill="#fbbf24" fontSize="10" fontWeight="bold">♪</text>
              {/* Porcelain Face */}
              <ellipse cx="70" cy="128" rx="18" ry="22" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="0.8" />
              {/* Monocle */}
              <circle cx="78" cy="126" r="6" fill="none" stroke="#fbbf24" strokeWidth="1.2" />
              <line x1="78" y1="132" x2="84" y2="160" stroke="#ca8a04" strokeWidth="0.6" strokeDasharray="2,1" />
              {/* Smile & Eyes */}
              <g className="animate-eye-blink">
                <circle cx="62" cy="124" r="2" fill="#09090b" />
                <circle cx="78" cy="125" r="2" fill="#09090b" />
              </g>
              <path d="M64 138 Q70 144 76 138" stroke="#3b0764" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              {/* Coat & Violet Collar */}
              <path d="M35 320 L70 155 L105 320 Z" fill="url(#ensDarkLord)" />
              <polygon points="56,155 70,210 60,155" fill="#3b0764" />
              <polygon points="84,155 70,210 80,155" fill="#3b0764" />
            </g>

            {/* 2. VIVIENNE THE GLASSMAKER (Back Right) */}
            <g transform="translate(315, 45)">
              {/* Flowing Hair */}
              <path d="M38 105 Q60 65 82 105 Q92 170 80 190 Q60 175 40 190 Q28 170 38 105 Z" fill="url(#ensVivienneHair)" />
              {/* Face */}
              <ellipse cx="60" cy="115" rx="19" ry="22" fill="#fed7aa" />
              {/* Amber Goggles on Forehead */}
              <rect x="42" y="94" width="16" height="10" rx="3" fill="#b45309" stroke="#f59e0b" strokeWidth="1.2" />
              <rect x="62" y="94" width="16" height="10" rx="3" fill="#b45309" stroke="#f59e0b" strokeWidth="1.2" />
              <line x1="58" y1="99" x2="62" y2="99" stroke="#f59e0b" strokeWidth="1.2" />
              {/* Warm Eyes & Smile */}
              <g className="animate-eye-blink">
                <circle cx="52" cy="116" r="2.2" fill="#292524" />
                <circle cx="68" cy="116" r="2.2" fill="#292524" />
              </g>
              <path d="M54 127 Q60 133 66 127" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              {/* Apron & Shirt */}
              <path d="M28 295 L60 140 L92 295 Z" fill="#78350f" />
              <ellipse cx="60" cy="155" rx="14" ry="12" fill="#d97706" />
            </g>

            {/* 3. HUMAN WENDY (Center) */}
            <g transform="translate(160, 30)">
              {/* Soft flowing hair */}
              <path d="M42 120 Q70 70 98 120 Q110 210 95 240 Q70 230 45 240 Q30 210 42 120 Z" fill="#292524" />
              {/* Face */}
              <ellipse cx="70" cy="130" rx="22" ry="25" fill="#fed7aa" />
              {/* Front Bangs */}
              <path d="M50 115 Q70 100 90 115 Q78 135 50 115 Z" fill="#292524" />
              {/* Star Clip */}
              <polygon points="88,108 90,112 94,113 91,116 92,120 88,118 84,120 85,116 82,113 86,112" fill="#fbbf24" className="animate-pulse" />
              {/* Radiant Green Eyes */}
              <g className="animate-eye-blink">
                <ellipse cx="62" cy="128" rx="2.8" ry="3.8" fill="#10b981" />
                <ellipse cx="78" cy="128" rx="2.8" ry="3.8" fill="#10b981" />
                <circle cx="63" cy="126" r="1" fill="#ffffff" />
                <circle cx="79" cy="126" r="1" fill="#ffffff" />
              </g>
              {/* Rosy Cheeks & Happy Smile */}
              <ellipse cx="55" cy="134" rx="4" ry="2.5" fill="#f43f5e" opacity="0.4" />
              <ellipse cx="85" cy="134" rx="4" ry="2.5" fill="#f43f5e" opacity="0.4" />
              <path d="M62 142 Q70 150 78 142" stroke="#e11d48" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              {/* Cozy Orange Sweater */}
              <path d="M30 310 Q70 155 110 310 Z" fill="url(#ensWendySweater)" />
            </g>

            {/* 3b. GBEAR THE PLUSH (Joyfully waving in background beside Wendy) 🧸👋✨ */}
            <g
              transform="translate(252, 92)"
              onClick={handleGBearClick}
              className={`cursor-pointer select-none transition-transform duration-300 hover:scale-110 ${
                isGBearBouncing ? 'animate-gbear-bounce-click' : 'animate-bear-wiggle'
              }`}
              style={{ transformOrigin: '24px 30px' }}
            >
              {/* Ambient Golden Glow */}
              <circle cx="24" cy="24" r="24" fill="#fbbf24" opacity="0.25" className="animate-pulse" filter="blur(6px)" />
              {/* Round Chubby Body */}
              <ellipse cx="24" cy="38" rx="17" ry="15" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
              {/* Cozy Red T-shirt */}
              <path d="M11 32 Q24 28 37 32 L35 42 Q24 45 13 42 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
              {/* Round Bear Ears with Wiggle */}
              <g className="animate-bear-ear-left">
                <circle cx="12" cy="14" r="5.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                <circle cx="12" cy="14" r="2.8" fill="#fef08a" />
              </g>
              <g className="animate-bear-ear-right">
                <circle cx="36" cy="14" r="5.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                <circle cx="36" cy="14" r="2.8" fill="#fef08a" />
              </g>
              {/* Round Bear Head */}
              <ellipse cx="24" cy="22" rx="15" ry="13" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
              {/* Muzzle */}
              <ellipse cx="24" cy="25" rx="7.5" ry="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
              {/* Nose */}
              <ellipse cx="24" cy="23" rx="2.2" ry="1.6" fill="#18181b" />
              {/* Smile */}
              <path d="M20 26.5 Q24 29.5 28 26.5" stroke="#78350f" strokeWidth="1" strokeLinecap="round" fill="none" />
              {/* Rosy Cheeks */}
              <ellipse cx="15" cy="25" rx="2.5" ry="1.8" fill="#fb7185" opacity="0.7" />
              <ellipse cx="33" cy="25" rx="2.5" ry="1.8" fill="#fb7185" opacity="0.7" />
              {/* Blinking Eyes */}
              <g className="animate-bear-blink">
                <circle cx="19" cy="20" r="1.8" fill="#0f172a" />
                <circle cx="19.5" cy="19.5" r="0.6" fill="#ffffff" />
                <circle cx="29" cy="20" r="1.8" fill="#0f172a" />
                <circle cx="29.5" cy="19.5" r="0.6" fill="#ffffff" />
              </g>
              {/* Left Paw Resting */}
              <ellipse cx="13" cy="38" rx="4.5" ry="3.8" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
              {/* Right Paw - Waving Hello to everyone! 🧸👋 */}
              <g className="animate-bear-paw-wave">
                <ellipse cx="37" cy="28" rx="5" ry="4" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
                <ellipse cx="37" cy="28" rx="2.5" ry="2" fill="#fef08a" />
              </g>
              {/* Sparkles around GBear */}
              <circle cx="6" cy="10" r="1.5" fill="#fef08a" className="animate-ping" />
              <polygon points="42,8 43.5,11 46.5,11.5 44.5,13.5 45,16.5 42,15 39,16.5 39.5,13.5 37.5,11.5 40.5,11" fill="#fde047" className="animate-pulse" />
            </g>

            {/* 4. ORIK THE SPRITE (Front Left) */}
            <g transform="translate(85, 185)">
              <ellipse cx="35" cy="85" rx="28" ry="30" fill="#3f6212" />
              <ellipse cx="35" cy="45" rx="20" ry="20" fill="#65a30d" />
              {/* Blooming flower on head */}
              <circle cx="35" cy="20" r="5" fill="#f472b6" />
              <circle cx="35" cy="20" r="2" fill="#fef08a" />
              {/* Pink Pin on Chest */}
              <circle cx="30" cy="75" r="3.5" fill="#ec4899" stroke="#db2777" strokeWidth="0.8" />
              {/* Shiny Sprite Eyes & Grin */}
              <g className="animate-eye-blink">
                <circle cx="28" cy="44" r="3" fill="#14532d" />
                <circle cx="42" cy="44" r="3" fill="#14532d" />
                <circle cx="29" cy="42" r="1" fill="#ffffff" />
                <circle cx="43" cy="42" r="1" fill="#ffffff" />
              </g>
              <path d="M30 54 Q35 60 40 54" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>

            {/* 5. HYPO THE HIPPO (Front Center-Left) */}
            <g transform="translate(145, 205)">
              {/* Plush Body */}
              <ellipse cx="25" cy="55" rx="22" ry="24" fill="#94a3b8" />
              <ellipse cx="25" cy="30" rx="18" ry="16" fill="#94a3b8" />
              <ellipse cx="25" cy="36" rx="14" ry="10" fill="#cbd5e1" />
              {/* Ears */}
              <circle cx="12" cy="18" r="5" fill="#94a3b8" />
              <circle cx="38" cy="18" r="5" fill="#94a3b8" />
              {/* Eyes & Cheeks */}
              <circle cx="18" cy="28" r="1.8" fill="#1e293b" />
              <circle cx="32" cy="28" r="1.8" fill="#1e293b" />
              <circle cx="14" cy="34" r="2.5" fill="#f43f5e" opacity="0.4" />
              <circle cx="36" cy="34" r="2.5" fill="#f43f5e" opacity="0.4" />
              {/* Neck Pillow */}
              <path d="M12 44 Q25 54 38 44 Q44 58 25 58 Q6 58 12 44 Z" fill="#f472b6" stroke="#db2777" strokeWidth="1" />
            </g>

            {/* 6. LEZAR THE TONKINESE CAT (Front Right) */}
            <g transform="translate(285, 175)">
              {/* Cat Body */}
              <ellipse cx="45" cy="95" rx="28" ry="30" fill="#d6c7b2" />
              <ellipse cx="45" cy="52" rx="22" ry="18" fill="#d6c7b2" />
              {/* Seal-Mink Mask */}
              <ellipse cx="45" cy="56" rx="12" ry="10" fill="#544133" />
              {/* Ears */}
              <polygon points="28,45 35,22 45,40" fill="#4a3728" />
              <polygon points="62,45 55,22 45,40" fill="#4a3728" />
              {/* Happy Winking / Purring Eyes */}
              <g className="animate-eye-blink">
                <path d="M35 52 Q40 46 44 52" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                <ellipse cx="54" cy="52" rx="3.5" ry="4.5" fill="#38bdf8" />
                <circle cx="55" cy="50" r="1.2" fill="#ffffff" />
              </g>

              {/* Pink Nose & Bell */}
              <polygon points="43,60 47,60 45,63" fill="#f472b6" />
              <circle cx="45" cy="74" r="4.5" fill="#f59e0b" />
            </g>

            {/* 7. GLOWING BIRTHDAY CAKE & STEAMING HOT CHOCOLATE */}
            <g transform="translate(195, 235)">
              <ellipse cx="45" cy="65" rx="46" ry="10" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
              <rect x="15" y="35" width="60" height="28" rx="4" fill="url(#ensCake)" stroke="#f472b6" strokeWidth="1.5" />
              <rect x="15" y="48" width="60" height="4" fill="#e11d48" />
              {/* Strawberries */}
              <circle cx="30" cy="32" r="4" fill="#ef4444" />
              <circle cx="45" cy="30" r="4.5" fill="#ef4444" />
              <circle cx="60" cy="32" r="4" fill="#ef4444" />
              {/* Lit Candles */}
              <rect x="36" y="16" width="3" height="14" fill="#38bdf8" />
              <rect x="44" y="12" width="3" height="18" fill="#fbbf24" />
              <rect x="52" y="16" width="3" height="14" fill="#ec4899" />
              {/* Flames */}
              <circle cx="37.5" cy="13" r="3.5" fill="#fde047" className="animate-candle-flame" />
              <circle cx="45.5" cy="9" r="4" fill="#fde047" className="animate-candle-flame" />
              <circle cx="53.5" cy="13" r="3.5" fill="#fde047" className="animate-candle-flame" />
            </g>

            {/* Cheerful Golden Stardust & Party Confetti */}
            <polygon points="60,30 63,36 70,37 65,42 66,48 60,45 54,48 55,42 50,37 57,36" fill="#fbbf24" />
            <polygon points="210,18 213,24 220,25 215,30 216,36 210,33 204,36 205,30 200,25 207,24" fill="#fde047" />
            <polygon points="380,35 383,41 390,42 385,47 386,53 380,50 374,53 375,47 370,42 377,41" fill="#fbbf24" />
            <circle cx="120" cy="50" r="2" fill="#f43f5e" />
            <circle cx="330" cy="70" r="2.5" fill="#38bdf8" />
            <circle cx="170" cy="40" r="2" fill="#a855f7" />
            <circle cx="280" cy="35" r="2.2" fill="#4ade80" />
          </svg>
        </div>
      )}
    </div>
  );
};
