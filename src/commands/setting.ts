import { allDisable, genAwaitMsgComponent, GuildEntity, ICommand, mapToStr } from "../bot";
import { channelMention, inlineCode, roleMention, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, TextBasedChannels } from "discord.js";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .addSubcommand(sub =>
            sub.setName("list").setDescription("設定の一覧を表示します！"))
        .addSubcommand(sub =>
            sub.setName("init").setDescription("設定を初期化します！"))
        .setName("setting")
        .setDescription("設定に関するコマンド");
    adminOnly = true;
    guildOnly = true;

    execute = async (intr: CommandInteraction, ch: TextBasedChannels) => {
        if (!intr.channel) return;
        const subcmd = intr.options.getSubcommand();
        if (subcmd === "list") { await listCmd(intr); }
        else if (subcmd === "init") { await initCmd(intr, ch); }
    };
};

const listCmd = async (intr: CommandInteraction) => {
    if (!intr.guild) return;
    await intr.deferReply();
    const guild = await GuildEntity.get(intr.guildId);
    await guild.existCheck(intr.guild);
    const embed = new MessageEmbed()
        .setTitle("設定の一覧")
        .addField("参加者挨拶チャンネル", mapToStr(guild.welcCh, channelMention))
        .addField("挨拶内容", mapToStr(guild.welcMsg, inlineCode))
        .addField("ほんまの荒らし部屋", mapToStr(guild.honmaCh, channelMention))
        .addField("vcロール", mapToStr(guild.vcRole, roleMention))
        .addField("vc参加者挨拶チャンネル", mapToStr(guild.vcWelcCh, channelMention))
        .addField("vc挨拶内容", mapToStr(guild.vcWelcMsg, inlineCode))
        .addField("スレッド自動作成部屋", mapToStr(guild.threadCh, channelMention))
        .addField("個人通話作成部屋", mapToStr(guild.ww2vc, channelMention));

    await intr.followUp({ embeds: [embed] });
};

const initCmd = async (intr: CommandInteraction, ch: TextBasedChannels) => {
    if (!intr.guild) return;

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
    const btnIntr = await genAwaitMsgComponent(ch, intr.user.id)(initReply.id);
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