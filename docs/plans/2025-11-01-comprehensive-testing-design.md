# Comprehensive Testing Design for Albatross RPC Client

**Date:** 2025-11-01
**Status:** Approved

## Overview

Comprehensive integration test suite for all HTTP and WebSocket RPC methods (~90+ HTTP functions, all WS subscriptions) running against local Nimiq node.

## Goals

- **Full coverage**: Test all exported functions
- **Integration tests**: Real RPC against local node (not mocked)
- **Full semantic validation**: Three-layer validation (success, schema, correctness)
- **Include write operations**: Test transaction creation/sending with funded wallet
- **Dynamic test data**: Discover data from blockchain, not hardcoded fixtures
- **CI-ready**: Automated node setup in GitHub Actions

## Architecture

### Test Organization: Independent Modular

Fine-grained test modules by API category. Each fully independent with own setup/teardown.

```
test/
├── setup/
│   ├── config.ts          # RPC endpoint config & node health check
│   ├── wallet.ts          # Wallet generation for local node
│   └── fixtures.ts        # Dynamic test data discovery
├── http/
│   ├── blockchain.test.ts # Block queries, accounts, validators (~25 functions)
│   ├── transactions.test.ts # Basic tx operations (~10 functions)
│   ├── staking.test.ts    # Stake/validator operations (~14 functions)
│   ├── validators.test.ts # Validator lifecycle (~12 functions)
│   ├── vesting.test.ts    # Vesting contract operations (~4 functions)
│   ├── htlc.test.ts       # HTLC contract operations (~10 functions)
│   ├── mempool.test.ts    # Mempool operations (~5 functions)
│   ├── peers.test.ts      # Network peer operations (~4 functions)
│   ├── policy.test.ts     # Policy/epoch calculations (~20 functions)
│   ├── zkp.test.ts        # ZKP state (~1 function)
│   └── wallet.test.ts     # Wallet management (~15 functions)
└── ws/
    ├── subscriptions.test.ts # All WS subscription methods
    └── reconnection.test.ts  # Auto-reconnect behavior

smoke.test.ts              # Minimal validation (getBlockNumber)
```

**Benefits:**

- Independent modules enable parallel execution
- Failures isolated to specific API areas
- Easy to locate and run specific test categories

### Local Node Strategy

**Why local instead of testnet:**

- WS events (validator elections, epoch changes) happen once per day on testnet
- Fast block times (1s micro, 5s macro) enable rapid event generation
- Deterministic, reproducible test environment
- Instant transaction confirmation
- No network delays or rate limits

**RPC Configuration:**

```typescript
const RPC_URL = process.env.TEST_RPC_URL || 'http://127.0.0.1:8648'
const WS_URL = process.env.TEST_WS_URL || 'ws://127.0.0.1:8648/ws'
```

**Execution modes:**

- **Local dev**: Developer manually runs node, executes tests
- **CI (GitHub Actions)**: Automated clone, build, start node, test, teardown

### Wallet Management

**Fresh wallet per test run:**

1. Generate random private key
2. Fund from genesis account (local node has pre-funded accounts)
3. Run tests
4. Wallet discarded after completion

**Benefits:**

- No faucet wait time (local node)
- Clean state per run
- Can test edge cases (insufficient funds, etc.)

### Dynamic Test Data Discovery

Tests query blockchain for test data instead of hardcoded values:

**Example flows:**

```typescript
// Blockchain tests
const [_, __, blockNum] = await getBlockNumber()
const [_, __, block] = await getBlockByNumber({ blockNumber: blockNum })
const [_, __, sameBlock] = await getBlockByHash({ hash: block.hash })
// Validates: consistency between query methods

// Validator tests
const [_, __, validators] = await getActiveValidators()
const validatorAddr = validators[0].address
const [_, __, validator] = await getValidatorByAddress({ address: validatorAddr })
// Validates: detailed query matches list entry

// Transaction tests
const txHash = await sendTransaction({ /* params */ })
const [_, __, tx] = await getTransactionByHash({ hash: txHash })
expect(tx.hash).toBe(txHash)
// Validates: transaction retrievable after sending
```

## Validation Strategy

### Three-Layer Validation

