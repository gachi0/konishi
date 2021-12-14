import { delAry, GuildEntity, ICommand } from "../bot";
import { channelMention, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, TextChannel } from "discord.js";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setName("toggle_vc_welcomech")
        .addChannelOption(o => o
            .setName("channel")
            .setDescription("省略した場合は新しくチャンネルを作成します"))
        .setDescription("指定したチャンネルをVC挨拶部屋に設定します（既に設定されている場合は解除されます）");
    adminOnly = true;
    guildOnly = true;

    execute = async (intr: CommandInteraction) => {
        if (!intr.guild) return;

        const ch = intr.options.getChannel("channel");
        const guild = await GuildEntity.get(intr.guildId);
        let vcWelcCh: TextChannel;

        // channel引数が省略された
        if (!ch) {
            vcWelcCh = await intr.guild.channels.create("VC参加通知");
            guild.vcWelcCh.push(vcWelcCh.id);
            await intr.reply(`${channelMention(vcWelcCh.id)}をVC挨拶部屋に設定しました！`);
        }
        // テキストチャンネル以外が指定された
        else if (!(ch instanceof TextChannel)) {
            await intr.reply({ content: "テキストチャンネルを指定してください！", ephemeral: true });
            return;
        }
        else {
            // 既にVC挨拶部屋
            if (guild.vcWelcCh.includes(ch.id)) {
                delAry(guild.vcWelcCh, ch.id);
                await intr.reply(`${channelMention(ch.id)}をVC挨拶部屋から解除しました！`);
            }
            // VC挨拶部屋になっていない
            else {
                guild.vcWelcCh.push(ch.id);
                await intr.reply(`${channelMention(ch.id)}をVC挨拶部屋に設定しました！`);
            }
        }
        await GuildEntity.repo.save(guild);
    };
};