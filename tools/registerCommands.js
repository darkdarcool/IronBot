import * as discord from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

    


const client = new discord.Client({ intents: [discord.GatewayIntentBits.Guilds, discord.GatewayIntentBits.Guilds] });

let guild_id = "1081229630515716136";
let setLogComamnd = new discord.SlashCommandBuilder()
  .setName("setlog")
  .setDescription("Set the log channel") // set channel type to text
  .addChannelOption(option => { 
    option.setName("channel").setDescription("The channel to set as the log channel").setRequired(true)
    option.channel_types = [discord.ChannelType.GuildText];
    return option;
  });

let emojiGameCommand = new discord.SlashCommandBuilder()
  .setName("emojigame")
  .setDescription("Start an emoji game")



client.on('ready', async () => {
  await client.application.commands.create(setLogComamnd, guild_id);
  await client.application.commands.create(emojiGameCommand, guild_id);

  console.log('Ready!')
  process.exit(0);
});

client.login(process.env.TOKEN);

