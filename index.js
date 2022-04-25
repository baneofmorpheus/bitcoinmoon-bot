import 'dotenv/config';

import { contactDataWizard, requestData } from './scenes.js';
import { firestore } from './db.js';
import { bot } from './telegraf.js';
import { Scenes, Markup } from 'telegraf';
import {
  setDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
} from 'firebase/firestore';

try {
  console.log('starting script');
  const stage = new Scenes.Stage([contactDataWizard, requestData]);

  bot.use(stage.middleware());

  /**Handle New Users */
  bot.on('new_chat_members', async (ctx) => {
    console.log('new channel user');
    console.log(ctx.message.new_chat_members);

    const formattedMembers = ctx.message.new_chat_members.map((member) => {
      return member.username;
    });

    const docRef = doc(firestore, 'group_members', 'new_users');
    const docSnap = await getDoc(docRef);

    const newUsers = docSnap.data();

    const mergedUsers = formattedMembers.concat(newUsers.users);

    //  update the new users
    await updateDoc(docRef, {
      users: mergedUsers,
    });
  });

  /**
   * Navigate to page 2
   */
  bot.action('page2', async (ctx) => {
    const docRef = doc(firestore, 'group_members', 'new_users');
    const docSnap = await getDoc(docRef);

    const newUsers = docSnap.data();

    const existingUser = newUsers.users.find((user) => {
      return user === ctx.chat.username;
    });

    if (!existingUser) {
      return ctx.reply('Please join our telegram group before you can proceed');
    }

    bot.telegram.sendMessage(
      ctx.chat.id,
      `
Complete all tasks \n
Answer all questions \n
1 question = 20 marks \n
20 seconds per question \n
50 and above qualifies for airdrop \n
Answer by dropping the number corresponding to your answer from the option e.g "1"\n
Please do the required tasks and get above average to be eligible to get the NFT Airdrop. \n
Airdrop starts 19th April ends 25th April, distribution starts 26th April. \n

      `,
      {}
    );

    ctx.reply("Start the quiz when you're ready", {
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Start Quiz', callback_data: 'start_quiz' }],
        ],
      },
    });
  });

  /**
   * Handle Referall Link
   */
  bot.hears(/^\/start[ =](.+)$/, async (ctx) => {
    // console.log('deep link');
    // console.log(ctx.match[1]);

    /**
     * Check for existing user
     */
    const docRef = doc(firestore, 'users', ctx.from.username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return await ctx.reply(`You have already taken this quiz. \n    `, {});
    }

    await setDoc(doc(firestore, 'users', ctx.from.username), {
      points: 0,
      gmail: '',
      bitmWallet: '',
      telegram: '',
    });

    console.log('started bot');
    console.log(ctx.chat);
    ctx.session = {
      points: 0,
      currentSelection: '',
      questionsAnswered: 0,
      cursor: 0,
      questionDispatchTime: false,
      newUsers: [],
      ref: ctx.match[1],
      requestData: {
        gmail: '',
        bitmWallet: '',
        telegram: '',
      },
    };
    await ctx.reply(
      `Hello ${ctx.from.first_name} I am your BITM EASTER EGG HUNT Airdrop Bot \n
Join our Twitter https://twitter.com/Bitcoin__Moon?s=09  \n
Join our Instagram: https://www.instagram.com/bitcoinmoon_insta/
 \n
Join our Telegram: https://t.me/+XuK6oN958bk5Njk0 
 \n
Join our Discord: https://discord.gg/fygeuB5NPf   \n
Join our Facebook: https://www.facebook.com/104780618768936/  \n
      `,
      {}
    );

    ctx.reply("Move to the next step when you're done", {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([Markup.button.callback('✅ Proceed', 'page2')]),
    });
  });

  /**
   * Start Bot
   */
  bot.command('start', async (ctx) => {
    /**
     * Check for existing user
     */
    const docRef = doc(firestore, 'users', ctx.from.username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return await ctx.reply(`You have already taken this quiz. \n    `, {});
    }

    await setDoc(doc(firestore, 'users', ctx.from.username), {
      points: 0,
      gmail: '',
      bitmWallet: '',
      telegram: '',
    });

    console.log('started bot');
    console.log(ctx.chat);
    ctx.session = {
      points: 0,
      currentSelection: '',
      questionsAnswered: 0,
      cursor: 0,
      questionDispatchTime: false,
      newUsers: [],
      refererr: '',
      requestData: {
        gmail: '',
        bitmWallet: '',
        telegram: '',
      },
    };
    await ctx.reply(
      `Hello ${ctx.from.first_name} I am your BITM EASTER EGG HUNT Airdrop Bot \n
Join our Twitter https://twitter.com/Bitcoin__Moon?s=09  \n
Join our Instagram: https://www.instagram.com/bitcoinmoon_insta/
 \n
Join our Telegram: https://t.me/+XuK6oN958bk5Njk0 
 \n
Join our Discord: https://discord.gg/fygeuB5NPf   \n
      `,
      {}
    );

    ctx.reply("Move to the next step when you're done", {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([Markup.button.callback('✅ Proceed', 'page2')]),
    });
  });

  bot.command('reset', async (ctx) => {
    /**
     * Reset db for tests
     */
    const docRef = doc(firestore, 'users', ctx.from.username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await deleteDoc(doc(firestore, 'users', ctx.from.username));
    }

    const newUsersRef = doc(firestore, 'group_members', 'new_users');
    const newUserData = await getDoc(newUsersRef);

    const newUsers = newUserData.data();

    const filteredUsers = newUsers.users.filter(function (savedUser) {
      return savedUser !== ctx.from.username;
    });

    //  update the new users
    await updateDoc(docRef, {
      users: filteredUsers,
    });

    return await ctx.reply(
      "You've reset your account data. \nYou can proceed by running /start"
    );
  });

  /**
   * Start quiz
   */
  bot.action('start_quiz', (ctx) => {
    console.log(ctx.from);

    ctx.scene.leave();
    ctx.session = {
      points: 0,
      currentSelection: '',
      questionsAnswered: 0,
      cursor: 0,
      questionDispatchTime: false,
      newUsers: [],
      requestData: {
        gmail: '',
        bitmWallet: '',
        telegram: '',
      },
    };

    ctx.scene.enter('quiz');
  });

  bot.launch();
} catch (err) {
  await addDoc(collection(firestore, 'errors'), {
    username: ctx.from.username,
    error: err.message,
  });

  await ctx.reply(
    "There's been an error with this bot\nContact the admin for more details"
  );
  console.log(err);
}
