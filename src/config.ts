import type { Auth } from './types'

let _baseUrl: URL
let _auth: Auth | undefined

/**
 * Initialize the client-wide URL and auth.
 * Must be called before any RPC or WS call (unless you pass url/auth in options).
 */
export function init(config: { url: string | URL, auth?: Auth }): void {
  _baseUrl = typeof config.url === 'string' ? new URL(config.url) : config.url
  _auth = config.auth
}

/** Internal getters; prefixed names discourage direct use */
export function __getBaseUrl(): URL {
  if (!_baseUrl)
    throw new Error('Client not initialized: call init() first')
  return _baseUrl
}

export function __getAuth(): Auth | undefined {
  return _auth
}
