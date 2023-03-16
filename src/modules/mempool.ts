import { RawTransaction } from "../types/common";
import { RpcClient } from "./client";

type PushTransactionParams = { transaction: RawTransaction, withHighPriority?: boolean };
type MempoolContentParams = { includeTransactions: boolean };

export class MempoolClient extends RpcClient {
    constructor(url: URL) {
        super(url);
    }

    /**
     * Pushes the given serialized transaction to the local mempool
     * 
     * @param transaction Serialized transaction
     * @returns Transaction hash
     */
    public pushTransaction({ transaction, withHighPriority }: PushTransactionParams) {
        if (withHighPriority) {
            return super.call("pushHighPriorityTransaction", [transaction]);
        } else {
            return super.call("pushTransaction", [transaction]);
        }
    }

    /**
     * Content of the mempool
     * 
     * @param includeTransactions
     * @returns 
     */
    public mempoolContent({ includeTransactions }: MempoolContentParams) {
        return super.call("mempoolContent", [includeTransactions]);
    }

    /**
     * @returns 
     */
    public mempool() {
        return super.call("mempool", []);
    }

    /**
     * 
     * @returns
     */
    public getMinFeePerByte() {
        return super.call("getMinFeePerByte", []);
    }
}