import { Buffer } from 'node:buffer'
import type { Auth, BlockchainState } from 'src/types/common'

async function getWs(url: string) {
  let ws
  if (typeof WebSocket !== 'undefined') {
    ws = new WebSocket(url)
  }
  else if (typeof globalThis !== 'undefined' && globalThis.WebSocket) {
    ws = new globalThis.WebSocket(url)
  }
  else if (typeof window !== 'undefined' && window.WebSocket) {
    ws = new window.WebSocket(url)
  }
  else {
    const { WebSocket: Ws } = await import('ws')
    ws = new Ws(url)
  }
  return ws
}

export interface ErrorStreamReturn {
  code: number
  message: string
}

export interface Subscription<Data> {
  next: (callback: (data: MaybeStreamResponse<Data>) => void) => void
  close: () => void

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

  // The subscriptionId is only available after the subscription is opened
  // By default it is set to -1
  getSubscriptionId: () => number
}

export const WS_DEFAULT_OPTIONS: StreamOptions = {
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

export type FilterStreamFn = (data: any) => boolean

export interface StreamOptions {
  once: boolean
  filter?: FilterStreamFn
  // timeout: number, TODO
}

export class WebSocketClient {
  private url: URL
  private id: number = 0
  private textDecoder: TextDecoder

  constructor(url: URL | string, auth?: Auth) {
    if (typeof url === 'string') {
      url = new URL(url)
    }
    const wsUrl = new URL(url.href.replace(/^http/, 'ws'))
    wsUrl.pathname = '/ws'
    this.url = wsUrl
    this.textDecoder = new TextDecoder()

    if (auth && 'secret' in auth && auth.secret) {
      this.url = new URL(`${url.href}?secret=${auth.secret}`)
    }
  }

  async subscribe<
    Data,
    Request extends { method: string, params?: any[], withMetadata?: boolean },
  >(
    request: Request,
    userOptions: StreamOptions,
  ): Promise<Subscription<Data>> {
    const ws = await getWs(this.url.href)
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
        ws.onerror = (error: any) => {
          callback({ data: undefined, metadata: undefined, error: { code: 1000, message: JSON.stringify(error) } })
        }
        ws.onmessage = async (event: MessageEvent) => {
          let payloadStr = ''
          if (event.data instanceof Blob) {
            payloadStr = this.textDecoder.decode(await event.data.arrayBuffer())
          }
          else if (event.data instanceof ArrayBuffer || event.data instanceof Buffer) {
            payloadStr = this.textDecoder.decode(event.data)
          }

          if (!payloadStr) {
            callback({ data: undefined, metadata: undefined, error: { code: 1001, message: 'Unexpected data type' } })
          }

          let payload
          try {
            payload = JSON.parse(payloadStr) as any
          }
          catch (e) {
            callback({ data: undefined, metadata: undefined, error: { code: 1002, message: `Unexpected payload: ${payloadStr}. Error: ${JSON.stringify(e)}` } })
            return
          }

          if ('error' in payload) {
            callback({ data: undefined, metadata: undefined, error: payload as { code: number, message: string } })
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
        body: requestBody,
        url: this.url.toString(),
        timestamp: Date.now(),
      },
    }

    let hasOpened = false
    return new Promise((resolve) => {
      ws.onerror = (error: any) => {
        if (hasOpened)
          return

        resolve({
          ...args,
          next: (callback: (data: MaybeStreamResponse<Data>) => void) => {
            callback({ data: undefined, metadata: undefined, error: { code: 1000, message: JSON.stringify(error) } })
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
