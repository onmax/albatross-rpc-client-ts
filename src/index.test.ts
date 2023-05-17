import { describe, expect, it } from 'vitest';
import Client, { Transaction } from '.';

let client: Client;
function getClient() {
    if (client) return client;
    // const secret = process.env.NIMIQ_SECRET || '';
    const url = new URL(process.env.RPC_URL || 'http://localhost:10200');
    const username = process.env.RPC_USERNAME || '';
    const password = process.env.RPC_PASSWORD || '';
    client = new Client(url, { username, password })
    return client;
}

describe('Test for block module', async () => {
    const { block } = getClient();
    const current = (await block.current());
    if (current.error) throw new Error('current block is undefined');
    const blockData = (await block.getByNumber(current.data)).data!;
    it('.current ok', async () => expect(current.data).toBeGreaterThanOrEqual(0));
    it('.get blockNumber ok', async () => expect(blockData).toHaveProperty('hash'));
    it('.get hash ok', async () => expect((await block.getByHash(blockData.hash)).data).toHaveProperty('hash'));
    it('.get blockNumber w/txs ok', async () => expect((await block.getByNumber(0, { includeTransactions: true })).data).toHaveProperty('hash'));
    it('.latest ok', async () => expect((await block.latest()).data).toHaveProperty('hash'));
    it('.latest ok w/txs', async () => expect((await block.latest({ includeTransactions: true })).data).toHaveProperty('transactions'));
    it('.batchIndex ok', async () => expect((await block.batchIndex(3)).data).toBe(2));
    it('.epochIndex ok', async () => expect((await block.epochIndex(3)).data).toBe(2));
    it('.election.after ok', async () => expect((await block.election.after(0)).data).toBeGreaterThanOrEqual(0));
    it('.election.before ok', async () => expect((await block.election.before(10)).data).toBeGreaterThanOrEqual(0));
    it('.election.last ok', async () => expect((await block.election.last(10)).data).toBeGreaterThanOrEqual(0));
    it('.election.get ok', async () => expect((await block.election.get({ epochIndex: 1 })).data).toBeGreaterThanOrEqual(0));
    it('.isElection ok', async () => expect(typeof ((await block.isElection(1)).data)).toBe("boolean"));
    it('.macro.after ok', async () => expect((await block.macro.after(0)).data).toBeGreaterThanOrEqual(0));
    it('.macro.before ok', async () => expect((await block.macro.before(10)).data).toBeGreaterThanOrEqual(0));
    it('.macro.last ok', async () => expect((await block.macro.last(10)).data).toBeGreaterThanOrEqual(0));
    it('.macro.get ok', async () => expect((await block.macro.getBy({ batchIndex: 1 })).data).toBeGreaterThanOrEqual(0));
    it('.isMacro ok', async () => expect(typeof ((await block.isMacro(0)).data)).toBe("boolean"));
    it('.isMicro ok', async () => expect(typeof ((await block.isMicro(0)).data)).toBe("boolean"));
    it('.election.after ok', async () => expect((await block.election.after(0)).data).toBeGreaterThanOrEqual(0));
    it('.election.before ok', async () => expect((await block.election.before(10)).data).toBeGreaterThanOrEqual(0));
    it('.election.last ok', async () => expect((await block.election.last(10)).data).toBeGreaterThanOrEqual(0));
    it('.election.get ok', async () => expect((await block.election.get({ epochIndex: 1 })).data).toBeGreaterThanOrEqual(0));
});

describe('Test for subscriptions', async () => {
    const client = getClient();
    it('subscribe to new full blocks', async () => {
        const { next, close } = await client.block.subscribe({ retrieve: 'FULL' })
        next(data => expect(data).toHaveProperty('transactions'))
        close()
    })
    it('subscribe to new partial blocks', async () => {
        const { next, close } = await client.block.subscribe({ retrieve: 'PARTIAL' })
        next(data => expect(data).toHaveProperty('hash'))
        close()
    })
    it('subscribe to new partial blocks', async () => {
        const { next, close } = await client.block.subscribe({ retrieve: 'PARTIAL', blockType: 'ELECTION' })
        next(data => expect(data).toHaveProperty('hash'))
        close()
    })
    it('subscribe to new partial blocks', async () => {
        const { next, close } = await client.block.subscribe({ retrieve: 'PARTIAL' })
        next(data => expect(data).not.toHaveProperty('transactions'))
        close()
    })
    it('subscribe to new hashes blocks', async () => {
        const { next, close } = await client.block.subscribe({ retrieve: 'HASH' })
        next(data => expect(data).toBeInstanceOf(String))
        close()
    })
    it('subscribe to logs', async () => {
        const { next, close } = await client.logs.subscribe({ addresses: [] })
        next(data => expect(data).toHaveProperty('hash'))
        close()
    })
    it('subscribe to logs metadata', async () => {
        const { next, close } = await client.logs.subscribe({ addresses: [], withMetadata: true })
        next(data => expect(data).toHaveProperty('metadata'))
        close()
    })
    // We don't test for blocks.election.subscribe since those blocks are emitted every 8 hours
})

