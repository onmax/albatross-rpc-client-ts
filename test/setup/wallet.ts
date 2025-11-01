import process from 'node:process'
import { createTransaction } from '../../src/http'

/**
 * Test wallet structure
 */
export interface TestWallet {
  address: string
  privateKey: string
  publicKey: string
}

/**
 * Generate a random test wallet
 *
 * Note: For local devnet testing, we use random addresses
 * based on random hex strings. In production, this would use proper
 * Nimiq key derivation.
 */
export function generateTestWallet(): TestWallet {
  // Generate random 32-byte hex string for private key
  const privateKey = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)).join('')

  // For devnet, derive a simple address from private key
  // In production, this would use Nimiq's address derivation
  const publicKey = privateKey.slice(0, 64)
  const address = `NQ${publicKey.slice(0, 38).toUpperCase()}`

  return { address, privateKey, publicKey }
}

/**
 * Genesis account for dev-albatross network
 * This account is pre-funded in the genesis block
 */
const GENESIS_ACCOUNT = {
  address: process.env.GENESIS_ADDRESS || 'NQ07 0000 0000 0000 0000 0000 0000 0000 0000',
  privateKey: process.env.GENESIS_PRIVATE_KEY || '0000000000000000000000000000000000000000000000000000000000000000',
}

/**
 * Fund a wallet from the genesis account
 */
export async function fundWalletFromGenesis({
  toAddress,
  amount,
  url,
}: {
  toAddress: string
  amount: number
  url: string
}): Promise<string> {
  const [isOk, error, txHash] = await createTransaction(
    {
      wallet: GENESIS_ACCOUNT.address,
      recipient: toAddress,
      value: amount,
      fee: 0, // Devnet allows zero fees
      relativeValidityStartHeight: 0,
    },
    { url },
  )

  if (!isOk || error) {
    throw new Error(`Failed to fund wallet: ${JSON.stringify(error) || 'Unknown error'}`)
  }

  return txHash!
}
