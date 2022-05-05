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

    await ctx.reply(`Congrats on completing the quiz`);

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

/**Handle social media */
export const socialMediaScene = new Scenes.WizardScene(
  'social_media',
  async (ctx) => {
    await ctx.reply('Join our Discord: https://discord.gg/fygeuB5NPf');
    await ctx.reply("Drop your handle for verification when you're done");

    return ctx.wizard.next();
  },
  async (ctx) => {
    await ctx.reply(
      'Join our Instagram: https://www.instagram.com/bitcoinmoon_insta/'
    );
    await ctx.reply("Drop your handle for verification when you're done");
    return ctx.wizard.next();
  },
  async (ctx) => {
    await ctx.reply('Join our Twitter: https://twitter.com/Bitcoin__Moon?s=09');
    await ctx.reply("Drop your handle for verification when you're done");
    return ctx.wizard.next();
  },
  async (ctx) => {
    await ctx.reply(
      'Join our Facebook: https://www.facebook.com/104780618768936/'
    );
    await ctx.reply("Drop your handle for verification when you're done");
    return ctx.wizard.next();
  },
  async (ctx) => {
    await ctx.scene.leave();
    await ctx.reply('Click the button below to proceed', {
      reply_markup: {
        inline_keyboard: [[{ text: '✅ Proceed', callback_data: 'page2' }]],
      },
    });
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
    await ctx.reply(
      `Here's your referall link https://t.me/bitcoinmoonairdropbot?start=${ctx.from.username}`
    );
    await ctx.scene.leave();
    return;
  }
);
