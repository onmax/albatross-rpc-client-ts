import type { HttpClient } from '../client/http'
import type {
  MempoolInfo,
  Transaction,
} from '../types/'
import { DEFAULT_OPTIONS } from '../client/http'

export interface PushTransactionParams {
  transaction: string
  withHighPriority?: boolean
}
export interface MempoolContentParams { includeTransactions: boolean }

export class MempoolClient {
  private client: HttpClient

  constructor(http: HttpClient) {
    this.client = http
  }

  /**
   * Pushes the given serialized transaction to the local mempool
   *
   * @param params
   * @param params.transaction Serialized transaction
   * @param params.withHighPriority Whether to push the transaction with high priority
   * @returns Transaction hash
   */
  public pushTransaction(
    { transaction, withHighPriority }: PushTransactionParams,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<string>({
      method: withHighPriority
        ? 'pushHighPriorityTransaction'
        : 'pushTransaction',
      params: [transaction],
    }, options)
  }

  /**
   * Content of the mempool
   *
   * @param params
   * @param params.includeTransactions
   * @returns includeTransactions ? Transaction[] : string[]
   */
  public mempoolContent(
    { includeTransactions }: MempoolContentParams = {
      includeTransactions: false,
    },
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<
      MempoolContentParams['includeTransactions'] extends true
        ? Transaction[]
        : string[]
    >({
      method: 'mempoolContent',
      params: [includeTransactions],
    }, options)
  }

  /**
   * Obtains the mempool content in fee per byte buckets
   *
   * @params options
   * @returns Mempool content in fee per byte buckets
   */
  public mempool(options = DEFAULT_OPTIONS) {
    return this.client.call<MempoolInfo>({ method: 'mempool' }, options)
  }

  /**
   * Obtains the minimum fee per byte as per mempool configuration
   *
   * @params options
   * @returns Minimum fee per byte
   */
  public getMinFeePerByte(options = DEFAULT_OPTIONS) {
    return this.client.call</* f64 */ number>(
      { method: 'getMinFeePerByte' },
      options,
    )
  }

  /**
   * @param hash Transaction hash
   * @returns Transaction
   */
  public getTransactionFromMempool(
    hash: string,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<Transaction>({
      method: 'getTransactionFromMempool',
      params: [hash],
    }, options)
  }
}
