const { Telegraf } = require('telegraf');
const LocalSession = require('telegraf-session-local');

require('dotenv').config();

exports.bot = new Telegraf(process.env.TELEGRAM_KEY);
exports.bot.use(new LocalSession({ database: 'session.json' }).middleware());
