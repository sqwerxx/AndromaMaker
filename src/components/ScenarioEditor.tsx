import React, { useState } from 'react';
import { Bot, Scenario, InlineButton, KeyboardButton, PlanType } from '../types';
import { 
  ArrowLeft, Plus, Trash2, Play, Code, CheckSquare, Square, 
  HelpCircle, AlertTriangle, Layers, Keyboard, Bell, Link2, Sparkles, X, Target 
} from 'lucide-react';
import HelpGuideModal, { HelpGuideTopic } from './HelpGuideModal';

interface ScenarioEditorProps {
  activeBot: Bot;
  onUpdateBot: (updatedBot: Bot) => void;
  onGoBack: () => void;
  onOpenEmulator: () => void;
  onGenerateCode: () => void;
  selectedPlan: PlanType;
  onOpenWarningModal: (requiredPlan: 'encode' | 'pro') => void;
  onShowConfirmDelete: (title: string, msg: string, callback: () => void) => void;
  
  // Linking state helpers
  onStartLinking: (scenId: string, btnIdx: number, type: 'inline' | 'keyboard') => void;
  onUnlink: (scenId: string, btnIdx: number, type: 'inline' | 'keyboard') => void;
}

export default function ScenarioEditor({
  activeBot,
  onUpdateBot,
  onGoBack,
  onOpenEmulator,
  onGenerateCode,
  selectedPlan,
  onOpenWarningModal,
  onShowConfirmDelete,
  onStartLinking,
  onUnlink,
}: ScenarioEditorProps) {
  
  const scenarios = activeBot.scenarios || [];
  
  // Guide and Share states
  const [guideTopic, setGuideTopic] = useState<HelpGuideTopic | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const handleShareProject = () => {
    try {
      const payload = JSON.stringify({
        name: activeBot.name,
        scenarios: activeBot.scenarios
      });
      // Base64 encode the string safely supporting unicode characters
      const base64 = btoa(unescape(encodeURIComponent(payload)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?importBot=${base64}`;
      navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch (err) {
      console.error('Failed to generate share URL', err);
    }
  };

  // Add new scenario with defaults
  const handleAddScenario = () => {
    const newScen: Scenario = {
      id: 'scen_' + Date.now(),
      command: 'command_' + (scenarios.length + 1),
      responseText: 'Ответ на этот сценарий',
      isUnique: false,
      hasKeyboard: false,
      keyboardButtons: [],
      hasAlert: false,
      alertText: 'Внимание!',
      hasInlineNotif: false,
      inlineNotifText: 'Успешно!',
      hasButtons: false,
      inlineButtons: []
    };

    const updated = {
      ...activeBot,
      scenarios: [...scenarios, newScen]
    };
    onUpdateBot(updated);
  };

  // Delete scenario with confirm
  const handleDeleteScenario = (scen: Scenario) => {
    onShowConfirmDelete(
      'Удалить сценарий?',
      `Вы действительно хотите удалить сценарий "/${scen.command || 'без имени'}"? Все связанные кнопки в этом боте потеряют связь.`,
      () => {
        const remaining = scenarios.filter(s => s.id !== scen.id);
        
        // Clean up linked scenario references in all inline buttons
        const cleaned = remaining.map(s => {
          if (s.hasButtons && s.inlineButtons) {
            const nextButtons = s.inlineButtons.map(btn => ({
              ...btn,
              linkedScenarios: btn.linkedScenarios.filter(id => id !== scen.id)
            }));
            return { ...s, inlineButtons: nextButtons };
          }
          return s;
        });

        onUpdateBot({
          ...activeBot,
          scenarios: cleaned
        });
      }
    );
  };

  const handleUpdateScenario = (scenId: string, fields: Partial<Scenario>) => {
    const updatedScenarios = scenarios.map(s => {
      if (s.id === scenId) {
        return { ...s, ...fields };
      }
      return s;
    });
    onUpdateBot({
      ...activeBot,
      scenarios: updatedScenarios
    });
  };

  // Handle plan locks for checkboxes
  const handleCheckboxToggle = (scen: Scenario, key: 'hasKeyboard' | 'hasAlert' | 'hasInlineNotif' | 'hasButtons') => {
    const isActivating = !scen[key];

    if (isActivating) {
      if (selectedPlan === 'free') {
        // Free allows NO extras
        onOpenWarningModal('encode');
        return;
      }

      if (selectedPlan === 'encode') {
        // Encode allows hasKeyboard and hasAlert. Blocks hasInlineNotif & hasButtons
        if (key === 'hasInlineNotif' || key === 'hasButtons') {
          onOpenWarningModal('pro');
          return;
        }
      }
    }

    // Process valid toggles
    let updatedFields: Partial<Scenario> = { [key]: isActivating };

    // Auto-populate default elements if activating
    if (isActivating) {
      if (key === 'hasKeyboard') {
        updatedFields.keyboardButtons = [
          { text: 'Помощь', actionValue: 'Ответ' },
          { text: 'О нас', actionValue: 'Ответ' }
        ];
      } else if (key === 'hasButtons') {
        updatedFields.inlineButtons = [
          { text: 'Кнопка', actionType: 'text', actionValue: 'Действие', linkedScenarios: [] }
        ];
      }
    } else {
      // Clear data if deactivating
      if (key === 'hasKeyboard') updatedFields.keyboardButtons = [];
      else if (key === 'hasButtons') updatedFields.inlineButtons = [];
    }

    handleUpdateScenario(scen.id, updatedFields);
  };

  // Reply Keyboard manipulation
  const handleAddKeyboardButton = (scenId: string) => {
    const scen = scenarios.find(s => s.id === scenId);
    if (!scen) return;

    const updatedButtons = [
      ...scen.keyboardButtons,
      { text: 'Новая кнопка', actionValue: 'Ответ' }
    ];
    handleUpdateScenario(scenId, { keyboardButtons: updatedButtons });
  };

  const handleDeleteKeyboardButton = (scenId: string, index: number) => {
    const scen = scenarios.find(s => s.id === scenId);
    if (!scen) return;

    onShowConfirmDelete(
      'Удалить экранную кнопку?',
      'Вы действительно хотите удалить эту кнопку из экранного меню?',
      () => {
        const updatedButtons = scen.keyboardButtons.filter((_, idx) => idx !== index);
        handleUpdateScenario(scenId, { keyboardButtons: updatedButtons });
      }
    );
  };

  const handleUpdateKeyboardButton = (scenId: string, index: number, fields: Partial<KeyboardButton>) => {
    const scen = scenarios.find(s => s.id === scenId);
    if (!scen) return;

    const updatedButtons = scen.keyboardButtons.map((btn, idx) => {
      if (idx === index) return { ...btn, ...fields };
      return btn;
    });
    handleUpdateScenario(scenId, { keyboardButtons: updatedButtons });
  };

  // Inline buttons manipulation
  const handleAddInlineButton = (scenId: string) => {
    const scen = scenarios.find(s => s.id === scenId);
    if (!scen) return;

    const updatedButtons = [
      ...scen.inlineButtons,
      { text: 'Кнопка', actionType: 'text' as const, actionValue: 'Действие', linkedScenarios: [] }
    ];
    handleUpdateScenario(scenId, { inlineButtons: updatedButtons });
  };

  const handleDeleteInlineButton = (scenId: string, index: number) => {
    const scen = scenarios.find(s => s.id === scenId);
    if (!scen) return;

    onShowConfirmDelete(
      'Удалить встроенную кнопку?',
      'Вы действительно хотите удалить эту встроенную Inline-кнопку?',
      () => {
        const updatedButtons = scen.inlineButtons.filter((_, idx) => idx !== index);
        handleUpdateScenario(scenId, { inlineButtons: updatedButtons });
      }
    );
  };

  const handleUpdateInlineButton = (scenId: string, index: number, fields: Partial<InlineButton>) => {
    const scen = scenarios.find(s => s.id === scenId);
    if (!scen) return;

    const updatedButtons = scen.inlineButtons.map((btn, idx) => {
      if (idx === index) return { ...btn, ...fields };
      return btn;
    });
    handleUpdateScenario(scenId, { inlineButtons: updatedButtons });
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in" id="tab-editor">
      
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-clay/40 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onGoBack}
            className="p-2 border border-warm-clay hover:bg-warm-sand text-charcoal-dark rounded-xl transition-all flex items-center justify-center cursor-pointer"
            title="Назад к списку"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="space-y-0.5">
            <h2 className="font-serif italic text-2xl font-bold text-charcoal-dark">
              {activeBot.name || 'Редактор'}
            </h2>
            <p className="text-xs text-charcoal-light/60">
              Построение сценариев, клавиш и FSM переходов
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleShareProject}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm select-none ${
              shareCopied 
                ? 'bg-green-600 text-white' 
                : 'bg-warm-sand hover:bg-warm-clay/40 border border-warm-clay text-charcoal-dark'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${shareCopied ? 'text-white' : 'text-amber-gold'}`} />
            {shareCopied ? 'КОПИЯ СНЯТА!' : 'ПОДЕЛИ ТЕЛЕГРАМ ССЫЛКОЙ'}
          </button>

          <button
            onClick={handleAddScenario}
            className="px-5 py-2.5 bg-amber-gold hover:bg-deep-bronze text-white rounded-xl text-xs font-semibold tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            НОВЫЙ СЦЕНАРИЙ
          </button>
        </div>
      </div>

      {/* Scenarios Main Container list */}
      {scenarios.length === 0 ? (
        <div className="py-12 border border-dashed border-warm-clay rounded-2xl text-center space-y-4 max-w-md mx-auto">
          <Layers className="w-12 h-12 text-warm-clay mx-auto" />
          <div className="space-y-1">
            <h3 className="font-serif italic text-lg font-medium text-charcoal-dark">Сценарии пусты</h3>
            <p className="text-xs text-charcoal-light/60 max-w-xs mx-auto">
              Нажмите кнопку "+ Новый сценарий" выше, чтобы начать проектирование бота.
            </p>
          </div>
        </div>
      ) : (
        <div 
          id="scenarios-list-container"
          className="space-y-6"
        >
          {scenarios.map((scen, scenIdx) => (
            <div
              key={scen.id}
              className="bg-white border border-warm-clay rounded-2xl shadow-sm overflow-hidden animate-pop-in relative"
            >
              
              {/* Scenario Header with metadata and Delete button */}
              <div className="p-4 bg-warm-sand/75 border-b border-warm-clay/60 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-charcoal-light/40 font-semibold">
                    #{scenIdx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Hidden setting checkbox */}
                  <label className="flex items-center gap-1.5 text-xs text-charcoal-light/80 hover:text-charcoal-dark cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={scen.isUnique}
                      onChange={(e) => handleUpdateScenario(scen.id, { isUnique: e.target.checked })}
                      className="rounded border-warm-clay text-amber-gold focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="font-sans">Скрытый (только по ссылкам)</span>
                  </label>

                  <button
                    onClick={() => handleDeleteScenario(scen)}
                    className="p-1 text-charcoal-light/50 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Удалить сценарий"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scenario Core Form Fields */}
              <div className="p-5 space-y-5">
                
                <div className="grid gap-5 md:grid-cols-3">
                  {/* Trigger command name */}
                  <div className="space-y-1.5 md:col-span-1">
                    <div className="flex items-center gap-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal-light/60 block font-sans">
                        Триггер-команда
                      </label>
                      <button
                        type="button"
                        onClick={() => setGuideTopic('command')}
                        className="p-0.5 rounded-full hover:bg-warm-sand text-amber-gold hover:text-charcoal-dark transition-all cursor-pointer"
                        title="Интерактивный гид"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-charcoal-light/50 font-mono select-none">
                        /
                      </span>
                      <input
                        type="text"
                        value={scen.command}
                        onChange={(e) => handleUpdateScenario(scen.id, { command: e.target.value.replace(/[^a-zA-Z0-9_а-яА-Я]/g, '') })}
                        placeholder="start"
                        className="w-full bg-warm-sand/40 border border-warm-clay/80 focus:border-amber-gold rounded-xl pl-6 pr-3 py-2.5 text-xs font-mono font-bold text-deep-bronze outline-none outline-0"
                      />
                    </div>
                  </div>

                  {/* Response Text area */}
                  <div className="space-y-1.5 md:col-span-2">
                    <div className="flex items-center gap-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal-light/60 block font-sans">
                        Ответный Текст бота
                      </label>
                      <button
                        type="button"
                        onClick={() => setGuideTopic('responseText')}
                        className="p-0.5 rounded-full hover:bg-warm-sand text-amber-gold hover:text-charcoal-dark transition-all cursor-pointer"
                        title="Интерактивный гид"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      value={scen.responseText}
                      onChange={(e) => handleUpdateScenario(scen.id, { responseText: e.target.value })}
                      placeholder="Какое сообщение отправит бот..."
                      rows={1}
                      className="w-full bg-warm-sand/40 border border-warm-clay/80 focus:border-amber-gold rounded-xl px-4 py-2.5 text-xs font-sans text-charcoal-dark outline-none resize-y min-h-[38px]"
                    />
                  </div>
                </div>

                {/* Checklist Components */}
                <div className="border-t border-b border-warm-clay/40 py-4">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal-light/60 block font-sans mb-3">
                    Комплектующие сценария (Тарифные лимиты)
                  </label>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* hasKeyboard */}
                    <button
                      type="button"
                      onClick={() => handleCheckboxToggle(scen, 'hasKeyboard')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        scen.hasKeyboard 
                          ? 'bg-amber-gold/10 border-amber-gold text-amber-gold' 
                          : 'bg-warm-sand/20 border-warm-clay hover:bg-warm-sand text-charcoal-light'
                      }`}
                    >
                      <Keyboard className="w-4 h-4 shrink-0" />
                      <div className="truncate">
                        <div className="text-[11px] font-bold font-sans">Клавиатура</div>
                        <div className="text-[9px] opacity-70">Reply-меню</div>
                      </div>
                    </button>

                    {/* hasAlert */}
                    <button
                      type="button"
                      onClick={() => handleCheckboxToggle(scen, 'hasAlert')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        scen.hasAlert 
                          ? 'bg-amber-gold/10 border-amber-gold text-amber-gold' 
                          : 'bg-warm-sand/20 border-warm-clay hover:bg-warm-sand text-charcoal-light'
                      }`}
                    >
                      <Bell className="w-4 h-4 shrink-0" />
                      <div className="truncate">
                        <div className="text-[11px] font-bold font-sans">Системный Алерт</div>
                        <div className="text-[9px] opacity-70">Нативное окно</div>
                      </div>
                    </button>

                    {/* hasInlineNotif */}
                    <button
                      type="button"
                      onClick={() => handleCheckboxToggle(scen, 'hasInlineNotif')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        scen.hasInlineNotif 
                          ? 'bg-amber-gold/10 border-amber-gold text-amber-gold' 
                          : 'bg-warm-sand/20 border-warm-clay hover:bg-warm-sand text-charcoal-light'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <div className="truncate">
                        <div className="text-[11px] font-bold font-sans">Тост-уведомление</div>
                        <div className="text-[9px] opacity-70">Сплывашка PRO</div>
                      </div>
                    </button>

                    {/* hasButtons */}
                    <button
                      type="button"
                      onClick={() => handleCheckboxToggle(scen, 'hasButtons')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        scen.hasButtons 
                          ? 'bg-amber-gold/10 border-amber-gold text-amber-gold' 
                          : 'bg-warm-sand/20 border-warm-clay hover:bg-warm-sand text-charcoal-light'
                      }`}
                    >
                      <Link2 className="w-4 h-4 shrink-0" />
                      <div className="truncate">
                        <div className="text-[11px] font-bold font-sans">Инлайн-кнопки</div>
                        <div className="text-[9px] opacity-70">Под сообщением PRO</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Sub-panels with Transitions */}
                
                {/* 1. Reply Keyboard block (hasKeyboard) */}
                {scen.hasKeyboard && (
                  <div className="bg-warm-sand/40 border border-warm-clay rounded-xl p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-deep-bronze font-serif italic text-sm font-semibold">
                        <Keyboard className="w-4 h-4 text-amber-gold" />
                        <span>Экранное меню (Reply-Клавиатура)</span>
                        <button
                          type="button"
                          onClick={() => setGuideTopic('keyboard')}
                          className="p-0.5 rounded-full hover:bg-warm-sand text-amber-gold hover:text-charcoal-dark transition-all cursor-pointer"
                          title="Интерактивный гид по клавиатуре"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleAddKeyboardButton(scen.id)}
                        className="px-3 py-1 bg-charcoal-dark hover:bg-charcoal-light text-warm-cream rounded-lg text-[10px] font-sans font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Добавить кнопку
                      </button>
                    </div>

                    {scen.keyboardButtons.length === 0 ? (
                      <div className="py-4 text-center text-xs text-charcoal-light/50 italic">
                        Нет экранных кнопок. Нажмите кнопку выше для добавления.
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {scen.keyboardButtons.map((btn, bIdx) => (
                          <div 
                            key={bIdx}
                            className="bg-white border border-warm-clay p-3 rounded-lg flex flex-col gap-2 relative shadow-sm"
                          >
                            <button
                              type="button"
                              onClick={() => handleDeleteKeyboardButton(scen.id, bIdx)}
                              className="absolute top-2 right-2 text-charcoal-light/40 hover:text-red-600 p-0.5 hover:bg-red-50 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            {/* Button Text */}
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-bold tracking-wider text-charcoal-light/50 font-sans">Текст кнопки</span>
                              <input
                                type="text"
                                value={btn.text}
                                onChange={(e) => handleUpdateKeyboardButton(scen.id, bIdx, { text: e.target.value })}
                                className="w-full bg-warm-sand/30 border border-warm-clay/60 rounded px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-amber-gold"
                              />
                            </div>

                            {/* Button trigger action */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-charcoal-light/50 font-sans">Действие при клике</span>
                                <button
                                  type="button"
                                  onClick={() => onStartLinking(scen.id, bIdx, 'keyboard')}
                                  className="text-[9px] text-amber-gold hover:underline font-semibold flex items-center gap-0.5"
                                >
                                  <Target className="w-2.5 h-2.5" />
                                  Связать сценарий
                                </button>
                              </div>
                              <input
                                type="text"
                                value={btn.actionValue}
                                onChange={(e) => handleUpdateKeyboardButton(scen.id, bIdx, { actionValue: e.target.value })}
                                placeholder="Напишите текст или /команду"
                                className="w-full bg-warm-sand/30 border border-warm-clay/60 rounded px-2.5 py-1.5 text-xs font-mono outline-none focus:border-amber-gold text-deep-bronze"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Alert message field (hasAlert) */}
                {scen.hasAlert && (
                  <div className="bg-warm-sand/40 border border-warm-clay rounded-xl p-4 space-y-2 animate-fade-in">
                    <div className="flex items-center gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-light/60 font-sans flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-amber-gold" />
                        Текст системного всплывающего алерта
                      </label>
                      <button
                        type="button"
                        onClick={() => setGuideTopic('alerts')}
                        className="p-0.5 rounded-full hover:bg-warm-sand text-amber-gold hover:text-charcoal-dark transition-all cursor-pointer"
                        title="Интерактивный гид по алертам"
                      >
                        <HelpCircle className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={scen.alertText}
                      onChange={(e) => handleUpdateScenario(scen.id, { alertText: e.target.value })}
                      placeholder="Внимание!"
                      className="w-full bg-white border border-warm-clay/80 focus:border-amber-gold rounded-lg px-3.5 py-2 text-xs outline-none"
                    />
                  </div>
                )}

                {/* 3. Toast notifications field (hasInlineNotif) */}
                {scen.hasInlineNotif && (
                  <div className="bg-warm-sand/40 border border-warm-clay rounded-xl p-4 space-y-2 animate-fade-in">
                    <div className="flex items-center gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-light/60 font-sans flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-gold" />
                        Текст всплывающего тост-уведомления (PRO)
                      </label>
                      <button
                        type="button"
                        onClick={() => setGuideTopic('alerts')}
                        className="p-0.5 rounded-full hover:bg-warm-sand text-amber-gold hover:text-charcoal-dark transition-all cursor-pointer"
                        title="Интерактивный гид по тостам"
                      >
                        <HelpCircle className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={scen.inlineNotifText}
                      onChange={(e) => handleUpdateScenario(scen.id, { inlineNotifText: e.target.value })}
                      placeholder="Успешно сохранено!"
                      className="w-full bg-white border border-warm-clay/80 focus:border-amber-gold rounded-lg px-3.5 py-2 text-xs outline-none"
                    />
                  </div>
                )}

                {/* 4. Inline Buttons block (hasButtons) */}
                {scen.hasButtons && (
                  <div className="bg-warm-sand/40 border border-warm-clay rounded-xl p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-deep-bronze font-serif italic text-sm font-semibold">
                        <Link2 className="w-4 h-4 text-amber-gold" />
                        <span>Встроенные Inline-кнопки (под сообщением)</span>
                        <button
                          type="button"
                          onClick={() => setGuideTopic('inlineButtons')}
                          className="p-0.5 rounded-full hover:bg-warm-sand text-amber-gold hover:text-charcoal-dark transition-all cursor-pointer"
                          title="Интерактивный гид по инлайн-кнопкам"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleAddInlineButton(scen.id)}
                        className="px-3 py-1 bg-charcoal-dark hover:bg-charcoal-light text-warm-cream rounded-lg text-[10px] font-sans font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Добавить кнопку
                      </button>
                    </div>

                    {scen.inlineButtons.length === 0 ? (
                      <div className="py-4 text-center text-xs text-charcoal-light/50 italic">
                        Нет Inline-кнопок. Нажмите кнопку выше для добавления.
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {scen.inlineButtons.map((btn, bIdx) => (
                          <div 
                            key={bIdx}
                            className="bg-white border border-warm-clay p-3 rounded-lg flex flex-col gap-2.5 relative shadow-sm"
                          >
                            <button
                              type="button"
                              onClick={() => handleDeleteInlineButton(scen.id, bIdx)}
                              className="absolute top-2 right-2 text-charcoal-light/40 hover:text-red-600 p-0.5 hover:bg-red-50 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            {/* Button Text */}
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-bold tracking-wider text-charcoal-light/50 font-sans">Текст кнопки</span>
                              <input
                                type="text"
                                value={btn.text}
                                onChange={(e) => handleUpdateInlineButton(scen.id, bIdx, { text: e.target.value })}
                                className="w-full bg-warm-sand/30 border border-warm-clay/60 rounded px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-amber-gold"
                              />
                            </div>

                            {/* Click Action type selector */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-charcoal-light/50 font-sans">Тип клика</span>
                                <select
                                  value={btn.actionType}
                                  onChange={(e) => handleUpdateInlineButton(scen.id, bIdx, { actionType: e.target.value as 'text' | 'alert' })}
                                  className="w-full bg-warm-sand/30 border border-warm-clay/60 rounded px-2 py-1.5 text-[11px] font-sans outline-none focus:border-amber-gold"
                                >
                                  <option value="text">Ответ текстом</option>
                                  <option value="alert">Показать алерт</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-charcoal-light/50 font-sans">Значение действия</span>
                                <input
                                  type="text"
                                  value={btn.actionValue}
                                  onChange={(e) => handleUpdateInlineButton(scen.id, bIdx, { actionValue: e.target.value })}
                                  placeholder="Действие"
                                  className="w-full bg-warm-sand/30 border border-warm-clay/60 rounded px-2.5 py-1.5 text-xs outline-none focus:border-amber-gold"
                                />
                              </div>
                            </div>

                            {/* Linking transition scenario (PRO limit) */}
                            <div className="space-y-1.5 pt-1 border-t border-warm-clay/30">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-charcoal-light/50 font-sans">Связанный сценарий</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (selectedPlan !== 'pro') {
                                      onOpenWarningModal('pro');
                                    } else {
                                      onStartLinking(scen.id, bIdx, 'inline');
                                    }
                                  }}
                                  className="text-[9px] text-amber-gold hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Target className="w-2.5 h-2.5" />
                                  Связать сценарий
                                </button>
                              </div>

                              {btn.linkedScenarios && btn.linkedScenarios.length > 0 ? (
                                <div className="flex items-center justify-between bg-warm-sand/60 border border-warm-clay/60 rounded px-2 py-1.5">
                                  <span className="text-[10px] font-mono font-semibold text-deep-bronze truncate max-w-[150px]">
                                    /{scenarios.find(s => s.id === btn.linkedScenarios[0])?.command || 'untitled'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onUnlink(scen.id, bIdx, 'inline')}
                                    className="p-0.5 hover:bg-warm-clay/40 rounded text-charcoal-light/60 hover:text-red-600 transition-colors"
                                    title="Убрать связь"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="text-[10px] text-charcoal-light/40 italic pl-1">
                                  Связь не настроена
                                </div>
                              )}
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          ))}
        </div>
      )}

      {/* Workspace Footer Actions Bar (Emulator & Code generation) */}
      <div className="border-t border-warm-clay/40 pt-5 flex items-center justify-end gap-3 select-none">
        <button
          onClick={onOpenEmulator}
          className="px-5 py-3 bg-warm-sand hover:bg-warm-clay/50 border border-warm-clay rounded-xl text-xs font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer text-charcoal-dark shadow-sm"
        >
          <Play className="w-4 h-4 text-amber-gold shrink-0 fill-amber-gold" />
          ЭМУЛЯЦИЯ БОТА
        </button>
        <button
          onClick={onGenerateCode}
          className="px-6 py-3 bg-charcoal-dark hover:bg-charcoal-light text-warm-cream rounded-xl text-xs font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Code className="w-4 h-4 text-amber-gold shrink-0" />
          СГЕНЕРИРОВАТЬ КОД
        </button>
      </div>

    </div>

    {guideTopic && (
      <HelpGuideModal
        topic={guideTopic}
        onClose={() => setGuideTopic(null)}
      />
    )}
    </>
  );
}
