import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, TextBasedChannels } from "discord.js";
import { allDisable, genAwaitMsgComponent, GuildEntity, ICommand } from "../bot";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setDescription("botのおすすめ設定をセットアップします！")
        .setName("osusume");
    adminOnly = true;
    guildOnly = true;

    execute = async (intr: CommandInteraction, ch: TextBasedChannels) => {
        if (!intr.guild) return;

        const replyContent = {
            content: "botのおすすめ設定を適用しますか？",
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
        await intr.reply(replyContent);

        // おすすめの設定を適用するかどうかのボタンが押されるのを待つ
        const replyMsg = await intr.fetchReply();
        const btnIntr = await genAwaitMsgComponent(ch, intr.user.id)(replyMsg.id);

        await intr.editReply(allDisable(replyContent));
        if (btnIntr?.customId === "konishiAgreeRecommendedSetting") {
            await btnIntr.reply("設定を作成中…");
            const guildData = await GuildEntity.get(intr.guild.id);

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

            // データベースに保存
            guildData.honmaCh.push(honmaCh.id);
            guildData.threadCh.push(threadCh.id);
            guildData.vcRole.push(vcRole.id);
            guildData.vcWelcCh.push(vcTextCh.id);
            guildData.ww2vc.push(ww2.id);
            await GuildEntity.repo.save(guildData);
            await btnIntr.editReply("設定が完了しました！");
        }
        else if (btnIntr) {
            await btnIntr.reply("設定を中断しました！");
        }
        else {
            await intr.followUp("設定を中断しました！");
        }
    };
};