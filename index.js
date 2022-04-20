var _ = require('lodash');
const { selectQuestion } = require('./quiz');
const { questions } = require('./questions');
const { handleRequestData, handleQuizMode } = require('./helpers');
const { bot } = require('./telegraf');
require('dotenv').config();

try {
  const handleText = (ctx) => {
    switch (ctx.session.mode) {
      case 'question':
        return handleQuizMode();
      case 'request_data':
        return handleRequestData();
      case 'referall':
        return handleReferall();

      default:
        throw new Error(`invalid mode - ${ctx.session.mode}`);
    }
  };

  /**
   * Start Bot
   */
  bot.command('start', (ctx) => {
    console.log('started bot');
    console.log(ctx.from);
    ctx.session = {
      points: 0,
      timeUp: false,
      mode: 'quiz',
      availableQuestions: questions,
      sentQuizCompletionMsg: false,
      requestData: {
        gmail: '',
        bitmWallet: '',
      },
    };

    bot.telegram.sendMessage(
      ctx.chat.id,
      `Hello ${ctx.from.first_name} I am your BITM EASTER EGG HUNT Airdrop Bot \n
Complete all tasks \n
Answer all questions \n
1 question = 20 marks \n
50 and above qualifies for airdrop \n
Please do the required tasks and get above average to be eligible to get the NFT Airdrop. \n
Airdrop starts 19th April ends 25th April, distribution starts 26th April. \n
Type "Join Airdrop" to start
      `,
      {}
    );
  });

  /**
   * Start quiz
   */
  bot.hears('Join Airdrop', (ctx) => {
    console.log(ctx.from);

    console.log('current session');
    console.log(ctx.session);
    ctx.session.points = 0;
    ctx.session.mode = 'quiz';
    ctx.session.availableQuestions = availableQuestions;

    const questionResponse = selectQuestion(ctx);

    if (questionResponse.status == 'quiz_completed') {
      if (ctx.session.points < 50) {
        return bot.telegram.sendMessage(
          ctx.chat.id,
          `You completed the quiz but got only  ${ctx.session.points} points and so you're not eligible for our airdrop.`,
          {}
        );
      }
      ctx.session.mode = 'request_data';
      return handleRequestData(ctx);
    }

    bot.telegram.sendMessage(ctx.chat.id, questionResponse.text, {});
    ctx.session.timeUp = false;
  });

  bot.on('text', (ctx) => {
    console.log('current session');
    console.log(ctx.session);
    console.log(ctx.message);
    handleText(ctx);
  });

  // gmail
  // bit wallet address
  // telegram name

  bot.launch();
} catch (err) {
  console.log(err);
}
