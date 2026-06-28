import React from 'react';
import { Bot, Scenario } from '../types';
import { Target, X } from 'lucide-react';

interface LinkScenarioModalProps {
  isOpen: boolean;
  scenarios: Scenario[];
  onSelect: (scenario: Scenario) => void;
  onClose: () => void;
}

export default function LinkScenarioModal({
  isOpen,
  scenarios,
  onSelect,
  onClose,
}: LinkScenarioModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 backdrop-blur-md p-4 animate-fade-in"
      id="modal-link-scenario"
    >
      <div className="bg-white/85 backdrop-blur-2xl border border-white/50 w-full max-w-md rounded-xl shadow-2xl animate-pop-in overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-warm-clay/60 bg-warm-sand flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-gold" strokeWidth={1.5} />
            <h3 className="font-serif italic text-lg text-charcoal-dark font-medium">
              Связать сценарий
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-warm-clay/40 rounded-full transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          <p className="text-xs text-charcoal-light/70 font-sans mb-2">
            Выберите команду из списка ниже, чтобы привязать её к действию при клике на кнопку.
          </p>

          {scenarios.length === 0 ? (
            <div className="py-8 text-center text-charcoal-light/60 text-sm font-sans italic">
              Нет созданных сценариев. Сначала добавьте сценарии в редакторе.
            </div>
          ) : (
            <div className="grid gap-2">
              {scenarios.map((scen) => (
                <button
                  key={scen.id}
                  onClick={() => onSelect(scen)}
                  className="w-full text-left p-3 rounded-lg border border-warm-clay hover:border-amber-gold hover:bg-warm-sand transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="font-mono text-sm font-semibold text-deep-bronze group-hover:text-charcoal-dark transition-colors">
                      /{scen.command || 'untitled'}
                    </div>
                    <div className="text-xs text-charcoal-light/70 truncate max-w-[280px]">
                      {scen.responseText || 'Без текстового ответа'}
                    </div>
                  </div>
                  <div className="text-xs text-amber-gold opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    Выбрать &rarr;
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-warm-sand border-t border-warm-clay/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-warm-clay rounded-lg text-xs font-sans hover:bg-warm-sand transition-colors text-charcoal-dark"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
