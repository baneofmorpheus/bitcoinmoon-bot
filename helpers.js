const { bot } = require('./telegraf');
const { handleQuestionAnswer } = require('./quiz');

exports.handleRequestData = (ctx) => {
  let successMsg;
  if (!ctx.session.sentQuizCompletionMsg) {
    successMsg = `You've completed the quiz \n You  have  ${ctx.session.points} points.
 Please provide the following data below \n    
\n `;
    ctx.session.sentQuizCompletionMsg = true;
  }
  if (!ctx.session.requestData.gmail) {
    return bot.telegram.sendMessage(
      ctx.chat.id,
      `${successMsg} Send your gmail address`,
      {}
    );
  }
  if (!ctx.session.requestData.bitmWallet) {
    return bot.telegram.sendMessage(
      ctx.chat.id,
      `${successMsg} Send your BITM wallet address`,
      {}
    );
  }

  ctx.session.mode = 'referall';
};

exports.handleReferall = (ctx) => {
  return bot.telegram.sendMessage(
    ctx.chat.id,
    `This is your referal link \n Referall  `,
    {}
  );
};

exports.handleQuizMode = (ctx) => {
  console.log('state');
  console.log(ctx.session);
  if (isNaN(ctx.message.text)) {
    return bot.telegram.sendMessage(
      ctx.chat.id,
      `That command is not recognized.  \n Please try again.`,
      {}
    );
  }

  if (Number(ctx.message.text) < 1 || Number(ctx.message.text) > 4) {
    return bot.telegram.sendMessage(
      ctx.chat.id,
      `Invalid option.  \n Select from 1-4.`,
      {}
    );
  }
  return handleQuestionAnswer(ctx);
};
