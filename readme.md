# [irc-proto]

[projectname] is a full IRC client in TypeScript. The core client is written from the ground up only referencing the original spec. Right now there is only a console renderer (through blessed) but future plans include react-native for windows/mobile.

### Features

- Connecting
- JOIN/PART channels
- PRIVMSG
- 

https://tools.ietf.org/html/rfc1459
https://modern.ircdocs.horse/

Messages follwo this format:

```
[@tags] [:source] <command> <parameters>
```

    tags: Optional metadata on a message, starting with ('@', 0x40).
    source: Optional note of where the message came from, starting with (':', 0x3a). Also called the prefix.
    command: The specific command this message represents.
    parameters: If it exists, data relevant to this specific command.



 Channels names are strings (beginning with a '&' or '#' character) of
   length up to 200 characters.  Apart from the the requirement that the
   first character being either '&' or '#'; the only restriction on a
   channel name is that it may not contain any spaces (' '), a control G
   (^G or ASCII 7), or a comma (',' which is used as a list item
   separator by the protocol).

'psuedo' BNF

```
<message>  ::= [':' <prefix> <SPACE> ] <command> <params> <crlf>
<prefix>   ::= <servername> | <nick> [ '!' <user> ] [ '@' <host> ]
<command>  ::= <letter> { <letter> } | <number> <number> <number>
<SPACE>    ::= ' ' { ' ' }
<params>   ::= <SPACE> [ ':' <trailing> | <middle> <params> ]

<middle>   ::= <Any *non-empty* sequence of octets not including SPACE
               or NUL or CR or LF, the first of which may not be ':'>
<trailing> ::= <Any, possibly *empty*, sequence of octets not including
                 NUL or CR or LF>

<crlf>     ::= CR LF
```
