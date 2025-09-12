import type { Auth } from './common'

export interface ValidationOptions {
  validateBody?: boolean
  validationLevel?: 'error' | 'warning'
}

export interface HttpOptions {
  timeout?: number | false
  url?: string | URL
  auth?: Auth
  abortController?: AbortController
  /**
   * The request object that was used to make the request. It will override any other
   * parameters that are passed to the function from the library.
   *
   * Useful if you want to pass custom headers or other options to the request.
   */
  request?: HttpRequest
  /**
   * Validation options for response body validation
   */
  validation?: ValidationOptions
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