**1. RPC Success**

```typescript
const [isOk, error, data] = await getBlockNumber()
expect(isOk).toBe(true)
expect(error).toBeUndefined()
expect(data).toBeDefined()
```

**2. Schema Validation**

```typescript
import { BlockSchema } from '../src/schemas'

const result = safeParse(BlockSchema, data)
expect(result.success).toBe(true)
```

**3. Semantic Correctness**

```typescript
// Value consistency
expect(block.number).toBeGreaterThan(0)
expect(block.hash).toMatch(/^[0-9a-f]{64}$/i)
expect(block.timestamp).toBeLessThanOrEqual(Date.now())

// Cross-method consistency
const [_, __, block1] = await getLatestBlock()
const [_, __, block2] = await getBlockByNumber({ blockNumber: block1.number })
expect(block1.hash).toBe(block2.hash)

// Sequential correctness
const [_, __, prevBlock] = await getBlockByNumber({ blockNumber: block1.number - 1 })
expect(prevBlock.number).toBe(block1.number - 1)
```

**Error case testing:**

- Invalid addresses
- Non-existent hashes
- Out-of-range block numbers
- Malformed parameters

## Implementation Phases

### Phase 1: Infrastructure (CRITICAL - Must work first)

**GitHub Action:**

1. Clone `~/nimiq/albatross-rpc-rust`
2. Build Rust node (cache Cargo dependencies)
3. Start local network with test configuration
4. Health check (poll RPC until ready)
5. Run tests
6. Teardown

**Smoke test:**

- Single file: `test/smoke.test.ts`
- Single test: `getBlockNumber()` succeeds
- Validates: Node running, RPC responding, client working

**Success criteria:**

- ✅ Action completes in <5 minutes
- ✅ Node starts reliably
- ✅ Test passes consistently

**Why critical:** Flaky infrastructure = worthless test suite. Must be rock-solid before building on it.

### Phase 2: Test Utilities

After Phase 1 stable:

- Wallet generation helpers (`setup/wallet.ts`)
- Dynamic fixture discovery (`setup/fixtures.ts`)
- Shared validation utilities
- Custom matchers/assertions

### Phase 3: Test Suite Implementation

After Phase 2:

- Implement all HTTP test modules (10 files)
- Implement WS test modules (2 files)
- Full coverage of ~90+ functions

### Phase 4: Optimization

After Phase 3 complete:

- Parallel test execution
- Cargo build caching improvements
- Test data fixtures for repeated runs
- Performance benchmarking

## Coverage Matrix

| Module                   | Functions | Test Focus                                                                |
| ------------------------ | --------- | ------------------------------------------------------------------------- |
| blockchain.test.ts       | ~25       | Block/tx queries, accounts, validators, penalties, sync                   |
| transactions.test.ts     | ~10       | Create/send basic transactions, raw tx operations                         |
| staking.test.ts          | ~14       | Full staking lifecycle (new, add, update, retire, remove)                 |
| validators.test.ts       | ~12       | Validator lifecycle (new, update, deactivate, reactivate, retire, delete) |
| vesting.test.ts          | ~4        | Vesting contract creation and redemption                                  |
| htlc.test.ts             | ~10       | HTLC operations (new, redeem regular/timeout/early, sign)                 |
| mempool.test.ts          | ~5        | Mempool content, push, fee queries                                        |
| peers.test.ts            | ~4        | Peer info, network ID                                                     |
| policy.test.ts           | ~20       | Epoch/batch/block calculations, policy constants                          |
| zkp.test.ts              | ~1        | ZKP state                                                                 |
| wallet.test.ts           | ~15       | Account management, signing, unlocking, voting keys                       |
| ws/subscriptions.test.ts | ~8        | All subscription methods with event validation                            |
| ws/reconnection.test.ts  | ~3        | Auto-reconnect scenarios                                                  |

**Total: ~90+ functions covered**

## Open Questions

None - design approved for implementation.

## Next Steps

1. Create git branch for test implementation
2. Implement Phase 1: GH Action + smoke test
3. Validate infrastructure is stable (run 10+ times)
4. Proceed to Phase 2 only after Phase 1 is reliable
