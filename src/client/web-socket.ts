import { Blob } from 'buffer';
import WebSocket from 'ws';
import { CallbackParam, ContextRequest, ErrorStreamReturn, MaybeStreamResponse, MethodResponse, RpcRequest, StreamName, StreamOptions, StreamResponse } from "../types/rpc-messages";

export type Subscription<T extends StreamName, ShowMetadata extends boolean | undefined = false, IncludeBody extends boolean = false> = {
    next: (callback: (p: MaybeStreamResponse<T, ShowMetadata, IncludeBody>) => void) => void;
    error: (callback: (error: any) => void) => void;
    close: () => void;

    context: ContextRequest;

    // The subscriptionId is only available after the subscription is opened
    // By default it is set to -1
    getSubscriptionId: () => number;
}

export const WS_DEFAULT_OPTIONS: StreamOptions = {
    once: false,
}

export class WebSocketClient {
    private url: URL;
    private id: number = 0;
    private textDecoder: TextDecoder;

    constructor(url: URL) {
        const wsUrl = new URL(url.href.replace(/^http/, 'ws'));
        wsUrl.pathname = '/ws';
        this.url = wsUrl;
        this.textDecoder = new TextDecoder()
    }

    async subscribe<T extends StreamName, ShowMetadata extends boolean>(event: T, params: RpcRequest<T>["params"], withMetadata: ShowMetadata, options: StreamOptions): Promise<Subscription<T, ShowMetadata>> {
        const ws = new WebSocket(this.url.href);
        let subscriptionId : number;

        const requestBody = {
            jsonrpc: '2.0',
            method: event,
            params,
            id: this.id++,
        };

        const { once } = options;
        
        const args: Subscription<T, ShowMetadata> = {
            next: (callback: (data: MaybeStreamResponse<T, ShowMetadata>) => void) => {
                ws.onmessage = async (event) => {
                    const payload = await this.parsePayload<T>(event);

                    if ('result' in payload) {
                        subscriptionId = payload.result;
                        return;
                    }

                    if ('error' in payload) {
                        callback({ data: undefined, error: payload as ErrorStreamReturn });
                    } else {
                        const data = (withMetadata ? (payload as StreamResponse<T>).params.result : (payload as StreamResponse<T>).params.result.data) as CallbackParam<T, ShowMetadata>;
                        callback({data, error: undefined});
                    }

                    if (once) {
                        ws.close();
                    }
                }
            },
            error: (callback: (error: any) => void) => {
                ws.onerror = (error) => {
                    callback(error);
                }
            },
            close: () => {  
                ws.close();
            },
            getSubscriptionId: () => subscriptionId,
            context: requestBody
        }
        
        return new Promise((resolve) => {
            ws.onopen = () => {
                ws.send(JSON.stringify(requestBody));
                resolve(args);
            }
        });
    }

    private async parsePayload<T extends StreamName>(event: WebSocket.MessageEvent): Promise<StreamResponse<T> | MethodResponse<'streamOpened'> | ErrorStreamReturn> {
        let payloadStr: string;
        if (event.data instanceof Blob) {
            payloadStr = this.textDecoder.decode(await event.data.arrayBuffer());
        } else if (event.data instanceof ArrayBuffer || event.data instanceof Buffer) {
            payloadStr = this.textDecoder.decode(event.data);
        } else {
            return {
                code: 1001,
                message: 'Unexpected data type'
            }
        }

        try {
            return JSON.parse(payloadStr) as StreamResponse<T> | MethodResponse<'streamOpened'>;
        } catch (e) {
            return {
                code: 1002,
                message: `Unexpected payload: ${payloadStr}`
            }
        }
    }
}
