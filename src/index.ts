import { loadEnv } from "./utils/loadenv.js";
loadEnv();
import Bot from "./bot.js";
const bot = new Bot(process.env.TOKEN as string, process.env.PREFIX as string);

import { getDB } from "./database/mongo.js";

let db = await getDB("dev");

bot.start()
