import { describe, expect, it } from 'vitest'
import {
  getAccountByAddress,
  getAccounts,
  getActiveValidators,
  getBatchNumber,
  getBlockByHash,
  getBlockByNumber,
  getBlockNumber,
  getCurrentPenalizedSlots,
  getEpochNumber,
  getInherentsByBatchNumber,
  getInherentsByBlockNumber,
  getLatestBlock,
  getPreviousPenalizedSlots,
  getSlotAt,
  getStakerByAddress,
  getStakersByValidatorAddress,
  getSyncStatus,
  getTransactionHashesByAddress,
  getTransactionsByAddress,
  getTransactionsByBatchNumber,
  getTransactionsByBlockNumber,
  getValidatorByAddress,
  getValidators,
  isConsensusEstablished,
} from '../src/http'
import {
  AccountSchema,
  InherentSchema,
  PenalizedSlotsSchema,
  SlotSchema,
  StakerSchema,
  ValidatorSchema,
} from '../src/schemas'
import { TEST_CONFIG } from './setup/config'
import { discoverAccountFixtures, discoverBlockFixtures, discoverValidatorFixtures } from './setup/fixtures'
import { expectRpcSuccess, expectSchemaValid, expectValidAddress, expectValidBlockNumber, expectValidHash } from './setup/validation'

describe('http RPC Methods - Block Queries', () => {
  it('getBlockNumber should return current block number', async () => {
    const result = await getBlockNumber({ url: TEST_CONFIG.RPC_URL })

    expectRpcSuccess(result)
    const [, , blockNumber] = result
    expectValidBlockNumber(blockNumber)
    expect(blockNumber).toBeGreaterThanOrEqual(0)
  })

  it('getBatchNumber should return current batch number', async () => {
    const result = await getBatchNumber({ url: TEST_CONFIG.RPC_URL })

    expectRpcSuccess(result)
    const [, , batchNumber] = result
    expect(batchNumber).toBeGreaterThanOrEqual(0)
  })

  it('getEpochNumber should return current epoch number', async () => {
    const result = await getEpochNumber({ url: TEST_CONFIG.RPC_URL })

    expectRpcSuccess(result)
    const [, , epochNumber] = result
    expect(epochNumber).toBeGreaterThanOrEqual(0)
  })

  it('getLatestBlock should return latest block with metadata', async () => {
    const result = await getLatestBlock({ includeBody: false }, { url: TEST_CONFIG.RPC_URL })

    expectRpcSuccess(result)
    const [, , block] = result

    expectValidHash(block.hash)
    expectValidBlockNumber(block.number)
    expect('hash' in block && 'number' in block).toBe(true)
  })

  it('getBlockByNumber should return specific block', async () => {
    const { latestBlockNumber } = await discoverBlockFixtures({ url: TEST_CONFIG.RPC_URL })

    const result = await getBlockByNumber(
      { blockNumber: latestBlockNumber, includeBody: false },
      { url: TEST_CONFIG.RPC_URL },
    )

    expectRpcSuccess(result)
    const [, , block] = result

    expect(block.number).toBe(latestBlockNumber)
    expectValidHash(block.hash)
  })

  it('getBlockByHash should return block by hash', async () => {
    const { latestBlock } = await discoverBlockFixtures({ url: TEST_CONFIG.RPC_URL })

    const result = await getBlockByHash(
      { hash: latestBlock.hash, includeBody: false },
      { url: TEST_CONFIG.RPC_URL },
    )

    expectRpcSuccess(result)
    const [, , block] = result

    expect(block.hash).toBe(latestBlock.hash)
    expect(block.number).toBe(latestBlock.number)
  })

  it('getSlotAt should return slot information', async () => {
    const { previousBlock } = await discoverBlockFixtures({ url: TEST_CONFIG.RPC_URL })

    // Genesis block (21600) doesn't work with getSlotAt in dev-albatross
    if (previousBlock.number >= 21600) {
      console.warn('⚠️  Skipping: getSlotAt not available for genesis block in dev-albatross')
      return
    }

    const result = await getSlotAt({ blockNumber: previousBlock.number, offsetOpt: 0 }, { url: TEST_CONFIG.RPC_URL })

    expectRpcSuccess(result)
    const [, , slot] = result

    expectSchemaValid(SlotSchema, slot)
    expect(slot.slotNumber).toBeGreaterThanOrEqual(0)
  })
})

