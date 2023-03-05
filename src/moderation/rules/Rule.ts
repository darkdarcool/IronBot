export default class Rule {
  public readonly name: string;
  public readonly content: string;
  public readonly level: number;

  constructor(name: string, content: string, level: number) {
    this.name = name;
    this.content = content;
    this.level = level;
  }

  public async match(): Promise<Boolean> {
    let content = this.content;

    return true;
  }
}