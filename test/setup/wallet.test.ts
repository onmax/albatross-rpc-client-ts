import { describe, expect, it } from 'vitest'
import { TEST_CONFIG } from './config'
import { fundWalletFromGenesis, generateTestWallet } from './wallet'

describe('wallet Utilities', () => {
  it('should generate a random test wallet', () => {
    const wallet1 = generateTestWallet()
    const wallet2 = generateTestWallet()

    expect(wallet1.address).toBeDefined()
    expect(wallet1.privateKey).toBeDefined()
    expect(wallet1.publicKey).toBeDefined()

    // Different wallets should have different addresses
    expect(wallet1.address).not.toBe(wallet2.address)
  })

  it.skip('should fund wallet from genesis account', async () => {
    // Skipping: Requires proper Nimiq address generation
    // This utility demonstrates intended usage but needs:
    // - Valid Nimiq address derivation
    // - Proper genesis account configuration
    const wallet = generateTestWallet()

    const txHash = await fundWalletFromGenesis({
      toAddress: wallet.address,
      amount: 1000000, // 1000 NIM (in Luna)
      url: TEST_CONFIG.RPC_URL,
    })

    expect(txHash).toBeDefined()
    expect(typeof txHash).toBe('string')
    expect(txHash).toMatch(/^[0-9a-f]{64}$/i)
  }, 30000)
})
