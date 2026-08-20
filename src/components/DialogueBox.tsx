import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, Volume2, VolumeX, History, Play, Pause, Globe, Sparkles } from 'lucide-react';
import { CharacterId, DialogueText, Language } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';

interface DialogueBoxProps {
  speaker: CharacterId;
  speakerName?: DialogueText;
  text: DialogueText;
  language: Language;
  onAdvance: () => void;
  onPrevious?: () => void;
  canGoBack?: boolean;
  onOpenLog: () => void;
  onToggleAudio: () => void;
  isMuted: boolean;
  onToggleLanguage: () => void;
  onToggleAutoPlay: () => void;
  isAutoPlay: boolean;
  canAdvance: boolean;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  speaker,
  speakerName,
  text,
  language,
  onAdvance,
  onPrevious,
  canGoBack = false,
  onOpenLog,
  onToggleAudio,
  isMuted,
  onToggleLanguage,
  onToggleAutoPlay,
  isAutoPlay,
  canAdvance,
}) => {
  const fullText = text[language] || text.en;
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    // Engage ambient audio ducking during active dialogue delivery
    audioSynth.setDialogueSpeaking(true);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        const nextChar = fullText[currentIndex];
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        // Typewriter character voice sound effect with unique pitch per speaker
        if (currentIndex % 2 === 0 || nextChar === '!' || nextChar === '?') {
          audioSynth.playTypewriterVoice(speaker, nextChar);
        }
        currentIndex++;
      } else {
        setIsTyping(false);
        audioSynth.setDialogueSpeaking(false);
        clearInterval(interval);
      }
    }, 24);

    return () => {
      clearInterval(interval);
      audioSynth.setDialogueSpeaking(false);
    };
  }, [fullText, speaker]);

  const handleClickBox = (e: React.MouseEvent) => {
    // Prevent event bubbling if clicking controls
    if ((e.target as HTMLElement).closest('button')) return;

    if (isTyping) {
      // Instant finish typing
      setDisplayedText(fullText);
      setIsTyping(false);
      audioSynth.setDialogueSpeaking(false);
    } else if (canAdvance) {
      onAdvance();
    }
  };

  const getSpeakerBadgeInfo = () => {
    switch (speaker) {
      case 'witch':
        return {
          icon: '✨',
          styling: 'from-amber-600/95 via-orange-600/90 to-amber-800/95 border-amber-300/80 text-amber-50 shadow-[0_0_18px_rgba(251,191,36,0.45)]',
          tailColor: 'border-t-amber-600/95',
        };
      case 'lezar':
        return {
          icon: '🐱',
          styling: 'from-sky-700/95 via-cyan-800/90 to-sky-900/95 border-sky-300/80 text-sky-50 shadow-[0_0_18px_rgba(56,189,248,0.4)]',
          tailColor: 'border-t-sky-700/95',
        };
      case 'clown':
        return {
          icon: '🎪',
          styling: 'from-purple-800/95 via-fuchsia-800/90 to-pink-950/95 border-pink-300/80 text-pink-50 shadow-[0_0_18px_rgba(232,121,249,0.45)]',
          tailColor: 'border-t-purple-800/95',
        };
      case 'orik':
        return {
          icon: '🌿',
          styling: 'from-emerald-700/95 via-teal-700/90 to-emerald-950/95 border-emerald-300/80 text-emerald-50 shadow-[0_0_18px_rgba(52,211,153,0.4)]',
          tailColor: 'border-t-emerald-700/95',
        };
      case 'artisan':
        return {
          icon: '🔥',
          styling: 'from-orange-700/95 via-amber-700/90 to-stone-900/95 border-orange-300/80 text-orange-50 shadow-[0_0_18px_rgba(249,115,22,0.4)]',
          tailColor: 'border-t-orange-700/95',
        };
      default:
        return {
          icon: '📜',
          styling: 'from-slate-800/95 via-slate-900/90 to-stone-950/95 border-amber-500/40 text-amber-200 shadow-md',
          tailColor: 'border-t-slate-800/95',
        };
    }
  };

  const displayName = speakerName ? speakerName[language] : speaker !== 'narrator' ? speaker : null;
  const speakerBadge = getSpeakerBadgeInfo();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 select-none relative">
      {/* Floating Dynamic Character Name Tag Bubble Above Main Box */}
      <div className="relative z-10 px-2 flex items-end justify-between -mb-3 pointer-events-none">
        {/* Floating Bubble */}
        <div className="animate-name-bubble-float pointer-events-auto">
          {displayName ? (
            <div className="relative flex flex-col items-start">
              <div
                id="speaker-tag"
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-serif tracking-wider uppercase font-bold border-2 bg-gradient-to-r ${speakerBadge.styling} backdrop-blur-md transition-all duration-300`}
              >
                <span className="text-sm drop-shadow-sm">{speakerBadge.icon}</span>
                <span className="drop-shadow-sm">{displayName}</span>
              </div>
              {/* Subtle speech bubble notch / tail pointing towards dialogue box */}
              <div
                className={`w-0 h-0 ml-6 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] ${speakerBadge.tailColor} drop-shadow-sm`}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-serif italic text-amber-200/75 bg-slate-950/80 border border-amber-500/25 backdrop-blur-md shadow-sm">
              <span>📜</span>
              <span>{language === 'en' ? 'Storybook Chronicle' : 'Chronique du Conte'}</span>
            </div>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-900/40 text-amber-200/80 text-xs shadow-md pointer-events-auto mb-1">
          {/* Language Toggle */}
          <button
            id="btn-language-toggle"
            onClick={onToggleLanguage}
            className="flex items-center gap-1 hover:text-amber-100 transition-colors px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer"
            title={language === 'en' ? 'Switch to French' : 'Passer en Anglais'}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-semibold">{language.toUpperCase()}</span>
          </button>

          <span className="text-slate-600">|</span>

          {/* Audio Toggle */}
          <button
            id="btn-audio-toggle"
            onClick={onToggleAudio}
            className="hover:text-amber-100 transition-colors p-1 rounded hover:bg-white/10 cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <span className="text-slate-600">|</span>

          {/* Back (Previous Scene) Button */}
          {onPrevious && (
            <button
              id="btn-previous-scene"
              disabled={!canGoBack}
              onClick={(e) => {
                e.stopPropagation();
                if (canGoBack) onPrevious();
              }}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded transition-colors ${
                canGoBack
                  ? 'hover:bg-white/10 hover:text-amber-100 cursor-pointer'
                  : 'opacity-30 cursor-not-allowed text-slate-500'
              }`}
              title={language === 'en' ? 'Previous Line (Left Arrow)' : 'Ligne Précédente (Flèche Gauche)'}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px] font-semibold">{language === 'en' ? 'BACK' : 'RETOUR'}</span>
            </button>
          )}

          {/* Auto Play Toggle */}
          <button
            id="btn-autoplay-toggle"
            onClick={onToggleAutoPlay}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              isAutoPlay ? 'bg-amber-500/30 text-amber-300 font-medium' : 'hover:bg-white/10'
            }`}
            title="Toggle Auto Play"
          >
            {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[10px]">AUTO</span>
          </button>

          {/* Next Button */}
          <button
            id="btn-next-scene"
            disabled={!canAdvance}
            onClick={(e) => {
              e.stopPropagation();
              if (canAdvance) onAdvance();
            }}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded transition-colors ${
              canAdvance
                ? 'hover:bg-white/10 hover:text-amber-100 cursor-pointer'
                : 'opacity-30 cursor-not-allowed text-slate-500'
            }`}
            title={language === 'en' ? 'Next Line (Space / Right Arrow)' : 'Ligne Suivante (Espace / Flèche Droite)'}
          >
            <span className="hidden sm:inline text-[10px] font-semibold">{language === 'en' ? 'NEXT' : 'SUIVANT'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <span className="text-slate-600">|</span>

          {/* History Backlog */}
          <button
            id="btn-log-modal"
            onClick={onOpenLog}
            className="flex items-center gap-1 hover:text-amber-100 transition-colors px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer"
            title="View History Log"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">LOG</span>
          </button>
        </div>
      </div>

      {/* Main Dialogue Panel */}
      <div
        id="dialogue-box-main"
        onClick={handleClickBox}
        className="relative bg-slate-950/85 backdrop-blur-xl border border-amber-500/25 hover:border-amber-500/45 rounded-2xl p-5 sm:p-6 shadow-2xl transition-all cursor-pointer min-h-[120px] sm:min-h-[140px] flex flex-col justify-between"
      >
        {/* Subtle glowing corner embellishments */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-amber-400/40 rounded-tl" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-amber-400/40 rounded-tr" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-amber-400/40 rounded-bl" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-amber-400/40 rounded-br" />

        {/* Narrative / Dialogue Text */}
        <p
          id="dialogue-content-text"
          className="text-amber-50/95 text-base sm:text-lg md:text-xl font-serif leading-relaxed tracking-wide selection:bg-amber-600 selection:text-white"
        >
          {displayedText}
          {isTyping && <span className="inline-block w-1.5 h-4 bg-amber-400 ml-1 animate-pulse" />}
        </p>

        {/* Next / Advance Indicator with Waiting for Interaction breathing icon */}
        {!isTyping && canAdvance && (
          <div className="flex justify-end items-center mt-2 text-amber-400/90 text-xs font-serif italic gap-2.5 select-none">
            {/* Waiting for interaction indicator icon with breathing opacity */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.35)] animate-waiting-breath">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              <span className="text-[10.5px] font-medium tracking-wide text-amber-200">
                {language === 'en' ? 'Click to continue' : 'Cliquez pour continuer'}
              </span>
            </div>
            <div className="p-1 rounded-full bg-amber-500/20 text-amber-300 animate-bounce flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
