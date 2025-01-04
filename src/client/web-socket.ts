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
  /**
   * The `next` callback is called whenever the WebSocket receives
   * a message.
   */
  next: (callback: (data: MaybeStreamResponse<Data>) => void) => void
  /**
   * Closes the websocket connection gracefully.
   */
  close: () => void
  /**
   * The WebSocket client.
   * @see https://github.com/open-rpc/client-js/blob/master/src/Client.ts
   */
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

  /**
   * Returns the subscription ID.
   * This is only available after the subscription is opened.
   */
  getSubscriptionId: () => number
  /**
   * Indicates whether the websocket is paused.
   */
  isConnectionPaused: () => boolean
  /**
   * Indicates whether the websocket connection is open and ready to communicate.
   */
  isConnectionOpen: () => boolean
}

export const WS_DEFAULT_OPTIONS: StreamOptions = {
  once: false,
  filter: () => true,
  timeout: 5000, // Default OpenRPC timeout
} as const

export type MaybeStreamResponse<Data> = {
  error: ErrorStreamReturn
  data: undefined
  metadata: undefined
} | {
  error: undefined
  data: Data
  metadata?: BlockchainState
}

export type FilterStreamFn = (data: any) => boolean

export interface StreamOptions {
  /**
   * If true, the subscription will close after the first event.
   *
   * @default false
   */
  once: boolean
  /**
   * A function that filters the data received from the WebSocket.
   *
   * @default () => true
   */
  filter?: FilterStreamFn
  /**
   * The timeout in milliseconds for the WebSocket connection.
   *
   * @default 5000
   */
  timeout: number
  /**
   * Callback for when the WebSocket connection encounters
   * an error.
   *
   * @param error The error that occurred.
   */
  onError?: (error?: Error) => void
}

export class WebSocketClient {
  private url: URL
  private id: number = 0
  private isOpen = false
  private explicitlyClosed = false
  private auth?: Auth

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

  // TODO: we probably need multiple subscriptions
  // https://github.com/babayeshifu/sui/blob/bdd29d7f8e70d6632d7881dbe3e5c86cb455e507/sdk/typescript/src/rpc/websocket-client.ts#L55
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

    const { once, filter, timeout } = options
    const withMetadata = 'withMetadata' in request ? request.withMetadata : false

    const subscriptionId: number = await client.request(requestBody, timeout)
    this.explicitlyClosed = false

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
          // if ('subscription' in event.params) {
          //   subscriptionId = event.params.subscription as number
          // }

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

          if (once)
            client.close()
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
    }

    transport.connection.onclose = () => {
      this.isOpen = false
      if (!this.explicitlyClosed) {
        const { onError } = options
        onError?.(new Error('WebSocket connection closed unexpectedly'))
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

  // TODO: the server does not support this method yet
  // async unsubscribe(subscriptionId: number) {
  //   const { client } = getWs(this.url, this.auth)
  //   await client.request({
  //     method: 'unsubscribe',
  //     params: [subscriptionId],
  //   })
  // }
}
