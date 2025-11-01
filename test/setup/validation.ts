import type { BaseIssue, BaseSchema } from 'valibot'
import { safeParse } from 'valibot'

/**
 * Assert RPC call succeeded
 */
export function expectRpcSuccess<T>(result: [boolean, string | undefined, T | undefined, ...any[]]): asserts result is [true, undefined, T, ...any[]] {
  const [isOk, error, data] = result

  if (!isOk || error) {
    throw new Error(`RPC call failed: ${error || 'Unknown error'}`)
  }

  if (data === undefined) {
    throw new Error('RPC call succeeded but returned undefined data')
  }
}

/**
 * Assert valid hash format (64 hex characters)
 */
export function expectValidHash(hash: string): void {
  if (!/^[0-9a-f]{64}$/i.test(hash)) {
    throw new Error(`Invalid hash format: ${hash}`)
  }
}

/**
 * Assert valid Nimiq address format
 */
export function expectValidAddress(address: string): void {
  // Nimiq addresses start with NQ and are 44 characters (with spaces)
  // Basic validation - adjust based on actual format requirements
  if (!address.startsWith('NQ')) {
    throw new Error(`Invalid address format: ${address}`)
  }
}

/**
 * Assert valid block number (>= 0)
 */
export function expectValidBlockNumber(blockNumber: number): void {
  if (blockNumber < 0 || !Number.isInteger(blockNumber)) {
    throw new Error(`Invalid block number: ${blockNumber}`)
  }
}

/**
 * Assert data matches Valibot schema
 */
export function expectSchemaValid<T>(
  schema: BaseSchema<T, T, BaseIssue<unknown>>,
  data: unknown,
): asserts data is T {
  const result = safeParse(schema, data)

  if (!result.success) {
    const issues = result.issues.map(issue => `${issue.path?.map(p => p.key).join('.')}: ${issue.message}`).join(', ')
    throw new Error(`Schema validation failed: ${issues}`)
  }
}

/**
 * Assert value is within timestamp range (not too far in past/future)
 */
export function expectValidTimestamp(timestamp: number, maxAge: number = 86400000): void {
  const now = Date.now()
  const age = Math.abs(now - timestamp)

  if (age > maxAge) {
    throw new Error(`Timestamp ${timestamp} is ${age}ms away from now (max ${maxAge}ms)`)
  }
}

/**
 * Assert two blocks are sequential
 */
export function expectSequentialBlocks(block1: { number: number }, block2: { number: number }): void {
  if (block2.number !== block1.number + 1) {
    throw new Error(`Blocks not sequential: ${block1.number} -> ${block2.number}`)
  }
}
