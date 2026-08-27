import React, { useState } from 'react';
import { Sun, Sparkles, Heart, Sprout, Flame, RotateCcw, Cake, Gift, Home, X, ChevronRight, BookOpen } from 'lucide-react';
import { LightItem, Language } from '../types';
import { CharacterPortrait } from './CharacterPortrait';
import { audioSynth } from '../utils/audioSynthesizer';

interface EndingGalleryModalProps {
  collectedLights: LightItem[];
  language: Language;
  onRestart: () => void;
  onReturnToTitle?: () => void;
  onOpenMemories?: () => void;
  playCount?: number;
}

type CharacterModalId = 'orik' | 'artisan' | 'lezar' | 'bottle' | 'clown' | 'hypo' | 'wendy_pin' | null;

export const EndingGalleryModal: React.FC<EndingGalleryModalProps> = ({
  collectedLights,
  language,
  onRestart,
  onReturnToTitle,
  onOpenMemories,
  playCount = 1,
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterModalId>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'seed':
      case 'Sprout':
        return <Sprout className="w-5 h-5 text-emerald-400" />;
      case 'fire':
      case 'Flame':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'heart':
      case 'Heart':
        return <Heart className="w-5 h-5 text-sky-400" />;
      case 'sparkles':
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      default:
        return <Sun className="w-5 h-5 text-yellow-400" />;
    }
  };

  const mapLightToCharacter = (lightId: string): CharacterModalId => {
    if (lightId === 'orik_light') return 'orik';
    if (lightId === 'vivienne_light') return 'artisan';
    if (lightId === 'lezar_light') return 'lezar';
    if (lightId === 'the_bottle') return 'bottle';
    if (lightId === 'sww_pin') return 'wendy_pin';
    if (lightId === 'clown_spark') return 'clown';
    return null;
  };

  const handleSelectCharacter = (charId: CharacterModalId) => {
    setSelectedCharacter(charId);
    if (!charId) return;

    switch (charId) {
      case 'orik':
        audioSynth.playSoundEffect('magic_surge');
        break;
      case 'artisan':
        audioSynth.playSoundEffect('ember_glow');
        break;
      case 'lezar':
        audioSynth.playSoundEffect('purr');
        break;
      case 'bottle':
        audioSynth.playSoundEffect('bottle_tink');
        break;
      case 'clown':
        audioSynth.playSoundEffect('clown_jingle');
        break;
      case 'wendy_pin':
        audioSynth.playSoundEffect('magic_sparkle');
        break;
      case 'hypo':
        audioSynth.playSoundEffect('cheer');
        break;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 z-30 animate-fade-in text-center my-auto">
      <div className="bg-slate-950/92 backdrop-blur-2xl border border-amber-500/35 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Decorative Golden Stardust Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />

        {/* Birthday Badge */}
        <button
          onClick={() => handleSelectCharacter('hypo')}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/25 via-pink-500/20 to-orange-500/25 border border-amber-400/40 hover:border-pink-400 text-amber-200 text-xs sm:text-sm font-serif tracking-widest uppercase mb-4 shadow-md hover:scale-105 transition-transform cursor-pointer group"
          title={language === 'en' ? 'Click to meet Hypo!' : 'Cliquez pour voir Hypo !'}
        >
          <Cake className="w-4 h-4 text-pink-400 animate-pulse group-hover:scale-110 transition-transform" />
          <span>{language === 'en' ? 'A Birthday Tale for Wendy • Click to summon Hypo! 🦛✨' : 'Un Conte pour Wendy • Cliquez pour voir Hypo ! 🦛✨'}</span>
          <Gift className="w-4 h-4 text-amber-300" />
        </button>

        {/* Grand Birthday Title */}
        <h1 className="text-3xl sm:text-5xl font-serif text-amber-50 font-bold mb-3 tracking-wide drop-shadow-md">
          {language === 'en' ? 'Happy Birthday, Wendy! ☀️🎂' : 'Joyeux Anniversaire, Wendy ! ☀️🎂'}
        </h1>

        <h2 className="text-lg sm:text-2xl font-serif text-amber-300/90 font-medium mb-4">
          {language === 'en'
            ? '“You were never meant to carry the sun alone.”'
            : '« Tu n’étais pas destinée à porter le soleil toute seule. »'}
        </h2>

        <p className="text-amber-100/80 font-serif max-w-2xl mx-auto text-sm sm:text-base mb-6 leading-relaxed">
          {language === 'en'
            ? 'Thank you for bringing so much genuine warmth, kindness, and light to everyone around you. May your year ahead be full of peace, sweet pastries, laughter, and companionship.'
            : 'Merci d’apporter autant de chaleur sincère, de douceur et de lumière à tous ceux qui t’entourent. Que cette nouvelle année t’apporte sérénité, délices gourmands, rires et tendre compagnie.'}
        </p>

        {/* French Celebration Food Tokens Easter Egg Bar (Clickable to summon Hypo) */}
        <div 
          onClick={() => handleSelectCharacter('hypo')}
          className="flex flex-wrap items-center justify-center gap-3 mb-8 px-4 py-3 rounded-2xl bg-amber-950/40 hover:bg-pink-950/40 border border-amber-500/20 hover:border-pink-400/50 max-w-xl mx-auto text-xs sm:text-sm text-amber-200/90 font-serif cursor-pointer transition-all hover:scale-102 shadow-sm group"
          title="Click the feast to summon Hypo!"
        >
          <span className="text-pink-300 font-semibold group-hover:underline">🎂 {language === 'en' ? 'Birthday Cake' : 'Gâteau'}</span>
          <span className="text-amber-600">•</span>
          <span>🥐 {language === 'en' ? 'Croissants' : 'Croissants'}</span>
          <span className="text-amber-600">•</span>
          <span>🥖 {language === 'en' ? 'Baguette' : 'Baguette'}</span>
          <span className="text-amber-600">•</span>
          <span>🍓 {language === 'en' ? 'Strawberries' : 'Fraises'}</span>
          <span className="text-amber-600">•</span>
          <span>🥞 {language === 'en' ? 'Crêpes' : 'Crêpes'}</span>
          <span className="text-amber-600">•</span>
          <span>🍫 {language === 'en' ? 'Macarons' : 'Macarons'}</span>
        </div>

        {/* Constellation Grid of Returned Lights (CLICKABLE to see characters!) */}
        <div className="flex items-center justify-between text-left mb-3 pl-1">
          <h3 className="text-amber-200/80 font-serif text-xs uppercase tracking-widest font-semibold">
            {language === 'en' ? 'The Lights Returned to You (Click to summon characters ✨)' : 'Les Lumières Réciproques (Cliquez pour voir les personnages ✨)'}
          </h3>
          <span className="text-[11px] text-amber-400/70 font-serif italic">
            {language === 'en' ? 'Interactive Memories' : 'Souvenirs Interactifs'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-8 text-left">
          {collectedLights.map((light) => {
            const name = light.name[language] || light.name.en;
            const desc = light.description[language] || light.description.en;
            const giver = light.giver[language] || light.giver.en;
            const charId = mapLightToCharacter(light.id);

            return (
              <button
                key={light.id}
                onClick={() => handleSelectCharacter(charId)}
                className="bg-slate-900/80 border border-white/10 hover:border-amber-400/80 hover:bg-slate-900 rounded-2xl p-4 transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between cursor-pointer group text-left relative overflow-hidden"
              >
                {/* Glow bar on hover */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: light.color }}
                />

                <div>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div
                      className="p-2 rounded-xl border border-white/15 shadow-inner group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${light.color}25` }}
                    >
                      {getIcon(light.icon)}
                    </div>
                    <div>
                      <h4 className="text-amber-100 font-serif font-semibold text-sm leading-snug group-hover:text-amber-300 transition-colors">
                        {name}
                      </h4>
                      <span className="text-[11px] text-amber-400/80 font-serif italic">{giver}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300/90 font-serif leading-relaxed mb-3">{desc}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-serif text-amber-400/80 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1 group-hover:text-amber-200">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{language === 'en' ? 'Click to view' : 'Cliquer pour voir'}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Final Quote Box */}
        <div className="bg-amber-950/30 border border-amber-500/25 rounded-2xl p-4 sm:p-5 mb-8 text-amber-100/90 font-serif text-sm sm:text-base italic max-w-xl mx-auto">
          {language === 'en'
            ? '“The sun has returned to the sky, and you are surrounded by the warmth you shared.”'
            : '« Le soleil est revenu dans le ciel, et tu es entourée de toute la chaleur que tu as partagée. »'}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {onOpenMemories && (
            <button
              id="btn-ending-memories"
              onClick={() => {
                audioSynth.playSoundEffect('magic_sparkle');
                onOpenMemories();
              }}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 hover:from-amber-800 hover:to-amber-950 text-amber-100 rounded-2xl font-serif text-sm sm:text-base font-semibold shadow-lg border border-amber-400/50 hover:border-amber-300 transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.2)]"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              <span>{language === 'en' ? 'Memories Scrapbook 📖' : 'Album des Souvenirs 📖'}</span>
            </button>
          )}

          <button
            id="btn-restart-story"
            onClick={onRestart}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white rounded-2xl font-serif text-sm sm:text-base font-semibold shadow-lg hover:shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{language === 'en' ? 'Relive the Story' : 'Revivre le Conte'}</span>
          </button>

          {onReturnToTitle && (
            <button
              id="btn-ending-return-menu"
              onClick={onReturnToTitle}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-amber-200 hover:text-white rounded-2xl font-serif text-sm sm:text-base font-semibold shadow-lg border border-amber-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer hover:border-amber-400"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              <span>{language === 'en' ? 'Return to Main Menu' : 'Menu Principal'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE CHARACTER SPOTLIGHT MODAL (Triggered when user clicks relics/cake) */}
      {/* ========================================================================= */}
      {selectedCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-amber-950/90 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.3)] text-center">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCharacter(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-amber-200 hover:text-white border border-amber-500/30 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Character Spotlight Display */}
            <div className="flex justify-center mb-4 min-h-[200px] sm:min-h-[240px] items-end overflow-visible">
              {selectedCharacter === 'orik' && (
                <div className="scale-[0.85] sm:scale-95 origin-bottom">
                  <CharacterPortrait
                    characterId="orik"
                    expression="grateful"
                    isSpeaking={false}
                  />
                </div>
              )}
              {selectedCharacter === 'artisan' && (
                <div className="scale-[0.85] sm:scale-95 origin-bottom">
                  <CharacterPortrait
                    characterId="artisan"
                    expression="inspired"
                    isSpeaking={false}
                  />
                </div>
              )}
              {selectedCharacter === 'lezar' && (
                <div className="scale-[0.85] sm:scale-95 origin-bottom">
                  <CharacterPortrait
                    characterId="lezar"
                    expression="comforting"
                    isSpeaking={false}
                  />
                </div>
              )}
              {selectedCharacter === 'clown' && (
                <div className="scale-[0.66] sm:scale-[0.72] origin-bottom transform translate-y-1">
                  <CharacterPortrait
                    characterId="clown"
                    expression="waving"
                    isSpeaking={false}
                  />
                </div>
              )}
              {selectedCharacter === 'wendy_pin' && (
                <div className="scale-[0.85] sm:scale-95 origin-bottom">
                  <CharacterPortrait
                    characterId="human_witch"
                    expression="happy"
                    showSwwPin={true}
                    isSpeaking={false}
                  />
                </div>
              )}
              {selectedCharacter === 'hypo' && (
                <div className="scale-[0.85] sm:scale-95 origin-bottom">
                  <CharacterPortrait
                    characterId="hypo"
                    expression="happy"
                    isSpeaking={false}
                  />
                </div>
              )}
              {selectedCharacter === 'bottle' && (
                <div className="relative w-48 h-56 flex items-center justify-center">
                  <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-[0_0_25px_rgba(56,189,248,0.6)]">
                    {/* Glowing Waters */}
                    <ellipse cx="100" cy="200" rx="60" ry="16" fill="#0284c7" opacity="0.3" className="animate-pulse" />
                    {/* Glass Bottle Body */}
                    <path d="M70 90 C70 60, 85 55, 85 35 L115 35 C115 55, 130 60, 130 90 L130 180 C130 200, 70 200, 70 180 Z" fill="#38bdf8" fillOpacity="0.2" stroke="#7dd3fc" strokeWidth="2.5" />
                    {/* Cork */}
                    <rect x="88" y="22" width="24" height="14" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1" />
                    {/* Glowing Scroll Inside */}
                    <rect x="85" y="110" width="30" height="50" rx="4" fill="#fef08a" transform="rotate(-10 100 135)" stroke="#fbbf24" strokeWidth="1.5" />
                    <line x1="90" y1="122" x2="110" y2="122" stroke="#d97706" strokeWidth="1.5" transform="rotate(-10 100 135)" />
                    <line x1="90" y1="132" x2="110" y2="132" stroke="#d97706" strokeWidth="1.5" transform="rotate(-10 100 135)" />
                    <line x1="90" y1="142" x2="105" y2="142" stroke="#d97706" strokeWidth="1.5" transform="rotate(-10 100 135)" />
                    {/* Magical Stardust Particles */}
                    <circle cx="100" cy="130" r="2.5" fill="#ffffff" className="animate-ping" />
                    <circle cx="80" cy="150" r="1.5" fill="#fde047" className="animate-pulse" />
                    <circle cx="120" cy="100" r="1.8" fill="#fde047" className="animate-pulse" />
                  </svg>
                </div>
              )}
            </div>

            {/* Character Name & Relic Title */}
            <div className="mb-3">
              {selectedCharacter === 'orik' && (
                <>
                  <span className="text-xs font-serif uppercase tracking-widest text-emerald-400 font-semibold">
                    {language === 'en' ? 'Verdant Seed of Kindness' : 'Graine Verdoyante de Bonté'}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-emerald-100">
                    {language === 'en' ? 'Orik the Forest Sprite' : 'Orik le Follet des Bois'}
                  </h3>
                </>
              )}
              {selectedCharacter === 'artisan' && (
                <>
                  <span className="text-xs font-serif uppercase tracking-widest text-amber-400 font-semibold">
                    {language === 'en' ? 'Amber Hearth Crystal' : 'Cristal d’Âtre Ambré'}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-amber-100">
                    {language === 'en' ? 'Vivienne the Glassmaker' : 'Vivienne la Verrière'}
                  </h3>
                </>
              )}
              {selectedCharacter === 'lezar' && (
                <>
                  <span className="text-xs font-serif uppercase tracking-widest text-sky-400 font-semibold">
                    {language === 'en' ? 'Sea-Mist Velvet Aura' : 'Aura de Velours Brume-de-Mer'}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-sky-100">
                    {language === 'en' ? 'Lezar the Cat Familiar' : 'Lezar le Familier'}
                  </h3>
                </>
              )}
              {selectedCharacter === 'bottle' && (
                <>
                  <span className="text-xs font-serif uppercase tracking-widest text-cyan-400 font-semibold">
                    {language === 'en' ? 'A Message From Afar' : 'Un Message Venu de Loin'}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-cyan-100">
                    {language === 'en' ? 'The Little Glowing Bottle' : 'La Petite Bouteille Scintillante'}
                  </h3>
                </>
              )}
              {selectedCharacter === 'clown' && (
                <>
                  <span className="text-xs font-serif uppercase tracking-widest text-purple-400 font-semibold">
                    {language === 'en' ? 'Starlight in the Dark' : 'Étoile dans l’Obscurité'}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-amber-100">
                    {language === 'en' ? 'Mélo Clown' : 'Le Clown Mélo'}
                  </h3>
                </>
              )}
              {selectedCharacter === 'wendy_pin' && (
                <>
                  <span className="text-xs font-serif uppercase tracking-widest text-amber-400 font-semibold">
                    {language === 'en' ? 'The Golden Pin of Bonds' : 'La Broche Dorée des Liens'}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-rose-200">
                    {language === 'en' ? 'Super Witch Wendy (SWW Brooch)' : 'Super Sorcière Wendy (Broche SWW)'}
                  </h3>
                </>
              )}
              {selectedCharacter === 'hypo' && (
                <>
                  <span className="text-xs font-serif uppercase tracking-widest text-pink-400 font-semibold">
                    {language === 'en' ? 'The Cozy Birthday Guardian' : 'Le Gardien Douillet d’Anniversaire'}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-pink-100">
                    {language === 'en' ? 'Hypo the Hippo Plushie 🦛' : 'Hypo la Peluche Hippopotame 🦛'}
                  </h3>
                </>
              )}
            </div>

            {/* Personalized Character Quote / Birthday Dialogue */}
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 text-sm sm:text-base font-serif italic text-amber-100 leading-relaxed mb-5 shadow-inner">
              {selectedCharacter === 'orik' && (
                <p>
                  {language === 'en'
                    ? '“Whenever the world turns chilly, remember: you brought green sprouts and blooming flowers back to life. The forest blooms for you, Wendy!” 🌿🌸'
                    : '« Quand le monde se fera frais, souviens-toi : tu as redonné vie aux bourgeons et fait refleurir la terre. La forêt s’épanouit pour toi, Wendy ! » 🌿🌸'}
                </p>
              )}
              {selectedCharacter === 'artisan' && (
                <p>
                  {language === 'en'
                    ? '“You brought light back to my hearth and to my heart! I made this hat and stained glass in your honor. May your birthday shine with brilliant amber warmth!” 🎨✨'
                    : '« Tu as ravivé la flamme dans mon four et dans mon cœur ! J’ai confectionné ce chapeau et ces vitraux en ton honneur. Que ton anniversaire rayonne d’une douce lumière dorée ! » 🎨✨'}
                </p>
              )}
              {selectedCharacter === 'lezar' && (
                <p>
                  {language === 'en'
                    ? '“Purrrrr… You carried the sun across mountains and seas, Wendy. Now rest your paws, eat sweet treats, and know that you are loved.” 🐾🐱'
                    : '« Ronron… Tu as porté le soleil par-delà les monts et les mers, Wendy. Maintenant, repose tes pattes, savoure tes douceurs et sache que tu es aimée. » 🐾🐱'}
                </p>
              )}
              {selectedCharacter === 'bottle' && (
                <p>
                  {language === 'en'
                    ? '“Carried by gentle ocean tides across countless miles, holding wishes of health, endless happiness, and sweet memories just for you.” 🌊✉️'
                    : '« Portée par les douces marées à travers l’océan, abritant des vœux de santé, de bonheur infini et de tendres souvenirs rien que pour toi. » 🌊✉️'}
                </p>
              )}
              {selectedCharacter === 'clown' && (
                <p>
                  {language === 'en'
                    ? '“Happy Birthday lodi, Wendy! I hope you’ll have a wonderful day today! Take care always, partenaire.” 🎩✨🪄'
                    : '« Joyeux Anniversaire lodi, Wendy ! J’espère que tu passeras une merveilleuse journée aujourd’hui ! Prends bien soin de toi, partenaire. » 🎩✨🪄'}
                </p>
              )}
              {selectedCharacter === 'wendy_pin' && (
                <p>
                  {language === 'en'
                    ? '“A gleaming golden brooch inscribed with ‘SWTW’, gifted with fondness and clipped proudly in Wendy’s hair. A shining reminder of all the warmth, kindness, and love she brought to the entire world!” 🌸✨'
                    : '« Une broche dorée étincelante gravée « SWTW », offerte avec tendresse et portée avec fierté dans la chevelure de Wendy. Un souvenir rayonnant de toute la chaleur et l’amour partagés ! » 🌸✨'}
                </p>
              )}
              {selectedCharacter === 'hypo' && (
                <p>
                  {language === 'en'
                    ? '“Squeak! Happy Birthday, Wendy! Don’t forget to wrap your neck pillow tight, take cozy naps, and enjoy every bite of delicious cake!” 🦛🎂💤'
                    : '« Pouêt ! Joyeux Anniversaire, Wendy ! N’oublie pas d’enfiler ton coussin de cou douillet, de faire de bonnes siestes et de savourer le délicieux gâteau ! » 🦛🎂💤'}
                </p>
              )}
            </div>

            {/* Character Selector Quick Switch Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-amber-500/20">
              <span className="text-xs text-amber-300/70 font-serif mr-1">
                {language === 'en' ? 'Summon others:' : 'Voir les autres :'}
              </span>
              <button
                onClick={() => handleSelectCharacter('orik')}
                className={`px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                  selectedCharacter === 'orik'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
                }`}
              >
                🌿 Orik
              </button>
              <button
                onClick={() => handleSelectCharacter('artisan')}
                className={`px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                  selectedCharacter === 'artisan'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                }`}
              >
                🎨 Vivienne
              </button>
              <button
                onClick={() => handleSelectCharacter('lezar')}
                className={`px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                  selectedCharacter === 'lezar'
                    ? 'bg-sky-600 text-white font-bold'
                    : 'bg-slate-800 text-sky-300 hover:bg-slate-700'
                }`}
              >
                🐱 Lezar
              </button>
              <button
                onClick={() => handleSelectCharacter('bottle')}
                className={`px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                  selectedCharacter === 'bottle'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                }`}
              >
                {language === 'en' ? '🍾 Bottle' : '🍾 Bouteille'}
              </button>
              <button
                onClick={() => handleSelectCharacter('clown')}
                className={`px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                  selectedCharacter === 'clown'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-800 text-purple-300 hover:bg-slate-700'
                }`}
              >
                🎩 Mélo Clown
              </button>
              <button
                onClick={() => handleSelectCharacter('wendy_pin')}
                className={`px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                  selectedCharacter === 'wendy_pin'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                }`}
              >
                🌸 Wendy (SWW)
              </button>
              <button
                onClick={() => handleSelectCharacter('hypo')}
                className={`px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                  selectedCharacter === 'hypo'
                    ? 'bg-pink-600 text-white font-bold'
                    : 'bg-slate-800 text-pink-300 hover:bg-slate-700'
                }`}
              >
                🦛 Hypo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
