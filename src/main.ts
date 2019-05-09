import { Client } from "./core";

import * as blessed from "blessed";

function start() {
    const client = new Client();

    const screen = blessed.screen({
        smartCSR: true
    });

    screen.title = "irc";

    const container = blessed.box({
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

    const prompt = blessed.prompt({
        top: "100%-1",
        left: 0,
        width: "100%",
        height: 1,
        style: {
            fg: "white"
        }
    });

    screen.key(["escape", "C-c"], () => {
        return process.exit(0);
    });

    screen.append(container);
    screen.append(prompt);
    
    screen.render();

    prompt.input("$", "idk", (err, value) => {
        container.insertBottom(value);
        screen.render();
        prompt.focus();
    });
}

start();