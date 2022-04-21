import 'dotenv/config';
import { Telegraf } from 'telegraf';
// const LocalSession = require('telegraf-session-local');
import LocalSession from 'telegraf-session-local';

export const bot = new Telegraf(process.env.TELEGRAM_KEY);
bot.use(new LocalSession({ database: 'session.json' }).middleware());
