import { Bot, type Context, webhookCallback } from "grammy";
import { type MyContext, runBot } from "./api/bot";
export interface Env {
	BOT_INFO: string;
	BOT_TOKEN: string;
}
export default {
	async fetch(request, env: Env, ctx): Promise<Response> {
		try {
			const bot = new Bot<MyContext>(env.BOT_TOKEN);
			runBot(bot);

			// Handle webhook request.  Crucially, only process POST requests.
			if (request.method === "POST") {
				//This is where the magic happens.  The path must match the path you set when registering the webhook with telegram.
				const result = await webhookCallback(bot, "cloudflare-mod")(request);
				return result;
			}
			// Respond to non-POST requests with a 200 OK.  This is important for Telegram's webhook verification.
			return new Response("OK");
		} catch (e: unknown) {
			console.log(e);
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;
