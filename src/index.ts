import { allImport, client, DBInit, IEvent } from "./bot";
import { token } from "../config.json";

const main = async () => {
    // イベント登録
    for (const e of await allImport("events") as IEvent[]) {
        client[e.once ? "once" : "on"](e.name, (...args) => e.execute(...args).catch(console.error));
    }
    await DBInit();
    await client.login(token);
};

main();