export interface KeyboardButton {
  text: string;
  actionValue: string; // text or command triggered, e.g. "/help"
}

export interface InlineButton {
  text: string;
  actionType: 'text' | 'alert'; // text response or show an alert popup
  actionValue: string; // text triggered or alert message text
  linkedScenarios: string[]; // scenario IDs triggered on click (PRO feature)
}

export interface Scenario {
  id: string;
  command: string; // Trigger command (e.g. "start", "help", "about")
  responseText: string;
  isUnique: boolean; // Unique hidden scenario (only accessed via linked inline buttons)
  hasKeyboard: boolean;
  keyboardButtons: KeyboardButton[];
  hasAlert: boolean;
  alertText: string;
  hasInlineNotif: boolean;
  inlineNotifText: string;
  hasButtons: boolean;
  inlineButtons: InlineButton[];
}

export interface Bot {
  id: string;
  name: string;
  scenarios: Scenario[];
}

export interface EmulatorMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  inlineButtons?: InlineButton[];
}

export type PlanType = 'free' | 'encode' | 'pro';
export type TabType = 'bots' | 'create' | 'profile' | 'editor';

export interface AppState {
  currentTab: TabType;
  animationsEnabled: boolean;
  selectedPlan: PlanType;
  bots: Bot[];
  selectedBot: Bot | null; // Selected bot for context menu
  activeBot: Bot | null; // Active bot being edited in the editor tab
  linkingTargetScenarioId: string | null;
  linkingTargetButtonIndex: number | null;
  linkingType: 'inline' | 'keyboard' | null;
  emulatorMessages: EmulatorMessage[];
  currentEmulatorReplyKeyboard: KeyboardButton[];
}
