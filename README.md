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

const url = "NODE_URL"
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
const { data, error } = await client.call<ResponseType>({ method: 'myAwesomeCustomMethod', params: ["FirstParameter", "secondParameter"] }, { /* some http options */ })
//     ?^ ResponseType | undefined  ?^ Use call for custom HTTP methods or `subscribe` for custom WS
```

## Common Issues

### Declare a username and password required to access the JSON-RPC server.

Here are some ways you can try to fix this:

1. Make sure you have a 'username' and 'password' set in your RPC config. Use this [config](https://github.com/nimiq/core-rs-albatross/blob/albatross/lib/src/config/config_file/client.example.toml) as a reference.
2. You are trying to access via `https` but have not configured `tls` correctly.

## Need help?

Check the tests for examples on how to use the client [here](./src/index.test.ts).
