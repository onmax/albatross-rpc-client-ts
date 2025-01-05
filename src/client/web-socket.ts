import type { Auth, BlockchainState } from '../types/'
import { Client, RequestManager, WebSocketTransport } from '@open-rpc/client-js'

let shownWarning = false

function getWs(url: URL, auth?: Auth) {
  if (auth && !shownWarning) {
    console.warn('Warning: Auth in WebSocket is not supported in the browser by default unless you create a custom proxy server that converts `username` and `password` to `Authorization` headers.')
    shownWarning = true
  }

  const transport = new WebSocketTransport(url.toString())
  const client = new Client(new RequestManager([transport]))
  return { client, transport }
}

export interface ErrorStreamReturn {
  code: number
  message: string
}

export interface Subscription<Data> {
  next: (callback: (data: MaybeStreamResponse<Data>) => void) => void
  close: () => void
  ws: Client

  context: {
    body: {
      method: string
      params: any[]
      id: number
      jsonrpc: string
    }
    timestamp: number
    url: string
  }

  getSubscriptionId: () => number
  isConnectionPaused: () => boolean
  isConnectionOpen: () => boolean
}

export const WS_DEFAULT_OPTIONS: StreamOptions = {
  once: false,
  filter: () => true,
  timeout: 5000, // Default OpenRPC timeout
} as const

export type MaybeStreamResponse<Data> =
  | {
    error: ErrorStreamReturn
    data: undefined
    metadata: undefined
  }
  | {
    error: undefined
    data: Data
    metadata?: BlockchainState
  }

export type FilterStreamFn = (data: any) => boolean

export interface StreamOptions {
  once: boolean
  filter?: FilterStreamFn
  timeout: number
  onError?: (error?: Error) => void
  /**
   * If true or an object, we attempt reconnects when the socket closes.
   * - `retries` can be a number or a function. If it's a function, it should return true to keep retrying.
   * - `delay` is the time before trying again.
   * - `onFailed` is called when we stop retrying.
   */
  autoReconnect?: boolean | {
    retries?: number | (() => boolean)
    delay?: number
    onFailed?: () => void
  }
}

export class WebSocketClient {
  private url: URL
  private id = 0
  private isOpen = false
  private explicitlyClosed = false
  private auth?: Auth

  // For reconnect logic
  private retriesCount = 0
  private reconnectTimer?: ReturnType<typeof setTimeout>

  constructor(url: URL | string, auth?: Auth) {
    if (typeof url === 'string') {
      url = new URL(url)
    }
    const wsUrl = new URL(url.href.replace(/^http/, 'ws'))
    wsUrl.pathname = '/ws'
    this.url = wsUrl

    if (auth?.username && auth?.password) {
      this.auth = auth
    }
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
  }

  async subscribe<
    Data,
    Request extends { method: string, params?: any[], withMetadata?: boolean },
  >(
    request: Request,
    userOptions: StreamOptions,
  ): Promise<Subscription<Data>> {
    const { client, transport } = getWs(this.url, this.auth)

    const requestBody = {
      method: request.method,
      params: request.params || [],
      jsonrpc: '2.0',
      id: this.id++,
    }

    const options = {
      ...WS_DEFAULT_OPTIONS,
      ...userOptions,
    }

    // "autoReconnect" can be a boolean or an object
    const reconnectSettings
      = typeof options.autoReconnect === 'object'
        ? options.autoReconnect
        : options.autoReconnect === true
          ? {}
          : undefined

    const { once, filter, timeout } = options
    const withMetadata = 'withMetadata' in request ? request.withMetadata : false

    // Request subscription ID
    const subscriptionId: number = await client.request(requestBody, timeout)
    this.explicitlyClosed = false
    this.retriesCount = 0 // reset retries on successful open

    const args: Subscription<Data> = {
      next: (callback: (data: MaybeStreamResponse<Data>) => void) => {
        client.onError((error) => {
          callback({
            data: undefined,
            metadata: undefined,
            error,
          })
        })

        client.onNotification(async (event) => {
          if (!('result' in event.params)) {
            callback({
              data: undefined,
              metadata: undefined,
              error: {
                code: 1000,
                message: 'No result in event',
              },
            })
            return
          }
          const payload = event.params.result as any

          const data: Data = withMetadata
            ? (payload as Data)
            : payload.data

          if (filter && !filter(data)) {
            return
          }

          const metadata = withMetadata
            ? payload.metadata as BlockchainState
            : undefined

          callback({ data, metadata, error: undefined } as MaybeStreamResponse<Data>)

          if (once) {
            client.close()
          }
        })
      },
      close: () => {
        this.explicitlyClosed = true
        client.close()
      },
      getSubscriptionId: () => subscriptionId,
      isConnectionPaused: () => transport.connection.isPaused,
      isConnectionOpen: () => this.isOpen,
      context: {
        body: requestBody,
        url: this.url.href.replace(/(password=)\w+/, '$1...'),
        timestamp: Date.now(),
      },
      ws: client,
    }

    transport.connection.onopen = () => {
      this.isOpen = true
      this.retriesCount = 0
    }

    transport.connection.onclose = () => {
      this.isOpen = false
      if (!this.explicitlyClosed) {
        // Check if autoReconnect is enabled
        if (reconnectSettings) {
          const maxRetries = reconnectSettings.retries ?? -1
          const delay = reconnectSettings.delay ?? 1000
          const canKeepRetrying = () => {
            if (typeof maxRetries === 'number') {
              return maxRetries < 0 || this.retriesCount < maxRetries
            }
            else if (typeof maxRetries === 'function') {
              return maxRetries()
            }
            return false
          }

          if (canKeepRetrying()) {
            this.retriesCount++
            // clear any existing timer before setting a new one
            this.clearReconnectTimer()
            this.reconnectTimer = setTimeout(() => {
              // Try again by calling subscribe with the same args
              this.subscribe(request, userOptions).catch(() => {
                // If it still fails, we might try again
                // or pass the error to the onError callback
                const { onError } = options
                onError?.(new Error('Failed to reconnect'))
              })
            }, delay)
          }
          else {
            reconnectSettings.onFailed?.()
          }
        }
        else {
          // if autoReconnect is not enabled, call user-provided onError
          const { onError } = options
          onError?.(new Error('WebSocket connection closed unexpectedly'))
        }
      }
    }

    transport.connection.onerror = (event) => {
      console.error('WebSocket error', event)
      this.isOpen = false
      const { onError } = options
      onError?.(new Error(event.message))
    }

    return args
  }
}
