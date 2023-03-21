import { Client } from "../client/client";
import { Subscription } from "../client/web-socket";
import { Account, Address, BatchIndex, Block, BlockNumber, Hash, Inherent, PartialBlock, PartialValidator, SlashedSlot, Slot, Staker, Transaction, Validator } from "../types/common";
import { LogType } from "../types/enums";
import { BlockchainState } from "../types/modules";
import { MaybeResponse } from "../types/rpc-messages";

export type GetBlockByParams = ({ hash: Hash } | { blockNumber: BlockNumber}) & { includeTransactions?: boolean };
export type GetLatestBlockParams = { includeTransactions?: boolean };
export type GetSlotAtParams = { blockNumber: BlockNumber, offsetOpt?: number, withMetadata?: boolean };
export type GetTransactionsByAddressParams = { address: Address, max?: number, justHashes?: boolean };
export type GetTransactionByParams = { hash: Hash } | { blockNumber: BlockNumber } | { batchNumber: BatchIndex } | GetTransactionsByAddressParams;
export type GetInherentsByParams = { batchNumber: BatchIndex } | { blockNumber: BlockNumber };
export type GetAccountByAddressParams = { address: Address, withMetadata?: boolean };
export type GetValidatorByAddressParams = { address: Address, includeStakers?: boolean };
export type GetStakerByAddressParams = { address: Address };
export type SubscribeForHeadBlockParams = { filter: 'HASH' | 'FULL' | 'PARTIAL' };
export type SubscribeForValidatorElectionByAddressParams = { address: Address, withMetadata?: boolean };
export type SubscribeForLogsByAddressesAndTypesParams = { addresses?: Address[], types?: LogType[], withMetadata?: boolean };

type WithMetadata<T> = { data: T, metadata: BlockchainState };
type ResultGetTransactionsByAddress<T extends GetTransactionsByAddressParams> = T extends { justHashes: true } ? Hash[] : Transaction[];
type ResultGetTransactionsBy<T> = Promise<T extends { hash: Hash }
    ? Transaction : T extends { address: Address }
        ? ResultGetTransactionsByAddress<T> : Transaction[]>

type BlockSubscription<T extends SubscribeForHeadBlockParams> = Subscription<
    T["filter"] extends 'HASH' ? 'subscribeForHeadBlockHash' : 'subscribeForHeadBlock', false, T["filter"] extends 'FULL' ? true : false
>;
                
export class BlockchainClient extends Client {
    constructor(url: URL) {
        super(url);
    }

    /**
     * Returns the block number for the current head.
     */
    public async getBlockNumber(): Promise<MaybeResponse<BlockNumber>> {
        return this.call("getBlockNumber", []);
    }

    /**
     * Returns the batch number for the current head.
     */
    public async getBatchNumber(): Promise<MaybeResponse<BatchIndex>> {
        return this.call("getBatchNumber", []);
    }

    /**
     * Returns the epoch number for the current head.
     */
    public async getEpochNumber(): Promise<MaybeResponse<BatchIndex>> {
        return this.call("getEpochNumber", []);
    }

    /**
     * Tries to fetch a block given its hash or block number. It has an option to include the transactions in the block, which defaults to false.
     */
    public async getBlockBy<T extends GetBlockByParams>(p = { includeTransactions: false } as T):
        Promise<T extends { includeTransactions: true } ? MaybeResponse<Block> : MaybeResponse<PartialBlock>> {
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
        Promise<MaybeResponse<T extends { includeTransactions: true } ? Block : PartialBlock>> {
        return this.call("getLatestBlock", [p.includeTransactions]);
    }
    
    /**
     * Returns the information for the slot owner at the given block height and offset. The
     * offset is optional, it will default to getting the offset for the existing block
     * at the given height.
     */
    public async getSlotAt<T extends GetSlotAtParams>({ blockNumber, offsetOpt, withMetadata }: T):
        Promise<MaybeResponse<T extends { withMetadata: true } ? WithMetadata<Slot> : Slot>> {
        return this.call("getSlotAt", [blockNumber, offsetOpt], withMetadata);
    }

    /**
     * Fetchs the transaction(s) given the parameters. The parameters can be a hash, a block number, a batch number or an address.
     * 
     * In case of address, it returns the latest transactions for a given address. All the transactions
     * where the given address is listed as a recipient or as a sender are considered. Reward
     * transactions are also returned. It has an option to specify the maximum number of transactions
     * to fetch, it defaults to 500.
     */
    public async getTransactionBy<T extends GetTransactionByParams>(p: T): Promise<MaybeResponse<ResultGetTransactionsBy<T>>> {
        if ('hash' in p) {
            return this.call("getTransactionByHash", [p.hash]);
        } else if ('blockNumber' in p) {
            return this.call("getTransactionsByBlockNumber", [p.blockNumber]);
        } else if ('batchNumber' in p) {
            return this.call("getTransactionsByBatchNumber", [p.batchNumber]);
        } else if ('address' in p) {
            if (p.justHashes === true) {
                return this.call("getTransactionHashesByAddress", [p.address, p.max]);
            } else {
                return this.call("getTransactionsByAddress", [p.address, p.max]);
            }
        }
        throw new Error("Invalid parameters");
    }

    /**
     * Returns all the inherents (including reward inherents) for the parameter. Note
     * that this only considers blocks in the main chain.
     */
    public async getInherentsBy<T extends GetInherentsByParams>(p: T): Promise<MaybeResponse<Inherent[]>> {
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
    public async getAccountBy<T extends GetAccountByAddressParams>({ address, withMetadata }: T):
        Promise<MaybeResponse<T extends { withMetadata: true } ? WithMetadata<Account> : Account>> {
        return this.call("getAccountByAddress", [address], withMetadata);
    }

     /**
     * Returns a collection of the currently active validator's addresses and balances.
     */
     public async getActiveValidators<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false} as T):
        Promise<MaybeResponse<T extends { withMetadata: true } ? WithMetadata<Validator[]> : Validator[]>> {
        return this.call("getActiveValidators", [], withMetadata);
    }

