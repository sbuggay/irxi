export function isCommand(input: string) {
    return input.indexOf("/") === 0;
}

export function parseCommand(input: string) {
    // Take the first word, remove the /
    const command = input.split(" ");
    const keyword = command[0];
    const params = command.slice(1);
    return keyword;
}