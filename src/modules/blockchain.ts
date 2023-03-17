import { Account, Address, BatchIndex, BlockNumber, Hash, Inherent, MicroBlock, PartialMicroBlock, PartialValidator, SlashedSlot, Slot, Staker, Transaction, Validator } from "../types/common";
import { BlockchainState } from "../types/modules";
import { RpcResponseResult } from "../types/rpc-messages";
import { Client } from "../client/client";

type GetBlockByParams = ({ hash: Hash } | { blockNumber: BlockNumber}) & { includeTransactions?: boolean };
type GetLatestBlockParams = { includeTransactions?: boolean };
type GetSlotAtParams = { blockNumber: BlockNumber, offsetOpt?: number };
type GetTransactionsByAddressParams = { address: Address, max?: number, justHashes?: boolean };
type GetTransactionByParams = { hash: Hash } | { blockNumber: BlockNumber } | { batchNumber: BatchIndex } | GetTransactionsByAddressParams;
type GetInherentsByBatchNumberParams = { batchNumber: BatchIndex };
type GetInherentsByParams = { batchNumber: BatchIndex } | { blockNumber: BlockNumber };
type GetAccountByAddressParams = { address: Address };
type GetValidatorByAddressParams = { address: Address, includeStakers?: boolean };
type GetStakerByAddressParams = { address: Address };
type SubscribeForHeadBlockParams = { filter: 'HASHES' | 'FULL' | 'OMIT_TRANSACTIONS' };
type SubscribeForValidatorElectionByAddressParams = { address: Address };
type SubscribeForLogsByAddressesAndTypesParams = { addresses?: Address[], types?: any[] };

type WithMetadata<T> = { data: T, metadata: BlockchainState };
type ResultGetTransactionsByAddress<T extends GetTransactionsByAddressParams> = T extends { justHashes: true } ? Hash[] : Transaction[];
type ResultGetTransactionsBy<T> = Promise<T extends { hash: Hash }
? Transaction : T extends { address: Address }
    ? ResultGetTransactionsByAddress<T> : Transaction[]>
export class BlockchainClient extends Client {
    constructor(url: URL) {
        super(url);
    }

    /**
     * Returns the block number for the current head.
     */
    public async getBlockNumber(): Promise<BlockNumber> {
        return this.call("getBlockNumber", []);
    }

    /**
     * Returns the batch number for the current head.
     */
    public async getBatchNumber(): Promise<BatchIndex> {
        return this.call("getBatchNumber", []);
    }

    /**
     * Returns the epoch number for the current head.
     */
    public async getEpochNumber(): Promise<BatchIndex> {
        return this.call("getEpochNumber", []);
    }

    /**
     * Tries to fetch a block given its hash or block number. It has an option to include the transactions in the block, which defaults to false.
     */
    public async getBlockBy<T extends GetBlockByParams>(p = { includeTransactions: false } as T):
        Promise<T extends { includeTransactions: true } ? MicroBlock : PartialMicroBlock> {
            if ('hash' in p) {
                return this.call("getBlockByHash", [p.hash, p.includeTransactions]);
            }
            return this.call("getBlockByNumber", [p.blockNumber, p.includeTransactions]);
    }
    
    /**
     * Returns the block at the head of the main chain. It has an option to include the
     * transactions in the block, which defaults to false.
     */
    public async getLatestBlock<T extends GetLatestBlockParams>(p = { includeTransactions: false } as T):
        Promise<T extends { includeTransactions: true } ? MicroBlock : PartialMicroBlock> {
        return this.call("getLatestBlock", [p.includeTransactions]);
    }
    
    /**
     * Returns the information for the slot owner at the given block height and offset. The
     * offset is optional, it will default to getting the offset for the existing block
     * at the given height.
     */
    public async getSlotAt({ blockNumber, offsetOpt }: GetSlotAtParams): Promise<WithMetadata<Slot>> {
        return this.call("getSlotAt", [blockNumber, offsetOpt]);
    }

