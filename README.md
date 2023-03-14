# Nimiq RPC Client for TypeScript

A fully typed Nimiq RPC client for TypeScript.

## How to use

### Installation

```bash
npm install nimiq-rpc-client-ts
```

### Usage

#### NIMIQ_SECRET

The development network is currently in a phase where we are giving RPC access to interested developers. Its main purpose is to invite all developers to exercise and test the Nimiq 2.0 RPC functionality (to see how it fits for their app use cases), and we invite them to file and report any issues through our GitHub repository. Using the TOKEN that will be given after requesting developer access from a team member through our social media channels.

```typescript
const client = new Client("https://seed1.v2.nimiq-testnet.com:8648/?secret={TOKEN}")

// call blockchain methods
await client.blockchain.getActiveValidators();

// call policies methods
await client.blockchain.getPolicyConstants();
```

Check out the [typing file](./src/types/modules.d.ts) for all available methods.
