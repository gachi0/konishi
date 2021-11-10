import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import { allImport, ICommand } from "./bot";
import { token, guildId, clientId } from "../config.json";

const main = async () => {

    let route: `/${string}`;

    if (process.argv[2] === "guild") {
        route = Routes.applicationGuildCommands(clientId, guildId);
    }
    else if (process.argv[2] === "app") {
        route = Routes.applicationCommands(clientId);
    }
    else throw Error(`不正な引数: ${process.argv[2]}`);

    await new REST({ version: "9" }).setToken(token)
        .put(route, {
            body: (await allImport("commands") as ICommand[]).map(c => c.data.toJSON())
        });

    console.log("コマンドを登録しました！");
};

main();