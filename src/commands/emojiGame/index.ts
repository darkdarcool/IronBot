import { Message, Guild, EmbedBuilder, Channel, Client, ButtonBuilder, ActionRowBuilder, ButtonStyle, ButtonInteraction } from "discord.js";
import { Interaction } from "../../bot.js";
import Command from "../Command.js";
import { get, set } from "../../database/firebase.js"
import { User } from "../../database/schema/index.js";
import Cooldowns from "../../Cooldowns.js";

type Games = {
  [user: string]: {
    answer: string,
  }
}

export default class EmojiGameCommand extends Command { 
  private readonly emojis: string[] = ["😄", "😃", "😀", "😊", "😉", "😍", "😘", "😚", "😗", "😙", "😜", "😝", "😛", "🤑", "🤗", "🤓", "😎", "🤡", "🤠", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥺", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "🤡", "🤥", "🤫", "🤭", "🧐", "🤓", "🤔", "🤨", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🙈", "🙉", "🙊", "👶", "👦", "👧", "👨", "👩", "👱‍♂️", "👱‍♀️", "👴", "👵", "👲", "👳‍♂"]

  public games: Games = {}
  private readonly rewardRange = [10, 20]; // min - max
  private readonly cooldown = 30; // seconds

  constructor() {
    super("emojigame", 0, "Play a game of emoji", "emojigame", "fun");
  }
  async run(interaction: Interaction, cooldown: Cooldowns) {
    if (cooldown.hasCooldown(interaction.user.id, this.name)) {
      await interaction.reply({ content: "You are on cooldown!", ephemeral: true });
      return;
    }
    // get 5 random emojis
    let emojis = this.emojis.sort(() => Math.random() - 0.5).slice(0, 5);
    let row = new ActionRowBuilder();
    let answer = emojis[Math.floor(Math.random() * emojis.length)];
    let message = await interaction.reply({ ephemeral: true, content: "Remember this emoji: " + answer});
    setTimeout(async () => {
      emojis.forEach(emoji => {
        let button = new ButtonBuilder()
        .setEmoji(emoji)
        .setStyle(ButtonStyle.Primary)
        .setCustomId(this.name + ":" + emoji + ":" + interaction.user.id);
        row.addComponents(button);
        this.games[interaction.user.id] = { answer };
      });
      await interaction.editReply({ content: "Which emoji was it?", components: [row as any] });
    }, 2000);

    setTimeout(async () => {
      // check if game is still active, if so disable buttons
      if (this.games[interaction.user.id]) {
        let embed = new EmbedBuilder()
          .setTitle("EmojiGame - Time's Up!")
          .setDescription("You ran out of time!")
          .setTimestamp(new Date());
        await interaction.editReply({ content: "Time's up!", embeds: [embed], components: [] });
      }
      delete this.games[interaction.user.id];
    }, 20000)
  }
  async onButton(interaction: ButtonInteraction, cooldown: Cooldowns) {
    if (cooldown.hasCooldown(interaction.user.id, this.name)) {
      await interaction.reply({ content: "You are on cooldown!", ephemeral: true });
      return;
    } // don't let people spam buttons, or use buttons when on cooldown
    let gameOwner = interaction.customId.split(":")[2] as string;

    if (interaction.user.id != gameOwner) {
      await interaction.reply({ content: "This is not your game!", ephemeral: true });
      return;
    } // just to make sure
    let game = this.games[gameOwner];
    let userAnwer = interaction.component.emoji?.name;
    if (userAnwer == game.answer) { 
      let reward = Math.floor(Math.random() * (this.rewardRange[1] - this.rewardRange[0] + 1) + this.rewardRange[0])
      let embed = new EmbedBuilder()
        .setTitle("EmojiGame - Correct Answer!")
        .setDescription("You got the correct answer!\nYou have been awarded " + reward + " coins!")
        .setTimestamp(new Date());
      await interaction.reply({ ephemeral: true, embeds: [embed] });
      let userData = await get<User>("users", gameOwner);
      userData.money += reward;
      await set("users", gameOwner, userData);
    }
    else {
      let embed = new EmbedBuilder()
        .setTitle("EmojiGame - Incorrect Answer")
        .setDescription(`You got the wrong answer.
        The correct answer was ${game.answer}, you answered ${userAnwer}`)
        .setTimestamp(new Date());
      await interaction.reply({ ephemeral: true, embeds: [embed] });
    }

    // cleanup
    delete this.games[gameOwner];
    // add cooldown
    cooldown.addCooldown(interaction.user.id, this.name, this.cooldown * 1000); // 30 second cooldown

  }
}