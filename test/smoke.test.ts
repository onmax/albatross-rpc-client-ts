// test/smoke.test.ts
import { describe, expect, it } from 'vitest'
import { getBlockNumber } from '../src/http'
import { TEST_CONFIG } from './setup/config'

describe('Smoke Test - Local Node Connectivity', () => {
  it('should connect to local node and get block number', async () => {
    // Call getBlockNumber with local RPC URL
    const [isOk, error, blockNumber] = await getBlockNumber({
      url: TEST_CONFIG.RPC_URL,
    })

    // Validate RPC call succeeded
    expect(isOk).toBe(true)
    expect(error).toBeUndefined()

    // Validate we got a valid block number
    expect(blockNumber).toBeDefined()
    expect(typeof blockNumber).toBe('number')
    expect(blockNumber).toBeGreaterThanOrEqual(0)

    // eslint-disable-next-line no-console
    console.log(`✅ Connected to local node, current block: ${blockNumber}`)
  })
})
