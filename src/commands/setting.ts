import { allDisable, genAwaitMsgComponent, GuildEntity, ICommand } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";

// const userMention = (id: string) => `<@!${id}>`;
const roleMention = (id: string) => `<@&${id}>`;
const chMention = (id: string) => `<#${id}>`;

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .addSubcommand(sub =>
            sub.setName("list").setDescription("設定の一覧を表示します！"))
        .addSubcommand(sub =>
            sub.setName("init").setDescription("設定を初期化します！"))
        .setName("setting")
        .setDescription("設定に関するコマンド");

    adminOnly = true;

    execute = async (intr: CommandInteraction) => {
        const subcmd = intr.options.getSubcommand();
        if (subcmd === "list") { await listCmd(intr); }
        else if (subcmd === "init") { await initCmd(intr); }
    };
};

const listCmd = async (intr: CommandInteraction) => {
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

const initCmd = async (intr: CommandInteraction) => {
    if (!intr.guild || !(intr.channel instanceof TextChannel))
        return;

    // 初期化の確認に使うメッセージ
    const initReplyContent = {
        content: "設定をリセットします。よろしいですね！？",
        components: [new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("konishiAgreeInit")
                .setLabel("はい")
                .setStyle("DANGER"),
            new MessageButton()
                .setCustomId("konishiDisagreeInit")
                .setLabel("いいえ")
                .setStyle("SECONDARY")
        )]
    };

    await intr.reply(initReplyContent);

    // 初期化するかどうかのボタンが押されるまで待つ
    const initReply = await intr.fetchReply();
    const btnIntr = await genAwaitMsgComponent(intr.channel, intr.user.id)(initReply.id);
    await intr.editReply(allDisable(initReplyContent));

    if (btnIntr?.customId === "konishiAgreeInit") {
        await GuildEntity.repo.save(new GuildEntity(intr.guild.id));
        await btnIntr.reply("設定のリセットが完了しました！");
    }
    else if (btnIntr) {
        await btnIntr.reply("設定を中断しました！");
    }
    else {
        await intr.followUp("設定を中断しました！");
    }
};