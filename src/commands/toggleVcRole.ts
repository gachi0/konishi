import { delAry, GuildEntity, ICommand } from "../bot";
import { roleMention, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Role } from "discord.js";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setName("toggle_vcrole")
        .addRoleOption(o => o
            .setName("role")
            .setDescription("省略した場合は新しくロールを作成します"))
        .setDescription("指定したチャンネルを通話ロールに設定します（既に設定されている場合は解除されます）");
    adminOnly = true;
    guildOnly = true;

    execute = async (intr: CommandInteraction) => {
        if (!intr.guild) return;

        const ch = intr.options.getRole("role");
        const guild = await GuildEntity.get(intr.guildId);
        let vcRole: Role;

        // role引数が省略された
        if (!ch) {
            vcRole = await intr.guild.roles.create({ name: "通話role" });
            guild.vcRole.push(vcRole.id);
            await intr.reply(`${roleMention(vcRole.id)}を通話ロールに設定しました！`);
        }
        else {
            // 既に通話ロール
            if (guild.threadCh.includes(ch.id)) {
                delAry(guild.threadCh, ch.id);
                await intr.reply(`${roleMention(ch.id)}を通話ロールから解除しました！`);
            }
            // 通話ロールになっていない
            else {
                guild.threadCh.push(ch.id);
                await intr.reply(`${roleMention(ch.id)}を通話ロールに設定しました！`);
            }
        }
        await GuildEntity.repo.save(guild);
    };
};