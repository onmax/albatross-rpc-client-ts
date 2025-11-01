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
    expect(fixtures.latestBlock.number).toBeGreaterThan(0)
    expect(fixtures.latestBlock.hash).toMatch(/^[0-9a-f]{64}$/i)

    expect(fixtures.previousBlock).toBeDefined()
    expect(fixtures.previousBlock.number).toBe(fixtures.latestBlock.number - 1)
  }, 10000)

  it('should discover validator fixtures', async () => {
    const fixtures = await discoverValidatorFixtures({ url: TEST_CONFIG.RPC_URL })

    expect(fixtures.activeValidators).toBeDefined()
    expect(fixtures.activeValidators.length).toBeGreaterThan(0)

    expect(fixtures.firstValidator).toBeDefined()
    expect(fixtures.firstValidator.address).toBeDefined()
  }, 10000)

  it('should discover account fixtures', async () => {
    const fixtures = await discoverAccountFixtures({ url: TEST_CONFIG.RPC_URL })

    expect(fixtures.accounts).toBeDefined()
    expect(fixtures.accounts.length).toBeGreaterThan(0)

    expect(fixtures.firstAccount).toBeDefined()
    expect(fixtures.firstAccount.address).toBeDefined()
  }, 10000)
})
