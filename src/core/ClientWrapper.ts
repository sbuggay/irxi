import { Client } from "./Client";
import { timingSafeEqual } from "crypto";

// TODO: rename this

interface IChannel {
    name: string;
    names: string[];
    log: string[];
}

type Channels = { [key: string]: IChannel }

export class ClientWrapper {
    client: Client;
    nick: string;
    channels: {};
    activeChannel: string;

    constructor(nick: string) {
        this.client = new Client();
        this.nick = nick;
        this.channels = [];
        this.activeChannel = "default";
    }

    // Try to send a message to the active channel/user
    connect(host: string, port = 6667) {
        return this.client.connect(host, port);
    }

    nickname(nick: string) {
        this.client.send(`NICK ${nick}`);
    }

    user(username: string, realname: string) {
        this.client.send(`USER ${username} 0 * ${realname}`);
    }

    join(channel: string) {
        this.client.send(`JOIN ${channel}`);
    }

    part(channel: string) {
        this.client.send(`PART ${channel}`);
    }

    quit() {
        this.client.send("QUIT");
    }

    identify(username: string, password: string) {
        this.client.send("PRIVMSG NickServ", `identify ${username} ${password}`);
    }

    privmsg(target: string, message: string) {
        this.client.send(`PRIVMSG ${target}`, message);
    }
}