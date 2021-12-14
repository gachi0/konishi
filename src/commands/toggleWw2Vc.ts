import { delAry, GuildEntity, ICommand } from "../bot";
import { channelMention, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, VoiceChannel } from "discord.js";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setName("toggle_ww2vc")
        .addChannelOption(o => o
            .setName("channel")
            .setDescription("省略した場合は新しくチャンネルを作成します"))
        .setDescription("指定したチャンネルを個人チャンネル作成部屋に設定します（既に設定されている場合は解除されます）");
    adminOnly = true;
    guildOnly = true;

    execute = async (intr: CommandInteraction) => {
        if (!intr.guild) return;

        const ch = intr.options.getChannel("channel");
        const guild = await GuildEntity.get(intr.guildId);
        let ww2vc: VoiceChannel;

        // channel引数が省略された
        if (!ch) {
            ww2vc = await intr.guild.channels.create("個人チャンネル作成部屋", { type: "GUILD_VOICE" });
            guild.ww2vc.push(ww2vc.id);
            await intr.reply(`${channelMention(ww2vc.id)}を個人チャンネル作成部屋に設定しました！`);
        }
        // ボイスチャンネル以外が指定された
        else if (!(ch instanceof VoiceChannel)) {
            await intr.reply({ content: "ボイスチャンネルを指定してください！", ephemeral: true });
            return;
        }
        else {
            // 既に個人チャンネル作成部屋
            if (guild.ww2vc.includes(ch.id)) {
                delAry(guild.ww2vc, ch.id);
                await intr.reply(`${channelMention(ch.id)}を個人チャンネル作成部屋から解除しました！`);
            }
            // 個人チャンネル作成部屋になっていない
            else {
                guild.ww2vc.push(ch.id);
                await intr.reply(`${channelMention(ch.id)}を個人チャンネル作成部屋に設定しました！`);
            }
        }
        await GuildEntity.repo.save(guild);
    };
};