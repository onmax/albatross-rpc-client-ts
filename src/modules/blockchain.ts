import { DEFAULT_OPTIONS, HttpClient } from "../client/http";
import { Account, Address, BatchIndex, Block, BlockNumber, BlockchainState, EpochIndex, Hash, Inherent, PartialBlock, PartialValidator, SlashedSlot, Slot, Staker, Transaction, Validator } from "../types/common";
import { LogType } from "../types/enums";

export type GetBlockByHashParams = { includeTransactions?: boolean };
export type GetBlockByBlockNumberParams = { includeTransactions?: boolean };
export type GetLatestBlockParams = { includeTransactions?: boolean };
export type GetSlotAtBlockParams = { offsetOpt?: number, withMetadata?: boolean };
export type GetTransactionsByAddressParams = { max?: number, justHashes?: boolean };
export type GetAccountByAddressParams = { withMetadata?: boolean };
export type GetValidatorByAddressParams = { address: Address };
export type GetStakersByAddressParams = { address: Address };
export type GetStakerByAddressParams = { address: Address };
export type SubscribeForHeadHashParams = { retrieve: 'HASH' };
export type SubscribeForValidatorElectionByAddressParams = { address: Address };
export type SubscribeForLogsByAddressesAndTypesParams = { addresses?: Address[], types?: LogType[] };

export class BlockchainClient {
    private client: HttpClient;

    constructor(http: HttpClient) {
        this.client = http;
    }

    /**
     * Returns the block number for the current head.
     */
    public async getBlockNumber(options = DEFAULT_OPTIONS) {
        return this.client.call<BlockNumber>({ method: 'getBlockNumber' }, options)
    }

    /**
     * Returns the batch number for the current head.
     */
    public async getBatchNumber(options = DEFAULT_OPTIONS) {
        return this.client.call<BatchIndex>({ method: 'getBatchNumber' }, options)
    }

    /**
     * Returns the epoch number for the current head.
     */
    public async getEpochNumber(options = DEFAULT_OPTIONS) {
        return this.client.call<EpochIndex>({ method: 'getEpochNumber' }, options)
    }

    /**
     * Tries to fetch a block given its hash. It has an option to include the transactions in the block, which defaults to false.
     */
    public async getBlockByHash<T extends GetBlockByHashParams>(hash: Hash, p?: T, options = DEFAULT_OPTIONS) {
        return this.client.call<T["includeTransactions"] extends true ? Block : PartialBlock>({ method: 'getBlockByHash', params: [hash, p?.includeTransactions] }, options)
    }

    /**
     * Tries to fetch a block given its number. It has an option to include the transactions in the block, which defaults to false.
     */
    public async getBlockByNumber<T extends GetBlockByBlockNumberParams>(blockNumber: BlockNumber, p?: T, options = DEFAULT_OPTIONS) {
        return this.client.call<T["includeTransactions"] extends true ? Block : PartialBlock>({ method: 'getBlockByNumber', params: [blockNumber, p?.includeTransactions] }, options)
    }

    /**
     * Returns the block at the head of the main chain. It has an option to include the
     * transactions in the block, which defaults to false.
     */
    public async getLatestBlock<T extends GetLatestBlockParams>(p = { includeTransactions: false } as T, options = DEFAULT_OPTIONS) {
        const req = { method: 'getLatestBlock', params: [p.includeTransactions] }
        return this.client.call<T["includeTransactions"] extends true ? Block : PartialBlock>(req, options)
    }

    /**
     * Returns the information for the slot owner at the given block height and offset. The
     * offset is optional, it will default to getting the offset for the existing block
     * at the given height.
     */
    public async getSlotAt<T extends GetSlotAtBlockParams>(blockNumber: BlockNumber, p?: T, options = DEFAULT_OPTIONS) {
        return this.client.call<Slot>({ method: 'getSlotAt', params: [blockNumber, p?.offsetOpt], withMetadata: p?.withMetadata }, options)
    }

    /**
     * Fetchs the transaction(s) given the hash.
     */
    public async getTransactionByHash(hash: Hash, options = DEFAULT_OPTIONS) {
        return this.client.call<Transaction>({ method: 'getTransactionByHash', params: [hash] }, options);
    }

    /**
     * Fetchs the transaction(s) given the block number.
     */
    public async getTransactionsByBlockNumber(blockNumber: BlockNumber, options = DEFAULT_OPTIONS) {
        return this.client.call<Transaction[]>({ method: 'getTransactionsByBlockNumber', params: [blockNumber] }, options);
    }

