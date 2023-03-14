import fetch from 'node-fetch';
import { MethodName, RpcRequest, RpcResponse } from "../types/rpc-messages";

export class RpcClient {
    private url: string;
    private static id: number = 0;

    constructor(url: string) {
        this.url = url;
    }

    protected async call<T extends MethodName>(method: T, params: RpcRequest<T>["params"]) {
        const response = new Promise<RpcResponse<T>>(async (resolve, reject) => {
            return fetch(this.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method,
                    params,
                    id: RpcClient.id++,
                }),
            })
            .then(response => response.json())
            .then(data => resolve(data as RpcResponse<T>))
            .catch(error => reject(error));
        });

        if (!response) {
            throw new Error("Response is not successful");
        }

        return await response.then(response => response.result);

    }
}