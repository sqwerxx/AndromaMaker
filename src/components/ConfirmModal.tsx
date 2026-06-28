import React from 'react';
import { HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 backdrop-blur-md p-4 animate-fade-in"
      id="modal-confirm-delete"
    >
      <div className="bg-white/85 backdrop-blur-2xl border border-white/50 w-full max-w-md rounded-xl p-6 shadow-2xl animate-pop-in space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-warm-sand rounded-full border border-warm-clay text-amber-gold shrink-0">
            <HelpCircle className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif italic text-xl text-charcoal-dark font-medium">
              {title}
            </h3>
            <p className="text-sm text-charcoal-light/80 leading-relaxed font-sans">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-warm-clay rounded-lg text-sm font-sans hover:bg-warm-sand transition-colors text-charcoal-dark"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-charcoal-dark text-warm-cream rounded-lg text-sm font-sans hover:bg-charcoal-light transition-all shadow-md"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}
