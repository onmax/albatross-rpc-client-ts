import { describe, expect, it } from 'vitest'
import { getAccountByAddress, getBlockByHash } from '../src/http'
import { TEST_CONFIG } from './setup/config'
import { discoverBlockFixtures } from './setup/fixtures'
import { expectRpcSuccess, expectValidHash } from './setup/validation'
import { fundWalletFromGenesis, generateTestWallet } from './setup/wallet'

describe('integration Example - Using All Utilities', () => {
  it('should demonstrate fixture discovery and validation', async () => {
    // Discover block fixtures
    const { latestBlock, previousBlock } = await discoverBlockFixtures({
      url: TEST_CONFIG.RPC_URL,
    })

    // Validate block data
    expectValidHash(latestBlock.hash)
    expectValidHash(previousBlock.hash)

    // Query block by discovered hash
    const [isOk, error, block] = await getBlockByHash(
      { hash: latestBlock.hash, includeBody: false },
      { url: TEST_CONFIG.RPC_URL },
    )

    expectRpcSuccess([isOk, error, block])
    expect(block.number).toBe(latestBlock.number)
  }, 10000)

  it.skip('should demonstrate wallet generation and funding', async () => {
    // Skipping: Requires proper Nimiq address generation and wallet setup
    // This test demonstrates the intended usage but needs:
    // - Valid Nimiq address derivation (not simple hex strings)
    // - Proper signing keys for genesis account
    // - Transaction signing implementation

    // Generate test wallet
    const wallet = generateTestWallet()

    // Fund wallet from genesis
    const txHash = await fundWalletFromGenesis({
      toAddress: wallet.address,
      amount: 1000000,
      url: TEST_CONFIG.RPC_URL,
    })

    expectValidHash(txHash)

    // Wait for transaction to be processed (poll for balance)
    let account: any
    for (let i = 0; i < 10; i++) {
      const [isOk, _error, acc] = await getAccountByAddress(
        { address: wallet.address },
        { url: TEST_CONFIG.RPC_URL },
      )

      if (isOk && acc && acc.balance > 0) {
        account = acc
        break
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    if (!account) {
      throw new Error('Transaction not confirmed after 10 attempts')
    }

    expect(account.balance).toBeGreaterThanOrEqual(1000000)
  }, 30000)
})
