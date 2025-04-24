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

export type HttpRpcResultSuccess<T> = [true, undefined, T, { request: HttpRequest, metadata?: any }]
export type HttpRpcResultError = [false, string, undefined, { request: HttpRequest, metadata?: any }]
export type HttpRpcResult<T> = HttpRpcResultSuccess<T> | HttpRpcResultError
