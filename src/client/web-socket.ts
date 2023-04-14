import { Blob } from 'buffer';
import WebSocket from 'ws';
import { CallbackParam, ContextRequest, ErrorStreamReturn, MaybeStreamResponse, MethodResponse, RpcRequest, StreamName, StreamOptions, StreamResponse } from "../types/rpc-messages";

export type Subscription<CallbackItem> = {
    next: (callback: (p: CallbackItem) => void) => void;
    error: (callback: (error: any) => void) => void;
    close: () => void;

    context: ContextRequest;

    // The subscriptionId is only available after the subscription is opened
    // By default it is set to -1
    getSubscriptionId: () => number;
}

export type MaybeSubscription<T extends StreamName, ShowMetadata extends boolean | undefined = false, IncludeBody extends boolean = false> = 
    Subscription<MaybeStreamResponse<CallbackParam<T, ShowMetadata, IncludeBody>>>

export const WS_DEFAULT_OPTIONS: StreamOptions = {
    once: false,
    filter: () => true,
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

    async subscribe<T extends StreamName, ShowMetadata extends boolean, IncludeBody extends boolean>(event: T, params: RpcRequest<T>["params"], userOptions: StreamOptions<T>) {
        const ws = new WebSocket(this.url.href);
        let subscriptionId : number;

        const requestBody = {
            jsonrpc: '2.0',
            method: event,
            params,
            id: this.id++,
        };

        const options = {
            ...WS_DEFAULT_OPTIONS,
            ...userOptions,
        }

        const { once, filter } = options;
        const withMetadata = 'withMetadata' in options ? options.withMetadata : false;

        const args: MaybeSubscription<T, ShowMetadata> = {
            next: (callback: (data: MaybeStreamResponse<CallbackParam<T, ShowMetadata, IncludeBody>>) => void) => {
                ws.onmessage = async (event) => {
                    const payload = await this.parsePayload<T>(event);

                    if ('error' in payload) {
                        callback({ data: undefined, error: payload as ErrorStreamReturn });
                        return;
                    }

                    if ('result' in payload) {
                        subscriptionId = payload.result;
                        return;
                    }

                    const data = (withMetadata ? (payload as StreamResponse<T>).params.result : (payload as StreamResponse<T>).params.result.data) as CallbackParam<T, ShowMetadata>;

                    if (filter && !filter(data)) {
                        return;
                    }

                    callback({data, error: undefined});

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
            context: {
                ...requestBody,
                timestamp: Date.now(),
            }
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
