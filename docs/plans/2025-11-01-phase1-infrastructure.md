# Phase 1: Testing Infrastructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up GitHub Action that builds local Nimiq node and runs smoke test to validate RPC connectivity.

**Architecture:** GitHub Action clones albatross-rpc-rust, builds with Cargo caching, starts local network, waits for RPC ready, runs basic smoke test (getBlockNumber), then tears down. This is the foundation for all future integration tests.

**Tech Stack:** GitHub Actions, Rust/Cargo (for node), Vitest, TypeScript

**Success Criteria:**

- ✅ Action completes in <5 minutes
- ✅ Node starts reliably
- ✅ Smoke test passes consistently

---

## Task 1: Create Test Setup Configuration

**Files:**

- Create: `test/setup/config.ts`

**Step 1: Create config utility with RPC endpoint and health check**

```typescript
// test/setup/config.ts

/**
 * Test configuration and utilities
 */

export const TEST_CONFIG = {
  RPC_URL: process.env.TEST_RPC_URL || 'http://127.0.0.1:8648',
  WS_URL: process.env.TEST_WS_URL || 'ws://127.0.0.1:8648/ws',
  HEALTH_CHECK_TIMEOUT: 60000, // 60 seconds max wait for node to be ready
  HEALTH_CHECK_INTERVAL: 1000, // Check every 1 second
}

/**
 * Wait for RPC node to be ready by polling until successful response
 */
export async function waitForNodeReady(timeoutMs = TEST_CONFIG.HEALTH_CHECK_TIMEOUT): Promise<void> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(TEST_CONFIG.RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'getBlockNumber',
          params: [],
          id: 1,
        }),
      })

      if (response.ok) {
        const json = await response.json()
        if ('result' in json) {
          console.log('✅ Node is ready')
          return
        }
      }
    }
    catch (error) {
      // Node not ready yet, continue polling
    }

    await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.HEALTH_CHECK_INTERVAL))
  }

  throw new Error(`Node did not become ready within ${timeoutMs}ms`)
}
```

**Step 2: Commit config utilities**

```bash
git add test/setup/config.ts
git commit -m "test: add config utilities for local node"
```

---

## Task 2: Create Smoke Test

**Files:**

- Create: `test/smoke.test.ts`

**Step 1: Write smoke test that validates basic RPC connectivity**

```typescript
// test/smoke.test.ts
import { describe, expect, it } from 'vitest'
import { getBlockNumber } from '../src/http'
import { TEST_CONFIG } from './setup/config'

describe('Smoke Test - Local Node Connectivity', () => {
  it('should connect to local node and get block number', async () => {
    // Call getBlockNumber with local RPC URL
    const [isOk, error, blockNumber] = await getBlockNumber({
      url: TEST_CONFIG.RPC_URL,
    })

    // Validate RPC call succeeded
    expect(isOk).toBe(true)
    expect(error).toBeUndefined()

    // Validate we got a valid block number
    expect(blockNumber).toBeDefined()
    expect(typeof blockNumber).toBe('number')
    expect(blockNumber).toBeGreaterThanOrEqual(0)

    console.log(`✅ Connected to local node, current block: ${blockNumber}`)
  })
})
```

**Step 2: Commit smoke test**

```bash
git add test/smoke.test.ts
git commit -m "test: add smoke test for node connectivity"
```

---

## Task 3: Create GitHub Action Workflow

**Files:**

- Create: `.github/workflows/test-integration.yml`

**Step 1: Create workflow that clones and builds albatross-rpc-rust**

```yaml
# .github/workflows/test-integration.yml
name: Integration Tests

on:
  push:
    branches: [main, test/**]
  pull_request:
    branches: [main]

jobs:
  test-with-local-node:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout RPC client
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          profile: minimal
          override: true

      - name: Cache Cargo dependencies
        uses: actions/cache@v3
        with:
          path: |
            ~/.cargo/bin/
            ~/.cargo/registry/index/
            ~/.cargo/registry/cache/
            ~/.cargo/git/db/
            albatross-rpc-rust/target/
          key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
          restore-keys: |
            ${{ runner.os }}-cargo-

      - name: Clone albatross-rpc-rust
        run: |
          git clone https://github.com/nimiq/albatross-rpc-rust.git
          cd albatross-rpc-rust
          echo "Current commit: $(git rev-parse HEAD)"

      - name: Build Nimiq node
        run: |
          cd albatross-rpc-rust
          cargo build --release

      - name: Start Nimiq node in background
        run: |
          cd albatross-rpc-rust
          # Start node with test configuration
          # Use devnet for fast block times and instant setup
          nohup cargo run --release -- \
            --network dev-albatross \
            --rpc-enabled \
            --rpc-address 127.0.0.1:8648 \
            > nimiq-node.log 2>&1 &

          echo $! > nimiq-node.pid
          echo "Started Nimiq node with PID: $(cat nimiq-node.pid)"

          # Give node a moment to initialize
          sleep 2

          # Show initial logs
          tail -20 nimiq-node.log || true

      - name: Wait for node to be ready
        run: |
          echo "Waiting for node to be ready..."
          timeout=60
          elapsed=0

          while [ $elapsed -lt $timeout ]; do
            if curl -s -X POST http://127.0.0.1:8648 \
              -H "Content-Type: application/json" \
              -d '{"jsonrpc":"2.0","method":"getBlockNumber","params":[],"id":1}' \
              | grep -q "result"; then
              echo "✅ Node is ready!"
              exit 0
            fi

            echo "Waiting... ($elapsed seconds)"
            sleep 1
            elapsed=$((elapsed + 1))
          done

          echo "❌ Node did not become ready in time"
          echo "=== Node logs ==="
          cat albatross-rpc-rust/nimiq-node.log
          exit 1

      - name: Run smoke test
        run: pnpm test test/smoke.test.ts
        env:
          TEST_RPC_URL: http://127.0.0.1:8648
          TEST_WS_URL: ws://127.0.0.1:8648/ws

      - name: Show node logs on failure
        if: failure()
        run: |
          echo "=== Nimiq Node Logs ==="
          cat albatross-rpc-rust/nimiq-node.log || echo "No logs found"

      - name: Stop Nimiq node
        if: always()
        run: |
          if [ -f albatross-rpc-rust/nimiq-node.pid ]; then
            kill $(cat albatross-rpc-rust/nimiq-node.pid) || true
            echo "Stopped Nimiq node"
          fi
```

