const { SlashCommandBuilder } = require("@discordjs/builders");

const rand = (min, max) => Math.floor(Math.random() * (max - min) + min);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("random")
        .setDescription("ランダムな値を返します！")
        .addIntegerOption(o => o.setName("最小値").setDescription("最小値"))
        .addIntegerOption(o => o.setName("最大値").setDescription("最大値")),

    execute: async intr => {
        const min = intr.options.getInteger("最小値");
        const max = intr.options.getInteger("最大値");
        await intr.reply(rand(min, max).toString());
    }
};