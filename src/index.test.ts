import type { Block } from '.'
import { describe, expect, it, vi } from 'vitest'
import { NimiqRPCClient, RetrieveType } from '.'
import 'dotenv/config'

let client: NimiqRPCClient
async function getClient() {
  if (client)
    return client
  const { RPC_URL, RPC_SECRET /* RPC_USERNAME, RPC_PASSWORD */ } = process.env
  if (!RPC_URL)
    console.warn('RPC_URL is undefined')
  const url = new URL(RPC_URL || 'http://localhost:8648')

  const auth = { secret: RPC_SECRET || '' }
  // const auth = { username: RPC_USERNAME || '', password: RPC_PASSWORD || '' }
  client = new NimiqRPCClient(url, auth)
  // client = new Client(url, { username: env.RPC_USERNAME || '', password: env.RPC_PASSWORD || '' })

  return client
}

describe('test for consensus', async () => {
  const { consensus } = await getClient()
  it('.established ok', async () => expect((await consensus.isConsensusEstablished()).data).toBe(true))
})

describe('test for blockchain module', async () => {
  const { blockchain } = await getClient()
  const { data: currentBlockNumber, error: errorCurrent } = await blockchain.getBlockNumber()
  if (errorCurrent)
    throw new Error('current block is undefined')
  const { data: currentBlock, error: errorBlock } = (await blockchain.getBlockByNumber(currentBlockNumber))
  if (errorBlock)
    throw new Error('current block is undefined')
  const { hash, number: blockNumber } = currentBlock

  it('.current ok', async () => expect(blockNumber).toBeGreaterThanOrEqual(0))
  it('.get blockNumber ok', async () => expect(currentBlock).toHaveProperty('hash'))
  it('.get hash ok', async () => expect((await blockchain.getBlockByHash(hash)).data).toHaveProperty('hash'))
  it('.get blockNumber w/txs ok', async () => expect((await blockchain.getBlockByNumber(blockNumber, { includeBody: true })).data).toHaveProperty('hash'))
  it('.latest ok', async () => expect((await blockchain.getLatestBlock()).data).toHaveProperty('hash'))
  it('.latest ok w/txs', async () => expect((await blockchain.getLatestBlock({ includeBody: true })).data).toHaveProperty('transactions'))
  // it('.batchIndex ok', async () => expect((await poli(3)).data).toBe(3))
  // it('.epochIndex ok', async () => expect((await block.epochIndex(3)).data).toBe(3))
  // it('.election.after ok', async () => expect((await block.election.after(0)).data).toBeGreaterThanOrEqual(0))
  // it('.election.before ok', async () => expect((await block.election.before(blockNumber)).data).toBeGreaterThanOrEqual(0))
  // it('.election.last ok', async () => expect((await block.election.last(blockNumber)).data).toBeGreaterThanOrEqual(0))
  // it('.election.get ok', async () => expect((await block.election.getByEpoch(1)).data).toBeGreaterThanOrEqual(0))
  // it('.isElection ok', async () => expect(typeof ((await block.isElection(1)).data)).toBe('boolean'))
  // it('.macro.after ok', async () => expect((await block.macro.after(0)).data).toBeGreaterThanOrEqual(0))
  // it('.macro.before ok', async () => expect((await block.macro.before(blockNumber)).data).toBeGreaterThanOrEqual(0))
  // it('.macro.last ok', async () => expect((await block.macro.last(blockNumber)).data).toBeGreaterThanOrEqual(0))
  // it('.macro.get ok', async () => expect((await block.macro.getByBatch(1)).data).toBeGreaterThanOrEqual(0))
  // it('.isMacro ok', async () => expect(typeof ((await block.isMacro(0)).data)).toBe('boolean'))
  // it('.isMicro ok', async () => expect(typeof ((await block.isMicro(0)).data)).toBe('boolean'))
  // it('.election.after ok', async () => expect((await block.election.after(blockNumber)).data).toBeGreaterThanOrEqual(0))
  // it('.election.before ok', async () => expect((await block.election.before(blockNumber)).data).toBeGreaterThanOrEqual(0))
  // it('.election.last ok', async () => expect((await block.election.last(blockNumber)).data).toBeGreaterThanOrEqual(0))
  // it('.election.get ok', async () => expect((await block.election.getByEpoch(1)).data).toBeGreaterThanOrEqual(0))
})

