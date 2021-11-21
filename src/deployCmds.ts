import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import { allImport, ICommand } from "./bot";
import { token, guildId, clientId } from "../config.json";
const rest = new REST({ version: "9" }).setToken(token);

const main = async () => {
    if (process.argv[2] === "guild") {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: (await allImport("commands") as ICommand[]).map(c => c.data.toJSON())
        });
        console.log(`${guildId}にコマンドを登録しました！`);
    }
    else if (process.argv[2] === "app") {
        await rest.put(Routes.applicationCommands(clientId), {
            body: (await allImport("commands") as ICommand[]).map(c => c.data.toJSON())
        });
        console.log("コマンドを登録しました！（反映には数時間かかります）");
    }
    else if (process.argv[2] === "clearguild") {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
        console.log(`${guildId}からコマンドを削除しました！`);
    }
    else if (process.argv[2] === "clearapp") {
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        console.log("コマンドを削除しました！（反映には数時間かかります）");
    }
    else throw Error(`不正な引数: ${process.argv[2]}`);
};

main();