/* eslint-disable test/no-identical-title */

import { env } from 'node:process'
import { describe, expect, it } from 'vitest'
import type { Transaction } from '.'
import Client from '.'

let client: Client
async function getClient() {
  if (client)
    return client
  const url = new URL(env.RPC_URL || 'http://localhost:10200')

  client = new Client(url, { secret: env.RPC_SECRET || '' })
  // client = new Client(url, { username: env.RPC_USERNAME || '', password: env.RPC_PASSWORD || '' })

  await client.init()
  return client
}

describe('test for block module', async () => {
  const { block } = await getClient()
  const { data: currentBlockNumber, error: errorCurrent } = await block.current()
  if (errorCurrent)
    throw new Error('current block is undefined')
  const { data: currentBlock, error: errorBlock } = (await block.getByNumber(currentBlockNumber))
  if (errorBlock)
    throw new Error('current block is undefined')
  const { hash, number: blockNumber } = currentBlock

  it('.current ok', async () => expect(blockNumber).toBeGreaterThanOrEqual(0))
  it('.get blockNumber ok', async () => expect(currentBlock).toHaveProperty('hash'))
  it('.get hash ok', async () => expect((await block.getByHash(hash)).data).toHaveProperty('hash'))
  it('.get blockNumber w/txs ok', async () => expect((await block.getByNumber(blockNumber, { includeTransactions: true })).data).toHaveProperty('hash'))
  it('.latest ok', async () => expect((await block.latest()).data).toHaveProperty('hash'))
  it('.latest ok w/txs', async () => expect((await block.latest({ includeTransactions: true })).data).toHaveProperty('transactions'))
  it('.batchIndex ok', async () => expect((await block.batchIndex(3)).data).toBe(3))
  it('.epochIndex ok', async () => expect((await block.epochIndex(3)).data).toBe(3))
  it('.election.after ok', async () => expect((await block.election.after(0)).data).toBeGreaterThanOrEqual(0))
  it('.election.before ok', async () => expect((await block.election.before(blockNumber)).data).toBeGreaterThanOrEqual(0))
  it('.election.last ok', async () => expect((await block.election.last(blockNumber)).data).toBeGreaterThanOrEqual(0))
  it('.election.get ok', async () => expect((await block.election.getByEpoch(1)).data).toBeGreaterThanOrEqual(0))
  it('.isElection ok', async () => expect(typeof ((await block.isElection(1)).data)).toBe('boolean'))
  it('.macro.after ok', async () => expect((await block.macro.after(0)).data).toBeGreaterThanOrEqual(0))
  it('.macro.before ok', async () => expect((await block.macro.before(blockNumber)).data).toBeGreaterThanOrEqual(0))
  it('.macro.last ok', async () => expect((await block.macro.last(blockNumber)).data).toBeGreaterThanOrEqual(0))
  it('.macro.get ok', async () => expect((await block.macro.getByBatch(1)).data).toBeGreaterThanOrEqual(0))
  it('.isMacro ok', async () => expect(typeof ((await block.isMacro(0)).data)).toBe('boolean'))
  it('.isMicro ok', async () => expect(typeof ((await block.isMicro(0)).data)).toBe('boolean'))
  it('.election.after ok', async () => expect((await block.election.after(blockNumber)).data).toBeGreaterThanOrEqual(0))
  it('.election.before ok', async () => expect((await block.election.before(blockNumber)).data).toBeGreaterThanOrEqual(0))
  it('.election.last ok', async () => expect((await block.election.last(blockNumber)).data).toBeGreaterThanOrEqual(0))
  it('.election.get ok', async () => expect((await block.election.getByEpoch(1)).data).toBeGreaterThanOrEqual(0))
})

// ⚠️ The RPC Server needs to have the subscriptions enabled
// describe('test for subscriptions', async () => {
//   const client = await getClient()
//   it('subscribe to new full blocks', async () => {
//     const { next, close } = await client.block.subscribe({ retrieve: RetrieveBlock.FULL })
//     next(data => {
//       console.log({data})
//       expect(data).toHaveProperty('transactions')
//     })
//     close()
//   })
//   it('subscribe to new partial blocks', async () => {
//     const { next, close } = await client.block.subscribe({ retrieve: RetrieveBlock.PARTIAL })
//     next(data => expect(data).toHaveProperty('hash'))
//     close()
//   })
//   it('subscribe to new partial blocks', async () => {
//     const { next, close } = await client.block.subscribe({ retrieve: RetrieveBlock.PARTIAL, blockType: BlockSubscriptionType.ELECTION })
//     next(data => expect(data).toHaveProperty('hash'))
//     close()
//   })
//   it('subscribe to new partial blocks', async () => {
//     const { next, close } = await client.block.subscribe({ retrieve: RetrieveBlock.PARTIAL })
//     next(data => expect(data).not.toHaveProperty('transactions'))
//     close()
//   })
//   it('subscribe to new hashes blocks', async () => {
//     const { next, close } = await client.block.subscribe({ retrieve: RetrieveBlock.HASH })
//     next(data => expect(data).toBeInstanceOf(String))
//     close()
//   })
//   it('subscribe to logs', async () => {
//     const { next, close } = await client.logs.subscribe({ addresses: [] })
//     next(data => expect(data).toHaveProperty('hash'))
//     close()
//   })
//   it('subscribe to logs metadata', async () => {
//     const { next, close } = await client.logs.subscribe({ addresses: [], withMetadata: true })
//     next(data => expect(data).toHaveProperty('metadata'))
//     close()
//   })
//   // We don't test for blocks.election.subscribe since those blocks are emitted every 8 hours
// })

