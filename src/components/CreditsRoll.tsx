import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Heart,
  Sun,
  Home,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Pause,
  Play,
  SkipForward,
  Globe,
  Star,
  Wand2,
  ChevronLeft,
  ChevronRight,
  Music,
} from 'lucide-react';
import { CharacterId, Language } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';
import { CharacterPortrait } from './CharacterPortrait';

interface CreditsRollProps {
  language: Language;
  onToggleLanguage?: () => void;
  isMuted?: boolean;
  onToggleAudio?: () => void;
  onViewMemories: () => void;
  onRestart: () => void;
  onReturnToTitle: () => void;
}

interface StarParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  symbol: string;
  color: string;
}

interface ParadeCharacter {
  id: CharacterId;
  nameEn: string;
  nameFr: string;
  roleEn: string;
  roleFr: string;
  descriptionEn: string;
  descriptionFr: string;
  expression: string;
  showSwwPin?: boolean;
  enterFrom: 'left' | 'right' | 'top';
  exitTo: 'left' | 'right' | 'bottom';
  icon: string;
  bgGlow: string;
  borderGlow: string;
  onSound: () => void;
}

export const CreditsRoll: React.FC<CreditsRollProps> = ({
  language,
  onToggleLanguage,
  isMuted = false,
  onToggleAudio,
  onViewMemories,
  onRestart,
  onReturnToTitle,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [hasFadedOutMusic, setHasFadedOutMusic] = useState(false);

  // Wendy Super Witch transformation toggle in credits cards (toggles every click!)
  const [wendyForm, setWendyForm] = useState<'human_witch' | 'witch'>('human_witch');

  // Hidden random chance cameo of GBear walking alongside the credits text
  const [hasGBearCameo] = useState<boolean>(() => Math.random() < 0.2);
  const [isGBearCameoClicked, setIsGBearCameoClicked] = useState(false);

  // --- CHARACTER PARADE STATE ---
  // Reordered: Wendy & GBear first, Orik (with flower), Vivienne (with artisan hat), Lezar, Mélo Clown in the last part!
  const paradeCast: ParadeCharacter[] = [
    {
      id: 'human_witch',
      nameEn: 'Wendy & GBear',
      nameFr: 'Wendy & GBear',
      roleEn: 'Bearer of the Sun & Heart of Light',
      roleFr: 'Porteuse du Soleil & Cœur de Lumière',
      descriptionEn:
        'Wendy cuddles GBear warmly with blushing happiness, proudly wearing her golden SWW brooch gifted by Mélo Clown.',
      descriptionFr:
        'Wendy serre tendrement GBear avec un doux sourire ému, arborant fièrement sa broche dorée SWW offerte par le Clown Mélo.',
      expression: 'holding_gbear',
      showSwwPin: true,
      enterFrom: 'left',
      exitTo: 'right',
      icon: '☀️',
      bgGlow: 'rgba(251, 191, 36, 0.3)',
      borderGlow: '#fde047',
      onSound: () => audioSynth.playSoundEffect('wendy_giggle'),
    },
    {
      id: 'orik',
      nameEn: 'Orik the Forest Sprite',
      nameFr: 'Orik le Follet des Bois',
      roleEn: 'Guardian Sprout of the Whispering Woods',
      roleFr: 'Pousse Gardienne des Bois Chuchotants',
      descriptionEn:
        'Orik’s head flower blooms radiantly in pink and gold stardust as he hops and flutters his gossamer wings in joyous victory!',
      descriptionFr:
        'La fleur sur la tête d’Orik s’épanouit magnifiquement en poussière d’étoiles rose et or tandis qu’il voltige d’allégresse !',
      expression: 'happy',
      enterFrom: 'top',
      exitTo: 'left',
      icon: '🌿',
      bgGlow: 'rgba(34, 197, 94, 0.28)',
      borderGlow: '#4ade80',
      onSound: () => audioSynth.playSoundEffect('orik_chirp'),
    },
    {
      id: 'vivienne',
      nameEn: 'Vivienne the Glassmaker',
      nameFr: 'Vivienne la Verrière',
      roleEn: 'Master Artisan of Amber & Kiln',
      roleFr: 'Maître Artisane d’Ambre & du Fourneau',
      descriptionEn:
        'Vivienne adjusts her chic French artisan beret with a golden star brooch, lifting her glowing prism bottle with pride and joy!',
      descriptionFr:
        'Vivienne ajuste son élégant béret d’artisane à broche étoilée, élevant son flacon de verre étincelant avec fierté et joie !',
      expression: 'inspired',
      enterFrom: 'left',
      exitTo: 'right',
      icon: '🏺',
      bgGlow: 'rgba(245, 158, 11, 0.28)',
      borderGlow: '#fbbf24',
      onSound: () => audioSynth.playSoundEffect('glass_shimmer'),
    },
    {
      id: 'lezar',
      nameEn: 'Lezar the Twilight Familiar',
      nameFr: 'Lezar le Familier Crépusculaire',
      roleEn: 'Faithful Shadow Companion',
      roleFr: 'Fidèle Compagnon de l’Ombre',
      descriptionEn:
        'Lezar stretches his paws and purrs in peaceful twilight warmth, his celestial paws glowing softly with quiet contentment.',
      descriptionFr:
        'Lezar s’étire avec grâce et ronronne doucement dans la tiédeur du soir, ses pattes étoilées brillant doucement.',
      expression: 'purring',
      enterFrom: 'left',
      exitTo: 'right',
      icon: '🐈',
      bgGlow: 'rgba(99, 102, 241, 0.25)',
      borderGlow: '#818cf8',
      onSound: () => audioSynth.playSoundEffect('purr'),
    },
    {
      id: 'hypo',
      nameEn: 'Hypo the Hippo Plushie',
      nameFr: 'Hypo la Peluche Hippopotame',
      roleEn: 'Bearer of the Heavenly Neck Pillow & Serene Rest',
      roleFr: 'Gardienne du Coussin de Repos Céleste & Douceur',
      descriptionEn:
        'Hypo snuggles her magical neck pillow, reminding Wendy that rest and sweet naps are the truest magic of all!',
      descriptionFr:
        'Hypo serre son coussin de repos magique, rappelant à Wendy que le repos et les douces siestes sont la plus belle des magies !',
      expression: 'cuddling_pillow',
      enterFrom: 'left',
      exitTo: 'right',
      icon: '🦛',
      bgGlow: 'rgba(244, 114, 182, 0.28)',
      borderGlow: '#f472b6',
      onSound: () => audioSynth.playSoundEffect('pillow_squeak'),
    },
    {
      id: 'clown',
      nameEn: 'Mélo Clown (The Dark Lord)',
      nameFr: 'Le Clown Mélo (Le Seigneur Sombre)',
      roleEn: 'Gentleman of Obsidian & Feast Master',
      roleFr: 'Gentilhomme d’Obsidienne & Maître de Fête',
      descriptionEn:
        'A dramatic theatrical bow from the Gentleman of Obsidian! Presenting his strawberry-chocolate cake and the golden SWW brooch with grand flair.',
      descriptionFr:
        'Un salut théâtral du Gentilhomme d’Obsidienne ! Offrant son délicieux gâteau fraise-chocolat et la broche dorée SWW avec panache.',
      expression: 'gentleman_theatrical',
      enterFrom: 'right',
      exitTo: 'left',
      icon: '🎩',
      bgGlow: 'rgba(168, 85, 247, 0.3)',
      borderGlow: '#c084fc',
      onSound: () => audioSynth.playClownMusicalNote(),
    },
  ];

  const [paradeIndex, setParadeIndex] = useState(0);
  const [paradePhase, setParadePhase] = useState<'entering' | 'spotlight' | 'exiting'>('entering');
  const [isParadeAutoCycling, setIsParadeAutoCycling] = useState(true);
  const [isCharacterClicked, setIsCharacterClicked] = useState(false);
  const [isParadeVisible, setIsParadeVisible] = useState(true);
  const marchStepRef = useRef(0);

  // Seamless musical integration on mount: Play emotional credits orchestral theme
  useEffect(() => {
    audioSynth.playMusicTheme('credits');
    setHasFadedOutMusic(false);
  }, []);

  // Intersection Observer to monitor sections during credits scroll & sync animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === 'parade-theater-stage') {
            setIsParadeVisible(entry.isIntersecting);
          }
        });
      },
      { threshold: 0.25 }
    );

    const paradeEl = document.getElementById('parade-theater-stage');
    if (paradeEl) observer.observe(paradeEl);

    return () => observer.disconnect();
  }, []);

  // Rhythmic marching parade sound effect during character parade sequence
  useEffect(() => {
    if (!isParadeVisible || isPaused) return;

    const interval = window.setInterval(() => {
      marchStepRef.current += 1;
      audioSynth.playParadeMarchBeat(marchStepRef.current);
    }, 1100);

    return () => clearInterval(interval);
  }, [isParadeVisible, isPaused]);

  // Automated Character Parade Lifecycle Timer
  useEffect(() => {
    if (!isParadeAutoCycling) return;

    let timeoutId: number;

    if (paradePhase === 'entering') {
      // 0.85s entering slide
      timeoutId = window.setTimeout(() => {
        setParadePhase('spotlight');
      }, 850);
    } else if (paradePhase === 'spotlight') {
      // 4.2s in the center spotlight with plenty of time and space
      timeoutId = window.setTimeout(() => {
        setParadePhase('exiting');
      }, 4200);
    } else if (paradePhase === 'exiting') {
      // 0.85s exiting slide, then advance to next character
      timeoutId = window.setTimeout(() => {
        setParadeIndex((prev) => (prev + 1) % paradeCast.length);
        setParadePhase('entering');
      }, 850);
    }

    return () => clearTimeout(timeoutId);
  }, [paradePhase, isParadeAutoCycling, paradeIndex, paradeCast.length]);

  const handleManualSelectCharacter = (idx: number) => {
    if (idx === paradeIndex && paradePhase === 'spotlight') {
      handleSpotlightCharacterClick();
      return;
    }
    const char = paradeCast[idx];
    char.onSound();
    setParadeIndex(idx);
    setParadePhase('entering');
  };

  const handleNextParadeCharacter = () => {
    const nextIdx = (paradeIndex + 1) % paradeCast.length;
    paradeCast[nextIdx].onSound();
    setParadeIndex(nextIdx);
    setParadePhase('entering');
  };

  const handlePrevParadeCharacter = () => {
    const prevIdx = (paradeIndex - 1 + paradeCast.length) % paradeCast.length;
    paradeCast[prevIdx].onSound();
    setParadeIndex(prevIdx);
    setParadePhase('entering');
  };

  const handleSpotlightCharacterClick = () => {
    const currentChar = paradeCast[paradeIndex];
    currentChar.onSound();
    audioSynth.playParadeMarchBeat(marchStepRef.current + 1);
    setIsCharacterClicked(true);
    setTimeout(() => setIsCharacterClicked(false), 900);
  };

  // Toggle Wendy form between human and super witch on card click
  const handleToggleWendy = () => {
    audioSynth.playSoundEffect('magic_sparkle');
    setWendyForm((prev) => (prev === 'human_witch' ? 'witch' : 'human_witch'));
  };

  // Smooth vertical auto-scroll loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const scrollLoop = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1); // clamp delta to avoid sudden skips
      lastTime = time;

      if (!isPaused && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollStep = 36 * speedMultiplier * delta;
        container.scrollTop += scrollStep;

        const maxScroll = container.scrollHeight - container.clientHeight;

        // Trigger soft musical fade-out when reaching the final dedication section (approx 78% scroll)
        if (!hasFadedOutMusic && maxScroll > 0 && container.scrollTop > maxScroll * 0.78) {
          setHasFadedOutMusic(true);
          audioSynth.fadeOutMusic(5);
        }

        if (container.scrollTop >= maxScroll - 4) {
          if (!hasFadedOutMusic) {
            setHasFadedOutMusic(true);
            audioSynth.fadeOutMusic(4);
          }
        }
      }

      animationFrameId = requestAnimationFrame(scrollLoop);
    };

    animationFrameId = requestAnimationFrame(scrollLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, speedMultiplier, hasFadedOutMusic]);

  const handleSkipToBottom = () => {
    audioSynth.playSoundEffect('click');
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      if (!hasFadedOutMusic) {
        setHasFadedOutMusic(true);
        audioSynth.fadeOutMusic(3);
      }
    }
  };

  const handleToggleSpeed = () => {
    audioSynth.playSoundEffect('click');
    setSpeedMultiplier((prev) => (prev === 1 ? 2.2 : prev === 2.2 ? 4 : 1));
  };

  const handleTogglePause = () => {
    audioSynth.playSoundEffect('click');
    setIsPaused((prev) => !prev);
  };

  const handleGBearCameoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioSynth.playGBearGiggle();
    setIsGBearCameoClicked(true);
    setTimeout(() => setIsGBearCameoClicked(false), 2000);
  };

  const currentParadeChar = paradeCast[paradeIndex];

  // Derive animation transform based on parade phase and direction
  const getParadeTransformStyle = () => {
    if (paradePhase === 'entering') {
      const enterOffset =
        currentParadeChar.enterFrom === 'left'
          ? '-translate-x-full opacity-0 scale-90'
          : currentParadeChar.enterFrom === 'top'
          ? '-translate-y-full opacity-0 scale-90'
          : 'translate-x-full opacity-0 scale-90';
      return enterOffset;
    }
    if (paradePhase === 'exiting') {
      const exitOffset =
        currentParadeChar.exitTo === 'left'
          ? '-translate-x-full opacity-0 scale-90'
          : currentParadeChar.exitTo === 'bottom'
          ? 'translate-y-full opacity-0 scale-90'
          : 'translate-x-full opacity-0 scale-90';
      return exitOffset;
    }
    return 'translate-x-0 translate-y-0 opacity-100 scale-100';
  };

  return (
    <div
      id="credits-roll-container"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-amber-100 select-none overflow-hidden animate-fade-in font-serif"
    >
      {/* Background Ambience: Night Stardust & Floating Embers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
        <div className="absolute top-1/6 left-1/4 w-2 h-2 rounded-full bg-amber-300 animate-ping" />
        <div className="absolute top-1/3 right-1/5 w-1.5 h-1.5 rounded-full bg-yellow-200 animate-pulse" />
        <div className="absolute top-2/3 left-1/5 w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <div className="absolute top-1/2 left-2/3 w-1.5 h-1.5 rounded-full bg-pink-300 animate-pulse" />

        {/* Soft Golden Gradient Glow at Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* Special Hidden Cameo of GBear walking alongside the credits */}
      {hasGBearCameo && (
        <div
          id="gbear-hidden-cameo"
          onClick={handleGBearCameoClick}
          className="fixed bottom-16 right-4 sm:right-8 z-50 flex flex-col items-center cursor-pointer group animate-fade-in"
          title={
            language === 'en'
              ? 'GBear is walking along with the credits! Click him!'
              : 'GBear marche avec le générique ! Cliquez sur lui !'
          }
        >
          <div className="relative">
            <div className="absolute -inset-2 bg-amber-400/20 rounded-full blur-md animate-pulse" />
            <div
              className={`transition-transform duration-300 transform ${
                isGBearCameoClicked ? 'scale-125 -translate-y-2' : 'group-hover:scale-110'
              } animate-bounce`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-950/80 rounded-full border-2 border-amber-400/80 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                <CharacterPortrait characterId="gbear" expression="waving" language={language} />
              </div>
            </div>
            <div className="absolute -top-7 -left-12 px-2 py-0.5 rounded-full bg-slate-900/90 border border-amber-400/50 text-[10px] font-sans text-amber-200 shadow-md whitespace-nowrap opacity-90 group-hover:opacity-100">
              🧸 {language === 'en' ? 'GBear Cameo! ✨' : 'Caméo de GBear ! ✨'}
            </div>
          </div>
        </div>
      )}

      {/* Top Floating Control Bar */}
      <header className="relative z-30 flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-amber-500/20 shadow-md">
        <div className="flex items-center gap-2 text-amber-300 text-xs sm:text-sm font-semibold tracking-wider uppercase">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{language === 'en' ? 'Storybook Credits' : 'Générique du Conte'}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Toggle Speed */}
          <button
            id="credits-btn-speed"
            onClick={handleToggleSpeed}
            className="px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-300 text-xs border border-amber-500/30 flex items-center gap-1 transition-colors cursor-pointer"
            title={language === 'en' ? 'Change scroll speed' : 'Changer la vitesse de défilement'}
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="font-mono">{speedMultiplier}x</span>
          </button>

          {/* Pause / Play Auto-Scroll */}
          <button
            id="credits-btn-pause"
            onClick={handleTogglePause}
            className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
            title={
              isPaused
                ? language === 'en'
                  ? 'Resume auto-scroll'
                  : 'Reprendre le défilement'
                : language === 'en'
                ? 'Pause auto-scroll'
                : 'Mettre en pause'
            }
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Skip to Bottom */}
          <button
            id="credits-btn-skip"
            onClick={handleSkipToBottom}
            className="px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-300 text-xs border border-amber-500/30 flex items-center gap-1 transition-colors cursor-pointer"
            title={language === 'en' ? 'Jump to dedication & final screen' : 'Aller à la dédicace finale'}
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'en' ? 'Skip' : 'Passer'}</span>
          </button>

          {/* Toggle Audio */}
          {onToggleAudio && (
            <button
              id="credits-btn-audio"
              onClick={onToggleAudio}
              className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
              title={
                isMuted
                  ? language === 'en'
                    ? 'Unmute audio'
                    : 'Activer le son'
                  : language === 'en'
                  ? 'Mute audio'
                  : 'Couper le son'
              }
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Toggle Language */}
          {onToggleLanguage && (
            <button
              id="credits-btn-language"
              onClick={onToggleLanguage}
              className="px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-300 text-xs border border-amber-500/30 flex items-center gap-1 transition-colors cursor-pointer font-sans"
              title={language === 'en' ? 'Passer en Français' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language.toUpperCase()}</span>
            </button>
          )}

          {/* Return to Title */}
          <button
            id="credits-btn-exit"
            onClick={onReturnToTitle}
            className="px-3 py-1.5 rounded-full bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 text-xs border border-amber-400/50 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ml-1"
          >
            <Home className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'en' ? 'Menu' : 'Menu'}</span>
          </button>
        </div>
      </header>

      {/* Main Credits Scroll Viewport */}
      <div
        id="credits-scroll-viewport"
        ref={scrollContainerRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-8 py-16 scroll-smooth text-center focus:outline-none"
        tabIndex={0}
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-16 pb-24">
          {/* Initial Spacer */}
          <div className="h-8" />

          {/* Header & Logo Emblem */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600/30 via-yellow-400/20 to-amber-500/30 border-2 border-amber-400/80 p-2 shadow-[0_0_40px_rgba(251,191,36,0.35)] flex items-center justify-center mb-4 animate-pulse">
              <Sun className="w-12 h-12 text-amber-300 animate-spin-slow" />
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-amber-300/80 font-bold mb-2">
              {language === 'en'
                ? 'An Interactive Tale of Shared Light'
                : 'Un Conte Interactif de Lumière Partagée'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 tracking-wider mb-4">
              {language === 'en'
                ? 'THE WITCH WHO CARRIED THE SUN'
                : 'LA SORCIÈRE QUI PORTAIT LE SOLEIL'}
            </h1>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
          </div>

          {/* ========================================================================= */}
          {/* SECTION: AUTOMATED CHARACTER PARADE THEATER (Spacious, Elegant, Animated) */}
          {/* ========================================================================= */}
          <div className="w-full flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>
                {language === 'en'
                  ? 'GRAND CHARACTER PARADE'
                  : 'LA GRANDE PARADE DES PERSONNAGES'}
              </span>
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>

            {/* Spacious Parade Stage */}
            <div
              id="parade-theater-stage"
              className="w-full max-w-xl rounded-3xl bg-gradient-to-b from-slate-900/95 via-purple-950/40 to-amber-950/40 border-2 border-amber-400/60 shadow-[0_0_40px_rgba(251,191,36,0.2)] overflow-hidden relative p-6 sm:p-8 flex flex-col items-center"
            >
              {/* Stage Lighting Spotlight Conic Gradient */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-700"
                style={{
                  background: `radial-gradient(ellipse at 50% 30%, ${currentParadeChar.bgGlow} 0%, transparent 70%)`,
                }}
              />

              {/* Velvet Top Curtains & Gold Trim Header */}
              <div className="w-full flex items-center justify-between z-20 mb-2">
                <button
                  id="parade-btn-prev"
                  onClick={handlePrevParadeCharacter}
                  className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 transition-transform active:scale-90 cursor-pointer shadow-md"
                  title={language === 'en' ? 'Previous Character' : 'Personnage Précédent'}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-amber-400/40 text-[11px] text-amber-200 font-sans tracking-wide shadow-inner">
                  <Music className="w-3 h-3 text-amber-400 animate-spin-slow" />
                  <span>
                    {language === 'en'
                      ? `Spotlight: ${currentParadeChar.nameEn}`
                      : `En scène : ${currentParadeChar.nameFr}`}
                  </span>
                </div>

                <button
                  id="parade-btn-next"
                  onClick={handleNextParadeCharacter}
                  className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 transition-transform active:scale-90 cursor-pointer shadow-md"
                  title={language === 'en' ? 'Next Character' : 'Personnage Suivant'}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Spacious Animated Spotlight Chamber */}
              <div className="relative w-full h-64 sm:h-72 flex items-center justify-center overflow-hidden my-2">
                {/* Glowing Floor Stage Pedestal */}
                <div
                  className="absolute bottom-2 w-48 sm:w-60 h-10 rounded-[100%] border-2 transition-all duration-700 shadow-lg"
                  style={{
                    borderColor: currentParadeChar.borderGlow,
                    backgroundColor: currentParadeChar.bgGlow,
                    boxShadow: `0 0 30px ${currentParadeChar.borderGlow}80`,
                  }}
                />

                {/* Animated Character In Motion (Entering, Idle Spotlight, Exiting) */}
                <div
                  key={`${currentParadeChar.id}-${paradeIndex}-${paradePhase}`}
                  onClick={handleSpotlightCharacterClick}
                  className={`transition-all duration-700 ease-out cursor-pointer flex flex-col items-center justify-center transform ${getParadeTransformStyle()} ${
                    isCharacterClicked ? 'scale-110 -translate-y-3' : 'hover:scale-105'
                  }`}
                  title={
                    language === 'en'
                      ? 'Click to hear their voice & joyful reaction!'
                      : 'Cliquez pour écouter leur voix et réaction joyeuse !'
                  }
                >
                  {/* Floating Sparkling Magic Glow Aura */}
                  <div className="relative w-48 h-52 sm:w-56 sm:h-60 flex items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full blur-xl animate-pulse pointer-events-none"
                      style={{ backgroundColor: currentParadeChar.bgGlow }}
                    />
                    <div
                      className={`transform ${
                        currentParadeChar.id === 'clown'
                          ? 'scale-75 sm:scale-80 origin-bottom'
                          : currentParadeChar.id === 'hypo'
                          ? 'scale-105 sm:scale-115 origin-bottom'
                          : currentParadeChar.id === 'artisan' || currentParadeChar.id === 'vivienne'
                          ? 'scale-75 sm:scale-80 origin-bottom'
                          : currentParadeChar.id === 'orik'
                          ? 'scale-100 sm:scale-110 origin-bottom'
                          : 'scale-95 sm:scale-105'
                      }`}
                    >
                      <CharacterPortrait
                        characterId={currentParadeChar.id}
                        expression={currentParadeChar.expression}
                        showSwwPin={currentParadeChar.showSwwPin}
                        language={language}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Character Information & Theatrical Action Narrative */}
              <div className="relative z-20 text-center max-w-md mt-2">
                <h3 className="text-lg sm:text-xl font-bold text-amber-100 flex items-center justify-center gap-2 mb-1">
                  <span>{currentParadeChar.icon}</span>
                  <span>
                    {language === 'en' ? currentParadeChar.nameEn : currentParadeChar.nameFr}
                  </span>
                </h3>
                <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">
                  {language === 'en' ? currentParadeChar.roleEn : currentParadeChar.roleFr}
                </p>
                <p className="text-xs sm:text-sm text-stone-200/90 italic leading-relaxed px-2">
                  {language === 'en'
                    ? currentParadeChar.descriptionEn
                    : currentParadeChar.descriptionFr}
                </p>
              </div>

              {/* Stage Navigation: Cast Selector Chips */}
              <div className="w-full flex items-center justify-center gap-2 sm:gap-3 flex-wrap mt-6 pt-4 border-t border-amber-500/20">
                {paradeCast.map((c, idx) => {
                  const isSelected = idx === paradeIndex;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleManualSelectCharacter(idx)}
                      className={`px-3 py-1.5 rounded-full text-xs font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105 border border-amber-200'
                          : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300/80 border border-amber-500/30'
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span className="hidden sm:inline">
                        {language === 'en'
                          ? c.nameEn.split(' ')[0]
                          : c.nameFr.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}

                {/* Auto-Cycle Toggle */}
                <button
                  id="parade-btn-autocycle"
                  onClick={() => {
                    audioSynth.playSoundEffect('click');
                    setIsParadeAutoCycling((prev) => !prev);
                  }}
                  className={`p-1.5 rounded-full border transition-colors cursor-pointer ml-1 ${
                    isParadeAutoCycling
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-900 border-slate-700 text-stone-500'
                  }`}
                  title={
                    isParadeAutoCycling
                      ? language === 'en'
                        ? 'Pause parade auto-rotation'
                        : 'Mettre en pause la rotation automatique'
                      : language === 'en'
                      ? 'Resume parade auto-rotation'
                      : 'Reprendre la rotation automatique'
                  }
                >
                  {isParadeAutoCycling ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION: FULL CAST DOSSIER & INDIVIDUAL APPRECIATION CARDS */}
          {/* ========================================================================= */}
          <div className="w-full flex flex-col items-center gap-12">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'en' ? 'CAST OF CHARACTERS' : 'PERSONNAGES DU CONTE'}</span>
              <Sparkles className="w-4 h-4" />
            </div>

            {/* Character 1: Wendy (Interactive Transformation on Click!) */}
            <div
              id="credits-card-wendy"
              onClick={handleToggleWendy}
              className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900/80 to-amber-950/30 border-2 border-amber-500/40 w-full max-w-xl shadow-xl flex flex-col sm:flex-row items-center gap-6 transition-all hover:border-amber-400 hover:shadow-[0_0_35px_rgba(251,191,36,0.25)] cursor-pointer group relative"
            >
              <div className="absolute top-3 right-4 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] text-amber-300 font-sans flex items-center gap-1">
                <Wand2 className="w-3 h-3 text-amber-300" />
                <span>
                  {wendyForm === 'human_witch'
                    ? language === 'en'
                      ? 'Click to transform'
                      : 'Cliquer pour métamorphose'
                    : language === 'en'
                    ? 'Click for Wendy'
                    : 'Cliquer pour Wendy'}
                </span>
              </div>

              <div className="relative w-40 h-44 flex-shrink-0 flex items-end justify-center overflow-visible">
                <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-400/20 transition-all" />
                <div className="transform scale-90 origin-bottom transition-transform group-hover:scale-95">
                  <CharacterPortrait
                    characterId={wendyForm}
                    expression={wendyForm === 'human_witch' ? 'holding_gbear' : 'peaceful'}
                    showSwwPin={true}
                    language={language}
                  />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-amber-200 mb-1 flex items-center justify-center sm:justify-start gap-2">
                  <span>
                    {wendyForm === 'human_witch'
                      ? language === 'en'
                        ? 'Wendy, Bearer of the Sun'
                        : 'Wendy, Porteuse du Soleil'
                      : language === 'en'
                      ? 'Super Witch Wendy'
                      : 'Super Sorcière Wendy'}
                  </span>
                  <span className="text-sm">{wendyForm === 'human_witch' ? '☀️🌸' : '🧙‍♀️✨'}</span>
                </h3>
                <p className="text-xs uppercase tracking-widest text-amber-400/90 font-semibold mb-2">
                  {wendyForm === 'human_witch'
                    ? language === 'en'
                      ? 'The Radiant Loving Friend'
                      : 'L’Amie Rayonnante & Bienveillante'
                    : language === 'en'
                    ? 'Guardian of the Starlight Cloak'
                    : 'Gardienne de la Cape Étoilée'}
                </p>
                <p className="text-xs sm:text-sm text-stone-300/90 italic leading-relaxed">
                  {wendyForm === 'human_witch'
                    ? language === 'en'
                      ? 'Wearing her lovely wildflower dress and holding GBear close with warmth. Her greatest magical gift was illuminating the lives of all friends around her.'
                      : 'Vêtue de sa robe champêtre et serrant tendrement GBear contre elle. Sa plus grande magie fut d’illuminer la vie de tous ses amis.'
                    : language === 'en'
                    ? 'Carried the warm daylight in her lantern across snowy peaks, icy forests, and the deep abyss—and discovered that light is something we share together.'
                    : 'A porté la lumière du jour dans sa lanterne par-delà les crêtes enneigées et les abîmes — et a compris que la lumière se garde vivante ensemble.'}
                </p>
              </div>
            </div>

            {/* Character 2: GBear (Standalone Portrait, Clicking Squeak & Giggle!) */}
            <div
              id="credits-card-gbear"
              onClick={() => audioSynth.playGBearGiggle()}
              className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900/80 to-amber-950/30 border-2 border-amber-400/40 w-full max-w-xl shadow-xl flex flex-col sm:flex-row items-center gap-6 transition-all hover:border-amber-300 hover:shadow-[0_0_35px_rgba(251,191,36,0.25)] group cursor-pointer"
            >
              <div className="relative w-40 h-44 flex-shrink-0 flex items-center justify-center overflow-visible">
                <div className="absolute inset-0 bg-yellow-400/15 rounded-full blur-xl pointer-events-none group-hover:bg-yellow-400/25 transition-all" />
                <div className="transform scale-100 origin-center group-hover:scale-105 transition-transform">
                  <CharacterPortrait characterId="gbear" expression="waving" language={language} />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-amber-200 mb-1 flex items-center justify-center sm:justify-start gap-2">
                  <span>GBear the Pooh Teddy</span>
                  <span className="text-sm">🧸🍯✨</span>
                </h3>
                <p className="text-xs uppercase tracking-widest text-amber-400/90 font-semibold mb-2">
                  {language === 'en'
                    ? 'Faithful Companion & Heart of Warmth'
                    : 'Fidèle Compagnon & Cœur de Tendresse'}
                </p>
                <p className="text-xs sm:text-sm text-stone-300/90 italic leading-relaxed">
                  {language === 'en'
                    ? 'Handcrafted with warm golden fur and a cozy red vest. Squeaks with joy, does happy hops, and snuggles cozily in Wendy’s embrace.'
                    : 'Façonné avec amour, pelage doré et gilet rouge. Couine de joie, sautille d’allégresse et se blottit tendrement dans les bras de Wendy.'}
                </p>
              </div>
            </div>

            {/* Character 3: Lezar */}
            <div
              id="credits-card-lezar"
              onClick={() => audioSynth.playSoundEffect('purr')}
              className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900/80 to-amber-950/30 border-2 border-amber-500/30 w-full max-w-xl shadow-xl flex flex-col sm:flex-row items-center gap-6 transition-all hover:border-amber-400/60 hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] group cursor-pointer"
            >
              <div className="relative w-40 h-44 flex-shrink-0 flex items-end justify-center overflow-visible">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-400/20 transition-all" />
                <div className="transform scale-90 origin-bottom group-hover:scale-95 transition-transform">
                  <CharacterPortrait characterId="lezar" expression="purring" language={language} />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-amber-200 mb-1 flex items-center justify-center sm:justify-start gap-2">
                  <span>Lezar</span>
                  <span className="text-sm">🐈✨</span>
                </h3>
                <p className="text-xs uppercase tracking-widest text-amber-400/90 font-semibold mb-2">
                  {language === 'en'
                    ? 'Loyal Twilight Familiar & Secret Feast Mastermind'
                    : 'Fidèle Familier & Organisateur Secret du Banquet'}
                </p>
                <p className="text-xs sm:text-sm text-stone-300/90 italic leading-relaxed">
                  {language === 'en'
                    ? 'Always watching from the edge of the satchel, purring in quiet comfort, and secretly orchestrating a grand surprise banquet across the whole realm.'
                    : 'Toujours aux côtés de Wendy, ronronnant de tendresse et orchestrant secrètement un banquet d’anniversaire géant à travers tout le royaume.'}
                </p>
              </div>
            </div>

            {/* Character 4: Orik (Final form with Blooming Flower on head & radiant emerald aura) */}
            <div
              id="credits-card-orik"
              onClick={() => audioSynth.playSoundEffect('orik_chirp')}
              className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-emerald-950/40 via-slate-900/80 to-amber-950/30 border-2 border-emerald-500/40 w-full max-w-xl shadow-xl flex flex-col sm:flex-row items-center gap-6 transition-all hover:border-emerald-400/80 hover:shadow-[0_0_35px_rgba(16,185,129,0.25)] group cursor-pointer"
            >
              <div className="relative w-40 h-44 flex-shrink-0 flex items-end justify-center overflow-visible">
                <div className="absolute inset-0 bg-emerald-500/15 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-400/30 transition-all" />
                <div className="transform scale-95 origin-bottom group-hover:scale-100 transition-transform">
                  <CharacterPortrait characterId="orik" expression="grateful" language={language} />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-emerald-200 mb-1 flex items-center justify-center sm:justify-start gap-2">
                  <span>{language === 'en' ? 'Orik the Sprite' : 'Orik le Follet'}</span>
                  <span className="text-sm">🌿🌸✨</span>
                </h3>
                <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">
                  {language === 'en'
                    ? 'Sprout of the Whispering Woods (Blooming Form)'
                    : 'Pousse des Bois Chuchotants (Forme Épanouie)'}
                </p>
                <p className="text-xs sm:text-sm text-stone-300/90 italic leading-relaxed">
                  {language === 'en'
                    ? 'With his magnificent blooming flower crown and gossamer wings, Orik brings fresh wild forest berries, blossoms, and joyful woodland melodies.'
                    : 'Paré de sa magnifique couronne de fleurs épanouie et d’ailes scintillantes, Orik apporte baies sauvages, fleurs des sous-bois et mélodies joyeuses.'}
                </p>
              </div>
            </div>

            {/* Character 5: Vivienne (Final form with Artisan Beret Hat & Star Brooch) */}
            <div
              id="credits-card-vivienne"
              onClick={() => audioSynth.playSoundEffect('glass_shimmer')}
              className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900/80 to-amber-950/30 border-2 border-amber-500/40 w-full max-w-xl shadow-xl flex flex-col sm:flex-row items-center gap-6 transition-all hover:border-amber-400 hover:shadow-[0_0_35px_rgba(245,158,11,0.25)] group cursor-pointer"
            >
              <div className="relative w-32 h-38 sm:w-36 sm:h-40 flex-shrink-0 flex items-end justify-center overflow-visible">
                <div className="absolute inset-0 bg-amber-600/15 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/30 transition-all" />
                <div className="transform scale-75 sm:scale-80 origin-bottom group-hover:scale-85 transition-transform">
                  <CharacterPortrait characterId="vivienne" expression="inspired" language={language} />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-amber-200 mb-1 flex items-center justify-center sm:justify-start gap-2">
                  <span>
                    {language === 'en'
                      ? 'Vivienne the Glassmaker'
                      : 'Vivienne la Verrière'}
                  </span>
                  <span className="text-sm">🏺⭐🔥</span>
                </h3>
                <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">
                  {language === 'en'
                    ? 'Artisan of the Amber Canyon (Star Beret Form)'
                    : 'Artisane du Canyon d’Ambre (Béret Étoilé)'}
                </p>
                <p className="text-xs sm:text-sm text-stone-300/90 italic leading-relaxed">
                  {language === 'en'
                    ? 'Proudly wearing her French artisan beret with its golden star brooch. Forged prism bottles with fierce love, kept the kiln ablaze, and baked warm festive treats.'
                    : 'Arborant fièrement son béret d’artisane à l’étoile dorée. A façonné les prismes avec passion, ravivé le fourneau et cuisiné de savoureuses douceurs festives.'}
                </p>
              </div>
            </div>

            {/* Character 6: Hypo */}
            <div
              id="credits-card-hypo"
              onClick={() => audioSynth.playSoundEffect('pillow_squeak')}
              className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900/80 to-amber-950/30 border-2 border-pink-500/30 w-full max-w-xl shadow-xl flex flex-col sm:flex-row items-center gap-6 transition-all hover:border-pink-400/60 hover:shadow-[0_0_30px_rgba(244,114,182,0.15)] group cursor-pointer"
            >
              <div className="relative w-40 h-44 flex-shrink-0 flex items-end justify-center overflow-visible">
                <div className="absolute inset-0 bg-pink-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-pink-400/20 transition-all" />
                <div className="transform scale-100 sm:scale-105 origin-bottom group-hover:scale-110 transition-transform">
                  <CharacterPortrait characterId="hypo" expression="cuddling_pillow" language={language} />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-pink-200 mb-1 flex items-center justify-center sm:justify-start gap-2">
                  <span>
                    {language === 'en'
                      ? 'Hypo the Hippo Plushie'
                      : 'Hypo la Peluche Hippopotame'}
                  </span>
                  <span className="text-sm">🦛💤💖</span>
                </h3>
                <p className="text-xs uppercase tracking-widest text-pink-400/90 font-semibold mb-2">
                  {language === 'en'
                    ? 'Neck Pillow Bearer & Chief Rest Officer'
                    : 'Gardienne du Coussin de Repos & Douceur Suprême'}
                </p>
                <p className="text-xs sm:text-sm text-stone-300/90 italic leading-relaxed">
                  {language === 'en'
                    ? 'Brought the coziest plush neck pillow in the world to remind Wendy that she deserves peaceful naps and warm rest.'
                    : 'A offert le coussin le plus moelleux de l’univers pour rappeler à Wendy qu’elle a le droit de se reposer en toute sérénité.'}
                </p>
              </div>
            </div>

            {/* Visual Spacer */}
            <div className="w-full flex items-center justify-center py-2">
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
            </div>

            {/* Character 7: Mélo Clown / The Dark Lord */}
            <div
              id="credits-card-clown"
              onClick={() => audioSynth.playClownMusicalNote()}
              className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-purple-950/40 via-slate-900/80 to-purple-950/30 border-2 border-purple-500/40 w-full max-w-xl shadow-xl flex flex-col sm:flex-row items-center gap-6 transition-all hover:border-purple-400/70 hover:shadow-[0_0_35px_rgba(168,85,247,0.2)] group cursor-pointer"
            >
              <div className="relative w-40 h-44 flex-shrink-0 flex items-end justify-center overflow-visible">
                <div className="absolute inset-0 bg-purple-600/15 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/25 transition-all" />
                <div className="transform scale-80 sm:scale-85 origin-bottom group-hover:scale-90 transition-transform">
                  <CharacterPortrait characterId="clown" expression="gentleman_theatrical" language={language} />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-purple-200 mb-1 flex items-center justify-center sm:justify-start gap-2">
                  <span>
                    {language === 'en'
                      ? 'Mélo Clown / The Dark Lord'
                      : 'Le Clown Mélo / Le Seigneur Sombre'}
                  </span>
                  <span className="text-sm">🎩🪄✨</span>
                </h3>
                <p className="text-xs uppercase tracking-widest text-purple-300/90 font-semibold mb-2">
                  {language === 'en'
                    ? 'Obsidian Chasm Entity & Dedicated Partenaire'
                    : 'Entité du Gouffre d’Obsidienne & Partenaire Dévoué'}
                </p>
                <p className="text-xs sm:text-sm text-stone-300/90 italic leading-relaxed">
                  {language === 'en'
                    ? 'Dramatic cosmic entity turned eccentric gentleman with a golden monocle, music note top hat, strawberry cake bearer, and giver of the golden SWTW brooch.'
                    : 'Seigneur des ombres devenu gentleman mélomane au monocle d’or, porteur de gâteau fraise-chocolat et donateur de la broche dorée SWTW.'}
                </p>
              </div>
            </div>

            {/* The Grand Ensemble Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/50 via-purple-950/40 to-slate-900 border-2 border-amber-400/60 w-full max-w-xl shadow-2xl flex flex-col items-center gap-4 text-center relative overflow-hidden mt-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold uppercase tracking-widest">
                <Star className="w-3.5 h-3.5 fill-current text-amber-300" />
                <span>{language === 'en' ? 'THE REUNITED ENSEMBLE' : 'LE RASSEMBLEMENT FINAL'}</span>
                <Star className="w-3.5 h-3.5 fill-current text-amber-300" />
              </div>
              <div className="w-full flex items-center justify-center scale-95 sm:scale-100 my-2">
                <CharacterPortrait characterId="everyone" expression="everyone_celebrating" showSwwPin={true} language={language} />
              </div>
              <p className="text-xs sm:text-sm text-amber-100/90 font-serif italic max-w-md leading-relaxed">
                {language === 'en'
                  ? 'All companions together around the glowing hearth—sharing cake, laughter, starlight, and the gift of everlasting friendship.'
                  : 'Tous les compagnons réunis autour de la table festive — partageant gâteau, rires, étoiles et le trésor d’une amitié éternelle.'}
              </p>
            </div>
          </div>

          {/* Section: Chapters & Memories */}
          <div className="w-full flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
              <Sun className="w-4 h-4" />
              <span>{language === 'en' ? 'THE JOURNEY OF LIGHT' : 'LE VOYAGE DE LA LUMIÈRE'}</span>
              <Sun className="w-4 h-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-xs font-serif text-stone-300/80">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/10">
                🌲 {language === 'en' ? 'The Whispering Forest' : 'La Forêt des Murmures'}
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/10">
                🔥 {language === 'en' ? 'The Amber Kiln' : 'Le Fourneau d’Ambre'}
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/10">
                📜 {language === 'en' ? 'The Glowing Bottle on Moss' : 'La Bouteille de Mousse'}
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/10">
                🌌 {language === 'en' ? 'The Velvet Abyss' : 'L’Abîme de Velours'}
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/10">
                🌊 {language === 'en' ? 'The Sea Shore at Dusk' : 'Le Rivage au Crépuscule'}
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/10">
                🪞 {language === 'en' ? 'The Magic Mirror' : 'Le Miroir Magique'}
              </div>
            </div>
          </div>

          {/* Section: Development & Production Team */}
          <div className="w-full flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'en' ? 'PRODUCTION & CREATION' : 'PRODUCTION & CRÉATION'}</span>
              <Sparkles className="w-4 h-4" />
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 shadow-xl w-full max-w-lg text-center">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block mb-1">
                {language === 'en' ? 'Game Direction & Engineering' : 'Réalisation & Ingénierie'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-amber-100 tracking-wider mb-4">
                c-zuko-dev & g
              </h2>

              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4" />

              <div className="space-y-2 text-xs sm:text-sm text-amber-200/90 font-serif">
                <p>
                  <span className="text-amber-400 font-semibold">
                    {language === 'en' ? 'Story & Narrative:' : 'Scénario & Narration :'}
                  </span>{' '}
                  c-zuko-dev & g
                </p>
                <p>
                  <span className="text-amber-400 font-semibold">
                    {language === 'en' ? 'Character & World Design:' : 'Univers & Personnages :'}
                  </span>{' '}
                  c-zuko-dev & g
                </p>
                <p>
                  <span className="text-amber-400 font-semibold">
                    {language === 'en' ? 'Procedural Sound Synthesis:' : 'Synthèse Sonore & Musique :'}
                  </span>{' '}
                  c-zuko-dev & g
                </p>
                <p>
                  <span className="text-amber-400 font-semibold">
                    {language === 'en' ? 'Visual Effects & Fairytale UI:' : 'Effets Visuels & Interface :'}
                  </span>{' '}
                  c-zuko-dev & g
                </p>
              </div>
            </div>
          </div>

          {/* Section: Special Heartfelt Dedication */}
          <div className="w-full flex flex-col items-center gap-6 pt-4">
            <div className="w-full max-w-xl p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-900/60 via-purple-950/60 to-slate-950 border-2 border-amber-400/80 shadow-[0_0_60px_rgba(245,158,11,0.25)] text-center relative overflow-hidden">
              <div className="absolute top-2 right-4 text-2xl animate-bounce">🎂</div>
              <div className="absolute bottom-3 left-4 text-2xl animate-pulse">☀️</div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
                <span>
                  {language === 'en'
                    ? 'SPECIAL BIRTHDAY DEDICATION'
                    : 'DÉDICACE SPÉCIALE D’ANNIVERSAIRE'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-400 tracking-wide mb-3">
                Made for Lodi Wendy ☀️💖
              </h2>

              <p className="text-sm sm:text-base text-amber-100/90 font-medium leading-relaxed mb-6 max-w-md mx-auto italic">
                {language === 'en'
                  ? '“Happy Birthday lodi, Wendy! May your journey always be filled with warmth, deep friendships, and shared laughter. You will never have to walk alone again.”'
                  : '« Joyeux Anniversaire lodi, Wendy ! Que ton chemin soit toujours baigné de chaleur, d’amitié et d’éclats de rire partagés. Tu n’auras plus jamais à marcher seule. »'}
              </p>

              <div className="p-4 rounded-2xl bg-black/40 border border-amber-400/30 inline-block shadow-inner">
                <p className="text-xs sm:text-sm font-bold text-amber-300 tracking-wider">
                  made by c-zuko-dev and g, for Lodi Wendy.
                </p>
              </div>
            </div>
          </div>

          {/* Final The End Emblem */}
          <div className="flex flex-col items-center gap-3 pt-6">
            <h2 className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 tracking-wide">
              {language === 'en' ? 'The End ☀️' : 'Fin ☀️'}
            </h2>
            <p className="text-xs text-amber-300/70 italic">
              {language === 'en' ? 'Thank you for reading and playing!' : 'Merci d’avoir partagé ce voyage !'}
            </p>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full max-w-2xl justify-center pt-6">
            <button
              id="credits-btn-memories"
              onClick={onViewMemories}
              className="w-full sm:w-auto px-5 py-3 rounded-full bg-gradient-to-r from-amber-950 via-amber-850 to-slate-900 hover:from-amber-900 hover:to-slate-850 text-amber-200 hover:text-white font-serif font-bold text-xs sm:text-sm shadow-lg hover:shadow-amber-500/20 transition-all transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2 border border-amber-400/50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{language === 'en' ? 'Memories Scrapbook 📖' : 'Album Souvenirs 📖'}</span>
            </button>

            <button
              id="credits-btn-return-menu"
              onClick={onReturnToTitle}
              className="w-full sm:w-auto px-5 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-amber-200 hover:text-white text-xs sm:text-sm transition-all border border-amber-500/30 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Home className="w-4 h-4 text-amber-400" />
              <span>{language === 'en' ? 'Main Menu' : 'Menu Principal'}</span>
            </button>

            <button
              id="credits-btn-restart-story"
              onClick={onRestart}
              className="w-full sm:w-auto px-4 py-3 rounded-full bg-slate-900/60 hover:bg-slate-800 text-amber-300/80 hover:text-amber-200 text-xs transition-all border border-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              title={language === 'en' ? 'Replay Story from Beginning' : 'Recommencer l’histoire'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Replay' : 'Rejouer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
