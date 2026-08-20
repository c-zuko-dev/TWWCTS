import React, { useState } from 'react';
import { Sparkles, BookOpen, X, Heart, Sprout, Flame, Sun, Volume2, Star, CheckCircle, Lock, ChevronLeft, ChevronRight, Award, Music } from 'lucide-react';
import { LightItem, Language, SoundEffectType } from '../types';
import { ALL_COLLECTIBLE_LIGHTS } from '../data/storyData';
import { audioSynth } from '../utils/audioSynthesizer';

interface MemoriesGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  collectedLights: LightItem[];
  playCount: number;
  onUnlockAllForDev?: () => void;
}

interface MemoryEntry {
  id: string;
  lightKey: string;
  character: string;
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
    photoTitle: {
      en: 'The Whispering Forest & Tender Sprout',
      fr: 'La Forêt Chuchotante & le Tendre Bourgeon',
    },
    journalExcerpt: {
      en: '"Beneath the ancient moss, little Orik shared a tiny seed glowing with pure gratitude. When kindness touches frozen earth, wildflowers bloom without fear."',
      fr: '"Sous la mousse ancienne, le petit Orik a partagé une graine étincelante de pure gratitude. Quand la bonté effleure la terre gelée, les fleurs sauvages s’épanouissent sans crainte."',
    },
    tapeColor: 'bg-emerald-600/60',
    accentColor: '#10b981',
    sfx: 'orik_chirp',
    sfxLabel: { en: 'Forest Chirp & Bloom', fr: 'Chirp des Bois & Floraison' },
  },
  {
    id: 'vivienne_memory',
    lightKey: 'vivienne_light',
    character: 'Vivienne the Glassmaker',
    photoTitle: {
      en: 'The Crossroads Kiln & Amber Hearth',
      fr: 'Le Four du Carrefour & l’Âtre Ambré',
    },
    journalExcerpt: {
      en: '"Vivienne’s hands, weathered from flame and molten glass, sculpted a crystal that holds the soothing warmth of home. Inspiration never truly dies—it only sleeps."',
      fr: '"Les mains de Vivienne, façonnées par les flammes et le verre fondu, ont sculpté un cristal retenant la douce tiédeur du foyer. L’inspiration ne meurt jamais—elle s’endort simplement."',
    },
    tapeColor: 'bg-amber-600/60',
    accentColor: '#f59e0b',
    sfx: 'vivienne_laugh',
    sfxLabel: { en: 'Artisan Hearth Laugh', fr: 'Rire de l’Âtre Artisan' },
  },
  {
    id: 'lezar_memory',
    lightKey: 'lezar_light',
    character: 'Lezar the Loyal Familiar',
    photoTitle: {
      en: 'Velvet Paws by the Starlit Hearth',
      fr: 'Pattes de Velours au Coin du Feu',
    },
    journalExcerpt: {
      en: '"Quiet, fluffy, and watchful, Lezar curled close through every storm and shadow. A faithful companion needs no magic words; a soft meow speaks a thousand spells."',
      fr: '"Calme, duveteux et attentif, Lezar est resté lové à nos côtés à travers chaque tempête et chaque ombre. Un compagnon fidèle n’a pas besoin de formules ; un doux miaulement vaut mille sortilèges."',
    },
    tapeColor: 'bg-sky-600/60',
    accentColor: '#0284c7',
    sfx: 'lezar_meow',
    sfxLabel: { en: 'Fluffy Familiar Meow', fr: 'Miaulement du Familier' },
  },
  {
    id: 'bottle_memory',
    lightKey: 'the_bottle',
    character: 'A Gentle Messenger',
    photoTitle: {
      en: 'The Crystal Message on the Windy Trail',
      fr: 'Le Message de Cristal sur le Sentier du Vent',
    },
    journalExcerpt: {
      en: '"Found nestled in frozen snow, the shimmering bottle held words of encouragement from a friend traveling far ahead. You are never truly alone on the mountain road."',
      fr: '"Trouvée dans la neige immaculée, la fiole scintillante portait des mots de réconfort d’un ami marchant au loin. Nul n’est jamais vraiment seul sur la route des cimes."',
    },
    tapeColor: 'bg-indigo-600/60',
    accentColor: '#38bdf8',
    sfx: 'bottle_tink',
    sfxLabel: { en: 'Crystal Bottle Tink', fr: 'Tintement de Cristal' },
  },
  {
    id: 'clown_memory',
    lightKey: 'clown_spark',
    character: 'Mélo Clown (The Gentle Gentleman)',
    photoTitle: {
      en: 'The Star Rekindled in the Velvet Chasm',
      fr: 'L’Étoile Ravivée dans le Gouffre de Velours',
    },
    journalExcerpt: {
      en: '"Even deep inside the lonely abyss, the gentle gentleman guarded a golden fragment of his true soul. One warm smile was enough to melt a thousand years of solitude."',
      fr: '"Même au cœur du gouffre solitaire, le doux gentleman veillait sur un éclat doré de son âme véritable. Un seul sourire chaleureux a suffi pour dissoudre mille ans de solitude."',
    },
    tapeColor: 'bg-purple-600/60',
    accentColor: '#fbbf24',
    sfx: 'clown_musical',
    sfxLabel: { en: 'Whimsical Music Box', fr: 'Boîte à Musique Féerique' },
  },
  {
    id: 'sww_pin_memory',
    lightKey: 'sww_pin',
    character: 'Friends of the Golden Feast',
    photoTitle: {
      en: 'Golden "SWW" Brooch of Super Witch Wendy',
      fr: 'Broche Dorée "SWW" de Super Sorcière Wendy',
    },
    journalExcerpt: {
      en: '"Bestowed during the joyful birthday feast by Mélo Clown and all companions. A shimmering token reminding Wendy that kindness is the greatest sorcery of all."',
      fr: '"Offerte durant le joyeux festin d’anniversaire par le Clown Mélo et tous les compagnons. Un souvenir étincelant rappelant à Wendy que la bonté est la plus grande des magies."',
    },
    tapeColor: 'bg-pink-600/60',
    accentColor: '#ec4899',
    sfx: 'celebration_chimes',
    sfxLabel: { en: 'Celebration Chimes', fr: 'Carillons de Célébration' },
  },
];

