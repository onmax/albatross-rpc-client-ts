import type { StreamOptions, Subscription, WebSocketClient } from '../client/web-socket'
import type { Address, Block, Hash, LogType, Validator } from '../types/'
import type { BlockLog } from '../types/logs'
import { WS_DEFAULT_OPTIONS } from '../client/web-socket'

export interface BlockParams { includeBody: boolean }
export interface ValidatorElectionParams { address: Address, withMetadata?: boolean }
export interface LogsParams { addresses?: Address[], types?: LogType[], withMetadata?: boolean }

export class BlockchainStream {
  ws: WebSocketClient
  constructor(ws: WebSocketClient) {
    this.ws = ws
  }

  /**
   * Subscribes to block hash events.
   */
  public async subscribeForBlockHashes<T = Hash>(
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    const options: StreamOptions = { ...WS_DEFAULT_OPTIONS, ...userOptions as StreamOptions }
    return this.ws.subscribe({ method: 'subscribeForHeadBlockHash' }, options) as Promise<Subscription<T>>
  }

  /**
   * Subscribes to head block.
   */
  public async subscribeForHeadBlock<T = Block>(
    params: BlockParams,
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    return this.ws.subscribe({ method: 'subscribeForHeadBlock', params: [params.includeBody] }, { ...WS_DEFAULT_OPTIONS, ...userOptions })
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
    params: LogsParams = {},
    userOptions?: Partial<StreamOptions>,
  ): Promise<Subscription<T>> {
    const { addresses = [], types = [] } = params
    return this.ws.subscribe({ method: 'subscribeForLogsByAddressesAndTypes', params: [addresses, types], withMetadata: params?.withMetadata }, { ...WS_DEFAULT_OPTIONS, ...userOptions })
  }
}
