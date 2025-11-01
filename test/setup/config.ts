// test/setup/config.ts
import process from 'node:process'

/**
 * Test configuration and utilities
 */

export const TEST_CONFIG = {
  RPC_URL: process.env.TEST_RPC_URL || 'http://127.0.0.1:8648',
  WS_URL: process.env.TEST_WS_URL || 'ws://127.0.0.1:8648/ws',
  HEALTH_CHECK_TIMEOUT: 60000, // 60 seconds max wait for node to be ready
  HEALTH_CHECK_INTERVAL: 1000, // Check every 1 second
}

/**
 * Wait for RPC node to be ready by polling until successful response
 */
export async function waitForNodeReady(timeoutMs = TEST_CONFIG.HEALTH_CHECK_TIMEOUT): Promise<void> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(TEST_CONFIG.RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'getBlockNumber',
          params: [],
          id: 1,
        }),
      })

      if (response.ok) {
        const json = await response.json()
        if ('result' in json) {
          // eslint-disable-next-line no-console
          console.log('✅ Node is ready')
          return
        }
      }
    }
    catch {
      // Node not ready yet, continue polling
    }

    await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.HEALTH_CHECK_INTERVAL))
  }

  throw new Error(`Node did not become ready within ${timeoutMs}ms`)
}
