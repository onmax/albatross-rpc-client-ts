import type { HttpClient } from '../client/http'
import { DEFAULT_OPTIONS } from '../client/http'
import type {
  BatchIndex,
  BlockNumber,
  EpochIndex,
  PolicyConstants,
} from '../types/common'

export interface SupplyAtParams {
  genesisSupply: number
  genesisTime: number
  currentTime: number
}

export class PolicyClient {
  private client: HttpClient

  constructor(http: HttpClient) {
    this.client = http
  }

  /**
   * Gets a bundle of policy constants
   *
   * RPC method name: "getPolicyConstants"
   *
   * @param options
   */
  public async getPolicyConstants(options = DEFAULT_OPTIONS) {
    return this.client.call<PolicyConstants>(
      { method: 'getPolicyConstants' },
      options,
    )
  }

  /**
   * Returns the epoch number at a given block number (height).
   *
   * RPC method name: "getEpochAt"
   *
   * @param blockNumber
   * @param options
   */
  public async getEpochAt(blockNumber: BlockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call<EpochIndex>({
      method: 'getEpochAt',
      params: [blockNumber],
    }, options)
  }

  /**
   *  Returns the epoch index at a given block number. The epoch index is the number of a block relative
   * to the epoch it is in. For example, the first block of any epoch always has an epoch index of 0.
   *
   * RPC method name: "getEpochIndexAt"
   *
   * @param blockNumber
   * @param options
   * @returns The epoch index at a given block number.
   */
  public async getEpochIndexAt(
    blockNumber: BlockNumber,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<EpochIndex>({
      method: 'getEpochIndexAt',
      params: [blockNumber],
    }, options)
  }

  /**
   * Returns the batch number at a given `block_number` (height)
   *
   * RPC method name: "getBatchAt"
   *
   * @param blockNumber
   * @param options
   * @returns The batch number at a given `block_number` (height)
   */
  public async getBatchAt(blockNumber: BlockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call<EpochIndex>({
      method: 'getBatchAt',
      params: [blockNumber],
    }, options)
  }

  /**
   * Returns the batch index at a given block number. The batch index is the number of a block relative
   * to the batch it is in. For example, the first block of any batch always has an batch index of 0.
   *
   * RPC method name: "getBatchIndexAt"
   *
   * @param blockNumber
   * @param options
   * @returns The batch index at a given block number.
   */
  public async getBatchIndexAt(
    blockNumber: BlockNumber,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<EpochIndex>({
      method: 'getBatchIndexAt',
      params: [blockNumber],
    }, options)
  }

  /**
   * Gets the number (height) of the next election macro block after a given block number (height).
   *
   * RPC method name: "getElectionBlockAfter"
   *
   * @param blockNumber
   * @returns The number (height) of the next election macro block after a given block number (height).
   */
  public async getElectionBlockAfter(
    blockNumber: BlockNumber,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<BlockNumber>({
      method: 'getElectionBlockAfter',
      params: [blockNumber],
    }, options)
  }

  /**
   * Gets the block number (height) of the preceding election macro block before a given block number (height).
   * If the given block number is an election macro block, it returns the election macro block before it.
   *
   * RPC method name: "getElectionBlockBefore"
   *
   * @param blockNumber
   * @param options
   * @returns The block number (height) of the preceding election macro block before a given block number (height).
   */
  public async getElectionBlockBefore(
    blockNumber: BlockNumber,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<BlockNumber>({
      method: 'getElectionBlockBefore',
      params: [blockNumber],
    }, options)
  }

  /**
   * Gets the block number (height) of the last election macro block at a given block number (height).
   * If the given block number is an election macro block, then it returns that block number.
   *
   * RPC method name: "getLastElectionBlock"
   *
   * @param blockNumber
   * @param options
   * @returns The block number (height) of the last election macro block at a given block number (height).
   */
  public async getLastElectionBlock(
    blockNumber: BlockNumber,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<BlockNumber>({
      method: 'getLastElectionBlock',
      params: [blockNumber],
    }, options)
  }

  /**
   * Gets a boolean expressing if the block at a given block number (height) is an election macro block.
   *
   * RPC method name: "isElectionBlockAt"
   *
   * @param blockNumber The block number (height) to query.
   * @parm options
   * @returns A boolean expressing if the block at a given block number (height) is an election macro block.
   */
  public async isElectionBlockAt(
    blockNumber: BlockNumber,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<boolean>({
      method: 'isElectionBlockAt',
      params: [blockNumber],
    }, options)
  }

  /**
   * Gets the block number (height) of the next macro block after a given block number (height).
   *
   * RPC method name: "getMacroBlockAfter"
   *
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the next macro block after a given block number (height).
   */
  public async getMacroBlockAfter(
    blockNumber: BlockNumber,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<BlockNumber>({
      method: 'getMacroBlockAfter',
      params: [blockNumber],
    }, options)
  }

  /**
   * Gets the block number (height) of the preceding macro block before a given block number (height).
   *
   * RPC method name: "getMacroBlockBefore"
   *
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the preceding macro block before a given block number (height).
   */
  public async getMacroBlockBefore(
    blockNumber: BlockNumber,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<BlockNumber>({
      method: 'getMacroBlockBefore',
      params: [blockNumber],
    }, options)
  }

  /**
   * Gets the block number (height) of the last macro block at a given block number (height).
   * If the given block number is a macro block, then it returns that block number.
   *
   * RPC method name: "getLastMacroBlock"
   *
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the last macro block at a given block number (height).
   */
  public async getLastMacroBlock(
    blockNumber: BlockNumber,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<BlockNumber>({
      method: 'getLastMacroBlock',
      params: [blockNumber],
    }, options)
  }

