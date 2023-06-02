import { Conversation, ConversationFlavor, conversations, createConversation } from "@grammyjs/conversations";
import { Menu, MenuRange } from "@grammyjs/menu";
import { hydrateReply, parseMode, ParseModeFlavor } from "@grammyjs/parse-mode";
import { Bot, Context, session, SessionFlavor } from "grammy";
import jalaali from "jalaali-js";
import { getBS } from "./GBS.js";
import { getHBI } from "./HBS.js";
import months from "./months.js";

interface SessionData {
  ymd: number;
  by: number;
  bm: number;
  bd: number;
}
type MyContext = Context & ConversationFlavor & SessionFlavor<SessionData>;
type MyConversation = Conversation<MyContext>;
const bot = new Bot<ParseModeFlavor<MyContext>>("6017005573:AAEez79V7yBPIf0mmyOwLNK-ECjmJ79kYRE"); // <-- put your bot token between the ""

bot.use(session({ initial: () => ({ ymd: 0, by: 0, bm: 0, bd: 0 }) }));

bot.use(conversations());
// Install the plugin.
bot.use(hydrateReply);

const calYearMenu = new Menu<MyContext>("calYear", { onMenuOutdated: false }).dynamic(async (ctx, range) => {
  for (let i = 1350; i < 1400; i++) {
    if (i % 5 == 4) {
      range.submenu(
        {
          text: i.toString(),
        },
        "calMonth",
        (ctx) => {
          ctx.session.by = i;
          ctx.editMessageText("Please choose your birth month");
        },
      ).row();
    } else {
      range.submenu(
        {
          text: i.toString(),
        },
        "calMonth",
        (ctx) => {
          ctx.session.by = i;
          ctx.editMessageText("Please choose your birth month");
        },
      );
    }
  }
}).text("Cancel", (ctx) => ctx.deleteMessage());

const calMonthMenu = new Menu<MyContext>("calMonth", { onMenuOutdated: false }).dynamic(async (ctx, range) => {
  for (let i in months) {
    const month = parseInt(i);
    if (month % 5 == 4) {
      range.submenu({ text: months[month] }, "calDay", (ctx) => {
        ctx.session.bm = month + 1;
        ctx.editMessageText("Please choose your birth day");
      }).row();
    } else {
      range.submenu({ text: months[month] }, "calDay", (ctx) => {
        ctx.session.bm = month + 1;
        ctx.editMessageText("Please choose your birth day");
      });
    }
  }
});

const calDayMenu = new Menu<MyContext>("calDay", { onMenuOutdated: false }).dynamic(async (ctx, range) => {
  const days = ctx.session.bm <= 6 ? 31 : 30;
  for (let i = 1; i <= days; i++) {
    if (i % 5 == 0) {
      range.text(i.toString(), async (ctx) => {
        ctx.session.bd = i;
        ctx.deleteMessage();
      }).row();
    } else {
      range.text(i.toString(), async (ctx) => {
        ctx.session.bd = i;
        ctx.deleteMessage();
      });
    }
  }
});

bot.use(calYearMenu);
calYearMenu.register(calMonthMenu);
calMonthMenu.register(calDayMenu);

async function init(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Please choose your birth year", { reply_markup: calYearMenu });
  let [bys, bms, bds] = [ctx.session.by, ctx.session.bm, ctx.session.bd];
  const { gy: by, gm: bm, gd: bd } = jalaali.toGregorian(bys, bms, bds);
  const bs = await getBS([by, bm, bd]);
  await ctx.reply(bs);
  const hbi = getHBI(bm, bd);
  const imageCap = `نام: ${hbi.title} 
سال مشاهده: ${hbi.year} 
توضیحات:
${hbi.description} 
اطلاعات بیشتر:
${hbi.info}`;
  await ctx.api.sendPhoto(ctx.chat?.id!, hbi.imageURL, {
    caption: imageCap,
    parse_mode: "HTML",
  });
  return true;
}

bot.use(createConversation(init));

const work = new Menu<MyContext>("work", { onMenuOutdated: false }).text("Birthday Star", async (ctx) => {
  await ctx.conversation.enter("init");
});
// Make it interactive.
bot.use(work);

bot.command("start", async (ctx) => {
  // Send the menu.

  await ctx.reply("What should I do?", { reply_markup: work });
});

bot.command("gbs", async (ctx) => {
  await ctx.conversation.enter("init");
});

// Start the bot.
bot.start();
