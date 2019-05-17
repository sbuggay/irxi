type ICommandCallback = (params: string[]) => void;

interface IClientCommand {
    command: string;
    params: string[];
}

export function isCommand(input: string) {
    return input.indexOf("/") === 0;
}

export function parseCommand(input: string): IClientCommand {
    // Take the first word, remove the /
    const parsedInput = input.split(" ");
    const command = parsedInput[0].toLowerCase().slice(1);
    const params = parsedInput.slice(1);
    
    return {
        command,
        params
    };
}

export class CommandHandler {
    private commands: { [key: string]: ICommandCallback };

    constructor() {
        this.commands = {};
    }

    call(key: string, params: string[]) {
        key = key.toLowerCase();
        if (!this.commands[key]) {
            return "No Command " + key;
        }

        return this.commands[key](params);
    }

    register(key: string, cb: ICommandCallback) {
        this.commands[key.toLowerCase()] = cb;
    }

    deregister(key: string) {
        delete this.commands[key.toLowerCase()];
    }
}