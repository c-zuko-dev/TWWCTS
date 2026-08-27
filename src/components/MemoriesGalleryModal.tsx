import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  X,
  Heart,
  Volume2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Award,
  Music,
  Compass,
  Scroll,
  Sun,
  Flame,
  Sprout,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { LightItem, Language, SoundEffectType, CharacterId, CharacterExpression } from '../types';
import { ALL_COLLECTIBLE_LIGHTS } from '../data/storyData';
import { audioSynth } from '../utils/audioSynthesizer';
import { CharacterPortrait } from './CharacterPortrait';

interface MemoryVisualConfig {
  scale: number;
  offsetY: number;
  origin: string;
  renderType: 'character' | 'bottle';
  characterId?: CharacterId;
  expression?: CharacterExpression;
  showSwwPin?: boolean;
}

const MEMORY_VISUAL_CONFIG: Record<string, MemoryVisualConfig> = {
  orik_memory: {
    scale: 0.86,
    offsetY: 0,
    origin: 'bottom center',
    renderType: 'character',
    characterId: 'orik',
    expression: 'grateful',
  },
  vivienne_memory: {
    scale: 0.72,
    offsetY: 4,
    origin: 'bottom center',
    renderType: 'character',
    characterId: 'artisan',
    expression: 'inspired',
  },
  lezar_memory: {
    scale: 0.82,
    offsetY: 0,
    origin: 'bottom center',
    renderType: 'character',
    characterId: 'lezar',
    expression: 'comforting',
  },
  bottle_memory: {
    scale: 0.96,
    offsetY: 0,
    origin: 'center center',
    renderType: 'bottle',
  },
  hypo_memory: {
    scale: 0.92,
    offsetY: 0,
    origin: 'bottom center',
    renderType: 'character',
    characterId: 'hypo',
    expression: 'cuddling_pillow',
  },
  clown_memory: {
    scale: 0.52,
    offsetY: 8,
    origin: 'bottom center',
    renderType: 'character',
    characterId: 'clown',
    expression: 'waving',
  },
  sww_pin_memory: {
    scale: 0.62,
    offsetY: 6,
    origin: 'bottom center',
    renderType: 'character',
    characterId: 'human_witch',
    expression: 'happy',
    showSwwPin: true,
  },
};

interface MemoriesGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  collectedLights: LightItem[];
  playCount: number;
  onUnlockAllForDev?: () => void;
  initialPageIndex?: number;
}

interface MemoryEntry {
  id: string;
  lightKey: string;
  character: string;
  characterShort: { en: string; fr: string };
  badgeIcon: string;
  photoTitle: { en: string; fr: string };
  journalExcerpt: { en: string; fr: string };
  tapeColor: string;
  accentColor: string;
  sfx: SoundEffectType;
  sfxLabel: { en: string; fr: string };
}

