import { GuildEntity, IEvent } from "../bot";
import { Message } from "discord.js";

export default new class implements IEvent {
    name = "messageCreate";
    execute = async (msg: Message) => {
        if (!msg.guild || !msg.member) return;
        // メッセージの先頭に[konishi-ignore]を付けると無視される
        if (/^\[\s*konishi\s*-\s*ignore\s*]/.test(msg.content.toLowerCase()) && msg.member?.permissions.has("ADMINISTRATOR")) return;

        const guild = await GuildEntity.get(msg.guild.id);

        if (guild.honmaCh.includes(msg.channelId)) {
            await msg.delete();
        }
        if (guild.threadCh.includes(msg.channelId)) {
            await msg.startThread({ name: `${msg.member.displayName}のスレッド` });
        }
    };
};