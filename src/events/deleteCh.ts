import { DMChannel, GuildChannel } from "discord.js";
import { delAry, GuildEntity, IEvent } from "../bot";

export default new class implements IEvent {
    name = "channelDelete";
    execute = async (ch: DMChannel | GuildChannel) => {
        if (ch instanceof DMChannel) return;
        const gld = await GuildEntity.get(ch.guildId);
        delAry(gld.welcCh, ch.id);
        delAry(gld.honmaCh, ch.id);
        delAry(gld.vcWelcCh, ch.id);
        delAry(gld.threadCh, ch.id);
        delAry(gld.ww2vc, ch.id);
        await GuildEntity.repo.save(gld);
    };
};