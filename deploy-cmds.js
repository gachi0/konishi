const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { token, guildId, clientId } = require("./config.json");

//コマンド登録
const rest = new REST({ version: "9" }).setToken(token);
rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: fs.readdirSync("./commands")
        .filter(f => f.endsWith(".js"))
        .map(f => require(`./commands/${f}`).data.toJSON())
})
    .then(() => console.log("コマンドを正常に登録完了しました！"))
    .catch(console.error);