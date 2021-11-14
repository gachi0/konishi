import { GuildEntity, ICommand } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, InteractionReplyOptions, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

const allDisable = (opt: InteractionReplyOptions) => {
    if (!opt.components) throw new Error("componentsがnullでした");
    for (let i = 0; i < opt.components.length; i++) {
        opt.components[i].components = opt.components[i].components.map(i => i instanceof MessageButton ? i.setDisabled(true) : i);
    }
    return opt;
};

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setName("init")
        .setDescription("初期化と初期設定をします！");

    adminOnly = true;

    execute = async (intr: CommandInteraction) => {
        if (!intr.guild) return;

        // 初期化の確認に使うメッセージ
        const initReplyContent = {
            content: "初期化します。よろしいですね！？",
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
        if (!intr.channel) return;
        await intr.reply(initReplyContent);

        // 初期化するかどうかのボタンが押されるまで待つ
        const initReply = await intr.fetchReply();
        const initBtnIntr = await intr.channel.awaitMessageComponent({ filter: i => i.message.id === initReply.id && i.user.id === intr.user.id, time: 30000 });

        await intr.editReply(allDisable(initReplyContent));
        const osusumeReplyContent = {
            content: "初期化が完了しました！botのおすすめ設定を適用しますか？",
            components: [new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("konishiAgreeRecommendedSetting")
                    .setLabel("はい")
                    .setStyle("PRIMARY"),
                new MessageButton()
                    .setCustomId("konishiDisagreeRecommendedSetting")
                    .setLabel("いいえ")
                    .setStyle("SECONDARY")
            )]
        };

        if (initBtnIntr.customId === "konishiAgreeInit") {
            await GuildEntity.repo.save(new GuildEntity(intr.guild.id));
            await initBtnIntr.reply(osusumeReplyContent);
        }
        else if (initBtnIntr.customId === "konishiDisagreeInit") {
            await initBtnIntr.reply("初期化を中止します。");
            return;
        }

        // おすすめの設定を適用するかどうかのボタンが押されるのを待つ
        const osusumeBtnReply = await initBtnIntr.fetchReply();
        const osusumeBtnIntr = await intr.channel.awaitMessageComponent({ filter: i => i.message.id === osusumeBtnReply.id && i.user.id === intr.user.id, time: 30000 });

        await initBtnIntr.editReply(allDisable(osusumeReplyContent));
        if (osusumeBtnIntr.customId === "konishiAgreeRecommendedSetting") {
            await osusumeBtnIntr.reply("設定を作成中…");
            const guild = await GuildEntity.get(intr.guild.id);

            const cate = await intr.guild.channels.create("konishi", { type: "GUILD_CATEGORY" });
            if (!cate) return;

            const honmaCh = await cate.createChannel("ほんまの荒らし部屋", { type: "GUILD_TEXT" });
            await honmaCh.send({
                embeds: [new MessageEmbed()
                    .setTitle("このチャンネルについて")
                    .setDescription("このチャンネルはbotによって作成されたチャンネルです。\rここに送信されたメッセージは送られた瞬間削除されます。")
                ]
            });

            const threadCh = await cate.createChannel("スレッドチャンネル",
                { type: "GUILD_TEXT", rateLimitPerUser: 180 });
            await threadCh.send({
                embeds: [new MessageEmbed()
                    .setTitle("このチャンネルについて")
                    .setDescription("このチャンネルはbotによって作成されたチャンネルです。\rここメッセージを送信すると、自動的にメッセージの内容がタイトルのスレッドが建てられます。")
                ]
            });

            const vcRole = await intr.guild.roles.create({ name: "konishi-vc" });
            const vcTextCh = await cate.createChannel("通話部屋", {
                type: "GUILD_TEXT", permissionOverwrites: [
                    { id: intr.guild.roles.everyone, deny: "VIEW_CHANNEL" },
                    { id: vcRole.id, allow: "VIEW_CHANNEL" }
                ]
            });
            await vcTextCh.send({
                embeds: [new MessageEmbed()
                    .setTitle("このチャンネルについて")
                    .setDescription("このチャンネルはbotによって作成されたチャンネルです。\rどこかしらの通話に入っている人のみが見れます。")
                ]
            });

            const ww2Cate = await intr.guild.channels.create("第三次世界大戦", { type: "GUILD_CATEGORY" });
            const ww2 = await ww2Cate.createChannel("通話個室作成部屋", { type: "GUILD_VOICE", userLimit: 1 });

            guild.honmaCh = [honmaCh.id];
            guild.threadCh = [threadCh.id];
            guild.vcRole = [vcRole.id];
            guild.vcWelcCh = [vcTextCh.id];
            guild.ww2vc = [ww2.id];
            await GuildEntity.repo.save(guild);
            await osusumeBtnIntr.editReply("設定が完了しました！");
        }
        else if (osusumeBtnIntr.customId === "konishiDisagreeRecommendedSetting") {
            await osusumeBtnIntr.reply("設定が完了しました！");
        }
    };
};
