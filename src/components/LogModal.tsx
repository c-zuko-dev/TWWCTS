import React from 'react';
import { X, History } from 'lucide-react';
import { Language } from '../types';

interface LogEntry {
  speaker: string;
  text: string;
  id: string;
}

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: LogEntry[];
  language: Language;
}

export const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose, history, language }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-slate-900/50">
          <div className="flex items-center gap-2 text-amber-200">
            <History className="w-5 h-5" />
            <h2 className="font-serif text-lg tracking-wide">
              {language === 'en' ? 'Dialogue Chronicle' : 'Chronique des Dialogues'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-amber-200 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-amber-500/10">
          {history.length === 0 ? (
            <p className="text-slate-400 text-center py-8 font-serif italic">
              {language === 'en' ? 'No recorded chronicles yet.' : 'Aucun dialogue enregistré pour le moment.'}
            </p>
          ) : (
            history.map((entry, idx) => (
              <div key={`${entry.id}-${idx}`} className="pt-3 first:pt-0">
                <div className="text-xs font-serif uppercase tracking-wider text-amber-400/80 mb-1">
                  {entry.speaker}
                </div>
                <p className="text-slate-200 text-sm sm:text-base font-serif leading-relaxed">
                  {entry.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-amber-500/20 bg-slate-900/40 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-600/30 hover:bg-amber-600/50 text-amber-100 rounded-xl text-sm font-serif border border-amber-400/30 transition-colors"
          >
            {language === 'en' ? 'Close Chronicle' : 'Fermer la Chronique'}
          </button>
        </div>
      </div>
    </div>
  );
};
