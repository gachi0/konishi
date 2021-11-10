import { Role } from "discord.js";
import { delAry, GuildEntity, IEvent } from "../bot";

export default new class implements IEvent {
    name = "roleDelete";
    execute = async (role: Role) => {
        const guild = await GuildEntity.get(role.guild.id);
        delAry(guild.vcRole, role.id);
        await GuildEntity.repo.save(guild);
    };
};