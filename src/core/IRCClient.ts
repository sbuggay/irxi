import { IRCSocket, IMessage } from "./IRCSocket";
import { EventEmitter } from "events";
import { EReplies, getReplyName } from "./EReplies";
import { isCommand, parseCommand, CommandHandler } from "./CommandHandler";
import { registerCommands } from "./Commands";
import { isCTCPMessage } from "./CTCP";

const packageJson = require("../../package.json");

const VERSION_STRING = `${packageJson.name} v${packageJson.version}`;

export const MESSAGE = Symbol("MESSAGE");
export const STATUS_UPDATE = Symbol("STATUS_UPDATE");
export const DEFAULT_TARGET = "DEFAULT_TARGET";

export interface IEvent {
    text: string;
    channel?: string; // Which channel to target?
    notice?: boolean; // Should it appear everywhere?
}

export interface IStatus {
    connected: boolean;
    host: string;
    nick: string;
    target: string;
}

export interface IChannel {
    name: string;
    names: string[];
}

type Channels = { [key: string]: IChannel }

export class IRCClient extends EventEmitter {
    ircSocket: IRCSocket;
    status: IStatus;
    channels: Channels;
    commandHandler: CommandHandler;

    // Buffer for RPL_NAMREPLY and presenting it nicely
    nameBuffer: string[];

    constructor() {
        super();
        this.ircSocket = new IRCSocket();

        this.status = {
            connected: false,
            host: "",
            nick: "",
            target: DEFAULT_TARGET
        }

        this.commandHandler = new CommandHandler();

        registerCommands(this.commandHandler, this);

        this.channels = {};
        this.nameBuffer = [];

        this.ircSocket.on("message", this.handleMessage.bind(this));
    }

    // The client needs to handle some messages, channel join/quit etc
    handleMessage(message: IMessage) {

        if (process.env.DEBUG) {
            this.emitMessage(`{magenta-fg}DEBUG < "${message.full}"{/}`);
        }

        const parsedCommand = parseInt(message.command);
        if (isNaN(parsedCommand)) {
            // If our command is not a number...
            switch (message.command) {
                case "NOTICE":
                    this.emitMessage(`{yellow-fg}{bold}!!!{/} ${message.trailing}`);
                    break;
                case "PRIVMSG":
                    // Check if CTCP?
                    const from = message.prefix.split("!")[0];
                    if (isCTCPMessage(message)) {
                        this.emitMessage(`CTCP ${message.trailing} from ${from}`, from);
                    }
                    else {
                        this.emitMessage(`<${from}> ${message.trailing}`, from);
                    }

                    break;
                case "JOIN":
                    this.emitMessage(`[${message.prefix}] joined`);
                    break;
                case "QUIT":
                    this.emitMessage(`[${message.prefix}] quit: ${message.trailing}`);
                    break;
                case "PART":
                    this.emitMessage(`[${message.prefix}] parted: ${message.trailing}`);
                    break;
                case "MODE":
                    // TODO: Mode stuff
                    break;
                case "PING":
                    this._socketSend(`PONG ${message.params[0]}`);
                    break;
                case "VERSION":
                    this.emitMessage(`Received a CTCP VERSION from ${message.trailing}`)
                    this._socketSend(`VERSION ${VERSION_STRING}`);
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
                    this.emitMessage(`{green-fg}!{/} ${message.trailing}`);
                    break;

                case EReplies.RPL_NAMREPLY:
                    // Fill our buffer
                    this.nameBuffer.push(...message.trailing.split(" "));
                    break;
                case EReplies.RPL_ENDOFNAMES:
                    const nameResponse = this.nameBuffer.join("\t\t");
                    this.nameBuffer = [];
                    this.emitMessage(`NAMES:\n[${nameResponse}]`);
                    break;
                default:
                    this.emitMessage(`${getReplyName(parsedCommand)} ${message.trailing}`);
                    break;
            }
        }
    }

    submit(input: string) {
        // Check if the input is a command, preceding with a /
        if (isCommand(input)) {
            const command = parseCommand(input);
            const ret = this.commandHandler.call(command.command, command.params);
            this.emitMessage(ret ? ret : "");
        }
        else {
            if (this.status.target !== DEFAULT_TARGET) {
                this.privmsg(input);
                this.emitMessage(`<${this.status.nick}> ${input}`, this.status.target);
            }
            else {
                this.emitMessage("Not connected")
            }
        }
    }

    emitMessage(text: string, channel?: string, notice?: boolean) {
        const event: IEvent = {
            text,
            channel,
            notice
        }

        this.emit(MESSAGE, event);
    }

    emitStatus() {
        this.emit(STATUS_UPDATE, this.status);
    }

    _socketSend(message: string, params?: string) {

        if (process.env.DEBUG) {
            this.emitMessage(`{magenta-fg}DEBUG > ${message} ${params ? params : ""}{/}`);
        }

        this.ircSocket.send(message, params);
    }

    // Try to send a message to the active channel/user
    connect(host: string, port = 6667) {
        this.status.host = host;
        this.emitStatus()
        return this.ircSocket.connect(host, port).then(() => {
            this.status.connected = true;
            this.emitStatus();
        });
    }

    nickname(nick: string) {
        this.status.nick = nick;

        if (this.status.connected) {
            this._socketSend(`NICK ${nick}`);
        }
    }

    user(username: string, realname: string) {
        if (this.status.connected) {
            this._socketSend(`USER ${username} 0 * ${realname}`);
        }
    }

    join(channel: string) {
        this._socketSend(`JOIN ${channel}`);

        // add to channels and change target
        this.status.target = channel;
        this.emitStatus();
    }

    part(channel: string) {
        this._socketSend(`PART ${channel}`);

        // remove from channels
    }

    mode(...params: string[]) {
        this._socketSend(`MODE ${params.join(" ")}`)
    }

    motd() {
        this._socketSend("MOTD");
    }

    names(channels?: string) {
        this._socketSend(`NAMES ${channels ? channels.split(",").join(" ") : ""}`);
    }

    quit() {
        this._socketSend("QUIT");
    }

    identify(username: string, password: string) {
        this._socketSend("PRIVMSG NickServ", `identify ${username} ${password}`);
    }

    /**
     * Returns the local time on the current server, or <server> if specified. Defined in RFC 1459.
     *
     * @memberof IRCClient
     */
    time() {
        this._socketSend("TIME");
    }

    topic(channel: string, topic?: string) {
        this._socketSend(`TOPIC`)
    }

    version() {
        this._socketSend("VERSION");
    }

    privmsg(message: string, target = this.status.target) {
        this._socketSend(`PRIVMSG ${target}`, message);
    }

}