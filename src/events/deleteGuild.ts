import { Guild } from "discord.js";
import { GuildEntity, IEvent } from "../bot";

export default new class implements IEvent {
    name = "guildDelete";
    execute = async (guild: Guild) => {
        await GuildEntity.repo.remove(await GuildEntity.get(guild.id));
    };
};