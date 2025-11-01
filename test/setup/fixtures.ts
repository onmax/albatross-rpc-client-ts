import type { Account, PartialBlock, Validator } from '../../src/types'
import {
  getAccounts,
  getActiveValidators,
  getBlockByNumber,
  getBlockNumber,
  getLatestBlock,
} from '../../src/http'

/**
 * Block fixtures for testing
 */
export interface BlockFixtures {
  latestBlock: PartialBlock
  previousBlock: PartialBlock
  latestBlockNumber: number
}

/**
 * Discover block fixtures from the blockchain
 */
export async function discoverBlockFixtures({ url }: { url: string }): Promise<BlockFixtures> {
  // Get latest block
  const [isOk1, error1, latestBlock] = await getLatestBlock({ includeBody: false }, { url })
  if (!isOk1 || error1 || !latestBlock) {
    throw new Error(`Failed to get latest block: ${JSON.stringify(error1) || 'Unknown error'}`)
  }

  // Get block number
  const [isOk3, error3, blockNumber] = await getBlockNumber({ url })
  if (!isOk3 || error3 || blockNumber === undefined) {
    throw new Error(`Failed to get block number: ${JSON.stringify(error3) || 'Unknown error'}`)
  }

  // Get previous block - handle case where latest is genesis
  let previousBlock: PartialBlock
  if (latestBlock.number > 0) {
    const [isOk2, error2, prevBlock] = await getBlockByNumber(
      { blockNumber: latestBlock.number - 1, includeBody: false },
      { url },
    )
    if (!isOk2 || error2 || !prevBlock) {
      throw new Error(`Failed to get previous block: ${JSON.stringify(error2) || 'Unknown error'}`)
    }
    previousBlock = prevBlock
  }
  else {
    // Latest is genesis, use it as previous too
    previousBlock = latestBlock
  }

  return {
    latestBlock,
    previousBlock,
    latestBlockNumber: blockNumber,
  }
}

/**
 * Validator fixtures for testing
 */
export interface ValidatorFixtures {
  activeValidators: Validator[]
  firstValidator: Validator
  validatorCount: number
}

/**
 * Discover validator fixtures from the blockchain
 */
export async function discoverValidatorFixtures({ url }: { url: string }): Promise<ValidatorFixtures> {
  const [isOk, error, validators] = await getActiveValidators({ url })
  if (!isOk || error || !validators) {
    throw new Error(`Failed to get active validators: ${JSON.stringify(error) || 'Unknown error'}`)
  }

  if (validators.length === 0) {
    throw new Error('No active validators found')
  }

  return {
    activeValidators: validators,
    firstValidator: validators[0],
    validatorCount: validators.length,
  }
}

/**
 * Account fixtures for testing
 */
export interface AccountFixtures {
  accounts: Account[]
  firstAccount: Account
  accountCount: number
}

/**
 * Discover account fixtures from the blockchain
 */
export async function discoverAccountFixtures({ url }: { url: string }): Promise<AccountFixtures> {
  const [isOk, error, accounts] = await getAccounts({ url })
  if (!isOk || error || !accounts) {
    throw new Error(`Failed to get accounts: ${JSON.stringify(error) || 'Unknown error'}`)
  }

  if (accounts.length === 0) {
    throw new Error('No accounts found')
  }

  return {
    accounts,
    firstAccount: accounts[0],
    accountCount: accounts.length,
  }
}
