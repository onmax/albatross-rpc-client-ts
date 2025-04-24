# Nimiq RPC Client for TypeScript

A fully typed Nimiq RPC client for TypeScript.

## How to use

### Installation

```bash
npm install nimiq-rpc-client-ts
```

#### NIMIQ_SECRET

<!--
The development network is currently in a phase where we are giving RPC access to interested developers. Its main purpose is to invite all developers to exercise and test the Nimiq 2.0 RPC functionality (to see how it fits for their app use cases), and we invite them to file and report any issues through our GitHub repository. Using the TOKEN that will be given after requesting developer access from a team member through our social media channels.
-->

The development network is currently in a phase where we request developers to set up their own nodes.

### Usage

It is structured the same way as the [`Rust RPC Client`](https://github.com/nimiq/core-rs-albatross/tree/albatross/rpc-server/src/dispatchers)

```typescript
import { NimiqRPCClient } from 'nimiq-rpc-client-ts'

const url = 'NODE_URL'
const client = new NimiqRPCClient(new URL(url))
const { data: currentEpoch, error: errorCurrentEpoch } = await client.blockchain.getEpochNumber()
if (errorCurrentEpoch || !currentEpoch)
  throw new Error(errorCurrentEpoch?.message || 'No current epoch')

client.blockchain.getBlockNumber()
client.network.getPeerCount()
// use auto-complete to see all available methods, or checkout the class https://github.com/onmax/albatross-rpc-client-ts/blob/main/src/index.ts#L26
```

## Call custom method

If you have a custom method in your RPC server, or the library is out of date, you can always make a `raw` request:

```ts
interface ResponseType {
  myResult: string
}
const { data, error } = await rpcCall<ResponseType>({ method: 'myAwesomeCustomMethod', params: ['FirstParameter', 'secondParameter'] }, { /* some http options */ })
//     ?^ ResponseType | undefined  ?^ Use call for custom HTTP methods or `subscribe` for custom WS
```

## Type Augmentation

You can extend or update the types in the `albatross-rpc-client-ts` library, you can define your own type extensions. This approach is particularly useful if the Rust implementation evolves and includes new types or features that are not yet included in the TypeScript definitions.

```typescript
/// albatross-rpc-client-ts.d.ts

declare module 'albatross-rpc-client-ts' {
  interface Block {
    newFeature: string
  }
}
```

Then, whenever you import the library, the new types will be available.

```ts
import { NimiqRPCClient } from 'albatross-rpc-client-ts'

const client = new NimiqRPCClient(new URL('NODE_URL'))
const block = await client.blockchain.getBlockByHash('HASH')
// The `block` object now has the new `newFeature` property as well as the other properties defined by the library
```

> This solution is great for you so it doesn't block your workflow, but all developers will benefit if you can create a PR or open the issue so I can add it to the library asap! 🙌

## Need help?

Check the tests for examples on how to use the client [here](./src/index.test.ts).
