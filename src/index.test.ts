import { describe, expect, it } from 'vitest';
import { Client } from '.';

function getClient() {
    const secret = process.env.NIMIQ_SECRET || '';
    const url = new URL(`https://seed1.v2.nimiq-testnet.com:8648/`);
    url.searchParams.append('secret', secret);
    return new Client(url)
}

describe('Test for blocks module', async () => {
    const { block } = getClient();
    // Get a hash from Staking contract which we know has transactions
    // const randomTxHash = ...
    it('.current ok', async () => expect(await block.current()).toBeGreaterThanOrEqual(0));
    // it('.by hash ok', async () => expect(await block.by({ hash: randomTxHash })).toHaveProperty('hash'));
    it('.by blockNumber ok', async () => expect(await block.by({ blockNumber: 0 })).toHaveProperty('hash'));
    it('.by blockNumber w/txs ok', async () => expect(await block.by({ blockNumber: 0, includeTransactions: true })).toHaveProperty('hash'));
    it('.latest ok', async () => expect(await block.latest()).toHaveProperty('hash'));
    it('.latest ok w/txs', async () => expect(await block.latest({includeTransactions: true})).toHaveProperty('transactions'));
    it('.election.after ok', async () => expect(await block.election.after({blockNumber: 0})).toBeGreaterThanOrEqual(0));
    it('.election.before ok', async () => expect(await block.election.before({blockNumber: 10})).toBeGreaterThanOrEqual(0));
    it('.election.last ok', async () => expect(await block.election.last({blockNumber: 10})).toBeGreaterThanOrEqual(0));
    it('.election.get ok', async () => expect(await block.election.get({epochIndex: 1})).toBeGreaterThanOrEqual(0));
    it('.isElection ok', async () => expect(typeof (await block.isElection({blockNumber: 1}))).toBe("boolean"));
    it('.macro.after ok', async () => expect(await block.macro.after({blockNumber: 0})).toBeGreaterThanOrEqual(0));
    it('.macro.before ok', async () => expect(await block.macro.before({blockNumber: 10})).toBeGreaterThanOrEqual(0));
    it('.macro.last ok', async () => expect(await block.macro.last({blockNumber: 10})).toBeGreaterThanOrEqual(0));
    it('.macro.get ok', async () => expect(await block.macro.get({batchIndex: 1})).toBeGreaterThanOrEqual(0));
    it('.isMacro ok', async () => expect(typeof (await block.isMacro({blockNumber: 0}))).toBe("boolean"));
    it('.isMicro ok', async () => expect(typeof (await block.isMicro({blockNumber: 0}))).toBe("boolean"));
});