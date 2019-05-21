import { IRCSocket, IMessage } from "./IRCSocket";
import { EventEmitter } from "events";
import { EReplies, getReplyName } from "./EReplies";

const DEFAULT_TARGET = "DEFAULT_TARGET";

interface IEvent {
    text: string;
    channel?: string; // Which channel to target?
    notice?: boolean; // Should it appear everywhere?
}

interface IChannel {
    name: string;
    names: string[];
}

type Channels = { [key: string]: IChannel }

export class IRCClient extends EventEmitter {
    ircSocket: IRCSocket;
    connected: boolean;
    host: string | null;
    nick: string;

    channels: Channels;
    target: string;

    constructor(nick: string) {
        super();
        this.ircSocket = new IRCSocket();
        this.connected = false;
        this.host = null;
        this.nick = nick;

        this.channels = {};

        this.target = DEFAULT_TARGET; // TODO: check if this is a valid channel name? I think not.

        this.ircSocket.on("message", this.handleMessage.bind(this));
    }

    // The client needs to handle some messages, channel join/quit etc
    handleMessage(message: IMessage) {
        const parsedCommand = parseInt(message.command);
        if (isNaN(parsedCommand)) {
            // If our command is not a number...
            switch (message.command) {
                case "NOTICE":
                    this.log(`=!= ${message.trailing}`);

                    break;
                case "PRIVMSG":
                    const from = message.prefix.split("!")[0];
                    this.log(`<${from}> ${message.trailing}`);
                    break;
                case "JOIN":
                    break;
                case "QUIT":
                    break;
                case "PART":
                    break;
                case "MODE":
                    break;
                default:
                    break;
            }
        }
        else {
            switch (parsedCommand as EReplies) {
                case EReplies.RPL_MOTDSTART:
                case EReplies.RPL_MOTD:
                case EReplies.RPL_ENDOFMOTD:
                    this.log(`{green-fg}!{/} ${message.trailing}`);
                    break;
                default:
                    this.log(`${getReplyName(parsedCommand)} ${message.trailing}`);
                    break;
            }
        }
    }

    emitEvent()

    submit(input: string) {

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

        // add to channels
    }

    part(channel: string) {
        this.ircSocket.send(`PART ${channel}`);

        // remove from channels
    }

    quit() {
        this.ircSocket.send("QUIT");
    }

    identify(username: string, password: string) {
        this.ircSocket.send("PRIVMSG NickServ", `identify ${username} ${password}`);
    }

    privmsg(message: string, target = this.target) {
        this.ircSocket.send(`PRIVMSG ${target}`, message);
    }

    changeTarget() {

    }
}