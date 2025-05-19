import type { Auth } from './types'

let _baseUrl: URL | undefined
let _auth: Auth | undefined

/**
 * Utility function to detect if code is running in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined'
}

/**
 * Initialize the client-wide URL and auth.
 * Must be called before any RPC or WS call (unless you pass url/auth in options).
 */
export function initRpcClient(config: { url: string | URL, auth?: Auth }): void {
  _baseUrl = typeof config.url === 'string' ? new URL(config.url) : config.url
  _auth = config.auth
}

/** Internal getters; prefixed names discourage direct use */
export function __getBaseUrl(): URL {
  if (_baseUrl)
    return _baseUrl

  throw new Error('RPC client not initialized: call initRpcClient() before making any requests')
}

export function __getAuth(): Auth | undefined {
  if (_auth)
    return _auth

  // auth is optional, so no error
  return undefined
}
