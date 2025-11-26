import { describe, expect, it } from 'vitest'
import { BlockSchema, ElectionMacroBlockSchema, MacroBlockSchema, MicroBlockSchema } from '../src/schemas'

describe('block schema validation', () => {
  const microBlock = {
    hash: 'abc123',
    size: 100,
    batch: 1,
    version: 1,
    number: 1,
    timestamp: 1234567890,
    parentHash: 'parent',
    seed: 'seed',
    extraData: '',
    stateHash: 'state',
    historyHash: 'history',
    network: 24,
    type: 'micro',
    epoch: 1,
    producer: { slotNumber: 0, validator: 'NQ00', publicKey: 'pk' },
    transactions: [],
    // Fields that must be undefined for micro blocks
    parentElectionHash: undefined,
    isElectionBlock: undefined,
    interlink: undefined,
    slots: undefined,
    nextBatchInitialPunishedSet: undefined,
  }

  const macroBlock = {
    hash: 'abc123',
    size: 100,
    batch: 1,
    version: 1,
    number: 100,
    timestamp: 1234567890,
    parentHash: 'parent',
    seed: 'seed',
    extraData: '',
    stateHash: 'state',
    historyHash: 'history',
    network: 24,
    type: 'macro',
    epoch: 1,
    parentElectionHash: 'election',
    isElectionBlock: false as const,
    transactions: [],
    lostRewardSet: [],
    disabledSet: [],
    // Fields that must be undefined for non-election macro blocks
    producer: undefined,
    equivocationProofs: undefined,
    interlink: undefined,
    slots: undefined,
    nextBatchInitialPunishedSet: undefined,
  }

  const electionBlock = {
    hash: 'abc123',
    size: 100,
    batch: 1,
    version: 1,
    number: 1000,
    timestamp: 1234567890,
    parentHash: 'parent',
    seed: 'seed',
    extraData: '',
    stateHash: 'state',
    historyHash: 'history',
    network: 24,
    type: 'macro',
    epoch: 1,
    parentElectionHash: 'election',
    isElectionBlock: true as const,
    transactions: [],
    interlink: [],
    slots: [],
    nextBatchInitialPunishedSet: [],
    lostRewardSet: [],
    disabledSet: [],
    // Fields that must be undefined for election macro blocks
    producer: undefined,
    equivocationProofs: undefined,
  }

  it('validates MicroBlock schema', () => {
    expect(microBlock).toEqual(expect.schemaMatching(MicroBlockSchema))
  })

  it('validates MacroBlock schema', () => {
    expect(macroBlock).toEqual(expect.schemaMatching(MacroBlockSchema))
  })

  it('validates ElectionMacroBlock schema', () => {
    expect(electionBlock).toEqual(expect.schemaMatching(ElectionMacroBlockSchema))
  })

  it('validates Block union schema', () => {
    expect(microBlock).toEqual(expect.schemaMatching(BlockSchema))
    expect(macroBlock).toEqual(expect.schemaMatching(BlockSchema))
    expect(electionBlock).toEqual(expect.schemaMatching(BlockSchema))
  })
})
