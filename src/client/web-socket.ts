import { InteractionName, RpcRequest } from "../types/rpc-messages";


export class WebSocketClient {
    private url: URL;
    private id: number = 0;
    private textDecoder: TextDecoder;


    constructor(url: URL) {
        this.url = url;
        this.textDecoder = new TextDecoder()
    }

    // TODO Improve typing in subscriptions
    async subscribe<T extends InteractionName>(event: T, params: RpcRequest<T>["params"]) {
        const ws = new WebSocket(this.url.href);
        ws.onopen = () => {
            ws.send(JSON.stringify({
                jsonrpc: '2.0',
                method: event,
                params,
                id: this.id++,
            }));
        }
        // socket.onmessage = async (event)=>{
        //     let msg;
        //     if (event.data instanceof Blob) {
        //         msg = this.getTextDecoder().decode(await event.data.arrayBuffer());
        //     } else if (event.data instanceof ArrayBuffer) {
        //         msg = this.getTextDecoder().decode(event.data);
        //     } else {
        //         msg = event.data;
        //     }
        //     let payload;
        //     try {
        //         payload = JSON.parse(msg);
        //     } catch (error) {
        //         throw new BadServerDataError(null, `The server sent invalid JSON: ${error.message}`, null);
        //     }
        //     if (isResolved) {
        //         this.payloadQueue.push(payload);
        //         return;
        //     }
        //     resolve(payload);
        //     isResolved = true;
        // };
        // socket.onclose = ()=>resolve(null)
        return {
            next: (callback: (data: any) => void) => {
                ws.onmessage = async (event) => {
                    let payload;
                    if (event.data instanceof Blob) {
                        payload = this.textDecoder.decode(await event.data.arrayBuffer());
                    } else if (event.data instanceof ArrayBuffer) {
                        payload = this.textDecoder.decode(event.data);
                    } else {
                        payload = event.data;
                    }
                    callback(payload);
                }
            },
            close: () => {  
                ws.close();
            }
        }
    }
}
