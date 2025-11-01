# Phase 2: Test Utilities Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build reusable test utilities for wallet generation, blockchain data discovery, and validation helpers.

**Architecture:** Modular utilities in `test/setup/` for wallet management (genesis funding), fixture discovery (query blockchain for test data), and validation helpers (reusable assertions). All utilities follow TDD with their own test files.

**Tech Stack:** TypeScript, Vitest, Valibot (schema validation), Nimiq RPC client

**Success Criteria:**

- ✅ Wallet utilities can fund test accounts from genesis
- ✅ Fixture discovery can query dynamic blockchain data
- ✅ Validation helpers reduce test boilerplate
- ✅ All utilities have passing tests
- ✅ README documents utility usage

---

## Task 1: Create Wallet Utilities

**Files:**

- Create: `test/setup/wallet.ts`
- Create: `test/setup/wallet.test.ts`

**Step 1: Write failing test for wallet utilities**

Create `test/setup/wallet.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'
import { TEST_CONFIG } from './config'
import { fundWalletFromGenesis, generateTestWallet } from './wallet'

describe('Wallet Utilities', () => {
  it('should generate a random test wallet', () => {
    const wallet1 = generateTestWallet()
    const wallet2 = generateTestWallet()

    expect(wallet1.address).toBeDefined()
    expect(wallet1.privateKey).toBeDefined()
    expect(wallet1.publicKey).toBeDefined()

    // Different wallets should have different addresses
    expect(wallet1.address).not.toBe(wallet2.address)
  })

  it('should fund wallet from genesis account', async () => {
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
```

**Step 2: Run test to verify it fails**

```bash
pnpm test test/setup/wallet.test.ts
```

Expected: FAIL - "Cannot find module './wallet'"

**Step 3: Create wallet utility with minimal implementation**

Create `test/setup/wallet.ts`:

```typescript
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
 * Note: For local devnet testing, we use simple deterministic addresses
 * based on random hex strings. In production, this would use proper
 * Nimiq key derivation.
 */
export function generateTestWallet(): TestWallet {
  // Generate random 32-byte hex string for private key
  const privateKey = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16),).join('')

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
      from: GENESIS_ACCOUNT.address,
      to: toAddress,
      value: amount,
      fee: 0, // Devnet allows zero fees
    },
    { url },
  )

  if (!isOk || error) {
    throw new Error(`Failed to fund wallet: ${error?.message || 'Unknown error'}`)
  }

  return txHash!
}
```

**Step 4: Run test to verify it passes**

```bash
pnpm test test/setup/wallet.test.ts
```

Expected: PASS (if local node is running) or SKIP (if not running)

Note: These tests require a running local node. For CI, they'll run as part of the integration test workflow.

**Step 5: Commit wallet utilities**

```bash
git add test/setup/wallet.ts test/setup/wallet.test.ts
git commit -m "feat: add wallet generation and funding utilities"
```

---

## Task 2: Create Fixture Discovery Utilities

**Files:**

- Create: `test/setup/fixtures.ts`
- Create: `test/setup/fixtures.test.ts`

**Step 1: Write failing test for fixture discovery**

Create `test/setup/fixtures.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'
import { TEST_CONFIG } from './config'
import {
  discoverAccountFixtures,
  discoverBlockFixtures,
  discoverValidatorFixtures,
} from './fixtures'

describe('Fixture Discovery', () => {
  it('should discover block fixtures', async () => {
    const fixtures = await discoverBlockFixtures({ url: TEST_CONFIG.RPC_URL })

    expect(fixtures.latestBlock).toBeDefined()
    expect(fixtures.latestBlock.number).toBeGreaterThan(0)
    expect(fixtures.latestBlock.hash).toMatch(/^[0-9a-f]{64}$/i)

    expect(fixtures.previousBlock).toBeDefined()
    expect(fixtures.previousBlock.number).toBe(fixtures.latestBlock.number - 1)
  }, 10000)

  it('should discover validator fixtures', async () => {
    const fixtures = await discoverValidatorFixtures({ url: TEST_CONFIG.RPC_URL })

    expect(fixtures.activeValidators).toBeDefined()
    expect(fixtures.activeValidators.length).toBeGreaterThan(0)

    expect(fixtures.firstValidator).toBeDefined()
    expect(fixtures.firstValidator.address).toBeDefined()
  }, 10000)

  it('should discover account fixtures', async () => {
    const fixtures = await discoverAccountFixtures({ url: TEST_CONFIG.RPC_URL })

    expect(fixtures.accounts).toBeDefined()
    expect(fixtures.accounts.length).toBeGreaterThan(0)

    expect(fixtures.firstAccount).toBeDefined()
    expect(fixtures.firstAccount.address).toBeDefined()
  }, 10000)
})
```