const MEMORY_ENTRIES: MemoryEntry[] = [
  {
    id: 'orik_memory',
    lightKey: 'orik_light',
    character: 'Orik the Forest Sprite',
    characterShort: { en: 'Orik', fr: 'Orik' },
    badgeIcon: '🌿',
    photoTitle: {
      en: 'The Whispering Forest & Tender Sprout',
      fr: 'La Forêt Chuchotante & le Tendre Bourgeon',
    },
    journalExcerpt: {
      en: 'Beneath the ancient moss, little Orik shared a tiny seed glowing with pure gratitude. When kindness touches frozen earth, wildflowers bloom without fear.',
      fr: 'Sous la mousse ancienne, le petit Orik a partagé une graine étincelante de pure gratitude. Quand la bonté effleure la terre gelée, les fleurs sauvages s’épanouissent sans crainte.',
    },
    tapeColor: 'bg-emerald-700/70 border-emerald-400/40',
    accentColor: '#10b981',
    sfx: 'orik_chirp',
    sfxLabel: { en: 'Forest Melody', fr: 'Mélodie des Bois' },
  },
  {
    id: 'vivienne_memory',
    lightKey: 'vivienne_light',
    character: 'Vivienne the Glassmaker',
    characterShort: { en: 'Vivienne', fr: 'Vivienne' },
    badgeIcon: '🔥',
    photoTitle: {
      en: 'The Crossroads Kiln & Amber Hearth',
      fr: 'Le Four du Carrefour & l’Âtre Ambré',
    },
    journalExcerpt: {
      en: 'Vivienne’s hands, weathered from flame and molten glass, sculpted a crystal that holds the soothing warmth of home. Inspiration never truly dies—it only sleeps.',
      fr: 'Les mains de Vivienne, façonnées par les flammes et le verre fondu, ont sculpté un cristal retenant la douce tiédeur du foyer. L’inspiration ne meurt jamais—elle s’endort simplement.',
    },
    tapeColor: 'bg-amber-700/70 border-amber-400/40',
    accentColor: '#f59e0b',
    sfx: 'vivienne_laugh',
    sfxLabel: { en: 'Hearth Laughter', fr: 'Rire de l’Âtre' },
  },
  {
    id: 'lezar_memory',
    lightKey: 'lezar_light',
    character: 'Lezar the Loyal Familiar',
    characterShort: { en: 'Lezar', fr: 'Lezar' },
    badgeIcon: '🐾',
    photoTitle: {
      en: 'Velvet Paws by the Starlit Hearth',
      fr: 'Pattes de Velours au Coin du Feu',
    },
    journalExcerpt: {
      en: 'Quiet, fluffy, and watchful, Lezar curled close through every storm and shadow. A faithful companion needs no magic words; a soft meow speaks a thousand spells.',
      fr: 'Calme, duveteux et attentif, Lezar est resté lové à nos côtés à travers chaque tempête et chaque ombre. Un compagnon fidèle n’a pas besoin de formules ; un doux miaulement vaut mille sortilèges.',
    },
    tapeColor: 'bg-sky-700/70 border-sky-400/40',
    accentColor: '#0284c7',
    sfx: 'lezar_meow',
    sfxLabel: { en: 'Gentle Purr & Meow', fr: 'Doux Miaulement' },
  },
  {
    id: 'bottle_memory',
    lightKey: 'the_bottle',
    character: 'A Gentle Messenger',
    characterShort: { en: 'Crystal Bottle', fr: 'Fiole de Cristal' },
    badgeIcon: '🍾',
    photoTitle: {
      en: 'The Crystal Message on the Windy Trail',
      fr: 'Le Message de Cristal sur le Sentier du Vent',
    },
    journalExcerpt: {
      en: 'Found nestled in frozen snow, the shimmering bottle held words of encouragement from a friend traveling far ahead. You are never truly alone on the mountain road.',
      fr: 'Trouvée dans la neige immaculée, la fiole scintillante portait des mots de réconfort d’un ami marchant au loin. Nul n’est jamais vraiment seul sur la route des cimes.',
    },
    tapeColor: 'bg-cyan-700/70 border-cyan-400/40',
    accentColor: '#38bdf8',
    sfx: 'bottle_tink',
    sfxLabel: { en: 'Crystal Chime', fr: 'Carillon de Verre' },
  },
  {
    id: 'hypo_memory',
    lightKey: 'hypo_pillow',
    character: 'Hypo the Hippo Plushie',
    characterShort: { en: 'Hypo', fr: 'Hypo' },
    badgeIcon: '🦛',
    photoTitle: {
      en: 'The Celestial Neck Pillow of Rest',
      fr: 'Le Coussin de Repos Céleste',
    },
    journalExcerpt: {
      en: 'A soft, fluffy neck pillow offered with endless cuddles. Hypo gently whispers that taking time to rest, breathe, and dream is just as sacred as casting spells.',
      fr: 'Un coussin de repos tout doux offert avec de tendres câlins. Hypo murmure gentiment que prendre le temps de se reposer et de rêver est aussi sacré que de lancer des sorts.',
    },
    tapeColor: 'bg-pink-700/70 border-pink-400/40',
    accentColor: '#f472b6',
    sfx: 'pillow_squeak',
    sfxLabel: { en: 'Pillow Squeak', fr: 'Pouet Douillet' },
  },
  {
    id: 'clown_memory',
    lightKey: 'clown_spark',
    character: 'Mélo Clown (The Gentle Gentleman)',
    characterShort: { en: 'Mélo Clown', fr: 'Clown Mélo' },
    badgeIcon: '🎩',
    photoTitle: {
      en: 'The Star Rekindled in the Velvet Chasm',
      fr: 'L’Étoile Ravivée dans le Gouffre de Velours',
    },
    journalExcerpt: {
      en: 'Even deep inside the lonely abyss, the gentle gentleman guarded a golden fragment of his true soul. One warm smile was enough to melt a thousand years of solitude.',
      fr: 'Même au cœur du gouffre solitaire, le doux gentleman veillait sur un éclat doré de son âme véritable. Un seul sourire chaleureux a suffi pour dissoudre mille ans de solitude.',
    },
    tapeColor: 'bg-purple-700/70 border-purple-400/40',
    accentColor: '#eab308',
    sfx: 'clown_musical',
    sfxLabel: { en: 'Music Box Melody', fr: 'Boîte à Musique' },
  },
  {
    id: 'sww_pin_memory',
    lightKey: 'sww_pin',
    character: 'Friends of the Golden Feast',
    characterShort: { en: 'Witch Wendy', fr: 'Wendy' },
    badgeIcon: '🌸',
    photoTitle: {
      en: 'Golden "SWW" Brooch of Super Witch Wendy',
      fr: 'Broche Dorée « SWW » de Wendy',
    },
    journalExcerpt: {
      en: 'Bestowed during the joyful birthday feast by Mélo Clown and all companions. A shimmering token reminding Wendy that kindness is the greatest sorcery of all.',
      fr: 'Offerte par le Clown Mélo et tous ses compagnons lors du joyeux festin d’anniversaire. Un souvenir étincelant rappelant à Wendy que la bonté est la plus grande des magies.',
    },
    tapeColor: 'bg-rose-700/70 border-rose-400/40',
    accentColor: '#ec4899',
    sfx: 'celebration_chimes',
    sfxLabel: { en: 'Feast Celebration', fr: 'Carillons de Fête' },
  },
];

