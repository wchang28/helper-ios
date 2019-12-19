import {ReadableTemplate, WritableTemplate, IOTemplate} from "io-stream-templates";
import {Readable, Writable, PassThrough} from "stream";
import {spawn} from "child_process";
import * as https from "https";
import * as http from "http";

// stdout logger that does fire a "finish" event when end() is called
export class StdoutLogger extends WritableTemplate {
    constructor() {
        super(() => ({writable: process.stdout, keepInternalWritableOpenWhenFinish: true}));
    }
}

// stderr logger that does fire a "finish" event when end() is called
export class StderrLogger extends WritableTemplate {
    constructor() {
        super(() => ({writable: process.stderr, keepInternalWritableOpenWhenFinish: true}));
    }
}

// string stream
export class StringStream extends ReadableTemplate {
    constructor(s: string) {
        super(() => {
            const str = new Readable({read: () => {}});
            str.push(s);
            str.push(null);
            return str;
        });
    }
}

// string receiver/concatenator
export class StringReceiver extends Writable {
    private _s: string;
    constructor() {
        super();
        this._s = "";
    }
    _write(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
        this._s += chunk.toString();
        callback();
    }
    get text() {return this._s;}
}

// spawn child process
export class CGIIO extends IOTemplate {
    constructor(spawnArgsSource: () => {command: string, args?: string[], cwd?: string, env?: any}) {
        super(() => {
            const {command, args, cwd, env} = spawnArgsSource();
            const cp = spawn(command, args, {cwd, env, windowsHide: true});
            const ps = new PassThrough();
            cp.stderr.on("data", (chunk: any) => {
                ps.write(chunk);
            });
            cp.stdout.on("data", (chunk: any) => {
                ps.write(chunk);
            });
            cp.on("error", (err: any) => {
                ps.emit("error", err);
            }).on("close", (code: number, signal) => {
                ps.emit("child-process-close", code, signal);
                ps.end();
            });
            return {writable: cp.stdin as Writable, readable: ps as Readable};            
        });

        this.internalReadable.on("child-process-close", (code, signal) => {
            this.emit("child-process-close", code, signal);
        });
    }
}

// for PUT/POST/PATCH http/https request
export class RequestUpsert extends IOTemplate {
    constructor(method: "PUT" | "POST" | "PATCH", url: string, headers?: http.OutgoingHttpHeaders) {
        super(() => {
            const u = new URL(url);
            const options = {
                hostname: u.hostname
                ,port: u.port
                ,path: u.pathname + u.search
                ,method: method
                ,headers: headers || {}
            };
            const req = (u.protocol === "https:" ? https.request(options) : http.request(options));
            const ptResponse = new PassThrough();
            req.on("response", (response) => {
                response.pipe(ptResponse);
            });
            return {writable: req, readable: ptResponse};
        });
    }
}

// for GET http/https request
export class RequestGet extends ReadableTemplate {
    constructor(url: string, headers?: http.OutgoingHttpHeaders) {
        super(() => {
            const u = new URL(url);
            const options = {
                hostname: u.hostname
                ,port: u.port
                ,path: u.pathname + u.search
                ,method: "GET"
                ,headers: headers || {}
            };
            const req = (u.protocol === "https:" ? https.request(options) : http.request(options));
            const ptResponse = new PassThrough();
            req.on("response", (response) => {
                response.pipe(ptResponse);
            }).on("error", (err) => {
				ptResponse.emit("error", err);
			});
            req.end();
            return ptResponse;
        });
    }
}