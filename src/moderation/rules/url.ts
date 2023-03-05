import Rule from "./Rule.js";

export default class Rule_URL extends Rule {
  public readonly name = "URL";

  constructor(content: string) {
    super("URL", content, 1);
  }

  public async match(): Promise<Boolean> {
    let content = this.content;
    if (content.includes("http://") || content.includes("https://")) {
      return true;
    }
    return false;
  }
}