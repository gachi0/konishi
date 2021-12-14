import { delAry, GuildEntity, ICommand } from "../bot";
import { channelMention, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, TextChannel } from "discord.js";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setName("toggle_honmach")
        .addChannelOption(o => o
            .setName("channel")
            .setDescription("省略した場合は新しくチャンネルを作成します"))
        .setDescription("指定したチャンネルをほんまの荒らし部屋に設定します（既に設定されている場合は解除されます）");
    adminOnly = true;
    guildOnly = true;

    execute = async (intr: CommandInteraction) => {
        if (!intr.guild) return;

        const ch = intr.options.getChannel("channel");
        const guild = await GuildEntity.get(intr.guildId);
        let honmaCh: TextChannel;

        // channel引数が省略された
        if (!ch) {
            honmaCh = await intr.guild.channels.create("ほんまの荒らし部屋");
            guild.honmaCh.push(honmaCh.id);
            await intr.reply(`${channelMention(honmaCh.id)}をほんまの荒らし部屋に設定しました！`);
        }
        // テキストチャンネル以外が指定された
        else if (!(ch instanceof TextChannel)) {
            await intr.reply({ content: "テキストチャンネルを指定してください！", ephemeral: true });
            return;
        }
        else {
            // 既にほんまの荒らし部屋になっている
            if (guild.honmaCh.includes(ch.id)) {
                delAry(guild.honmaCh, ch.id);
                await intr.reply(`${channelMention(ch.id)}をほんまの荒らし部屋から解除しました！`);
            }
            // ほんまの荒らし部屋になっていない
            else {
                guild.honmaCh.push(ch.id);
                await intr.reply(`${channelMention(ch.id)}をほんまの荒らし部屋に設定しました！`);
            }
        }
        await GuildEntity.repo.save(guild);
    };
};