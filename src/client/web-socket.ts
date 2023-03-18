import { Blob } from 'buffer';
import WebSocket from 'ws';
import { Block, PartialBlock } from '../types/common';
import { MethodResponse, RpcRequest, StreamName, StreamResponse } from "../types/rpc-messages";

export type Subscription<T extends StreamName, ShowMetadata extends boolean | undefined = false, IncludeBody extends boolean = false> = {
    next: (callback: (data: CallbackParam<T, ShowMetadata, IncludeBody>) => void) => void;
    error: (callback: (error: any) => void) => void;
    close: () => void;

    // The subscriptionId is only available after the subscription is opened
    // By default it is set to -1
    getSubscriptionId: () => number;
}

type CallbackParam<T extends StreamName, ShowMetadata extends boolean | undefined = false, IncludeBody extends boolean = false> =
    T extends 'subscribeForHeadBlock'
        ? IncludeBody extends true
            ? Block
            : PartialBlock
        : ShowMetadata extends true
            ? StreamResponse<T>['params']['result']
            : StreamResponse<T>['params']['result']['data']

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

    async subscribe<T extends StreamName, ShowMetadata extends boolean>(event: T, params: RpcRequest<T>["params"], withMetadata: ShowMetadata): Promise<Subscription<T, ShowMetadata>> {
        const ws = new WebSocket(this.url.href);
        let subscriptionId : number;
        
        const options: Subscription<T, ShowMetadata> = {
            next: (callback: (data: CallbackParam<T, ShowMetadata>) => void) => {
                ws.onmessage = async (event) => {
                    const payload = await this.parsePayload<T>(event);
                    if ('result' in payload) {
                        subscriptionId = payload.result;
                        return;
                    }
                    const data = (withMetadata ? payload.params.result : payload.params.result.data) as CallbackParam<T, ShowMetadata>;
                    callback(data);
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
        }
        
        return new Promise((resolve) => {
            ws.onopen = () => {
                ws.send(JSON.stringify({
                    jsonrpc: '2.0',
                    method: event,
                    params,
                    id: this.id++,
                }));
                resolve(options);
            }
        });
    }

    private async parsePayload<T extends StreamName>(event: WebSocket.MessageEvent): Promise<StreamResponse<T> | MethodResponse<'streamOpened'>> {
        let payloadStr: string;
        if (event.data instanceof Blob) {
            payloadStr = this.textDecoder.decode(await event.data.arrayBuffer());
        } else if (event.data instanceof ArrayBuffer || event.data instanceof Buffer) {
            payloadStr = this.textDecoder.decode(event.data);
        } else {
            throw new Error('Unexpected data type');
        }

        try {
            return JSON.parse(payloadStr) as StreamResponse<T> | MethodResponse<'streamOpened'>;
        } catch (e) {
            throw new Error(`Unexpected payload: ${payloadStr}`);
        }
    }
}
