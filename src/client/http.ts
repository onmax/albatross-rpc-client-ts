import fetch from 'node-fetch';
import { CallOptions, ContextRequest, ErrorCallReturn, MethodName, MethodResponse, MethodResponseContent, MethodResponseError, RpcRequest, SendTxCallOptions } from "../types/rpc-messages";

type SuccessCallReturn<T extends MethodName, WithMetadata extends boolean> = MethodResponse<T>["result"] extends { metadata: null }
    ? MethodResponseContent<T, false>
    : WithMetadata extends true
        ? MethodResponse<T>["result"]
        : MethodResponseContent<T, WithMetadata>

type MaybeResponse<T extends MethodName, ShowMetadata extends boolean> = {
    error: ErrorCallReturn
    data: undefined
    context: ContextRequest
} | {
    error: undefined
    data: SuccessCallReturn<T, ShowMetadata>
    context: ContextRequest
}

export const DEFAULT_OPTIONS: CallOptions = {
    timeout: 10_000
}

export const DEFAULT_TIMEOUT_CONFIRMATION: number = 10_000

export const DEFAULT_OPTIONS_SEND_TX: SendTxCallOptions = {
    timeout: DEFAULT_TIMEOUT_CONFIRMATION,
}

export class HttpClient {
    private url: URL;
    private static id: number = 0;

    constructor(url: URL) {
        this.url = url;
    }

    async call<T extends MethodName, ShowMetadata extends boolean>(method: T, params: RpcRequest<T>["params"], withMetadata: ShowMetadata, options: CallOptions): Promise<MaybeResponse<T, ShowMetadata>> {
        const { timeout } = options

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // replace undefined with null
        params = params.map((param: any) => param === undefined ? null : param) as RpcRequest<T>['params']

        const context: ContextRequest = {
            method,
            params,
            id: HttpClient.id,
            timestamp: Date.now()
        }

        const response = await fetch(this.url.href, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method,
                params,
                id: HttpClient.id++,
            }),
            signal: controller.signal
        }).catch((error) => {
            if (error.name === 'AbortError') {
                return { ok: false, status: 408, statusText: `AbortError: Service Unavailable: ${error.message}` } as Response
            } else if (error.name === 'FetchError') {
                return { ok: false, status: 503, statusText: `FetchError: Service Unavailable: ${error.message}` } as Response
            } else {
                return { ok: false, status: 503, statusText: `Service Unavailable: ${error.message}` } as Response
            }
        })

        clearTimeout(timeoutId);

        if (!response.ok) {
            return {
                error: {
                    code: response.status,
                    message: response.status === 401
                        ? 'Server requires authorization.'
                        : `Response status code not OK: ${response.status} ${response.statusText}`
                },
                data: undefined,
                context,
            }
        }

        const json = await response.json()

        const typedData = json as MethodResponse<T> | MethodResponseError
        if ('result' in typedData) {
            const data: SuccessCallReturn<T, ShowMetadata> = (!withMetadata || !typedData.result.metadata)
                ? typedData.result.data
                : typedData.result
            return {
                error: undefined,
                data,
                context,
            }
        }
        if ('error' in typedData) {
            return {
                error: {
                    code: typedData.error.code,
                    message: `${typedData.error.message}: ${typedData.error.data}`,
                },
                data: undefined,
                context,
            }
        }

        return {
            error: {
                code: -1,
                message: `Unexpected format of data ${JSON.stringify(json)}`,
            },
            data: undefined,
            context,
        }
    }
}
