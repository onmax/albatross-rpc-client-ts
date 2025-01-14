/**
 * Some ideas:
 *
 * - next() can return the function to unsubscribe
 * - rename close() to unsubscribe()
 */

import type { RequestArguments } from '@open-rpc/client-js/build/ClientInterface'
import type { Auth, BlockchainState } from '../types/'
import { Client, RequestManager, WebSocketTransport } from '@open-rpc/client-js'

export interface ErrorStreamReturn {
  code: number
  message: string
}

export interface Subscription<Data> {
  next: (callback: (data: MaybeStreamResponse<Data>) => void) => void
  close: () => void
  ws: Client

  context: {
    requestArguments: RequestArguments
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
  once?: boolean
  filter?: FilterStreamFn
  timeout?: number
  onError?: (error?: Error) => void
  autoReconnect?: boolean | {
    retries?: number | (() => boolean)
    delay?: number
    onFailed?: () => void
  }
}

function handleUrl(url: URL, auth?: Auth) {
  url.protocol = url.protocol === 'https:' ? 'wss' : 'ws'
  url.pathname = '/ws'
  if (auth) {
    url.username = auth.username
    url.password = auth.password
  }
  return url
}

export class WebSocketManager {
  private connections = new Map<URL, WebSocketClient>()
  url: URL

  constructor(url: URL, auth?: Auth) {
    this.url = handleUrl(url, auth)
  }

  getConnection(): WebSocketClient {
    if (!this.connections.has(this.url)) {
      const connection = new WebSocketClient(this.url)
      this.connections.set(this.url, connection)
    }
    return this.connections.get(this.url)!
  }

  closeAll() {
    this.connections.forEach(connection => connection.close())
    this.connections.clear()
  }
}

class WebSocketClient {
  private url: URL
  private isOpen = false
  private explicitlyClosed = false
  private retriesCount = 0
  private reconnectTimer?: ReturnType<typeof setTimeout>

  constructor(url: URL) {
    this.url = url
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
    userOptions: StreamOptions = WS_DEFAULT_OPTIONS,
  ): Promise<Subscription<Data>> {
    const { method, params, withMetadata = false } = request
    const transport = new WebSocketTransport(this.url.href)
    const client = new Client(new RequestManager([transport]))
    await client.requestManager.connectPromise
    const options = { ...WS_DEFAULT_OPTIONS, ...userOptions }

    const { once, filter, timeout, autoReconnect } = options
    const reconnectSettings = autoReconnect === true ? {} : autoReconnect

    const requestArguments: RequestArguments = { method, params }
    const subscriptionId: number = await client.request(requestArguments, timeout)
    this.explicitlyClosed = false
    this.retriesCount = 0

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
            ? (payload.metadata as BlockchainState)
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
        requestArguments,
        // For security reasons, remove query params
        url: this.url.href.split('?')[0],
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

  close() {
    this.explicitlyClosed = true
    this.clearReconnectTimer()
  }
}