    /**
     * Fetchs the transaction(s) given the parameters. The parameters can be a hash, a block number, a batch number or an address.
     * 
     * In case of address, it returns the latest transactions for a given address. All the transactions
     * where the given address is listed as a recipient or as a sender are considered. Reward
     * transactions are also returned. It has an option to specify the maximum number of transactions
     * to fetch, it defaults to 500.
     */
    public async getTransactionBy<T extends GetTransactionByParams>(p: T): Promise<ResultGetTransactionsBy<T>> {
        if ('hash' in p) {
            return this.call("getTransactionByHash", [p.hash]) as ResultGetTransactionsBy<T>;
        } else if ('blockNumber' in p) {
            return this.call("getTransactionsByBlockNumber", [p.blockNumber]) as ResultGetTransactionsBy<T>;
        } else if ('batchNumber' in p) {
            return this.call("getTransactionsByBatchNumber", [p.batchNumber]) as ResultGetTransactionsBy<T>;
        } else if ('address' in p) {
            if (p.justHashes === true) {
                return this.call("getTransactionHashesByAddress", [p.address, p.max]) as ResultGetTransactionsBy<T>;
            } else {
                return this.call("getTransactionsByAddress", [p.address, p.max]) as ResultGetTransactionsBy<T>;
            }
        }
        throw new Error("Invalid parameters");
    }

    /**
     * Returns all the inherents (including reward inherents) for the parameter. Note
     * that this only considers blocks in the main chain.
     */
    public async getInherentsBy<T extends GetInherentsByParams>(p: T): Promise<Inherent[]> {
        if ('blockNumber' in p) {
            return this.call("getInherentsByBlockNumber", [p.blockNumber]);
        } else if ('batchNumber' in p) {
            return this.call("getInherentsByBatchNumber", [p.batchNumber]);
        }
        throw new Error("Invalid parameters");
    }

    /**
     * Tries to fetch the account at the given address.
     */
    public async getAccountByAddress({ address }: GetAccountByAddressParams): Promise<WithMetadata<Account>> {
        return this.call("getAccountByAddress", [address]);
    }

     /**
     * Returns a collection of the currently active validator's addresses and balances.
     */
     public async getActiveValidators(): Promise<WithMetadata<Validator[]>> {
        return this.call("getActiveValidators", []);
    }

    /**
     * Returns information about the currently slashed slots. This includes slots that lost rewards
     * and that were disabled.
     */
    public async getCurrentSlashedSlots(): Promise<WithMetadata<SlashedSlot[]>> {
        return this.call("getCurrentSlashedSlots", []);
    }

    /**
     * Returns information about the slashed slots of the previous batch. This includes slots that
     * lost rewards and that were disabled.
     */
    public async getPreviousSlashedSlots(): Promise<WithMetadata<SlashedSlot[]>> {
        return this.call("getPreviousSlashedSlots", []);
    }

    /**
     * Returns information about the currently parked validators.
     */
    public async getParkedValidators(): Promise<WithMetadata<{ blockNumber: BlockNumber, validators: Validator[]}>> {
        return this.call("getParkedValidators", []);
    }

    /**
     * Tries to fetch a validator information given its address. It has an option to include a map
     * containing the addresses and stakes of all the stakers that are delegating to the validator.
     */
    public async getValidatorByAddress<T extends GetValidatorByAddressParams>(p = { includeStakers: false } as T):
        Promise<WithMetadata<T extends { includeStakers: true } ? Validator : PartialValidator>> {

        return this.call("getValidatorByAddress", [p.address, p.includeStakers]);
    }

    /**
     * Tries to fetch a staker information given its address.
     */
    public async getStakerByAddress({ address }: GetStakerByAddressParams): Promise<WithMetadata<Staker>> {
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
    public async subscribeForLogsByAddressesAndTypes(p: SubscribeForLogsByAddressesAndTypesParams = { addresses: [], types: [] }) {
        return this.subscribe("subscribeForLogsByAddressesAndTypes", [p.addresses || [], p.types || []]);
    }
}