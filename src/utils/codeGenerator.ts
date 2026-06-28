import { Bot, Scenario, InlineButton, KeyboardButton } from '../types';
import { transliterate } from './transliteration';

export function generateTelegramCode(bot: Bot): string {
  const botName = bot.name || 'ArchitectBot';
  const cleanBotName = transliterate(botName);
  const scenarios = bot.scenarios || [];

  let code = `"""
🔥 Сгенерировано профессиональной платформой Architect v3
🧠 Архитектура: aiogram v3 (Python 3.10+) • Уровень: Senior Telegram Developer
🤖 Имя проекта: ${botName}

Паттерны и технологии в этом коде:
1. Router-архитектура для масштабируемости
2. Finite State Machine (FSM) для изоляции диалоговых состояний
3. Reply- и Inline-Keyboard Builders с динамической адаптацией (adjust)
4. Безопасная обработка Callback Query (callback.answer)
5. Встроенный логгер уровня Production
"""

import logging
import asyncio
import sys
from aiogram import Bot, Dispatcher, F, Router, types
from aiogram.filters import Command, CommandStart, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.utils.keyboard import InlineKeyboardBuilder, ReplyKeyboardBuilder
from aiogram.exceptions import TelegramBadRequest, TelegramNetworkError

# ----------------------------------------------------------
# НАСТРОЙКА ЛОГИРОВАНИЯ (Production Ready)
# ----------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s (%(filename)s:%(lineno)d): %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("TelegramBot")

# Токен Вашего бота (Рекомендуется хранить в .env переменных окружения)
BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN_HERE"

# Инициализация роутера и основного ядра бота
router = Router()
storage = MemoryStorage()
dp = Dispatcher(storage=storage)
dp.include_router(router)

# ==========================================================
# СОСТОЯНИЯ ДИАЛОГОВ (FSM - Finite State Machine)
# ==========================================================
class BotStates(StatesGroup):
    """
    Класс состояний для контроля контекста и шагов пользователя.
    """
`;

  if (scenarios.length === 0) {
    code += `    state_idle = State()\n`;
  } else {
    scenarios.forEach(scen => {
      const stateName = `state_${transliterate(scen.command)}`;
      code += `    ${stateName} = State()  # Триггер: /${scen.command}\n`;
    });
  }

  code += `\n`;

  // Pre-generate Reply Keyboards with Senior dynamic sizing and adaptive parameters
  scenarios.forEach(scen => {
    const cmdTrans = transliterate(scen.command);
    if (scen.hasKeyboard && scen.keyboardButtons && scen.keyboardButtons.length > 0) {
      code += `# ----------------------------------------------------------\n`;
      code += `# КЛАВИАТУРА МЕНЮ: /${scen.command}\n`;
      code += `# ----------------------------------------------------------\n`;
      code += `def get_reply_kb_${cmdTrans}() -> types.ReplyKeyboardMarkup:\n`;
      code += `    """\n`;
      code += `    Генерирует экранные кнопки с авто-масштабированием под экран.\n`;
      code += `    """\n`;
      code += `    builder = ReplyKeyboardBuilder()\n`;
      scen.keyboardButtons.forEach(btn => {
        code += `    builder.button(text=${JSON.stringify(btn.text)})\n`;
      });
      code += `    builder.adjust(2)  # По 2 кнопки в ряд\n`;
      code += `    return builder.as_markup(\n`;
      code += `        resize_keyboard=True,\n`;
      code += `        one_time_keyboard=False,\n`;
      code += `        input_field_placeholder="Выберите нужную опцию..."\n`;
      code += `    )\n\n`;
    }
  });

  // Pre-generate Inline Keyboards
  scenarios.forEach(scen => {
    const cmdTrans = transliterate(scen.command);
    if (scen.hasButtons && scen.inlineButtons && scen.inlineButtons.length > 0) {
      code += `# ----------------------------------------------------------\n`;
      code += `# ВСТРОЕННАЯ INLINE-КЛАВИАТУРА: /${scen.command}\n`;
      code += `# ----------------------------------------------------------\n`;
      code += `def get_inline_kb_${cmdTrans}() -> types.InlineKeyboardMarkup:\n`;
      code += `    """\n`;
      code += `    Генерирует инлайн-кнопки под сообщением для мгновенных переходов.\n`;
      code += `    """\n`;
      code += `    builder = InlineKeyboardBuilder()\n`;
      scen.inlineButtons.forEach((btn, idx) => {
        const callbackData = `cb_${cmdTrans}_${idx}`;
        code += `    builder.button(text=${JSON.stringify(btn.text)}, callback_data=${JSON.stringify(callbackData)})\n`;
      });
      code += `    builder.adjust(2)  # По 2 кнопки в ряд\n`;
      code += `    return builder.as_markup()\n\n`;
    }
  });

  // Response generation helper function to implement Dual-Markup Flow & Safety Alerts
  code += `
# ==========================================================
# ДВИЖОК МАРШРУТИЗАЦИИ ОТВЕТОВ (Routing Engine)
# ==========================================================
async def send_scenario_response(message: types.Message, state: FSMContext, command_name: str):\n`;
  code += `    """
    Отправляет соответствующий ответ, управляет FSM-состоянием и обрабатывает алерты.
    """
    try:
`;

  scenarios.forEach((scen, idx) => {
    const cmdTrans = transliterate(scen.command);
    const cond = idx === 0 ? 'if' : 'elif';
    code += `        ${cond} command_name == ${JSON.stringify(scen.command)}:\n`;
    code += `            await state.set_state(BotStates.state_${cmdTrans})\n`;

    // Alert or Toast safety simulation when triggered via text / keyboard
    if (scen.hasAlert) {
      code += `            # Системное оповещение (Alert)\n`;
      code += `            await message.answer("⚠️ <b>[АЛЕРТ]: ${scen.alertText.replace(/"/g, '\\"')}</b>", parse_mode="HTML")\n`;
    }
    if (scen.hasInlineNotif) {
      code += `            # Всплывающее Тост-уведомление (Toast)\n`;
      code += `            await message.answer("🔔 <i>[УВЕДОМЛЕНИЕ]: ${scen.inlineNotifText.replace(/"/g, '\\"')}</i>", parse_mode="HTML")\n`;
    }

    // Dual Markup checking
    const hasKb = scen.hasKeyboard && scen.keyboardButtons && scen.keyboardButtons.length > 0;
    const hasIn = scen.hasButtons && scen.inlineButtons && scen.inlineButtons.length > 0;

    if (hasKb && hasIn) {
      code += `            # Режим двойной клавиатуры (Dual-Markup Flow)\n`;
      code += `            await message.answer("Загружаем экранное меню...", reply_markup=get_reply_kb_${cmdTrans}())\n`;
      code += `            await message.answer(${JSON.stringify(scen.responseText)}, reply_markup=get_inline_kb_${cmdTrans}(), parse_mode="HTML")\n`;
    } else if (hasKb) {
      code += `            await message.answer(${JSON.stringify(scen.responseText)}, reply_markup=get_reply_kb_${cmdTrans}(), parse_mode="HTML")\n`;
    } else if (hasIn) {
      code += `            await message.answer(${JSON.stringify(scen.responseText)}, reply_markup=get_inline_kb_${cmdTrans}(), parse_mode="HTML")\n`;
    } else {
      code += `            await message.answer(${JSON.stringify(scen.responseText)}, parse_mode="HTML")\n`;
    }
  });

  if (scenarios.length > 0) {
    code += `        else:\n`;
    code += `            await message.answer("Данная команда находится в разработке у нашего архитектора.")\n`;
  } else {
    code += `        await message.answer("Ваш проект пуст. Добавьте сценарии в конструкторе Architect.")\n`;
  }

  code += `    except TelegramBadRequest as err:
        logger.error(f"Ошибка запроса Telegram API: {err}")
    except Exception as err:
        logger.error(f"Критическая ошибка обработки сценария: {err}")

`;

  // ==========================================================
  // DIRECT COMMAND HANDLERS
  // ==========================================================
  code += `# ==========================================================
# ХЕНДЛЕРЫ ПРЯМОГО ВЫЗОВА (Direct Command Handlers)
# ==========================================================
`;

  scenarios.forEach(scen => {
    if (!scen.isUnique) {
      const cmdTrans = transliterate(scen.command);
      if (scen.command === 'start') {
        code += `@router.message(CommandStart())\n`;
      } else {
        code += `@router.message(Command(${JSON.stringify(scen.command)}))\n`;
      }
      code += `async def handler_cmd_${cmdTrans}(message: types.Message, state: FSMContext):\n`;
      code += `    logger.info(f"Вызвана команда /${scen.command} пользователем {message.from_user.id}")\n`;
      code += `    await send_scenario_response(message, state, ${JSON.stringify(scen.command)})\n\n`;
    }
  });

  // ==========================================================
  // REPLY KEYBOARD BUTTON FSM ROUTING
  // ==========================================================
  code += `# ==========================================================
# ОБРАБОТКА ЭКРАННЫХ КНОПОК С УЧЕТОМ FSM
# ==========================================================
`;

  scenarios.forEach(scen => {
    const cmdTrans = transliterate(scen.command);
    if (scen.hasKeyboard && scen.keyboardButtons && scen.keyboardButtons.length > 0) {
      scen.keyboardButtons.forEach((btn, bIdx) => {
        const btnTrans = transliterate(btn.text);
        code += `@router.message(StateFilter(BotStates.state_${cmdTrans}), F.text == ${JSON.stringify(btn.text)})\n`;
        code += `async def handler_kb_${cmdTrans}_btn_${btnTrans}_${bIdx}(message: types.Message, state: FSMContext):\n`;
        code += `    logger.info(f"Нажата кнопка меню '{btn.text}' в состоянии state_${cmdTrans}")\n`;

        if (btn.actionValue.startsWith('/')) {
          const targetCmd = btn.actionValue.substring(1).trim();
          code += `    await send_scenario_response(message, state, ${JSON.stringify(targetCmd)})\n\n`;
        } else {
          code += `    await message.answer(${JSON.stringify(btn.actionValue)}, parse_mode="HTML")\n\n`;
        }
      });
    }
  });

  // ==========================================================
  // INLINE CALLBACK HANDLERS
  // ==========================================================
  code += `# ==========================================================
# ХЕНДЛЕРЫ ВСТРОЕННЫХ КНОПОК И FSM ПЕРЕХОДОВ
# ==========================================================
`;

  scenarios.forEach(scen => {
    const cmdTrans = transliterate(scen.command);
    if (scen.hasButtons && scen.inlineButtons && scen.inlineButtons.length > 0) {
      scen.inlineButtons.forEach((btn, bIdx) => {
        const callbackData = `cb_${cmdTrans}_${bIdx}`;
        code += `@router.callback_query(F.data == ${JSON.stringify(callbackData)})\n`;
        code += `async def handle_inline_${cmdTrans}_btn_${bIdx}(callback: types.CallbackQuery, state: FSMContext):\n`;
        code += `    logger.info(f"Инлайн-клик: {callback.data} от {callback.from_user.id}")\n`;

        // Answer callback properly to avoid loading spinner
        if (btn.actionType === 'alert') {
          code += `    await callback.answer(text=${JSON.stringify(btn.actionValue)}, show_alert=True)\n`;
        } else {
          code += `    await callback.answer(text=${JSON.stringify(btn.actionValue)}, show_alert=False)\n`;
        }

        // Linked scenarios transition (PRO feature)
        if (btn.linkedScenarios && btn.linkedScenarios.length > 0) {
          const linkedScenId = btn.linkedScenarios[0];
          const targetScen = scenarios.find(s => s.id === linkedScenId);
          if (targetScen) {
            code += `    # Плавный переход на связанный сценарий: /${targetScen.command}\n`;
            code += `    await send_scenario_response(callback.message, state, ${JSON.stringify(targetScen.command)})\n\n`;
          } else {
            code += `    pass\n\n`;
          }
        } else {
          code += `    pass\n\n`;
        }
      });
    }
  });

  // Fallback catch-all message handler to direct user
  code += `# ----------------------------------------------------------
# ОБЩИЙ ПЕРЕХВАТЧИК СООБЩЕНИЙ (Fallback Handler)
# ----------------------------------------------------------
@router.message()
async def fallback_handler(message: types.Message):\n`;
  if (scenarios.length > 0) {
    const firstCmd = scenarios[0].command;
    code += `    await message.answer(\n`;
    code += `        "🤖 Я не распознал это действие.\\n\\n"\n`;
    code += `        "Пожалуйста, воспользуйтесь стартовой командой /${firstCmd} для работы с меню.",\n`;
    code += `        reply_markup=types.ReplyKeyboardRemove()\n`;
    code += `    )\n\n`;
  } else {
    code += `    await message.answer("Бот успешно запущен, но в нем пока нет настроенных сценариев в панели Architect.")\n\n`;
  }

  code += `# ==========================================================
# ЗАПУСК И ОПТИМИЗАЦИЯ СЕТЕВОГО ЦИКЛА (Event Loop Start)
# ==========================================================
async def main():
    bot = Bot(token=BOT_TOKEN)
    logger.info("Бот успешно инициализирован. Запускаем polling...")
    try:
        # Игнорировать накопленные оффлайн сообщения при старте
        await bot.delete_webhook(drop_pending_updates=True)
        await dp.start_polling(bot)
    finally:
        await bot.session.close()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Бот остановлен пользователем.")
`;

  return code;
}
