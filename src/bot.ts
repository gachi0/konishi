import { ChannelManager, Client, CommandInteraction, Guild, Intents, InteractionReplyOptions, MessageButton, RoleManager, TextChannel } from "discord.js";
import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { Column, Connection, createConnection, Entity, PrimaryColumn, Repository } from "typeorm";
import fs from "fs";

export const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS] });

/** path 以下の ts | js ファイルの default を全部インポート */
export const allImport = (path: string): Promise<unknown[]> => Promise.all(fs.readdirSync(`./src/${path}`)
    .filter((f: string) => /(\.js|\.ts)$/.test(f))
    .map(async (f: string) => (await import(`./${path}/${f.slice(0, -3)}`)).default));

/** ary から target を消す */
export const delAry = <T>(ary: T[], target: T) => {
    if (ary.includes(target)) {
        ary.splice(ary.indexOf(target), 1);
    }
    return ary;
};

/** InteractionReplyOptionsのボタンを全部無効にする */
export const allDisable = (opt: InteractionReplyOptions) => {
    if (!opt.components) return opt;
    for (let i = 0; i < opt.components.length; i++) {
        opt.components[i].components = opt.components[i].components
            .map(i => i instanceof MessageButton ? i.setDisabled(true) : i);
    }
    return opt;
};

/** コンポーネントを待つ。来なかったらundefinedを返す（chとuserIdを省略できる） */
export const genAwaitMsgComponent = (ch: TextChannel, userId?: string) =>
    async (msgId: string, time = 30000) => {
        try {
            return await ch.awaitMessageComponent({
                filter: i => i.message.id === msgId && userId ? i.user.id === userId : true,
                time: time
            });
        }
        catch {
            console.log("時間切れ");
        }
    };

/** 文字列の配列をmapして1つの文字列にくっつける 空文字列だった場合"なし"を返す */
export const mapToStr = (ary: string[], fn: (s: string) => string): string => {
    const result = ary.map(fn).toString();
    return result === "" ? "なし" : result;
};

/** 通話個室 */
export const userVcs: Record<string, { userId: string, textChId: string }> = {};

export interface ICommand {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    adminOnly?: boolean;
    execute(intr: CommandInteraction): Promise<void>;
}

export interface IEvent {
    name: string;
    once?: boolean;
    execute(...args: unknown[]): Promise<void>;
}

// eslintがデコレーターの下に8インデント要求してくる
/* eslint-disable indent */
@Entity({ name: "guild" })
export class GuildEntity {

    static repo: Repository<GuildEntity>;
    static get = async (id: string) =>
        await GuildEntity.repo.findOne(id) ?? new GuildEntity(id);

    @PrimaryColumn()
    id: string;

    @Column({ type: "simple-array", default: "" })
    welcCh: string[] = [];

    @Column({ type: "simple-array", default: "ようこそ{nick}！" })
    welcMsg: string[] = ["ようこそ{nick}！"];

    @Column({ type: "simple-array", default: "" })
    honmaCh: string[] = [];

    @Column({ type: "simple-array", default: "" })
    vcRole: string[] = [];

    @Column({ type: "simple-array", default: "よお{nick}" })
    vcWelcMsg: string[] = ["よお{nick}"];

    @Column({ type: "simple-array", default: "" })
    vcWelcCh: string[] = [];

    @Column({ type: "simple-array", default: "" })
    threadCh: string[] = [];

    @Column({ type: "simple-array", default: "" })
    ww2vc: string[] = [];

    @Column({ type: "boolean", default: false })
    vcBotMax = false;

    constructor(id: string) {
        this.id = id;
    }

    /** 消えてるものを消す */
    existCheck = async (guild?: Guild) => {

        const delDeled = async (manager: ChannelManager | RoleManager, ids: string[]) => {
            const result: string[] = [];
            for (const i of ids) {
                if (await manager.fetch(i)) {
                    result.push(i);
                }
            }
            return result;
        };

        if (!guild) {
            guild = await client.guilds.fetch(this.id);
            if (!guild) return;
        }

        this.welcCh = await delDeled(guild.channels, this.welcCh);
        this.honmaCh = await delDeled(guild.channels, this.honmaCh);
        this.vcRole = await delDeled(guild.roles, this.vcRole);
        this.vcWelcCh = await delDeled(guild.channels, this.vcWelcCh);
        this.threadCh = await delDeled(guild.channels, this.threadCh);
        this.ww2vc = await delDeled(guild.channels, this.ww2vc);
    };
}

@Entity({ name: "user" })
export class UserEntity {

    static repo: Repository<UserEntity>;
    static get = async (id: string) =>
        await UserEntity.repo.findOne(id) ?? new UserEntity(id);

    @PrimaryColumn()
    id: string;

    @Column({ type: "boolean", default: false })
    ephemeral = false;

    constructor(id: string) {
        this.id = id;
    }
}

/* eslint-enable */

let con: Connection;

export const DBInit = async () => {
    con = await createConnection({
        type: "sqlite",
        database: "data.sqlite3",
        entities: [UserEntity, GuildEntity],
        synchronize: true,
        logging: true
    });
    GuildEntity.repo = con.getRepository(GuildEntity);
    UserEntity.repo = con.getRepository(UserEntity);
};