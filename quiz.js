exports.selectQuestion = (ctx) => {
  if (ctx.session.availableQuestions.length < 1) {
    return { text: 'Quiz Completed', status: 'quiz_completed' };
  }
  const currentSelection = _.shuffle(ctx.session.availableQuestions);

  ctx.session.currentSelection = currentSelection[0];
  ctx.session.currentSelection = currentSelection.shift();
  let response = `${currentSelection[0]['question']} \n`;

  console.log('current selection');
  console.log(currentSelection[0]);

  currentSelection[0]['options'].forEach((option, index) => {
    response = response + `${index + 1}) ${option.text} \n`;
  });

  return { text: response, status: 'successful' };
};

exports.handleQuestionAnswer = (ctx) => {
  if (!ctx.session.currentSelection) {
    console.log('question not set');
    return;
  }

  const correctAnswer = ctx.session.currentSelection.options.findIndex(
    (option) => {
      console.log('selected option');
      console.log(option);
      return option.answer === true;
    }
  );

  if (Number(ctx.message.text) !== correctAnswer + 1) {
    const newQuestionAndOptions = selectQuestion(ctx);

    console.log('correct answer');
    console.log(correctAnswer);

    bot.telegram.sendMessage(
      ctx.chat.id,
      `Your answer is incorrect. \n You  have  ${ctx.session.points} points.
 Please answer the next question      
\n ${newQuestionAndOptions}`,
      {}
    );

    return;
  }
  ctx.session.points = +20;

  const newQuestionAndOptions = selectQuestion(ctx);

  bot.telegram.sendMessage(
    ctx.chat.id,
    `Your answer is correct. \n You now have  ${ctx.session.points} points. \n 
Please answer the next question below. 
\n ${newQuestionAndOptions}`,
    {}
  );

  return;
};
