import { default as SetLogCommand } from "./setLog/index.js";
import { default as EmojiGameCommand } from "./emojiGame/index.js"

export default [
  {
    "name": "setlog",
    command: new SetLogCommand()
  },
  {
    name: "emojigame",
    command: new EmojiGameCommand()
  }
];