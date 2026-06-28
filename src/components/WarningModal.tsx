import React from 'react';
import { ShieldAlert, Sparkles } from 'lucide-react';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  requiredPlan: 'encode' | 'pro';
  currentPlan: 'free' | 'encode';
}

export default function WarningModal({
  isOpen,
  onClose,
  onUpgrade,
  requiredPlan,
  currentPlan,
}: WarningModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 backdrop-blur-md p-4 animate-fade-in"
      id="modal-warning"
    >
      <div className="bg-white/85 backdrop-blur-2xl border border-white/50 w-full max-w-md rounded-xl p-6 shadow-2xl animate-pop-in space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-warm-sand rounded-full border border-warm-clay text-amber-gold shrink-0">
            <ShieldAlert className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif italic text-xl text-charcoal-dark font-medium">
              Доступ ограничен
            </h3>
            <p className="text-sm text-charcoal-light/80 leading-relaxed font-sans">
              Эта функция требует тарифного плана{' '}
              <span className="font-semibold text-deep-bronze">
                {requiredPlan === 'encode' ? 'ENCODE' : 'PRO'}
              </span>
              . На вашем текущем плане <span className="uppercase font-semibold">{currentPlan}</span> этот инструмент заблокирован.
            </p>
          </div>
        </div>

        <div className="bg-warm-sand border border-warm-clay/60 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-deep-bronze font-medium text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-amber-gold" />
            Что даёт улучшение:
          </div>
          <ul className="text-xs text-charcoal-light/90 space-y-1 font-sans list-disc list-inside">
            {requiredPlan === 'encode' ? (
              <>
                <li>Экранные Reply-меню клавиатур</li>
                <li>Нативные всплывающие Alert уведомления</li>
              </>
            ) : (
              <>
                <li>Встроенные Inline-кнопки под сообщениями</li>
                <li>Всплывающие Toast-нотификации</li>
                <li>Интерактивное перелинкование (Связать сценарий)</li>
                <li>Полный безлимит на генерацию кода</li>
              </>
            )}
          </ul>
        </div>

        <div className="flex justify-end items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-warm-clay rounded-lg text-sm font-sans hover:bg-warm-sand transition-colors text-charcoal-dark"
          >
            Закрыть
          </button>
          <button
            onClick={onUpgrade}
            className="px-5 py-2 bg-amber-gold text-white rounded-lg text-sm font-sans hover:bg-deep-bronze transition-all shadow-md font-medium"
          >
            Подключить {requiredPlan === 'encode' ? 'Encode' : 'Pro'}
          </button>
        </div>
      </div>
    </div>
  );
}
