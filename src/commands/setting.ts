import { GuildEntity, ICommand } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";

// const userMention = (id: string) => `<@!${id}>`;
const roleMention = (id: string) => `<@&${id}>`;
const chMention = (id: string) => `<#${id}>`;

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setName("setting")
        .setDescription("設定の一覧を表示します！");

    adminOnly = true;

    execute = async (intr: CommandInteraction) => {
        if (!intr.guild) return;
        await intr.deferReply();
        const guild = await GuildEntity.get(intr.guildId);
        await guild.existCheck(intr.guild);

        const mapToStr = (ary: string[], fn: (s: string) => string): string => {
            const result = ary.map(fn).toString();
            return result === "" ? "なし" : result;
        };

        const embed = new MessageEmbed()
            .setTitle("設定の一覧")
            .addField("参加者挨拶チャンネル", mapToStr(guild.welcCh, chMention))
            .addField("挨拶内容", mapToStr(guild.welcMsg, m => `\`${m}\``))
            .addField("ほんまの荒らし部屋", mapToStr(guild.honmaCh, chMention))
            .addField("vcロール", mapToStr(guild.vcRole, roleMention))
            .addField("vc参加者挨拶チャンネル", mapToStr(guild.vcWelcCh, chMention))
            .addField("vc挨拶内容", mapToStr(guild.vcWelcMsg, m => `\`${m}\``))
            .addField("スレッド自動作成部屋", mapToStr(guild.threadCh, chMention))
            .addField("個人通話作成部屋", mapToStr(guild.ww2vc, chMention));

        await intr.followUp({ embeds: [embed] });
    };
};