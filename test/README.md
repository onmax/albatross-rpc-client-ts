# Testing Guide

## Running Tests

### Smoke Test (Local Development)

The smoke test validates basic connectivity to a local Nimiq node.

**Prerequisites:**

1. Clone and build core-rs-albatross:

   ```bash
   cd ~
   git clone https://github.com/nimiq/core-rs-albatross.git
   cd core-rs-albatross
   cargo build --release
   ```

2. Start the node:

   ```bash
   cargo run --release -- \
     --network dev-albatross \
     --rpc-enabled \
     --rpc-address 127.0.0.1:8648
   ```

3. In a new terminal, run the smoke test:
   ```bash
   cd albatross-rpc-client-ts  # or wherever you cloned this repo
   pnpm test:smoke
   ```

### CI Tests

Tests run automatically in GitHub Actions when you push to `main` or branches prefixed with `test/`.

The workflow:

1. Clones core-rs-albatross
2. Builds the node (with Cargo caching)
3. Starts it in background
4. Runs smoke test
5. Tears down

## Test Configuration

Tests use environment variables for RPC endpoints:

- `TEST_RPC_URL` - HTTP RPC endpoint (default: `http://127.0.0.1:8648`)
- `TEST_WS_URL` - WebSocket endpoint (default: `ws://127.0.0.1:8648/ws`)

## Test Utilities

### Wallet Utilities (`test/setup/wallet.ts`)

Generate and fund test wallets:

```typescript
import { fundWalletFromGenesis, generateTestWallet } from './setup/wallet'

// Generate random wallet
const wallet = generateTestWallet()

// Fund from genesis account
const txHash = await fundWalletFromGenesis({
  toAddress: wallet.address,
  amount: 1000000, // 1000 NIM in Luna
  url: TEST_CONFIG.RPC_URL,
})
```

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

## Troubleshooting

### Node won't start

- Check if port 8648 is already in use: `lsof -i :8648`
- Check node logs for errors

### Tests timeout

- Ensure node is fully synced before running tests
- Increase timeout in test config if needed

### Build failures

- Clear Cargo cache: `cargo clean`
- Update Rust: `rustup update stable`
