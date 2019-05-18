
import { IRCClient } from "./core/IRCClient";
import { CommandHandler, isCommand, parseCommand } from "./core/CommandHandler";
import { TerminalRenderer } from "./client/Terminal/TerminalRenderer";
import { IMessage } from "./core/IRCSocket";
import { EReplies, getReplyName } from "./core/EReplies";


const ircClient = new IRCClient("pwndonkey");
const client = ircClient.client;
const renderer = new TerminalRenderer();
const commandHandler = new CommandHandler();


// Register client commands
commandHandler.register("CONNECT", (params) => {

    if (params.length < 1) {
        renderer.log("not enough params");
        return;
    }

    renderer.log(`connecting to ${params[0]}`);

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
        renderer.log("/JOIN not enough params", false);
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

client.on("message", (message: IMessage) => {
    const command = parseInt(message.command) as EReplies;
    if (isNaN(command)) {
        // If our command is not a number...
        switch (message.command) {
            case "NOTICE":
                renderer.log(`=!= ${message.trailing}`);

                break;
            case "PRIVMSG":
                const from = message.prefix.split("!")[0];
                renderer.log(`<${from}> ${message.trailing}`);
                break;
        }
    }
    else {
        switch (command) {
            case EReplies.RPL_MOTDSTART:
            case EReplies.RPL_MOTD:
            case EReplies.RPL_ENDOFMOTD:
                renderer.log(`! ${message.trailing}`);
                break;
            default:
                renderer.log(`${getReplyName(parseInt(message.command))} ${message.trailing}`);
                break;
        }
    }

    renderer.render();
});
