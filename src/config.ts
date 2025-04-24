import type { Auth } from './types'
import { env } from 'node:process'

let _baseUrl: URL | undefined
let _auth: Auth | undefined

const urlEnvName = 'ALBATROSS_RPC_NODE_URL'
const usernameEnvName = 'ALBATROSS_RPC_NODE_USERNAME'
const passwordEnvName = 'ALBATROSS_RPC_NODE_PASSWORD'

/**
 * Initialize the client-wide URL and auth.
 * Must be called before any RPC or WS call (unless you pass url/auth in options).
 * This is optional if environment variables are set.
 */
export function initRpcClient(config: { url: string | URL, auth?: Auth }): void {
  _baseUrl = typeof config.url === 'string' ? new URL(config.url) : config.url
  _auth = config.auth
}

/** Internal getters; prefixed names discourage direct use */
export function __getBaseUrl(): URL {
  if (_baseUrl)
    return _baseUrl
  if (env[urlEnvName])
    return new URL(env[urlEnvName] as string)
  throw new Error(`RPC client not initialized: either call initRpcClient() or set ${urlEnvName} environment variable`)
}

export function __getAuth(): Auth | undefined {
  if (_auth)
    return _auth

  if (env[usernameEnvName] && env[passwordEnvName])
    return { username: env[usernameEnvName], password: env[passwordEnvName] }

  // auth is optional, so no error
  return undefined
}
