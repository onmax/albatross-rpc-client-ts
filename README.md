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

```typescript
function getClient() {
    const secret = process.env.NIMIQ_SECRET || '';
    const url = new URL(`https://seed1.v2.nimiq-testnet.com:8648/`);
    url.searchParams.append('secret', secret);
    return new Client(url)
}

// client has been reestructure so you can access all methods directly. You can access using:
// [batch, block, epoch, transaction, inherent, account, validator, slots, mempool, stakes, staker, peers, constant, htlc, vesting, zeroKnowledgeProof, logs]
// e.g.
await getClient().block.current()
await getClient().peer.list()
```

Check out the [typing file](./src/index.ts) for all available methods.

#### Using the Nimiq RPC Client structure

In the [`Rust RPC Client`](https://github.com/nimiq/core-rs-albatross/tree/albatross/rpc-server/src/dispatchers) things are structure differently and you can use that structure if you want prefer it.

```typescript
function getClient() {
    const secret = process.env.NIMIQ_SECRET || '';
    const url = new URL(`https://seed1.v2.nimiq-testnet.com:8648/`);
    url.searchParams.append('secret', secret);
    return new Client(url)
}
getClient._modules.blockchain.getBlockNumber()
getClient._modules.network.getPeerCount()
```

## Need help?

Check the tests for examples on how to use the client [here](./src/index.test.ts).