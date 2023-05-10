import { DEFAULT_OPTIONS, HttpClient } from "../client/http";
import { Auth, Hash, MempoolInfo, RawTransaction, Transaction } from "../types/common";

type PushTransactionParams = { transaction: RawTransaction, withHighPriority?: boolean };
type MempoolContentParams = { includeTransactions: boolean };

export class MempoolClient extends HttpClient {
    constructor(url: URL, auth?: Auth) {
        super(url, auth)
    }

    /**
     * Pushes the given serialized transaction to the local mempool
     * 
     * @param transaction Serialized transaction
     * @returns Transaction hash
     */
    public pushTransaction({ transaction, withHighPriority }: PushTransactionParams, options = DEFAULT_OPTIONS) {
        if (withHighPriority) {
            const req = { method: 'pushHighPriorityTransaction', params: [transaction] }
            return super.call<Hash, typeof req>(req, options)
        } else {
            const req = { method: 'pushTransaction', params: [transaction] }
            return super.call<Hash, typeof req>(req, options)
        }
    }

    /**
     * Content of the mempool
     * 
     * @param includeTransactions
     * @returns 
     */
    public mempoolContent({ includeTransactions }: MempoolContentParams = { includeTransactions: false }, options = DEFAULT_OPTIONS) {
        const req = { method: 'mempoolContent', params: [includeTransactions] }
        return super.call<(Hash | Transaction)[], typeof req>(req, options)
    }

    /**
     * @returns 
     */
    public mempool(options = DEFAULT_OPTIONS) {
        const req = { method: 'mempool', params: [] }
        return super.call<MempoolInfo, typeof req>(req, options)
    }

    /**
     * 
     * @returns
     */
    public getMinFeePerByte(options = DEFAULT_OPTIONS) {
        const req = { method: 'getMinFeePerByte', params: [] }
        return super.call</* f64 */number, typeof req>(req, options)
    }
}
