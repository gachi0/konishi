import { Client, CommandInteraction, Intents } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Column, Connection, createConnection, Entity, PrimaryColumn, Repository } from "typeorm";
import fs from "fs";

export const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS] });

export const allImport = (path: string): Promise<unknown[]> => Promise.all(fs.readdirSync(`./src/${path}`)
    .filter((f: string) => /(\.js|\.ts)$/.test(f))
    .map(async (f: string) => (await import(`./${path}/${f.slice(0, -3)}`)).default));

export const delAry = <T>(ary: T[], target: T) => {
    if (ary.includes(target)) {
        ary.splice(ary.indexOf(target), 1);
    }
    return ary;
};

export interface ICommand {
    data: SlashCommandBuilder;
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
    static repo: Repository<GuildEntity>;
    static get = async (id: string) =>
        await GuildEntity.repo.findOne(id) ?? new GuildEntity(id);
}

@Entity({ name: "user" })
export class UserEntity {
    @PrimaryColumn()
    id: string;

    @Column({ type: "boolean", default: false })
    ephemeral = false;

    constructor(id: string) {
        this.id = id;
    }
    static repo: Repository<UserEntity>;
    static get = async (id: string) =>
        await UserEntity.repo.findOne(id) ?? new UserEntity(id);
}

/* eslint-enable */

export let con: Connection;

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

