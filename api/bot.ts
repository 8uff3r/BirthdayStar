import { Conversation, ConversationFlavor, conversations, createConversation } from "@grammyjs/conversations";
import { Menu, MenuRange } from "@grammyjs/menu";
import { hydrateReply, parseMode, ParseModeFlavor } from "@grammyjs/parse-mode";
import { Bot, BotError, Context, session, SessionFlavor, webhookCallback } from "grammy";
import jalaali from "jalaali-js";
import months from "./data/months.js";
import { getApod } from "./getters/APOD.js";
import { getBS } from "./getters/GBS.js";
import { getHBI } from "./getters/HBS.js";
import { getMRI } from "./getters/MRI.js";

interface SessionData {
  func: number;
  by: number;
  bm: number;
  bd: number;
}
type MyContext = Context & ConversationFlavor & SessionFlavor<SessionData> & ParseModeFlavor<Context>;
type MyConversation = Conversation<MyContext>;
const bot = new Bot<MyContext>(process.env.TOKEN!); // <-- put your bot token between the ""

bot.api
  .setMyCommands([
    { command: "start", description: "راه‌اندازی ربات" },
    { command: "status", description: "Check bot status" },
  ])
  .then(() => {
    console.log("commands have been uploaded to BotFather");
  })
  .catch((e) => console.error("Failed to upload commands to bot", e));
bot.use(session({ initial: () => ({ func: 0, by: 0, bm: 0, bd: 0 }) }));

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
          ctx.editMessageText("ماه تولدت رو انتخاب کن");
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
          ctx.editMessageText("ماه تولدت رو انتخاب کن");
        },
      );
    }
  }
}).text("Cancel", (ctx) => ctx.deleteMessage());

const calMonthMenu = new Menu<MyContext>("calMonth", {
  onMenuOutdated: async (ctx) => {
    // await ctx.answerCallbackQuery();
    if (ctx.session.func == 1) {
      await ctx.reply("سال تولدت رو انتخاب کن", { reply_markup: calYearMenu });
    } else {
      await ctx.reply("ماه تولدت رو انتخاب کن", { reply_markup: calMonthMenu });
    }
  },
}).dynamic(async (ctx, range) => {
  for (let i in months) {
    const month = parseInt(i);
    if (month % 5 == 4) {
      range.submenu({ text: months[month] }, "calDay", (ctx) => {
        ctx.session.bm = month + 1;
        ctx.editMessageText("روز تولدت رو انتخاب کن");
      }).row();
    } else {
      range.submenu({ text: months[month] }, "calDay", (ctx) => {
        ctx.session.bm = month + 1;
        ctx.editMessageText("روز تولدت رو انتخاب کن");
      });
    }
  }
});

async function HBI(conversation: MyConversation, ctx: MyContext) {
  let [bys, bms, bds] = [ctx.session.by, ctx.session.bm, ctx.session.bd];
  const { gy: by, gm: bm, gd: bd } = jalaali.toGregorian(bys, bms, bds);
  const hbi = getHBI(bm, bd);
  const imageCap = `نام: ${hbi.title} 
سال مشاهده: ${hbi.year} 
توضیحات:
${hbi.description} 
<a href="${hbi.info}">اطلاعات بیشتر</a>`;
  await ctx.api.sendPhoto(ctx.chat?.id!, hbi.imageURL, {
    caption: imageCap,
    parse_mode: "HTML",
  });
  return true;
}
bot.use(createConversation(HBI));

async function BS(conversation: MyConversation, ctx: MyContext) {
  let [bys, bms, bds] = [ctx.session.by, ctx.session.bm, ctx.session.bd];
  const { gy: by, gm: bm, gd: bd } = jalaali.toGregorian(bys, bms, bds);
  const bs = await getBS([by, bm, bd]);
  bs.forEach((val, i, arr) => {
    ctx.replyWithHTML(`نام ستاره ⭐: ${val.name}
صورت فلکی 🌌:
<a href="${val.href[1]}">${val.constellation}</a>
فاصله از زمین 💫: ${val.dist} سال نوری

نور این ستاره در ${val.offset} روز دیگر همسن شما خواهد بود 🤩
روشنایی این ستاره برابر ${val.mag} است 🌟

نام در کاتالوگ های ستاره‌شناسی مختلف:
Hipparcos Catalog: ${val.hip}
Henry Draper Catalog: ${val.hd}
Harvard Revised Catalog / Yale Bright Star Catalog: ${val.hrc}
Gliese Catalog 3rd edition: ${val.gl}`);
  });
}
bot.use(createConversation(BS));

const calDayMenu = new Menu<MyContext>("calDay").dynamic(async (ctx, range) => {
  const days = ctx.session.bm <= 6 ? 31 : 30;
  for (let i = 1; i <= days; i++) {
    if (i % 5 == 0) {
      range.text(i.toString(), async (ctx) => {
        ctx.session.bd = i;
        if (ctx.session.func == 0) {
          await ctx.conversation.enter("HBI");
        } else {
          await ctx.conversation.enter("BS");
        }
        ctx.deleteMessage();
      }).row();
    } else {
      range.text(i.toString(), async (ctx) => {
        ctx.session.bd = i;
        if (ctx.session.func == 0) {
          await ctx.conversation.enter("HBI");
        } else {
          await ctx.conversation.enter("BS");
        }
        ctx.deleteMessage();
      });
    }
  }
});

calYearMenu.register(calMonthMenu);
calYearMenu.register(calDayMenu);
bot.use(calYearMenu);

const work = new Menu<MyContext>("work", { onMenuOutdated: false })
  .text("عکس هابل", async (ctx) => {
    // For Hubble Image
    ctx.session.func = 0;
    await ctx.reply("ماه تولدت رو انتخاب کن", { reply_markup: calMonthMenu });
  }).text("ستاره تولد", async (ctx) => {
    // For Birthday Star
    ctx.session.func = 1;
    await ctx.reply("سال تولدت رو انتخاب کن", { reply_markup: calYearMenu });
  }).row()
  .text("تصویر روز ناسا", async (ctx) => {
    const apod = await getApod();
    if (apod.img) {
      await ctx.api.sendPhoto(ctx.chat?.id!, `https://apod.nasa.gov/apod/${apod.img}`, {
        caption: `نام: ${apod.name}
<a href="https://apod.nasa.gov/apod/${apod.img}">تصویر با وضوح بیشتر</a>`,
        parse_mode: "HTML",
      });
      ctx.replyWithHTML(`توضیحات:
${apod.desc?.trim()}`);
    } else {
      await ctx.reply(apod.vid || "Error");
    }
    ctx.replyWithHTML(`توضیحات:
${apod.desc?.trim()}`);
  }).text(
    "عکس از کنجکاوی",
    async (ctx) => {
      const mri = await getMRI();
      await ctx.api.sendPhoto(ctx.chat?.id!, mri, {
        caption: "عکسی از مریخ‌نورد Curiosity",
      });
    },
  );

bot.use(work);

bot.command("start", async (ctx) => {
  try {
    await ctx.replyWithHTML(
      `با این ربات میتونی ستاره ای که نورش هم‌سنته رو پیدا کنی و عکسی که تلسکوپ هابل توی روز تولدت گرفته و عکس روز ناسا رو ببینی ✨

با دکمه های زیر کاری که میخوای برات انجام بدم رو انتخاب کن 🤓`,
      { reply_markup: work },
    );
  } catch (error) {
    bot.start();
  }
});
bot.catch(errorHandler);
// Start the bot.
bot.start();
function errorHandler(err: BotError) {
  console.error("Error: ", err);
}
