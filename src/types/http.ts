import type { Auth } from './common'

export interface HttpOptions {
  timeout?: number | false
  url?: string | URL
  auth?: Auth
  abortController?: AbortController
}

export interface SendTxOptions extends HttpOptions {
  waitForConfirmationTimeout?: number
}

export interface HttpRequest {
  method: 'POST'
  headers: HeadersInit
  body: {
    method: string
    params: any[]
    id: number
    jsonrpc: string
  }
  timestamp: number
  url: string
  abortController: AbortController

}

export interface HttpRpcResult<D, M = undefined> {
  request: HttpRequest
  data?: D
  metadata?: M
  error?: { code: number, message: string }
}
