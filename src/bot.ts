import { Client, Message, GatewayIntentBits, Guild, ChatInputCommandInteraction, UserContextMenuCommandInteraction, CacheType, MessageContextMenuCommandInteraction, ButtonInteraction } from "discord.js";
import commands from "./commands/index.js";
import Cooldowns from "./Cooldowns.js";
import { createUser, createServer } from "./database/schema/index.js";
import Moderation from "./Moderation.js";
import { getDB } from "./database/mongo.js";

let db = await getDB("dev");
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
    
    let serverExists = await db.collection("servers").findOne({ id: message.guild?.id });
    let guild = message.guild as Guild;
    if (!serverExists) {
      let channelId = guild.channels.cache.find(channel => channel.name === "logs");
      let server = createServer(message.guild as Guild, channelId?.id as string | undefined);
      await db.collection("servers").insertOne(server);
    }
    if (message.author.bot || !message.guild) return;
    let userExists = await db.collection("users").findOne({ id: message.author.id });
    if (!userExists) {
      let user = createUser(message.author);
      await db.collection("users").insertOne(user);
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
      await commandObj.command.onButton(buttonInteraction, this.cooldown);
    }
  }
}