import type { HttpRpcResult } from '../../src/types'
import { describe, expect, it } from 'vitest'
import { BasicAccountSchema } from '../../src/schemas'
import { createIsomorphicDestructurable } from '../../src/utils'
import {
  expectRpcSuccess,
  expectSchemaValid,
  expectSequentialBlocks,
  expectValidAddress,
  expectValidBlockNumber,
  expectValidHash,
  expectValidTimestamp,
} from './validation'

describe('validation Helpers', () => {
  it('expectRpcSuccess should validate RPC success', () => {
    const meta = { request: {} as any }
    const successResult = createIsomorphicDestructurable({ success: true as const, error: undefined, data: 42, metadata: meta }, [true, undefined, 42, meta] as const) as HttpRpcResult<number>
    expect(() => expectRpcSuccess(successResult)).not.toThrow()

    const errorResult = createIsomorphicDestructurable({ success: false as const, error: 'fail', data: undefined, metadata: meta }, [false, 'fail', undefined, meta] as const) as HttpRpcResult<number>
    expect(() => expectRpcSuccess(errorResult)).toThrow('RPC call failed')
  })

  it('expectValidHash should validate hash format', () => {
    const validHash = 'a'.repeat(64)
    expect(() => expectValidHash(validHash)).not.toThrow()

    const invalidHash = 'xyz123'
    expect(() => expectValidHash(invalidHash)).toThrow('Invalid hash format')
  })

  it('expectValidAddress should validate Nimiq address', () => {
    const validAddress = 'NQ07 0000 0000 0000 0000 0000 0000 0000 0000'
    expect(() => expectValidAddress(validAddress)).not.toThrow()

    const invalidAddress = 'invalid'
    expect(() => expectValidAddress(invalidAddress)).toThrow('Invalid address format')
  })

  it('expectValidBlockNumber should validate block number', () => {
    expect(() => expectValidBlockNumber(100)).not.toThrow()
    expect(() => expectValidBlockNumber(0)).not.toThrow()

    expect(() => expectValidBlockNumber(-1)).toThrow('Invalid block number')
  })

  it('expectSchemaValid should validate against Valibot schema', () => {
    const validAccount = {
      type: 'basic',
      address: 'NQ07 0000 0000 0000 0000 0000 0000 0000 0000',
      balance: 1000000,
    }

    // This will throw if schema validation fails
    expect(() => expectSchemaValid(BasicAccountSchema, validAccount)).not.toThrow()
  })

  it('expectValidTimestamp should validate timestamp range', () => {
    const recentTimestamp = Date.now() - 1000 // 1 second ago
    expect(() => expectValidTimestamp(recentTimestamp)).not.toThrow()

    const oldTimestamp = Date.now() - 90000000 // >24 hours ago
    expect(() => expectValidTimestamp(oldTimestamp)).toThrow('away from now')
  })

  it('expectSequentialBlocks should validate block sequence', () => {
    const block1 = { number: 100 }
    const block2 = { number: 101 }
    expect(() => expectSequentialBlocks(block1, block2)).not.toThrow()

    const nonSequential = { number: 103 }
    expect(() => expectSequentialBlocks(block1, nonSequential)).toThrow('not sequential')
  })
})
