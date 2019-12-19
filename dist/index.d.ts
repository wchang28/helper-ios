/// <reference types="node" />
import { ReadableTemplate, WritableTemplate, IOTemplate } from "io-stream-templates";
import * as http from "http";
export declare class StdoutLogger extends WritableTemplate {
    constructor();
}
export declare class StderrLogger extends WritableTemplate {
    constructor();
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
