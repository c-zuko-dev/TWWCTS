import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Heart,
  Cake,
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
} from 'lucide-react';
import { Language } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';

interface CreditsRollProps {
  language: Language;
  onToggleLanguage?: () => void;
  isMuted?: boolean;
  onToggleAudio?: () => void;
  onViewMemories: () => void;
  onRestart: () => void;
  onReturnToTitle: () => void;
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
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  // Play gentle slow-tempo piano credits theme upon mounting with graceful cross-fade
  useEffect(() => {
    audioSynth.playCreditsPianoTheme();
    setHasFadedOutMusic(false);
  }, []);

  // Smooth vertical auto-scroll loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const scrollLoop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (!isPaused && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollStep = 38 * speedMultiplier * delta;
        container.scrollTop += scrollStep;

        const maxScroll = container.scrollHeight - container.clientHeight;
        
        // Trigger soft musical fade-out when reaching the final dedication section (approx 75% scroll)
        if (!hasFadedOutMusic && maxScroll > 0 && container.scrollTop > maxScroll * 0.72) {
          setHasFadedOutMusic(true);
          audioSynth.fadeOutMusic(5); // 5 seconds smooth fade out
        }

        if (container.scrollTop >= maxScroll - 4) {
          setHasReachedEnd(true);
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
      setHasReachedEnd(true);
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-amber-100 select-none overflow-hidden animate-fade-in font-serif">
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 text-amber-200 text-xs transition-colors cursor-pointer"
            title="Toggle Scroll Speed"
          >
            <FastForward className="w-3.5 h-3.5 text-amber-400" />
            <span>{speedMultiplier}x</span>
          </button>

          {/* Pause / Resume */}
          <button
            id="credits-btn-pause"
            onClick={handleTogglePause}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 text-amber-200 transition-colors cursor-pointer"
            title={isPaused ? 'Resume Scroll' : 'Pause Scroll'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-300" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Skip to Dedication */}
          <button
            id="credits-btn-skip"
            onClick={handleSkipToBottom}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 text-amber-200 text-xs transition-colors cursor-pointer"
            title={language === 'en' ? 'Skip to Dedication' : 'Passer à la dédicace'}
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'en' ? 'Skip' : 'Passer'}</span>
          </button>

          {/* Language Toggle */}
          {onToggleLanguage && (
            <button
              id="credits-btn-lang"
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 text-amber-200 text-xs transition-colors cursor-pointer"
              title={language === 'en' ? 'Passer en Français' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{language === 'en' ? 'FR 🇫🇷' : 'EN 🇬🇧'}</span>
            </button>
          )}

          {/* Audio Toggle */}
          {onToggleAudio && (
            <button
              id="credits-btn-audio"
              onClick={onToggleAudio}
              className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 text-amber-200 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </header>

      {/* Main Smooth Scrolling Body */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-8 py-16 scroll-smooth text-center focus:outline-none"
        tabIndex={0}
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-16 pb-24">
          {/* Initial Spacer */}
          <div className="h-12" />

          {/* Header & Logo Emblem */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600/30 via-yellow-400/20 to-amber-500/30 border-2 border-amber-400/80 p-2 shadow-[0_0_40px_rgba(251,191,36,0.35)] flex items-center justify-center mb-4 animate-pulse">
              <Sun className="w-12 h-12 text-amber-300 animate-spin-slow" />
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-amber-300/80 font-bold mb-2">
              {language === 'en' ? 'An Interactive Tale of Shared Light' : 'Un Conte Interactif de Lumière Partagée'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 tracking-wider mb-4">
              {language === 'en'
                ? 'THE WITCH WHO CARRIED THE SUN'
                : 'LA SORCIÈRE QUI PORTAIT LE SOLEIL'}
            </h1>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
          </div>

          {/* Section: Characters & Cast */}
          <div className="w-full flex flex-col items-center gap-8">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'en' ? 'CAST OF CHARACTERS' : 'PERSONNAGES DU CONTE'}</span>
              <Sparkles className="w-4 h-4" />
            </div>

            {/* Character 1: Wendy */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 w-full max-w-lg transition-transform hover:scale-[1.02]">
              <h3 className="text-xl sm:text-2xl font-bold text-amber-200 mb-1">
                {language === 'en' ? 'Super Witch Wendy' : 'Super Sorcière Wendy'}
              </h3>
              <p className="text-xs uppercase tracking-widest text-amber-400/80 font-semibold mb-2">
                {language === 'en' ? 'The Bearer of the Sun & Radiant Friend' : 'La Porteuse du Soleil & Amie Rayonnante'}
              </p>
              <p className="text-xs sm:text-sm text-stone-300/90 italic leading-relaxed">
                {language === 'en'
                  ? 'Carried the warm daylight in her lantern across snowy peaks, icy forests, and the deep abyss—and discovered that light is something we share together.'
                  : 'A porté la lumière du jour dans sa lanterne par-delà les crêtes enneigées et les abîmes—et a compris que la lumière se garde vivante ensemble.'}
              </p>
            </div>

            {/* Character 2: Lezar */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 w-full max-w-lg transition-transform hover:scale-[1.02]">
              <h3 className="text-xl sm:text-2xl font-bold text-amber-200 mb-1">
                Lezar 🐈✨
              </h3>
              <p className="text-xs uppercase tracking-widest text-amber-400/80 font-semibold mb-2">
                {language === 'en' ? 'Loyal Twilight Familiar & Secret Feast Mastermind' : 'Fidèle Familier & Organisateur Secret du Banquet'}
              </p>
              <p className="text-xs sm:text-sm text-stone-300/90 italic leading-relaxed">
                {language === 'en'
                  ? 'Always watching from the edge of the satchel, purring in quiet comfort, and secretly orchestrating a grand surprise banquet across the whole realm.'
                  : 'Toujours aux côtés de Wendy, ronronnant de tendresse et orchestrant secrètement un banquet d’anniversaire géant à travers tout le royaume.'}
              </p>
            </div>

            {/* Character 3: Orik */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 w-full max-w-lg transition-transform hover:scale-[1.02]">
              <h3 className="text-xl sm:text-2xl font-bold text-amber-200 mb-1">
                {language === 'en' ? 'Orik the Sprite' : 'Orik le Follet'} 🌿
              </h3>
              <p className="text-xs uppercase tracking-widest text-emerald-400/80 font-semibold mb-2">
                {language === 'en' ? 'Sprout of the Whispering Woods' : 'Pousse des Bois Chuchotants'}
              </p>
              <p className="text-xs sm:text-sm text-stone-300/90 italic leading-relaxed">
                {language === 'en'
                  ? 'Protected the sleeping roots through the bitter frost and returned to bring fresh wild forest berries and blossom garlands.'
                  : 'A protégé les racines endormies sous le givre et a apporté des baies sauvages et des guirlandes de fleurs en fête.'}
              </p>
            </div>

            {/* Character 4: Vivienne */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 w-full max-w-lg transition-transform hover:scale-[1.02]">
              <h3 className="text-xl sm:text-2xl font-bold text-amber-200 mb-1">
                {language === 'en' ? 'Vivienne the Glassmaker' : 'Vivienne la Verrière'} 🏺🔥
              </h3>
              <p className="text-xs uppercase tracking-widest text-amber-400/80 font-semibold mb-2">
                {language === 'en' ? 'Artisan of the Amber Canyon' : 'Artisane du Canyon d’Ambre'}
              </p>
              <p className="text-xs sm:text-sm text-stone-300/90 italic leading-relaxed">
                {language === 'en'
                  ? 'Forged prism bottles with fiery dedication, kept the kiln ablaze, and baked fresh artisan baguettes and honeyed crêpes.'
                  : 'A façonné les prismes de verre avec ferveur, ravivé le fourneau et cuisiné de savoureuses baguettes et crêpes dorées.'}
              </p>
            </div>

            {/* Character 5: Hypo */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 w-full max-w-lg transition-transform hover:scale-[1.02]">
              <h3 className="text-xl sm:text-2xl font-bold text-amber-200 mb-1">
                {language === 'en' ? 'Hypo the Hippo Plushie' : 'Hypo la Peluche Hippopotame'} 🦛💤💖
              </h3>
              <p className="text-xs uppercase tracking-widest text-pink-400/80 font-semibold mb-2">
                {language === 'en' ? 'Neck Pillow Bearer & Chief Rest Officer' : 'Gardienne du Coussin de Repos & Douceur Suprême'}
              </p>
              <p className="text-xs sm:text-sm text-stone-300/90 italic leading-relaxed">
                {language === 'en'
                  ? 'Brought the coziest plush neck pillow in the world to remind Wendy that she deserves peaceful naps and warm rest.'
                  : 'A offert le coussin le plus moelleux de l’univers pour rappeler à Wendy qu’elle a le droit de se reposer en toute sérénité.'}
              </p>
            </div>

            {/* Character 6: Mélo Clown / The Dark Lord */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-purple-500/30 w-full max-w-lg transition-transform hover:scale-[1.02]">
              <h3 className="text-xl sm:text-2xl font-bold text-purple-200 mb-1">
                {language === 'en' ? 'Mélo Clown / The Dark Lord' : 'Le Clown Mélo / Le Seigneur Sombre'} 🎩🪄✨
              </h3>
              <p className="text-xs uppercase tracking-widest text-purple-300/90 font-semibold mb-2">
                {language === 'en' ? 'Obsidian Chasm Entity & Dedicated Partenaire' : 'Entité du Gouffre d’Obsidienne & Partenaire Dévoué'}
              </p>
              <p className="text-xs sm:text-sm text-stone-300/90 italic leading-relaxed">
                {language === 'en'
                  ? 'Dramatic cosmic entity turned eccentric gentleman with a golden monocle, music note top hat, strawberry cake bearer, and giver of the golden SWW pin.'
                  : 'Seigneur des ombres devenu gentleman mélomane au monocle d’or, porteur de gâteau fraise-chocolat et donateur de l’épingle dorée SWW.'}
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
                  <span className="text-amber-400 font-semibold">{language === 'en' ? 'Story & Narrative:' : 'Scénario & Narration :'}</span>{' '}
                  c-zuko-dev & g
                </p>
                <p>
                  <span className="text-amber-400 font-semibold">{language === 'en' ? 'Character & World Design:' : 'Univers & Personnages :'}</span>{' '}
                  c-zuko-dev & g
                </p>
                <p>
                  <span className="text-amber-400 font-semibold">{language === 'en' ? 'Procedural Sound Synthesis:' : 'Synthèse Sonore & Musique :'}</span>{' '}
                  c-zuko-dev & g
                </p>
                <p>
                  <span className="text-amber-400 font-semibold">{language === 'en' ? 'Visual Effects & Fairytale UI:' : 'Effets Visuels & Interface :'}</span>{' '}
                  c-zuko-dev & g
                </p>
              </div>
            </div>
          </div>

          {/* Section: Special Heartfelt Dedication */}
          <div className="w-full flex flex-col items-center gap-6 pt-4">
            <div className="w-full max-w-xl p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-900/60 via-purple-950/60 to-slate-950 border-2 border-amber-400/80 shadow-[0_0_60px_rgba(245,158,11,0.25)] text-center relative overflow-hidden">
              {/* Background celebration particles */}
              <div className="absolute top-2 right-4 text-2xl animate-bounce">🎂</div>
              <div className="absolute bottom-3 left-4 text-2xl animate-pulse">☀️</div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
                <span>{language === 'en' ? 'SPECIAL BIRTHDAY DEDICATION' : 'DÉDICACE SPÉCIALE D’ANNIVERSAIRE'}</span>
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
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-center pt-6">
            <button
              id="credits-btn-memories"
              onClick={onViewMemories}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg hover:shadow-amber-500/30 transition-all transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2 border border-amber-300"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{language === 'en' ? 'View Relics & Endings ✨' : 'Voir les Souvenirs ✨'}</span>
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