describe('test for batch module', async () => {
  const { batch } = await getClient()
  it('.current ok', async () => expect((await batch.current()).data).toBeGreaterThanOrEqual(0))
  it('.at ok', async () => expect((await batch.at(0)).data).toBeGreaterThanOrEqual(0))
  it('.firstBlock ok', async () => expect((await batch.firstBlock(1)).data).toBeGreaterThanOrEqual(0))
})

describe('test for epoch module', async () => {
  const { epoch } = await getClient()
  it('.current ok', async () => expect((await epoch.current()).data).toBeGreaterThanOrEqual(0))
  it('.at ok', async () => expect((await epoch.at(0)).data).toBeGreaterThanOrEqual(0))
  it('.firstBlock ok', async () => expect((await epoch.firstBlock(1)).data).toBeGreaterThanOrEqual(0))
  it('.firstBatch ok', async () => expect(typeof ((await epoch.firstBatch(65)).data)).toBe('boolean'))
})

describe('test for transaction module', async () => {
  const { transaction, block } = await getClient()

  let txs: Transaction[] = []
  let i = (await block.current()).data!

  while (txs.length === 0 && i > 0) {
    // search for last tx in the chain
    const res = await transaction.getByBlockNumber(i--)
    if (!res.data)
      throw new Error(JSON.stringify(txs))
    txs = res.data
  }

  it('.get block number ok', async () => expect(txs).toBeInstanceOf(Array))
  it('.get hash ok', async () => expect(await transaction.getByHash(txs[0].hash)).toHaveProperty('data'))

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
})

describe.skip('test for vesting module', async () => {
  // const { vesting } = await getClient();
  // TODO
})

describe.skip('test for htlc module', async () => {
  // const { htlc } = await getClient();
  // TODO
})

describe.skip('test for stakes module', async () => {
  // const { stakes } = await getClient();
  // TODO
})

describe.skip('test for staker module', async () => {
  // const { staker } = await getClient();
  // TODO
})

describe('test for inherent module', async () => {
  const { inherent, block } = await getClient()
  const { data: blockNumber, error: errorCurrent } = await block.current()
  if (errorCurrent)
    throw new Error('current block is undefined')
  it('.get blockNumber', async () => expect((await inherent.getByBlock(blockNumber)).data).toBeInstanceOf(Array))
  it('.get batchNumber', async () => expect((await inherent.getByBatch(blockNumber)).data).toBeInstanceOf(Array))
})

describe('test for validator module', async () => {
  const { validator } = await getClient()
  const validatorAddresses = (await validator.activeList()).data!
  it('.active ok', async () => expect(validatorAddresses).toBeInstanceOf(Array))
  const validatorInfo = validatorAddresses[0]
  it('.byAddress ok', async () => expect((await validator.byAddress(validatorInfo.address)).data).toHaveProperty('address'))
  it('.active metadata ok', async () => expect((await validator.activeList({ withMetadata: true })).metadata).not.toBeUndefined())
  // TODO Figure out how validator.selfNode works
  // it.only('.selfNode.address ok', async () => expect(await validator.selfNode.address()).toHaveProperty('address'));
  // TODO validator.action
  // TODO validator.setAutomaticReactivation
})

describe('test for slots module', async () => {
  const { slots, block } = await getClient()
  const currentBlock = (await block.current()).data!
  it('.current ok', async () => expect((await slots.at(currentBlock - 10)).data).haveOwnProperty('slotNumber'))
  it('.current ok offset', async () => expect((await slots.at(currentBlock - 10, { offsetOpt: 10 })).data).haveOwnProperty('slotNumber'))
  it('.current ok offset metadata', async () => expect(((await slots.at(currentBlock - 10, { offsetOpt: 10, withMetadata: true }))).metadata).not.toBeUndefined())
  it('.slashed.current ok', async () => expect((await slots.penalized.current()).data).haveOwnProperty('blockNumber'))
  it('.slashed.current metadata ok', async () => expect((await slots.penalized.current({ withMetadata: true })).metadata).not.toBeUndefined())
  it('.slashed.previous ok', async () => expect((await slots.penalized.previous()).data).haveOwnProperty('blockNumber'))
  it('.slashed.previous metadata ok', async () => expect((await slots.penalized.previous({ withMetadata: true })).metadata).not.toBeUndefined())
})

describe.skip('test for mempool module', async () => {
  // const { mempool } = await getClient()
  // TODO .info is failing
  // it('.info ok', async () => expect(await mempool.info()).toHaveProperty('size'));
  // TODO .content is failing
  // it('.content ok', async () => expect(await mempool.content()).toHaveProperty('transactions'));
})

describe('test for peers module', async () => {
  const { peers } = await getClient()
  it('.id ok', async () => expect(typeof (await peers.id()).data).toBe('string'))
  it('.count ok', async () => expect((await peers.count()).data).toBeGreaterThanOrEqual(0))
  it('.peers ok', async () => expect((await peers.peers()).data).toBeInstanceOf(Array))
  it('.consensusEstablished ok', async () => expect((await peers.consensusEstablished()).data).toBe(true))
})

describe('test for constant module', async () => {
  const { supply_at } = await getClient()
  const oneYearAgo = new Date().getTime() - 31536000000
  it('.params ok', async () => expect(Client.policy).toHaveProperty('stakingContractAddress'))
  it('.supply ok', async () => expect(((await supply_at({ genesisSupply: 100000, genesisTime: oneYearAgo, currentTime: new Date().getTime() })).data)).toBeGreaterThanOrEqual(0))
})

describe('test for zeroKnowledgeProof module', async () => {
  const { zeroKnowledgeProof } = await getClient()
  it('.state ok', async () => expect((await zeroKnowledgeProof.state()).data).toHaveProperty('latestHeaderHash'))
})
