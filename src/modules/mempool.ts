import { RawTransaction } from "../types/common";
import { RpcClient } from "./client";

export class MempoolClient extends RpcClient {
    constructor(url: string) {
        super(url);
    }

    /**
     * Pushes the given serialized transaction to the local mempool
     * 
     * @param transaction Serialized transaction
     * @returns Transaction hash
     */
    public pushTransaction(transaction: RawTransaction) {
        return super.call("pushTransaction", [transaction]);
    }

    /**
     * Pushes the given serialized transaction to the local mempool with high priority
     * 
     * @param transaction Serialized transaction
     * @returns Transaction hash
     */
    public pushHighPriorityTransaction(transaction: RawTransaction) {
        return super.call("pushHighPriorityTransaction", [transaction]);
    }

    /**
     * Content of the mempool
     * 
     * @param includeTransactions
     * @returns 
     */
    public mempoolContent(includeTransactions: boolean) {
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