import { Socket, SocketConstructorOpts } from "net";
import { EventEmitter } from "events";
import * as prompt from "prompt";

interface ICommand {

}

interface IMessage {
    prefix: string;
    command: string;
    params: string[];
}

class IRCClient extends EventEmitter {
    public host: string;
    public port: number;
    private socket: Socket;
    private connected: boolean;
    private buffer: string;

    constructor(host: string = "irc.freenode.net", port: number = 6667, options?: SocketConstructorOpts) {
        super();
        this.host = host;
        this.port = port;
        this.socket = new Socket(options);
        this.connected = false;
        this.buffer = "";

        this.socket.on("ready", this.ready.bind(this));
        this.socket.on("data", this.processData.bind(this));
        this.socket.on("close", () => console.log("closed"));

        this.on("message", this.handleMessage.bind(this));
    }

    ready() {
        this.send("NICK", "pwnmonkey__");
        this.send("USER", "pwnmonkey__ * * :pwnmonkey__");
    }

    processData(data: string) {
        this.buffer += data;
        const lines = this.buffer.split("\r\n");
        this.buffer = lines.pop() || "";
        lines.forEach(line => {
            const message = this.parseData(line);
            if (message) {
                this.emit("message", message);
            }
        });
    }

    parseData(input: string, stripColors: boolean = false): IMessage | void {

        if (stripColors) {
            input = input.replace(/[\x02\x1f\x16\x0f]|\x03\d{0,2}(?:,\d{0,2})?/g, "");
        }

        let prefix = "", trailing = "", pos = 0, args: string[] = [];

        /* handle removing the prefix from the message.
         * this is everything after : and before the first space. */
        if (input[0] === ":") {
            pos = input.indexOf(" ");
            prefix = input.substr(1, pos - 1);
            trailing = input.substr(pos + 1);
        }

        /* handle any potential trailing argument, which may have spaces in it */
        if ((pos = input.indexOf(" :")) !== -1) {
            trailing = input.substr(pos + 2);
            input = input.substr(0, pos);
            args = input.length != 0 ? input.split(" ") : [];
            args.push(trailing);
            args = args.slice(0);
        } else {
            args = input.length != 0 ? input.split(" ") : [];
            
        }


        return {
            prefix,
            command: args[0],
            params: args.slice(2)
        }
    }

    handleMessage(message: IMessage) {
        console.log(message.command, message.params);
        
        // Special case for PING respond with PONG
        // Should this be optional?
        if (message.command === "PING") {

        }
    }

    send(cmd: string, message: string) {
        const command = `${cmd} ${message}\r\n`;

        console.log("[SEND]", command);

        this.socket.write(command);
    }

    join_channel(channel: string) {
        this.send("JOIN", channel);
    }

    identify(username: string, password: string) {
        this.send("PRIVMSG NickServ", `identify ${username} ${password}`);
    }

    privmsg(target: string, message: string) {
        this.send(`PRIVMSG ${target}`, message);
    }

    connect() {
        this.socket.connect(this.port, this.host, () => {
            console.log("connected");
        });
    }
}

const ircClient = new IRCClient();
ircClient.connect();