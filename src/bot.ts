import { Client, Message, GatewayIntentBits, Guild, ChatInputCommandInteraction, UserContextMenuCommandInteraction, CacheType, MessageContextMenuCommandInteraction, ButtonInteraction } from "discord.js";
import commands from "./commands/index.js";
import setLog from "./commands/setLog/index.js";
import Cooldowns from "./Cooldowns.js";
import { set, exists, update } from "./database/firebase.js";
import { createUser, createServer } from "./database/schema/index.js";
import Moderation from "./Moderation.js";

export type Interaction = ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction;

const logChannel = "logChannel";
export default class Bot {
  private readonly token: string;
  private readonly prefix: string;
  private readonly client: Client;
  private readonly moderation: Moderation;
  private cooldown: Cooldowns;
  constructor(token: string, prefix: string) {
    this.token = token;
    this.prefix = prefix;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildIntegrations,

      ],
    });
    // find channel by name "logs" 
    this.moderation = new Moderation(this.client);
    this.cooldown = new Cooldowns();
  }
  public start() {
    this.client.on("ready", () => {
      console.log(`Logged in as ${this.client.user?.tag}!`);
    });
    this.client.on("messageCreate", async (message) => await this.onMessage(message));
    this.client.on("interactionCreate", async (interaction) => {
      return this.onInteraction(interaction as Interaction);
    });

    // on join server
    this.client.login(this.token);
  }

  private async onMessage(message: Message) {
    let guild = message.guild as Guild;
    if (await (!exists("servers", guild.id))) {
      let channelId = guild.channels.cache.find(channel => channel.name === "logs");
      set("servers", guild.id, createServer(guild, channelId?.id as string | undefined));
    }
    if (message.author.bot || !message.guild) return;
    if (message.content.startsWith(this.prefix) && await (!exists("users", message.author.id))) {
      await set("users", message.author.id, createUser(message.author));
    }
    if (message.content.startsWith(this.prefix)) {
      let msg = message.content.replace(this.prefix, "");
      const args = msg.split(" ");
      const command = args[0];
      switch (command) {
        case "setLog":
          // const channelId = await setLog(args[1], message.guild, message);
          // console.log(channelId);
          // let server = createServer(message.guild as Guild, channelId);
          // await set("servers", guild.id as string, server);
          break;
        default:
          break;
      }
    }
    else await this.moderation.onMessage(message);
  }
  
  private async onInteraction(interaction: Interaction) {
    if (interaction.isCommand()) {
      let commandObj = commands.find(command => command.name === interaction.commandName) as any;
      let command = await commandObj.command.run(interaction, this.cooldown);
    }

    if (interaction.isButton()) {
      let buttonInteraction: ButtonInteraction = interaction;
      let commandName = buttonInteraction.customId;
      if (commandName.includes(":")) commandName = commandName.split(":")[0];
      let commandObj = commands.find(command => command.name === commandName) as any;
      let command = await commandObj.command.onButton(buttonInteraction, this.cooldown);
    }
  }
}