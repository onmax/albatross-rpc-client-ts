import type { FilterStreamFn, StreamOptions, Subscription, WebSocketManager } from '../client/web-socket'
import type { Block, LogType, MacroBlock, MicroBlock, Validator } from '../types/'
import type { BlockLog } from '../types/logs'
import { WS_DEFAULT_OPTIONS } from '../client/web-socket'
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
    url: string,
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    const options: StreamOptions = { ...WS_DEFAULT_OPTIONS, ...userOptions as StreamOptions }
    const wsClient = this.wsManager.getConnection(url)
    return wsClient.subscribe({ method: 'subscribeForHeadBlockHash' }, options) as Promise<Subscription<T>>
  }

  /**
   * Subscribes to election blocks.
   */
  public async subscribeForElectionBlocks<T = Block>(
    url: string,
    params: BlockParams = {},
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    const { retrieve = RetrieveType.Full } = params
    const options = { ...WS_DEFAULT_OPTIONS, ...userOptions, filter: isElection }
    const wsClient = this.wsManager.getConnection(url)
    return wsClient.subscribe({ method: 'subscribeForHeadBlock', params: [retrieve === RetrieveType.Full] }, options) as Promise<Subscription<T>>
  }

  /**
   * Subscribes to micro blocks.
   */
  public async subscribeForMicroBlocks<T = MicroBlock>(
    url: string,
    params: BlockParams = {},
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    const { retrieve = RetrieveType.Full } = params
    const options = { ...WS_DEFAULT_OPTIONS, ...userOptions, filter: isMicro }
    const wsClient = this.wsManager.getConnection(url)
    return wsClient.subscribe({ method: 'subscribeForHeadBlock', params: [retrieve === RetrieveType.Full] }, options) as Promise<Subscription<T>>
  }

  /**
   * Subscribes to macro blocks.
   */
  public async subscribeForMacroBlocks<T = MacroBlock>(
    url: string,
    params: BlockParams = {},
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    const { retrieve = RetrieveType.Full } = params || {}
    const options = { ...WS_DEFAULT_OPTIONS, ...userOptions, filter: isMacro }
    const wsClient = this.wsManager.getConnection(url)
    return wsClient.subscribe({ method: 'subscribeForHeadBlock', params: [retrieve === RetrieveType.Full] }, options) as Promise<Subscription<T>>
  }

  /**
   * Subscribes to all blocks.
   */
  public async subscribeForBlocks<T = Block>(
    url: string,
    params: BlockParams = {},
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    const { retrieve = RetrieveType.Full } = params
    const wsClient = this.wsManager.getConnection(url)
    return wsClient.subscribe({ method: 'subscribeForHeadBlock', params: [retrieve === RetrieveType.Full] }, { ...WS_DEFAULT_OPTIONS, ...userOptions })
  }

  /**
   * Subscribes to pre epoch validators events.
   */
  public async subscribeForValidatorElectionByAddress<T = Validator>(
    url: string,
    params: ValidatorElectionParams,
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    const wsClient = this.wsManager.getConnection(url)
    return wsClient.subscribe({ method: 'subscribeForValidatorElectionByAddress', params: [params.address], withMetadata: params?.withMetadata }, { ...WS_DEFAULT_OPTIONS, ...userOptions })
  }

  /**
   * Subscribes to log events related to a given list of addresses and log types.
   */
  public async subscribeForLogsByAddressesAndTypes<T = BlockLog>(
    url: string,
    params: LogsParams = {},
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    const { addresses = [], types = [] } = params
    const wsClient = this.wsManager.getConnection(url)
    return wsClient.subscribe({ method: 'subscribeForLogsByAddressesAndTypes', params: [addresses, types], withMetadata: params?.withMetadata }, { ...WS_DEFAULT_OPTIONS, ...userOptions })
  }

  // TODO: the server does not support this method yet
  // public async unsubscribe(subscription: number): Promise<void> {
  //   return this.ws.unsubscribe(subscription)
  // }
}
