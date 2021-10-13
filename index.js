const fs = require("fs");
const { Client, Intents } = require("discord.js");
const { token } = require("./config.json");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// イベント登録
fs.readdirSync("./events")
    .filter(f => f.endsWith(".js"))
    .map(f => require(`./events/${f}`))
    .forEach(e => client.on(e.name, (...args) => e.execute(...args)));

client.login(token);