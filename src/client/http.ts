import type { Auth } from '../types/'

export interface HttpOptions {
  timeout?: number | false // in ms
}

export type SendTxCallOptions = HttpOptions & ({
  waitForConfirmationTimeout?: number // in ms
})

export const DEFAULT_OPTIONS: HttpOptions = {
  timeout: 10_000,
}

export const DEFAULT_TIMEOUT_CONFIRMATION: number = 10_000

export const DEFAULT_OPTIONS_SEND_TX: SendTxCallOptions = {
  timeout: DEFAULT_TIMEOUT_CONFIRMATION,
}

export interface Context {
  headers: HeadersInit
  body: {
    method: string
    params: any[]
    id: number
    jsonrpc: string
  }
  timestamp: number
  url: string
}

export type CallResult<Data, Metadata = undefined> = {
  context: Context
} & (
  | {
    data: Data
    metadata: Metadata
    error: undefined
  }
  | {
    data: undefined
    metadata: undefined
    error: {
      code: number
      message: string
    }
  }
)

export class HttpClient {
  private url: URL
  private static id: number = 0
  private headers: HeadersInit = { 'Content-Type': 'application/json', 'Authorization': '' }

  constructor(url: URL, auth?: Auth) {
    this.url = url
    if (auth?.username && auth.password) {
      const authorization = btoa(`${auth.username}:${auth.password}`)
      Object.assign(this.headers, { Authorization: `Basic ${authorization}` })
    }
  }

  async call<
    Data,
    Metadata = undefined,
  >(
    request: { method: string, params?: any[], withMetadata?: boolean },
        options: HttpOptions = DEFAULT_OPTIONS,
  ): Promise<CallResult<Data, Metadata>> {
    const { method, params: requestParams, withMetadata } = request
    const { timeout } = options

    let controller: AbortController | undefined
    let timeoutId: any | undefined

    if (timeout !== false) {
      controller = new AbortController()
      timeoutId = setTimeout(() => controller!.abort(), timeout)
    }

    const params = requestParams?.map(item => item === undefined ? null : item) || []

    const context: Context = {
      body: {
        method,
        params,
        jsonrpc: '2.0',
        id: HttpClient.id++,
      },
      headers: this.headers,
      url: this.url.href,
      timestamp: Date.now(),
    }

    const response = await fetch(context.url, {
      method: 'POST',
      headers: context.headers,
      body: JSON.stringify(context.body),
      signal: controller?.signal,
    }).catch((error) => {
      if (error.name === 'AbortError')
        return { ok: false, status: 408, statusText: `AbortError: Service Unavailable: ${error.message}` } as Response
      else if (error.name === 'FetchError')
        return { ok: false, status: 503, statusText: `FetchError: Service Unavailable: ${error.message} ` } as Response
      else
        return { ok: false, status: 503, statusText: `Service Unavailable: ${error.message} ` } as Response
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        context,
        data: undefined,
        metadata: undefined,
        error: {
          code: response.status,
          message: response.status === 401
            ? 'Server requires authorization.'
            : `Response status code not OK: ${response.status} ${response.statusText} `,
        },
      }
    }

    const json = await response.json() as any

    if ('result' in json) {
      return {
        context,
        data: json.result.data,
        metadata: withMetadata ? json.result.metadata : undefined,
        error: undefined,
      }
    }

    if ('error' in json) {
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
