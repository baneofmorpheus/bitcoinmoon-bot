import 'dotenv/config';

import { firestore } from './db.js';
import { initBot } from './bot_commands.js';
import { collection } from 'firebase/firestore';

try {
  initBot();
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