**Step 2: Commit GitHub Action workflow**

```bash
git add .github/workflows/test-integration.yml
git commit -m "ci: add integration test workflow with local node"
```

---

## Task 4: Update package.json Test Scripts

**Files:**

- Modify: `package.json`

**Step 1: Add test:smoke script for local testing**

Add to the `scripts` section in `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:smoke": "vitest run test/smoke.test.ts",
    "test:integration": "vitest run test/**/*.test.ts"
  }
}
```

**Step 2: Commit package.json update**

```bash
git add package.json
git commit -m "chore: add smoke test script"
```

---

## Task 5: Create Test README

**Files:**

- Create: `test/README.md`

**Step 1: Document test setup for developers**

````markdown
# Testing Guide

## Running Tests

### Smoke Test (Local Development)

The smoke test validates basic connectivity to a local Nimiq node.

**Prerequisites:**

1. Clone and build albatross-rpc-rust:

   ```bash
   cd ~
   git clone https://github.com/nimiq/albatross-rpc-rust.git
   cd albatross-rpc-rust
   cargo build --release
   ```

   ```

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
   cd /path/to/albatross-rpc-client-ts
   pnpm test:smoke
   ```

### CI Tests

Tests run automatically in GitHub Actions when you push to `main` or branches prefixed with `test/`.

The workflow:

1. Clones albatross-rpc-rust
2. Builds the node (with Cargo caching)
3. Starts it in background
4. Runs smoke test
5. Tears down

## Test Configuration

Tests use environment variables for RPC endpoints:

- `TEST_RPC_URL` - HTTP RPC endpoint (default: `http://127.0.0.1:8648`)
- `TEST_WS_URL` - WebSocket endpoint (default: `ws://127.0.0.1:8648/ws`)

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
````

**Step 2: Commit test README**

```bash
git add test/README.md
git commit -m "docs: add testing guide"
```

---

## Task 6: Test Locally (Manual Verification)

**Note:** This task requires manual verification and cannot be fully automated.

**Step 1: Clone and build albatross-rpc-rust**

```bash
cd ~
git clone https://github.com/nimiq/albatross-rpc-rust.git
cd albatross-rpc-rust
cargo build --release
```

Expected: Build succeeds (may take 5-10 minutes first time)

**Step 2: Start the node**

```bash
cargo run --release -- \
  --network dev-albatross \
  --rpc-enabled \
  --rpc-address 127.0.0.1:8648
```

Expected: Node starts and begins producing blocks. Look for log messages indicating RPC server started.

**Step 3: Run smoke test in another terminal**

```bash
cd /home/maxi/nimiq/albatross-rpc-client-ts/.worktrees/comprehensive-testing
pnpm test:smoke
```

Expected output:

```
✓ test/smoke.test.ts (1 test) XXXms
  ✓ Smoke Test - Local Node Connectivity > should connect to local node and get block number
```

**Step 4: Stop the node**

Press `Ctrl+C` in the terminal running the node.

**Step 5: Document verification in commit**

```bash
git commit --allow-empty -m "test: verify smoke test works with local node

Manually verified:
- Local node starts successfully
- Smoke test connects and passes
- Node can be stopped cleanly"
```

---

## Task 7: Push and Verify GitHub Action

**Step 1: Push branch to trigger CI**

```bash
git push origin test/comprehensive-testing
```

**Step 2: Monitor GitHub Action**

Go to: `https://github.com/onmax/albatross-rpc-client-ts/actions`

Wait for workflow to complete.

**Expected results:**

- ✅ Build completes in <5 minutes
- ✅ All steps succeed
- ✅ Smoke test passes

**Step 3: If action fails, debug and fix**

Check action logs to identify failure:

- Build failures → Check Rust toolchain setup
- Node start failures → Check node configuration
- Test failures → Check RPC connectivity

Make fixes, commit, and push again.

**Step 4: Document successful CI run**

```bash
git commit --allow-empty -m "ci: verify integration test workflow passes

GitHub Action run: [paste URL to successful run]"
```

---

## Completion Checklist

Before marking Phase 1 complete, verify:

- [ ] `test/setup/config.ts` exists with RPC config and health check
- [ ] `test/smoke.test.ts` exists and tests basic connectivity
- [ ] `.github/workflows/test-integration.yml` exists and is properly configured
- [ ] `test/README.md` documents setup for developers
- [ ] Smoke test passes locally with running node
- [ ] GitHub Action passes in CI
- [ ] Action completes in <5 minutes
- [ ] All code is committed

**If all checks pass:** Phase 1 infrastructure is complete and stable. Ready to proceed to Phase 2 (test utilities).

**If any checks fail:** Debug and fix before proceeding. Infrastructure must be rock-solid.

---

## Next Steps

After Phase 1 is complete and stable:

1. **Phase 2:** Test Utilities
   - Wallet generation helpers
   - Dynamic fixture discovery
   - Shared validation utilities

2. **Phase 3:** Test Suite Implementation
   - All HTTP test modules
   - All WS test modules

3. **Phase 4:** Optimization
   - Parallel execution
   - Build caching
   - Performance benchmarks