**Step 2: Run test to verify it fails**

```bash
pnpm test test/setup/fixtures.test.ts
```

Expected: FAIL - "Cannot find module './fixtures'"

**Step 3: Create fixture discovery utilities**

Create `test/setup/fixtures.ts`:

```typescript
import type { Account, Block, PartialBlock, Validator } from '../../src/types'
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
    throw new Error(`Failed to get latest block: ${error1?.message || 'Unknown error'}`)
  }

  // Get previous block
  const [isOk2, error2, previousBlock] = await getBlockByNumber(
    { blockNumber: latestBlock.number - 1, includeBody: false },
    { url },
  )
  if (!isOk2 || error2 || !previousBlock) {
    throw new Error(`Failed to get previous block: ${error2?.message || 'Unknown error'}`)
  }

  // Get block number
  const [isOk3, error3, blockNumber] = await getBlockNumber({ url })
  if (!isOk3 || error3 || blockNumber === undefined) {
    throw new Error(`Failed to get block number: ${error3?.message || 'Unknown error'}`)
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
    throw new Error(`Failed to get active validators: ${error?.message || 'Unknown error'}`)
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
    throw new Error(`Failed to get accounts: ${error?.message || 'Unknown error'}`)
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
```

**Step 4: Run test to verify it passes**

```bash
pnpm test test/setup/fixtures.test.ts
```

Expected: PASS (if local node is running)

**Step 5: Commit fixture discovery utilities**

```bash
git add test/setup/fixtures.ts test/setup/fixtures.test.ts
git commit -m "feat: add fixture discovery utilities"
```

---

## Task 3: Create Validation Helper Utilities

**Files:**

- Create: `test/setup/validation.ts`
- Create: `test/setup/validation.test.ts`

**Step 1: Write failing test for validation helpers**

Create `test/setup/validation.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'
import { BlockSchema } from '../../src/schemas'
import {
  expectRpcSuccess,
  expectSchemaValid,
  expectValidAddress,
  expectValidBlockNumber,
  expectValidHash,
} from './validation'

describe('Validation Helpers', () => {
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
    const validBlock = {
      number: 1,
      hash: 'a'.repeat(64),
      timestamp: Date.now(),
      size: 100,
      parentHash: 'b'.repeat(64),
    }

    // This will throw if schema validation fails
    expect(() => expectSchemaValid(BlockSchema, validBlock)).not.toThrow()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
pnpm test test/setup/validation.test.ts
```

Expected: FAIL - "Cannot find module './validation'"

**Step 3: Create validation helper utilities**

Create `test/setup/validation.ts`:

```typescript
import type { BaseIssue, BaseSchema } from 'valibot'
import { safeParse } from 'valibot'

/**
 * Assert RPC call succeeded
 */
export function expectRpcSuccess<T>(result: [boolean, Error | undefined, T | undefined]): asserts result is [true, undefined, T] {
  const [isOk, error, data] = result

  if (!isOk || error) {
    throw new Error(`RPC call failed: ${error?.message || 'Unknown error'}`)
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
```

**Step 4: Run test to verify it passes**

```bash
pnpm test test/setup/validation.test.ts
```

Expected: PASS

**Step 5: Commit validation helpers**

```bash
git add test/setup/validation.ts test/setup/validation.test.ts
git commit -m "feat: add validation helper utilities"
```

---

## Task 4: Update Test README with Utility Documentation

**Files:**

- Modify: `test/README.md`

**Step 1: Add utilities documentation section**

Add to `test/README.md` (after the "Test Configuration" section):

````markdown
## Test Utilities

### Wallet Utilities (`test/setup/wallet.ts`)

Generate and fund test wallets:

```typescript
import { generateTestWallet, fundWalletFromGenesis } from './setup/wallet'

// Generate random wallet
const wallet = generateTestWallet()

// Fund from genesis account
const txHash = await fundWalletFromGenesis({
  toAddress: wallet.address,
  amount: 1000000, // 1000 NIM in Luna
  url: TEST_CONFIG.RPC_URL,
})
```
````

### Fixture Discovery (`test/setup/fixtures.ts`)

Query blockchain for test data:

```typescript
import { discoverBlockFixtures, discoverValidatorFixtures } from './setup/fixtures'

// Get latest block and previous block
const { latestBlock, previousBlock } = await discoverBlockFixtures({ url: TEST_CONFIG.RPC_URL })

// Get active validators
const { activeValidators, firstValidator } = await discoverValidatorFixtures({ url: TEST_CONFIG.RPC_URL })
```

### Validation Helpers (`test/setup/validation.ts`)

Reusable assertion helpers:

```typescript
import { expectRpcSuccess, expectSchemaValid, expectValidHash } from './setup/validation'

// Assert RPC success
const [isOk, error, data] = await getBlockNumber({ url })
expectRpcSuccess([isOk, error, data])

// Assert valid hash
expectValidHash(block.hash)

// Assert schema validation
expectSchemaValid(BlockSchema, blockData)
```

````

**Step 2: Commit README update**

```bash
git add test/README.md
git commit -m "docs: document test utilities"
```

---

## Task 5: Create Integration Test Using All Utilities

**Files:**

- Create: `test/integration-example.test.ts`

**Step 1: Write integration test demonstrating utility usage**

Create `test/integration-example.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'
import { getAccountByAddress, getBlockByHash } from '../src/http'
import { TEST_CONFIG } from './setup/config'
import { discoverBlockFixtures } from './setup/fixtures'
import { expectRpcSuccess, expectValidHash } from './setup/validation'
import { fundWalletFromGenesis, generateTestWallet } from './setup/wallet'

describe('Integration Example - Using All Utilities', () => {
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
```

**Step 2: Run integration test**

```bash
pnpm test test/integration-example.test.ts
```

Expected: PASS (if local node is running)

**Step 3: Commit integration example**

```bash
git add test/integration-example.test.ts
git commit -m "test: add integration example using utilities"
```

---

## Task 6: Update GitHub Actions Workflow to Run Utility Tests

**Files:**

- Modify: `.github/workflows/test-integration.yml`

**Step 1: Update test command to run all tests**

Change the "Run smoke test" step to run all tests:

```yaml
- name: Run integration tests
  run: pnpm test:integration
  env:
    TEST_RPC_URL: http://127.0.0.1:8648
    TEST_WS_URL: ws://127.0.0.1:8648/ws
```

**Step 2: Commit workflow update**

```bash
git add .github/workflows/test-integration.yml
git commit -m "ci: run all integration tests including utilities"
```

---

## Task 7: Push and Verify All Tests Pass in CI

**Step 1: Push all changes**

```bash
git push origin test/comprehensive-testing
```

**Step 2: Monitor GitHub Action**

Wait for workflow completion and verify all tests pass.

**Step 3: Document successful completion**

```bash
git commit --allow-empty -m "docs: Phase 2 test utilities complete

All utilities tested and verified:
- Wallet generation and funding
- Fixture discovery (blocks, validators, accounts)
- Validation helpers
- Integration example

CI run: [paste URL]"
git push
```

---

## Completion Checklist

Before marking Phase 2 complete, verify:

- [ ] `test/setup/wallet.ts` exists with generation and funding utilities
- [ ] `test/setup/fixtures.ts` exists with discovery utilities
- [ ] `test/setup/validation.ts` exists with assertion helpers
- [ ] All utility tests pass locally
- [ ] Integration example test passes
- [ ] README documents all utilities
- [ ] GitHub Action runs all tests successfully
- [ ] All code committed and pushed

**If all checks pass:** Phase 2 utilities are complete. Ready to proceed to Phase 3 (test suite implementation).

**If any checks fail:** Debug and fix before proceeding.

---

## Next Steps

After Phase 2 is complete:

**Phase 3:** Test Suite Implementation

- Implement all HTTP test modules (blockchain, transactions, staking, validators, etc.)
- Implement WS test modules (subscriptions, reconnection)
- Full coverage of ~90+ functions
- Use utilities from Phase 2 to reduce boilerplate
````