describe('Test for batch module', async () => {
    const { batch } = getClient();
    it('.current ok', async () => expect((await batch.current()).data).toBeGreaterThanOrEqual(0));
    it('.at ok', async () => expect((await batch.at(0)).data).toBeGreaterThanOrEqual(0));
    it('.firstBlock ok', async () => expect((await batch.firstBlock({ epochIndex: 1 })).data).toBeGreaterThanOrEqual(0));
});

describe('Test for epoch module', async () => {
    const { epoch } = getClient();
    it('.current ok', async () => expect((await epoch.current()).data).toBeGreaterThanOrEqual(0));
    it('.at ok', async () => expect((await epoch.at(0)).data).toBeGreaterThanOrEqual(0));
    it('.firstBlock ok', async () => expect((await epoch.firstBlock({ epochIndex: 1 })).data).toBeGreaterThanOrEqual(0));
    it('.firstBatch ok', async () => expect(typeof ((await epoch.firstBatch(65)).data)).toBe("boolean"));
});

describe('Test for transaction module', async () => {
    const { transaction, block, batch, constant } = getClient();

    let txs: Transaction[] = []
    let i = (await block.current()).data!

    while (txs.length === 0 && i > 0) {
        // search for last tx in the chain
        const res = await transaction.getByBlockNumber(i--)
        if (!res.data) throw new Error(JSON.stringify(txs))
        txs = res.data
    }

    const batchNumber = (await batch.at(txs[0].blockNumber)).data!
    const stakingContract = (await constant.params()).data!.stakingContractAddress

    it('.get block number ok', async () => expect(txs).toBeInstanceOf(Array));
    it('.get hash ok', async () => expect(await transaction.getByHash(txs[0].hash)).toHaveProperty('data'));
    it('.get batch number ok', async () => expect((await transaction.getByBatch(batchNumber)).data).toBeInstanceOf(Array));
    it('.get batch number ok', async () => expect((await transaction.getByAddress(stakingContract)).data).toBeInstanceOf(Array));

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
    it('.get blockNumber', async () => expect((await inherent.getByBlock(0)).data).toBeInstanceOf(Array));
    it('.get batchNumber', async () => expect((await inherent.getByBatch(0)).data).toBeInstanceOf(Array));
});

describe('Test for validator module', async () => {
    const { validator } = getClient();
    const validatorAddresses = (await validator.activeList()).data!;
    it('.active ok', async () => expect(validatorAddresses).toBeInstanceOf(Array));
    const validatorInfo = validatorAddresses[0];
    it('.byAddress ok', async () => expect((await validator.byAddress(validatorInfo.address)).data).toHaveProperty('address'));
    it('.active metadata ok', async () => expect((await validator.activeList({ withMetadata: true })).metadata).not.toBeUndefined());
    it('.parked ok', async () => expect((await validator.parked()).data!.validators).toBeInstanceOf(Array));
    it('.parked metadata ok', async () => expect((await validator.parked({ withMetadata: true })).metadata).not.toBeUndefined());
    // TODO Figure out how validator.selfNode works
    // it.only('.selfNode.address ok', async () => expect(await validator.selfNode.address()).toHaveProperty('address'));
    // TODO validator.action
    // TODO validator.setAutomaticReactivation
});

describe('Test for slots module', async () => {
    const { slots, block } = getClient();
    const currentBlock = (await block.current()).data!;
    it('.current ok', async () => expect((await slots.at(currentBlock - 10)).data).haveOwnProperty('slotNumber'));
    it('.current ok offset', async () => expect((await slots.at(currentBlock - 10, { offsetOpt: 10 })).data).haveOwnProperty('slotNumber'));
    it('.current ok offset metadata', async () => expect(((await slots.at(currentBlock - 10, { offsetOpt: 10, withMetadata: true }))).metadata).not.toBeUndefined());
    it('.slashed.current ok', async () => expect((await slots.slashed.current()).data).haveOwnProperty('blockNumber'));
    it('.slashed.current metadata ok', async () => expect((await slots.slashed.current({ withMetadata: true })).metadata).not.toBeUndefined());
    it('.slashed.previous ok', async () => expect((await slots.slashed.previous()).data).haveOwnProperty('blockNumber'));
    it('.slashed.previous metadata ok', async () => expect((await slots.slashed.previous({ withMetadata: true })).metadata).not.toBeUndefined());
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
    it('.id ok', async () => expect(typeof (await peers.id()).data).toBe('string'));
    it('.count ok', async () => expect((await peers.count()).data).toBeGreaterThanOrEqual(0));
    it('.peers ok', async () => expect((await peers.peers()).data).toBeInstanceOf(Array));
    it('.consensusEstablished ok', async () => expect((await peers.consensusEstablished()).data).toBe(true));
});

describe('Test for constant module', async () => {
    const { constant } = getClient();
    const oneYearAgo = new Date().getTime() - 31536000000;
    it('.params ok', async () => expect((await constant.params()).data).toHaveProperty('stakingContractAddress'));
    it('.supply ok', async () => expect((await constant.supply({ genesisSupply: 100000, genesisTime: oneYearAgo, currentTime: new Date().getTime() })).data).toBeGreaterThanOrEqual(0));
});

describe('Test for zeroKnowledgeProof module', async () => {
    const { zeroKnowledgeProof } = getClient();
    it('.state ok', async () => expect((await zeroKnowledgeProof.state()).data).toHaveProperty('latestHeaderHash'));
});

