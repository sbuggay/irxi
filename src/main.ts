import { Client, IMessage } from "./core";

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
        content: "test",
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
        container.log(`${message.command} ${message.params}`);
        screen.render();
    });

    input.key("enter", () => {
        const text = input.getValue();
        container.log(text);
        input.clearValue();
        input.focus();
    });

    client.connect();
}

start();