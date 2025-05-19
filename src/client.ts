import type { Auth } from './types'

let _baseUrl: URL | undefined
let _auth: Auth | undefined

const urlEnvName = 'ALBATROSS_RPC_NODE_URL'
const usernameEnvName = 'ALBATROSS_RPC_NODE_USERNAME'
const passwordEnvName = 'ALBATROSS_RPC_NODE_PASSWORD'

/**
 * Determines if the code is running in a browser environment.
 */
export function inBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined'
}

/**
 * Get environment variables safely across different environments
 */
async function getEnvVar(name: string): Promise<string | undefined> {
  if (inBrowser()) {
    return undefined
  }

  try {
    // Dynamic import for Node.js environment
    const { env } = await import('node:process')
    return env[name]
  }
  catch {
    // Silently handle import failures
    return undefined
  }
}

/**
 * Initialize the client-wide URL and auth.
 * Must be called before any RPC or WS call (unless you pass url/auth in options).
 * This is optional if environment variables are set (Node.js environment only).
 */
export function initRpcClient(config: { url: string | URL, auth?: Auth }): void {
  _baseUrl = typeof config.url === 'string' ? new URL(config.url) : config.url
  _auth = config.auth
}

/** Internal getters; prefixed names discourage direct use */
export async function __getBaseUrl(): Promise<URL> {
  if (_baseUrl)
    return _baseUrl

  const envUrl = await getEnvVar(urlEnvName)
  if (envUrl)
    return new URL(envUrl)

  throw new Error(
    inBrowser()
      ? `RPC client not initialized: call initRpcClient() with the API URL in browser environments`
      : `RPC client not initialized: either call initRpcClient() or set ${urlEnvName} environment variable`,
  )
}

export async function __getAuth(): Promise<Auth | undefined> {
  if (_auth)
    return _auth

  const username = await getEnvVar(usernameEnvName)
  const password = await getEnvVar(passwordEnvName)

  if (username && password)
    return { username, password }

  // auth is optional, so no error
  return undefined
}
