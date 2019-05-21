import { IRCSocket, IMessage } from "./IRCSocket";


interface IChannel {
    name: string;
    names: string[];
}

type Channels = { [key: string]: IChannel }

export class IRCClient {
    ircSocket: IRCSocket;
    connected: boolean;
    host: string | null;
    nick: string;

    target: string;

    constructor(nick: string) {
        this.ircSocket = new IRCSocket();
        this.connected = false;
        this.host = null;
        this.nick = nick;


        this.target = "default"; // TODO: check if this is a valid channel name? I think not.

        this.ircSocket.on("message", this.handleMessage.bind(this));
    }

    // The client needs to handle some messages, channel join/quit etc
    handleMessage(message: IMessage) {
        switch(message.command) {

        }
    }

    // Try to send a message to the active channel/user
    connect(host: string, port = 6667) {
        this.host = host;
        return this.ircSocket.connect(host, port).then(() => {
            this.connected = true;
        });
    }

    nickname(nick: string) {
        this.ircSocket.send(`NICK ${nick}`);
    }

    user(username: string, realname: string) {
        this.ircSocket.send(`USER ${username} 0 * ${realname}`);
    }

    join(channel: string) {
        this.ircSocket.send(`JOIN ${channel}`);
    }

    part(channel: string) {
        this.ircSocket.send(`PART ${channel}`);
    }

    quit() {
        this.ircSocket.send("QUIT");
    }

    identify(username: string, password: string) {
        this.ircSocket.send("PRIVMSG NickServ", `identify ${username} ${password}`);
    }

    privmsg(target: string, message: string) {
        this.ircSocket.send(`PRIVMSG ${target}`, message);
    }
}