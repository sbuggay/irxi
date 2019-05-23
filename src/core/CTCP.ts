import { IMessage } from "./IRCSocket";

// There is also the possibility that the last character is also the control code.
// Should this be checked?
export function isCTCPMessage(message: IMessage) {
    return message.trailing.codePointAt(0) === 0x01;
}

export function handleCTCPMessage(message: IMessage) {

}