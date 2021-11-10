import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { ICommand } from "../bot";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .addRoleOption(o => o.setDescription("付けるロール").setName("role").setRequired(true))
        .setDescription("指定されたロールを全員に付けます！")
        .setName("add_role_everyone");
    adminOnly = true;
    execute = async (intr: CommandInteraction) => {
        if (!intr.guild) return;
        const role = intr.options.getRole("role");
        if (!role) {
            await intr.reply("ロールが指定されていません！");
            return;
        }
        await intr.reply(`${role.name}を全員に付与します。これには時間がかかる場合があります`);
        for (const m of (await intr.guild.members.fetch()).values()) {
            await m.roles.add(role.id);
        }
        await intr.followUp("ロールを全員に付与しました！");
    };
};