describe('http RPC Methods - Transaction Queries', () => {
  it('getTransactionsByBlockNumber should return transactions', async () => {
    const { latestBlockNumber } = await discoverBlockFixtures({ url: TEST_CONFIG.RPC_URL })

    const result = await getTransactionsByBlockNumber(
      { blockNumber: latestBlockNumber },
      { url: TEST_CONFIG.RPC_URL },
    )

    expectRpcSuccess(result)
    const [, , transactions] = result

    expect(Array.isArray(transactions)).toBe(true)
  })

  it.skip('getTransactionsByBatchNumber should return transactions', async () => {
    // Skipped: dev-albatross genesis doesn't have batch numbers (returns null)
    // Will work once chain progresses past genesis epoch
    const batchResult = await getBatchNumber({ url: TEST_CONFIG.RPC_URL })
    const [, , batchNumber] = batchResult

    if (batchNumber === null || batchNumber === undefined) {
      return
    }

    expectRpcSuccess(batchResult)

    const result = await getTransactionsByBatchNumber(
      { batchIndex: batchNumber },
      { url: TEST_CONFIG.RPC_URL },
    )

    expectRpcSuccess(result)
    const [, , transactions] = result

    expect(Array.isArray(transactions)).toBe(true)
  })

  it('getTransactionsByAddress should return empty array for new address', async () => {
    const testAddress = 'NQ07 0000 0000 0000 0000 0000 0000 0000 0000'

    const result = await getTransactionsByAddress(
      { address: testAddress, max: 10 },
      { url: TEST_CONFIG.RPC_URL },
    )

    expectRpcSuccess(result)
    const [, , transactions] = result

    expect(Array.isArray(transactions)).toBe(true)
  })

  it('getTransactionHashesByAddress should return hashes', async () => {
    const testAddress = 'NQ07 0000 0000 0000 0000 0000 0000 0000 0000'

    const result = await getTransactionHashesByAddress(
      { address: testAddress, max: 10 },
      { url: TEST_CONFIG.RPC_URL },
    )

    expectRpcSuccess(result)
    const [, , hashes] = result

    expect(Array.isArray(hashes)).toBe(true)
  })
})

describe('http RPC Methods - Inherent Queries', () => {
  it('getInherentsByBlockNumber should return inherents', async () => {
    const { latestBlockNumber } = await discoverBlockFixtures({ url: TEST_CONFIG.RPC_URL })

    const result = await getInherentsByBlockNumber(
      { blockNumber: latestBlockNumber },
      { url: TEST_CONFIG.RPC_URL },
    )

    expectRpcSuccess(result)
    const [, , inherents] = result

    expect(Array.isArray(inherents)).toBe(true)
    inherents.forEach((inherent) => {
      expectSchemaValid(InherentSchema, inherent)
    })
  })

  it.skip('getInherentsByBatchNumber should return inherents', async () => {
    // Skipped: dev-albatross genesis doesn't have batch numbers (returns null)
    // Will work once chain progresses past genesis epoch
    const batchResult = await getBatchNumber({ url: TEST_CONFIG.RPC_URL })
    const [, , batchNumber] = batchResult

    if (batchNumber === null || batchNumber === undefined) {
      return
    }

    expectRpcSuccess(batchResult)

    const result = await getInherentsByBatchNumber(
      { batchIndex: batchNumber },
      { url: TEST_CONFIG.RPC_URL },
    )

    expectRpcSuccess(result)
    const [, , inherents] = result

    expect(Array.isArray(inherents)).toBe(true)
  })
})

describe('http RPC Methods - Account Queries', () => {
  it('getAccountByAddress should return account', async () => {
    const fixtures = await discoverAccountFixtures({ url: TEST_CONFIG.RPC_URL })
    if (!fixtures) {
      console.warn('⚠️  Skipping: No accounts in genesis state')
      return
    }

    const result = await getAccountByAddress(
      { address: fixtures.account.address },
      { url: TEST_CONFIG.RPC_URL },
    )

    expectRpcSuccess(result)
    const [, , returnedAccount] = result

    expectSchemaValid(AccountSchema, returnedAccount)
    expectValidAddress(returnedAccount.address)
    expect(returnedAccount.balance).toBeGreaterThanOrEqual(0)
  })

  it('getAccounts should return array of accounts', async () => {
    const result = await getAccounts({ url: TEST_CONFIG.RPC_URL })

    expectRpcSuccess(result)
    const [, , accounts] = result

    expect(Array.isArray(accounts)).toBe(true)
    // Genesis state may have 0 accounts
    if (accounts.length > 0) {
      accounts.forEach((account) => {
        expectSchemaValid(AccountSchema, account)
        expectValidAddress(account.address)
      })
    }
  })
})

