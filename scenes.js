import { questions } from './questions.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from './db.js';

import _ from 'lodash';
import { Scenes } from 'telegraf';

import {
  handleQuestionAnswer,
  formatQuestions,
  handleTimer,
} from './helpers.js';

const shuffledQuestions = _.shuffle(questions);
const formattedQuestions = formatQuestions(shuffledQuestions);

/**Run quiz */
export const contactDataWizard = new Scenes.WizardScene(
  'quiz',
  async (ctx) => {
    console.log(formattedQuestions[0]);

    console.log(questions[0]);
    await ctx.reply(formattedQuestions[0]);

    ctx.session.questionDispatchTime = new Date();
    ctx.session.currentSelection = questions[0];
    ctx.session.cursor = ctx.scene.session.cursor + 1;

    return ctx.wizard.next();
  },
  async (ctx) => {
    const expiryStatus = await handleTimer(ctx);
    if (expiryStatus == 'expired') {
      await ctx.reply(`Your time is up \nAnswer the next question\n`);
    } else {
      await handleQuestionAnswer(ctx);
    }

    await ctx.reply(formattedQuestions[1]);
    ctx.session.questionDispatchTime = new Date();
    ctx.session.currentSelection = questions[1];
    ctx.session.cursor = ctx.scene.session.cursor + 1;

    return ctx.wizard.next();
  },
  async (ctx) => {
    const expiryStatus = await handleTimer(ctx);
    if (expiryStatus == 'expired') {
      await ctx.reply(`Your time is up \nAnswer the next question\n`);
    } else {
      await handleQuestionAnswer(ctx);
    }

    ctx.session.timeUp = false;
    await ctx.reply(formattedQuestions[2]);
    ctx.session.questionDispatchTime = new Date();
    ctx.session.currentSelection = questions[2];
    ctx.session.cursor = ctx.scene.session.cursor + 1;

    return ctx.wizard.next();
  },
  async (ctx) => {
    const expiryStatus = await handleTimer(ctx);
    if (expiryStatus == 'expired') {
      await ctx.reply(`Your time is up \nAnswer the next question\n`);
    } else {
      await handleQuestionAnswer(ctx);
    }
    await ctx.reply(formattedQuestions[3]);
    ctx.session.questionDispatchTime = new Date();

    ctx.session.currentSelection = questions[3];
    return ctx.wizard.next();
  },
  async (ctx) => {
    const expiryStatus = await handleTimer(ctx);
    if (expiryStatus == 'expired') {
      await ctx.reply(`Your time is up \nAnswer the next question\n`);
    } else {
      await handleQuestionAnswer(ctx);
    }
    await ctx.reply(formattedQuestions[4]);
    ctx.session.questionDispatchTime = new Date();

    ctx.session.currentSelection = questions[4];
    return ctx.wizard.next();
  },
  async (ctx) => {
    const expiryStatus = await handleTimer(ctx);
    if (expiryStatus == 'expired') {
      await ctx.reply(`Your time is up \nAnswer the next question\n`);
    } else {
      await handleQuestionAnswer(ctx);
    }
    await ctx.reply(formattedQuestions[5]);
    ctx.session.currentSelection = questions[5];
    ctx.session.questionDispatchTime = new Date();

    return ctx.wizard.next();
  },
  async (ctx) => {
    const expiryStatus = await handleTimer(ctx);
    if (expiryStatus == 'expired') {
      await ctx.reply(`Your time is up \nAnswer the next question\n`);
    } else {
      await handleQuestionAnswer(ctx);
    }
    await ctx.reply(formattedQuestions[6]);
    ctx.session.questionDispatchTime = new Date();

    ctx.session.currentSelection = questions[6];

    return ctx.wizard.next();
  },
  async (ctx) => {
    const expiryStatus = await handleTimer(ctx);
    if (expiryStatus == 'expired') {
      await ctx.reply(`Your time for this question is up \n`);
    } else {
      await handleQuestionAnswer(ctx);
    }
    await ctx.reply(formattedQuestions[7]);
    ctx.session.questionDispatchTime = new Date();

    ctx.session.currentSelection = questions[7];
    return ctx.wizard.next();
  },
  async (ctx) => {
    const expiryStatus = await handleTimer(ctx);
    if (expiryStatus == 'expired') {
      await ctx.reply(`Your time for this question is up \n`);
    } else {
      await handleQuestionAnswer(ctx, true);
    }

    if (ctx.session.ref) {
      const docRef = doc(firestore, 'users', ctx.session.ref);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const referrer = docSnap.data();

        await updateDoc(docRef, {
          points: referrer.points + 0.2,
        });
      }
    }

    if (ctx.session.points < 50) {
      await ctx.reply(
        `Congrats on completing the quiz.\nYou have ${ctx.session.points} points and are not eligible for our airdrop`
      );
      await ctx.reply(
        `Here's your referall link https://t.me/bitcoinmoonairdropbot?start=${ctx.from.username}`
      );
      return;
    }
    await ctx.reply(
      `Congrats on completing the quiz.\nYou have ${ctx.session.points} points and are  eligible for our airdrop`
    );

    /**
     * Update points
     */
    const docRef = doc(firestore, 'users', ctx.from.username);
    await updateDoc(docRef, {
      points: ctx.session.points,
    });

    await ctx.scene.leave();
    return ctx.scene.enter('request_for_data');
  }
);

/**Request for user data */
export const requestData = new Scenes.WizardScene(
  'request_for_data',
  async (ctx) => {
    await ctx.reply('Send your email');
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.session.requestData.gmail = ctx.message.text;
    await ctx.reply('Whats your BITM wallet address');

    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.session.requestData.bitmWallet = ctx.message.text;
    ctx.session.requestData.telegram = ctx.from.username;
    /**
     * Update user data
     */

    const docRef = doc(firestore, 'users', ctx.from.username);
    await updateDoc(docRef, {
      gmail: ctx.session.requestData.gmail,
      bitmWallet: ctx.session.requestData.bitmWallet,
      telegram: ctx.session.requestData.gmail,
    });

    await ctx.scene.leave();
    return;
  }
);
