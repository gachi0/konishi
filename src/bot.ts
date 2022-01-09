import { ChannelManager, Client, CommandInteraction, DiscordAPIError, Intents, InteractionReplyOptions, MessageButton, RoleManager, TextBasedChannels } from "discord.js";
import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { Column, Connection, createConnection, Entity, PrimaryColumn, Repository } from "typeorm";
import fs from "fs";
import toml from "toml";

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

/** コンポーネントを待つ。来なかったらnullを返す（chとuserIdを省略できる） */
export const genAwaitMsgComponent = (ch: TextBasedChannels, userId?: string) =>
    async (msgId: string, time = 30000) => {
        try {
            return await ch.awaitMessageComponent({
                filter: i => i.message.id === msgId && userId ? i.user.id === userId : true,
                time: time
            });
        }
        catch {
            return null;
        }
    };

/** 文字列の配列をmapして1つの文字列にくっつける 空文字列だった場合"なし"を返す */
export const mapToStr = (ary: string[], fn: (s: string) => string): string => {
    const result = ary.map(fn).toString();
    return result === "" ? "なし" : result;
};

/** idの中からmanagerに存在しない チャンネル or ロールを削除する */
export const delDeled = async (manager: ChannelManager | RoleManager, ids: string[]) => {
    const result = [];
    for (const i of ids) {
        try {
            await manager.fetch(i);
            result.push(i);
        }
        catch (error) {
            if (error instanceof DiscordAPIError && error.httpStatus === 404) {
                continue;
            }
            throw error;
        }
    }
    return result;
};

/** 通話個室 */
export const userVcs = new Map<string, { userId: string, textChId: string }>();

/** 設定 */
export const config: {
    token: string,
    guildId: string
} = toml.parse(fs.readFileSync("./config.toml").toString());

export interface ICommand {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    adminOnly?: boolean;
    guildOnly?: boolean;
    execute(intr: CommandInteraction, ch?: TextBasedChannels): Promise<void>;
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