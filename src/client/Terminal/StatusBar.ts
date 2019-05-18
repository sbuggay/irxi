import * as blessed from "blessed";

export class StatusBar {

    bar: blessed.Widgets.TextElement;
    nickname: string;
    server: string;


    // [nickname] [server] [notify]
    constructor() {
        this.bar = blessed.text({
            top: "100%-2",
            left: 0,
            width: "100%",
            height: 1,
            bg: "blue"
        });

        this.nickname = "";
        this.server = "";

    }

    render() {
        this.bar.content = ` [${this.nickname}] [${this.server}]`
    }

    updateNickname(nickname: string) {
        this.nickname = nickname;
        this.render();
    }


    updateServer(server: string) {
        this.server = server;
        this.render();
    }
}