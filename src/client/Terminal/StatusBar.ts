import * as blessed from "blessed";
import { IStatus } from "../../core/IRCClient";

export class StatusBar {

    bar: blessed.Widgets.TextElement;

    // [nickname] [server] [notify]
    constructor() {
        this.bar = blessed.text({
            top: "100%-2",
            left: 0,
            width: "100%",
            height: 1,
            bg: "blue"
        });

    }

    render(status: IStatus) {
        this.bar.content = ` [${status.nick}] [${status.host}] ->${status.target} [...]`
    }
}