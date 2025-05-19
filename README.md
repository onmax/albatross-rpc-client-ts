# Nimiq Albatross RPC Client for TypeScript

A fully typed Nimiq Albatross RPC client for TypeScript with support for both HTTP and WebSocket connections.

## Installation

```bash
# Using npm
npm install nimiq-rpc-client-ts

# Using yarn
yarn add nimiq-rpc-client-ts

# Using pnpm
pnpm add nimiq-rpc-client-ts
```

## Configuration

The client can be configured in multiple ways:

### 1. Using `initRpcClient` (recommended)

```typescript
import { initRpcClient } from 'nimiq-rpc-client-ts'

// Initialize with URL only
initRpcClient({
  url: 'https://rpc.nimiq-testnet.com'
})

// Initialize with URL and authentication
initRpcClient({
  url: 'https://rpc.nimiq-testnet.com',
  auth: {
    username: 'your-username',
    password: 'your-password'
  }
})
```

### 2. Using environment variables

```bash
# Set these environment variables before running your application
export ALBATROSS_RPC_NODE_URL=https://rpc.nimiq-testnet.com
export ALBATROSS_RPC_NODE_USERNAME=your-username
export ALBATROSS_RPC_NODE_PASSWORD=your-password
```

### 3. Per-request configuration

You can also override configuration on a per-request basis:

```typescript
import { getBlockNumber } from 'nimiq-rpc-client-ts'

// Override URL and auth for a specific request
const result = await getBlockNumber({
  url: new URL('https://rpc.nimiq-testnet.com'),
  auth: {
    username: 'your-username',
    password: 'your-password'
  }
})
```

## Browser Usage

For browser environments, you can use the dedicated browser module which is optimized for browser usage:

```typescript
import { initRpcClient } from 'nimiq-rpc-client-ts/browser'
import { getBlockNumber } from 'nimiq-rpc-client-ts/http'

// Initialize with URL for browser environment
initRpcClient({
  url: 'https://rpc.nimiq-testnet.com'
})

// Make API calls as usual
const [success, error, blockNumber] = await getBlockNumber()
```

Note: The browser module doesn't support environment variables as they're not available in browser environments.

## Module Resolution Setup

This library is published as an ESM-only package with subpath exports. To use it properly, make sure your TypeScript project is configured for ESM:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020", // or higher
    "module": "NodeNext", // or "ESNext" with "moduleResolution": "Bundler"
    "moduleResolution": "NodeNext", // or "Bundler" if using "module": "ESNext"
    "esModuleInterop": true
    // Other compiler options...
  }
}
```

Import from specific subpaths like this:

```typescript
// Import types
import type { Account, Block } from 'nimiq-rpc-client-ts/types'

// Import configuration utilities
import { initRpcClient } from 'nimiq-rpc-client-ts/config'

// Import HTTP methods
import { getAccountByAddress, getBlockNumber } from 'nimiq-rpc-client-ts/http'

// Import WebSocket methods
import { subscribeForHeadBlock } from 'nimiq-rpc-client-ts/ws'
```

## HTTP API Usage

All HTTP RPC methods are exposed as individual functions.

The methods have either one or two parameters:

- If the RPC method does not have any parameters, then the first parameter is an options object for the request.
- If the RPC method has parameters, then the first parameter is the method-specific parameters and the second parameter is an options object.

```typescript
import {
  getAccountByAddress,
  getBlockByHash,
  getBlockNumber,
  sendTransaction
} from 'nimiq-rpc-client-ts'

// Simple call without options
const [success, error, result, meta] = await getBlockNumber()
if (success && result) {
  console.log(`Current block number: ${result}`)
}

// Call with options
const [success, error, block, meta] = await getBlockByHash({ /* Params first */
  hash: 'abcd1234...', // Block hash
  includeBody: true // Method-specific option
})

// Working with accounts
const [success, error, account, meta] = await getAccountByAddress('NQ...')

// Sending transactions
const [success, error, txHash, meta] = await sendTransaction({
  wallet: 'NQ...',
  recipient: 'NQ...',
  value: 1000,
  fee: 10,
  relativeValidityStartHeight: 0 // or use absoluteValidityStartHeight
})

