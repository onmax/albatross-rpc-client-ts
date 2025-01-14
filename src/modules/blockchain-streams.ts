import type { FilterStreamFn, StreamOptions, Subscription, WebSocketManager } from '../client/web-socket'
import type { Block, LogType, MacroBlock, MicroBlock, Validator } from '../types/'
import type { BlockLog } from '../types/logs'
import { BlockSubscriptionType, RetrieveType } from '../types/'

export interface BlockParams { retrieve?: RetrieveType.Full | RetrieveType.Partial }
export interface ValidatorElectionParams { address: string, withMetadata?: boolean }
export interface LogsParams { addresses?: string[], types?: LogType[], withMetadata?: boolean }

function getBlockType(block: any): BlockSubscriptionType {
  if (!block)
    throw new Error('Block is undefined')
  if (!('isElectionBlock' in block))
    return BlockSubscriptionType.Micro
  if (block.isElectionBlock)
    return BlockSubscriptionType.Election
  return BlockSubscriptionType.Macro
}

const isMicro: FilterStreamFn = b => getBlockType(b) === BlockSubscriptionType.Micro
const isMacro: FilterStreamFn = b => getBlockType(b) === BlockSubscriptionType.Macro
const isElection: FilterStreamFn = b => getBlockType(b) === BlockSubscriptionType.Election

export class BlockchainStream {
  wsManager: WebSocketManager
  constructor(wsManager: WebSocketManager) {
    this.wsManager = wsManager
  }

  /**
   * Subscribes to block hash events.
   */
  public async subscribeForBlockHashes<T = string>(
    userOptions?: StreamOptions,
  ): Promise<Subscription<T>> {
    const wsClient = this.wsManager.getConnection()
    return wsClient.subscribe({ method: 'subscribeForHeadBlockHash' }, userOptions) as Promise<Subscription<T>>
  }

  /**
   * Subscribes to election blocks.
   */
  public async subscribeForElectionBlocks<T = Block>(
    params: BlockParams = {},
    userOptions?: StreamOptions,
  ): Promise<Subscription<T>> {
    const { retrieve = RetrieveType.Full } = params
    const options: StreamOptions = { ...userOptions, filter: isElection }
    const wsClient = this.wsManager.getConnection()
    return wsClient.subscribe({ method: 'subscribeForHeadBlock', params: [retrieve === RetrieveType.Full] }, options) as Promise<Subscription<T>>
  }

  /**
   * Subscribes to micro blocks.
   */
  public async subscribeForMicroBlocks<T = MicroBlock>(
    params: BlockParams = {},
    userOptions?: StreamOptions,
  ): Promise<Subscription<T>> {
    const { retrieve = RetrieveType.Full } = params
    const options = { ...userOptions, filter: isMicro }
    const wsClient = this.wsManager.getConnection()
    return wsClient.subscribe({ method: 'subscribeForHeadBlock', params: [retrieve === RetrieveType.Full] }, options) as Promise<Subscription<T>>
  }

  /**
   * Subscribes to macro blocks.
   */
  public async subscribeForMacroBlocks<T = MacroBlock>(
    params: BlockParams = {},
    userOptions?: StreamOptions,
  ): Promise<Subscription<T>> {
    const { retrieve = RetrieveType.Full } = params || {}
    const options = { ...userOptions, filter: isMacro }
    const wsClient = this.wsManager.getConnection()
    return wsClient.subscribe({ method: 'subscribeForHeadBlock', params: [retrieve === RetrieveType.Full] }, options) as Promise<Subscription<T>>
  }

  /**
   * Subscribes to all blocks.
   */
  public async subscribeForBlocks<T = Block>(
    params: BlockParams = {},
    userOptions?: StreamOptions,
  ): Promise<Subscription<T>> {
    const { retrieve = RetrieveType.Full } = params
    const wsClient = this.wsManager.getConnection()
    return wsClient.subscribe({ method: 'subscribeForHeadBlock', params: [retrieve === RetrieveType.Full] }, userOptions)
  }

  /**
   * Subscribes to pre epoch validators events.
   */
  public async subscribeForValidatorElectionByAddress<T = Validator>(
    params: ValidatorElectionParams,
    userOptions?: StreamOptions,
  ): Promise<Subscription<T>> {
    const wsClient = this.wsManager.getConnection()
    return wsClient.subscribe({ method: 'subscribeForValidatorElectionByAddress', params: [params.address], withMetadata: params?.withMetadata }, userOptions)
  }

  /**
   * Subscribes to log events related to a given list of addresses and log types.
   */
  public async subscribeForLogsByAddressesAndTypes<T = BlockLog>(
    params: LogsParams = {},
    userOptions?: StreamOptions,
  ): Promise<Subscription<T>> {
    const { addresses = [], types = [] } = params
    const wsClient = this.wsManager.getConnection()
    return wsClient.subscribe({ method: 'subscribeForLogsByAddressesAndTypes', params: [addresses, types], withMetadata: params?.withMetadata }, userOptions)
  }

  // TODO: the server does not support this method yet
  // public async unsubscribe(subscription: number): Promise<void> {
  //   return this.ws.unsubscribe(subscription)
  // }
}
