import { Guild } from "discord.js";

export interface Server {
  id: string;
  logChannel: string | undefined;
  violaters: string[]; // list of offender ids,
  allowedHosts: string[]; // list of allowed hosts,
  violationLimit: number;
}

export function createServer(guild: Guild, logChannel: string | undefined): Server {
  return {
    id: guild.id,
    logChannel: logChannel,
    violaters: [],
    violationLimit: 10,
    allowedHosts: []
  } as unknown as Server;
}