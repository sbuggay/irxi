import { Client, IMessage, getReplyName } from "./core";

import * as blessed from "blessed";

function hourMinuteTimestamp(date: Date) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}

class TerminalRenderer {

    client: Client;
    screen: blessed.Widgets.Screen;
    topBar: blessed.Widgets.TextElement;
    messageLog: blessed.Widgets.Log;
    bottomBar: blessed.Widgets.TextElement;
    input: blessed.Widgets.TextboxElement;

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

        this.screen.append(this.topBar);
        this.screen.append(this.messageLog);
        this.screen.append(this.bottomBar);
        this.screen.append(this.input);

        this.screen.render();

        this.input.focus();

        this.input.key("enter", () => {
            const text = this.input.getValue();
            client.privmsg("##devantesting", text);
            this.log(text);
            this.input.clearValue();
            this.input.focus();
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

const client = new Client();
const renderer = new TerminalRenderer(client);

renderer.screen.key(["escape", "C-c"], () => {
    client.quit();
    setTimeout(() => process.exit(0), 500);
});

client.on("message", (message: IMessage) => {
    if (isNaN(parseInt(message.command))) {
        // If our command is not a number...
        switch (message.command) {
            case "NOTICE":
                renderer.log(`=!= ${message.trailing}`);

                break;
            case "PRIVMSG":
                renderer.log(`${message.params} ${message.trailing}`);
                break;
        }
    }
    else {
        renderer.log(`${getReplyName(parseInt(message.command))} ${message.trailing}`);
    }

    renderer.render();
});



client.connect().then(() => {
    client.join("##devantesting");
});
