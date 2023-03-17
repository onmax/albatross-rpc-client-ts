import WebSocket from 'ws';
import { Blob } from 'buffer';
import { StreamName, RpcRequest } from "../types/rpc-messages";

type Subscription = {
    next: (callback: (data: any) => void) => void;
    error: (callback: (error: any) => void) => void;
    close: () => void;
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

    // TODO Improve typing in subscriptions
    async subscribe<T extends StreamName>(event: T, params: RpcRequest<T>["params"]): Promise<Subscription> {
        const ws = new WebSocket(this.url.href);
        
        console.log(this.url.href, JSON.stringify({
            jsonrpc: '2.0',
            method: event,
            params,
            id: this.id++,
        }))

        const options: Subscription = {
            next: (callback: (data: any) => void) => {
                ws.onmessage = async (event) => {
                    console.log(`EVENT: ${JSON.stringify(event)}`);
                    let payload;
                    if (event.data instanceof Blob) {
                        payload = this.textDecoder.decode(await event.data.arrayBuffer());
                    } else if (event.data instanceof ArrayBuffer || event.data instanceof Buffer) {
                        payload = this.textDecoder.decode(event.data);
                    } else {
                        payload = event.data;
                    }
                    callback(payload);
                }
            },
            error: (callback: (error: any) => void) => {
                ws.onerror = (error) => {
                    callback(error);
                }
            },
            close: () => {  
                ws.close();
            }
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
}
