import fetch from 'node-fetch';
import { MethodName, RpcRequest, MethodResponse, MethodResponseError } from "../types/rpc-messages";

type CallReturn<T extends MethodName> =  MethodResponse<T>["result"] extends {metadata: null}
    ? MethodResponse<T>["result"]["data"]
    : MethodResponse<T>["result"]

export class HttpClient {
    private url: URL;
    private id: number = 0;

    constructor(url: URL) {
        this.url = url;
    }

    async call<T extends MethodName>(method: T, params: RpcRequest<T>["params"]): Promise<CallReturn<T>> {
        const response = new Promise<MethodResponse<T>>(async (resolve, reject) => {
            return fetch(this.url.href, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method,
                    params,
                    id: this.id++,
                }),
            })
            .then(response => {
                if (!response.ok) {
                    reject(response.status === 401
                        ? 'Server requires authorization.'
                        : `Response status code not OK: ${response.status} ${response.statusText}`)
                }
                return response
            })
            .then(response => response.json())
            .then(data => {
                const typedData = data as MethodResponse<T> | MethodResponseError
                if ('result' in typedData) resolve(typedData as MethodResponse<T>)
                if ('error' in typedData) reject(`${typedData.error.message}: ${typedData.error.data}`)
                reject(`Unexpected format of data ${JSON.stringify(data)}`)
              })
        });
    
        if (!response) {
            throw new Error("Response is not successful");
        }
    
        return await response.then(response => {
            if (!response.result.metadata) return response.result.data
            return response.result
        });
    }
}
