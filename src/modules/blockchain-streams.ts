import type { FilterStreamFn, StreamOptions, Subscription, WebSocketClient } from '../client/web-socket'
import { WS_DEFAULT_OPTIONS } from '../client/web-socket'
import type { Address, Block, Hash, MacroBlock, MicroBlock, PartialBlock, Validator } from '../types/common'
import type { LogType } from '../types/enums'
import type { BlockLog } from '../types/logs'

export enum BlockSubscriptionType {
  MACRO = 'MACRO',
  MICRO = 'MICRO',
  ELECTION = 'ELECTION',
}

export enum RetrieveBlock {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  HASH = 'HASH',
}

export interface SubscribeForHeadBlockParams { retrieve: RetrieveBlock.FULL | RetrieveBlock.PARTIAL; blockType?: BlockSubscriptionType }
export interface SubscribeForHeadHashParams { retrieve: RetrieveBlock.HASH }
export interface SubscribeForValidatorElectionByAddressParams { address: Address; withMetadata?: boolean }
export interface SubscribeForLogsByAddressesAndTypesParams { addresses?: Address[]; types?: LogType[]; withMetadata?: boolean }

export class BlockchainStream {
  ws: WebSocketClient

  constructor(ws: WebSocketClient) {
    this.ws = ws
  }

  /**
   * Subscribes to new block events.
   */
  public async subscribeForBlocks<
        T extends (SubscribeForHeadBlockParams | SubscribeForHeadHashParams),
        O extends StreamOptions<T extends SubscribeForHeadBlockParams ? Block | PartialBlock : Hash>,
    >(params: T, userOptions?: Partial<O>) {
    if (params.retrieve === RetrieveBlock.HASH) {
      const options: StreamOptions<Hash> = { ...WS_DEFAULT_OPTIONS, ...userOptions as StreamOptions<Hash> }
      return this.ws.subscribe({ method: 'subscribeForHeadBlockHash' }, options) as Promise<Subscription<Hash>>
    }

    let filter: FilterStreamFn
    if (params.blockType === BlockSubscriptionType.MACRO)
      filter = (block => 'isElectionBlock' in block) as FilterStreamFn<MacroBlock>
    else if (params.blockType === BlockSubscriptionType.ELECTION)
      filter = (block => 'isElectionBlock' in block) as FilterStreamFn<MacroBlock>
    else if (params.blockType === BlockSubscriptionType.MICRO)
      filter = (block => !('isElectionBlock' in block)) as FilterStreamFn<MicroBlock>
    else
      filter = WS_DEFAULT_OPTIONS.filter as FilterStreamFn

    const optionsMacro = { ...WS_DEFAULT_OPTIONS, ...userOptions, filter }
    return this.ws.subscribe({ method: 'subscribeForHeadBlock', params: [params.retrieve === RetrieveBlock.FULL] }, optionsMacro)
  }

  /**
   * Subscribes to pre epoch validators events.
   */
  public async subscribeForValidatorElectionByAddress<
        T extends SubscribeForValidatorElectionByAddressParams,
        O extends StreamOptions<Validator>,
    >(p: T, userOptions?: Partial<O>):
  Promise<Subscription<Validator>> {
    return this.ws.subscribe({ method: 'subscribeForValidatorElectionByAddress', params: [p.address], withMetadata: p?.withMetadata }, { ...WS_DEFAULT_OPTIONS, ...userOptions })
  }

  /**
   * Subscribes to log events related to a given list of addresses and of any of the log types provided.
   * If addresses is empty it does not filter by address. If log_types is empty it won't filter by log types.
   * Thus the behavior is to assume all addresses or log_types are to be provided if the corresponding vec is empty.
   */
  public async subscribeForLogsByAddressesAndTypes<
        T extends SubscribeForLogsByAddressesAndTypesParams,
        O extends StreamOptions<BlockLog>,
    >(p: T, userOptions?: Partial<O>):
  Promise<Subscription<BlockLog>> {
    return this.ws.subscribe({ method: 'subscribeForLogsByAddressesAndTypes', params: [p?.addresses || [], p?.types || []], withMetadata: p?.withMetadata }, { ...WS_DEFAULT_OPTIONS, ...userOptions })
  }
}
