import { InteractionName, RpcRequest, RpcResponse } from "../types/rpc-messages";
import { HttpClient } from './http';
import { WebSocketClient } from "./web-socket";


type CallReturn<T extends InteractionName> =  RpcResponse<T>["result"] extends {metadata: null}
    ? RpcResponse<T>["result"]["data"]
    : RpcResponse<T>["result"]

export class Client {
    private httpClient: HttpClient;
    private webSocketClient: WebSocketClient;

    constructor(url: URL) {
        this.httpClient = new HttpClient(url);
        this.webSocketClient = new WebSocketClient(url);
    }

    async call<T extends InteractionName>(method: T, params: RpcRequest<T>["params"]): Promise<CallReturn<T>> {
        return this.httpClient.call(method, params);
    }

    async subscribe<T extends InteractionName>(event: T, params: RpcRequest<T>["params"]) {
        return this.webSocketClient.subscribe(event, params);
    }
}
