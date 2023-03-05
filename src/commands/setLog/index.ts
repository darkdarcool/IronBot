import { EmbedBuilder } from "discord.js";
import { Interaction } from "../../bot.js";
import Command from "../Command.js";
import { get, set } from "../../database/firebase.js"
import { Server } from "../../database/schema/index.js";

export default class SetLog extends Command { 
  constructor() {
    super("setLog", 1, "Set the log channel", "setLog <channel name>", "moderation");
  }
  async run(interaction: Interaction) {
    await interaction.deferReply({ ephemeral: true });
    const channelId = interaction.options.get("channel", true).value;
    if (channelId) {
      let embed = new EmbedBuilder()
        .setTitle("Log Channel")
        .setDescription(`Log channel has been moved to the specified channel`)
        .setColor(0x00ff00)
        .setTimestamp(new Date())
        .setFooter({ text: "Log Channel" })
      let serverInfo = await get<Server>("servers", interaction.guildId as string);
      serverInfo.logChannel = channelId as string;
      await set("servers", interaction.guildId as string, serverInfo);
      await interaction.editReply({ embeds: [embed] });
      return;
    }
    let embed = new EmbedBuilder()
      .setTitle("Log Channel")
      .setDescription(`Log channel not found`)
      .setColor(0xff0000)
      .setTimestamp(new Date())
      .setFooter({ text: "Log Channel" })
    await interaction.editReply({ embeds: [embed] });
    return;
  }
}