    /**
     * Returns information about the currently slashed slots. This includes slots that lost rewards
     * and that were disabled.
     */
    public async getCurrentSlashedSlots<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false} as T):
        Promise<MaybeResponse<T extends { withMetadata: true } ? WithMetadata<SlashedSlot[]> : SlashedSlot[]>> {
        return this.call("getCurrentSlashedSlots", [], withMetadata);
    }

    /**
     * Returns information about the slashed slots of the previous batch. This includes slots that
     * lost rewards and that were disabled.
     */
    public async getPreviousSlashedSlots<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false} as T):
        Promise<MaybeResponse<T extends { withMetadata: true } ? WithMetadata<SlashedSlot[]> : SlashedSlot[]>> {
            return this.call("getPreviousSlashedSlots", [], withMetadata);
    }

    /**
     * Returns information about the currently parked validators.
     */
    public async getParkedValidators<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false} as T):
        Promise<MaybeResponse<T extends { withMetadata: true } ? WithMetadata<{ blockNumber: BlockNumber, validators: Validator[]}> : { blockNumber: BlockNumber, validators: Validator[]}>> {
        return this.call("getParkedValidators", [], withMetadata);
    }

    /**
     * Tries to fetch a validator information given its address. It has an option to include a map
     * containing the addresses and stakes of all the stakers that are delegating to the validator.
     */
    public async getValidatorBy<T extends GetValidatorByAddressParams>(p = { includeStakers: false } as T):
        Promise<MaybeResponse<T extends { withMetadata: true }
            ? WithMetadata<T extends { includeStakers: true } ? Validator : PartialValidator>
            :   T extends { includeStakers: true } ? Validator : PartialValidator>> {
        return this.call("getValidatorByAddress", [p.address, p.includeStakers]);
    }

    /**
     * Tries to fetch a staker information given its address.
     */
    public async getStakerByAddress<T extends GetStakerByAddressParams>({ address }: T):
        Promise<MaybeResponse<T extends { withMetadata: true } ? WithMetadata<Staker> : Staker>> {
        return this.call("getStakerByAddress", [address]);
    }

    /**
     * Subscribes to new block events.
     */
    public async subscribeForBlocks<T extends SubscribeForHeadBlockParams>({ filter }: T): Promise<BlockSubscription<T>> {
        switch (filter) {
            case "FULL":
                return this.subscribe("subscribeForHeadBlock", [/*includeTransactions*/true]) as unknown as Promise<BlockSubscription<T>>
            case "PARTIAL":
                return this.subscribe("subscribeForHeadBlock", [/*includeTransactions*/false]) as unknown as Promise<BlockSubscription<T>>
            case "HASH":
                return this.subscribe("subscribeForHeadBlockHash", []) as unknown as Promise<BlockSubscription<T>>
        }
    }

    /**
     * Subscribes to pre epoch validators events.
     */
    public async subscribeForValidatorElectionByAddress<T extends SubscribeForValidatorElectionByAddressParams>(p = { withMetadata: false } as T):
        Promise<Subscription<"subscribeForValidatorElectionByAddress", T extends { withMetadata: true } ? true : false>> {
        return this.subscribe("subscribeForValidatorElectionByAddress", [p.address], p.withMetadata);
    }

    /**
     * Subscribes to log events related to a given list of addresses and of any of the log types provided.
     * If addresses is empty it does not filter by address. If log_types is empty it won't filter by log types.
     * Thus the behavior is to assume all addresses or log_types are to be provided if the corresponding vec is empty.
     */
    public async subscribeForLogsByAddressesAndTypes<T extends SubscribeForLogsByAddressesAndTypesParams>(p = { withMetadata: false } as T):
        Promise<Subscription<"subscribeForLogsByAddressesAndTypes", T extends { withMetadata: true } ? true : false>> {
            return this.subscribe("subscribeForLogsByAddressesAndTypes", [p?.addresses || [], p?.types || []], p?.withMetadata);
    }
}