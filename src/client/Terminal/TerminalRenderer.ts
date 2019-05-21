
import * as blessed from "blessed";
import { hourMinuteTimestamp } from "../../utility/time";
import { StatusBar } from "./StatusBar";
import { EReplies, getReplyName } from "../../core/EReplies";
import { IMessage, IRCSocket } from "../../core/IRCSocket";
import { IRCClient } from "../../core/IRCClient";


const packageJson = require("../../../package.json");

export const DEFAULT_LOG = "DEFAULT_LOG";

const bannerOptions = {
    top: 0,
    left: 0,
    width: "100%",
    height: 1,
    bg: "blue"
};

const messageLogOptions = {
    top: 1,
    left: 0,
    width: "100%",
    height: "100%-3",
    tags: true,
    mouse: true,
    keys: true
};

const inputOptions = {
    top: "100%-1",
    left: 0,
    width: "100%",
    height: 1,
    inputOnFocus: true,
    style: {
        fg: "white"
    }
};

export class TerminalRenderer {

    screen: blessed.Widgets.Screen;
    banner: blessed.Widgets.TextElement;

    activeLog: string;
    messageLogs: { [key: string]: blessed.Widgets.Log };

    statusBar: StatusBar;
    input: blessed.Widgets.TextboxElement;

    onInput: Function;

    constructor() {
        this.screen = blessed.screen({
            smartCSR: true
        });

        this.activeLog = DEFAULT_LOG;

        this.messageLogs = {};

        this.screen.title = "irc";

        this.banner = blessed.text(bannerOptions);
        this.messageLogs[this.activeLog] = blessed.log(messageLogOptions);
        this.statusBar = new StatusBar();
        this.input = blessed.textbox(inputOptions);

        this.banner.content = ` ${packageJson.name}@${packageJson.version}`

        this.onInput = () => { };

        this.screen.append(this.banner);
        this.screen.append(this.messageLogs[this.activeLog]);
        this.screen.append(this.statusBar.bar);
        this.screen.append(this.input);

        this.screen.render();

        this.input.focus();

        this.input.key("enter", () => {
            const text = this.input.getValue();
            this.onInput(text);
        });
    }

    changeLog(log: string = DEFAULT_LOG) {
        this.activeLog = log;
    }

    currentLog() {
        return this.messageLogs[this.activeLog];
    }

    log(message: string, log = DEFAULT_LOG, timestamp: boolean = true) {
        const logElem = this.messageLogs[log];

        // If there is no where for it to go, parse the message and create a new log.
        if (!logElem) {
            this.log(`creating noew log ${logElem}`);
        }

        if (!timestamp) {
            this.log(message);
            return;
        }

        this.currentLog().log(`${hourMinuteTimestamp(new Date())} ${message}`);
    }

    registerClient(ircClient: IRCClient) {
        ircClient.on("message", (message: IMessage) => {

            if (process.env.DEBUG) {
                this.log(`{bold}{magenta-fg}DEBUG < ${message.full}{/}`);
            }

            const command = parseInt(message.command) as EReplies;
            if (isNaN(command)) {
                // If our command is not a number...
                switch (message.command) {
                    case "NOTICE":
                        this.log(`=!= ${message.trailing}`);

                        break;
                    case "PRIVMSG":
                        const from = message.prefix.split("!")[0];
                        this.log(`<${from}> ${message.trailing}`);
                        break;
                    default:
                        
                        break;
                }
            }
            else {
                switch (command) {
                    case EReplies.RPL_MOTDSTART:
                    case EReplies.RPL_MOTD:
                    case EReplies.RPL_ENDOFMOTD:
                        this.log(`{green-fg}!{/} ${message.trailing}`);
                        break;
                    default:
                        this.log(`${getReplyName(parseInt(message.command))} ${message.trailing}`);
                        break;
                }
            }

            this.render();
        });
    }

    render() {
        this.screen.render();
    }
}