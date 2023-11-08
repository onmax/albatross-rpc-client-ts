import { Blob, Buffer } from 'node:buffer'
import WebSocket from 'ws'
import type { Auth, BlockchainState } from '../types/common'

export interface ErrorStreamReturn {
  code: number
  message: string
}

export interface Subscription<Data> {
  next: (callback: (data: MaybeStreamResponse<Data>) => void) => void
  close: () => void

  context: {
    headers: WebSocket.ClientOptions['headers']
    body: {
      method: string
      params: any[]
      id: number
      jsonrpc: string
    }
    timestamp: number
    url: string
  }

  // The subscriptionId is only available after the subscription is opened
  // By default it is set to -1
  getSubscriptionId: () => number
}

export const WS_DEFAULT_OPTIONS: StreamOptions<any> = {
  once: false,
  filter: () => true,
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

export type FilterStreamFn<Data = any> = (data: Data) => boolean

export interface StreamOptions<Data> {
  once: boolean
  filter?: FilterStreamFn<Data>
  // timeout: number, TODO
}

export class WebSocketClient {
  private url: URL
  private id: number = 0
  private headers = { Authorization: '' }
  private textDecoder: TextDecoder

  constructor(url: URL, auth?: Auth) {
    const wsUrl = new URL(url.href.replace(/^http/, 'ws'))
    wsUrl.pathname = '/ws'
    this.url = wsUrl
    this.textDecoder = new TextDecoder()

    if (auth && 'secret' in auth && auth.secret) {
      this.url = new URL(`${url.href}?secret=${auth.secret}`)
    }
    else if (auth && 'username' in auth && auth.username && 'password' in auth && auth.password) {
      const authorization = Buffer.from(`${auth.username}:${auth.password}`).toString('base64')
      Object.assign(this.headers, { Authorization: `Basic ${authorization}` })
    }
  }

  async subscribe<
        Data,
        Request extends { method: string; params?: any[]; withMetadata?: boolean },
    >(
    request: Request,
    userOptions: StreamOptions<Data>,
  ): Promise<Subscription<Data>> {
    const ws = new WebSocket(this.url.href, { headers: this.headers })
    let subscriptionId: number

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

    const { once, filter } = options
    const withMetadata = 'withMetadata' in request ? request.withMetadata : false

    const args: Subscription<Data> = {
      next: (callback: (data: MaybeStreamResponse<Data>) => void) => {
        ws.onerror = (error: WebSocket.ErrorEvent) => {
          callback({ data: undefined, metadata: undefined, error: { code: 1000, message: error.message } })
        }
        ws.onmessage = async (event: WebSocket.MessageEvent) => {
          let payloadStr: string
          if (event.data instanceof Blob) {
            payloadStr = this.textDecoder.decode(await event.data.arrayBuffer())
          }
          else if (event.data instanceof ArrayBuffer || event.data instanceof Buffer) {
            payloadStr = this.textDecoder.decode(event.data)
          }
          else {
            return {
              code: 1001,
              message: 'Unexpected data type',
            }
          }

          let payload
          try {
            payload = JSON.parse(payloadStr) as any
          }
          catch (e) {
            return {
              code: 1002,
              message: `Unexpected payload: ${payloadStr}`,
            }
          }

          if ('error' in payload) {
            callback({ data: undefined, metadata: undefined, error: payload as { code: number; message: string } })
            return
          }

          if ('result' in payload) {
            subscriptionId = payload.result as number
            return
          }

          const data: Data = (withMetadata ? (payload.params.result as Data) : payload.params.result.data)
          if (filter && !filter(data))
            return

          const metadata = withMetadata ? (payload.params.result.metadata as BlockchainState) : undefined

          callback({ data, metadata, error: undefined } as MaybeStreamResponse<Data>)

          if (once)
            ws.close()
        }
      },
      close: () => {
        ws.close()
      },
      getSubscriptionId: () => subscriptionId,
      context: {
        headers: this.headers,
        body: requestBody,
        url: this.url.toString(),
        timestamp: Date.now(),
      },
    }

    let hasOpened = false
    return new Promise((resolve) => {
      ws.onerror = (error: WebSocket.ErrorEvent) => {
        if (hasOpened)
          return

        resolve({
          ...args,
          next: (callback: (data: MaybeStreamResponse<Data>) => void) => {
            callback({ data: undefined, metadata: undefined, error: { code: 1000, message: error.message } })
          },
        })
      }
      ws.onopen = () => {
        ws.send(JSON.stringify(requestBody))
        resolve(args)
        hasOpened = true
      }
    })
  }
}