  /**
   * Gets a boolean expressing if the block at a given block number (height) is a macro block.
   *
   * RPC method name: "isMacroBlockAt"
   *
   * @param blockNumber The block number (height) to query.
   * @returns A boolean expressing if the block at a given block number (height) is a macro block.
   */
  public async isMacroBlockAt(
    blockNumber: BlockNumber,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<boolean>({
      method: 'isMacroBlockAt',
      params: [blockNumber],
    }, options)
  }

  /**
   * Gets the block number (height) of the next micro block after a given block number (height).
   *
   * RPC method name: "getMicroBlockAfter"
   *
   * @param blockNumber
   * @param options
   * @returns The block number (height) of the next micro block after a given block number (height).
   */
  public async isMicroBlockAt(
    blockNumber: BlockNumber,
    options = DEFAULT_OPTIONS,
  ) {
    const req = { method: 'isMicroBlockAt', params: [blockNumber] }
    return this.client.call<boolean>(req, options)
  }

  /**
   * Gets the block number (height) of the first block of the given epoch (which is always a micro block).
   *
   * RPC method name: "getFirstBlockOf"
   *
   * @param epochIndex
   * @param options
   * @returns The block number (height) of the first block of the given epoch (which is always a micro block).
   */
  public async getFirstBlockOfEpoch(
    epochIndex: EpochIndex,
    options = DEFAULT_OPTIONS,
  ) {
    const req = { method: 'getFirstBlockOf', params: [epochIndex] }
    return this.client.call<BlockNumber>(req, options)
  }

  /**
   * Gets the block number of the first block of the given reporting window (which is always a micro block).
   * 
   * RPC method name: "get_block_after_reporting_window"
   * 
   * @param blockNumber
   * @returns The block number of the first block of the given reporting window (which is always a micro block).
   */
  public async getBlockAfterReportingWindow(
    blockNumber: BlockNumber,
    options = DEFAULT_OPTIONS,
  ) {
    const req = { method: 'getBlockAfterReportingWindow', params: [blockNumber] }
    return this.client.call<BlockNumber>(req, options)
  }

  /**
   * Gets the block number of the first block of the given jail (which is always a micro block).
   * 
   * RPC method name: "get_block_after_jail"
   * 
   * @param blockNumber
   * @returns The block number of the first block of the given jail (which is always a micro block).
   */
  public async getBlockAfterJail(
    blockNumber: BlockNumber,
    options = DEFAULT_OPTIONS,
  ) {
    const req = { method: 'getBlockAfterJail', params: [blockNumber] }
    return this.client.call<BlockNumber>(req, options)
  }

  /**
   * Gets the block number of the first block of the given batch (which is always a micro block).
   *
   * RPC method name: "getFirstBlockOfBatch"
   *
   * @param batchIndex
   * @param options
   * @returns The block number of the first block of the given batch (which is always a micro block).
   */
  public async getFirstBlockOfBatch(
    batchIndex: BatchIndex,
    options = DEFAULT_OPTIONS,
  ) {
    const req = { method: 'getFirstBlockOfBatch', params: [batchIndex] }
    return this.client.call<BlockNumber>(req, options)
  }

  /**
   * Gets the block number of the election macro block of the given epoch (which is always the last block).
   *
   * RPC method name: "getElectionBlockOf"
   *
   * @param epochIndex
   * @param options
   * @returns The block number of the election macro block of the given epoch (which is always the last block).
   */
  public async getElectionBlockOfEpoch(
    epochIndex: EpochIndex,
    options = DEFAULT_OPTIONS,
  ) {
    const req = { method: 'getElectionBlockOf', params: [epochIndex] }
    return this.client.call<BlockNumber>(req, options)
  }

  /**
   * Gets the block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
   *
   * RPC method name: "getMacroBlockOf"
   *
   * @param batchIndex
   * @param options
   * @returns The block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
   */
  public async getMacroBlockOfBatch(
    batchIndex: BatchIndex,
    options = DEFAULT_OPTIONS,
  ) {
    const req = { method: 'getMacroBlockOf', params: [batchIndex] }
    return this.client.call<BlockNumber>(req, options)
  }

  /**
   * Gets a boolean expressing if the batch at a given block number (height) is the first batch
   * of the epoch.
   *
   * RPC method name: "getFirstBatchOfEpoch"
   *
   * @param blockNumber
   * @param options
   * @returns A boolean expressing if the batch at a given block number (height) is the first batch
   */
  public async getFirstBatchOfEpoch(
    blockNumber: BlockNumber,
    options = DEFAULT_OPTIONS,
  ) {
    const req = { method: 'getFirstBatchOfEpoch', params: [blockNumber] }
    return this.client.call<BlockNumber>(req, options)
  }

  /**
   * Gets the supply at a given time (as Unix time) in Lunas (1 NIM = 100,000 Lunas). It is
   * calculated using the following formula:
   * Supply (t) = Genesis_supply + Initial_supply_velocity / Supply_decay * (1 - e^(- Supply_decay * t))
   * Where e is the exponential function, t is the time in milliseconds since the genesis block and
   * Genesis_supply is the supply at the genesis of the Nimiq 2.0 chain.
   *
   * RPC method name: "getSupplyAt"
   *
   * @param params
   * @param params.genesisSupply supply at genesis
   * @param params.genesisTime timestamp of genesis block
   * @param params.currentTime timestamp to calculate supply at
   * @returns The supply at a given time (as Unix time) in Lunas (1 NIM = 100,000 Lunas).
   */
  public async getSupplyAt(
    { genesisSupply, genesisTime, currentTime }: SupplyAtParams,
    options = DEFAULT_OPTIONS,
  ) {
    const req = {
      method: 'getSupplyAt',
      params: [genesisSupply, genesisTime, currentTime],
    }
    return this.client.call<number>(req, options)
  }
}
