import { loadEnv } from "./utils/loadenv.js";
loadEnv();
import Bot from "./bot.js";

const bot = new Bot(process.env.TOKEN as string, process.env.PREFIX as string);
bot.start();
