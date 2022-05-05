export const formatQuestions = (questions) => {
  const formattedQuestions = questions.map((question, index) => {
    let response = `Question ${index + 1})\n${question.question} \n\n`;

    question['options'].forEach((option, index) => {
      response = response + `${index + 1} )  ${option.text} \n\n`;
    });

    return response;
  });

  return formattedQuestions;
};

export const handleTimer = (ctx) => {
  const now = new Date();
  const savedDate = new Date(ctx.session.questionDispatchTime);

  const diffInSeconds = (now.getTime() - savedDate.getTime()) / 1000;
  if (diffInSeconds > 25) {
    return 'expired';
  }
  return 'valid';
};

export const handleQuestionAnswer = async (ctx, final = false) => {
  const correctAnswer = ctx.session.currentSelection.options.findIndex(
    (option) => {
      return option.answer === true;
    }
  );

  if (isNaN(ctx.message.text)) {
    await ctx.reply(
      `You can only answer with a number corresponding to the option you pick \nE.g 1 to pick the first option. \nThis question will be skipped.`
    );
    return;
  }

  if (Number(ctx.message.text) === correctAnswer + 1) {
    ctx.session.points = ctx.session.points + 20;
  }
  await ctx.reply(`Thank you for your response`);

  return;
};
