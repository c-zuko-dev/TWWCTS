import React, { useRef, useState } from 'react';
import { Sparkles, CheckCircle2, Wand2 } from 'lucide-react';
import { ChoiceOption, Language } from '../types';
import { MagicWandTrail } from './MagicWandTrail';

interface ChoiceOverlayProps {
  choices: ChoiceOption[];
  language: Language;
  onSelectChoice: (choice: ChoiceOption) => void;
}

export const ChoiceOverlay: React.FC<ChoiceOverlayProps> = ({ choices, language, onSelectChoice }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverData, setHoverData] = useState<{ [key: string]: { x: number; y: number; active: boolean } }>({});

  const handleClick = (choice: ChoiceOption) => {
    if (selectedId) return; // Prevent double clicks
    setSelectedId(choice.id);
    setTimeout(() => {
      onSelectChoice(choice);
    }, 400);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverData((prev) => ({
      ...prev,
      [id]: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      },
    }));
  };

  const handleMouseLeave = (id: string) => {
    setHoverData((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { x: 0, y: 0 }), active: false },
    }));
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto px-4 mb-4 z-30 animate-fade-in">
      {/* Super Witch Magical Wand Trail FX */}
      <MagicWandTrail isActive={true} containerRef={containerRef} />

      <div className="flex flex-col gap-3">
        {choices.map((choice, index) => {
          const choiceText = choice.text[language] || choice.text.en;
          const isSelected = selectedId === choice.id;
          const isDimmed = selectedId !== null && !isSelected;
          const hover = hoverData[choice.id];

          return (
            <button
              key={choice.id}
              id={`choice-btn-${index}`}
              onClick={() => handleClick(choice)}
              onMouseMove={(e) => handleMouseMove(e, choice.id)}
              onMouseLeave={() => handleMouseLeave(choice.id)}
              disabled={selectedId !== null}
              className={`group relative text-left backdrop-blur-xl rounded-xl p-4 sm:p-5 shadow-xl transition-all duration-300 transform cursor-pointer border overflow-hidden ${
                isSelected
                  ? 'animate-choice-selected bg-gradient-to-r from-amber-600/90 via-amber-500/90 to-amber-700/90 border-amber-300 text-white scale-[1.02]'
                  : isDimmed
                  ? 'opacity-40 scale-[0.98] pointer-events-none bg-slate-950/80 border-amber-900/20'
                  : 'bg-gradient-to-r from-slate-950/90 via-amber-950/40 to-slate-950/90 hover:from-amber-950/80 hover:via-amber-900/50 hover:to-amber-950/80 border-amber-400/40 hover:border-amber-300 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]'
              }`}
            >
              {/* Soft Tactile Radial Reveal Glow Overlay on Hover */}
              {!isSelected && hover?.active && (
                <div
                  className="pointer-events-none absolute inset-0 transition-opacity duration-200 z-0"
                  style={{
                    background: `radial-gradient(150px circle at ${hover.x}px ${hover.y}px, rgba(251, 191, 36, 0.28), rgba(245, 158, 11, 0.12) 40%, transparent 80%)`,
                  }}
                />
              )}

              {/* Shimmering Golden Border Focus Beam */}
              {!isSelected && hover?.active && (
                <div
                  className="pointer-events-none absolute -inset-px rounded-xl transition-opacity duration-200 z-0"
                  style={{
                    background: `radial-gradient(100px circle at ${hover.x}px ${hover.y}px, rgba(254, 240, 138, 0.7), transparent 70%)`,
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMaskComposite: 'xor',
                    padding: '1.5px',
                  }}
                />
              )}

              <div className="relative z-10 flex items-start gap-3">
                <div
                  className={`mt-0.5 p-1 rounded-full transition-all duration-300 ${
                    isSelected
                      ? 'bg-white text-amber-900 shadow-md'
                      : 'bg-amber-500/20 text-amber-300 group-hover:text-amber-100 group-hover:bg-amber-500/50 group-hover:scale-110 shadow-sm'
                  }`}
                >
                  {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <span
                    className={`font-serif text-sm sm:text-base leading-snug transition-colors ${
                      isSelected
                        ? 'text-white font-medium'
                        : 'text-amber-100 group-hover:text-amber-50 font-medium'
                    }`}
                  >
                    {choiceText}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
