import { Client, IMessage, getReplyName } from "./core";

import * as blessed from "blessed";

function start() {
    const client = new Client();

    const screen = blessed.screen({
        smartCSR: true
    });

    screen.title = "irc";

    const container = blessed.log({
        top: 0,
        left: 0,
        width: "100%",
        height: "100%-1",
        border: {
            type: 'line'
        },
        style: {
            border: {
                fg: "#FFF"
            }

        }
    });

    const input = blessed.textbox({
        top: "100%-1",
        left: 0,
        width: "100%",
        height: 1,
        inputOnFocus: true,
        style: {
            fg: "white"
        }
    });

    screen.key(["escape", "C-c"], () => {
        return process.exit(0);
    });

    screen.append(container);
    screen.append(input);

    screen.render();

    input.focus();

    client.on("message", (message: IMessage) => {
        if (isNaN(parseInt(message.command))) {
            // If our command is not a number...
            switch (message.command) {
                case "NOTICE":
                    container.log(`=!= ${message.trailing}`);

                    break;
                case "PRIVMSG":
                    container.log(`${message.params} ${message.trailing}`);
                    break;
            }
        }
        else {
            container.log(`${getReplyName(parseInt(message.command))} ${message.trailing}`);
        }

        screen.render();
    });

    input.key("enter", () => {
        const text = input.getValue();
        client.privmsg("##devantesting", text);
        container.log(text);
        input.clearValue();
        input.focus();
    });

    client.connect().then(() => {
        client.join_channel("##devantesting");
    });
}

start();