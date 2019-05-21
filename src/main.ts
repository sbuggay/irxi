
import { IRCClient } from "./core/IRCClient";
import { CommandHandler, isCommand, parseCommand } from "./core/CommandHandler";
import { TerminalRenderer } from "./client/Terminal/TerminalRenderer";
import { userInfo } from "os";

const packageJson = require("../package.json");

import * as commander from "commander";


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

renderer.registerClient(ircClient);

if (commander.server) {
    ircClient.connect(commander.server).then(() => {
        ircClient.nickname(ircClient.nick);
        ircClient.user(ircClient.nick, "devan");
        renderer.statusBar.updateNickname(ircClient.nick);
        renderer.statusBar.updateServer(commander.server);

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

renderer.statusBar.updateNickname(nick);

renderer.render();

// Register client commands
commandHandler.register("CONNECT", (params) => {

    if (params.length < 1) {
        renderer.log("not enough params");
        return;
    }

    renderer.log(`connecting to ${params[0]}`);

    // TODO: Disconnect from previous connection first
    ircClient.connect(params[0]).then(() => {
        ircClient.nickname(ircClient.nick);
        ircClient.user(ircClient.nick, "devan");
        renderer.statusBar.updateNickname(ircClient.nick);
        renderer.statusBar.updateServer(params[0]);
        renderer.screen.render();
    });
});

commandHandler.register("JOIN", (params) => {
    // TODO: Does join allow multiple channels?
    if (params.length != 1) {
        renderer.log("/JOIN not enough params");
        return;
    }

    ircClient.join(params[0]);
});

commandHandler.register("QUIT", (params) => {
    ircClient.quit();
    setTimeout(() => process.exit(0), 500);
});

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
        renderer.log(`<${ircClient.nick}> ${input}`);
    }

    renderer.input.clearValue();
    renderer.input.focus();
}   