import * as Discord from "discord.js";
import Rules from "./moderation/rules/index.js"
import Rule from './moderation/rules/Rule.js';
// import { exists, set, get } from './database/firebase.js';
import { getDB } from "./database/mongo.js"
import {  createUser, Server, User } from './database/schema/index.js';

let db = await getDB("dev");

async function createUserIfNotExists(user: Discord.User) {
  let userExists = db.collection("users").findOne({ id: user.id });
  if (!userExists) {
    let userData = createUser(user);
    await db.collection("users").insertOne(userData);
  }
  
}

export default class Moderation {
  private readonly bot: Discord.Client;
  constructor(bot: Discord.Client) {
    this.bot = bot;
  }

  public async onMessage(message: Discord.Message) {
    const violated = await this.scanMessage(message.content);
    if (violated.length == 0) return; // No rules violated
    let violatedRuleNames = violated.map((rule) => rule.name);
    let logChannelId = await this.getLogChannel(message.guildId as string);
    if (logChannelId) {
      let logChannel = this.bot.channels.cache.get(await logChannelId) as Discord.TextChannel;
      await createUserIfNotExists(message.author);
      let user = await db.collection("users").findOne({ id: message.author.id }) as unknown as User;
      violated.forEach(async (rule) => {
        user.violations += rule.level;
      });
      // await set("users", message.author.id, user);
      await db.collection("users").updateOne({ id: message.author.id }, { $set: user });
      let logEmbed = new Discord.EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Violation")
        .setDescription(`User ${message.author.username} violated the following rules: \n` +
        "```" + violatedRuleNames.join("\n") + "```")
        .setTimestamp(new Date())
        .setFooter({ text: "Violations: " + user.violations });
      await logChannel.send({ embeds: [logEmbed] });
    }
    await message.delete();
    let userEmbedMesssage = new Discord.EmbedBuilder()
      .setTitle("Rule violation")
      .setDescription(`You violated a rule in \`${message.guild?.name}\``)
      .setFooter({ text: "Ask a moderator to check the logs for more information" })
      .setTimestamp(new Date())
    message.author.createDM().then(async (dm) => {
    
      await dm.send({ embeds: [userEmbedMesssage] });
    });
  }

  private async scanMessage(content: string): Promise<Rule[]> {
    let matched: Rule[] = [];
    Rules.forEach(async (rule) => {
      let ruleClass = new rule(content);
      if (await ruleClass.match()) {
        matched.push(ruleClass);
      }
    });
    return matched;
  }

  public async getLogChannel(serverId: string): Promise<string> {
    let server = await db.collection("servers").findOne({ id: serverId }) as unknown as Server;
    return server.logChannel as string;
  }
}