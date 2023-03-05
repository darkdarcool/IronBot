import * as Discord from 'discord.js';
import Rules from "./moderation/rules/index.js"
import Rule from './moderation/rules/Rule.js';
import { exists, set, get } from './database/firebase.js';
import { createUser, Server, User } from './database/schema/index.js';

async function createUserIfNotExists(userId: string, bot: Discord.Client) {
  if (!exists("users", userId)) {
    let user = await bot.users.fetch(userId);
    await set("users", userId, createUser(user));
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
      await createUserIfNotExists(message.author.id, this.bot);
      let user = await get<User>("users", message.author.id);
      violated.forEach(async (rule) => {
        user.violations += rule.level;
      });
      await set("users", message.author.id, user);
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
    let server = await get<Server>("servers", serverId);
    return server.logChannel as string;
  }
}