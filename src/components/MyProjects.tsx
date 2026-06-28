import React from 'react';
import { Bot } from '../types';
import { FolderPlus, Layers, CloudCheck, HardDrive, MoreVertical } from 'lucide-react';

interface MyProjectsProps {
  bots: Bot[];
  onSelectTab: (tab: 'bots' | 'create' | 'profile' | 'editor') => void;
  onSelectBotForContext: (bot: Bot) => void;
  onEditScenarios: (bot: Bot) => void;
}

export default function MyProjects({
  bots,
  onSelectTab,
  onSelectBotForContext,
  onEditScenarios,
}: MyProjectsProps) {
  
  // Russian word declension helper
  const getBotsCountBadgeText = (count: number): string => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod100 >= 11 && mod100 <= 19) {
      return `${count} проектов`;
    }
    if (mod10 === 1) {
      return `${count} проект`;
    }
    if (mod10 >= 2 && mod10 <= 4) {
      return `${count} проекта`;
    }
    return `${count} проектов`;
  };

  return (
    <div className="space-y-6 animate-fade-in" id="tab-bots">
      
      {/* Tab Heading & Stats Badge */}
      <div className="flex items-center justify-between border-b border-warm-clay/40 pb-4">
        <div className="space-y-1">
          <h2 className="font-serif italic text-2xl font-medium text-charcoal-dark">
            Мои проекты
          </h2>
          <p className="text-xs text-charcoal-light/60">
            Список ваших виртуальных ботов и сценариев
          </p>
        </div>
        
        <span 
          id="bots-count-badge"
          className="bg-warm-sand border border-warm-clay/80 px-4 py-1.5 rounded-full text-xs font-mono font-medium text-deep-bronze select-none"
        >
          {getBotsCountBadgeText(bots.length)}
        </span>
      </div>

      {/* Empty State Block */}
      {bots.length === 0 ? (
        <div className="bg-warm-sand/50 border border-dashed border-warm-clay/80 rounded-2xl p-8 text-center space-y-6 max-w-lg mx-auto my-8 animate-pop-in">
          <div className="w-16 h-16 rounded-full bg-warm-cream border border-warm-clay/60 flex items-center justify-center mx-auto text-amber-gold">
            <Layers className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif italic text-xl text-charcoal-dark font-medium">
              Здесь будут ваши творения
            </h3>
            <p className="text-sm text-charcoal-light/70 max-w-sm mx-auto leading-relaxed">
              Вы еще не создали ни одного проекта. Давайте добавим первого бота и наполним его сценариями за пару кликов!
            </p>
          </div>
          <button
            onClick={() => onSelectTab('create')}
            className="px-6 py-2.5 bg-charcoal-dark hover:bg-charcoal-light text-warm-cream rounded-xl text-xs font-medium transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            Создать первый проект
          </button>
        </div>
      ) : (
        /* Projects Grid list */
        <div 
          id="bots-list-container"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {bots.map((bot) => {
            const scenarioCount = bot.scenarios?.length || 0;
            return (
              <div
                key={bot.id}
                onClick={() => onSelectBotForContext(bot)}
                className="bg-white border border-warm-clay hover:border-amber-gold rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-44 cursor-pointer group relative overflow-hidden"
              >
                {/* Visual background accents */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-warm-sand rounded-bl-full opacity-10 -mr-6 -mt-6 group-hover:bg-amber-gold group-hover:opacity-10 transition-colors"></div>

                {/* Card Header & Context Button */}
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5 max-w-[85%]">
                    <h3 className="font-serif italic text-xl font-semibold text-charcoal-dark leading-tight truncate group-hover:text-deep-bronze transition-colors">
                      {bot.name || 'Без названия'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-charcoal-light/50 font-sans mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <span>Облачное сохранение настроено</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBotForContext(bot);
                    }}
                    className="p-1.5 rounded-lg hover:bg-warm-clay/40 transition-colors text-charcoal-light/70 hover:text-charcoal-dark"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Footer details */}
                <div className="border-t border-warm-clay/40 pt-3 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1 text-[11px] text-charcoal-light/70 font-mono font-medium">
                    <Layers className="w-3.5 h-3.5 text-amber-gold" />
                    <span>
                      {scenarioCount} {scenarioCount === 1 ? 'сценарий' : scenarioCount >= 2 && scenarioCount <= 4 ? 'сценария' : 'сценариев'}
                    </span>
                  </div>

                  <span className="text-[10px] text-amber-gold font-sans font-semibold tracking-wider group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Управление &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
