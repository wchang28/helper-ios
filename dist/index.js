"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var io_stream_templates_1 = require("io-stream-templates");
var stream_1 = require("stream");
var child_process_1 = require("child_process");
var https = require("https");
var http = require("http");
// stdout logger that does fire a "finish" event when end() is called
var StdoutLogger = /** @class */ (function (_super) {
    __extends(StdoutLogger, _super);
    function StdoutLogger() {
        return _super.call(this, function () { return ({ writable: process.stdout, keepInternalWritableOpenWhenFinish: true }); }) || this;
    }
    return StdoutLogger;
}(io_stream_templates_1.WritableTemplate));
exports.StdoutLogger = StdoutLogger;
// stderr logger that does fire a "finish" event when end() is called
var StderrLogger = /** @class */ (function (_super) {
    __extends(StderrLogger, _super);
    function StderrLogger() {
        return _super.call(this, function () { return ({ writable: process.stderr, keepInternalWritableOpenWhenFinish: true }); }) || this;
    }
    return StderrLogger;
}(io_stream_templates_1.WritableTemplate));
exports.StderrLogger = StderrLogger;
// string stream
var StringStream = /** @class */ (function (_super) {
    __extends(StringStream, _super);
    function StringStream(s) {
        return _super.call(this, function () {
            var str = new stream_1.Readable({ read: function () { } });
            str.push(s);
            str.push(null);
            return str;
        }) || this;
    }
    return StringStream;
}(io_stream_templates_1.ReadableTemplate));
exports.StringStream = StringStream;
// string receiver/concatenator
var StringReceiver = /** @class */ (function (_super) {
    __extends(StringReceiver, _super);
    function StringReceiver() {
        var _this = _super.call(this) || this;
        _this._s = "";
        return _this;
    }
    StringReceiver.prototype._write = function (chunk, encoding, callback) {
        this._s += chunk.toString();
        callback();
    };
    Object.defineProperty(StringReceiver.prototype, "text", {
        get: function () { return this._s; },
        enumerable: true,
        configurable: true
    });
    return StringReceiver;
}(stream_1.Writable));
exports.StringReceiver = StringReceiver;
// spawn child process
var CGIIO = /** @class */ (function (_super) {
    __extends(CGIIO, _super);
    function CGIIO(spawnArgsSource) {
        var _this = _super.call(this, function () {
            var _a = spawnArgsSource(), command = _a.command, args = _a.args, cwd = _a.cwd, env = _a.env;
            var cp = child_process_1.spawn(command, args, { cwd: cwd, env: env, windowsHide: true });
            var ps = new stream_1.PassThrough();
            var stderr = "";
            cp.stderr.on("data", function (chunk) {
                stderr += chunk; // accumulate the stderr with the chunk 
            });
            cp.stdout.on("data", function (chunk) {
                ps.write(chunk);
            });
            cp.on("error", function (err) {
                ps.emit("error", err);
            }).on("close", function (code, signal) {
                ps.emit("child-process-close", code, signal);
                if (stderr) {
                    ps.emit("error", { code: code, stderr: stderr });
                }
                else {
                    ps.end();
                }
            });
            return { writable: cp.stdin, readable: ps };
        }) || this;
        _this.internalReadable.on("child-process-close", function (code, signal) {
            _this.emit("child-process-close", code, signal);
        });
        return _this;
    }
    return CGIIO;
}(io_stream_templates_1.IOTemplate));
exports.CGIIO = CGIIO;
// for PUT/POST/PATCH http/https request
var RequestUpsert = /** @class */ (function (_super) {
    __extends(RequestUpsert, _super);
    function RequestUpsert(method, url, headers) {
        return _super.call(this, function () {
            var u = new URL(url);
            var options = {
                hostname: u.hostname,
                port: u.port,
                path: u.pathname + u.search,
                method: method,
                headers: headers || {}
            };
            var req = (u.protocol === "https:" ? https.request(options) : http.request(options));
            var ptResponse = new stream_1.PassThrough();
            req.on("response", function (response) {
                response.pipe(ptResponse);
            });
            return { writable: req, readable: ptResponse };
        }) || this;
    }
    return RequestUpsert;
}(io_stream_templates_1.IOTemplate));
exports.RequestUpsert = RequestUpsert;
// for GET http/https request
var RequestGet = /** @class */ (function (_super) {
    __extends(RequestGet, _super);
    function RequestGet(url, headers) {
        return _super.call(this, function () {
            var u = new URL(url);
            var options = {
                hostname: u.hostname,
                port: u.port,
                path: u.pathname + u.search,
                method: "GET",
                headers: headers || {}
            };
            var req = (u.protocol === "https:" ? https.request(options) : http.request(options));
            var ptResponse = new stream_1.PassThrough();
            req.on("response", function (response) {
                response.pipe(ptResponse);
            }).on("error", function (err) {
                ptResponse.emit("error", err);
            });
            req.end();
            return ptResponse;
        }) || this;
    }
    return RequestGet;
}(io_stream_templates_1.ReadableTemplate));
exports.RequestGet = RequestGet;
//# sourceMappingURL=index.js.map