export const MemoriesGalleryModal: React.FC<MemoriesGalleryModalProps> = ({
  isOpen,
  onClose,
  language,
  collectedLights,
  playCount,
  onUnlockAllForDev,
  initialPageIndex = 0,
}) => {
  const [selectedPageIndex, setSelectedPageIndex] = useState(initialPageIndex);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  React.useEffect(() => {
    if (isOpen) {
      if (initialPageIndex >= 0 && initialPageIndex < MEMORY_ENTRIES.length) {
        setSelectedPageIndex(initialPageIndex);
      }
      audioSynth.playSoundEffect('memory_chime');
    }
  }, [isOpen, initialPageIndex]);

  if (!isOpen) return null;

  const isUnlocked = true;
  const currentMemory = MEMORY_ENTRIES[selectedPageIndex];
  const lightItem = ALL_COLLECTIBLE_LIGHTS[currentMemory.lightKey];
  const visualConfig = MEMORY_VISUAL_CONFIG[currentMemory.id] || {
    scale: 0.82,
    offsetY: 0,
    origin: 'bottom center',
    renderType: 'character' as const,
    characterId: 'orik' as CharacterId,
    expression: 'grateful' as CharacterExpression,
  };

  const handlePlaySound = (sfx: SoundEffectType) => {
    audioSynth.playSoundEffect(sfx);
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 1400);
  };

  const handlePrevPage = () => {
    audioSynth.playSoundEffect('page_turn');
    setSelectedPageIndex((prev) => (prev > 0 ? prev - 1 : MEMORY_ENTRIES.length - 1));
  };

  const handleNextPage = () => {
    audioSynth.playSoundEffect('page_turn');
    setSelectedPageIndex((prev) => (prev < MEMORY_ENTRIES.length - 1 ? prev + 1 : 0));
  };

  const handlePolaroidClick = () => {
    setClickCount((c) => c + 1);
    handlePlaySound(currentMemory.sfx);
  };

  return (
    <div
      id="memories-scrapbook-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      {/* Antique Storybook Folio Container */}
      <div
        className="relative w-full max-w-5xl max-h-[96vh] bg-[#1a0e07] text-stone-100 rounded-2xl border-2 border-amber-600/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(217,119,6,0.25)] flex flex-col overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ornate Vintage Book Header */}
        <div className="relative flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-r from-[#2a170d] via-[#3b2011] to-[#1e1008] border-b border-amber-500/40 shadow-md shrink-0">
          {/* Subtle Golden Trim Accent */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400/60 text-amber-200 flex items-center justify-center shadow-inner">
              <BookOpen className="w-5 h-5 text-amber-200 drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-amber-100 tracking-wide flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <span>{language === 'en' ? 'Memories Scrapbook' : 'Album des Souvenirs'}</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-medium hidden xs:inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {language === 'en' ? 'Personal Folio' : 'Folio Intime'}
                </span>
              </div>
              <p className="text-[11px] font-serif text-amber-300/80">
                {language === 'en'
                  ? 'Personal Relics & Treasures of Companionship'
                  : 'Reliques Personnelles & Trésors d’Amitié'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-memories-close"
              onClick={() => {
                audioSynth.playSoundEffect('click');
                onClose();
              }}
              className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/15 text-amber-200 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Folio Body: Parchment Page + Curated Filmstrip */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-[#23170e] via-[#2c1d12] to-[#170e06]">
          {/* Aged Parchment Inner Page */}
          <div className="w-full bg-[#fdf9f0] text-stone-800 rounded-2xl border border-amber-300/80 shadow-2xl p-4 sm:p-6 md:p-7 relative flex flex-col justify-between">
            {/* Top Washi Tape Deco */}
            <div
              className={`absolute -top-3 left-1/2 -translate-x-1/2 w-36 sm:w-44 h-6 ${currentMemory.tapeColor} rounded-sm shadow-md border backdrop-blur-sm -rotate-1 pointer-events-none z-30 flex items-center justify-center`}
            >
              <span className="text-[10px] sm:text-[11px] text-white/95 font-mono tracking-widest uppercase font-bold drop-shadow-sm">
                ★ {currentMemory.characterShort[language]} ★
              </span>
            </div>

            {/* Page Header Strip */}
            <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-amber-900/15 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 border"
                  style={{
                    backgroundColor: `${currentMemory.accentColor}18`,
                    borderColor: `${currentMemory.accentColor}60`,
                  }}
                >
                  <span className="text-lg">{currentMemory.badgeIcon}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-serif font-bold text-amber-800/90">
                      {language === 'en'
                        ? `Memory ${selectedPageIndex + 1} of ${MEMORY_ENTRIES.length}`
                        : `Souvenir ${selectedPageIndex + 1} sur ${MEMORY_ENTRIES.length}`}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    <span className="text-[11px] font-serif text-stone-500 italic hidden xs:inline">
                      {currentMemory.character}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-serif font-bold text-stone-900 leading-snug truncate">
                    {currentMemory.photoTitle[language]}
                  </h3>
                </div>
              </div>

              {/* Audio Melodic Key Button */}
              <button
                onClick={() => handlePlaySound(currentMemory.sfx)}
                className="px-3 sm:px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-200 border border-amber-400/40 shadow-sm transition-all font-serif text-xs font-semibold flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
                title={language === 'en' ? 'Play character soundscape' : 'Écouter l’ambiance sonore'}
              >
                <Volume2 className={`w-4 h-4 text-amber-300 ${isPlayingAudio ? 'animate-bounce text-amber-400' : ''}`} />
                <span className="hidden sm:inline">{currentMemory.sfxLabel[language]}</span>
              </button>
            </div>

            {/* Main Scrapbook Body: Polaroid & Journal Notes */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7 items-center">
              {/* Polaroid Snapshot Section */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div
                  className="w-full max-w-[260px] sm:max-w-[285px] md:max-w-[305px] bg-[#fdfdfa] text-stone-900 rounded-xl p-3 sm:p-3.5 md:p-4 pb-3.5 sm:pb-4 md:pb-5 scrapbook-polaroid-frame border border-stone-300/80 flex flex-col justify-between -rotate-1 hover:rotate-0 hover:-translate-y-1 transition-all duration-300 select-none group relative mx-auto cursor-pointer"
                  onClick={handlePolaroidClick}
                >
                  {/* Authentic Photo Mounting Corners */}
                  <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-amber-800/50 pointer-events-none rounded-tl-xs z-20" />
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-amber-800/50 pointer-events-none rounded-tr-xs z-20" />

                  {/* Atmospheric Centered Photo Viewport */}
                  <div
                    className="w-full h-[220px] sm:h-[245px] md:h-[265px] rounded-lg scrapbook-photo-aperture flex flex-col items-center justify-end relative overflow-hidden border border-stone-800/50 cursor-pointer group-hover:border-amber-400/70 transition-colors"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${currentMemory.accentColor}35 0%, ${currentMemory.accentColor}12 60%, #090e1a 100%)`,
                    }}
                  >
                    {/* Diagonal Film Reflection Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent pointer-events-none z-20" />

                    {/* Character Viewport with Visual Scaling and Animation Reaction */}
                    <div
                      key={`${currentMemory.id}_${clickCount}`}
                      className={`w-full h-full flex items-end justify-center relative z-10 pt-2 pb-1 overflow-visible ${
                        clickCount > 0 ? 'animate-character-bounce' : ''
                      }`}
                      style={{
                        transform: `scale(${visualConfig.scale}) translateY(${visualConfig.offsetY}px)`,
                        transformOrigin: visualConfig.origin,
                      }}
                    >
                      {visualConfig.renderType === 'character' && visualConfig.characterId && (
                        <div className="w-full flex justify-center items-end">
                          <CharacterPortrait
                            characterId={visualConfig.characterId}
                            expression={visualConfig.expression}
                            showSwwPin={visualConfig.showSwwPin}
                            isSpeaking={false}
                          />
                        </div>
                      )}

                      {visualConfig.renderType === 'bottle' && (
                        <div className="w-32 h-44 sm:w-36 sm:h-48 flex items-center justify-center">
                          <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-[0_0_20px_rgba(56,189,248,0.8)]">
                            <ellipse cx="100" cy="200" rx="55" ry="14" fill="#0284c7" opacity="0.3" className="animate-pulse" />
                            <path d="M70 90 C70 60, 85 55, 85 35 L115 35 C115 55, 130 60, 130 90 L130 180 C130 200, 70 200, 70 180 Z" fill="#38bdf8" fillOpacity="0.28" stroke="#7dd3fc" strokeWidth="2.5" />
                            <rect x="88" y="22" width="24" height="14" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1" />
                            <rect x="85" y="110" width="30" height="50" rx="4" fill="#fef08a" transform="rotate(-10 100 135)" stroke="#fbbf24" strokeWidth="1.5" />
                            <line x1="90" y1="122" x2="110" y2="122" stroke="#d97706" strokeWidth="1.5" transform="rotate(-10 100 135)" />
                            <line x1="90" y1="132" x2="110" y2="132" stroke="#d97706" strokeWidth="1.5" transform="rotate(-10 100 135)" />
                            <line x1="90" y1="142" x2="105" y2="142" stroke="#d97706" strokeWidth="1.5" transform="rotate(-10 100 135)" />
                            <circle cx="100" cy="130" r="2.5" fill="#ffffff" className="animate-ping" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Translucent Character Badge & Interactive Tap Prompt */}
                    <div className="absolute bottom-2 inset-x-2.5 flex items-center justify-between px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-serif text-amber-200 border border-amber-300/30 z-20 shadow-md">
                      <span className="truncate font-semibold">{currentMemory.character}</span>
                      <span className="text-[10px] text-amber-300 font-mono flex items-center gap-1 shrink-0 font-bold">
                        <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                        {language === 'en' ? 'Interact' : 'Interagir'}
                      </span>
                    </div>
                  </div>

                  {/* Handwritten Polaroid Footer */}
                  <div className="pt-2.5 text-center flex flex-col justify-center shrink-0">
                    <p className="font-serif italic font-bold text-stone-800 text-sm sm:text-base leading-tight truncate">
                      {lightItem?.name[language] || currentMemory.photoTitle[language]}
                    </p>
                    <span className="text-[10px] sm:text-[11px] text-amber-900 font-mono font-bold tracking-wide block pt-0.5">
                      ★ {language === 'en' ? 'Relic of Gratitude' : 'Relique de Gratitude'} ★
                    </span>
                  </div>
                </div>
              </div>

              {/* Journal Passage & Relic Archive Note */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                {/* Storybook Illuminated Journal Note */}
                <div className="p-4 sm:p-5 md:p-6 rounded-2xl bg-gradient-to-br from-amber-50/90 to-orange-50/70 border border-amber-200/90 shadow-sm relative">
                  <span className="text-4xl sm:text-5xl font-serif font-black text-amber-400/70 absolute -top-3.5 left-2.5 select-none leading-none">
                    “
                  </span>
                  <p className="font-serif text-stone-700 leading-relaxed italic text-sm sm:text-base md:text-[15px] pt-2 pl-4">
                    {currentMemory.journalExcerpt[language]}
                  </p>
                  <span className="text-4xl sm:text-5xl font-serif font-black text-amber-400/70 absolute -bottom-6 right-3 select-none leading-none">
                    ”
                  </span>
                </div>

                {/* Relic Registry Card */}
                {lightItem && (
                  <div className="p-3.5 sm:p-4 rounded-xl bg-stone-50/90 border border-stone-200/80 flex items-center justify-between text-xs shadow-sm">
                    <div className="min-w-0 pr-3">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider font-mono">
                        {language === 'en' ? 'Keeper of Starlight' : 'Gardien de la Lueur'}
                      </span>
                      <p className="font-serif font-bold text-stone-800 text-sm sm:text-base truncate pt-0.5">
                        {lightItem.giver[language]}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300/80 text-amber-900 font-serif font-bold text-xs shrink-0 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === 'en' ? 'Preserved' : 'Préservé'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LUXURIOUS & ROOMY COLLECTIBLE CHARACTER NAVIGATION FILMSTRIP */}
          <div className="w-full bg-gradient-to-b from-[#211208] via-[#170c05] to-[#100803] p-4 sm:p-5 rounded-2xl border-2 border-amber-500/40 filmstrip-container-glow flex flex-col gap-3.5 relative overflow-hidden">
            {/* Top Sprocket Perforations */}
            <div className="filmstrip-sprockets h-2 w-full opacity-70 pointer-events-none" />

            {/* Navigation Strip Controls Header */}
            <div className="flex items-center justify-between gap-3 px-1 sm:px-2">
              <button
                onClick={handlePrevPage}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-b from-stone-800 via-stone-900 to-black hover:from-stone-700 hover:to-stone-900 text-amber-100 hover:text-white border border-amber-400/50 hover:border-amber-300 shadow-md transition-all flex items-center gap-2 font-serif text-xs sm:text-sm font-bold cursor-pointer active:scale-95 shrink-0"
                title={language === 'en' ? 'Previous Memory Slide' : 'Diapositive Précédente'}
              >
                <ChevronLeft className="w-4 h-4 text-amber-300" />
                <span>{language === 'en' ? 'Previous' : 'Précédent'}</span>
              </button>

              {/* Title & Progress Tracker */}
              <div className="flex flex-col items-center min-w-0 text-center px-2">
                <span className="text-xs sm:text-sm font-serif font-bold text-amber-200 tracking-wider uppercase">
                  ✦ {language === 'en' ? 'Companion Memory Slides' : 'Diapositives des Compagnons'} ✦
                </span>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {MEMORY_ENTRIES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        audioSynth.playSoundEffect('page_turn');
                        setSelectedPageIndex(idx);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === selectedPageIndex
                          ? 'w-6 bg-amber-400 shadow-[0_0_10px_#fbbf24]'
                          : 'w-2 bg-amber-700/50 hover:bg-amber-600'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleNextPage}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-b from-stone-800 via-stone-900 to-black hover:from-stone-700 hover:to-stone-900 text-amber-100 hover:text-white border border-amber-400/50 hover:border-amber-300 shadow-md transition-all flex items-center gap-2 font-serif text-xs sm:text-sm font-bold cursor-pointer active:scale-95 shrink-0"
                title={language === 'en' ? 'Next Memory Slide' : 'Diapositive Suivante'}
              >
                <span>{language === 'en' ? 'Next' : 'Suivant'}</span>
                <ChevronRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>

            {/* Curated Slide Cards Ribbon */}
            <div className="flex items-center justify-start md:justify-center gap-3 sm:gap-4 md:gap-5 overflow-x-auto py-2.5 px-2 max-w-full scrollbar-none">
              {MEMORY_ENTRIES.map((entry, idx) => {
                const isSelected = idx === selectedPageIndex;

                return (
                  <button
                    key={entry.id}
                    onClick={() => {
                      audioSynth.playSoundEffect('page_turn');
                      setSelectedPageIndex(idx);
                    }}
                    className={`relative min-w-[95px] sm:min-w-[115px] md:min-w-[130px] py-3 px-2.5 sm:px-3 rounded-2xl font-serif transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer select-none shrink-0 active:scale-95 group ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-600/45 via-amber-700/35 to-amber-950/95 text-white border-2 border-amber-300 ring-2 ring-amber-400/70 shadow-[0_0_22px_rgba(251,191,36,0.55)] scale-105 -translate-y-1.5'
                        : 'bg-[#26160d]/80 hover:bg-[#3d2315] text-amber-200/80 hover:text-amber-100 border border-amber-600/30 hover:border-amber-400/60 shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Active Illuminated Star Pin */}
                    {isSelected && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 flex items-center gap-1 text-[9px] font-bold font-mono uppercase shadow-[0_0_10px_#fbbf24] z-20">
                        <Star className="w-2.5 h-2.5 fill-amber-950" />
                        <span>Active</span>
                      </div>
                    )}

                    {/* Character Avatar Orb */}
                    <div
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-inner border transition-all duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor: `${entry.accentColor}25`,
                        borderColor: isSelected ? '#fef08a' : `${entry.accentColor}50`,
                      }}
                    >
                      <span>{entry.badgeIcon}</span>
                    </div>

                    {/* Character Label */}
                    <span
                      className={`text-xs sm:text-sm font-bold text-center leading-tight truncate max-w-[85px] sm:max-w-[110px] pt-0.5 ${
                        isSelected ? 'text-amber-100 drop-shadow-sm font-semibold' : 'text-amber-200/80 group-hover:text-amber-100'
                      }`}
                    >
                      {entry.characterShort[language]}
                    </span>

                    {/* Mini Role / Relic Tag */}
                    <span className="text-[9px] sm:text-[10px] text-amber-400/70 group-hover:text-amber-300 font-mono tracking-wide truncate max-w-[85px] sm:max-w-[110px]">
                      {entry.badgeIcon === '🌿' && (language === 'en' ? 'Sprout' : 'Bourgeon')}
                      {entry.badgeIcon === '🔥' && (language === 'en' ? 'Hearth' : 'Âtre')}
                      {entry.badgeIcon === '🐾' && (language === 'en' ? 'Familiar' : 'Familier')}
                      {entry.badgeIcon === '🍾' && (language === 'en' ? 'Message' : 'Message')}
                      {entry.badgeIcon === '🦛' && (language === 'en' ? 'Pillow' : 'Coussin')}
                      {entry.badgeIcon === '🎩' && (language === 'en' ? 'Kindness' : 'Gentillesse')}
                      {entry.badgeIcon === '🌸' && (language === 'en' ? 'SWW Pin' : 'Broche')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Sprocket Perforations */}
            <div className="filmstrip-sprockets h-2 w-full opacity-70 pointer-events-none" />
          </div>
        </div>

        {/* Scrapbook Folio Footer */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#140b04] text-amber-300/80 text-xs font-serif flex items-center justify-between border-t border-amber-600/30 shrink-0">
          <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            {language === 'en'
              ? 'Witch of the Sun & Twilight Companions • Interactive Scrapbook'
              : 'Sorcière du Soleil & Compagnons du Crépuscule • Album Interactif'}
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-serif font-bold transition-colors cursor-pointer border border-amber-400/40"
          >
            {language === 'en' ? 'Close Folio' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};

