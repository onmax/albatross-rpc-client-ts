import { describe, expect, it } from 'vitest';
import { Client } from '.';

function getClient() {
    const secret = process.env.NIMIQ_SECRET || '';
    const url = new URL(`https://seed1.v2.nimiq-testnet.com:8648/`);
    url.searchParams.append('secret', secret);
    return new Client(url)
}

describe('Test for block module', async () => {
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
    it('.election.after ok', async () => expect(await block.election.after({blockNumber: 0})).toBeGreaterThanOrEqual(0));
    it('.election.before ok', async () => expect(await block.election.before({blockNumber: 10})).toBeGreaterThanOrEqual(0));
    it('.election.last ok', async () => expect(await block.election.last({blockNumber: 10})).toBeGreaterThanOrEqual(0));
    it('.election.get ok', async () => expect(await block.election.get({epochIndex: 1})).toBeGreaterThanOrEqual(0));
});

describe('Test for subscriptions', async () => {
    const client = getClient();
    it('subscribe to new full blocks', async () => {
        const { next, close } = await client.block.subscribe({filter: 'FULL'})
        next(data => expect(data).toHaveProperty('transactions'))
        close()
    })
    it('subscribe to new partial blocks', async () => {
        const { next, close } = await client.block.subscribe({filter: 'PARTIAL'})
        next(data => expect(data).toHaveProperty('hash'))
        close()
    })
    it('subscribe to new hashes blocks', async () => {
        const { next, close } = await client.block.subscribe({filter: 'HASH'})
        next(data => expect(data).toBeInstanceOf(String))
        close()
    })
    it('subscribe to logs', async () => {
        const { next, close } = await client.logs.subscribe()
        next(data => expect(data).toHaveProperty('hash'))
        close()
    })
    it('subscribe to logs metadata', async () => {
        const { next, close } = await client.logs.subscribe({withMetadata: true})
        next(data => expect(data).toHaveProperty('metadata'))
        close()
    })
})

describe('Test for batch module', async () => {
    const { batch } = getClient();
    it('.current ok', async () => expect(await batch.current()).toBeGreaterThanOrEqual(0));
    it('.at ok', async () => expect(await batch.at({blockNumber: 0})).toBeGreaterThanOrEqual(0));
    it('.firstBlock ok', async () => expect(await batch.firstBlock({epochIndex: 1})).toBeGreaterThanOrEqual(0));
});

describe('Test for epoch module', async () => {
    const { epoch } = getClient();
    it('.current ok', async () => expect(await epoch.current()).toBeGreaterThanOrEqual(0));
    it('.at ok', async () => expect(await epoch.at({blockNumber: 0})).toBeGreaterThanOrEqual(0));
    it('.firstBlock ok', async () => expect(await epoch.firstBlock({epochIndex: 1})).toBeGreaterThanOrEqual(0));
    it('.firstBatch ok', async () => expect(typeof (await epoch.firstBatch({blockNumber: 65}))).toBe("boolean"));
});

describe.skip('Test for transaction module', async () => {
    // const { transaction } = getClient();
    // TODO transaction.by
    // TODO transaction.push
    // TODO Returns method not found
    // it('.minFeePerByte ok', async () => expect(await transaction.minFeePerByte()).toBeGreaterThanOrEqual(0));
    // TODO transaction.create
    // TODO transaction.send
});

describe.skip('Test for vesting module', async () => {
    // const { vesting } = getClient();
    // TODO
});

describe.skip('Test for htlc module', async () => {
    // const { htlc } = getClient();
    // TODO
});

describe.skip('Test for stakes module', async () => {
    // const { stakes } = getClient();
    // TODO
});

describe.skip('Test for staker module', async () => {
    // const { staker } = getClient();
    // TODO
});

describe('Test for inherent module', async () => {
    const { inherent } = getClient();
    // return inherent[]
    it('.by blockNumber', async () => expect(await inherent.by({blockNumber: 0})).toBeInstanceOf(Array));
    it('.by batchNumber', async () => expect(await inherent.by({batchNumber: 0})).toBeInstanceOf(Array));
});

describe('Test for validator module', async () => {
    const { validator } = getClient();
    // TODO validator.byAddress
    // TODO validator.setAutomaticReactivation
    // TODO Figure out how validator.node works
    it('.active ok', async () => expect((await validator.active())).toBeInstanceOf(Array));
    it('.active metadata ok', async () => expect((await validator.active({withMetadata: true})).data).toBeInstanceOf(Array));
    it('.parked ok', async () => expect((await validator.parked()).validators).toBeInstanceOf(Array));
    it('.parked metadata ok', async () => expect((await validator.parked({withMetadata: true})).data.validators).toBeInstanceOf(Array));
    // TODO validator.action
});

describe('Test for slots module', async () => {
    const { slots, block } = getClient();
    const currentBlock = await block.current();
    it('.current ok', async () => expect(await slots.at({blockNumber: currentBlock - 10})).haveOwnProperty('slotNumber'));
    it('.current ok offset', async () => expect(await slots.at({blockNumber: currentBlock - 10, offsetOpt: 10})).haveOwnProperty('slotNumber'));
    it('.current ok offset metadata', async () => expect((await slots.at({blockNumber: currentBlock - 10, offsetOpt: 10, withMetadata: true})).data).haveOwnProperty('slotNumber'));
    it('.slashed.current ok', async () => expect((await slots.slashed.current())).haveOwnProperty('blockNumber'));
    it('.slashed.current metadata ok', async () => expect((await slots.slashed.current({withMetadata: true})).data).haveOwnProperty('blockNumber'));
    it('.slashed.previous ok', async () => expect((await slots.slashed.previous())).haveOwnProperty('blockNumber'));
    it('.slashed.previous metadata ok', async () => expect((await slots.slashed.previous({withMetadata: true})).data).haveOwnProperty('blockNumber'));
});

describe.skip('Test for mempool module', async () => {
    const { mempool } = getClient();
    // TODO .info is failing
    // it('.info ok', async () => expect(await mempool.info()).toHaveProperty('size'));
    // TODO .content is failing
    // it('.content ok', async () => expect(await mempool.content()).toHaveProperty('transactions'));
});

describe('Test for peers module', async () => {
    const { peers } = getClient();
    it('.id ok', async () => expect(typeof (await peers.id())).toBe('string'));
    it('.count ok', async () => expect(await peers.count()).toBeGreaterThanOrEqual(0));
    it('.peers ok', async () => expect(await peers.peers()).toBeInstanceOf(Array));
    it('.consensusEstablished ok', async () => expect(await peers.consensusEstablished()).toBe(true));
});

describe('Test for constant module', async () => {
    const { constant } = getClient();
    const oneYearAgo = new Date().getTime() - 31536000000;
    it('.params ok', async () => expect(await constant.params()).toHaveProperty('stakingContractAddress'));
    it('.supply ok', async () => expect(await constant.supply({genesisSupply: 100000, genesisTime: oneYearAgo, currentTime: new Date().getTime()})).toBeGreaterThanOrEqual(0));
});

describe('Test for zeroKnowledgeProof module', async () => {
    const { zeroKnowledgeProof } = getClient();
    it('.state ok', async () => expect(await zeroKnowledgeProof.state()).toHaveProperty('latestHeaderHash'));
});
