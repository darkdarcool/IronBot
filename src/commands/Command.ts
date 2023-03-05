import { ButtonInteraction, Client, Message } from "discord.js";
import { Interaction } from "../bot.js";
import Cooldowns from "../Cooldowns.js";

export default class Command {
  public name: string;
  public paramCount: number;
  public description: string;
  public usage: string;
  public category: string;
  constructor(name: string, paramCount: number, description: string, usage: string, category: string) {
    this.name = name;
    this.paramCount = paramCount;
    this.description = description;
    this.usage = usage;
    this.category = category;
  }

  public async run(interaction: Interaction, cooldown: Cooldowns) {
    throw new Error("Command not implemented");
  }

  public async onButton(interaction: ButtonInteraction, cooldown: Cooldowns) {
    throw new Error("Command not implemented");
  }
}