import React, { useState } from 'react';
import { Bot } from '../types';
import { Edit3, Copy, Trash2, Sliders, X, Check } from 'lucide-react';

interface BotContextSheetProps {
  isOpen: boolean;
  bot: Bot | null;
  onClose: () => void;
  onEditScenarios: (bot: Bot) => void;
  onRenameBot: (botId: string, newName: string) => void;
  onCloneBot: (bot: Bot) => void;
  onDeleteBot: (botId: string, botName: string) => void;
}

export default function BotContextSheet({
  isOpen,
  bot,
  onClose,
  onEditScenarios,
  onRenameBot,
  onCloneBot,
  onDeleteBot,
}: BotContextSheetProps) {
  if (!isOpen || !bot) return null;

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState(bot.name);
  const [renameError, setRenameError] = useState('');

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameInput.trim()) {
      setRenameError('Имя не может быть пустым');
      return;
    }
    onRenameBot(bot.id, renameInput.trim());
    setIsRenaming(false);
    onClose();
  };

  const handleCloneAction = () => {
    onCloneBot(bot);
    onClose();
  };

  const handleDeleteAction = () => {
    onDeleteBot(bot.id, bot.name);
    onClose();
  };

  const handleEditAction = () => {
    onEditScenarios(bot);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/25 backdrop-blur-md p-0 sm:p-4 animate-fade-in"
      id="modal-context"
    >
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      <div className="bg-white/85 backdrop-blur-2xl border-t sm:border border-white/50 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-pop-in space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-warm-clay/40 pb-3">
          <div className="space-y-0.5">
            <h3 className="font-serif italic text-lg font-bold text-charcoal-dark truncate max-w-[280px]">
              {bot.name}
            </h3>
            <p className="text-[10px] uppercase tracking-widest text-charcoal-light/50 font-sans">
              Опции управления
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-warm-sand rounded-full transition-colors text-charcoal-light/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rename Subsection Form */}
        {isRenaming ? (
          <form onSubmit={handleRenameSubmit} className="space-y-4 animate-fade-in" id="modal-rename">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-light/60">
                  Новое имя проекта
                </label>
                <span className="text-[9px] font-mono text-charcoal-light/50 font-semibold">{renameInput.length}/32</span>
              </div>
              <input
                type="text"
                value={renameInput}
                maxLength={32}
                onChange={(e) => {
                  setRenameInput(e.target.value);
                  if (renameError) setRenameError('');
                }}
                className="w-full bg-warm-sand border border-warm-clay/80 focus:border-amber-gold rounded-xl px-3.5 py-2.5 text-xs font-sans outline-none"
                autoFocus
              />
              {renameError && (
                <p className="text-[11px] text-red-600 font-sans font-medium">{renameError}</p>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRenaming(false)}
                className="px-3 py-1.5 border border-warm-clay text-xs rounded-lg hover:bg-warm-sand transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-charcoal-dark text-warm-cream text-xs rounded-lg hover:bg-charcoal-light flex items-center gap-1 font-semibold"
              >
                <Check className="w-3.5 h-3.5 text-amber-gold" />
                Сохранить
              </button>
            </div>
          </form>
        ) : (
          /* Primary Context actions list */
          <div className="grid gap-2">
            
            {/* 1. Edit Scenarios button */}
            <button
              onClick={handleEditAction}
              className="w-full p-3.5 rounded-xl border border-warm-clay hover:border-amber-gold hover:bg-warm-sand text-left flex items-center gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-amber-gold/10 text-amber-gold">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-charcoal-dark">Редактировать сценарии</div>
                <div className="text-[10px] text-charcoal-light/60">Добавить и связать ответы бота</div>
              </div>
            </button>

            {/* 2. Rename button */}
            <button
              onClick={() => setIsRenaming(true)}
              className="w-full p-3.5 rounded-xl border border-warm-clay hover:border-amber-gold hover:bg-warm-sand text-left flex items-center gap-3 transition-all cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-warm-sand text-charcoal-light/70">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-charcoal-dark">Переименовать</div>
                <div className="text-[10px] text-charcoal-light/60">Изменить имя проекта</div>
              </div>
            </button>

            {/* 3. Clone / Duplicate button */}
            <button
              onClick={handleCloneAction}
              className="w-full p-3.5 rounded-xl border border-warm-clay hover:border-amber-gold hover:bg-warm-sand text-left flex items-center gap-3 transition-all cursor-pointer"
              id="modal-clone"
            >
              <div className="p-2 rounded-lg bg-warm-sand text-charcoal-light/70">
                <Copy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-charcoal-dark">Клонировать</div>
                <div className="text-[10px] text-charcoal-light/60">Создать дубликат проекта</div>
              </div>
            </button>

            {/* 4. Delete button */}
            <button
              onClick={handleDeleteAction}
              className="w-full p-3.5 rounded-xl border border-red-100 hover:border-red-200 hover:bg-red-50 text-left flex items-center gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-red-600">Удалить проект</div>
                <div className="text-[10px] text-red-400">Безвозвратное удаление со всеми ветками</div>
              </div>
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
