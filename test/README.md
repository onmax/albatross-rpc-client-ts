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
