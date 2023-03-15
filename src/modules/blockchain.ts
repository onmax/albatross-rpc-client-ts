import { Address, BlockNumber, Hash } from "../types/common";
import { RpcClient } from "./client";

export class BlockchainClient extends RpcClient {
    constructor(url: string) {
        super(url);
    }

    /**
     * Returns the block number for the current head.
     */
    public async getBlockNumber() {
        return this.call("getBlockNumber", []);
    }

    /**
     * Returns the batch number for the current head.
     */
    public async getBatchNumber() {
        return this.call("getBatchNumber", []);
    }

    /**
     * Returns the epoch number for the current head.
     */
    public async getEpochNumber() {
        return this.call("getEpochNumber", []);
    }

    /**
     * Tries to fetch a block given its hash. It has an option to include the transactions in the block, which defaults to false.
     */
    public async getBlockByHash(hash: Hash, include_transactions?: boolean) {
        return this.call("getBlockByHash", [hash, include_transactions]);
    }
    
    /**
     * Tries to fetch a block given its number. It has an option to include the transactions in the
     * block, which defaults to false. Note that this function will only fetch blocks that are part
     * of the main chain.
     */
    public async getBlockByNumber(blockNumber: BlockNumber, include_transactions?: boolean) {
        return this.call("getBlockByNumber", [blockNumber, include_transactions]);
    }
    
    /**
     * Returns the block at the head of the main chain. It has an option to include the
     * transactions in the block, which defaults to false.
     */
    public async getLatestBlock(include_transactions?: boolean) {
        return this.call("getLatestBlock", [include_transactions]);
    }
    
    /**
     * Returns the information for the slot owner at the given block height and offset. The
     * offset is optional, it will default to getting the offset for the existing block
     * at the given height.
     */
    public async getSlotAt(blockNumber: BlockNumber, offset_opt?: number) {
        return this.call("getSlotAt", [blockNumber, offset_opt]);
    }
    
    /**
     * Tries to fetch a transaction (including reward transactions) given its hash.
     */
    public async getTransactionByHash(hash: Hash) {
        return this.call("getTransactionByHash", [hash]);
    }
    
    /**
     * Returns all the transactions (including reward transactions) for the given block number. Note
     * that this only considers blocks in the main chain.
     */
    public async getTransactionsByBlockNumber(blockNumber: BlockNumber) {
        return this.call("getTransactionsByBlockNumber", [blockNumber]);
    }

    /**
     * Returns all the inherents (including reward inherents) for the given block number. Note
     * that this only considers blocks in the main chain.
     */
    public async getInherentsByBlockNumber(blockNumber: BlockNumber) {
        return this.call("getInherentsByBlockNumber", [blockNumber]);
    }

    /**
     * Returns all the transactions (including reward transactions) for the given batch number. Note
     * that this only considers blocks in the main chain
     */
    public async getTransactionsByBatchNumber(batchNumber: number) {
        return this.call("getTransactionsByBatchNumber", [batchNumber]);
    }

    /**
     * Returns all the inherents (including reward inherents) for the given batch number. Note
     * that this only considers blocks in the main chain.
     */
    public async getInherentsByBatchNumber(batchNumber: number) {
        return this.call("getInherentsByBatchNumber", [batchNumber]);
    }

    /**
     * Returns the hashes for the latest transactions for a given address. All the transactions
     * where the given address is listed as a recipient or as a sender are considered. Reward
     * transactions are also returned. It has an option to specify the maximum number of hashes to
     * fetch, it defaults to 500.
     */
    public async getTransactionHashesByAddress(address: Address, max?: number) {
        return this.call("getTransactionHashesByAddress", [address, max]);
    }

    /**
     * Returns the latest transactions for a given address. All the transactions
     * where the given address is listed as a recipient or as a sender are considered. Reward
     * transactions are also returned. It has an option to specify the maximum number of transactions
     * to fetch, it defaults to 500.
     */
    public async getTransactionsByAddress(address: Address, max?: number) {
        return this.call("getTransactionsByAddress", [address, max]);
    }

    /**
     * Tries to fetch the account at the given address.
     */
    public async getAccountByAddress(address: Address) {
        return this.call("getAccountByAddress", [address]);
    }

     /**
     * Returns a collection of the currently active validator's addresses and balances.
     */
     public async getActiveValidators() {
        return this.call("getActiveValidators", []);
    }

    /**
     * Returns information about the currently slashed slots. This includes slots that lost rewards
     * and that were disabled.
     */
    public async getCurrentSlashedSlots() {
        return this.call("getCurrentSlashedSlots", []);
    }

    /**
     * Returns information about the slashed slots of the previous batch. This includes slots that
     * lost rewards and that were disabled.
     */
    public async getPreviousSlashedSlots() {
        return this.call("getPreviousSlashedSlots", []);
    }

    /**
     * Returns information about the currently parked validators.
     */
    public async getParkedValidators() {
        return this.call("getParkedValidators", []);
    }

    /**
     * Tries to fetch a validator information given its address. It has an option to include a map
     * containing the addresses and stakes of all the stakers that are delegating to the validator.
     */
    public async getValidatorByAddress(address: Address, include_stakers?: boolean) {
        return this.call("getValidatorByAddress", [address, include_stakers]);
    }

    /**
     * Tries to fetch a staker information given its address.
     */
    public async getStakerByAddress(address: Address) {
        return this.call("getStakerByAddress", [address]);
    }
}