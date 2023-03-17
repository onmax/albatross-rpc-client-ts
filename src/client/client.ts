import { MethodName, MethodResponse, RpcRequest, StreamName } from "../types/rpc-messages";
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

    async call<T extends MethodName>(method: T, params: RpcRequest<T>["params"], withMetadata: boolean = false): Promise<CallReturn<T>> {
        return this.httpClient.call(method, params, withMetadata);
    }

    async subscribe<T extends StreamName>(event: T, params: RpcRequest<T>["params"], withMetadata: boolean = false) {
        return this.webSocketClient.subscribe(event, params, withMetadata);
    }
}
