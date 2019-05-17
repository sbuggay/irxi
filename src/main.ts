import { Client, IMessage, getReplyName, EReplies } from "./core";

import * as blessed from "blessed";
import { ClientWrapper } from "./core/ClientWrapper";
import { CommandHandler, isCommand, parseCommand } from "./core/CommandHandler";
import { hourMinuteTimestamp } from "./utility/main";

class TerminalRenderer {

    client: Client;
    screen: blessed.Widgets.Screen;
    topBar: blessed.Widgets.TextElement;
    messageLog: blessed.Widgets.Log;
    bottomBar: blessed.Widgets.TextElement;
    input: blessed.Widgets.TextboxElement;

    onInput: Function;

    constructor(client: Client) {
        this.client = client;
        this.screen = blessed.screen({
            smartCSR: true
        });
        this.screen.title = "irc";

        this.topBar = blessed.text({
            top: 0,
            left: 0,
            width: "100%",
            height: 1,
            bg: "blue",
        });

        this.messageLog = blessed.log({
            top: 1,
            left: 0,
            width: "100%",
            height: "100%-3",
        });

        this.bottomBar = blessed.text({
            top: "100%-2",
            left: 0,
            width: "100%",
            height: 1,
            bg: "blue"
        });

        this.input = blessed.textbox({
            top: "100%-1",
            left: 0,
            width: "100%",
            height: 1,
            inputOnFocus: true,
            style: {
                fg: "white"
            }
        });

        this.onInput = () => { };

        this.screen.append(this.topBar);
        this.screen.append(this.messageLog);
        this.screen.append(this.bottomBar);
        this.screen.append(this.input);

        this.screen.render();

        this.input.focus();

        this.input.key("enter", () => {
            const text = this.input.getValue();
            this.onInput(text);
        });
    }

    log(message: string, timestamp: boolean = true) {
        if (!timestamp) {
            this.messageLog.log(message);
            return;
        }

        this.messageLog.log(`${hourMinuteTimestamp(new Date())} ${message}`);
    }

    render() {
        this.screen.render();
    }
}

const clientWrapper = new ClientWrapper("pwndonkey");
const client = clientWrapper.client;
const renderer = new TerminalRenderer(client);
const commandHandler = new CommandHandler();

commandHandler.register("JOIN", (params) => {
    renderer.log("JOIN" + params);
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



client.connect().then(() => {
    client.join("##devantesting");
});