// All results are returned as tuples: [success, error, data, metadata]
// - success: boolean indicating if the call was successful
// - error: error message if the call failed
// - data: the actual result data if successful
// - metadata: additional information about the request
```

## WebSocket Subscriptions

Subscribe to real-time events using the WebSocket API:

```typescript
import {
  LogType,
  subscribeForHeadBlock,
  subscribeForHeadBlockHash,
  subscribeForLogsByAddressesAndTypes
} from 'nimiq-rpc-client-ts'

// Subscribe to new blocks
const blockSubscription = await subscribeForHeadBlock(true, {
  // Optional settings
  once: false, // Set to true to auto-unsubscribe after first message
  filter: block => block.number > 100, // Filter events
  timeout: 30000, // Timeout in ms (default: 30000, false to disable)
  autoReconnect: true, // Auto reconnect on disconnect
  onError: e => console.error(e)
})

// Listen for block events
blockSubscription.addEventListener('data', (event) => {
  const { data: block, metadata } = event.detail
  console.log('New block:', block.number, block.hash)
})

// Subscribe to head block hashes only (lighter)
const hashSubscription = await subscribeForHeadBlockHash()
hashSubscription.addEventListener('data', (event) => {
  const { data: hashes } = event.detail
  console.log('New block hashes:', hashes)
})

// Subscribe to specific log types for addresses
const logSubscription = await subscribeForLogsByAddressesAndTypes(
  ['NQ...', 'NQ...'], // Addresses to monitor
  [LogType.Transfer, LogType.PayFee] // Log types to monitor
)

// Handle connection events
blockSubscription.addEventListener('open', () => console.log('Connected'))
blockSubscription.addEventListener('error', event => console.error('Error:', event.detail))
blockSubscription.addEventListener('close', () => console.log('Disconnected'))
```

## Migration Guide from v0.0.0 to v1.0.0

If you're migrating from v0.0.0 to v1.0.0, here are the key changes:

### Class-based to Functional API

**Before (v0.0.0):**

```typescript
import { NimiqRPCClient } from 'nimiq-rpc-client-ts'

const client = new NimiqRPCClient(new URL('NODE_URL'))
const { data: currentEpoch, error } = await client.blockchain.getEpochNumber()
```

**After (v1.0.0):**

```typescript
import { getEpochNumber, initRpcClient } from 'nimiq-rpc-client-ts'

// Initialize once at app startup
initRpcClient({ url: 'NODE_URL' })

// Make calls using direct functions
const [success, error, currentEpoch, metadata] = await getEpochNumber()
```

### Return Value Format

**Before (v0.0.0):**

```typescript
const { data, error } = await client.blockchain.getBlockNumber()
if (error || !data) {
  console.error('Error:', error)
}
else {
  console.log('Block number:', data)
}
```

**After (v1.0.0):**

```typescript
const [success, error, blockNumber, metadata] = await getBlockNumber()
if (!success || !blockNumber) {
  console.error('Error:', error)
}
else {
  console.log('Block number:', blockNumber)
}
```

### WebSocket Subscriptions

**Before (v0.0.0):**

```typescript
const { next } = await client.subscribe.forHeadBlock()
next(block => console.log(block))
```

**After (v1.0.0):**

```typescript
const subscription = await subscribeForHeadBlock()
subscription.addEventListener('data', (event) => {
  const { data: block } = event.detail
  console.log(block)
})
```

## Custom RPC Methods

If you need to call custom methods not covered by the library:

```typescript
import { rpcCall, rpcSubscribe } from 'nimiq-rpc-client-ts'

// For HTTP RPC
const [success, error, data, meta] = await rpcCall<YourResponseType>(
  'yourCustomMethod',
  ['param1', 'param2'],
  { /* options */ }
)

const subscription = await rpcSubscribe<YourEventType>(
  'subscribeToYourCustomEvents',
  ['param1', 'param2'],
  { /* options */ }
)
```

## Type Augmentation

You can extend the library's types for custom needs:

```typescript
// albatross-rpc-client-ts.d.ts
declare module 'nimiq-rpc-client-ts' {
  interface Block {
    myCustomProperty: string
  }
}
```
