import React, { useState } from 'react';
import { Bot } from '../types';
import { PlusCircle, Info, Keyboard, Code2, Sparkles, FileText } from 'lucide-react';
import { parseAiogramCode } from '../utils/codeParser';

interface CreateBotProps {
  onAddBot: (newBot: Bot) => void;
  onSelectTab: (tab: 'bots' | 'create' | 'profile' | 'editor') => void;
}

export default function CreateBot({ onAddBot, onSelectTab }: CreateBotProps) {
  const [creationMode, setCreationMode] = useState<'scratch' | 'import'>('scratch');
  const [name, setName] = useState('');
  const [pythonCode, setPythonCode] = useState('');
  const [error, setError] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Пожалуйста, введите корректное имя проекта.');
      return;
    }

    let scenarios = [
      {
        id: 'scen_start_' + Date.now(),
        command: 'start',
        responseText: 'Привет! Добро пожаловать в нашего нового бота. Воспользуйтесь меню или напишите /help для помощи.',
        isUnique: false,
        hasKeyboard: true,
        keyboardButtons: [
          { text: 'Помощь', actionValue: '/help' },
          { text: 'О нас', actionValue: '/about' }
        ],
        hasAlert: false,
        alertText: 'Внимание!',
        hasInlineNotif: false,
        inlineNotifText: 'Успешно!',
        hasButtons: false,
        inlineButtons: []
      }
    ];

    if (creationMode === 'import' && pythonCode.trim()) {
      try {
        scenarios = parseAiogramCode(pythonCode);
      } catch (err) {
        console.error('Failed to parse Python code:', err);
      }
    }

    const newBot: Bot = {
      id: 'bot_' + Date.now(),
      name: name.trim(),
      scenarios
    };

    onAddBot(newBot);
    setName('');
    setPythonCode('');
    setError('');
    onSelectTab('bots');
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto py-4 animate-fade-in" id="tab-create">
      
      {/* Tab Heading */}
      <div className="text-center space-y-2 pb-2">
        <h2 className="font-serif italic text-3xl font-medium text-charcoal-dark">
          Создать проект
        </h2>
        <p className="text-sm text-charcoal-light/60 max-w-sm mx-auto leading-relaxed">
          Создайте нового бота с нуля или мгновенно импортируйте сценарии из готового aiogram скрипта.
        </p>
      </div>

      {/* Luxury Segmented Toggle Control */}
      <div className="grid grid-cols-2 p-1.5 bg-warm-sand/80 border border-warm-clay rounded-2xl max-w-sm mx-auto shadow-sm">
        <button
          type="button"
          onClick={() => setCreationMode('scratch')}
          className={`py-2 px-3 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
            creationMode === 'scratch'
              ? 'bg-white text-amber-gold shadow-sm'
              : 'text-charcoal-light/60 hover:text-charcoal-dark'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          С НУЛЯ
        </button>
        <button
          type="button"
          onClick={() => setCreationMode('import')}
          className={`py-2 px-3 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
            creationMode === 'import'
              ? 'bg-white text-amber-gold shadow-sm'
              : 'text-charcoal-light/60 hover:text-charcoal-dark'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          ИМПОРТ AIOGRAM
        </button>
      </div>

      {/* Elegant Creator Card */}
      <form 
        onSubmit={handleCreate}
        className="bg-white/85 backdrop-blur-2xl border border-white/50 rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
      >
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label 
              htmlFor="input-new-bot-name"
              className="text-xs font-semibold uppercase tracking-wider text-charcoal-light/70 flex items-center gap-1.5"
            >
              <Keyboard className="w-3.5 h-3.5 text-amber-gold" />
              Имя Telegram-бота
            </label>
            <span className="text-[10px] font-mono text-charcoal-light/50 font-semibold">{name.length}/32</span>
          </div>
          <input
            id="input-new-bot-name"
            type="text"
            value={name}
            maxLength={32}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="Например: EliteTravelBot или LuxuryClock_Bot"
            className="w-full bg-warm-sand/65 border border-warm-clay/50 focus:border-amber-gold rounded-xl px-4 py-3.5 text-sm outline-none transition-all placeholder:text-charcoal-light/40 font-sans font-medium text-charcoal-dark"
          />
          {error && (
            <p className="text-xs text-red-600 font-sans font-medium">
              {error}
            </p>
          )}
        </div>

        {creationMode === 'import' && (
          <div className="space-y-2 animate-fade-in">
            <label 
              htmlFor="input-python-code"
              className="text-xs font-semibold uppercase tracking-wider text-charcoal-light/70 flex items-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5 text-amber-gold" />
              Код на Python (aiogram v2 / v3)
            </label>
            <textarea
              id="input-python-code"
              value={pythonCode}
              onChange={(e) => setPythonCode(e.target.value)}
              placeholder={`# Вставьте код вашего бота сюда, например:
@dp.message(Command("start"))
async def cmd_start(message: Message):
    await message.answer("Добро пожаловать!", reply_markup=...)`}
              className="w-full h-48 bg-warm-sand/65 border border-warm-clay/50 focus:border-amber-gold rounded-xl px-4 py-3 text-xs outline-none transition-all placeholder:text-charcoal-light/30 font-mono text-charcoal-dark resize-none"
            />
          </div>
        )}

        {/* Informative advice */}
        <div className="bg-warm-sand/50 rounded-xl p-4 border border-warm-clay/40 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-gold shrink-0 mt-0.5" />
          <div className="text-xs text-charcoal-light/80 space-y-1 font-sans leading-relaxed">
            <p className="font-semibold text-charcoal-dark">
              {creationMode === 'scratch' ? 'Полезный совет:' : 'Подсказка по импорту:'}
            </p>
            <p>
              {creationMode === 'scratch' 
                ? 'Обычно имена ботов в Telegram оканчиваются на bot. Вы всегда сможете настроить настоящее имя и юзернейм непосредственно в Telegram через @BotFather.'
                : 'Архитектор автоматически распознает обработчики команд (@dp.message), текст ответов (answer/reply), а также инлайн и обычные кнопки (KeyboardButton / InlineKeyboardButton)!'
              }
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 bg-charcoal-dark hover:bg-charcoal-light text-warm-cream rounded-xl text-xs font-semibold tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {creationMode === 'scratch' ? (
            <>
              <PlusCircle className="w-4 h-4 text-amber-gold" />
              СОЗДАТЬ ПРОЕКТ
            </>
          ) : (
            <>
              <Code2 className="w-4 h-4 text-amber-gold" />
              ИМПОРТИРОВАТЬ И СОЗДАТЬ
            </>
          )}
        </button>
      </form>

    </div>
  );
}
