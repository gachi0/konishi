import { delAry, GuildEntity, ICommand } from "../bot";
import { channelMention, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, TextChannel } from "discord.js";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setName("toggle_threadch")
        .addChannelOption(o => o
            .setName("channel")
            .setDescription("省略した場合は新しくチャンネルを作成します"))
        .setDescription("指定したチャンネルをスレッド作成部屋に設定します（既に設定されている場合は解除されます）");
    adminOnly = true;
    guildOnly = true;

    execute = async (intr: CommandInteraction) => {
        if (!intr.guild) return;

        const ch = intr.options.getChannel("channel");
        const guild = await GuildEntity.get(intr.guildId);
        let threadCh: TextChannel;

        // channel引数が省略された
        if (!ch) {
            threadCh = await intr.guild.channels.create("スレッド作成部屋");
            guild.threadCh.push(threadCh.id);
            await intr.reply(`${channelMention(threadCh.id)}をスレッド作成部屋に設定しました！`);
        }
        // テキストチャンネル以外が指定された
        else if (!(ch instanceof TextChannel)) {
            await intr.reply({ content: "テキストチャンネルを指定してください！", ephemeral: true });
            return;
        }
        else {
            // 既にスレッド作成部屋
            if (guild.threadCh.includes(ch.id)) {
                delAry(guild.threadCh, ch.id);
                await intr.reply(`${channelMention(ch.id)}をスレッド作成部屋から解除しました！`);
            }
            // スレッド作成部屋になっていない
            else {
                guild.threadCh.push(ch.id);
                await intr.reply(`${channelMention(ch.id)}をスレッド作成部屋に設定しました！`);
            }
        }
        await GuildEntity.repo.save(guild);
    };
};