import Rule from "./Rule.js";
import badwords from "bad-words";

export default class Rule_Swear extends Rule {
  public readonly name = "Swears";

  constructor(content: string) {
    super("Swears", content, 3);
  }

  public async match(): Promise<Boolean> {
    let content = this.content;
    const filter = new badwords();
    if (filter.isProfane(content)) {
      return true;
    }
    return false;
  }
}