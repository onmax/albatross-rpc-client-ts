import type { CallResult, HttpOptions } from './client/http'
import { DEFAULT_OPTIONS, HttpClient } from './client/http'
import type { StreamOptions, Subscription } from './client/web-socket'
import { WebSocketClient } from './client/web-socket'
import * as Modules from './modules'
import type { Auth } from './types/common'

export class NimiqRPCClient {
  public http: HttpClient
  public ws: WebSocketClient

  public blockchain
  public blockchainStreams
  public consensus
  public mempool
  public network
  public policy
  public validator
  public wallet
  public zkpComponent

  /**
   * @param url Node URL [?secret=secret]
   * @param auth { username, password }
   */
  constructor(url: URL, auth?: Auth) {
    this.http = new HttpClient(url, auth)
    this.ws = new WebSocketClient(url, auth)

    this.blockchain = new Modules.BlockchainClient.BlockchainClient(this.http)
    this.blockchainStreams = new Modules.BlockchainStream.BlockchainStream(
      this.ws,
    )
    this.consensus = new Modules.ConsensusClient.ConsensusClient(
      this.http,
      this.blockchain,
      this.blockchainStreams,
    )
    this.mempool = new Modules.MempoolClient.MempoolClient(this.http)
    this.network = new Modules.NetworkClient.NetworkClient(this.http)
    this.policy = new Modules.PolicyClient.PolicyClient(this.http)
    this.validator = new Modules.ValidatorClient.ValidatorClient(this.http)
    this.wallet = new Modules.WalletClient.WalletClient(this.http)
    this.zkpComponent = new Modules.ZkpComponentClient.ZkpComponentClient(this.http)
  }

  /**
   * Make a raw call to the Albatross Node.
   *
   * @param request - The request object containing the following properties:
   * @param request.method - The name of the method to call.
   * @param request.params - The parameters to pass with the call, if any.
   * @param request.withMetadata - Flag indicating whether metadata should be included in the response.
   * @param options - The HTTP options for the call. Defaults to DEFAULT_OPTIONS if not provided.
   * @returns A promise that resolves with the result of the call, which includes data and optionally metadata.
   */
  async call<Data, Metadata = undefined>(
    request: { method: string, params?: any[], withMetadata?: boolean },
    options: HttpOptions = DEFAULT_OPTIONS,
  ): Promise<CallResult<Data, Metadata>> {
    return this.http.call<Data, Metadata>(request, options)
  }

  /**
   * Make a raw streaming call to the Albatross Node.
   *
   * @param request
   * @param userOptions
   * @returns A promise that resolves with a Subscription object.
   */
  async subscribe<
    Data,
    Request extends { method: string, params?: any[], withMetadata?: boolean },
  >(
    request: Request,
    userOptions: StreamOptions,
  ): Promise<Subscription<Data>> {
    return this.ws.subscribe<Data, Request>(request, userOptions)
  }
}
export * from './client/http'
export * from './client/web-socket'
export * from './modules'
export * from './types/common'
export * from './types/logs'
