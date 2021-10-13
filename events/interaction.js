const fs = require('fs');

// コマンドを取ってくる
const cmds = [];
fs.readdirSync('./commands')
    .filter(f => f.endsWith('.js'))
    .forEach(f => {
        const c = require(`../commands/${f}`);
        cmds[c.data.name] = c.execute;
    });

module.exports = {
    name: 'interactionCreate',
    execute: async intr => {

        if (!intr.isCommand()) return;
        const cmd = cmds[intr.commandName];
        if (cmd !== null) {
            try {
                await cmd(intr);
            }
            catch (e) {
                console.error(e);
            }
        }
    }
};