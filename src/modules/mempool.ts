import { type } from "os";
import { DEFAULT_OPTIONS, HttpClient } from "../client/http";
import {
  Hash,
  MempoolInfo,
  RawTransaction,
  Transaction,
} from "../types/common";

type PushTransactionParams = {
  transaction: RawTransaction;
  withHighPriority?: boolean;
};
type MempoolContentParams = { includeTransactions: boolean };
type GetTransactionFromMempoolParams = { hash: Hash };

export class MempoolClient {
  private client: HttpClient;

  constructor(http: HttpClient) {
    this.client = http;
  }

  /**
   * Pushes the given serialized transaction to the local mempool
   *
   * @param transaction Serialized transaction
   * @returns Transaction hash
   */
  public pushTransaction(
    { transaction, withHighPriority }: PushTransactionParams,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<Hash>({
      method: withHighPriority
        ? "pushHighPriorityTransaction"
        : "pushTransaction",
      params: [transaction],
    }, options);
  }

  /**
   * Content of the mempool
   *
   * @param includeTransactions
   * @returns includeTransactions ? Transaction[] : Hash[]
   */
  public mempoolContent(
    { includeTransactions }: MempoolContentParams = {
      includeTransactions: false,
    },
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<(Hash | Transaction)[]>({
      method: "mempoolContent",
      params: [includeTransactions],
    }, options);
  }

  /**
   * Obtains the mempool content in fee per byte buckets
   * @returns
   */
  public mempool(options = DEFAULT_OPTIONS) {
    return this.client.call<MempoolInfo>({ method: "mempool" }, options);
  }

  /**
   * Obtains the minimum fee per byte as per mempool configuration
   * @returns
   */
  public getMinFeePerByte(options = DEFAULT_OPTIONS) {
    return this.client.call</* f64 */ number>(
      { method: "getMinFeePerByte" },
      options,
    );
  }

  /**
   * @param hash Transaction hash
   * @returns Transaction
   */
  public getTransactionFromMempool(
    { hash }: GetTransactionFromMempoolParams,
    options = DEFAULT_OPTIONS,
  ) {
    return this.client.call<Transaction>({
      method: "getTransactionFromMempool",
      params: [hash],
    }, options);
  }
}
