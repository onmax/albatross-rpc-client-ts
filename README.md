# Nimiq Albatross RPC Client for TypeScript

Fully typed RPC client with HTTP and WebSocket support. Tree-shaking works automatically.

```bash
pnpm add nimiq-rpc-client-ts
```

```typescript
import * as rpc from 'nimiq-rpc-client-ts'

rpc.initRpcClient({ url: 'https://rpc.nimiq-testnet.com' })

// HTTP - returns [success, error, data, metadata]
const [ok, err, block] = await rpc.getBlockNumber()
if (!ok)
  console.error(err)

// WebSocket subscription
const sub = await rpc.subscribeForHeadBlock(true, { autoReconnect: true })
sub.addEventListener('data', e => console.log('Block:', e.detail.data.number))
sub.addEventListener('error', e => console.error('WS error:', e.detail))
sub.addEventListener('close', () => console.log('Disconnected'))
```

## Configuration

```typescript
rpc.initRpcClient({
  url: 'https://rpc.nimiq-testnet.com',
  auth: { username: 'user', password: 'pass' }, // Optional
  validation: { validateBody: true, validationLevel: 'error' } // Optional
})
```

<details>
<summary>Using environment variables</summary>

```bash
export ALBATROSS_RPC_NODE_URL=https://rpc.nimiq-testnet.com
export ALBATROSS_RPC_NODE_USERNAME=your-username
export ALBATROSS_RPC_NODE_PASSWORD=your-password
```

</details>

<details>
<summary>Per-request configuration</summary>

```typescript
const [ok, err, result] = await rpc.getBlockNumber({
  url: new URL('https://other-node.com'),
  auth: { username: 'user', password: 'pass' }
})
```

</details>

## HTTP Options

All HTTP methods return `[success, error, data, metadata]`. The last parameter is always an options object:

```typescript
const [ok, err, block] = await rpc.getBlockByNumber({ blockNumber: 123 }, {
  url: new URL('...'), // Override URL
  auth: { username, password }, // Override auth
  validation: { validateBody: true, validationLevel: 'warning' } // Per-request validation
})
```

## WebSocket Options

```typescript
const sub = await rpc.subscribeForHeadBlock(true, {
  once: false, // Auto-unsubscribe after first message
  filter: block => block.number > 100, // Filter events
  timeout: 30000, // Timeout in ms (default: 30000, false to disable)
  autoReconnect: true, // Auto reconnect on disconnect
  onError: e => console.error(e) // Error callback
})
```

## Response Validation

Optional runtime validation using [Valibot](https://valibot.dev/) schemas. Disabled by default.

```typescript
rpc.initRpcClient({
  url: '...',
  validation: { validateBody: true, validationLevel: 'error' } // 'error' throws, 'warning' logs
})

// Or per-request
const [ok, err, data] = await rpc.getAccountByAddress({ address: 'NQ...' }, {
  validation: { validateBody: true, validationLevel: 'warning' }
})
```

[View available schemas](./src/schemas.ts)

## Custom RPC Methods

```typescript
// HTTP
const [ok, err, data] = await rpc.rpcCall<MyType>('customMethod', ['param1', 'param2'])

// WebSocket
const sub = await rpc.rpcSubscribe<MyEvent>('subscribeCustom', ['param1'], { /* options */ })
```

## Type Augmentation

```typescript
declare module 'nimiq-rpc-client-ts' {
  interface Block {
    myCustomProperty: string
  }
}
```

## Alternative: Subpath Imports

```typescript
import type { Block } from 'nimiq-rpc-client-ts/types'
import { getBlockNumber } from 'nimiq-rpc-client-ts/http'
import { BlockSchema } from 'nimiq-rpc-client-ts/schemas'
import { subscribeForHeadBlock } from 'nimiq-rpc-client-ts/ws'
```