// ⚠️ The RPC Server needs to have the subscriptions enabled
describe('test for subscriptions', async () => {
  const client = await getClient()
  it('subscribe to new full blocks', async () => {
    const { next, close } = await client.blockchainStreams.subscribeForBlocks({ retrieve: RetrieveType.Full })
    let block: Block | undefined
    next(({ data }) => block = data)
    await vi.waitUntil(() => block !== undefined, { timeout: 10000 })
    expect(block).toHaveProperty('transactions')
    close()
  })
  it('subscribe to new partial blocks', async () => {
    const { next, close } = await client.blockchainStreams.subscribeForBlocks({ retrieve: RetrieveType.Partial })
    let block: Block | undefined
    next(({ data }) => block = data)
    await vi.waitUntil(() => block !== undefined, { timeout: 10000 })
    expect(block).toHaveProperty('hash')
    close()
  })
  it('subscribe to new hashes blocks', async () => {
    const { next, close } = await client.blockchainStreams.subscribeForBlockHashes()
    let hash: string | undefined
    next(({ data }) => hash = data)
    await vi.waitUntil(() => hash !== undefined, { timeout: 10000 })
    expect(hash).toBeTypeOf('string')
    close()
  })
  it('subscribe to new micro blocks', async () => {
    const { next, close } = await client.blockchainStreams.subscribeForMicroBlocks()
    let block: Block | undefined
    next(({ data }) => block = data)
    await vi.waitUntil(() => block !== undefined, { timeout: 10000 })
    expect(block).toHaveProperty('hash')
    close()
  })
  it('subscribe to new macro blocks', async () => {
    const { next, close } = await client.blockchainStreams.subscribeForMacroBlocks()
    let block: Block | undefined
    next(({ data }) => block = data)
    await vi.waitUntil(() => block !== undefined, { timeout: 65000 })
    expect(block).toHaveProperty('hash')
    close()
  }, 70000)
  it('subscribe to logs', async () => {
    const { next, close } = await client.blockchainStreams.subscribeForLogsByAddressesAndTypes()
    let log: any
    next(({ data }) => log = data)
    await vi.waitUntil(() => log !== undefined, { timeout: 10000 })
    expect(log).toHaveProperty('type')
    close()
  })
  // Election blocks take 12 hours, so we are not going to test them
})

// describe('test for batch module', async () => {
//   const { batch } = await getClient()
//   it('.current ok', async () => expect((await batch.current()).data).toBeGreaterThanOrEqual(0))
//   it('.at ok', async () => expect((await batch.at(0)).data).toBeGreaterThanOrEqual(0))
//   it('.firstBlock ok', async () => expect((await batch.firstBlock(1)).data).toBeGreaterThanOrEqual(0))
// })

// describe('test for epoch module', async () => {
//   const { epoch } = await getClient()
//   it('.current ok', async () => expect((await epoch.current()).data).toBeGreaterThanOrEqual(0))
//   it('.at ok', async () => expect((await epoch.at(0)).data).toBeGreaterThanOrEqual(0))
//   it('.firstBlock ok', async () => expect((await epoch.firstBlock(1)).data).toBeGreaterThanOrEqual(0))
//   it('.firstBatch ok', async () => expect(typeof ((await epoch.firstBatch(65)).data)).toBe('boolean'))
// })

// describe('test for transaction module', async () => {
//   const { transaction, block } = await getClient()

//   let txs: Transaction[] = []
//   let i = (await block.current()).data!

//   while (txs.length === 0 && i > 0) {
//     // search for last tx in the chain
//     const res = await transaction.getByBlockNumber(i--)
//     if (!res.data)
//       throw new Error(JSON.stringify(txs))
//     txs = res.data
//   }

//   it('.get block number ok', async () => expect(txs).toBeInstanceOf(Array))
//   it('.get hash ok', async () => expect(await transaction.getByHash(txs[0].hash)).toHaveProperty('data'))

// FIXME The methods are returning values but the tests are failing
// const batchNumber = (await batch.at(txs[0].blockNumber)).data!
// const stakingContract = Client.policy.stakingContractAddress
// it('.get batch number ok', async () => expect((await transaction.getByBatch(batchNumber)).data).toBeInstanceOf(Array))
// it('.get batch number ok', async () => expect((await transaction.getByAddress(stakingContract)).data).toBeInstanceOf(Array))

// TODO transaction.push
// TODO Returns method not found
// it('.minFeePerByte ok', async () => expect(await transaction.minFeePerByte()).toBeGreaterThanOrEqual(0));
// TODO transaction.create
// TODO transaction.send
// })

