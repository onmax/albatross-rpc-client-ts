import fetch from 'node-fetch';

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

export type Context<Params extends any[] = any> = {
    request: {
        method: string;
        params: Params;
        id: number;
    },
    timestamp: number;
    url: string;
}

export type CallResult<Params extends any[], Data, Metadata = undefined> = {
    context: Context<Params>
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

    constructor(url: URL) {
        this.url = url;
    }

    async call<
        Data,
        Request extends { method: string; params: any[], withMetadata?: boolean },
        Metadata = undefined,
    >(
        request: Request,
        options: HttpOptions
    ): Promise<CallResult<Request["params"], Data, Metadata>> {
        const { method, params: requestParams, withMetadata } = request;
        const { timeout } = options;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const params = (requestParams as any[]).map((param: any) => (param === undefined ? null : param)) as Context<Request["params"]>['request']['params'];

        const context: Context<Request["params"]> = {
            request: {
                method,
                params,
                id: HttpClient.id,
            },
            url: this.url.href,
            timestamp: Date.now(),
        };

        const response = await fetch(this.url.href, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
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
                return { ok: false, status: 503, statusText: `FetchError: Service Unavailable: ${error.message}` } as Response
            } else {
                return { ok: false, status: 503, statusText: `Service Unavailable: ${error.message}` } as Response
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
                        : `Response status code not OK: ${response.status} ${response.statusText}`,
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
                    message: `${json.error.message}: ${json.error.data}`,
                },
            }
        }

        return {
            context,
            data: undefined,
            metadata: undefined,
            error: {
                code: -1,
                message: `Unexpected format of data ${JSON.stringify(json)}`,
            },
        }
    }
}
