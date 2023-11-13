# Nimiq RPC Client for TypeScript

A fully typed Nimiq RPC client for TypeScript.

## How to use

### Installation

```bash
npm install nimiq-rpc-client-ts
```

#### NIMIQ_SECRET

The development network is currently in a phase where we are giving RPC access to interested developers. Its main purpose is to invite all developers to exercise and test the Nimiq 2.0 RPC functionality (to see how it fits for their app use cases), and we invite them to file and report any issues through our GitHub repository. Using the TOKEN that will be given after requesting developer access from a team member through our social media channels.


### Usage

It is structured the same way as the [`Rust RPC Client`](https://github.com/nimiq/core-rs-albatross/tree/albatross/rpc-server/src/dispatchers)

```typescript
// getClient() defined before
getClient().blockchain.getBlockNumber()
getClient().network.getPeerCount()
// use auto-complete to see all available methods
```

## Need help?

Check the tests for examples on how to use the client [here](./src/index.test.ts).
