import { IRCClient } from "./IRCClient";
import { CommandHandler } from "./CommandHandler";

export function registerCommands(commandHandler: CommandHandler, ircClient: IRCClient) {
    commandHandler.register("CONNECT", (params) => {

        if (params.length < 1) {
            ircClient.emitMessage("not enough params");
            return;
        }
    
        ircClient.emitMessage(`connecting to ${params[0]}`);
    
        // TODO: Disconnect from previous connection first
        ircClient.connect(params[0]).then(() => {
            ircClient.nickname(ircClient.status.nick);
            ircClient.user(ircClient.status.nick, "devan");
            ircClient.emitStatus();
        });
    });
    
    commandHandler.register("JOIN", (params) => {
        // TODO: Does join allow multiple channels?
        if (params.length != 1) {
            ircClient.emitMessage("/JOIN not enough params");
            return;
        }
    
        ircClient.join(params[0]);
    });
    
    commandHandler.register("QUIT", (params) => {
        ircClient.quit();
        setTimeout(() => process.exit(0), 500);
    });
}

// Register client commands