// describe.skip('test for vesting module', async () => {
// const { vesting } = await getClient();
// TODO
// })

// describe.skip('test for htlc module', async () => {
// const { htlc } = await getClient();
// TODO
// })

// describe.skip('test for stakes module', async () => {
// const { stakes } = await getClient();
// TODO
// })

// describe.skip('test for staker module', async () => {
// const { staker } = await getClient();
// TODO
// })

// describe('test for inherent module', async () => {
//   const { inherent, block } = await getClient()
//   const { data: blockNumber, error: errorCurrent } = await block.current()
//   if (errorCurrent)
//     throw new Error('current block is undefined')
//   it('.get blockNumber', async () => expect((await inherent.getByBlock(blockNumber)).data).toBeInstanceOf(Array))
//   it('.get batchNumber', async () => expect((await inherent.getByBatch(blockNumber)).data).toBeInstanceOf(Array))
// })

// describe('test for validator module', async () => {
//   const { validator } = await getClient()
//   const validatorAddresses = (await validator.activeList()).data!
//   it('.active ok', async () => expect(validatorAddresses).toBeInstanceOf(Array))
//   const validatorInfo = validatorAddresses[0]
//   it('.byAddress ok', async () => expect((await validator.byAddress(validatorInfo.address)).data).toHaveProperty('address'))
//   it('.active metadata ok', async () => expect((await validator.activeList({ withMetadata: true })).metadata).not.toBeUndefined())
// TODO Figure out how validator.selfNode works
// it.only('.selfNode.address ok', async () => expect(await validator.selfNode.address()).toHaveProperty('address'));
// TODO validator.action
// TODO validator.setAutomaticReactivation
// })

// describe('test for slots module', async () => {
//   const { slots, block } = await getClient()
//   const currentBlock = (await block.current()).data!
//   it('.current ok', async () => expect((await slots.at(currentBlock - 10)).data).haveOwnProperty('slotNumber'))
//   it('.current ok offset', async () => expect((await slots.at(currentBlock - 10, { offsetOpt: 10 })).data).haveOwnProperty('slotNumber'))
//   it('.current ok offset metadata', async () => expect(((await slots.at(currentBlock - 10, { offsetOpt: 10, withMetadata: true }))).metadata).not.toBeUndefined())
//   it('.slashed.current ok', async () => expect((await slots.penalized.current()).data).haveOwnProperty('blockNumber'))
//   it('.slashed.current metadata ok', async () => expect((await slots.penalized.current({ withMetadata: true })).metadata).not.toBeUndefined())
//   it('.slashed.previous ok', async () => expect((await slots.penalized.previous()).data).haveOwnProperty('blockNumber'))
//   it('.slashed.previous metadata ok', async () => expect((await slots.penalized.previous({ withMetadata: true })).metadata).not.toBeUndefined())
// })

// describe.skip('test for mempool module', async () => {
// const { mempool } = await getClient()
// TODO .info is failing
// it('.info ok', async () => expect(await mempool.info()).toHaveProperty('size'));
// TODO .content is failing
// it('.content ok', async () => expect(await mempool.content()).toHaveProperty('transactions'));
// })

// describe('test for peers module', async () => {
//   const { peers } = await getClient()
//   it('.id ok', async () => expect(typeof (await peers.id()).data).toBe('string'))
//   it('.count ok', async () => expect((await peers.count()).data).toBeGreaterThanOrEqual(0))
//   it('.peers ok', async () => expect((await peers.peers()).data).toBeInstanceOf(Array))
//   it('.consensusEstablished ok', async () => expect((await peers.consensusEstablished()).data).toBe(true))
// })

// describe('test for constant module', async () => {
//   const { supply_at } = await getClient()
//   const oneYearAgo = new Date().getTime() - 31536000000
//   it('.params ok', async () => expect(Client.policy).toHaveProperty('stakingContractAddress'))
//   it('.supply ok', async () => expect(((await supply_at({ genesisSupply: 100000, genesisTime: oneYearAgo, currentTime: new Date().getTime() })).data)).toBeGreaterThanOrEqual(0))
// })

// describe('test for zeroKnowledgeProof module', async () => {
//   const { zeroKnowledgeProof } = await getClient()
//   it('.state ok', async () => expect((await zeroKnowledgeProof.state()).data).toHaveProperty('latestHeaderHash'))
// })
