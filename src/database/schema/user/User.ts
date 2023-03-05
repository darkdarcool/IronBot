import { User as DiscordUser } from "discord.js";
export interface User {
  id: string;
  avatar: string | null;
  quests?: {
    questId: string;

  };
  violations: number;
  isBanned: boolean;
  items: any[]; // TODO: Create item type
  level: number;
  levelProgression: number;
  money: number;
}

export function createUser(user: DiscordUser): User {
  return {
    id: user.id,
    avatar: user.avatarURL() ?? null,
    violations: 0,
    isBanned: false,
    items: [],
    level: 0,
    levelProgression: 0,
    money: 0
  } as unknown as User;
}