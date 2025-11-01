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
  const [isOk2, error2, prevBlock] = await getBlockByNumber(
    { blockNumber: latestBlock.number - 1, includeBody: false },
    { url },
  )

  // If previous block doesn't exist, latest is genesis - use it as previous
  if (!isOk2 || error2 || !prevBlock) {
    previousBlock = latestBlock
  }
  else {
    previousBlock = prevBlock
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
  validator: Validator
  validatorCount: number
}

/**
 * Discover validator fixtures from the blockchain
 * Returns undefined if no validators are found (e.g., genesis state)
 */
export async function discoverValidatorFixtures({ url }: { url: string }): Promise<ValidatorFixtures | undefined> {
  const [isOk, error, validators] = await getActiveValidators({ url })
  if (!isOk || error || !validators) {
    return undefined
  }

  if (validators.length === 0) {
    return undefined
  }

  return {
    activeValidators: validators,
    validator: validators[0],
    validatorCount: validators.length,
  }
}

/**
 * Account fixtures for testing
 */
export interface AccountFixtures {
  accounts: Account[]
  account: Account
  accountCount: number
}

/**
 * Discover account fixtures from the blockchain
 * Returns undefined if no accounts are found (e.g., genesis state)
 */
export async function discoverAccountFixtures({ url }: { url: string }): Promise<AccountFixtures | undefined> {
  const [isOk, error, accounts] = await getAccounts({ url })
  if (!isOk || error || !accounts) {
    return undefined
  }

  if (accounts.length === 0) {
    return undefined
  }

  return {
    accounts,
    account: accounts[0],
    accountCount: accounts.length,
  }
}
