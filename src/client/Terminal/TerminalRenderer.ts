
import * as blessed from "blessed";
import { hourMinuteTimestamp } from "../../utility/main";
import { StatusBar } from "./StatusBar";

export class TerminalRenderer {

    screen: blessed.Widgets.Screen;
    topBar: blessed.Widgets.TextElement;
    messageLog: blessed.Widgets.Log;
    statusBar: StatusBar;
    input: blessed.Widgets.TextboxElement;

    onInput: Function;

    constructor() {
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

        this.statusBar = new StatusBar();

        this.onInput = () => { };

        this.screen.append(this.topBar);
        this.screen.append(this.messageLog);
        this.screen.append(this.statusBar.bar);
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