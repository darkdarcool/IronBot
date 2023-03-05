export default class Cooldowns {
  public cooldowns: Map<string, Map<string, number>>;
  constructor() {
    this.cooldowns = new Map();
  }

  public addCooldown(command: string, user: string, time: number) {
    if (!this.cooldowns.has(command)) {
      this.cooldowns.set(command, new Map());
    }
    this.cooldowns.get(command)?.set(user, time);
    setTimeout(() => {
      this.removeCooldown(command, user);
    }, time);
  }

  public hasCooldown(command: string, user: string) {
    if (!this.cooldowns.has(command)) {
      return false;
    }
    return this.cooldowns.get(command)?.has(user) || false;
  }

  public removeCooldown(command: string, user: string) {
    if (!this.cooldowns.has(command)) {
      return;
    }
    this.cooldowns.get(command)?.delete(user);
  }
}