    /**
     * Fetchs the transaction(s) given the batch number.
     */
    public async getTransactionsByBatchNumber(batchIndex: BatchIndex, options = DEFAULT_OPTIONS) {
        return this.client.call<Transaction[]>({ method: 'getTransactionsByBatchNumber', params: [batchIndex] }, options);
    }

    /**
     * Fetchs the transaction(s) given the address.
     * 
     * It returns the latest transactions for a given address. All the transactions
     * where the given address is listed as a recipient or as a sender are considered. Reward
     * transactions are also returned. It has an option to specify the maximum number of transactions
     * to fetch, it defaults to 500.
     */
    public async getTransactionsByAddress<T extends GetTransactionsByAddressParams>(address: Address, p?: T, options = DEFAULT_OPTIONS) {
        const req = { method: p?.justHashes ? 'getTransactionHashesByAddress' : 'getTransactionsByAddress', params: [address, p?.max] }
        return this.client.call<T["justHashes"] extends true ? Transaction[] : Hash[]>(req, options);
    }

    /**
     * Returns all the inherents (including reward inherents) give the block number. Note
     * that this only considers blocks in the main chain.
     */
    public async getInherentsByBlockNumber(blockNumber: BlockNumber, options = DEFAULT_OPTIONS) {
        return this.client.call<Inherent[]>({ method: 'getInherentsByBlockNumber', params: [blockNumber] }, options)
    }

    /**
     * Returns all the inherents (including reward inherents) give the batch number. Note
     * that this only considers blocks in the main chain.
     */
    public async getInherentsByBatchNumber(batchIndex: BatchIndex, options = DEFAULT_OPTIONS) {
        return this.client.call<Inherent[]>({ method: 'getInherentsByBatchNumber', params: [batchIndex] }, options)
    }

    /**
     * Tries to fetch the account at the given address.
     */
    public async getAccountByAddress<T extends { withMetadata: boolean }>(address: Address, { withMetadata }: T, options = DEFAULT_OPTIONS) {
        const req = { method: 'getAccountByAddress', params: [address], withMetadata }
        return this.client.call<Account, T["withMetadata"] extends true ? BlockchainState : undefined>(req, options)
    }

    /**
    * Returns a collection of the currently active validator's addresses and balances.
    */
    public async getActiveValidators<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false } as T, options = DEFAULT_OPTIONS) {
        const req = { method: 'getActiveValidators', withMetadata }
        return this.client.call<Validator[], T["withMetadata"] extends true ? BlockchainState : undefined>(req, options)
    }

    /**
     * Returns information about the currently slashed slots. This includes slots that lost rewards
     * and that were disabled.
     */
    public async getCurrentSlashedSlots<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false } as T, options = DEFAULT_OPTIONS) {
        return this.client.call<SlashedSlot[]>({ method: 'getCurrentSlashedSlots', withMetadata }, options)
    }

    /**
     * Returns information about the slashed slots of the previous batch. This includes slots that
     * lost rewards and that were disabled.
     */
    public async getPreviousSlashedSlots<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false } as T, options = DEFAULT_OPTIONS) {
        const req = { method: 'getPreviousSlashedSlots', withMetadata }
        return this.client.call<SlashedSlot[], T["withMetadata"] extends true ? BlockchainState : undefined>(req, options)
    }

    /**
     * Returns information about the currently parked validators.
     */
    public async getParkedValidators<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false } as T, options = DEFAULT_OPTIONS) {
        const req = { method: 'getParkedValidators', withMetadata }
        return this.client.call<{ blockNumber: BlockNumber, validators: Validator[] }, T["withMetadata"] extends true ? BlockchainState : undefined>(req, options)
    }

    /**
     * Tries to fetch a validator information given its address. It has an option to include a map
     * containing the addresses and stakes of all the stakers that are delegating to the validator.
     */
    public async getValidatorBy(address: Address, options = DEFAULT_OPTIONS) {
        return this.client.call<PartialValidator>({ method: 'getValidatorByAddress', params: [address] }, options)
    }

    /**
     * Fetches all stakers for a given validator.
     * IMPORTANT: This operation iterates over all stakers of the staking contract
     * and thus is extremely computationally expensive.
     * This function requires the read lock acquisition prior to its execution.
     */
    public async getStakersByAddress(address: Address, options = DEFAULT_OPTIONS) {
        return this.client.call<Staker[]>({ method: 'getStakersByAddress', params: [address] }, options)

    }

    /**
     * Tries to fetch a staker information given its address.
     */
    public async getStakerByAddress(address: Address, options = DEFAULT_OPTIONS) {
        return this.client.call<Staker>({ method: 'getStakerByAddress', params: [address] }, options)
    }
}
