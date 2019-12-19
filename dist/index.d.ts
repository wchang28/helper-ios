/// <reference types="node" />
import { ReadableTemplate, WritableTemplate, IOTemplate } from "io-stream-templates";
import { Writable } from "stream";
import * as http from "http";
export declare class StdoutLogger extends WritableTemplate {
    constructor();
}
export declare class StderrLogger extends WritableTemplate {
    constructor();
}
export declare class StringStream extends ReadableTemplate {
    constructor(s: string);
}
export declare class StringReceiver extends Writable {
    private _s;
    constructor();
    _write(chunk: any, encoding: string, callback: (error?: Error | null) => void): void;
    get text(): string;
}
export declare class CGIIO extends IOTemplate {
    constructor(spawnArgsSource: () => {
        command: string;
        args?: string[];
        cwd?: string;
        env?: any;
    });
}
export declare class RequestUpsert extends IOTemplate {
    constructor(method: "PUT" | "POST" | "PATCH", url: string, headers?: http.OutgoingHttpHeaders);
}
export declare class RequestGet extends ReadableTemplate {
    constructor(url: string, headers?: http.OutgoingHttpHeaders);
}
