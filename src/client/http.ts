import fetch from 'node-fetch';
import { Auth } from 'src/types/common';

export type HttpOptions = {
    timeout?: number // in ms
}

export type SendTxCallOptions = HttpOptions & ({
    waitForConfirmationTimeout?: number, // in ms
})

export const DEFAULT_OPTIONS: HttpOptions = {
    timeout: 10_000
}

export const DEFAULT_TIMEOUT_CONFIRMATION: number = 10_000

export const DEFAULT_OPTIONS_SEND_TX: SendTxCallOptions = {
    timeout: DEFAULT_TIMEOUT_CONFIRMATION,
}

export type Context = {
    headers: HeadersInit,
    body: {
        method: string;
        params: any[];
        id: number;
    }
    timestamp: number;
    url: string;
}

export type CallResult<Data, Metadata = undefined> = {
    context: Context
} & (
        | {
            data: Data;
            metadata: Metadata;
            error: undefined;
        }
        | {
            data: undefined;
            metadata: undefined;
            error: {
                code: number;
                message: string;
            };
        }
    );

export class HttpClient {
    private url: URL;
    private static id: number = 0;
    private auth: Auth | undefined;

    constructor(url: URL, auth?: Auth) {
        this.url = url;
        this.auth = auth;
    }

    async call<
        Data,
        Metadata = undefined,
    >(
        request: { method: string; params?: any[], withMetadata?: boolean },
        options: HttpOptions
    ): Promise<CallResult<Data, Metadata>> {
        const { method, params, withMetadata } = request;
        const { timeout } = options;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const context: Context = {
            body: {
                method,
                params: params?.map((item) => item === undefined ? null : item) || [],
                id: HttpClient.id,
            },
            headers: {
                "Content-Type": "application/json",
                "Authorization": this.auth ? `Basic ${Buffer.from(`${this.auth.username}:${this.auth.password}`).toString('base64')}` : '',
            },
            url: this.url.href,
            timestamp: Date.now(),
        };

        const response = await fetch(this.url.href, {
            method: "POST",
            headers: context.headers,
            body: JSON.stringify({
                jsonrpc: "2.0",
                method,
                params,
                id: HttpClient.id++,
            }),
            signal: controller.signal,
        }).catch((error) => {
            if (error.name === 'AbortError') {
                return { ok: false, status: 408, statusText: `AbortError: Service Unavailable: ${error.message}` } as Response
            } else if (error.name === 'FetchError') {
                return { ok: false, status: 503, statusText: `FetchError: Service Unavailable: ${error.message} ` } as Response
            } else {
                return { ok: false, status: 503, statusText: `Service Unavailable: ${error.message} ` } as Response
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return {
                context,
                data: undefined,
                metadata: undefined,
                error: {
                    code: response.status,
                    message: response.status === 401
                        ? "Server requires authorization."
                        : `Response status code not OK: ${response.status} ${response.statusText} `,
                },
            }
        }

        const json = await response.json() as any;

        if ("result" in json) {
            return {
                context,
                data: json.result.data,
                metadata: withMetadata ? json.result.metadata : undefined,
                error: undefined,
            }
        }

        if ("error" in json) {
            return {
                context,
                data: undefined,
                metadata: undefined,
                error: {
                    code: json.error.code,
                    message: `${json.error.message}: ${json.error.data} `,
                },
            }
        }

        return {
            context,
            data: undefined,
            metadata: undefined,
            error: {
                code: -1,
                message: `Unexpected format of data ${JSON.stringify(json)} `,
            },
        }
    }
}
