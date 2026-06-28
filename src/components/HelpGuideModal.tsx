import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Info, HelpCircle, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export interface HelpGuideStep {
  title: string;
  description: string;
  illustration: React.ReactNode;
}

export type HelpGuideTopic = 'command' | 'responseText' | 'keyboard' | 'alerts' | 'inlineButtons';

interface HelpGuideModalProps {
  topic: HelpGuideTopic;
  onClose: () => void;
}

export default function HelpGuideModal({ topic, onClose }: HelpGuideModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const getGuideSteps = (): HelpGuideStep[] => {
    switch (topic) {
      case 'command':
        return [
          {
            title: 'Что такое Триггер-команда?',
            description: 'Каждое действие вашего бота начинается со стартовой команды или ключевого слова. В Telegram они всегда начинаются со слэша / (например, /start или /menu).',
            illustration: (
              <div className="flex flex-col items-center justify-center p-6 bg-warm-sand/40 border border-warm-clay/40 rounded-2xl w-full">
                <div className="bg-white border border-warm-clay px-4 py-2 rounded-xl font-mono text-xs text-deep-bronze font-bold shadow-sm">
                  /start
                </div>
                <div className="h-4 border-l border-dashed border-warm-clay/60 my-2"></div>
                <div className="bg-[#242936] text-white text-[10px] px-3.5 py-2 rounded-xl shadow-sm">
                  Привет! Рад вас видеть 👋
                </div>
              </div>
            )
          },
          {
            title: 'Как это работает на сервере?',
            description: 'На языке Python под капотом создается декоратор @dp.message(Command("ваша_команда")). Бот слушает сообщения пользователей в реальном времени и сопоставляет их с вашими условиями.',
            illustration: (
              <div className="p-4 bg-charcoal-dark text-warm-cream rounded-xl font-mono text-[10px] w-full border border-white/10 space-y-1">
                <p className="text-amber-gold/90">@dp.message(Command("start"))</p>
                <p className="text-blue-300">async def cmd_start(message: Message):</p>
                <p className="pl-4 text-emerald-300">await message.answer("Привет!...")</p>
              </div>
            )
          },
          {
            title: 'Советы по проектированию',
            description: 'Делайте триггеры короткими, понятными на латинице (например: start, help, order, catalog). Вы также можете использовать русские слова для кнопок, которые ведут на этот сценарий.',
            illustration: (
              <div className="grid grid-cols-2 gap-2 w-full text-center">
                <div className="p-2.5 bg-green-50/50 border border-green-200 rounded-xl text-green-800 text-xs font-semibold">
                  ✓ catalog
                </div>
                <div className="p-2.5 bg-red-50/50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold">
                  ✗ каталог_товаров_2026
                </div>
              </div>
            )
          }
        ];

      case 'responseText':
        return [
          {
            title: 'Форматирование Текста ответа',
            description: 'Это сообщение, которое бот отправляет пользователю. Telegram поддерживает красивый насыщенный текст, эмодзи и разметку Markdown для выделения ключевых мыслей.',
            illustration: (
              <div className="p-4 bg-warm-sand/40 border border-warm-clay/40 rounded-xl w-full space-y-2">
                <div className="text-[11px] text-charcoal-light/70 font-mono">
                  Привет, *Имя*! 🌟 Вот наш **прайс-лист**:
                </div>
                <div className="text-xs font-medium text-charcoal-dark pl-2 border-l-2 border-amber-gold">
                  Привет, <span className="font-bold">Имя</span>! 🌟 Вот наш <span className="font-bold">прайс-лист</span>:
                </div>
              </div>
            )
          },
          {
            title: 'Персонализация',
            description: 'Вы можете использовать HTML или Markdown разметку. В коде на aiogram текст будет автоматически обернут в безопасные кавычки.',
            illustration: (
              <div className="p-4 bg-charcoal-dark text-warm-cream rounded-xl font-mono text-[10px] w-full border border-white/10 space-y-1">
                <p className="text-emerald-300"># aiogram v3 HTML mode</p>
                <p className="text-white">await message.answer(<span className="text-amber-gold">"Привет, &lt;b&gt;бро&lt;/b&gt;!"</span>)</p>
              </div>
            )
          }
        ];

      case 'keyboard':
        return [
          {
            title: 'Постоянная Reply-клавиатура',
            description: 'Эта клавиатура закрепляется внизу экрана у пользователя. Она идеальна для основного меню, так как кнопки всегда под рукой и не теряются при прокрутке чата.',
            illustration: (
              <div className="bg-warm-sand/40 border border-warm-clay/40 rounded-xl p-4 w-full flex flex-col gap-2">
                <div className="bg-white/95 rounded-lg p-2.5 border border-warm-clay/60 shadow-sm text-center text-xs font-semibold text-charcoal-dark cursor-default">
                  🛍️ Каталог товаров
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/95 rounded-lg p-2 border border-warm-clay/60 shadow-sm text-center text-[10px] font-semibold text-charcoal-dark">
                    📞 Контакты
                  </div>
                  <div className="bg-white/95 rounded-lg p-2 border border-warm-clay/60 shadow-sm text-center text-[10px] font-semibold text-charcoal-dark">
                    ⚙️ Настройки
                  </div>
                </div>
              </div>
            )
          },
          {
            title: 'Как устроена связь?',
            description: 'Вы можете привязать к любой экранной кнопке команду. Когда пользователь нажимает кнопку "Помощь", его клиент отправляет боту текст "/help", активируя соответствующий сценарий.',
            illustration: (
              <div className="flex items-center justify-around w-full">
                <div className="bg-white border border-warm-clay px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
                  ℹ️ О нас
                </div>
                <ArrowRight className="w-4 h-4 text-amber-gold animate-pulse" />
                <div className="bg-charcoal-dark text-warm-cream font-mono text-[10px] px-3 py-1.5 rounded-lg">
                  /about
                </div>
              </div>
            )
          }
        ];

      case 'alerts':
        return [
          {
            title: 'Системные оповещения',
            description: 'Когда пользователь нажимает встроенную (Inline) кнопку, бот может прислать системное сообщение. Нативный алерт прерывает работу и требует нажатия кнопки "ОК".',
            illustration: (
              <div className="bg-black/10 rounded-xl p-4 w-full flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg border border-warm-clay p-4 max-w-[200px] text-center space-y-3">
                  <p className="text-xs font-sans font-bold text-charcoal-dark">Внимание!</p>
                  <p className="text-[10px] text-charcoal-light leading-snug">Ваша подписка успешно продлена.</p>
                  <div className="border-t border-warm-clay/60 pt-2 text-center text-[11px] font-bold text-amber-gold cursor-pointer">
                    OK
                  </div>
                </div>
              </div>
            )
          },
          {
            title: 'Всплывающие Тосты (Toast)',
            description: 'Более легкий вариант — всплывающее тост-уведомление вверху экрана Telegram. Оно исчезает само через 2 секунды, не отвлекая пользователя.',
            illustration: (
              <div className="relative h-24 bg-black/10 rounded-xl p-4 w-full flex flex-col items-center justify-start">
                <div className="bg-charcoal-dark/95 text-warm-cream border border-amber-gold/30 px-3 py-1.5 rounded-lg text-[10px] font-sans flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3 h-3 text-amber-gold" />
                  Успешно куплено!
                </div>
              </div>
            )
          }
        ];

      case 'inlineButtons':
        return [
          {
            title: 'Инлайн-кнопки (под сообщением)',
            description: 'Кнопки, которые "прилипают" к самому сообщению. Они выглядят чрезвычайно технологично и могут мгновенно переключать сценарии (FSM-состояния) прямо внутри одного чата без спама командами.',
            illustration: (
              <div className="bg-warm-sand/40 border border-warm-clay/40 rounded-xl p-4 w-full space-y-3">
                <div className="bg-white/80 border border-warm-clay/40 p-2 rounded-lg text-center text-[10px] text-charcoal-light">
                  Выберите способ оплаты:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#242936] text-white rounded-lg p-2 text-center text-[10px] font-bold shadow-sm">
                    ⭐ Звёздами
                  </div>
                  <div className="bg-[#242936] text-white rounded-lg p-2 text-center text-[10px] font-bold shadow-sm">
                    💳 Картой
                  </div>
                </div>
              </div>
            )
          },
          {
            title: 'Продвинутый FSM переход',
            description: 'В Архитекте PRO вы можете связать инлайн-кнопку с другим скрытым сценарием. При клике на кнопку интерфейс обновится, показывая новый шаг, словно это мобильное приложение.',
            illustration: (
              <div className="flex items-center justify-between w-full text-center">
                <div className="p-2 bg-white border border-warm-clay rounded-lg text-[10px] font-bold">
                  [ Купить ]
                </div>
                <div className="h-0.5 flex-1 bg-dashed border-t border-warm-clay/80 mx-2 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-gold text-white text-[8px] px-1 rounded">PRO</div>
                </div>
                <div className="p-2 bg-white border border-amber-gold rounded-lg text-[10px] font-bold text-amber-gold">
                  /payment_screen
                </div>
              </div>
            )
          }
        ];

      default:
        return [];
    }
  };

  const steps = getGuideSteps();
  const current = steps[currentStep] || { title: '', description: '', illustration: null };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/35 backdrop-blur-2xl p-4 animate-fade-in"
      id={`modal-guide-${topic}`}
    >
      <div className="bg-white/90 backdrop-blur-2xl border border-white/60 w-full max-w-md rounded-2xl shadow-2xl animate-pop-in overflow-hidden flex flex-col relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-charcoal-light/60 hover:text-charcoal-dark hover:bg-warm-sand transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Area */}
        <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col">
          
          {/* Header & Page counter */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-gold tracking-widest uppercase font-mono">
              ИНТЕРАКТИВНЫЙ ГИД • ШАГ {currentStep + 1} ИЗ {steps.length}
            </span>
            <h3 className="font-serif italic text-xl font-bold text-charcoal-dark tracking-tight">
              {current.title}
            </h3>
          </div>

          {/* Liquid-feeling illustration view with slow smooth CSS transition */}
          <div className="flex-1 flex items-center justify-center min-h-[140px] py-4">
            <div className="w-full transform transition-all duration-500 ease-out scale-100 opacity-100">
              {current.illustration}
            </div>
          </div>

          {/* Description Text */}
          <p className="text-xs text-charcoal-light/80 leading-relaxed font-medium">
            {current.description}
          </p>

          {/* Step Indicator Bubbles */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {steps.map((_, idx) => (
              <span 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-5 bg-amber-gold' : 'w-1.5 bg-warm-clay/40'
                }`}
              />
            ))}
          </div>

          {/* Wizard Controls */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-warm-clay/20 select-none">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentStep === 0 
                  ? 'text-charcoal-light/20 cursor-not-allowed' 
                  : 'text-charcoal-light hover:text-charcoal-dark hover:bg-warm-sand cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Назад
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-charcoal-dark hover:bg-charcoal-light text-warm-cream rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {currentStep === steps.length - 1 ? 'Понятно!' : 'Далее'}
              <ChevronRight className="w-4 h-4 text-amber-gold" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
