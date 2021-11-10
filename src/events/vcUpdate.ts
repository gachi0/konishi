import { TextChannel, VoiceState } from "discord.js";
import { GuildEntity, IEvent } from "../bot";

const randomChoice = <T>(ary: T[]) => ary[Math.floor(Math.random() * ary.length)];


export default new class implements IEvent {
    name = "voiceStateUpdate";
    execute = async (before: VoiceState, after: VoiceState) => {
        const guild = await GuildEntity.get(after.guild.id);
        if (!after.member) return;

        // 移動やミュートなら帰る
        if (before.channel && after.channel) {
            return;
        }
        // 入室
        else if (!before.channel) {
            await after.member.roles.add(guild.vcRole);
            for (const c of guild.vcWelcCh) {
                const ch = await after.guild.channels.fetch(c);
                if (ch instanceof TextChannel) {
                    await ch.send(randomChoice(guild.vcWelcMsg).replace(/\{nick\}/g, after.member.displayName));
                }
            }
        }
        // 退出
        else if (!after.channel) {
            await after.member.roles.remove(guild.vcRole);
        }
    };
};

