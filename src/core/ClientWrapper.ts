import { Client } from "./Client";
import { timingSafeEqual } from "crypto";

// TODO: rename this

interface IChannel {
    name: string;
    names: string[];
}

class ClientWrapper {
    client: Client;
    nick: string;
    channels: IChannel[];
    activeChannel: number;

    constructor(nick: string) {
        this.client = new Client();
        this.nick = nick;
        this.channels = [];
        this.activeChannel = 0;
    }

    join(channel: string) {
        this.client.send(`JOIN ${channel}`);
        this.channels.push({
            name: channel,
            names: []
        });
    }

    part(channel: string) {
        this.client.send(`PART ${channel}`);
    }
}