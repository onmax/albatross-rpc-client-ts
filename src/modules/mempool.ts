import { Hash, MempoolInfo, RawTransaction, Transaction } from "../types/common";
import { Client } from "../client/client";
import { MaybeResponse } from "../types/rpc-messages";

type PushTransactionParams = { transaction: RawTransaction, withHighPriority?: boolean };
type MempoolContentParams = { includeTransactions: boolean };

export class MempoolClient extends Client {
    constructor(url: URL) {
        super(url);
    }

    /**
     * Pushes the given serialized transaction to the local mempool
     * 
     * @param transaction Serialized transaction
     * @returns Transaction hash
     */
    public pushTransaction({ transaction, withHighPriority }: PushTransactionParams): Promise<MaybeResponse<Hash>> {
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
    public mempoolContent({ includeTransactions }: MempoolContentParams = { includeTransactions: false}): Promise<MaybeResponse<(Hash | Transaction)[]>> {
        return super.call("mempoolContent", [includeTransactions]);
    }

    /**
     * @returns 
     */
    public mempool(): Promise<MaybeResponse<MempoolInfo>> {
        return super.call("mempool", []);
    }

    /**
     * 
     * @returns
     */
    public getMinFeePerByte(): Promise<MaybeResponse<number>> {
        return super.call("getMinFeePerByte", []);
    }
}