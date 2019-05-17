import { Client } from "./Client";
import { timingSafeEqual } from "crypto";

// TODO: rename this

interface IChannel {
    name: string;
    names: string[];
    log: string[];
}

type Channels = {[key: string]: IChannel}

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
    send(message: string) {

    }

    join(channel: string) {
        this.client.send(`JOIN ${channel}`);
        
    }

    part(channel: string) {
        this.client.send(`PART ${channel}`);
    }
}