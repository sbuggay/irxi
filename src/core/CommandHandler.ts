type ICommandCallback = (params: string[]) => void;

interface ICommandMeta {
    affinity?: number;
    usage: string;
}

interface ICommand {
    callback: ICommandCallback;
    meta: ICommandMeta;
}

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
    private commands: { [key: string]: ICommand };

    constructor() {
        this.commands = {};
    }

    help() {
        return Object.keys(this.commands).join("\t");
    }

    call(key: string, params: string[]) {
        key = key.toLowerCase();


        // TODO: Improve this logic
        if (key == "help") {
            if (params.length === 0) {
                return "Commands: 'help <command>' for usage\n" + this.help();
            }
            else {
                const command = this.commands[params[0]];
                if (command && command.meta) {
                    return "Usage: " + command.meta.usage;
                }
                else {
                    return "No help for " + key;
                }
            }
        }

        const command = this.commands[key];

        if (!command) {
            return "No Command " + key;
        }

        // Check affinity
        if (command.meta && (command.meta.affinity !== params.length)) {
            return "Usage: " + command.meta.usage;
        }

        return command.callback(params);
    }

    register(key: string, callback: ICommandCallback, usage: string, affinity?: number) {
        this.commands[key.toLowerCase()] = {
            callback,
            meta: {
                usage,
                affinity
            }
        };
    }

    deregister(key: string) {
        delete this.commands[key.toLowerCase()];
    }
}