import React from 'react';
import { PlanType } from '../types';
import { ToggleLeft, ToggleRight, CreditCard, Sparkles, CheckCircle2, Star, Zap, ShieldCheck } from 'lucide-react';

interface MyProfileProps {
  animationsEnabled: boolean;
  onToggleAnimations: (enabled: boolean) => void;
  selectedPlan: PlanType;
  onChangePlan: (plan: PlanType) => void;
}

export default function MyProfile({
  animationsEnabled,
  onToggleAnimations,
  selectedPlan,
  onChangePlan,
}: MyProfileProps) {
  
  const plans = [
    {
      id: 'free' as PlanType,
      name: 'Free Classic',
      price: '0 звёзд/месяц',
      desc: 'Идеально для простых текстовых визиток и ознакомления с архитектурой.',
      features: [
        'Текстовые ответы на команды',
        'Неограниченное число проектов',
        'Интерактивный эмулятор',
        'Базовая генерация кода (aiogram 3.x)'
      ],
      icon: ShieldCheck,
      color: 'border-warm-clay'
    },
    {
      id: 'encode' as PlanType,
      name: 'Encode Developer',
      price: '150 звёзд/месяц',
      desc: 'Расширенный набор для разработчиков интерактивных меню.',
      features: [
        'Всё из плана Free',
        'Экранные Reply-меню клавиатур',
        'Нативные всплывающие Alert алерты',
        'Экспорт файлов конфигурации'
      ],
      icon: Zap,
      color: 'border-deep-bronze/50 hover:border-deep-bronze'
    },
    {
      id: 'pro' as PlanType,
      name: 'Architect PRO',
      price: '350 звёзд/месяц',
      desc: 'Полный безлимит на сложные сценарии с FSM переходами.',
      features: [
        'Всё из плана Encode',
        'Встроенные Inline-кнопки под постами',
        'Всплывающие Toast-уведомления',
        'PRO-переходы (Связать сценарий)',
        'Двухфазная отправка Dual-Markup'
      ],
      icon: Star,
      color: 'border-amber-gold/50 hover:border-amber-gold'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="tab-profile">
      
      {/* Tab Heading */}
      <div className="border-b border-warm-clay/40 pb-4">
        <h2 className="font-serif italic text-2xl font-medium text-charcoal-dark">
          Мой профиль
        </h2>
        <p className="text-xs text-charcoal-light/60">
          Управление настройками интерфейса и подписками
        </p>
      </div>

      {/* Settings Panel */}
      <div className="bg-white border border-warm-clay rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-serif italic text-lg text-charcoal-dark font-semibold flex items-center gap-2">
          Настройки интерфейса
        </h3>
        
        <div className="flex items-center justify-between p-4 bg-warm-sand rounded-xl border border-warm-clay/50">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-charcoal-dark">Анимации интерфейса</h4>
            <p className="text-xs text-charcoal-light/60">Включить плавные переходы между вкладками и оверлеями</p>
          </div>
          
          <button
            onClick={() => onToggleAnimations(!animationsEnabled)}
            className="focus:outline-none p-1 text-charcoal-dark hover:text-deep-bronze transition-colors cursor-pointer"
          >
            {animationsEnabled ? (
              <ToggleRight className="w-12 h-8 text-amber-gold" strokeWidth={1.5} />
            ) : (
              <ToggleLeft className="w-12 h-8 text-charcoal-light/50" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h3 className="font-serif italic text-2xl text-charcoal-dark font-medium flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-gold" />
            Тарифные планы
          </h3>
          <p className="text-xs text-charcoal-light/60">Выберите уровень функциональности под ваши задачи</p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p) => {
            const isActive = selectedPlan === p.id;
            const IconComponent = p.icon;
            
            return (
              <div
                key={p.id}
                onClick={() => onChangePlan(p.id)}
                className={`bg-white border-2 rounded-2xl p-6 transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden h-full ${
                  isActive 
                    ? 'border-amber-gold shadow-md scale-[1.02]' 
                    : 'border-warm-clay/70 hover:bg-warm-sand/30'
                }`}
              >
                {/* Active status ribbon banner */}
                {isActive && (
                  <div className="absolute top-0 right-0 bg-amber-gold text-charcoal-dark text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-bl-xl flex items-center gap-1 shadow-sm select-none">
                    <Sparkles className="w-3 h-3" />
                    Активен
                  </div>
                )}

                {/* Plan Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-amber-gold/15 text-amber-gold' : 'bg-warm-sand text-charcoal-light/70'}`}>
                      <IconComponent className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <h4 className="font-serif italic font-bold text-lg text-charcoal-dark">{p.name}</h4>
                  </div>

                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-charcoal-dark font-mono">{p.price}</div>
                    <p className="text-xs text-charcoal-light/70 leading-relaxed font-sans">{p.desc}</p>
                  </div>

                  {/* Divider line */}
                  <div className="border-t border-warm-clay/50 my-2"></div>

                  {/* Feature Checkpoints */}
                  <ul className="space-y-2.5">
                    {p.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs text-charcoal-light/90 font-sans leading-tight">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-amber-gold' : 'text-charcoal-light/40'}`} strokeWidth={2} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action feedback button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangePlan(p.id);
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase mt-6 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-amber-gold hover:bg-amber-gold/90 text-white shadow-md' 
                      : 'bg-warm-sand hover:bg-warm-clay/60 border border-warm-clay text-charcoal-dark'
                  }`}
                >
                  {isActive ? 'Текущий план' : 'Перейти'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
