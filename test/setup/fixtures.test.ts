import { describe, expect, it } from 'vitest'
import { TEST_CONFIG } from './config'
import {
  discoverAccountFixtures,
  discoverBlockFixtures,
  discoverValidatorFixtures,
} from './fixtures'

describe('fixture Discovery', () => {
  it('should discover block fixtures', async () => {
    const fixtures = await discoverBlockFixtures({ url: TEST_CONFIG.RPC_URL })

    expect(fixtures.latestBlock).toBeDefined()
    expect(fixtures.latestBlock.number).toBeGreaterThanOrEqual(0)
    expect(fixtures.latestBlock.hash).toMatch(/^[0-9a-f]{64}$/i)

    expect(fixtures.previousBlock).toBeDefined()
    // Previous block is either (latest - 1) or same as latest if at genesis
    expect(fixtures.previousBlock.number).toBeLessThanOrEqual(fixtures.latestBlock.number)
  }, 10000)

  it('should discover validator fixtures', async () => {
    const fixtures = await discoverValidatorFixtures({ url: TEST_CONFIG.RPC_URL })

    if (!fixtures) {
      console.warn('⚠️  Skipping: No validators in genesis state')
      return
    }

    expect(fixtures.activeValidators).toBeDefined()
    expect(fixtures.activeValidators.length).toBeGreaterThan(0)

    expect(fixtures.validator).toBeDefined()
    expect(fixtures.validator.address).toBeDefined()
  }, 10000)

  it('should discover account fixtures', async () => {
    const fixtures = await discoverAccountFixtures({ url: TEST_CONFIG.RPC_URL })

    if (!fixtures) {
      console.warn('⚠️  Skipping: No accounts in genesis state')
      return
    }

    expect(fixtures.accounts).toBeDefined()
    expect(fixtures.accounts.length).toBeGreaterThan(0)

    expect(fixtures.account).toBeDefined()
    expect(fixtures.account.address).toBeDefined()
  }, 30000)
})
