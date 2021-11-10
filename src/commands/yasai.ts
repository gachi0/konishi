import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { ICommand } from "../bot";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setName("yasai")
        .setDescription("や、やさい食べてますか？ｗ");

    execute = async (intr: CommandInteraction) => {
        await intr.reply(`ホントクソな質問だよな。お前死んだ方がいいよ。
肉の写真をアップしてるのはインスタで和牛を広めたいからってんの見てわからない？お前クソ？そもそもふつうに野菜は好きだからたくさん食べてるけどインスタでそれをアップしてもクソの役にも立たねーだろ。それを野菜とかを子供の頃嫌いだっただろうお前みたいなやつらに邪智されたくないね。
おれは美味しい野菜を子供の頃からたくさん食べててむしろ肉より野菜の方が好きだった。それは食ってた肉がまずかったからだ。それを良薬口に苦し的な文脈で野菜を食べた方が健康ですよって上からマウントでクソコメント送るなボケ。二度と来るな`);
    };
};