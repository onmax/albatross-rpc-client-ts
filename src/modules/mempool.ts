import { Hash, MempoolInfo, RawTransaction, Transaction } from "../types/common";
import { Client } from "../client/client";
import { MaybeCallResponse } from "../types/rpc-messages";
import { DEFAULT_OPTIONS } from "../client/http";

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
    public pushTransaction({ transaction, withHighPriority }: PushTransactionParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        if (withHighPriority) {
            return super.call("pushHighPriorityTransaction", [transaction], options);
        } else {
            return super.call("pushTransaction", [transaction], options);
        }
    }

    /**
     * Content of the mempool
     * 
     * @param includeTransactions
     * @returns 
     */
    public mempoolContent({ includeTransactions }: MempoolContentParams = { includeTransactions: false}, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<(Hash | Transaction)[]>> {
        return super.call("mempoolContent", [includeTransactions], options);
    }

    /**
     * @returns 
     */
    public mempool(options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<MempoolInfo>> {
        return super.call("mempool", [], options);
    }

    /**
     * 
     * @returns
     */
    public getMinFeePerByte(options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<number>> {
        return super.call("getMinFeePerByte", [], options);
    }
}