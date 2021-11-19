import { CommandInteraction, Interaction, Permissions } from "discord.js";
import { allImport, ICommand, IEvent } from "../bot";

const cmds: Record<string, ICommand> = {};
// コマンドを取ってくる
const fetchCmd = async () => {
    for (const c of await allImport("commands") as ICommand[]) {
        cmds[c.data.name] = c;
    }
};
fetchCmd();

export default new class implements IEvent {
    name = "interactionCreate";
    execute = async (intr: Interaction) => {
        if (intr instanceof CommandInteraction) {
            const cmd = cmds[intr.commandName];
            if (!cmd) return;
            if (cmd.adminOnly && !(intr.member?.permissions as Permissions).has("ADMINISTRATOR")) {
                await intr.reply({ content: "このコマンドは管理者のみが使えます！", ephemeral: true });
                return;
            }
            await cmd.execute(intr).catch(async e =>
                await intr[intr.replied || intr.deferred ? "followUp" : "reply"](`エラーが発生しました…\n\`\`\`${e}\`\`\``)
            );
        }
    };
};