import type { Auth } from './common'

export interface ValidationOptions {
  validateBody?: boolean
  validationLevel?: 'error' | 'warning'
}

export interface HttpRpcResultMeta { request: HttpRequest, metadata?: any }

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

// Object shape for named destructuring
export interface HttpRpcResultSuccessObj<T> { success: true, error: undefined, data: T, metadata: HttpRpcResultMeta }
export interface HttpRpcResultErrorObj { success: false, error: string, data: undefined, metadata: HttpRpcResultMeta }

// Array shape for positional destructuring
export type HttpRpcResultSuccessArr<T> = readonly [true, undefined, T, HttpRpcResultMeta]
export type HttpRpcResultErrorArr = readonly [false, string, undefined, HttpRpcResultMeta]

// Combined isomorphic types (supports both destructuring patterns)
export type HttpRpcResultSuccess<T> = HttpRpcResultSuccessObj<T> & HttpRpcResultSuccessArr<T>
export type HttpRpcResultError = HttpRpcResultErrorObj & HttpRpcResultErrorArr
export type HttpRpcResult<T> = HttpRpcResultSuccess<T> | HttpRpcResultError
