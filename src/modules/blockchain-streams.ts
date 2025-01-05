import type { FilterStreamFn, StreamOptions, Subscription, WebSocketClient } from '../client/web-socket'
import type { Block, BlockchainState, LogType, MacroBlock, MicroBlock, Validator } from '../types/'
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
  ws: WebSocketClient
  constructor(ws: WebSocketClient) {
    this.ws = ws
  }

  /**
   * Subscribes to block hash events.
   */
  public async subscribeForBlockHashes<T = string, M = undefined>(
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T, M>> {
    const options: StreamOptions = { ...WS_DEFAULT_OPTIONS, ...userOptions as StreamOptions }
    return this.ws.subscribe<T, M>({ method: 'subscribeForHeadBlockHash' }, options)
  }

  /**
   * Subscribes to election blocks.
   */
  public async subscribeForElectionBlocks<T = Block, M = undefined>(
    params: BlockParams = {},
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T, M>> {
    const { retrieve = RetrieveType.Full } = params
    const options = { ...WS_DEFAULT_OPTIONS, ...userOptions, filter: isElection }
    return this.ws.subscribe<T, M>({ method: 'subscribeForHeadBlock', params: [retrieve === RetrieveType.Full] }, options)
  }

  /**
   * Subscribes to micro blocks.
   */
  public async subscribeForMicroBlocks<T = MicroBlock, M = undefined>(
    params: BlockParams = {},
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T, M>> {
    const { retrieve = RetrieveType.Full } = params
    const options = { ...WS_DEFAULT_OPTIONS, ...userOptions, filter: isMicro }
    return this.ws.subscribe<T, M>({ method: 'subscribeForHeadBlock', params: [retrieve === RetrieveType.Full] }, options)
  }

  /**
   * Subscribes to macro blocks.
   */
  public async subscribeForMacroBlocks<T = MacroBlock, M = undefined>(
    params: BlockParams = {},
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T, M>> {
    const { retrieve = RetrieveType.Full } = params || {}
    const options = { ...WS_DEFAULT_OPTIONS, ...userOptions, filter: isMacro }
    return this.ws.subscribe<T, M>({ method: 'subscribeForHeadBlock', params: [retrieve === RetrieveType.Full] }, options)
  }

  /**
   * Subscribes to all blocks.
   */
  public async subscribeForBlocks<T = Block, M = undefined>(
    params: BlockParams = {},
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T, M>> {
    const { retrieve = RetrieveType.Full } = params
    return this.ws.subscribe<T, M>({ method: 'subscribeForHeadBlock', params: [retrieve === RetrieveType.Full] }, { ...WS_DEFAULT_OPTIONS, ...userOptions })
  }

  /**
   * Subscribes to pre epoch validators events.
   */
  public async subscribeForValidatorElectionByAddress<T = Validator, M = BlockchainState>(
    params: ValidatorElectionParams,
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T, M>> {
    return this.ws.subscribe<T, M>({ method: 'subscribeForValidatorElectionByAddress', params: [params.address] }, { ...WS_DEFAULT_OPTIONS, ...userOptions })
  }

  /**
   * Subscribes to log events related to a given list of addresses and log types.
   */
  public async subscribeForLogsByAddressesAndTypes<T = BlockLog, M = BlockchainState>(
    params: LogsParams = {},
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T, M>> {
    const { addresses = [], types = [] } = params
    return this.ws.subscribe<T, M>({ method: 'subscribeForLogsByAddressesAndTypes', params: [addresses, types] }, { ...WS_DEFAULT_OPTIONS, ...userOptions })
  }

  // TODO: the server does not support this method yet
  // public async unsubscribe(subscription: number): Promise<void> {
  //   return this.ws.unsubscribe(subscription)
  // }
}
