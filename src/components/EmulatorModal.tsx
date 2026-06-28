import React, { useState, useEffect, useRef } from 'react';
import { Bot, Scenario, InlineButton, KeyboardButton, EmulatorMessage } from '../types';
import { Send, X, ArrowLeft, MessageSquare, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

interface EmulatorModalProps {
  isOpen: boolean;
  bot: Bot;
  onClose: () => void;
  animationsEnabled: boolean;
}

export default function EmulatorModal({
  isOpen,
  bot,
  onClose,
  animationsEnabled,
}: EmulatorModalProps) {
  if (!isOpen) return null;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<EmulatorMessage[]>([]);
  const [currentKeyboard, setCurrentKeyboard] = useState<KeyboardButton[]>([]);
  const [alertToShow, setAlertToShow] = useState<{ text: string; isToast: boolean } | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome messages
  useEffect(() => {
    const firstScenario = bot.scenarios[0];
    const initialMsgs: EmulatorMessage[] = [
      {
        id: 'sys-1',
        sender: 'system',
        text: `Эмулятор Телеграм-бота "${bot.name || 'Architect'}" запущен успешно.`,
        timestamp: getFormattedTime(),
      },
      {
        id: 'sys-2',
        sender: 'system',
        text: firstScenario 
          ? `Для старта введите /${firstScenario.command} или нажмите на кнопки ниже.`
          : 'Добавьте хотя бы один сценарий в конструктор, чтобы проверить симуляцию.',
        timestamp: getFormattedTime(),
      }
    ];

    setMessages(initialMsgs);
    setCurrentKeyboard([]);
    setActiveScenarioId(null);
  }, [bot]);

  // Autoscroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function getFormattedTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Find scenario by typing command
  const findScenarioByCommand = (cmd: string): Scenario | null => {
    const cleanCmd = cmd.trim().toLowerCase().replace(/^\//, '');
    return bot.scenarios.find(s => s.command.trim().toLowerCase() === cleanCmd) || null;
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: EmulatorMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: getFormattedTime(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Async Bot Reply simulation
    setTimeout(() => {
      // 1. First, check if input matches a scenario trigger directly
      let matchedScenario = findScenarioByCommand(textToSend);

      // 2. If no direct command matched, check if we have a state-dependent Reply keyboard button that triggers an FSM transition
      if (!matchedScenario && activeScenarioId) {
        const currentScen = bot.scenarios.find(s => s.id === activeScenarioId);
        if (currentScen?.hasKeyboard && currentScen.keyboardButtons) {
          const btn = currentScen.keyboardButtons.find(b => b.text.trim().toLowerCase() === textToSend.trim().toLowerCase());
          if (btn && btn.actionValue.startsWith('/')) {
            matchedScenario = findScenarioByCommand(btn.actionValue);
          }
        }
      }

      if (matchedScenario) {
        setActiveScenarioId(matchedScenario.id);

        // Simulated Toast Notifications or Alerts
        if (matchedScenario.hasAlert && matchedScenario.alertText) {
          setAlertToShow({ text: matchedScenario.alertText, isToast: false });
        } else if (matchedScenario.hasInlineNotif && matchedScenario.inlineNotifText) {
          setAlertToShow({ text: matchedScenario.inlineNotifText, isToast: true });
        }

        const botMsg: EmulatorMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: matchedScenario.responseText || 'Ответ не задан',
          timestamp: getFormattedTime(),
          inlineButtons: matchedScenario.hasButtons ? matchedScenario.inlineButtons : undefined
        };

        setMessages(prev => [...prev, botMsg]);

        if (matchedScenario.hasKeyboard && matchedScenario.keyboardButtons.length > 0) {
          setCurrentKeyboard(matchedScenario.keyboardButtons);
        } else {
          setCurrentKeyboard([]);
        }

      } else {
        // Fallback for custom texts
        const fallbackMsg: EmulatorMessage = {
          id: `bot-fallback-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ Сценарий для команды "${textToSend}" не найден в этом проекте.\n\nЗарегистрированные сценарии: ${
            bot.scenarios.map(s => `/${s.command}`).join(', ') || 'нет сценариев'
          }`,
          timestamp: getFormattedTime(),
        };
        setMessages(prev => [...prev, fallbackMsg]);
      }
    }, 450);
  };

  const handleInlineClick = (btn: InlineButton) => {
    // 1. Print system log
    const logMsg: EmulatorMessage = {
      id: `sys-click-${Date.now()}`,
      sender: 'system',
      text: `[Клик по Inline-кнопке: "${btn.text}"]`,
      timestamp: getFormattedTime(),
    };
    setMessages(prev => [...prev, logMsg]);

    // 2. If has linked scenario, trigger command transit!
    if (btn.linkedScenarios && btn.linkedScenarios.length > 0) {
      const targetScenId = btn.linkedScenarios[0];
      const targetScen = bot.scenarios.find(s => s.id === targetScenId);
      if (targetScen) {
        handleSendMessage(`/${targetScen.command}`);
        return;
      }
    }

    // 3. Fallback to Action values
    if (btn.actionType === 'alert') {
      setAlertToShow({ text: btn.actionValue || 'Алерт действия', isToast: false });
    } else {
      setTimeout(() => {
        const botReply: EmulatorMessage = {
          id: `bot-action-${Date.now()}`,
          sender: 'bot',
          text: btn.actionValue || 'Действие выполнено',
          timestamp: getFormattedTime(),
        };
        setMessages(prev => [...prev, botReply]);
      }, 300);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 backdrop-blur-2xl p-0 md:p-4 animate-fade-in select-none"
      id="modal-emulator"
    >
      <div className="bg-[#181a20]/95 backdrop-blur-xl border-0 md:border md:border-white/10 w-full max-w-md h-full md:h-[90vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-pop-in relative">
        
        {/* Telegram Header */}
        <div className="bg-[#242936] text-white p-4 flex items-center gap-3 shrink-0 shadow-md">
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-warm-sand"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          
          <div className="w-10 h-10 rounded-full bg-amber-gold flex items-center justify-center text-charcoal-dark font-serif font-bold italic border border-white/20">
            {bot.name ? bot.name.substring(0, 2).toUpperCase() : 'AR'}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{bot.name || 'Telegram Bot'}</h4>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-[11px] text-green-400 font-medium">в сети (симулятор)</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-sans border border-white/10 transition-colors"
          >
            Закрыть
          </button>
        </div>

        {/* Alerts and Toast Simulation */}
        {alertToShow && (
          <div className="absolute top-16 inset-x-0 z-[110] p-4 flex justify-center animate-fade-in">
            {alertToShow.isToast ? (
              // Inline Notification Toast style
              <div className="bg-charcoal-dark/95 border border-amber-gold/30 text-warm-cream px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 max-w-[90%] animate-pop-in">
                <Sparkles className="w-4 h-4 text-amber-gold shrink-0" />
                <span className="text-xs font-sans">{alertToShow.text}</span>
                <button 
                  onClick={() => setAlertToShow(null)}
                  className="ml-2 text-warm-clay hover:text-white text-xs underline cursor-pointer"
                >
                  OK
                </button>
              </div>
            ) : (
              // Alert popup styled dialog
              <div className="bg-warm-cream border border-warm-clay rounded-2xl p-5 shadow-2xl w-5/6 max-w-sm flex flex-col items-center text-center space-y-4 animate-pop-in">
                <div className="w-10 h-10 rounded-full bg-amber-gold/10 flex items-center justify-center text-amber-gold border border-amber-gold/20 shrink-0">
                  <ShieldAlert className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <h5 className="font-serif italic font-semibold text-charcoal-dark text-base">Сообщение системы</h5>
                  <p className="text-xs text-charcoal-light/90 leading-relaxed font-sans px-2">{alertToShow.text}</p>
                </div>
                <button
                  onClick={() => setAlertToShow(null)}
                  className="w-full py-2 bg-charcoal-dark text-warm-cream rounded-xl text-xs hover:bg-charcoal-light transition-all shadow font-medium cursor-pointer"
                >
                  Хорошо
                </button>
              </div>
            )}
          </div>
        )}

        {/* Chat Canvas (Telegram Wallpaper Style background) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col bg-[#11141c] custom-scrollbar relative">
          
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none mix-blend-overlay flex flex-wrap justify-around items-around overflow-hidden">
            {/* Background vector simulation */}
            {Array.from({ length: 40 }).map((_, i) => (
              <MessageSquare key={i} className="w-16 h-16 text-warm-cream rotate-12" />
            ))}
          </div>

          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="mx-auto bg-[#1e232e] text-warm-clay/80 border border-warm-clay/10 text-[11px] px-3 py-1.5 rounded-full text-center max-w-[85%] font-sans select-none shadow-sm">
                  {msg.text}
                </div>
              );
            }

            const isBot = msg.sender === 'bot';
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[82%] ${isBot ? 'self-start' : 'self-end'}`}
              >
                {/* Bubble Container */}
                <div 
                  className={`p-3.5 rounded-2xl shadow-md flex flex-col space-y-1.5 relative ${
                    isBot 
                      ? 'bg-[#212733] border border-warm-clay/5 text-warm-cream rounded-bl-none' 
                      : 'bg-[#846f53] text-warm-cream rounded-br-none'
                  }`}
                >
                  <p className="text-sm font-sans break-words whitespace-pre-wrap select-text leading-relaxed">
                    {msg.text}
                  </p>
                  <span className="text-[10px] opacity-50 self-end select-none font-mono">
                    {msg.timestamp}
                  </span>
                </div>

                {/* Inline buttons rendering right below the bubble */}
                {isBot && msg.inlineButtons && msg.inlineButtons.length > 0 && (
                  <div className="grid grid-cols-2 gap-1.5 mt-2 max-w-full">
                    {msg.inlineButtons.map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleInlineClick(btn)}
                        className="p-2.5 bg-[#2a303e] hover:bg-[#343b4c] text-warm-cream rounded-xl text-xs font-sans font-medium text-center border border-white/5 truncate transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                        title={btn.text}
                      >
                        {btn.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Telegram Keyboard Panels */}
        <div className="bg-[#242936] border-t border-[#2e3444] shrink-0 p-3 space-y-3 z-10 shadow-inner">
          
          {/* Reply Keyboard Area */}
          {currentKeyboard && currentKeyboard.length > 0 && (
            <div className="p-2 bg-[#1b202a] rounded-xl border border-white/5 space-y-2">
              <div className="text-[10px] text-warm-clay/40 font-mono tracking-wider uppercase pl-1 select-none flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-gold" />
                Reply-клавиатура бота
              </div>
              <div className="grid grid-cols-2 gap-2">
                {currentKeyboard.map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(btn.text)}
                    className="py-2.5 bg-[#2d3345] hover:bg-[#383f55] border border-white/5 rounded-lg text-xs font-semibold text-warm-cream text-center transition-all shadow active:scale-95 cursor-pointer truncate px-2"
                  >
                    {btn.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Typing Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Введите сообщение или /команду..."
              className="flex-1 bg-[#1a1e28] text-warm-cream border border-[#2e3444] focus:border-amber-gold rounded-xl px-4 py-3 text-xs outline-none transition-colors font-sans"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                input.trim() 
                  ? 'bg-amber-gold hover:bg-amber-gold/90 text-charcoal-dark cursor-pointer' 
                  : 'bg-[#1a1e28] text-warm-clay/30 border border-[#2e3444] cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" strokeWidth={2} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
