import type { LogType } from '../src/types'
import { describe, expect, it } from 'vitest'
import {
  subscribeForHeadBlock,
  subscribeForHeadBlockHash,
  subscribeForLogsByAddressesAndTypes,
  subscribeForValidatorElectionByAddress,
} from '../src/ws'

describe('webSocket Subscriptions', () => {
  it('should subscribe for block hashes and receive one hash', async () => {
    // Now works with validator enabled - node produces blocks automatically

    // Create a subscription that will resolve after receiving one hash
    const subscription = await subscribeForHeadBlockHash({
      once: true, // Only receive one event
    })
    // Set up a promise to resolve when we receive data
    const dataReceived = new Promise<string[]>((resolve) => {
      subscription.addEventListener('data', (event) => {
        const { data } = event.detail
        resolve(data)
      })
    })
    // Wait for the data to be received with a timeout
    const blockHashes = await dataReceived
    // Verify we received a valid block hash
    expect(blockHashes).toBeDefined()
    expect(blockHashes).toBeInstanceOf(Array)
    expect(blockHashes.length).toBeGreaterThan(0)
    // Verify that each hash is a valid hex string of the correct length
    for (const hash of blockHashes) {
      expect(hash).toBeTypeOf('string')
      expect(hash).toMatch(/^[0-9a-f]{64}$/i)
    }
  }, 10000) // Increase timeout to 10 seconds for network requests

  // Testing the connection for subscribeForHeadBlock without expecting data
  it('should establish connection for head block subscription', async () => {
    // Just test that the subscription is successfully created
    const subscription = await subscribeForHeadBlock(false, {
      timeout: 5000, // Short timeout for the test
    })

    // Verify subscription was created
    expect(subscription.context.method).toBe('subscribeForHeadBlock')
    expect(subscription.isOpen()).toBe(true)
    expect(subscription.getId()).toBeGreaterThan(0)

    // Explicitly close it since we're not waiting for data
    subscription.dispatchEvent(new Event('close'))
  }, 6000)

  it('should subscribe for logs by addresses and types', async () => {
    // This test might not receive data in a short time as logs depend on blockchain activity
    // We'll just test that the subscription is successfully created
    const addresses: string[] = [] // Empty array means all addresses
    const logTypes: LogType[] = [] // Empty array means all log types
    const subscription = await subscribeForLogsByAddressesAndTypes(addresses, logTypes, {
      once: true, // Only receive one event if it happens
      timeout: 5000, // Short timeout for the test
    })
    // Verify the subscription was created successfully with correct method
    expect(subscription.context.method).toBe('subscribeForLogsByAddressesAndTypes')
    expect(subscription.isOpen()).toBe(true)
    expect(subscription.getId()).toBeGreaterThan(0)
  }, 6000)

  // This test depends on having a validator address, so we'll make it conditional
  it('should attempt to subscribe for validator election by address', async () => {
    // Using a sample address - this test may not receive data but should connect successfully
    const validatorAddress = '0000000000000000000000000000000000000000' // Example address
    const subscription = await subscribeForValidatorElectionByAddress(validatorAddress, {
      once: true,
      timeout: 5000, // Short timeout for the test
    })
    // Verify the subscription was created with correct parameters
    expect(subscription.context.method).toBe('subscribeForValidatorElectionByAddress')
    expect(subscription.context.params[0]).toBe(validatorAddress)
    expect(subscription.isOpen()).toBe(true)
    expect(subscription.getId()).toBeGreaterThan(0)
  }, 6000)
})
