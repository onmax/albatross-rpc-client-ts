import type { CallResult, HttpOptions } from './client/http'
import type { StreamOptions, Subscription } from './client/web-socket'
import type { Auth } from './types/'
import { DEFAULT_OPTIONS, HttpClient } from './client/http'
import { WebSocketManager } from './client/web-socket'
import * as Modules from './modules'

export class NimiqRPCClient {
  public http: HttpClient
  public ws: WebSocketManager

  public blockchain
  public blockchainStreams: Modules.BlockchainStream.BlockchainStream
  public consensus
  public mempool
  public network
  public policy
  public validator
  public wallet
  public zkpComponent

  /**
   * @param url Node URL
   * @param auth { username, password }
   */
  constructor(url: URL | string, auth?: Auth) {
    this.http = new HttpClient(url, auth)
    this.ws = new WebSocketManager(url, auth)

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
    return this.ws.getConnection().subscribe<Data, Request>(request, userOptions)
  }
}

let client: NimiqRPCClient
export function createClient(url: URL | string, auth?: Auth) {
  if (client)
    return client
  client = new NimiqRPCClient(url, auth)
  return client
}

export * from './client/http'
export * from './client/web-socket'
export * from './modules'
export * from './types/'
export * from './types/logs'
