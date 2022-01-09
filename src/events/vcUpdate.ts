import { DiscordAPIError, GuildMember, MessageEmbed, Permissions, StageChannel, TextChannel, VoiceChannel, VoiceState } from "discord.js";
import { delAry, GuildEntity, IEvent, userVcs } from "../bot";

const randomChoice = <T>(ary: T[]) => ary[Math.floor(Math.random() * ary.length)];
type vcOrStage = VoiceChannel | StageChannel;

export default new class implements IEvent {
    name = "voiceStateUpdate";
    execute = async (before: VoiceState, after: VoiceState) => {
        const guild = await GuildEntity.get(after.guild.id);
        if (!after.member) return;
        // ミュートなどの操作なら帰る
        if (before.channel === after.channel) {
            return;
        }
        // 入室
        else if (!before.channel) {
            if (!after.channel) return; //たぶんありえない
            await vcJoin(after.member, guild, after.channel);
        }
        // 退出
        else if (!after.channel) {
            await vcLeave(after.member, guild, before.channel);
        }
        // 移動
        else {
            await vcJoin(after.member, guild, after.channel, before.channel);
            await vcLeave(after.member, guild, before.channel, after.channel);
        }
    };
};

// ボイスチャンネルに参加（移動も含む）
const vcJoin = async (member: GuildMember, guild: GuildEntity, vc: vcOrStage, beforeCh?: vcOrStage) => {
    if (!beforeCh) {
        await member.roles.add(guild.vcRole);
        for (const c of guild.vcWelcCh) {
            let ch: TextChannel;
            try {
                ch = await vc.guild.channels.fetch(c) as TextChannel;
            }
            catch (err) {
                // テキストチャンネルが消えていたらguild.vcWelcChからも消す
                if (err instanceof DiscordAPIError && err.httpStatus === 404) {
                    delAry(guild.vcWelcCh, c);
                }
                continue;
            }
            if (ch instanceof TextChannel) {
                await ch.send(randomChoice(guild.vcWelcMsg).replace(/\{nick\}/g, member.displayName));
                console.log("よお");
            }
        }
    }
    if (guild.ww2vc.includes(vc.id)) {
        if (!vc.parent) return;
        const userVc = await vc.parent.createChannel(`${member.displayName}のボイスチャンネル`, {
            type: "GUILD_VOICE", permissionOverwrites: [
                { id: member.id, allow: Permissions.ALL }
            ]
        });
        await member.voice.setChannel(userVc);
        const userTextCh = await vc.parent.createChannel(`${member.displayName}のテキストチャンネル`, {
            type: "GUILD_TEXT", permissionOverwrites: [
                { id: vc.guild.roles.everyone, deny: "VIEW_CHANNEL" },
                { id: member.id, allow: Permissions.ALL }
            ]
        });
        await userTextCh.send({
            embeds: [new MessageEmbed()
                .setTitle("このチャンネルについて")
                .setDescription(`このチャンネルと${userVc.toString()}はbotによって作成されたチャンネルです。
これらのチャンネルの管理権限は${member.toString()}に与えられますので、削除、編集など自由に行うことができます！
${userVc.toString()}に誰一人いなくなったら、これらのチャンネルは削除されます！`)
            ]
        });
        userVcs.set(userVc.id, { textChId: userTextCh.id, userId: member.id });
    }
    const userVc = userVcs.get(vc.id);
    if (userVc) {
        const textCh = await vc.guild.channels.fetch(userVc.textChId);
        if (!textCh) return;
        await textCh.permissionOverwrites.edit(member.id, { VIEW_CHANNEL: true });
    }
    await GuildEntity.repo.save(guild);
};

// ボイスチャンネルから出る（移動も含む）
const vcLeave = async (member: GuildMember, guild: GuildEntity, vc: vcOrStage, afterCh?: vcOrStage) => {
    if (!afterCh) await member.roles.remove(guild.vcRole);
    const userVc = userVcs.get(vc.id);
    if (userVc) {
        // 0人になったらuserVc消滅(userVcが消えると同時にテキストチャンネルも消える)
        if (vc.members.size === 0) {
            await vc.delete();
        }
        const textCh = await vc.guild.channels.fetch(userVc.textChId);
        if (!textCh) return;
        if (member.id !== userVc.userId) {
            await textCh.permissionOverwrites.edit(member.id, { VIEW_CHANNEL: null });
        }
    }
};