import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Sun,
  Heart,
  ChevronRight,
  Cake,
  Globe,
  Volume2,
  VolumeX,
  Home,
  RotateCcw,
  Compass,
  ScrollText,
} from 'lucide-react';
import { Language } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';

interface StorybookExperienceProps {
  mode: 'opening' | 'ending';
  language: Language;
  onToggleLanguage?: () => void;
  isMuted?: boolean;
  onToggleAudio?: () => void;
  onComplete: () => void;
  onShowCredits?: () => void;
  onReturnToTitle: () => void;
  onRestartStory?: () => void;
}

export const StorybookExperience: React.FC<StorybookExperienceProps> = ({
  mode,
  language,
  onToggleLanguage,
  isMuted = false,
  onToggleAudio,
  onComplete,
  onShowCredits,
  onReturnToTitle,
  onRestartStory,
}) => {
  // Step 0: Closed front cover
  // Step 1: Open 2-page spread
  // Step 2: Page turning / Transitioning into game
  // Step 3: Closed back cover (Ending)
  const [step, setStep] = useState<number>(mode === 'opening' ? 0 : 1);
  const [animationState, setAnimationState] = useState<'idle' | 'opening' | 'turning' | 'closing'>('idle');

  useEffect(() => {
    if (mode === 'opening') {
      audioSynth.playSoundEffect('soft_bell');
    }
  }, [mode]);

  const handleOpenBook = () => {
    audioSynth.playSoundEffect('soft_rustle');
    setTimeout(() => {
      audioSynth.playSoundEffect('magic_sparkle');
    }, 150);
    setAnimationState('opening');
    setTimeout(() => {
      audioSynth.playSoundEffect('soft_bell');
      setStep(1);
      setAnimationState('idle');
    }, 950);
  };

  const handleTurnToGame = () => {
    audioSynth.playSoundEffect('page_turn');
    setAnimationState('turning');
    setTimeout(() => {
      audioSynth.playSoundEffect('magic_surge');
      onComplete();
    }, 950);
  };

  const handleCloseBook = () => {
    audioSynth.playSoundEffect('soft_rustle');
    setTimeout(() => {
      audioSynth.playSoundEffect('magic_sparkle');
    }, 120);
    setAnimationState('closing');
    setTimeout(() => {
      audioSynth.playSoundEffect('book_close');
      setStep(3); // Closed back cover
      setAnimationState('idle');
    }, 950);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 select-none animate-fade-in overflow-y-auto">
      {/* Background Floating Stardust */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-amber-300 animate-ping" />
        <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 rounded-full bg-yellow-200 animate-pulse" />
        <div className="absolute top-1/2 right-1/6 w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
        <div className="absolute top-1/6 right-1/3 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <div className="absolute bottom-1/6 left-1/3 w-2 h-2 rounded-full bg-amber-200 animate-pulse" />
      </div>

      {/* Top Navigation & Language / Audio Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between z-30 mb-2">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-500/30 text-amber-200 text-xs font-serif shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>
            {language === 'en'
              ? 'The Illustrated Chronicle'
              : 'Le Grimoire Illustré'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switch Button */}
          {onToggleLanguage && (
            <button
              id="storybook-btn-lang"
              onClick={onToggleLanguage}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-500/30 text-amber-200 hover:text-white hover:border-amber-400 text-xs font-serif transition-colors shadow-lg cursor-pointer"
              title={language === 'en' ? 'Passer en Français' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">
                {language === 'en' ? 'FRANÇAIS 🇫🇷' : 'ENGLISH 🇬🇧'}
              </span>
            </button>
          )}

          {/* Audio Switch Button */}
          {onToggleAudio && (
            <button
              id="storybook-btn-audio"
              onClick={onToggleAudio}
              className="p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-500/30 text-amber-200 hover:text-white hover:border-amber-400 transition-colors shadow-lg cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          {/* Quick Return to Title */}
          <button
            id="storybook-btn-top-title"
            onClick={onReturnToTitle}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-500/30 text-amber-200 hover:text-amber-100 hover:border-amber-400 text-xs font-serif transition-colors shadow-lg cursor-pointer"
            title={language === 'en' ? 'Return to Menu' : 'Menu Principal'}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {language === 'en' ? 'Main Menu' : 'Menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Main 3D Book Stage */}
      <div className="my-auto w-full flex items-center justify-center p-2 sm:p-4 perspective-storybook">
        {/* ========================================================= */}
        {/* 1. OPENING: CLOSED FRONT BOOK COVER                       */}
        {/* ========================================================= */}
        {mode === 'opening' && step === 0 && (
          <div className="relative group">
            {/* Underlying stacked parchment pages shadow & thickness */}
            <div className="absolute -inset-1.5 sm:-inset-2 bg-gradient-to-r from-amber-950 via-[#e0cfab] to-[#c9b78e] rounded-2xl book-paper-stack-right book-paper-stack-bottom opacity-90 transform translate-x-2 translate-y-2 pointer-events-none" />

            <div
              className={`relative w-full max-w-md sm:max-w-lg aspect-[3/4] bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 rounded-2xl border-4 border-amber-500/90 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_60px_rgba(245,158,11,0.35)] flex flex-col items-center justify-between p-8 sm:p-12 text-center transition-all duration-700 preserve-3d ${
                animationState === 'opening' ? 'animate-magical-book-open' : 'scale-100'
              }`}
            >
              {/* Magical Starlight Opening Flare */}
              {animationState === 'opening' && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-300/40 via-yellow-100/60 to-purple-400/40 blur-xl animate-pulse pointer-events-none z-50" />
              )}
              {/* Gold foiled leather bevel */}
              <div className="absolute inset-2 rounded-xl border border-amber-500/30 pointer-events-none" />

              {/* Book Spine Texture Edge with golden ridges */}
              <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-r from-amber-950 via-amber-900 to-stone-900 rounded-l-2xl border-r-2 border-amber-500/50 flex flex-col justify-around py-8 shadow-inner">
                <div className="w-full h-1.5 bg-gradient-to-r from-amber-600 to-amber-400 opacity-70" />
                <div className="w-full h-1.5 bg-gradient-to-r from-amber-600 to-amber-400 opacity-70" />
                <div className="w-full h-1.5 bg-gradient-to-r from-amber-600 to-amber-400 opacity-70" />
                <div className="w-full h-1.5 bg-gradient-to-r from-amber-600 to-amber-400 opacity-70" />
              </div>

              {/* Silk Bookmark Ribbon Peeking Out */}
              <div className="absolute top-0 right-14 w-5 h-14 bg-gradient-to-b from-rose-700 to-rose-900 rounded-b shadow-lg border-x border-b border-rose-400/50 flex items-end justify-center pb-1">
                <div className="w-2 h-2 rotate-45 bg-amber-400/80 mb-[-4px]" />
              </div>

              {/* Ornate Gold Filigree Corners */}
              <div className="absolute top-3.5 left-3.5 w-9 h-9 border-t-2 border-l-2 border-amber-300 rounded-tl-lg shadow-sm" />
              <div className="absolute top-3.5 right-3.5 w-9 h-9 border-t-2 border-r-2 border-amber-300 rounded-tr-lg shadow-sm" />
              <div className="absolute bottom-3.5 left-3.5 w-9 h-9 border-b-2 border-l-2 border-amber-300 rounded-bl-lg shadow-sm" />
              <div className="absolute bottom-3.5 right-3.5 w-9 h-9 border-b-2 border-r-2 border-amber-300 rounded-br-lg shadow-sm" />

              {/* Header Emblem */}
              <div className="mt-4 flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-600/40 via-yellow-400/25 to-amber-500/40 border-2 border-amber-400/80 p-2 shadow-[0_0_40px_rgba(251,191,36,0.5)] flex items-center justify-center mb-3 animate-pulse">
                  <Sun className="w-10 h-10 sm:w-12 sm:h-12 text-amber-300 animate-spin-slow" />
                </div>
                <span className="text-xs uppercase font-serif tracking-[0.3em] text-amber-300/90 font-semibold drop-shadow">
                  {language === 'en' ? 'A Magical Tale' : 'Un Conte Féerique'}
                </span>
              </div>

              {/* Titles */}
              <div className="my-auto px-2">
                <h1 className="text-2xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 tracking-wider mb-3 leading-snug drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">
                  {language === 'en'
                    ? 'THE WITCH WHO CARRIED THE SUN'
                    : 'LA SORCIÈRE QUI PORTAIT LE SOLEIL'}
                </h1>
                <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3" />
                <p className="text-xs sm:text-sm font-serif italic text-amber-200/90 max-w-xs mx-auto leading-relaxed drop-shadow">
                  {language === 'en'
                    ? 'A Little Story of Light, Friendship, and a Birthday'
                    : 'Une Petite Histoire de Lumière, d’Amitié et d’Anniversaire'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center mt-4">
                <button
                  id="storybook-btn-open"
                  onClick={handleOpenBook}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-serif font-bold text-sm sm:text-base tracking-wide shadow-xl hover:shadow-amber-500/50 transition-all transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2 border border-amber-300"
                >
                  <BookOpen className="w-4 h-4 text-slate-950" />
                  <span>{language === 'en' ? 'Open the Book' : 'Ouvrir le Grimoire'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  id="storybook-btn-back-menu"
                  onClick={onReturnToTitle}
                  className="w-full sm:w-auto px-5 py-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-200 hover:text-white font-serif text-xs sm:text-sm transition-all border border-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Title Menu' : 'Menu Titre'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. OPENING: ILLUMINATED INSIDE 2-PAGE SPREAD              */}
        {/* ========================================================= */}
        {mode === 'opening' && step === 1 && (
          <div className="relative group w-full max-w-4xl">
            {/* Book outer hardcover casing shadow and layered pages below */}
            <div className="absolute -inset-2 bg-gradient-to-b from-[#29180c] via-[#1a0f07] to-[#120803] rounded-2xl book-paper-stack-bottom opacity-95 transform translate-y-1.5 pointer-events-none" />

            <div
              className={`relative w-full bg-[#fcf8f0] text-slate-900 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.92),0_0_50px_rgba(245,158,11,0.25)] border-4 border-amber-800/80 p-6 sm:p-10 flex flex-col md:flex-row gap-6 sm:gap-10 transition-all duration-700 preserve-3d ${
                animationState === 'turning' ? 'animate-page-turn' : 'scale-100'
              }`}
            >
              {/* Gold foiled page edges on top/bottom/sides */}
              <div className="absolute inset-1.5 rounded-xl border border-amber-900/15 pointer-events-none" />

              {/* Book Center Binding Crease & Real Silk Bookmark */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-10 -translate-x-1/2 bg-gradient-to-r from-stone-400/25 via-stone-700/35 to-stone-400/25 pointer-events-none shadow-inner" />
              <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-4 h-20 bg-gradient-to-b from-rose-700 to-rose-900 rounded-b shadow-md border-x border-b border-rose-500/40 pointer-events-none">
                <div className="w-2 h-2 rotate-45 bg-amber-400 mx-auto mt-17" />
              </div>

              {/* LEFT PAGE: Illustrated Vignette */}
              <div className="flex-1 flex flex-col items-center justify-center p-4 border border-amber-900/20 rounded-xl bg-gradient-to-b from-amber-50/90 to-amber-100/60 text-center shadow-sm">
                {/* Ornate Illustration Frame */}
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 p-2 shadow-inner border-2 border-amber-700/70 flex items-center justify-center overflow-hidden mb-4">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Stars in twilight */}
                    <circle cx="40" cy="30" r="1.5" fill="#fde047" className="animate-pulse" />
                    <circle cx="160" cy="45" r="1.2" fill="#ffffff" />
                    <circle cx="90" cy="20" r="1.8" fill="#fde047" className="animate-pulse" />
                    <circle cx="140" cy="90" r="1.5" fill="#fde047" />
                    {/* Cottage Silhouette */}
                    <polygon points="50,150 100,100 150,150" fill="#1c1917" />
                    <rect x="65" y="140" width="70" height="40" fill="#292524" />
                    <rect x="90" y="150" width="20" height="30" fill="#ca8a04" opacity="0.85" />
                    {/* Glowing Sun Lantern */}
                    <circle cx="145" cy="130" r="16" fill="#fbbf24" opacity="0.85" className="animate-pulse" />
                    <circle cx="145" cy="130" r="8" fill="#ffffff" />
                    {/* Hillside */}
                    <ellipse cx="100" cy="195" rx="120" ry="35" fill="#0f172a" />
                  </svg>
                </div>
                <span className="text-xs font-serif italic text-amber-900/85 font-medium">
                  {language === 'en'
                    ? 'The twilight cottage before the journey begins…'
                    : 'La chaumière au crépuscule avant le grand départ…'}
                </span>
              </div>

              {/* RIGHT PAGE: Story Introduction */}
              <div className="flex-1 flex flex-col justify-between p-2">
                <div>
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-serif font-bold uppercase tracking-widest mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === 'en' ? 'Introduction' : 'Introduction'}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-950 mb-4 leading-snug">
                    {language === 'en'
                      ? 'Before the Morning Came'
                      : 'Avant que ne Vienne le Matin'}
                  </h2>

                  <p className="font-serif text-sm sm:text-base text-stone-800 leading-relaxed mb-4">
                    {language === 'en'
                      ? 'Once upon a time, before the mornings learned to warm the earth, a solitary Witch set forth upon the road.'
                      : 'Il était une fois, avant que les matins n’apprennent à réchauffer la terre, une sorcière solitaire s’avança sur le chemin.'}
                  </p>

                  <p className="font-serif text-sm sm:text-base text-stone-800 leading-relaxed italic border-l-2 border-amber-600 pl-3">
                    {language === 'en'
                      ? 'In her hands, she carried the blazing heart of the Sun—heavy, brilliant, and waiting to be shared.'
                      : 'Dans ses mains, elle portait le cœur étincelant du Soleil—lourd, éclatant, et prêt à être partagé.'}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="mt-8 flex items-center justify-between pt-4 border-t border-amber-900/10">
                  <button
                    id="storybook-btn-page-back"
                    onClick={onReturnToTitle}
                    className="text-xs font-serif text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Main Menu' : 'Menu Principal'}</span>
                  </button>

                  <button
                    id="storybook-btn-turn"
                    onClick={handleTurnToGame}
                    className="group px-6 py-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white font-serif font-semibold text-sm sm:text-base shadow-md transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer border border-amber-500/40"
                  >
                    <Sun className="w-4 h-4 text-amber-300" />
                    <span>{language === 'en' ? 'Begin the Tale ☀️' : 'Entrer dans le Conte ☀️'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. ENDING: OPEN STORYBOOK (FINAL EPILOGUE PAGE)            */}
        {/* ========================================================= */}
        {mode === 'ending' && step === 1 && (
          <div className="relative group w-full max-w-4xl">
            {/* Book outer hardcover casing shadow and layered pages below */}
            <div className="absolute -inset-2 bg-gradient-to-b from-[#29180c] via-[#1a0f07] to-[#120803] rounded-2xl book-paper-stack-bottom opacity-95 transform translate-y-1.5 pointer-events-none" />

            <div
              className={`relative w-full bg-[#fcf8f0] text-slate-900 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.92),0_0_50px_rgba(245,158,11,0.25)] border-4 border-amber-800/80 p-6 sm:p-10 flex flex-col md:flex-row gap-6 sm:gap-10 transition-all duration-700 preserve-3d ${
                animationState === 'closing' ? 'animate-book-close' : 'scale-100'
              }`}
            >
              {/* Center Binding Crease & Bookmark */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-10 -translate-x-1/2 bg-gradient-to-r from-stone-400/25 via-stone-700/35 to-stone-400/25 pointer-events-none shadow-inner" />
              <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-4 h-20 bg-gradient-to-b from-rose-700 to-rose-900 rounded-b shadow-md border-x border-b border-rose-500/40 pointer-events-none">
                <div className="w-2 h-2 rotate-45 bg-amber-400 mx-auto mt-17" />
              </div>

              {/* LEFT PAGE: Golden Reunion Vignette */}
              <div className="flex-1 flex flex-col items-center justify-center p-4 border border-amber-900/20 rounded-xl bg-gradient-to-b from-amber-50/90 to-amber-100/60 text-center shadow-sm">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 p-2 shadow-inner border-2 border-amber-600 flex items-center justify-center overflow-hidden mb-4">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Radiant Morning Sky */}
                    <rect width="200" height="200" fill="#fef08a" opacity="0.6" />
                    <circle cx="100" cy="50" r="32" fill="#fbbf24" opacity="0.9" />
                    <circle cx="100" cy="50" r="22" fill="#ffffff" />
                    {/* Celebratory feast silhouettes */}
                    <ellipse cx="100" cy="165" rx="75" ry="24" fill="#78350f" />
                    <rect x="75" y="130" width="50" height="22" rx="4" fill="#fbcfe8" />
                    <circle cx="100" cy="120" r="4" fill="#ef4444" />
                    <circle cx="95" cy="112" r="2" fill="#fde047" className="animate-pulse" />
                    <circle cx="105" cy="112" r="2" fill="#fde047" className="animate-pulse" />
                    {/* Floating Confetti Hearts */}
                    <polygon points="50,40 55,48 64,50 58,56 60,65 50,60 40,65 42,56 36,50 45,48" fill="#f59e0b" />
                    <polygon points="150,45 154,52 162,54 156,59 158,67 150,63 142,67 144,59 138,54 146,52" fill="#ec4899" />
                  </svg>
                </div>
                <span className="text-xs font-serif italic text-amber-900/85 font-medium">
                  {language === 'en'
                    ? 'Surrounded by the warmth of those she cherished…'
                    : 'Entourée par la chaleur de ceux qui lui sont chers…'}
                </span>
              </div>

              {/* RIGHT PAGE: Epilogue Narration */}
              <div className="flex-1 flex flex-col justify-between p-2">
                <div>
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-serif font-bold uppercase tracking-widest mb-3">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                    <span>{language === 'en' ? 'The Final Chapter' : 'Le Dernier Chapitre'}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-950 mb-3 leading-snug">
                    {language === 'en'
                      ? 'The Light Returned'
                      : 'La Lumière Retrouvée'}
                  </h2>

                  <p className="font-serif text-sm sm:text-base text-stone-900 leading-relaxed font-medium mb-3">
                    {language === 'en'
                      ? '“And so, the Sun returned to the sky, the Witch found her way home, and the light she had given away found its way back to her.”'
                      : '« Et ainsi, le Soleil revint dans le ciel, la Sorcière retrouva son foyer, et la lumière qu’elle avait offerte trouva son chemin vers son cœur. »'}
                  </p>

                  {/* Mélo Clown Personal Dedication */}
                  <div className="p-3 bg-amber-900/10 border border-amber-800/20 rounded-xl mb-3">
                    <span className="text-[11px] font-serif uppercase tracking-wider text-amber-900 font-bold block mb-1">
                      🎩 {language === 'en' ? 'Mélo Clown’s Birthday Note:' : 'Le Mot du Clown Mélo :'}
                    </span>
                    <p className="font-serif text-xs sm:text-sm text-stone-800 italic">
                      {language === 'en'
                        ? '“Happy Birthday lodi, Wendy! I hope you’ll have a wonderful day today! Take care always, partenaire.” ✨🎂'
                        : '« Joyeux Anniversaire lodi, Wendy ! J’espère que tu passeras une merveilleuse journée aujourd’hui ! Prends bien soin de toi, partenaire. » ✨🎂'}
                    </p>
                  </div>

                  <p className="font-serif text-xs sm:text-sm text-stone-700 italic">
                    {language === 'en'
                      ? 'Happy Birthday, Wendy. You will never have to walk alone again.'
                      : 'Joyeux Anniversaire, Wendy. Tu n’auras plus jamais à marcher seule.'}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 flex items-center justify-between pt-3 border-t border-amber-900/10">
                  <button
                    id="storybook-btn-close"
                    onClick={handleCloseBook}
                    className="group px-6 py-3 rounded-xl bg-gradient-to-r from-amber-700 to-stone-800 hover:from-amber-600 hover:to-stone-700 text-white font-serif font-semibold text-sm sm:text-base shadow-md transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer border border-amber-500/40"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{language === 'en' ? 'Close the Book 📕' : 'Fermer le Grimoire 📕'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. ENDING: CLOSED BACK COVER ("THE END")                   */}
        {/* ========================================================= */}
        {mode === 'ending' && step === 3 && (
          <div className="relative group">
            {/* Underlying stacked parchment pages shadow & thickness */}
            <div className="absolute -inset-1.5 sm:-inset-2 bg-gradient-to-l from-amber-950 via-[#e0cfab] to-[#c9b78e] rounded-2xl book-paper-stack-right book-paper-stack-bottom opacity-90 transform -translate-x-2 translate-y-2 pointer-events-none" />

            <div
              className={`relative w-full max-w-md sm:max-w-lg aspect-[3/4] bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 rounded-2xl border-4 border-amber-500/90 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_60px_rgba(245,158,11,0.4)] flex flex-col items-center justify-between p-8 sm:p-12 text-center transition-all duration-700 preserve-3d animate-fade-in`}
            >
              {/* Gold foiled leather bevel */}
              <div className="absolute inset-2 rounded-xl border border-amber-500/30 pointer-events-none" />

              {/* Book Spine Texture Edge on right */}
              <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-l from-amber-950 via-amber-900 to-stone-900 rounded-r-2xl border-l-2 border-amber-500/50 flex flex-col justify-around py-8 shadow-inner">
                <div className="w-full h-1.5 bg-gradient-to-l from-amber-600 to-amber-400 opacity-70" />
                <div className="w-full h-1.5 bg-gradient-to-l from-amber-600 to-amber-400 opacity-70" />
                <div className="w-full h-1.5 bg-gradient-to-l from-amber-600 to-amber-400 opacity-70" />
                <div className="w-full h-1.5 bg-gradient-to-l from-amber-600 to-amber-400 opacity-70" />
              </div>

              {/* Filigree Corners */}
              <div className="absolute top-3.5 left-3.5 w-9 h-9 border-t-2 border-l-2 border-amber-300 rounded-tl-lg shadow-sm" />
              <div className="absolute top-3.5 right-3.5 w-9 h-9 border-t-2 border-r-2 border-amber-300 rounded-tr-lg shadow-sm" />
              <div className="absolute bottom-3.5 left-3.5 w-9 h-9 border-b-2 border-l-2 border-amber-300 rounded-bl-lg shadow-sm" />
              <div className="absolute bottom-3.5 right-3.5 w-9 h-9 border-b-2 border-r-2 border-amber-300 rounded-br-lg shadow-sm" />

              {/* Emblem */}
              <div className="mt-4 flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-500/20 border-2 border-amber-400/80 p-2 shadow-[0_0_40px_rgba(251,191,36,0.5)] flex items-center justify-center mb-3">
                  <Sun className="w-10 h-10 sm:w-12 sm:h-12 text-amber-300 animate-pulse" />
                </div>
                <h1 className="text-lg sm:text-xl font-serif font-bold text-amber-100 tracking-wider">
                  {language === 'en'
                    ? 'THE WITCH WHO CARRIED THE SUN'
                    : 'LA SORCIÈRE QUI PORTAIT LE SOLEIL'}
                </h1>
              </div>

            {/* The End & Birthday Wish */}
            <div className="my-auto">
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 tracking-[0.2em] mb-3 drop-shadow-md">
                {language === 'en' ? 'THE END ✦' : 'FIN ✦'}
              </h2>
              <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3" />
              <p className="text-sm sm:text-base font-serif font-medium text-amber-200 drop-shadow flex items-center justify-center gap-1.5">
                <span>Happy Birthday, Wendy.</span>
                <Cake className="w-4 h-4 text-rose-400 inline" />
              </p>
            </div>

            {/* EXPLICIT ENDING OPTIONS */}
            <div className="flex flex-col gap-2.5 w-full mt-4">
              {/* Option 1: Watch Credits & Cast Roll */}
              {onShowCredits && (
                <button
                  id="storybook-btn-credits"
                  onClick={onShowCredits}
                  className="w-full px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-serif font-bold text-sm sm:text-base tracking-wide shadow-xl hover:shadow-amber-500/40 transition-all transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2 border border-amber-300"
                >
                  <ScrollText className="w-4 h-4 text-slate-950" />
                  <span>
                    {language === 'en'
                      ? 'Watch Credits & Cast 📜✨'
                      : 'Voir le Générique & la Troupe 📜✨'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Option 2: View Memories & Relics */}
              <button
                id="storybook-btn-memories"
                onClick={onComplete}
                className="w-full px-6 py-3 rounded-full bg-slate-900/90 hover:bg-slate-800 text-amber-200 hover:text-white font-serif font-semibold text-sm transition-all border border-amber-500/40 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:border-amber-400"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {language === 'en'
                    ? 'View Memories & Relics ✨'
                    : 'Voir les Souvenirs & Reliques ✨'}
                </span>
              </button>

              {/* Option 3: Return to Main Menu */}
              <button
                id="storybook-btn-return-menu"
                onClick={onReturnToTitle}
                className="w-full px-6 py-2.5 rounded-full bg-slate-950/80 hover:bg-slate-900 text-amber-300/80 hover:text-amber-100 font-serif text-xs sm:text-sm transition-all border border-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>
                  {language === 'en'
                    ? 'Return to Main Menu'
                    : 'Retour au Menu Principal'}
                </span>
              </button>

              {/* Optional: Read Story Again */}
              {onRestartStory && (
                <button
                  id="storybook-btn-restart"
                  onClick={onRestartStory}
                  className="w-full py-1 text-amber-300/60 hover:text-amber-200 text-xs font-serif transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>
                    {language === 'en'
                      ? 'Relive the Journey from Chapter 1'
                      : 'Revivre le Voyage depuis le Début'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Footer hint */}
      <footer className="text-center text-amber-200/50 text-xs font-serif mt-2 z-30">
        {language === 'en'
          ? 'An interactive fairytale of warmth and friendship'
          : 'Un conte interactif de chaleur et d’amitié'}
      </footer>
    </div>
  );
};
