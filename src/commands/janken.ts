import { allDisable, genAwaitMsgComponent, ICommand, mapToStr } from "../bot";
import { SlashCommandBuilder, userMention } from "@discordjs/builders";
import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";

type JankenUser = Record<string, "gu" | "choki" | "pa">;


export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setName("janken")
        .setDescription("複数人でじゃんけんをします！");

    execute = async (intr: CommandInteraction) => {
        if (!(intr.channel instanceof TextChannel)) return;
        const jankenUsers: JankenUser = {};

        const replyContent = () => {
            return {
                embeds: [new MessageEmbed()
                    .setTitle("じゃんけんぽん！")
                    .addField("現在の参加者", mapToStr(Object.keys(jankenUsers), userMention))
                ],
                components: [new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId("konishiGu")
                        .setLabel("ぐー")
                        .setEmoji("👊")
                        .setStyle("PRIMARY"),
                    new MessageButton()
                        .setCustomId("konishiChoki")
                        .setLabel("ちょき")
                        .setEmoji("✌")
                        .setStyle("PRIMARY"),
                    new MessageButton()
                        .setCustomId("konishiPa")
                        .setLabel("ぱー")
                        .setEmoji("🖐")
                        .setStyle("PRIMARY"),
                    new MessageButton()
                        .setCustomId("konishiCancel")
                        .setLabel("参加取り消し")
                        .setStyle("SECONDARY")
                )]
            };
        };
        const gameMasterReply = {
            content: "じゃんけんを開始しました！\r結果を発表したい場合は**`締め切り`**ボタンを押してください！\r放置されていると自動で締め切りされます！",
            components: [new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("konishiJankenStart")
                    .setLabel("締め切り！")
                    .setStyle("PRIMARY")
            )],
            ephemeral: true
        };

        await intr.reply(replyContent());
        const replyed = await intr.fetchReply();
        await intr.followUp(gameMasterReply);
        for (; ;) {
            const com = await genAwaitMsgComponent(intr.channel)(replyed.id, 60000);
            if (!com) { break; }
            else if (com.customId === "konishiGu") {
                jankenUsers[com.user.id] = "gu";
                await com.reply({ content: "あなたはグーを出しました！", ephemeral: true });
            }
            else if (com.customId === "konishiChoki") {
                jankenUsers[com.user.id] = "choki";
                await com.reply({ content: "あなたはチョキを出しました！", ephemeral: true });
            }
            else if (com.customId === "konishiPa") {
                jankenUsers[com.user.id] = "pa";
                await com.reply({ content: "あなたはパーを出しました！", ephemeral: true });
            }
            else if (com.customId === "konishiCancel") {
                delete jankenUsers[com.user.id];
                await com.reply({ content: "参加を取り消しました！", ephemeral: true });
            }
            await intr.editReply(replyContent());

            if (com.customId === "konishiJankenStart") {
                await com.reply({ content: "結果発表を行います！", ephemeral: true });
                break;
            }
        }

        await intr.editReply(allDisable(replyContent()));
        const chokis: JankenUser = {};
        const pas: JankenUser = {};
        const gus: JankenUser = {};

        for (const [id, hand] of Object.entries(jankenUsers)) {
            if (hand === "gu") gus[id] = hand;
            else if (hand === "choki") chokis[id] = hand;
            else if (hand === "pa") pas[id] = hand;
        }

        // 出されている手の種類の数が2以外ならあいこ
        if ([gus, chokis, pas].filter(h => Object.keys(h).length).length !== 2) {
            await intr.followUp({
                embeds: [new MessageEmbed()
                    .setTitle("あいこ！")
                    .addField("ぐー", mapToStr(Object.keys(gus), userMention))
                    .addField("ちょき", mapToStr(Object.keys(chokis), userMention))
                    .addField("ぱー", mapToStr(Object.keys(pas), userMention))
                ]
            });
            return;
        }

        // 判定
        if (!Object.keys(gus).length) {
            await intr.followUp({
                embeds: [new MessageEmbed()
                    .setTitle("✌ ちょきの勝ち！")
                    .addField("ちょき", mapToStr(Object.keys(chokis), userMention))
                    .addField("ぱー", mapToStr(Object.keys(pas), userMention))
                ]
            });
        }
        else if (!Object.keys(chokis).length) {
            await intr.followUp({
                embeds: [new MessageEmbed()
                    .setTitle("🖐 ぱーの勝ち！")
                    .addField("ぱー", mapToStr(Object.keys(pas), userMention))
                    .addField("ぐー", mapToStr(Object.keys(gus), userMention))
                ]
            });
        }
        else if (!Object.keys(pas).length) {
            await intr.followUp({
                embeds: [new MessageEmbed()
                    .setTitle("👊 ぐーの勝ち！")
                    .addField("ぐー", mapToStr(Object.keys(gus), userMention))
                    .addField("ちょき", mapToStr(Object.keys(chokis), userMention))
                ]
            });
        }
    };
};