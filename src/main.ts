
import { IRCClient, MESSAGE, IEvent, STATUS_UPDATE, IStatus } from "./core/IRCClient";
import { CommandHandler, isCommand, parseCommand } from "./core/CommandHandler";
import { TerminalRenderer } from "./client/Terminal/TerminalRenderer";
import { userInfo } from "os";

const packageJson = require("../package.json");

import * as commander from "commander";
import { registerCommands } from "./core/Commands";

commander
    .option("-s, --server <server>", "default server")
    .option("-c, --channel <channel>", "join channels, can be comma separated")
    .option("-n, --nick <nick>", "nickname")
    .option("-d, --debug", "output extra debugging")
    .version(packageJson.version);

commander.parse(process.argv);

if (commander.debug) {
    process.env.DEBUG = "true";
}

const nick = commander.nick || userInfo().username;

// Set up client, 
const ircClient = new IRCClient(nick);
const renderer = new TerminalRenderer();
const commandHandler = new CommandHandler();

registerCommands(commandHandler, ircClient);

if (commander.server) {
    ircClient.connect(commander.server).then(() => {
        ircClient.nickname(nick);
        ircClient.user(nick, "devan");
        ircClient.emitStatus();

        // If there were specified channels to connect to, do them now.
        if (commander.channel) {
            const channels: string[] = commander.channel.split(",");
            channels.forEach(ch => {
                ircClient.join(ch);
            });
        }

        renderer.screen.render();
    });
}

ircClient.on(MESSAGE, (message: IEvent) => {
    renderer.log(message.text, message.channel);
});

ircClient.on(STATUS_UPDATE, (status: IStatus) => {
    renderer.statusBar.update(status);
});

renderer.render();

renderer.screen.key(["escape", "C-c"], () => {
    ircClient.quit();
    setTimeout(() => process.exit(0), 500);
});

// TODO: move this logic somewhere
renderer.onInput = (input: string) => {
    // client.privmsg("##devantesting", input);

    if (!input) return;

    // Check if the input is a command, preceding with a /
    if (isCommand(input)) {
        const command = parseCommand(input);
        const ret = commandHandler.call(command.command, command.params);
        renderer.log(ret ? ret : "");
    }
    else {
        renderer.log(`<${ircClient.status.nick}> ${input}`);
        // ircClient.submit(input);
    }

    renderer.input.clearValue();
    renderer.input.focus();
}   