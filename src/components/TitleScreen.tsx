import React from 'react';
import { Sun, Play, BookOpen, Volume2, VolumeX, Globe, Sparkles, Heart, Smartphone, Monitor, ScrollText, Wind, Lock, Sparkle, Cloud, Star } from 'lucide-react';
import { Language, ViewMode, CozyModeIntensity, SavedGamePreview, SceneLocation } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';

interface TitleScreenProps {
  onStartGame: () => void;
  onContinueGame?: () => void;
  onShowCredits?: () => void;
  onOpenMemories?: () => void;
  playCount?: number;
  hasSaveData: boolean;
  language: Language;
  onToggleLanguage: () => void;
  isMuted: boolean;
  onToggleAudio: () => void;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  savePreview?: SavedGamePreview | null;
  cozyMode?: CozyModeIntensity;
  onCycleCozyMode?: () => void;
  isCozyModeUnlocked?: boolean;
  onLockBday?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onContinueGame,
  onShowCredits,
  onOpenMemories,
  playCount = 1,
  hasSaveData,
  language,
  onToggleLanguage,
  isMuted,
  onToggleAudio,
  viewMode,
  onSetViewMode,
  savePreview,
  cozyMode = 'balanced',
  onCycleCozyMode,
  isCozyModeUnlocked = false,
  onLockBday,
}) => {
  const [showCozyLockedNotice, setShowCozyLockedNotice] = React.useState(false);
  const [isSunShining, setIsSunShining] = React.useState(false);
  const [sunFeedback, setSunFeedback] = React.useState<{ text: string; emoji: string } | null>(null);

  const handleStart = () => {
    audioSynth.playSoundEffect('wind_breeze');
    onStartGame();
  };

  const handleContinue = () => {
    audioSynth.playSoundEffect('page_turn');
    if (onContinueGame) onContinueGame();
  };

  const handleSelectMode = (mode: ViewMode) => {
    audioSynth.playSoundEffect('click');
    onSetViewMode(mode);
  };

  const handleCozyClick = () => {
    if (isCozyModeUnlocked) {
      audioSynth.playSoundEffect('magic_sparkle');
      if (onCycleCozyMode) onCycleCozyMode();
    } else {
      audioSynth.playSoundEffect('click');
      setShowCozyLockedNotice(true);
      setTimeout(() => setShowCozyLockedNotice(false), 3200);
    }
  };

  const handleSunClick = () => {
    setIsSunShining(true);
    audioSynth.playSoundEffect('sun_sparkle');
    setSunFeedback({
      text: language === 'en' ? 'The Sun Lantern radiates warmth!' : 'La Lanterne Solaire rayonne de chaleur !',
      emoji: '☀️',
    });
    setTimeout(() => setIsSunShining(false), 2400);
    setTimeout(() => setSunFeedback(null), 3200);
  };

  const getCozyLabel = () => {
    switch (cozyMode) {
      case 'minimal':
        return language === 'en' ? 'Calm FX' : 'FX Calme';
      case 'lush':
        return language === 'en' ? 'Dreamy FX' : 'FX Féerique';
      default:
        return language === 'en' ? 'Cozy FX' : 'FX Doux';
    }
  };

  // Render a stylish miniature scenic visual thumbnail representing the save location
  const renderLocationThumbnail = (loc?: SceneLocation) => {
    switch (loc) {
      case 'whispering_forest':
        return (
          <div className="w-14 h-11 rounded-lg bg-gradient-to-b from-emerald-950 to-emerald-900 border border-emerald-500/40 relative overflow-hidden flex items-center justify-center shadow-inner">
            <div className="absolute inset-0 bg-emerald-500/10" />
            <div className="w-3 h-5 bg-emerald-950 rounded-t-full border border-emerald-400/40" />
            <div className="w-4 h-6 bg-emerald-800 rounded-t-full border border-emerald-400/30 -ml-1" />
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
            <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-yellow-200" />
          </div>
        );
      case 'crossroads_kiln':
        return (
          <div className="w-14 h-11 rounded-lg bg-gradient-to-b from-stone-900 to-amber-950 border border-amber-500/40 relative overflow-hidden flex items-center justify-center shadow-inner">
            <div className="w-6 h-5 rounded-t-xl bg-stone-800 border border-amber-600/40 flex items-center justify-center">
              <div className="w-2.5 h-3 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 animate-pulse" />
            </div>
            <div className="absolute top-1 left-2 w-1 h-1 rounded-full bg-amber-300" />
          </div>
        );
      case 'windy_road':
        return (
          <div className="w-14 h-11 rounded-lg bg-gradient-to-b from-slate-900 to-sky-950 border border-sky-400/40 relative overflow-hidden flex items-center justify-center shadow-inner">
            <div className="absolute bottom-0 w-full h-3 bg-slate-700/60" />
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[16px] border-b-slate-600" />
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-sky-300/80 -ml-2" />
            <div className="absolute top-1 right-2 w-1 h-1 rounded-full bg-white animate-pulse" />
          </div>
        );
      case 'bottle_path':
        return (
          <div className="w-14 h-11 rounded-lg bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 border border-sky-400/50 relative overflow-hidden flex items-center justify-center shadow-inner">
            <div className="w-3.5 h-5 rounded-full bg-sky-400/40 border border-sky-200 flex items-center justify-center shadow-[0_0_8px_rgba(56,189,248,0.9)] animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-200" />
            </div>
            <div className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-cyan-300 animate-ping" />
          </div>
        );
      case 'velvet_abyss':
        return (
          <div className="w-14 h-11 rounded-lg bg-gradient-to-b from-purple-950 via-indigo-950 to-black border border-purple-400/50 relative overflow-hidden flex items-center justify-center shadow-inner">
            <div className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-400/50 flex items-center justify-center animate-pulse">
              <span className="text-[9px]">🎪</span>
            </div>
            <div className="absolute bottom-1 right-1.5 w-1 h-1 rounded-full bg-amber-300" />
          </div>
        );
      case 'sea_shore_dusk':
      case 'sea_shore_sunrise':
        return (
          <div className="w-14 h-11 rounded-lg bg-gradient-to-b from-amber-900 via-rose-950 to-sky-950 border border-amber-400/50 relative overflow-hidden flex items-center justify-center shadow-inner">
            <div className="absolute top-1 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-200 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
            <div className="absolute bottom-0 w-full h-3 bg-sky-900/80 border-t border-sky-400/40" />
          </div>
        );
      case 'magic_mirror':
        return (
          <div className="w-14 h-11 rounded-lg bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-950 border border-fuchsia-400/50 relative overflow-hidden flex items-center justify-center shadow-inner">
            <div className="w-5 h-7 rounded-full border border-purple-300/80 bg-purple-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(192,132,252,0.6)]">
              <span className="text-[8px] text-fuchsia-200">💜</span>
            </div>
          </div>
        );
      case 'birthday_feast':
        return (
          <div className="w-14 h-11 rounded-lg bg-gradient-to-b from-amber-950 via-pink-950 to-slate-950 border border-pink-400/50 relative overflow-hidden flex items-center justify-center shadow-inner">
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">🎂</span>
              <span className="text-[9px]">✨</span>
            </div>
          </div>
        );
      default:
        // Cottage at Twilight
        return (
          <div className="w-14 h-11 rounded-lg bg-gradient-to-b from-slate-900 via-indigo-950 to-emerald-950 border border-amber-400/40 relative overflow-hidden flex items-center justify-center shadow-inner">
            <div className="w-6 h-5 rounded-sm bg-slate-800 border border-amber-500/40 relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-amber-300/90 shadow-[0_0_6px_rgba(251,191,36,0.9)] animate-pulse" />
            </div>
            <div className="absolute top-1 left-2 w-1 h-1 rounded-full bg-yellow-200" />
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-12 z-20 select-none">
      {/* Sun Lantern Warmth Feedback Toast */}
      {sunFeedback && (
        <div className="fixed top-20 z-50 px-4 py-2 rounded-2xl bg-amber-950/95 border border-amber-400 text-amber-200 text-xs sm:text-sm font-serif shadow-2xl backdrop-blur-md animate-bounce flex items-center gap-2">
          <span>{sunFeedback.emoji}</span>
          <span>{sunFeedback.text}</span>
        </div>
      )}

      {/* Top Navbar */}
      <div className="w-full max-w-5xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-amber-500/30 text-amber-200 text-xs font-serif">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{language === 'en' ? 'A Cozy Magical Tale' : 'Un Conte Magique & Chaleureux'}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Cozy Atmosphere Mode Toggle (Unlocked in Playthrough 2) */}
          <div className="relative">
            <button
              id="title-btn-cozy-mode"
              onClick={handleCozyClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer backdrop-blur-md border ${
                isCozyModeUnlocked
                  ? 'bg-slate-950/80 border-amber-400/50 text-amber-200 hover:text-white hover:border-amber-300 shadow-md'
                  : 'bg-slate-950/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
              title={
                isCozyModeUnlocked
                  ? language === 'en'
                    ? 'Adjust ambient atmosphere (Petals & Wind)'
                    : 'Ajuster l’atmosphère ambiante (Pétales & Vent)'
                  : language === 'en'
                  ? 'Cozy Mode unlocks in 2nd Playthrough'
                  : 'Mode Doux débloqué lors du 2ème voyage'
              }
            >
              {isCozyModeUnlocked ? (
                <Wind className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="font-semibold">
                {isCozyModeUnlocked ? getCozyLabel() : language === 'en' ? 'Cozy FX' : 'FX Ambiance'}
              </span>
            </button>

            {/* Cozy Mode Locked Notice Tooltip */}
            {showCozyLockedNotice && (
              <div className="absolute top-full right-0 mt-2 z-50 w-64 p-2.5 rounded-xl bg-slate-950/95 border border-amber-400/60 text-amber-200 text-[11px] font-serif shadow-2xl animate-fade-in text-center leading-relaxed">
                <span className="font-bold text-amber-300">✨ {language === 'en' ? 'Playthrough 2 Feature' : 'Fonction 2ème Voyage'}</span>
                <p className="mt-1 text-slate-300 text-[10px]">
                  {language === 'en'
                    ? 'Complete the story once to unlock Cozy Atmosphere controls (intensity of wind, petals, and motes)!'
                    : 'Terminez le conte une première fois pour débloquer le contrôle d’ambiance (vent, pétales et lueurs) !'}
                </p>
              </div>
            )}
          </div>

          {/* Device View Mode Toggle (PC / Phone) */}
          <div className="flex items-center p-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-500/30">
            <button
              id="title-btn-pc-mode"
              onClick={() => handleSelectMode('pc')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                viewMode === 'pc'
                  ? 'bg-amber-600 text-white font-semibold shadow-md'
                  : 'text-amber-200/80 hover:text-white'
              }`}
              title={language === 'en' ? 'Switch to PC Mode' : 'Passer en Mode PC'}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'PC' : 'PC'}</span>
            </button>

            <button
              id="title-btn-phone-mode"
              onClick={() => handleSelectMode('phone')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                viewMode === 'phone'
                  ? 'bg-amber-600 text-white font-semibold shadow-md'
                  : 'text-amber-200/80 hover:text-white'
              }`}
              title={language === 'en' ? 'Switch to Phone Mode' : 'Passer en Mode Mobile'}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Phone' : 'Mobile'}</span>
            </button>
          </div>

          {/* Language Switch */}
          <button
            id="title-btn-language"
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-amber-500/30 text-amber-200 hover:text-white hover:border-amber-400 text-xs font-serif transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-semibold">{language === 'en' ? 'FRANÇAIS 🇫🇷' : 'ENGLISH 🇬🇧'}</span>
          </button>

          {/* Audio Switch */}
          <button
            id="title-btn-audio"
            onClick={onToggleAudio}
            className="p-2 rounded-full bg-slate-950/60 backdrop-blur-md border border-amber-500/30 text-amber-200 hover:text-white hover:border-amber-400 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Birthday Seal Lock */}
          {onLockBday && (
            <button
              id="title-btn-lock"
              onClick={onLockBday}
              className="p-2 rounded-full bg-slate-950/60 backdrop-blur-md border border-amber-500/30 text-amber-300 hover:text-amber-100 hover:border-amber-400 transition-colors cursor-pointer"
              title={language === 'en' ? 'Lock with Birthday Key' : 'Verrouiller par Clé d’Anniversaire'}
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Hero Section */}
      <div className="flex flex-col items-center text-center max-w-3xl my-auto animate-fade-in">
        {/* Animated Sun Lantern Visual with Radiant Burst on Click */}
        <div
          className="relative mb-6 cursor-pointer group"
          onClick={handleSunClick}
          title={language === 'en' ? 'Click the Sun Lantern to make it shine!' : 'Clique sur la Lanterne Solaire pour la faire briller !'}
        >
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-1 shadow-[0_0_50px_rgba(251,191,36,0.5)] flex items-center justify-center transition-all duration-500 ${
              isSunShining ? 'scale-125 shadow-[0_0_80px_rgba(251,191,36,0.9)] rotate-45' : 'animate-pulse group-hover:scale-110'
            }`}
          >
            <div className="w-full h-full rounded-full bg-slate-950/80 backdrop-blur-sm flex items-center justify-center border border-amber-300/60">
              <Sun className={`w-12 h-12 text-amber-300 transition-all ${isSunShining ? 'animate-spin scale-110 text-yellow-200' : 'animate-spin-slow'}`} />
            </div>
          </div>
          {isSunShining && (
            <div className="absolute -inset-4 rounded-full border-2 border-yellow-300/60 animate-ping pointer-events-none" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 tracking-wide mb-3 drop-shadow-lg">
          {language === 'en'
            ? 'The Witch Who Carried the Sun'
            : 'La Sorcière qui Portait le Soleil'}
        </h1>

        {/* Subtitle */}
        <p className="text-amber-200/80 font-serif text-sm sm:text-base md:text-lg max-w-xl mb-6 leading-relaxed">
          {language === 'en'
            ? 'A gentle story about sharing warmth, walking with unlikely companions, and learning you were never meant to carry the sky alone.'
            : 'Un conte doux sur le partage de la chaleur, la marche avec d’étranges compagnons, et la découverte qu’on n’a jamais été fait pour porter le ciel tout seul.'}
        </p>

        {/* Display Mode Selection Indicator Bar */}
        <div className="flex items-center gap-2 mb-8 px-4 py-2 rounded-2xl bg-slate-950/60 border border-amber-500/20 text-xs font-serif text-amber-200/90">
          <span>{language === 'en' ? 'Viewing Mode:' : 'Mode d’Affichage :'}</span>
          <button
            onClick={() => handleSelectMode('pc')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'pc' ? 'bg-amber-500/30 text-amber-200 font-bold border border-amber-400/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            💻 {language === 'en' ? 'PC (Widescreen)' : 'PC (Plein écran)'}
          </button>
          <span className="text-amber-500/40">•</span>
          <button
            onClick={() => handleSelectMode('phone')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'phone' ? 'bg-amber-500/30 text-amber-200 font-bold border border-amber-400/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            📱 {language === 'en' ? 'Phone Mode' : 'Mode Mobile'}
          </button>
        </div>

      {/* Action Buttons & Cute Companion Marmot */}
      <div className="relative w-full max-w-3xl flex flex-col items-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl z-10">
          <button
            id="btn-start-game"
            onClick={handleStart}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-2xl font-serif text-base sm:text-lg font-semibold shadow-xl hover:shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer border border-amber-300/30"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{language === 'en' ? 'Begin the Journey' : 'Commencer le Voyage'}</span>
          </button>

          {/* Enhanced Continue Button with Visual Location Thumbnail Preview */}
          {hasSaveData && onContinueGame && (
            <button
              id="btn-continue-game"
              onClick={handleContinue}
              className="w-full sm:w-auto flex items-center gap-3.5 px-5 py-3 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-amber-950/80 hover:from-slate-800 hover:to-amber-900/90 text-amber-100 rounded-2xl font-serif shadow-xl border border-amber-400/40 hover:border-amber-400 transition-all transform hover:-translate-y-0.5 cursor-pointer text-left group"
            >
              {/* Left Miniature Scenic Visual Thumbnail */}
              {renderLocationThumbnail(savePreview?.location)}

              {/* Right Description Lines */}
              <div className="flex flex-col justify-center min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400 group-hover:rotate-6 transition-transform" />
                  <span className="text-sm sm:text-base font-bold text-amber-100 group-hover:text-white">
                    {language === 'en' ? 'Continue Journey' : 'Reprendre le Voyage'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-amber-200/80 font-serif">
                  <span className="truncate max-w-[160px] sm:max-w-[200px]">
                    {savePreview?.chapterTitle
                      ? savePreview.chapterTitle[language] || savePreview.chapterTitle.en
                      : language === 'en'
                      ? 'Saved Chapter'
                      : 'Chapitre Sauvegardé'}
                  </span>
                  {savePreview && savePreview.collectedCount > 0 && (
                    <span className="text-amber-400 font-medium">
                      ✨ {savePreview.collectedCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )}

          {onOpenMemories && (
            <button
              id="btn-open-memories"
              onClick={() => {
                audioSynth.playSoundEffect('magic_sparkle');
                onOpenMemories();
              }}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-serif text-sm sm:text-base transition-all border cursor-pointer shadow-md ${
                playCount >= 7
                  ? 'bg-amber-950/80 hover:bg-amber-900/90 text-amber-100 border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                  : 'bg-slate-950/70 hover:bg-slate-900 text-amber-200/90 border-amber-500/30'
              }`}
              title={
                playCount >= 7
                  ? language === 'en'
                    ? 'Open the Chronicle Memories Scrapbook'
                    : 'Ouvrir l’Album de Souvenirs de la Chronique'
                  : language === 'en'
                  ? `Memories Scrapbook (Unlocked after 7 gameplays • ${playCount}/7)`
                  : `Album de Souvenirs (Débloqué après 7 voyages • ${playCount}/7)`
              }
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>
                {language === 'en' ? 'Memories' : 'Souvenirs'}
                {playCount < 7 ? ` (${playCount}/7)` : ' ✨'}
              </span>
            </button>
          )}

          {onShowCredits && (
            <button
              id="btn-show-credits"
              onClick={() => {
                audioSynth.playSoundEffect('click');
                onShowCredits();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-4 bg-slate-950/70 hover:bg-slate-900 text-amber-200/90 hover:text-amber-100 rounded-2xl font-serif text-sm sm:text-base transition-all border border-amber-500/20 hover:border-amber-400/40 cursor-pointer shadow-md"
              title={language === 'en' ? 'Storybook Credits' : 'Générique du Conte'}
            >
              <ScrollText className="w-4 h-4 text-amber-400" />
              <span>{language === 'en' ? 'Credits' : 'Générique'}</span>
            </button>
          )}
        </div>

        {/* CUTE MARMOT COMPANION IN TITLE SCREEN (Peeking cozily on the knoll before journey starts) */}
        <MarmotCompanion language={language} />
      </div>
      </div>

      {/* Footer / Gift Note */}
      <div className="w-full max-w-md text-center text-amber-200/70 text-xs font-serif flex items-center justify-center gap-1.5 pt-6">
        <Heart className="w-3.5 h-3.5 text-amber-400/80 fill-amber-400/40" />
        <span className="tracking-wide font-medium">
          To my duo, partenaire, and lodi.
        </span>
      </div>
    </div>
  );
};

interface MarmotCompanionProps {
  language: Language;
}

export const MarmotCompanion: React.FC<MarmotCompanionProps> = ({ language }) => {
  const marmotRef = React.useRef<HTMLDivElement>(null);
  const [speechBubble, setSpeechBubble] = React.useState<string | null>(null);
  const [marmotAnim, setMarmotAnim] = React.useState<'idle' | 'stretch' | 'yawn' | 'bounce' | 'snack'>('idle');
  const [eyeOffset, setEyeOffset] = React.useState({ x: 0, y: 0 });

  // Subtle interactive gaze tracking for the cute title marmot
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!marmotRef.current) return;
      const rect = marmotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      const maxDist = 350;
      const intensity = Math.min(1, dist / maxDist);
      const targetX = (dx / dist) * intensity * 1.8;
      const targetY = (dy / dist) * intensity * 1.4;

      setEyeOffset({
        x: Math.round(targetX * 10) / 10,
        y: Math.round(targetY * 10) / 10,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const chirps = React.useMemo(() => {
    return language === 'en'
      ? [
          'Chirp! 🌻 Have a cozy, magical adventure!',
          'Squeak! The lantern is so warm today!',
          'Don’t forget your sunflower seed snacks! 🌰',
          'A gentle journey awaits you, traveler! ✨',
          '*Yaaawn*... Feeling so warm and cozy under the sun! ☀️',
          '*Big stretch!* Ready for a new story! 🐾',
          'Nom nom nom... Crunchy little seeds! 🌻',
        ]
      : [
          'Chirp ! 🌻 Bon voyage dans ce doux conte !',
          'Hihi ! La lanterne est si chaude et réconfortante !',
          'N’oublie pas les graines de tournesol ! 🌰',
          'Une aventure magique et poétique t’attend ! ✨',
          '*Bâââillement*... Il fait si doux au soleil ! ☀️',
          '*Grand étirement !* Prêt pour un nouveau conte ! 🐾',
          'Miam miam... Délicieuses petites graines ! 🌻',
        ];
  }, [language]);

  const handleMarmotClick = () => {
    // Pick random animation
    const roll = Math.random();
    if (roll < 0.3) {
      // Yawn animation
      audioSynth.playSoundEffect('marmot_yawn');
      setMarmotAnim('yawn');
      setSpeechBubble(language === 'en' ? '*Yaaaawn~* Cozy nap time! 💤' : '*Bâââillement~* Petite sieste douillette ! 💤');
      setTimeout(() => setMarmotAnim('idle'), 2200);
      setTimeout(() => setSpeechBubble(null), 3600);
    } else if (roll < 0.6) {
      // Stretch animation
      audioSynth.playSoundEffect('marmot_squeak');
      setMarmotAnim('stretch');
      setSpeechBubble(language === 'en' ? '*Biiig stretch!* ✨ Squeak!' : '*Grand étirement !* ✨ Hihi !');
      setTimeout(() => setMarmotAnim('idle'), 2000);
      setTimeout(() => setSpeechBubble(null), 3600);
    } else if (roll < 0.8) {
      // Seed Snack animation
      audioSynth.playSoundEffect('magic_sparkle');
      setMarmotAnim('snack');
      setSpeechBubble(language === 'en' ? 'Nom nom nom! 🌰 Sunflower seeds!' : 'Miam miam ! 🌰 Graines de tournesol !');
      setTimeout(() => setMarmotAnim('idle'), 1800);
      setTimeout(() => setSpeechBubble(null), 3600);
    } else {
      // Happy Bounce
      audioSynth.playSoundEffect('marmot_squeak');
      setMarmotAnim('bounce');
      const randomChirp = chirps[Math.floor(Math.random() * chirps.length)];
      setSpeechBubble(randomChirp);
      setTimeout(() => setMarmotAnim('idle'), 1200);
      setTimeout(() => setSpeechBubble(null), 3800);
    }
  };

  return (
    <div
      ref={marmotRef}
      id="title-marmot-companion"
      className="mt-6 flex flex-col items-center cursor-pointer group select-none transition-transform"
      onClick={handleMarmotClick}
      title={language === 'en' ? 'Click the cute little marmot!' : 'Clique sur la petite marmotte !'}
    >
      {/* Speech Bubble when clicked */}
      {speechBubble && (
        <div className="mb-2 px-3 py-1.5 rounded-2xl bg-amber-950/90 border border-amber-400/70 text-amber-200 text-xs font-serif shadow-2xl animate-bounce text-center backdrop-blur-md max-w-xs z-20">
          {speechBubble}
        </div>
      )}

      {/* Marmot Figure sitting on a grassy mound */}
      <div
        className={`relative w-28 h-24 flex items-end justify-center transition-all duration-300 ${
          marmotAnim === 'stretch'
            ? 'scale-y-110 -translate-y-2.5 scale-x-95'
            : marmotAnim === 'yawn'
            ? 'scale-105 -translate-y-1'
            : marmotAnim === 'bounce'
            ? '-translate-y-3 scale-110'
            : marmotAnim === 'snack'
            ? 'scale-105'
            : 'group-hover:-translate-y-1'
        }`}
      >
        {/* Floating Golden Sun Motes Particle System around idle marmot */}
        {marmotAnim === 'idle' && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            <div className="absolute -top-3 left-2 w-2 h-2 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-100 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
            <div className="absolute -top-1 right-3 w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-amber-200 to-yellow-50 shadow-[0_0_6px_rgba(251,191,36,0.8)] animate-pulse" />
            <div className="absolute top-6 -left-3 w-2 h-2 rounded-full bg-gradient-to-tr from-yellow-300 to-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-ping" />
            <div className="absolute top-10 -right-2 w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-100 shadow-[0_0_6px_rgba(251,191,36,0.8)] animate-pulse" />
            <div className="absolute bottom-2 left-0 w-1 h-1 rounded-full bg-yellow-100 shadow-[0_0_5px_rgba(251,191,36,0.9)] animate-pulse" />
            <div className="absolute bottom-4 right-1 w-2 h-2 rounded-full bg-gradient-to-tr from-amber-200 to-yellow-200 shadow-[0_0_7px_rgba(251,191,36,0.8)] animate-ping" />
          </div>
        )}

        <svg viewBox="0 0 140 120" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="marmotFurGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#92400e" />
              <stop offset="60%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id="marmotBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>

          {/* Grassy Mound with Tiny Wildflowers */}
          <path d="M10 115 Q70 95 130 115 L140 120 L0 120 Z" fill="#1e293b" opacity="0.6" />
          <path d="M15 116 Q70 100 125 116" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
          {/* Flower 1 */}
          <circle cx="28" cy="108" r="2.5" fill="#fbbf24" className="animate-pulse" />
          <circle cx="28" cy="108" r="1" fill="#ffffff" />
          {/* Flower 2 */}
          <circle cx="112" cy="110" r="2.5" fill="#f472b6" className="animate-pulse" />
          <circle cx="112" cy="110" r="1" fill="#ffffff" />

          {/* Fluffy Marmot Tail (Animated Wagging) */}
          <ellipse
            cx="38"
            cy="85"
            rx="14"
            ry="9"
            fill="#451a03"
            transform={marmotAnim === 'bounce' || marmotAnim === 'stretch' ? 'rotate(-35 38 85)' : 'rotate(-20 38 85)'}
            className={`transition-transform duration-300 ${marmotAnim === 'idle' ? 'animate-marmot-tail' : ''}`}
          />

          {/* Chubby Marmot Body (Animated Breathing) */}
          <g className={marmotAnim === 'idle' ? 'animate-marmot-breathe' : ''}>
            <ellipse cx="70" cy={marmotAnim === 'stretch' ? '72' : '76'} rx="26" ry={marmotAnim === 'stretch' ? '28' : '24'} fill="url(#marmotFurGrad)" />

            {/* Creamy Soft Belly */}
            <ellipse cx="70" cy={marmotAnim === 'stretch' ? '76' : '80'} rx="16" ry={marmotAnim === 'stretch' ? '19' : '17'} fill="url(#marmotBellyGrad)" />
          </g>

          {/* Marmot Head & Expressive Features */}
          <g className={marmotAnim === 'idle' ? 'animate-marmot-head' : ''}>
            {/* Marmot Head Base */}
            <ellipse cx="70" cy={marmotAnim === 'stretch' ? '41' : '46'} rx="20" ry="18" fill="url(#marmotFurGrad)" />

            {/* Round Furry Ears with Pink Centers & Independent Twitches */}
            {/* Left Ear */}
            <g className={marmotAnim === 'idle' ? 'animate-marmot-ear-left' : ''}>
              <ellipse
                cx="54"
                cy={marmotAnim === 'stretch' ? '28' : '33'}
                rx="5.5"
                ry="6"
                fill="#78350f"
                className="group-hover:rotate-12 origin-bottom transition-transform"
              />
              <ellipse cx="54" cy={marmotAnim === 'stretch' ? '28' : '33'} rx="3.5" ry="4" fill="#fbcfe8" />
            </g>

            {/* Right Ear */}
            <g className={marmotAnim === 'idle' ? 'animate-marmot-ear-right' : ''}>
              <ellipse
                cx="86"
                cy={marmotAnim === 'stretch' ? '28' : '33'}
                rx="5.5"
                ry="6"
                fill="#78350f"
                className="group-hover:-rotate-12 origin-bottom transition-transform"
              />
              <ellipse cx="86" cy={marmotAnim === 'stretch' ? '28' : '33'} rx="3.5" ry="4" fill="#fbcfe8" />
            </g>

            {/* Creamy Snout & Muzzle */}
            <ellipse cx="70" cy={marmotAnim === 'stretch' ? '47' : '52'} rx="11" ry="8" fill="url(#marmotBellyGrad)" />

            {/* Twitchy Sniffing Black Nose & Whiskers */}
            <g className={marmotAnim === 'idle' ? 'animate-marmot-sniff' : ''}>
              <ellipse cx="70" cy={marmotAnim === 'stretch' ? '43' : '48'} rx="3" ry="2.2" fill="#18181b" />

              {/* Whiskers */}
              <g stroke="#92400e" strokeWidth="0.8" opacity="0.7">
                <line x1="56" y1={marmotAnim === 'stretch' ? '44' : '49'} x2="44" y2={marmotAnim === 'stretch' ? '42' : '47'} />
                <line x1="56" y1={marmotAnim === 'stretch' ? '47' : '52'} x2="43" y2={marmotAnim === 'stretch' ? '48' : '53'} />
                <line x1="84" y1={marmotAnim === 'stretch' ? '44' : '49'} x2="96" y2={marmotAnim === 'stretch' ? '42' : '47'} />
                <line x1="84" y1={marmotAnim === 'stretch' ? '47' : '52'} x2="97" y2={marmotAnim === 'stretch' ? '48' : '53'} />
              </g>
            </g>

            {/* Marmot Mouth - Custom Yawn vs Snacking vs Normal */}
            {marmotAnim === 'yawn' ? (
              <g>
                {/* Wide Yawning Mouth */}
                <ellipse cx="70" cy="55" rx="6" ry="7" fill="#881337" stroke="#78350f" strokeWidth="1" />
                {/* Little pink tongue */}
                <ellipse cx="70" cy="58" rx="3.5" ry="2.5" fill="#fb7185" />
                {/* Tiny upper buck teeth */}
                <rect x="68" y="48.5" width="4" height="2" rx="0.5" fill="#ffffff" />
              </g>
            ) : marmotAnim === 'snack' ? (
              <g>
                {/* Chewing little mouth */}
                <ellipse cx="70" cy="53" rx="4" ry="2.5" fill="#881337" className="animate-ping" />
                <circle cx="70" cy="56" r="2.5" fill="#92400e" stroke="#451a03" strokeWidth="0.5" />
              </g>
            ) : (
              <g>
                <path d="M66 53 Q70 56 74 53" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <rect x="68" y="53" width="4" height="3" rx="1" fill="#ffffff" stroke="#78350f" strokeWidth="0.5" />
              </g>
            )}

            {/* Rosy Cheeks */}
            <ellipse cx="57" cy={marmotAnim === 'stretch' ? '45' : '50'} rx="3.5" ry="2" fill="#f43f5e" opacity="0.45" />
            <ellipse cx="83" cy={marmotAnim === 'stretch' ? '45' : '50'} rx="3.5" ry="2" fill="#f43f5e" opacity="0.45" />

            {/* Sparkly Button Eyes with Natural Blinking and Cursor Gaze Tracking */}
            {marmotAnim === 'yawn' ? (
              <g stroke="#18181b" strokeWidth="2" strokeLinecap="round" fill="none">
                {/* Happy squinting closed eyes during yawn */}
                <path d="M57 42 Q60 39 63 42" />
                <path d="M77 42 Q80 39 83 42" />
                {/* Tiny tear of sleepy joy */}
                <circle cx="85" cy="45" r="1.2" fill="#38bdf8" />
              </g>
            ) : (
              <g className="animate-eye-blink">
                <g style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`, transition: 'transform 0.1s ease-out' }}>
                  <circle cx="60" cy={marmotAnim === 'stretch' ? '37' : '42'} r="3.2" fill="#18181b" />
                  <circle cx="59" cy={marmotAnim === 'stretch' ? '35.8' : '40.8'} r="1.1" fill="#ffffff" />
                  <circle cx="61.2" cy={marmotAnim === 'stretch' ? '37.5' : '42.5'} r="0.5" fill="#ffffff" />
                  <circle cx="80" cy={marmotAnim === 'stretch' ? '37' : '42'} r="3.2" fill="#18181b" />
                  <circle cx="79" cy={marmotAnim === 'stretch' ? '35.8' : '40.8'} r="1.1" fill="#ffffff" />
                  <circle cx="81.2" cy={marmotAnim === 'stretch' ? '37.5' : '42.5'} r="0.5" fill="#ffffff" />
                </g>
              </g>
            )}
          </g>

          {/* Paws - Stretching Up vs Holding Flower */}
          {marmotAnim === 'stretch' ? (
            <g fill="#92400e">
              {/* Paws reaching high up in stretch */}
              <ellipse cx="50" cy="38" rx="4.5" ry="4" transform="rotate(-30 50 38)" />
              <ellipse cx="90" cy="38" rx="4.5" ry="4" transform="rotate(30 90 38)" />
            </g>
          ) : (
            <g fill="#92400e">
              <ellipse cx="61" cy="74" rx="4.5" ry="3.5" />
              <ellipse cx="79" cy="74" rx="4.5" ry="3.5" />
            </g>
          )}

          {/* Glowing Sun Dandelion Flower (Gentle organic swaying) */}
          {marmotAnim !== 'stretch' && (
            <g className={marmotAnim === 'idle' ? 'animate-marmot-flower' : ''} transform="translate(70, 71)">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="0" cy="0" r="5" fill="#fef08a" opacity="0.6" className="animate-pulse" />
              <circle cx="0" cy="0" r="3.5" fill="#fbbf24" />
              <circle cx="0" cy="0" r="1.2" fill="#ffffff" />
            </g>
          )}
        </svg>
      </div>

      <span className="text-[10px] text-amber-300/70 font-serif group-hover:text-amber-200 transition-colors">
        🐾 {language === 'en' ? 'Marmot Companion (Click me!)' : 'Compagnon Marmotte (Clique-moi !)'}
      </span>
    </div>
  );
};

