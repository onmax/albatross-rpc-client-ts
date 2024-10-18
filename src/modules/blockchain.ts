import type { HttpClient } from '../client/http'
import { DEFAULT_OPTIONS } from '../client/http'
import type {
  Account,
  Address,
  Block,
  BlockchainState,
  Inherent,
  LogType,
  PartialBlock,
  PenalizedSlots,
  Slot,
  Staker,
  Transaction,
  Validator,
} from '../types/'

export interface GetBlockByHashParams { includeBody?: boolean }
export interface GetBlockByBlockNumberParams { includeBody?: boolean }
export interface GetLatestBlockParams { includeBody?: boolean }
export interface GetSlotAtBlockParams {
  offsetOpt?: number
  withMetadata?: boolean
}
export interface GetTransactionsByAddressParams {
  max?: number
  startAt?: string
  justHashes?: boolean
}
export interface GetAccountByAddressParams { withMetadata?: boolean }
export interface GetValidatorByAddressParams { address: Address }
export interface GetStakersByAddressParams { address: Address }
export interface GetStakerByAddressParams { address: Address }
export interface SubscribeForHeadHashParams { retrieve: 'HASH' }
export interface SubscribeForValidatorElectionByAddressParams { address: Address }
export interface SubscribeForLogsByAddressesAndTypesParams {
  addresses?: Address[]
  types?: LogType[]
}

export class BlockchainClient {
  private client: HttpClient

  constructor(http: HttpClient) {
    this.client = http
  }

  /**
   * Returns the block number for the current head.
   */
  public async getBlockNumber(options = DEFAULT_OPTIONS) {
    return this.client.call<number>({ method: 'getBlockNumber' }, options)
  }

  /**
   * Returns the batch number for the current head.
   */
  public async getBatchNumber(options = DEFAULT_OPTIONS) {
    return this.client.call<number>({ method: 'getBatchNumber' }, options)
  }

  /**
   * Returns the epoch number for the current head.
   */
  public async getEpochNumber(options = DEFAULT_OPTIONS) {
    return this.client.call<number>({ method: 'getEpochNumber' }, options)
  }

  /**
   * Tries to fetch a block given its hash. It has an option to include the transactions in the block, which defaults to false.
   */
  public async getBlockByHash<T extends GetBlockByHashParams>(
    hash: string,
    p?: T,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<
      T['includeBody'] extends true ? Block : PartialBlock
    >(
      { method: 'getBlockByHash', params: [hash, p?.includeBody] },
      options,
    )
  }

  /**
   * Tries to fetch a block given its number. It has an option to include the transactions in the block, which defaults to false.
   */
  public async getBlockByNumber<T extends GetBlockByBlockNumberParams>(
    blockNumber: number,
    p?: T,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<
      T['includeBody'] extends true ? Block : PartialBlock
    >({
      method: 'getBlockByNumber',
      params: [blockNumber, p?.includeBody],
    }, options)
  }

  /**
   * Returns the block at the head of the main chain. It has an option to include the
   * transactions in the block, which defaults to false.
   */
  public async getLatestBlock<T extends GetLatestBlockParams>(
    p = { includeBody: false } as T,
    options = DEFAULT_OPTIONS,
  ) {
    const req = { method: 'getLatestBlock', params: [p.includeBody] }
    return this.client.call<
      T['includeBody'] extends true ? Block : PartialBlock
    >(req, options)
  }

  /**
   * Returns the information for the slot owner at the given block height and offset. The
   * offset is optional, it will default to getting the offset for the existing block
   * at the given height.
   */
  public async getSlotAt<T extends GetSlotAtBlockParams>(
    blockNumber: number,
    p?: T,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<Slot>({
      method: 'getSlotAt',
      params: [blockNumber, p?.offsetOpt],
      withMetadata: p?.withMetadata,
    }, options)
  }

  /**
   * Fetches the transaction(s) given the hash.
   */
  public async getTransactionByHash(hash: string, options = DEFAULT_OPTIONS) {
    return this.client.call<Transaction>({
      method: 'getTransactionByHash',
      params: [hash],
    }, options)
  }

  /**
   * Fetches the transaction(s) given the block number.
   */
  public async getTransactionsByBlockNumber(
    blockNumber: number,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<Transaction[]>({
      method: 'getTransactionsByBlockNumber',
      params: [blockNumber],
    }, options)
  }

  /**
   * Fetches the transaction(s) given the batch number.
   */
  public async getTransactionsByBatchNumber(
    batchIndex: number,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<Transaction[]>({
      method: 'getTransactionsByBatchNumber',
      params: [batchIndex],
    }, options)
  }

