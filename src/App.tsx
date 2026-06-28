import React, { useState, useEffect } from 'react';
import { Bot, Scenario, InlineButton, KeyboardButton, PlanType, TabType, AppState, EmulatorMessage } from './types';
import Header from './components/Header';
import MyProjects from './components/MyProjects';
import CreateBot from './components/CreateBot';
import MyProfile from './components/MyProfile';
import ScenarioEditor from './components/ScenarioEditor';
import BotContextSheet from './components/BotContextSheet';
import ConfirmModal from './components/ConfirmModal';
import WarningModal from './components/WarningModal';
import LinkScenarioModal from './components/LinkScenarioModal';
import EmulatorModal from './components/EmulatorModal';
import CodeViewModal from './components/CodeViewModal';
import { generateTelegramCode } from './utils/codeGenerator';

// Lucide icons
import { Layers, FolderPlus, User, Sliders } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'architect_bots_state_v1';

export default function App() {
  // --- 1. React States mapped directly to appState specifications ---
  const [currentTab, setCurrentTab] = useState<TabType>('bots');
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro'); // Set 'pro' as default to give premium features by default
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [activeBot, setActiveBot] = useState<Bot | null>(null);
  
  // Linking scenario variables
  const [linkingTargetScenarioId, setLinkingTargetScenarioId] = useState<string | null>(null);
  const [linkingTargetButtonIndex, setLinkingTargetButtonIndex] = useState<number | null>(null);
  const [linkingType, setLinkingType] = useState<'inline' | 'keyboard' | null>(null);

  // Modal open states
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isEmulatorOpen, setIsEmulatorOpen] = useState(false);
  const [isCodeViewOpen, setIsCodeViewOpen] = useState(false);

  // Modal arguments
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);
  
  const [warningRequiredPlan, setWarningRequiredPlan] = useState<'encode' | 'pro'>('pro');
  const [generatedCode, setGeneratedCode] = useState('');

  // --- 2. Initial State Loading & Storage Sync ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.bots)) {
          setBots(parsed.bots);
        }
        if (parsed.selectedPlan) {
          setSelectedPlan(parsed.selectedPlan);
        }
        if (typeof parsed.animationsEnabled === 'boolean') {
          setAnimationsEnabled(parsed.animationsEnabled);
        }
      } else {
        // Hydrate with premium sample bot to make initial user exploration fantastic!
        const sampleBot: Bot = {
          id: 'bot_sample',
          name: 'PremiumShopBot',
          scenarios: [
            {
              id: 'scen_start',
              command: 'start',
              responseText: '✨ Добро пожаловать в бутик-ателье Architect!\n\nМы создаем эксклюзивные Telegram-интерфейсы. Выберите нужный раздел ниже:',
              isUnique: false,
              hasKeyboard: true,
              keyboardButtons: [
                { text: '🛍️ Каталог', actionValue: '/catalog' },
                { text: '📞 Контакты', actionValue: '/contacts' }
              ],
              hasAlert: false,
              alertText: 'Внимание!',
              hasInlineNotif: false,
              inlineNotifText: 'Успешно!',
              hasButtons: false,
              inlineButtons: []
            },
            {
              id: 'scen_catalog',
              command: 'catalog',
              responseText: '🎁 НАШИ БЕСТСЕЛЛЕРЫ:\n\n1. Швейцарские часы Chrono - 120,000₽\n2. Кожаный органайзер Grand - 15,000₽\n\nВыберите категорию для перехода:',
              isUnique: false,
              hasKeyboard: false,
              keyboardButtons: [],
              hasAlert: false,
              alertText: 'Внимание!',
              hasInlineNotif: false,
              inlineNotifText: 'Успешно!',
              hasButtons: true,
              inlineButtons: [
                { text: 'Заказать часы ⌚', actionType: 'alert', actionValue: 'Вы выбрали швейцарские часы. С вами свяжется менеджер в течение 5 минут!', linkedScenarios: [] },
                { text: 'Назад в меню ↩️', actionType: 'text', actionValue: '/start', linkedScenarios: ['scen_start'] }
              ]
            },
            {
              id: 'scen_contacts',
              command: 'contacts',
              responseText: '📍 НАШИ КОНТАКТЫ:\n\nМосква, ул. Пречистенка, д. 12\nТелефон: +7 (495) 000-00-00\n\nНажмите "Вызов" для отправки сигнала менеджеру.',
              isUnique: false,
              hasKeyboard: true,
              keyboardButtons: [
                { text: 'Главное меню ↩️', actionValue: '/start' }
              ],
              hasAlert: false,
              alertText: 'Внимание!',
              hasInlineNotif: false,
              inlineNotifText: 'Успешно!',
              hasButtons: true,
              inlineButtons: [
                { text: '🔔 Вызвать менеджера', actionType: 'text', actionValue: 'Менеджер оповещен. Ожидайте!', linkedScenarios: [] }
              ]
            }
          ]
        };
        setBots([sampleBot]);
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
  }, []);

  // Handle shared bot import via query parameter
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const importData = urlParams.get('importBot');
      if (importData) {
        // Decode base64 securely supporting unicode
        const decodedJson = decodeURIComponent(escape(atob(importData)));
        const parsed = JSON.parse(decodedJson);
        if (parsed && typeof parsed.name === 'string' && Array.isArray(parsed.scenarios)) {
          // Check if this bot is already imported
          const botId = 'bot_' + Date.now();
          const newBot: Bot = {
            id: botId,
            name: (parsed.name || 'Импортированный бот').substring(0, 32),
            scenarios: parsed.scenarios
          };
          
          // Clear query parameter so it doesn't re-import on refresh
          const newUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          
          // Add to bots list and open it directly
          setBots(prev => {
            let finalName = newBot.name;
            if (prev.some(b => b.name === finalName)) {
              finalName = `${finalName} (Копия)`;
            }
            return [...prev, { ...newBot, name: finalName }];
          });
          setActiveBot({ ...newBot });
          setCurrentTab('editor');
          
          // Small success toast alert
          alert(`Проект "${newBot.name}" успешно импортирован по ссылке!`);
        }
      }
    } catch (err) {
      console.error('Failed to import bot from query parameter', err);
    }
  }, []);

  // Sync to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          bots,
          selectedPlan,
          animationsEnabled,
        })
      );
    } catch (e) {
      console.error('Error writing state to localStorage:', e);
    }
  }, [bots, selectedPlan, animationsEnabled]);

  // Handle animation mode global classes
  useEffect(() => {
    if (animationsEnabled) {
      document.body.classList.remove('no-transitions');
    } else {
      document.body.classList.add('no-transitions');
    }
  }, [animationsEnabled]);

  // --- 3. Custom Callbacks & App logic functions ---

  const handleAddBot = (newBot: Bot) => {
    setBots((prev) => [...prev, newBot]);
  };

  const handleUpdateBot = (updatedBot: Bot) => {
    // If we are updating the active bot currently in editing view
    if (activeBot && activeBot.id === updatedBot.id) {
      setActiveBot(updatedBot);
    }
    // Update in global bots list
    setBots((prev) =>
      prev.map((b) => (b.id === updatedBot.id ? updatedBot : b))
    );
  };

  const handleOpenBotContext = (bot: Bot) => {
    setSelectedBot(bot);
    setIsContextOpen(true);
  };

  const handleRenameBot = (botId: string, newName: string) => {
    setBots((prev) =>
      prev.map((b) => (b.id === botId ? { ...b, name: newName } : b))
    );
  };

  const handleCloneBot = (bot: Bot) => {
    const duplicatedBot: Bot = {
      ...bot,
      id: 'bot_clone_' + Date.now(),
      name: `${bot.name} (Копия)`,
      scenarios: bot.scenarios ? bot.scenarios.map(s => ({
        ...s,
        id: 'scen_clone_' + Math.floor(Math.random() * 100000) + '_' + Date.now(),
        // Clone buttons arrays
        keyboardButtons: s.keyboardButtons ? [...s.keyboardButtons] : [],
        inlineButtons: s.inlineButtons ? [...s.inlineButtons] : []
      })) : []
    };
    handleAddBot(duplicatedBot);
  };

  const handleDeleteBot = (botId: string, botName: string) => {
    showCustomConfirm(
      'Удалить проект бота?',
      `Вы действительно хотите безвозвратно удалить проект "${botName}"? Это действие сотрет все сценарии, и его нельзя будет отменить.`,
      () => {
        setBots((prev) => prev.filter((b) => b.id !== botId));
        if (activeBot && activeBot.id === botId) {
          setActiveBot(null);
          setCurrentTab('bots');
        }
      }
    );
  };

  const handleEditScenarios = (bot: Bot) => {
    setActiveBot(bot);
    setCurrentTab('editor');
  };

  const handleExitEditor = () => {
    if (activeBot) {
      // Save changes back
      handleUpdateBot(activeBot);
    }
    setActiveBot(null);
    setCurrentTab('bots');
  };

  // --- 4. Custom Modal triggerers ---

  const showCustomConfirm = (title: string, msg: string, callback: () => void) => {
    setConfirmTitle(title);
    setConfirmMsg(msg);
    setConfirmCallback(() => callback);
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    if (confirmCallback) {
      confirmCallback();
    }
    setIsConfirmOpen(false);
    setConfirmCallback(null);
  };

  const handleOpenWarningModal = (requiredPlan: 'encode' | 'pro') => {
    setWarningRequiredPlan(requiredPlan);
    setIsWarningOpen(true);
  };

  const handleUpgradePlan = () => {
    // Elevate subscription level to required tier
    setSelectedPlan(warningRequiredPlan);
    setIsWarningOpen(false);
  };

  // --- 5. POINT-AND-CLICK SCENARIO LINKING ENGINE ---

  const handleStartLinking = (scenId: string, btnIdx: number, type: 'inline' | 'keyboard') => {
    setLinkingTargetScenarioId(scenId);
    setLinkingTargetButtonIndex(btnIdx);
    setLinkingType(type);
    setIsLinkOpen(true);
  };

  const handleSelectScenarioToLink = (targetScenario: Scenario) => {
    if (!activeBot || !linkingTargetScenarioId || linkingTargetButtonIndex === null || !linkingType) return;

    const targetCmd = `/${targetScenario.command}`;

    const updatedScenarios = activeBot.scenarios.map((s) => {
      if (s.id === linkingTargetScenarioId) {
        if (linkingType === 'keyboard') {
          const nextButtons = s.keyboardButtons.map((btn, idx) => {
            if (idx === linkingTargetButtonIndex) {
              return { ...btn, actionValue: targetCmd };
            }
            return btn;
          });
          return { ...s, keyboardButtons: nextButtons };
        } else {
          // Inline button linking (PRO feature)
          const nextButtons = s.inlineButtons.map((btn, idx) => {
            if (idx === linkingTargetButtonIndex) {
              return { 
                ...btn, 
                actionValue: targetCmd,
                linkedScenarios: [targetScenario.id] // Link directly by Scenario ID for emulator FSM transition
              };
            }
            return btn;
          });
          return { ...s, inlineButtons: nextButtons };
        }
      }
      return s;
    });

    handleUpdateBot({
      ...activeBot,
      scenarios: updatedScenarios
    });

    // Reset pointers
    setLinkingTargetScenarioId(null);
    setLinkingTargetButtonIndex(null);
    setLinkingType(null);
    setIsLinkOpen(false);
  };

  const handleUnlink = (scenId: string, btnIdx: number, type: 'inline' | 'keyboard') => {
    if (!activeBot) return;

    const updatedScenarios = activeBot.scenarios.map((s) => {
      if (s.id === scenId) {
        if (type === 'keyboard') {
          const nextButtons = s.keyboardButtons.map((btn, idx) => {
            if (idx === btnIdx) {
              return { ...btn, actionValue: 'Ответ' };
            }
            return btn;
          });
          return { ...s, keyboardButtons: nextButtons };
        } else {
          const nextButtons = s.inlineButtons.map((btn, idx) => {
            if (idx === btnIdx) {
              return { ...btn, actionValue: 'Действие', linkedScenarios: [] };
            }
            return btn;
          });
          return { ...s, inlineButtons: nextButtons };
        }
      }
      return s;
    });

    handleUpdateBot({
      ...activeBot,
      scenarios: updatedScenarios
    });
  };

  // --- 6. Code Generation & Emulator launchers ---

  const handleGenerateCodeAction = () => {
    if (!activeBot) return;
    const pythonCode = generateTelegramCode(activeBot);
    setGeneratedCode(pythonCode);
    setIsCodeViewOpen(true);
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-warm-cream flex flex-col font-sans text-charcoal-dark antialiased overflow-hidden">
      
      {/* Premium Header */}
      <Header selectedPlan={selectedPlan} />

      {/* Main Workspace Scrollable Region */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto pb-8">
        {currentTab === 'bots' && (
          <MyProjects
            bots={bots}
            onSelectTab={setCurrentTab}
            onSelectBotForContext={handleOpenBotContext}
            onEditScenarios={handleEditScenarios}
          />
        )}

        {currentTab === 'create' && (
          <CreateBot 
            onAddBot={handleAddBot} 
            onSelectTab={setCurrentTab} 
          />
        )}

        {currentTab === 'profile' && (
          <MyProfile
            animationsEnabled={animationsEnabled}
            onToggleAnimations={setAnimationsEnabled}
            selectedPlan={selectedPlan}
            onChangePlan={setSelectedPlan}
          />
        )}

        {currentTab === 'editor' && activeBot && (
          <ScenarioEditor
            activeBot={activeBot}
            onUpdateBot={handleUpdateBot}
            onGoBack={handleExitEditor}
            onOpenEmulator={() => setIsEmulatorOpen(true)}
            onGenerateCode={handleGenerateCodeAction}
            selectedPlan={selectedPlan}
            onOpenWarningModal={handleOpenWarningModal}
            onShowConfirmDelete={showCustomConfirm}
            onStartLinking={handleStartLinking}
            onUnlink={handleUnlink}
          />
        )}
      </main>

      {/* Persistent Premium Bottom Tab Navigator (only shown when not inside active scenario editor) */}
      {currentTab !== 'editor' && (
        <nav className="bg-white/75 backdrop-blur-2xl border-t border-white/40 py-3.5 px-4 z-40 shadow-[0_-8px_32px_rgba(0,0,0,0.04)] shrink-0">
          <div className="max-w-md mx-auto flex items-center justify-around select-none">
            
            {/* Bots Tab */}
            <button
              onClick={() => setCurrentTab('bots')}
              className={`flex flex-col items-center gap-1 transition-colors group cursor-pointer ${
                currentTab === 'bots' ? 'text-amber-gold' : 'text-charcoal-light/50 hover:text-charcoal-dark'
              }`}
            >
              <Layers className="w-5 h-5 transition-transform group-hover:scale-105" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold tracking-wide uppercase">Проекты</span>
            </button>

            {/* Create Tab */}
            <button
              onClick={() => setCurrentTab('create')}
              className={`flex flex-col items-center gap-1 transition-colors group cursor-pointer ${
                currentTab === 'create' ? 'text-amber-gold' : 'text-charcoal-light/50 hover:text-charcoal-dark'
              }`}
            >
              <FolderPlus className="w-5 h-5 transition-transform group-hover:scale-105" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold tracking-wide uppercase">Создать</span>
            </button>

            {/* Profile Tab */}
            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex flex-col items-center gap-1 transition-colors group cursor-pointer ${
                currentTab === 'profile' ? 'text-amber-gold' : 'text-charcoal-light/50 hover:text-charcoal-dark'
              }`}
            >
              <User className="w-5 h-5 transition-transform group-hover:scale-105" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold tracking-wide uppercase">Профиль</span>
            </button>

          </div>
        </nav>
      )}

      {/* --- Global Modals Sheet Components --- */}
      
      {/* Context Menu Bottom sheet */}
      <BotContextSheet
        isOpen={isContextOpen}
        bot={selectedBot}
        onClose={() => setIsContextOpen(false)}
        onEditScenarios={handleEditScenarios}
        onRenameBot={handleRenameBot}
        onCloneBot={handleCloneBot}
        onDeleteBot={handleDeleteBot}
      />

      {/* Bespoke Confirmation alert */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title={confirmTitle}
        message={confirmMsg}
        onConfirm={handleConfirmAction}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {/* Plan limitation Alert */}
      <WarningModal
        isOpen={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        onUpgrade={handleUpgradePlan}
        requiredPlan={warningRequiredPlan}
        currentPlan={selectedPlan}
      />

      {/* Point & Click Link dialog */}
      {activeBot && (
        <LinkScenarioModal
          isOpen={isLinkOpen}
          scenarios={activeBot.scenarios || []}
          onClose={() => setIsLinkOpen(false)}
          onSelect={handleSelectScenarioToLink}
        />
      )}

      {/* Telegram Chat Emulator Modal Overlay */}
      {activeBot && isEmulatorOpen && (
        <EmulatorModal
          isOpen={isEmulatorOpen}
          bot={activeBot}
          onClose={() => setIsEmulatorOpen(false)}
          animationsEnabled={animationsEnabled}
        />
      )}

      {/* Compiled Code High-contrast Viewer Overlay */}
      {activeBot && (
        <CodeViewModal
          isOpen={isCodeViewOpen}
          code={generatedCode}
          botName={activeBot.name}
          onClose={() => setIsCodeViewOpen(false)}
        />
      )}

    </div>
  );
}
