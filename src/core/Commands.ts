import { IRCClient } from "./IRCClient";
import { CommandHandler } from "./CommandHandler";

// https://en.wikipedia.org/wiki/List_of_Internet_Relay_Chat_commands

export function registerCommands(commandHandler: CommandHandler, ircClient: IRCClient) {
    commandHandler.register("CONNECT", (params) => {
        ircClient.emitMessage(`connecting to ${params[0]}`);

        // TODO: Disconnect from previous connection first
        ircClient.connect(params[0]).then(() => {
            ircClient.nickname(ircClient.status.nick);
            ircClient.user(ircClient.status.nick, "devan");
            ircClient.emitStatus();
        });
    }, "CONNECT <server>, joins the server", 1);

    commandHandler.register("JOIN", (params) => {
        ircClient.join(params[0]);
    }, "JOIN <channel>, joins the channel", 1);

    commandHandler.register("NAMES", (params) => {
        ircClient.names(params.join(","));
    }, "NAMES [<channel>]");

    commandHandler.register("PART", (params) => {
        ircClient.part(params[0]);
    }, "PART [<channel>], Leave the channel, or current channel if not specified");

    commandHandler.register("SEND", (params) => {
        ircClient._socketSend(params.join(" "));
    }, "SEND <params>, send raw params to server");

    commandHandler.register("QUIT", () => {
        ircClient.quit();
        setTimeout(() => process.exit(0), 500);
    }, "QUIT, quit the server", 0);
}

// Register client commands
