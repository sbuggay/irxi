# irxi

irxi is a full IRC client in TypeScript. The core client is written from the ground up only referencing the original spec. Right now there is only a console renderer (through blessed) but future plans include react-native for windows/mobile.

## Features

- All non-admin IRC commands: [https://en.wikipedia.org/wiki/List_of_Internet_Relay_Chat_commands](https://en.wikipedia.org/wiki/List_of_Internet_Relay_Chat_commands)
- Custom messages for all basic RPL codes (MOTD, INFO, NAMES, etc)
- JOIN/PART channels
- PRIVMSG

Basic [CTCP](https://tools.ietf.org/id/draft-oakley-irc-ctcp-01.html#rfc.appendix.A) support:
- ACTION
- CLIENTINFO
- DCC
- FINGER
- PING
- SOURCE
- TIME
- VERSION
- USERINFO

## Reference

https://tools.ietf.org/html/rfc1459
https://tools.ietf.org/id/draft-oakley-irc-ctcp-01.html#rfc.appendix.A
https://modern.ircdocs.horse/
https://ircv3.net/index.html