export const formatQuestions = (questions) => {
  const formattedQuestions = questions.map((question) => {
    let response = `${question.question} \n `;

    question['options'].forEach((option, index) => {
      response = response + `${index + 1}) ${option.text} \n`;
    });

    return response;
  });

  return formattedQuestions;
};

export const handleTimer = (ctx) => {
  const now = new Date();

  const diffInSeconds =
    (now.getTime() - ctx.session.questionDispatchTime.getTime()) / 1000;
  if (diffInSeconds > 25) {
    return 'expired';
  }
  return 'valid';
};

export const handleQuestionAnswer = async (ctx) => {
  const correctAnswer = ctx.session.currentSelection.options.findIndex(
    (option) => {
      return option.answer === true;
    }
  );

  if (Number(ctx.message.text) !== correctAnswer + 1) {
    await ctx.reply(
      `Your answer is incorrect. \n You  have  ${ctx.session.points} points.`
    );

    return;
  }
  ctx.session.points = ctx.session.points + 20;

  await ctx.reply(
    `Your answer is correct. \n You  have  ${ctx.session.points} points.`
  );

  return;
};
