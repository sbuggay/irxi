import * as blessed from "blessed";
import { IStatus } from "../../core/IRCClient";

export class StatusBar {

    bar: blessed.Widgets.TextElement;

    status: IStatus;

    // [nickname] [server] [notify]
    constructor() {
        this.bar = blessed.text({
            top: "100%-2",
            left: 0,
            width: "100%",
            height: 1,
            bg: "blue"
        });

        this.status = {
            connected: false,
            nick: "",
            host: ""
        }

    }

    update(status: IStatus) {
        this.status = status;
        this.render();
    }

    render() {
        this.bar.content = ` [${this.status.nick}] [${this.status.host}]`
    }
}