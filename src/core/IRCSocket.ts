import { Socket, SocketConstructorOpts } from "net";
import { EventEmitter } from "events";

export interface IMessage {
    prefix: string;
    command: string;
    params: string[];
    trailing: string;
    full: string;
}

export class IRCSocket extends EventEmitter {
    private socket: Socket;
    private buffer: string;

    constructor(options?: SocketConstructorOpts) {
        super();
        this.socket = new Socket(options);
        this.buffer = "";

        // this.socket.on("ready", this.ready.bind(this));
        this.socket.on("data", this.processData.bind(this));
        this.socket.on("close", () => { });

        this.on("message", this.handleMessage.bind(this));
    }

    processData(data: string) {
        this.buffer += data;
        // Splitting on a "\r\n" is safe according to spec
        const lines = this.buffer.split("\r\n");
        this.buffer = lines.pop() || "";
        lines.forEach(line => {
            const message = parseData(line);
            if (message) {
                this.emit("message", message);
            }
        });
    }

    // Low level socket message handling for PING etc.
    handleMessage(message: IMessage) {
        // Special case for PING respond with PONG to stay connected
        // Should this be optional?
        switch (message.command) {
            case "PING":
                this.send(`PONG ${message.params[0]}`);
                break;
        }
    }

    send(cmd: string, trailing: string = "") {
        const command = `${cmd} ${trailing ? (" :" + trailing) : ""}\r\n`;
        this.socket.write(command);
    }

    connect(host: string, port = 6667): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.socket.connect(port, host, () => {
                this.emit("connected");
                resolve(true);
            });
        });
    }
}

// TODO: clean up this logic
function parseData(input: string, stripColors: boolean = false): IMessage | void {
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
        const pre = input.substr(0, pos);
        args.push(...(input.length != 0 ? pre.split(" ") : []));
        args.push(trailing);
    }
    // whats this for?
    else {
        args.push(...(input.length != 0 ? input.split(" ") : []));
    }

    if (prefix) {
        args = args.slice(1);
    }

    return {
        prefix,
        command: args[0],
        params: args.slice(1),
        trailing,
        full: input
    }
}