export const MemoriesGalleryModal: React.FC<MemoriesGalleryModalProps> = ({
  isOpen,
  onClose,
  language,
  collectedLights,
  playCount,
  onUnlockAllForDev,
}) => {
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [activeSparkle, setActiveSparkle] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      audioSynth.playSoundEffect('memory_chime');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isUnlocked = playCount >= 7;
  const currentMemory = MEMORY_ENTRIES[selectedPageIndex];
  const lightItem = ALL_COLLECTIBLE_LIGHTS[currentMemory.lightKey];
  const isItemCollected = collectedLights.some((item) => item.id === currentMemory.lightKey) || isUnlocked;

  const handlePlaySound = (sfx: SoundEffectType, memoryId: string) => {
    audioSynth.playSoundEffect(sfx);
    setActiveSparkle(memoryId);
    setTimeout(() => setActiveSparkle(null), 1200);
  };

  const handlePrevPage = () => {
    audioSynth.playSoundEffect('page_turn');
    setSelectedPageIndex((prev) => (prev > 0 ? prev - 1 : MEMORY_ENTRIES.length - 1));
  };

  const handleNextPage = () => {
    audioSynth.playSoundEffect('page_turn');
    setSelectedPageIndex((prev) => (prev < MEMORY_ENTRIES.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      id="memories-scrapbook-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-gradient-to-b from-amber-50 via-orange-50/95 to-amber-100/90 text-stone-800 rounded-2xl border-4 border-amber-800/60 shadow-[0_0_50px_rgba(251,191,36,0.3)] flex flex-col overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrapbook Vintage Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-900 via-amber-950 to-stone-900 text-amber-100 border-b-2 border-amber-600/50 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-amber-100 tracking-wide flex items-center gap-2">
                {language === 'en' ? 'Memories of Starlight • Scrapbook' : 'Album des Souvenirs de Starlight'}
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </h2>
              <p className="text-xs font-serif text-amber-300/80">
                {language === 'en'
                  ? `Chronicle of Warmth • Unlocked after 7 Journeys (Journeys completed: ${playCount}/7)`
                  : `Chronique de Chaleur • Débloqué après 7 Voyages (Voyages accomplis : ${playCount}/7)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isUnlocked && (
              <button
                onClick={() => {
                  audioSynth.playSoundEffect('magic_sparkle');
                  if (onUnlockAllForDev) onUnlockAllForDev();
                }}
                className="px-3 py-1 text-xs rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 hover:bg-amber-400/30 transition-all font-serif flex items-center gap-1.5"
                title={language === 'en' ? 'Preview the scrapbook now' : 'Débloquer l’aperçu maintenant'}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {language === 'en' ? 'Preview Scrapbook' : 'Aperçu Album'}
              </button>
            )}

            <button
              onClick={() => {
                audioSynth.playSoundEffect('click');
                onClose();
              }}
              className="p-2 rounded-full hover:bg-white/10 text-amber-200/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Lock Overlay if player has < 7 playthroughs and hasn't unlocked preview */}
        {!isUnlocked && playCount < 7 && (
          <div className="p-6 bg-amber-900/10 border-b border-amber-600/30 flex items-center justify-between text-xs font-serif text-amber-900">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>
                {language === 'en'
                  ? `Complete 7 full playthroughs to weave all starlight into the permanent Chronicle (${playCount}/7 done).`
                  : `Complétez 7 aventures complètes pour tisser toutes les étoiles dans la Chronique (${playCount}/7 accomplis).`}
              </span>
            </div>
            <span className="font-semibold text-amber-800">
              {language === 'en' ? `${7 - playCount} more to go!` : `Plus que ${7 - playCount} !`}
            </span>
          </div>
        )}

        {/* Scrapbook Main Interactive Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col items-center justify-center relative">
          {/* Subtle Vintage Scrapbook Page Styling */}
          <div className="w-full max-w-3xl bg-[#fdfbf7] rounded-xl border-2 border-[#d6c7b2] shadow-2xl p-6 md:p-8 relative overflow-hidden">
            {/* Washi Tape Header Decoration */}
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-7 ${currentMemory.tapeColor} backdrop-blur-sm -rotate-1 shadow-sm border-x border-white/40`} />

            {/* Page Header / Memory Title */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-stone-200 mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md relative"
                  style={{
                    backgroundColor: `${currentMemory.accentColor}25`,
                    borderColor: currentMemory.accentColor,
                    borderWidth: 2,
                  }}
                >
                  <Sparkles className="w-6 h-6" style={{ color: currentMemory.accentColor }} />
                  {activeSparkle === currentMemory.id && (
                    <div className="absolute inset-0 rounded-2xl animate-ping border-2 border-amber-400" />
                  )}
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-widest font-serif font-bold text-stone-500">
                    {language === 'en' ? `Memory #${selectedPageIndex + 1} of ${MEMORY_ENTRIES.length}` : `Souvenir #${selectedPageIndex + 1} sur ${MEMORY_ENTRIES.length}`}
                  </span>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
                    {currentMemory.photoTitle[language]}
                  </h3>
                </div>
              </div>

              {/* Audio Play Button */}
              <button
                onClick={() => handlePlaySound(currentMemory.sfx, currentMemory.id)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-amber-200 hover:bg-amber-950 border border-amber-400/40 shadow hover:shadow-lg transition-all font-serif text-xs font-semibold flex items-center gap-2 active:scale-95"
              >
                <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>{currentMemory.sfxLabel[language]}</span>
              </button>
            </div>

            {/* Memory Scrapbook Body (Polaroid Card & Story Notes) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Polaroid-style Scrapbook Photo Card */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[240px] bg-white p-3.5 pb-5 rounded-lg shadow-xl border border-stone-200 -rotate-2 hover:rotate-0 transition-transform duration-300 group">
                  {/* Photo Visual Scene Frame */}
                  <div
                    className="w-full h-44 rounded-md flex flex-col items-center justify-center relative overflow-hidden shadow-inner cursor-pointer"
                    style={{
                      background: `radial-gradient(circle, ${currentMemory.accentColor}35 0%, #1e1b4b 100%)`,
                    }}
                    onClick={() => handlePlaySound(currentMemory.sfx, currentMemory.id)}
                  >
                    {/* Glowing Core Visual Icon */}
                    <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl relative animate-pulse">
                      <div
                        className="absolute inset-0 rounded-full blur-md opacity-60"
                        style={{ backgroundColor: currentMemory.accentColor }}
                      />
                      <Sparkles className="w-10 h-10 text-white relative z-10" />
                    </div>

                    <span className="mt-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-serif text-amber-200 border border-amber-300/40">
                      {currentMemory.character}
                    </span>
                  </div>

                  {/* Handwritten Polaroid Caption */}
                  <div className="mt-3 text-center">
                    <p className="font-serif italic font-semibold text-stone-700 text-sm">
                      {lightItem?.name[language] || currentMemory.photoTitle[language]}
                    </p>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {language === 'en' ? '★ Collected & Treasured ★' : '★ Collecté & Chéri ★'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Journal Text & Excerpt */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/60 shadow-sm relative">
                  <span className="text-3xl font-serif text-amber-300 absolute -top-3 left-2">“</span>
                  <p className="font-serif text-stone-700 leading-relaxed italic text-sm md:text-base pt-2">
                    {currentMemory.journalExcerpt[language]}
                  </p>
                  <span className="text-3xl font-serif text-amber-300 absolute -bottom-6 right-3">”</span>
                </div>

                {/* Light Item Details Card */}
                {lightItem && (
                  <div className="p-3.5 rounded-xl bg-stone-100/90 border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400">
                        {language === 'en' ? 'Giver of Light' : 'Offert par'}
                      </span>
                      <p className="font-serif font-bold text-stone-800 text-sm">{lightItem.giver[language]}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-serif font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'en' ? 'Preserved' : 'Préservé'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scrapbook Thumbnails Selector Bar */}
            <div className="mt-8 pt-4 border-t border-stone-200 flex items-center justify-between gap-2">
              <button
                onClick={handlePrevPage}
                className="p-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 transition-colors flex items-center gap-1 font-serif text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'en' ? 'Previous' : 'Précédent'}</span>
              </button>

              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {MEMORY_ENTRIES.map((entry, idx) => {
                  const isSelected = idx === selectedPageIndex;
                  return (
                    <button
                      key={entry.id}
                      onClick={() => {
                        audioSynth.playSoundEffect('page_turn');
                        setSelectedPageIndex(idx);
                      }}
                      className={`w-8 h-8 rounded-lg font-serif text-xs font-bold transition-all flex items-center justify-center ${
                        isSelected
                          ? 'bg-amber-700 text-white shadow-md scale-110 ring-2 ring-amber-400'
                          : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextPage}
                className="p-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 transition-colors flex items-center gap-1 font-serif text-xs"
              >
                <span className="hidden sm:inline">{language === 'en' ? 'Next' : 'Suivant'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrapbook Footer */}
        <div className="px-6 py-3 bg-amber-950/90 text-amber-300/80 text-xs font-serif flex items-center justify-between border-t border-amber-800/40">
          <span className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            {language === 'en'
              ? 'Witch of the Sun & Twilight Companions • Interactive Scrapbook'
              : 'Sorcière du Soleil & Compagnons du Crépuscule • Album Interactif'}
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 transition-colors"
          >
            {language === 'en' ? 'Close Album' : 'Fermer l’Album'}
          </button>
        </div>
      </div>
    </div>
  );
};
