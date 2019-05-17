import { Client, IMessage, getReplyName } from "./core";

import { TerminalRenderer } from "./renderer/TerminalRenderer";
import { CommandHandler } from "./core/CommandHandler";

const client = new Client();
const renderer = new TerminalRenderer(client);
const commandHandler = new CommandHandler();

commandHandler.register("JOIN", (params) => {
    renderer.log("JOIN" + params);
});

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
