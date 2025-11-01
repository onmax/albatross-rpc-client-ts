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

  it('should demonstrate wallet generation and funding', async () => {
    // Generate test wallet
    const wallet = generateTestWallet()

    // Fund wallet from genesis
    const txHash = await fundWalletFromGenesis({
      toAddress: wallet.address,
      amount: 1000000,
      url: TEST_CONFIG.RPC_URL,
    })

    expectValidHash(txHash)

    // Wait for transaction to be processed
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Verify wallet was funded
    const [isOk, error, account] = await getAccountByAddress(
      { address: wallet.address },
      { url: TEST_CONFIG.RPC_URL },
    )

    expectRpcSuccess([isOk, error, account])
    expect(account.balance).toBeGreaterThan(0)
  }, 30000)
})
