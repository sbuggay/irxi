"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var net_1 = require("net");
var events_1 = require("events");
var IRCClient = (function (_super) {
    __extends(IRCClient, _super);
    function IRCClient(host, port, options) {
        if (host === void 0) { host = "irc.freenode.net"; }
        if (port === void 0) { port = 6667; }
        var _this = _super.call(this) || this;
        _this.host = host;
        _this.port = port;
        _this.socket = new net_1.Socket(options);
        _this.connected = false;
        _this.buffer = "";
        _this.socket.on("ready", _this.ready.bind(_this));
        _this.socket.on("data", _this.processData.bind(_this));
        _this.socket.on("close", function () { return console.log("closed"); });
        _this.on("message", _this.handleMessage.bind(_this));
        return _this;
    }
    IRCClient.prototype.ready = function () {
        this.send("NICK", "pwnmonkey__");
        this.send("USER", "pwnmonkey__ * * :pwnmonkey__");
    };
    IRCClient.prototype.processData = function (data) {
        var _this = this;
        this.buffer += data;
        var lines = this.buffer.split("\r\n");
        this.buffer = lines.pop() || "";
        lines.forEach(function (line) {
            var message = _this.parseData(line);
            if (message) {
                _this.emit("message", message);
            }
        });
    };
    IRCClient.prototype.parseData = function (input, stripColors) {
        if (stripColors === void 0) { stripColors = false; }
        if (stripColors) {
            input = input.replace(/[\x02\x1f\x16\x0f]|\x03\d{0,2}(?:,\d{0,2})?/g, "");
        }
        var prefix = "", trailing = "", pos = 0, args = [];
        if (input[0] === ":") {
            pos = input.indexOf(" ");
            prefix = input.substr(1, pos - 1);
            trailing = input.substr(pos + 1);
        }
        if ((pos = input.indexOf(" :")) !== -1) {
            trailing = input.substr(pos + 2);
            input = input.substr(0, pos);
            args = input.length != 0 ? input.split(" ") : [];
            args.push(trailing);
            args = args.slice(0);
        }
        else {
            args = input.length != 0 ? input.split(" ") : [];
        }
        return {
            prefix: prefix,
            command: args[0],
            params: args.slice(2)
        };
    };
    IRCClient.prototype.handleMessage = function (message) {
        console.log(message.command, message.params);
        if (message.command === "PING") {
        }
    };
    IRCClient.prototype.send = function (cmd, message) {
        var command = cmd + " " + message + "\r\n";
        console.log("[SEND]", command);
        this.socket.write(command);
    };
    IRCClient.prototype.join_channel = function (channel) {
        this.send("JOIN", channel);
    };
    IRCClient.prototype.identify = function (username, password) {
        this.send("PRIVMSG NickServ", "identify " + username + " " + password);
    };
    IRCClient.prototype.privmsg = function (target, message) {
        this.send("PRIVMSG " + target, message);
    };
    IRCClient.prototype.connect = function () {
        this.socket.connect(this.port, this.host, function () {
            console.log("connected");
        });
    };
    return IRCClient;
}(events_1.EventEmitter));
var ircClient = new IRCClient();
ircClient.connect();
//# sourceMappingURL=main.js.map