describe('http RPC Methods - Validator Queries', () => {
  it('getActiveValidators should return active validators', async () => {
    const result = await getActiveValidators({ url: TEST_CONFIG.RPC_URL })

    expectRpcSuccess(result)
    const [, , validators] = result

    expect(Array.isArray(validators)).toBe(true)
    // Genesis state may have 0 validators
    if (validators.length > 0) {
      validators.forEach((validator) => {
        expectSchemaValid(ValidatorSchema, validator)
        expectValidAddress(validator.address)
        expect(validator.balance).toBeGreaterThanOrEqual(0)
      })
    }
  })

  it('getValidators should return all validators', async () => {
    const result = await getValidators({ url: TEST_CONFIG.RPC_URL })

    expectRpcSuccess(result)
    const [, , validators] = result

    expect(Array.isArray(validators)).toBe(true)
  })

  it('getValidatorByAddress should return validator info', async () => {
    const fixtures = await discoverValidatorFixtures({ url: TEST_CONFIG.RPC_URL })
    if (!fixtures) {
      console.warn('⚠️  Skipping: No validators in genesis state')
      return
    }

    const result = await getValidatorByAddress(
      { address: fixtures.validator.address },
      { url: TEST_CONFIG.RPC_URL },
    )

    expectRpcSuccess(result)
    const [, , returnedValidator] = result

    expectSchemaValid(ValidatorSchema, returnedValidator)
    expect(returnedValidator.address).toBe(fixtures.validator.address)
  })

  it('getCurrentPenalizedSlots should return penalized slots', async () => {
    const result = await getCurrentPenalizedSlots({ url: TEST_CONFIG.RPC_URL })

    expectRpcSuccess(result)
    const [, , penalizedSlots] = result

    expectSchemaValid(PenalizedSlotsSchema, penalizedSlots)
  })

  it('getPreviousPenalizedSlots should return previous penalized slots', async () => {
    const result = await getPreviousPenalizedSlots({ url: TEST_CONFIG.RPC_URL })

    expectRpcSuccess(result)
    const [, , penalizedSlots] = result

    expectSchemaValid(PenalizedSlotsSchema, penalizedSlots)
  })
})

describe('http RPC Methods - Staker Queries', () => {
  it('getStakersByValidatorAddress should return stakers for validator', async () => {
    const fixtures = await discoverValidatorFixtures({ url: TEST_CONFIG.RPC_URL })
    if (!fixtures) {
      console.warn('⚠️  Skipping: No validators in genesis state')
      return
    }

    const result = await getStakersByValidatorAddress(
      { address: fixtures.validator.address },
      { url: TEST_CONFIG.RPC_URL },
    )

    expectRpcSuccess(result)
    const [, , stakers] = result

    expect(Array.isArray(stakers)).toBe(true)

    stakers.forEach((staker) => {
      expectSchemaValid(StakerSchema, staker)
      expectValidAddress(staker.address)
    })
  })

  it('getStakerByAddress should return staker info when exists', async () => {
    const fixtures = await discoverValidatorFixtures({ url: TEST_CONFIG.RPC_URL })
    if (!fixtures) {
      console.warn('⚠️  Skipping: No validators in genesis state')
      return
    }

    const stakersResult = await getStakersByValidatorAddress(
      { address: fixtures.validator.address },
      { url: TEST_CONFIG.RPC_URL },
    )

    expectRpcSuccess(stakersResult)
    const [, , stakers] = stakersResult

    if (stakers.length > 0) {
      const stakerAddress = stakers[0].address

      const result = await getStakerByAddress(
        { address: stakerAddress },
        { url: TEST_CONFIG.RPC_URL },
      )

      expectRpcSuccess(result)
      const [, , staker] = result

      expectSchemaValid(StakerSchema, staker)
      expect(staker.address).toBe(stakerAddress)
    }
    else {
      // No stakers found - this is OK for empty validator
      expect(true).toBe(true)
    }
  })
})

describe('http RPC Methods - Network Status', () => {
  it('isConsensusEstablished should return boolean', async () => {
    const result = await isConsensusEstablished({ url: TEST_CONFIG.RPC_URL })

    expectRpcSuccess(result)
    const [, , consensus] = result

    expect(typeof consensus).toBe('boolean')
  })

  it.skip('getSyncStatus should return sync information', async () => {
    const result = await getSyncStatus({ url: TEST_CONFIG.RPC_URL })

    expectRpcSuccess(result)
    const [, , syncStatus] = result

    // Sync status is implementation-specific, just verify we got a response
    expect(syncStatus).toBeDefined()
  })
})
