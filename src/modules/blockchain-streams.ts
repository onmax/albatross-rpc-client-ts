import type { FilterStreamFn, StreamOptions, Subscription, WebSocketClient } from '../client/web-socket'
import { WS_DEFAULT_OPTIONS } from '../client/web-socket'
import type { Address, Block, Hash, LogType, MacroBlock, MicroBlock, Validator } from '../types/common'
import { BlockSubscriptionType, RetrieveType } from '../types/common'
import type { BlockLog } from '../types/logs'

export interface BlockParams { retrieve: RetrieveType.Full | RetrieveType.Partial }
export interface BlockHashParams { retrieve: RetrieveType.Hash }
export interface ValidatorElectionParams { address: Address, withMetadata?: boolean }
export interface LogsParams { addresses?: Address[], types?: LogType[], withMetadata?: boolean }

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
  public async subscribeForBlockHashes<T = Hash>(
    params: BlockHashParams,
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    const options: StreamOptions = { ...WS_DEFAULT_OPTIONS, ...userOptions as StreamOptions }
    return this.ws.subscribe({ method: 'subscribeForHeadBlockHash' }, options) as Promise<Subscription<T>>
  }

  /**
   * Subscribes to election blocks.
   */
  public async subscribeForElectionBlocks<T = Block>(
    params: BlockParams,
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    const options = { ...WS_DEFAULT_OPTIONS, ...userOptions, filter: isElection }
    return this.ws.subscribe({ method: 'subscribeForHeadBlock', params: [params.retrieve === RetrieveType.Full] }, options) as Promise<Subscription<T>>
  }

  /**
   * Subscribes to micro blocks.
   */
  public async subscribeForMicroBlocks<T = MicroBlock>(
    params: BlockParams,
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    const options = { ...WS_DEFAULT_OPTIONS, ...userOptions, filter: isMicro }
    return this.ws.subscribe({ method: 'subscribeForHeadBlock', params: [params.retrieve === RetrieveType.Full] }, options) as Promise<Subscription<T>>
  }

  /**
   * Subscribes to macro blocks.
   */
  public async subscribeForMacroBlocks<T = MacroBlock>(
    params: BlockParams,
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    const options = { ...WS_DEFAULT_OPTIONS, ...userOptions, filter: isMacro }
    return this.ws.subscribe({ method: 'subscribeForHeadBlock', params: [params.retrieve === RetrieveType.Full] }, options) as Promise<Subscription<T>>
  }

  /**
   * Subscribes to pre epoch validators events.
   */
  public async subscribeForValidatorElectionByAddress<T = Validator>(
    params: ValidatorElectionParams,
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    return this.ws.subscribe({ method: 'subscribeForValidatorElectionByAddress', params: [params.address], withMetadata: params?.withMetadata }, { ...WS_DEFAULT_OPTIONS, ...userOptions })
  }

  /**
   * Subscribes to log events related to a given list of addresses and log types.
   */
  public async subscribeForLogsByAddressesAndTypes<T = BlockLog>(
    params: LogsParams,
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    return this.ws.subscribe({ method: 'subscribeForLogsByAddressesAndTypes', params: [params?.addresses || [], params?.types || []], withMetadata: params?.withMetadata }, { ...WS_DEFAULT_OPTIONS, ...userOptions })
  }
}
