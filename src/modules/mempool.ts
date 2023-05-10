import { DEFAULT_OPTIONS, HttpClient } from "../client/http";
import { Hash, MempoolInfo, RawTransaction, Transaction } from "../types/common";

type PushTransactionParams = { transaction: RawTransaction, withHighPriority?: boolean };
type MempoolContentParams = { includeTransactions: boolean };

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
    public pushTransaction({ transaction, withHighPriority }: PushTransactionParams, options = DEFAULT_OPTIONS) {
        return this.client.call<Hash>({ method: withHighPriority ? 'pushHighPriorityTransaction' : 'pushTransaction', params: [transaction] }, options)
    }

    /**
     * Content of the mempool
     * 
     * @param includeTransactions
     * @returns 
     */
    public mempoolContent({ includeTransactions }: MempoolContentParams = { includeTransactions: false }, options = DEFAULT_OPTIONS) {
        return this.client.call<(Hash | Transaction)[]>({ method: 'mempoolContent', params: [includeTransactions] }, options)
    }

    /**
     * @returns 
     */
    public mempool(options = DEFAULT_OPTIONS) {
        return this.client.call<MempoolInfo>({ method: 'mempool' }, options)
    }

    /**
     * 
     * @returns
     */
    public getMinFeePerByte(options = DEFAULT_OPTIONS) {
        return this.client.call</* f64 */number>({ method: 'getMinFeePerByte' }, options)
    }
}
