import { describe, expect, it } from 'vitest'
import { BasicAccountSchema } from '../../src/schemas'
import {
  expectRpcSuccess,
  expectSchemaValid,
  expectValidAddress,
  expectValidBlockNumber,
  expectValidHash,
} from './validation'

describe('validation Helpers', () => {
  it('expectRpcSuccess should validate RPC success', () => {
    const successResult: [boolean, undefined, number] = [true, undefined, 42]
    expect(() => expectRpcSuccess(successResult)).not.toThrow()

    const errorResult: [boolean, Error, undefined] = [false, new Error('fail'), undefined]
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
})
