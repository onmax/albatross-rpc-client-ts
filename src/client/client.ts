import { CallOptions, MethodName, MethodResponse, RpcRequest, StreamName, StreamOptions } from "../types/rpc-messages";
import { HttpClient } from './http';
import { WebSocketClient } from "./web-socket";


type CallReturn<T extends MethodName> =  MethodResponse<T>["result"] extends {metadata: null}
    ? MethodResponse<T>["result"]["data"]
    : MethodResponse<T>["result"]

export class Client {
    private httpClient: HttpClient;
    private webSocketClient: WebSocketClient;

    constructor(url: URL) {
        this.httpClient = new HttpClient(url);
        this.webSocketClient = new WebSocketClient(url);
    }

    async call<T extends MethodName>(method: T, params: RpcRequest<T>["params"], options: CallOptions, withMetadata: boolean = false) {
        return this.httpClient.call(method, params, withMetadata, options);
    }

    async subscribe<T extends StreamName>(event: T, params: RpcRequest<T>["params"], options: StreamOptions, withMetadata: boolean = false) {
        return this.webSocketClient.subscribe(event, params, withMetadata, options);
    }
}
