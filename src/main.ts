import { Client, IMessage, getReplyName, EReplies } from "./core";

import { ClientWrapper } from "./core/ClientWrapper";
import { CommandHandler, isCommand, parseCommand } from "./core/CommandHandler";
import { TerminalRenderer } from "./renderer/TerminalRenderer";


const clientWrapper = new ClientWrapper("pwndonkey");
const client = clientWrapper.client;
const renderer = new TerminalRenderer(client);
const commandHandler = new CommandHandler();


// Register client commands
commandHandler.register("CONNECT", (params) => {

    if (params.length < 1) {
        renderer.log("not enough params");
        return;
    }

    renderer.log(`connecting to ${params[0]}`);

    clientWrapper.connect(params[0]).then(() => {
        clientWrapper.nickname(clientWrapper.nick);
        clientWrapper.user(clientWrapper.nick, "devan");
    });
});

commandHandler.register("JOIN", (params) => {
    return "join";
});

commandHandler.register("QUIT", (params) => {
    client.quit();
    setTimeout(() => process.exit(0), 500);
});


renderer.bottomBar.content = clientWrapper.nick;

renderer.screen.key(["escape", "C-c"], () => {
    client.quit();
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
        renderer.log(`<${clientWrapper.nick}> ${input}`);

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
                renderer.log(`${from} ${message.trailing}`);
                break;
        }
    }
    else {
        switch (command) {
            case EReplies.RPL_MOTD:
                renderer.log(`! ${message.trailing}`);
                break;
            default:
                renderer.log(`${getReplyName(parseInt(message.command))} ${message.trailing}`);
                break;
        }
    }

    renderer.render();
});