  /**
   * Fetches the transaction(s) given the address.
   *
   * It returns the latest transactions for a given address. All the transactions
   * where the given address is listed as a recipient or as a sender are considered. Reward
   * transactions are also returned. It has an option to specify the maximum number of transactions
   * to fetch, it defaults to 500.
   */
  public async getTransactionsByAddress<
    T extends GetTransactionsByAddressParams,
  >(
    address: Address,
    p?: T,
    options = DEFAULT_OPTIONS,
  ) {
    const req = {
      method: p?.justHashes
        ? 'getTransactionHashesByAddress'
        : 'getTransactionsByAddress',
      params: [address, p?.max, p?.startAt],
    }
    return this.client.call<
      T['justHashes'] extends true ? Transaction[] : string[]
    >(req, options)
  }

  /**
   * Returns all the inherents (including reward inherents) give the block number. Note
   * that this only considers blocks in the main chain.
   */
  public async getInherentsByBlockNumber(
    blockNumber: number,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<Inherent[]>({
      method: 'getInherentsByBlockNumber',
      params: [blockNumber],
    }, options)
  }

  /**
   * Returns all the inherents (including reward inherents) give the batch number. Note
   * that this only considers blocks in the main chain.
   */
  public async getInherentsByBatchNumber(
    batchIndex: number,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<Inherent[]>({
      method: 'getInherentsByBatchNumber',
      params: [batchIndex],
    }, options)
  }

  /**
   * Tries to fetch the account at the given address.
   */
  public async getAccountByAddress<T extends { withMetadata: boolean }>(
    address: Address,
    { withMetadata }: T,
    options = DEFAULT_OPTIONS,
  ) {
    const req = {
      method: 'getAccountByAddress',
      params: [address],
      withMetadata,
    }
    return this.client.call<
      Account,
      T['withMetadata'] extends true ? BlockchainState : undefined
    >(req, options)
  }

  /**
   * Fetches all accounts in the accounts tree.
   * IMPORTANT: This operation iterates over all accounts in the accounts tree
   * and thus is extremely computationally expensive.
   */
  public async getAccounts(options = DEFAULT_OPTIONS) {
    return this.client.call<Account[]>({
      method: 'getAccounts',
    }, options)
  }

  /**
   * Returns a collection of the currently active validator's addresses and balances.
   */
  public async getActiveValidators<T extends { withMetadata: boolean }>(
    { withMetadata }: T = { withMetadata: false } as T,
    options = DEFAULT_OPTIONS,
  ) {
    const req = { method: 'getActiveValidators', withMetadata }
    return this.client.call<
      Validator[],
      T['withMetadata'] extends true ? BlockchainState : undefined
    >(req, options)
  }

  public async getCurrentPenalizedSlots<T extends { withMetadata: boolean }>(
    { withMetadata }: T = { withMetadata: false } as T,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<PenalizedSlots[]>({
      method: 'getCurrentPenalizedSlots',
      withMetadata,
    }, options)
  }

  public async getPreviousPenalizedSlots<T extends { withMetadata: boolean }>(
    { withMetadata }: T = { withMetadata: false } as T,
    options = DEFAULT_OPTIONS,
  ) {
    const req = { method: 'getPreviousPenalizedSlots', withMetadata }
    return this.client.call<
      PenalizedSlots[],
      T['withMetadata'] extends true ? BlockchainState : undefined
    >(req, options)
  }

  /**
   * Tries to fetch a validator information given its address.
   */
  public async getValidatorByAddress(
    address: Address,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<Validator>({
      method: 'getValidatorByAddress',
      params: [address],
    }, options)
  }

  /**
   * Fetches all validators in the staking contract.
   * IMPORTANT: This operation iterates over all validators in the staking contract
   * and thus is extremely computationally expensive.
   */
  public async getValidators(options = DEFAULT_OPTIONS) {
    return this.client.call<Validator[]>({
      method: 'getValidators',
    }, options)
  }

  /**
   * Fetches all stakers for a given validator.
   * IMPORTANT: This operation iterates over all stakers of the staking contract
   * and thus is extremely computationally expensive.
   */
  public async getStakersByValidatorAddress(
    address: Address,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<Staker[]>({
      method: 'getStakersByValidatorAddress',
      params: [address],
    }, options)
  }

  /**
   * Tries to fetch a staker information given its address.
   */
  public async getStakerByAddress(address: Address, options = DEFAULT_OPTIONS) {
    return this.client.call<Staker>({
      method: 'getStakerByAddress',
      params: [address],
    }, options)
  }
}
