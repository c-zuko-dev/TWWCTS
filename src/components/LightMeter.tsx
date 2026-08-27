import React, { useState, useEffect, useRef } from 'react';
import { Sun, Sparkles, X, Heart, Shield, Award } from 'lucide-react';
import { Language } from '../types';
import { ALL_COLLECTIBLE_LIGHTS } from '../data/storyData';
import { audioSynth } from '../utils/audioSynthesizer';

interface LightMeterProps {
  currentSceneId: string;
  collectedLights: string[];
  language: Language;
}

export const LightMeter: React.FC<LightMeterProps> = ({
  currentSceneId,
  collectedLights,
  language,
}) => {
  const [isOpenDetails, setIsOpenDetails] = useState(false);
  const [isGlinting, setIsGlinting] = useState(false);
  const prevCountRef = useRef(collectedLights.length);

  // Trigger glint animation and custom multi-layered chime + harp swell sound effect upon collecting a new light
  useEffect(() => {
    if (collectedLights.length > prevCountRef.current) {
      audioSynth.playLightMeterFillHarpSwell();
      setIsGlinting(true);
      const timer = setTimeout(() => setIsGlinting(false), 2400);
      prevCountRef.current = collectedLights.length;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = collectedLights.length;
  }, [collectedLights.length]);

  // Calculate chapter and progress based on currentSceneId
  const getProgress = (): { percent: number; chapterName: string; chapterNum: number } => {
    if (currentSceneId.startsWith('epilogue')) {
      return {
        percent: 100,
        chapterName: language === 'en' ? 'Epilogue: The Feast' : 'Épilogue : Le Festin',
        chapterNum: 10,
      };
    }
    if (currentSceneId.startsWith('chapter9')) {
      return {
        percent: 94,
        chapterName: language === 'en' ? 'Ch. 9: The Mirror' : 'Ch. 9 : Le Miroir',
        chapterNum: 9,
      };
    }
    if (currentSceneId.startsWith('chapter8')) {
      return {
        percent: 88,
        chapterName: language === 'en' ? 'Ch. 8: The Dawn' : 'Ch. 8 : L’Aube',
        chapterNum: 8,
      };
    }
    if (currentSceneId.startsWith('chapter7')) {
      return {
        percent: 78,
        chapterName: language === 'en' ? 'Ch. 7: The Unburdening' : 'Ch. 7 : L’Allègement',
        chapterNum: 7,
      };
    }
    if (currentSceneId.startsWith('chapter6')) {
      return {
        percent: 68,
        chapterName: language === 'en' ? 'Ch. 6: Riddle of Warmth' : 'Ch. 6 : L’Énigme du Cœur',
        chapterNum: 6,
      };
    }
    if (currentSceneId.startsWith('chapter5')) {
      return {
        percent: 58,
        chapterName: language === 'en' ? 'Ch. 5: Velvet Abyss' : 'Ch. 5 : L’Abîme de Velours',
        chapterNum: 5,
      };
    }
    if (currentSceneId.startsWith('chapter4')) {
      return {
        percent: 48,
        chapterName: language === 'en' ? 'Ch. 4: Windswept Shore' : 'Ch. 4 : Le Rivage',
        chapterNum: 4,
      };
    }
    if (currentSceneId.startsWith('chapter3')) {
      return {
        percent: 38,
        chapterName: language === 'en' ? 'Ch. 3: Crossroads Kiln' : 'Ch. 3 : Le Four',
        chapterNum: 3,
      };
    }
    if (currentSceneId.startsWith('chapter2')) {
      return {
        percent: 26,
        chapterName: language === 'en' ? 'Ch. 2: The Sprite' : 'Ch. 2 : Le Follet',
        chapterNum: 2,
      };
    }
    if (currentSceneId.startsWith('chapter1')) {
      return {
        percent: 16,
        chapterName: language === 'en' ? 'Ch. 1: Whispering Forest' : 'Ch. 1 : La Forêt',
        chapterNum: 1,
      };
    }
    return {
      percent: 8,
      chapterName: language === 'en' ? 'Prologue: Twilight' : 'Prologue : Crépuscule',
      chapterNum: 0,
    };
  };

  const { percent, chapterName } = getProgress();
  const collectedCount = collectedLights.length;
  const totalSparks = Object.keys(ALL_COLLECTIBLE_LIGHTS).length; // 6

  const handleToggleDetails = () => {
    audioSynth.playSoundEffect('magic_sparkle');
    setIsOpenDetails((prev) => !prev);
  };

  return (
    <div id="light-meter-container" className="relative z-30 select-none">
      {/* Persistent Light Meter Corner Widget */}
      <button
        id="btn-light-meter-widget"
        data-interactive="lantern"
        onClick={handleToggleDetails}
        className={`group relative flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-slate-950/85 hover:bg-slate-900/95 backdrop-blur-xl border border-amber-400/50 hover:border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all transform hover:scale-[1.02] cursor-pointer ${
          isGlinting ? 'animate-meter-glint ring-2 ring-amber-300/80 shadow-[0_0_35px_rgba(251,191,36,0.8)] scale-105' : ''
        }`}
        title={language === 'en' ? "Super Witch's Light Meter (Click for details)" : "Jauge de Lumière de la Super Sorcière (Cliquez pour détails)"}
      >
        {/* Fill Celebration Sparkle Burst Particles */}
        {isGlinting && (
          <div className="absolute inset-0 rounded-full pointer-events-none overflow-visible flex items-center justify-center">
            <span className="absolute -top-3 left-1/4 text-amber-300 text-sm animate-meter-sparkle">✨</span>
            <span className="absolute -bottom-3 right-1/4 text-yellow-200 text-sm animate-meter-sparkle [animation-delay:200ms]">⭐</span>
            <span className="absolute -top-2 -right-2 text-rose-300 text-xs animate-meter-sparkle [animation-delay:400ms]">💛</span>
          </div>
        )}

        {/* Glowing Sun Core Icon with spinning rays */}
        <div className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.6)] ${isGlinting ? 'scale-110' : ''}`}>
          <div className="w-full h-full rounded-full bg-slate-950/90 flex items-center justify-center">
            <Sun className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-spin-slow ${isGlinting ? 'text-amber-100' : ''}`} />
          </div>
          {/* Pulsing Outer Glint */}
          <div className={`absolute inset-0 rounded-full border border-amber-300/80 animate-ping opacity-35 pointer-events-none ${isGlinting ? 'opacity-80 scale-125' : ''}`} />
        </div>

        {/* Meter Gauge & Info */}
        <div className="flex flex-col text-left">
          <div className="flex items-center justify-between gap-3 text-[10px] sm:text-xs font-serif leading-none mb-1">
            <span className="font-bold text-amber-200/90 group-hover:text-amber-100 flex items-center gap-1">
              <span>{language === 'en' ? 'Light Shared' : 'Lumière Partagée'}</span>
              <span className="text-amber-400 font-mono font-semibold">{percent}%</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-amber-400 font-serif">
              ✨ {collectedCount}/{totalSparks}
            </span>
          </div>

          {/* Golden Celestial Progress Bar */}
          <div className="w-24 sm:w-32 h-1.5 rounded-full bg-slate-800/90 overflow-hidden border border-amber-500/30 p-[1px]">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-rose-300 shadow-[0_0_8px_rgba(251,191,36,0.9)] transition-all duration-700 ease-out ${
                isGlinting ? 'brightness-125 shadow-[0_0_15px_rgba(251,191,36,1)]' : ''
              }`}
              style={{ width: `${Math.max(6, percent)}%` }}
            />
          </div>
        </div>
      </button>

      {/* Expanded Light Capacity Details Popover Modal */}
      {isOpenDetails && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in pointer-events-auto">
          <div
            className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/95 border-2 border-amber-400/60 p-6 sm:p-7 shadow-[0_0_50px_rgba(251,191,36,0.4)] text-left font-serif animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/30 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 flex items-center justify-center shadow-lg">
                  <div className="w-full h-full rounded-2xl bg-slate-950/90 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-amber-300" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-amber-100">
                    {language === 'en' ? "The Super Witch's Light" : 'La Lumière de la Super Sorcière'}
                  </h3>
                  <p className="text-xs text-amber-300/80">
                    {language === 'en' ? 'Capacity of Shared Warmth' : 'Capacité de Chaleur Partagée'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpenDetails(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Progress Bar Card */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 mb-5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-amber-200 mb-2">
                <span>{chapterName}</span>
                <span className="text-amber-400 font-mono text-base">{percent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-900 border border-amber-500/40 p-0.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-300 to-yellow-100 shadow-[0_0_12px_rgba(251,191,36,0.9)] transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-amber-200/80 leading-relaxed italic">
                {language === 'en'
                  ? '“Wendy’s inner light expands not by keeping the sun inside, but by lighting the road for friends in need.”'
                  : '« La lumière intérieure de Wendy s’agrandit non pas en gardant le soleil pour elle, mais en éclairant la route de ses amis. »'}
              </p>
            </div>

            {/* Collected Light Sparks Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    {language === 'en' ? 'Light Sparks Collected' : 'Étincelles de Lumière Collectées'}
                  </span>
                </h4>
                <span className="text-xs text-amber-400 font-bold">
                  {collectedCount} / {totalSparks}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {Object.values(ALL_COLLECTIBLE_LIGHTS).map((light) => {
                  const isCollected = collectedLights.includes(light.id);
                  const name = light.name[language] || light.name.en;
                  const desc = light.description[language] || light.description.en;

                  return (
                    <div
                      key={light.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                        isCollected
                          ? 'bg-slate-950/80 border-amber-400/50 shadow-md'
                          : 'bg-slate-950/40 border-slate-800/80 opacity-50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                          isCollected
                            ? 'border-white/30 text-amber-200 shadow-inner'
                            : 'border-slate-700 text-slate-500'
                        }`}
                        style={{
                          backgroundColor: isCollected ? `${light.color}40` : '#1e293b',
                        }}
                      >
                        {isCollected ? <Sparkles className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate text-amber-100">
                          {isCollected ? name : language === 'en' ? 'Undiscovered Spark' : 'Étincelle Cachée'}
                        </div>
                        <div className="text-[10px] text-amber-200/70 truncate">
                          {isCollected ? desc : language === 'en' ? 'Continue reading to find' : 'Continuez la lecture'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 pt-4 border-t border-amber-500/20 flex items-center justify-center">
              <button
                onClick={() => setIsOpenDetails(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-amber-200 border border-amber-500/30 font-bold text-xs sm:text-sm font-serif shadow-lg cursor-pointer transition-all"
              >
                {language === 'en' ? 'Back to Story' : 'Retour au Conte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
