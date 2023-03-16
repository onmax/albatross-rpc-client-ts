import { Address, BatchIndex, BlockNumber, Hash } from "../types/common";
import { RpcClient } from "./client";

type GetBlockByNumberParams = { blockNumber: BlockNumber; includeTransactions?: boolean };
type GetBlockByHashParams = { hash: Hash; includeTransactions?: boolean };
type GetLatestBlockParams = { includeTransactions?: boolean };
type GetSlotAtParams = { blockNumber: BlockNumber, offsetOpt?: number };
type GetTransactionByHashParams = { hash: Hash };
type GetTransactionsByBlockNumberParams = { blockNumber: BlockNumber };
type GetInherentsByBlockNumberParams = { blockNumber: BlockNumber };
type GetTransactionsByBatchNumberParams = { batchNumber: BatchIndex };
type GetInherentsByBatchNumberParams = { batchNumber: BatchIndex };
type GetTransactionsByAddressParams = { address: Address, max?: number, justHashes?: boolean };
type GetAccountByAddressParams = { address: Address };
type GetValidatorByAddressParams = { address: Address, includeStakers?: boolean };
type GetStakerByAddressParams = { address: Address };
type SubscribeForHeadBlockParams = { filter: 'HASHES' | 'FULL' | 'OMIT_TRANSACTIONS' };
type SubscribeForValidatorElectionByAddressParams = { address: Address };
type SubscribeForLogsByAddressesAndTypesParams = { addresses: Address[], types: any[] };

export class BlockchainClient extends RpcClient {
    constructor(url: URL) {
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
    public async getBlockByHash({ hash, includeTransactions }: GetBlockByHashParams) {
        return this.call("getBlockByHash", [hash, includeTransactions]);
    }
    
    /**
     * Tries to fetch a block given its number. It has an option to include the transactions in the
     * block, which defaults to false. Note that this function will only fetch blocks that are part
     * of the main chain.
     */
    public async getBlockByNumber({ blockNumber, includeTransactions }: GetBlockByNumberParams) {
        return this.call("getBlockByNumber", [blockNumber, includeTransactions]);
    }
    
    /**
     * Returns the block at the head of the main chain. It has an option to include the
     * transactions in the block, which defaults to false.
     */
    public async getLatestBlock({ includeTransactions }: GetLatestBlockParams) {
        return this.call("getLatestBlock", [includeTransactions]);
    }
    
    /**
     * Returns the information for the slot owner at the given block height and offset. The
     * offset is optional, it will default to getting the offset for the existing block
     * at the given height.
     */
    public async getSlotAt({ blockNumber, offsetOpt }: GetSlotAtParams) {
        return this.call("getSlotAt", [blockNumber, offsetOpt]);
    }
    
    /**
     * Tries to fetch a transaction (including reward transactions) given its hash.
     */
    public async getTransactionByHash({ hash }: GetTransactionByHashParams) {
        return this.call("getTransactionByHash", [hash]);
    }
    
    /**
     * Returns all the transactions (including reward transactions) for the given block number. Note
     * that this only considers blocks in the main chain.
     */
    public async getTransactionsByBlockNumber({ blockNumber }: GetTransactionsByBlockNumberParams) {
        return this.call("getTransactionsByBlockNumber", [blockNumber]);
    }

    /**
     * Returns all the inherents (including reward inherents) for the given block number. Note
     * that this only considers blocks in the main chain.
     */
    public async getInherentsByBlockNumber({ blockNumber }: GetInherentsByBlockNumberParams) {
        return this.call("getInherentsByBlockNumber", [blockNumber]);
    }

    /**
     * Returns all the transactions (including reward transactions) for the given batch number. Note
     * that this only considers blocks in the main chain
     */
    public async getTransactionsByBatchNumber({ batchNumber }: GetTransactionsByBatchNumberParams) {
        return this.call("getTransactionsByBatchNumber", [batchNumber]);
    }

    /**
     * Returns all the inherents (including reward inherents) for the given batch number. Note
     * that this only considers blocks in the main chain.
     */
    public async getInherentsByBatchNumber({ batchNumber }: GetInherentsByBatchNumberParams) {
        return this.call("getInherentsByBatchNumber", [batchNumber]);
    }

    /**
     * Returns the latest transactions for a given address. All the transactions
     * where the given address is listed as a recipient or as a sender are considered. Reward
     * transactions are also returned. It has an option to specify the maximum number of transactions
     * to fetch, it defaults to 500.
     */
    public async getTransactionsByAddress({ address, max, justHashes }: GetTransactionsByAddressParams) {
        if (justHashes) {
            return this.call("getTransactionHashesByAddress", [address, max]);
        } else {
            return this.call("getTransactionsByAddress", [address, max]);
        }
    }

    /**
     * Tries to fetch the account at the given address.
     */
    public async getAccountByAddress({ address }: GetAccountByAddressParams) {
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
    public async getValidatorByAddress({ address, includeStakers: include_stakers }: GetValidatorByAddressParams) {
        return this.call("getValidatorByAddress", [address, include_stakers]);
    }

    /**
     * Tries to fetch a staker information given its address.
     */
    public async isStaker({ address }: GetStakerByAddressParams) {
        return this.call("getStakerByAddress", [address]);
    }

    /**
     * Subscribes to new block events.
     */
    public async subscribeForBlocks({ filter }: SubscribeForHeadBlockParams) {
        switch (filter) {
            case "FULL":
                return this.subscribe("subscribeForHeadBlock", [/*includeTransactions*/true]);
            case "OMIT_TRANSACTIONS":
                return this.subscribe("subscribeForHeadBlock", [/*includeTransactions*/false]);
            case "HASHES":
                return this.subscribe("subscribeForHeadBlockHash", []);
        }
    }

    /**
     * Subscribes to pre epoch validators events.
     */
    public async subscribeForValidatorElectionByAddress({ address }: SubscribeForValidatorElectionByAddressParams) {
        return this.subscribe("subscribeForValidatorElectionByAddress", [address]);
    }

    /**
     * Subscribes to log events related to a given list of addresses and of any of the log types provided.
     * If addresses is empty it does not filter by address. If log_types is empty it won't filter by log types.
     * Thus the behavior is to assume all addresses or log_types are to be provided if the corresponding vec is empty.
     */
    public async subscribeForLogsByAddressesAndTypes({ addresses, types }: SubscribeForLogsByAddressesAndTypesParams) {
        return this.subscribe("subscribeForLogsByAddressesAndTypes", [addresses, types]);
    }
}