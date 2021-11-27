import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageActionRow, MessageButton } from "discord.js";
import { genAwaitMsgComponent, ICommand } from "../bot";

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .addIntegerOption(o => o.setName("最小値").setDescription("省略した場合は0になります"))
        .addIntegerOption(o => o.setName("最大値").setDescription("省略した場合は10になります"))
        .setDescription("ランダムな値を返します！")
        .setName("random");

    execute = async (intr: CommandInteraction) => {
        if (!intr.channel) return;
        const min = intr.options.getInteger("最小値");
        const max = intr.options.getInteger("最大値");
        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("konishiRegenRandom")
                .setLabel("再生成！")
                .setStyle("PRIMARY"));
        await intr.reply({ content: rand(min ?? 0, max ?? 10).toString(), components: [row] });
        const replayd = await intr.fetchReply();
        for (; ;) {
            const btnIntr = await genAwaitMsgComponent(intr.channel, intr.user.id)(replayd.id);
            if (!btnIntr) {
                row.components[0] = row.components[0].setDisabled(true);
                await intr.editReply({ content: (await intr.fetchReply()).content, components: [row] });
                break;
            }
            await btnIntr.update({ content: rand(min ?? 0, max ?? 10).toString(), components: [row] });
        }
    };
};