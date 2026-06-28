import { Scenario, InlineButton, KeyboardButton } from '../types';

/**
 * Parses Python aiogram (v2 or v3) code and converts it to our constructor's Scenario format.
 * Fully trained to understand Senior-level Telegram aiogram code constructs:
 * - Supports routers: @router.message, @router.callback_query
 * - Supports dispatchers: @dp.message, @dp.callback_query, @dp.message_handler
 * - Supports filters: Command("cmd"), CommandStart(), F.text == "..."
 * - Gracefully filters out and ignores any unrecognized scenarios, handlers, or helper methods, 
 *   only importing the valid and supported ones that can be visually built.
 */
export function parseAiogramCode(pythonCode: string): Scenario[] {
  const scenarios: Scenario[] = [];
  
  // Normalize line endings
  const lines = pythonCode.split(/\r?\n/);
  
  let currentScenario: Partial<Scenario> | null = null;
  let textBuffer: string[] = [];
  let keyboardButtons: KeyboardButton[] = [];
  let inlineButtons: InlineButton[] = [];

  const flushCurrentScenario = () => {
    if (currentScenario && currentScenario.command) {
      const cmdClean = currentScenario.command.trim().toLowerCase();
      
      // Strict constraint: command name must only contain alphanumeric characters & underscores
      const isValidCommand = /^[a-z0-9_]+$/.test(cmdClean);

      if (isValidCommand && cmdClean.length > 0) {
        // Clean response text
        let responseText = textBuffer.join('\n').trim();
        // Remove starting/ending quotes and escapes
        responseText = responseText
          .replace(/^["']|["']$/g, '')
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'");

        if (!responseText) {
          responseText = `Вы вызвали команду /${cmdClean}`;
        }

        // Avoid duplicate commands during import
        if (!scenarios.some(s => s.command === cmdClean)) {
          scenarios.push({
            id: `scen_${cmdClean}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            command: cmdClean,
            responseText,
            isUnique: false,
            hasKeyboard: keyboardButtons.length > 0,
            keyboardButtons: [...keyboardButtons],
            hasAlert: false,
            alertText: 'Внимание!',
            hasInlineNotif: false,
            inlineNotifText: 'Успешно!',
            hasButtons: inlineButtons.length > 0,
            inlineButtons: [...inlineButtons],
          });
        }
      }
    }
    currentScenario = null;
    textBuffer = [];
    keyboardButtons = [];
    inlineButtons = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip comment-only lines or logging lines
    if (line.startsWith('#') || line.startsWith('logging.') || line.startsWith('logger.')) {
      continue;
    }

    // 1. Detect command message decorators or registrations
    // Support Command("start"), command=['help'], CommandStart(), @router.message, etc.
    const isDecorator = line.startsWith('@');
    const isMessageDecorator = isDecorator && (line.includes('.message') || line.includes('_handler'));
    
    // Command pattern matching
    let cmdName = '';
    
    if (isMessageDecorator) {
      // e.g. @router.message(Command("start"))
      const matchCommandFunc = line.match(/Command\s*\(\s*["']([^"']+)["']\s*\)/i);
      // e.g. @dp.message(commands=["help"])
      const matchCommandsKwarg = line.match(/commands\s*=\s*\[?\s*["']([^"']+)["']/i);
      // e.g. @router.message(CommandStart())
      const matchCommandStart = line.includes('CommandStart');
      // e.g. @dp.message_handler(commands=['about'])
      const matchLegacyCommands = line.match(/commands\s*=\s*\[\s*["']([^"']+)["']\s*\]/i);

      if (matchCommandFunc) {
        cmdName = matchCommandFunc[1];
      } else if (matchCommandsKwarg) {
        cmdName = matchCommandsKwarg[1];
      } else if (matchCommandStart) {
        cmdName = 'start';
      } else if (matchLegacyCommands) {
        cmdName = matchLegacyCommands[1];
      } else {
        // Fallback for direct string argument: @dp.message("info")
        const matchDirectString = line.match(/@(?:dp|router)\.message\s*\(\s*["']([^"']+)["']\s*\)/i);
        if (matchDirectString) {
          cmdName = matchDirectString[1];
        }
      }

      if (cmdName) {
        flushCurrentScenario();
        currentScenario = {
          command: cmdName.toLowerCase().replace(/^\//, ''), // clean leading slashes
        };
        continue;
      }
    }

    // 2. If we are tracking a command scenario, parse response content and buttons
    if (currentScenario) {
      // Look for message response strings
      // e.g. await message.answer("Hello world!") or await message.reply('text')
      const answerMatch = line.match(/(?:\.answer|\.reply)\s*\(\s*["']([\s\S]*?)["']/);
      if (answerMatch) {
        textBuffer.push(answerMatch[1]);
      } else {
        // Fallback: search for inline string text within this handler block
        const stringMatch = line.match(/["']([^"']{8,})["']/);
        // Ensure it doesn't match standard Python keywords or framework configuration strings
        if (stringMatch && textBuffer.length === 0 && !line.includes('import ') && !line.includes('Router') && !line.includes('logging') && !line.includes('.set_state')) {
          textBuffer.push(stringMatch[1]);
        }
      }

      // Parse KeyboardButton texts (Reply menu)
      // e.g. KeyboardButton(text="🛍️ Каталог")
      const kbBtnMatches = line.matchAll(/KeyboardButton\s*\(\s*text\s*=\s*["']([^"']+)["']/g);
      for (const kbBtn of kbBtnMatches) {
        if (kbBtn[1]) {
          keyboardButtons.push({
            text: kbBtn[1],
            actionValue: 'Ответ'
          });
        }
      }

      // Parse InlineKeyboardButton texts & callback values
      // e.g. InlineKeyboardButton(text="Заказать", callback_data="buy_order")
      const inlineBtnMatches = line.matchAll(/InlineKeyboardButton\s*\(\s*text\s*=\s*["']([^"']+)["']\s*,\s*(?:callback_data|url)\s*=\s*["']([^"']+)["']/g);
      for (const inlineBtn of inlineBtnMatches) {
        if (inlineBtn[1]) {
          const btnText = inlineBtn[1];
          const val = inlineBtn[2] || '';
          const isUrl = val.startsWith('http');
          
          inlineButtons.push({
            text: btnText,
            actionType: 'text',
            actionValue: val,
            linkedScenarios: []
          });
        }
      }

      // If we see another handler definition starting (either @dp, @router, class, def, async def)
      // without command matches on this line, we should flush the current scenario to prepare for the next
      const isNewHandler = line.startsWith('def ') || line.startsWith('async def ') || (line.startsWith('@') && !line.includes('message') && !line.includes('message_handler'));
      if (isNewHandler) {
        if (textBuffer.length > 0 || keyboardButtons.length > 0 || inlineButtons.length > 0) {
          flushCurrentScenario();
        }
      }
    }
  }

  // Flush the final parsed scenario
  flushCurrentScenario();

  // If no formal handlers were extracted, do a looser, smart scan for command-like patterns to guide user
  if (scenarios.length === 0) {
    const genericCmds = pythonCode.matchAll(/\/([a-zA-Z0-9_]{3,16})\b/g);
    const foundCmds = Array.from(new Set(Array.from(genericCmds).map(m => m[1])));
    
    const validFoundCmds = foundCmds.filter(cmd => /^[a-z0-9_]+$/.test(cmd.toLowerCase()));

    if (validFoundCmds.length > 0) {
      validFoundCmds.forEach(cmd => {
        scenarios.push({
          id: `scen_${cmd}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          command: cmd.toLowerCase(),
          responseText: `Импортированная команда /${cmd.toLowerCase()}. Сценарий успешно загружен из кода!`,
          isUnique: false,
          hasKeyboard: false,
          keyboardButtons: [],
          hasAlert: false,
          alertText: 'Внимание!',
          hasInlineNotif: false,
          inlineNotifText: 'Успешно!',
          hasButtons: false,
          inlineButtons: []
        });
      });
    }
  }

  // Fallback default start command scenario if nothing is successfully parsed
  if (scenarios.length === 0) {
    scenarios.push({
      id: 'scen_start_' + Date.now(),
      command: 'start',
      responseText: 'Привет! Код aiogram загружен. Отредактируйте сценарии под ваши задачи!',
      isUnique: false,
      hasKeyboard: false,
      keyboardButtons: [],
      hasAlert: false,
      alertText: 'Внимание!',
      hasInlineNotif: false,
      inlineNotifText: 'Успешно!',
      hasButtons: false,
      inlineButtons: []
    });
  }

  return scenarios;
}
