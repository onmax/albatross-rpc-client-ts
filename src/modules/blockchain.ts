import { Client } from "../client/client";
import { DEFAULT_OPTIONS } from "../client/http";
import { Subscription, WS_DEFAULT_OPTIONS } from "../client/web-socket";
import { Account, Address, BatchIndex, Block, BlockNumber, Hash, Inherent, MacroBlock, MicroBlock, PartialBlock, PartialMacroBlock, PartialMicroBlock, PartialValidator, SlashedSlot, Slot, Staker, Transaction, Validator } from "../types/common";
import { LogType } from "../types/enums";
import { BlockchainState } from "../types/modules";
import { FilterStreamFn, MaybeCallResponse, MaybeStreamResponse, StreamOptions } from "../types/rpc-messages";

export type GetBlockByParams = ({ hash: Hash } | { blockNumber: BlockNumber }) & { includeTransactions?: boolean };
export type GetLatestBlockParams = { includeTransactions?: boolean };
export type GetSlotAtParams = { blockNumber: BlockNumber, offsetOpt?: number, withMetadata?: boolean };
export type GetTransactionsByAddressParams = { address: Address, max?: number, justHashes?: boolean };
export type GetTransactionByParams = { hash: Hash } | { blockNumber: BlockNumber } | { batchNumber: BatchIndex } | GetTransactionsByAddressParams;
export type GetInherentsByParams = { batchNumber: BatchIndex } | { blockNumber: BlockNumber };
export type GetAccountByAddressParams = { address: Address, withMetadata?: boolean };
export type GetValidatorByAddressParams = { address: Address, includeStakers?: boolean };
export type GetStakerByAddressParams = { address: Address };
export type SubscribeForHeadBlockParams = { retrieve: 'FULL' | 'PARTIAL', blockType?: 'MACRO' | 'MICRO' | 'ELECTION' };
export type SubscribeForHeadHashParams = { retrieve: 'HASH' };
export type SubscribeForValidatorElectionByAddressParams = { address: Address };
export type SubscribeForLogsByAddressesAndTypesParams = { addresses?: Address[], types?: LogType[] };

type WithMetadata<T> = { data: T, metadata: BlockchainState };
type ResultGetTransactionsByAddress<T extends GetTransactionsByAddressParams> = T extends { justHashes: true } ? Hash[] : Transaction[];
type ResultGetTransactionsBy<T> = T extends { hash: Hash }
    ? Transaction : T extends { address: Address }
    ? ResultGetTransactionsByAddress<T> : Transaction[]

export type SpecificBlock<T extends SubscribeForHeadBlockParams> =
    T["blockType"] extends 'MICRO'
        ? (T["retrieve"] extends 'FULL' ? MicroBlock : PartialMicroBlock)
        : (T["retrieve"] extends 'FULL' ? MacroBlock : PartialMacroBlock)

export type BlockSubscription<T extends SubscribeForHeadBlockParams | SubscribeForHeadHashParams> = Subscription<T extends SubscribeForHeadBlockParams ? SpecificBlock<T> : string>;

export class BlockchainClient extends Client {
    constructor(url: URL) {
        super(url);
    }

    /**
     * Returns the block number for the current head.
     */
    public async getBlockNumber(options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<BlockNumber>> {
        return this.call("getBlockNumber", [], options);
    }

    /**
     * Returns the batch number for the current head.
     */
    public async getBatchNumber(options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<BatchIndex>> {
        return this.call("getBatchNumber", [], options);
    }

    /**
     * Returns the epoch number for the current head.
     */
    public async getEpochNumber(options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<BatchIndex>> {
        return this.call("getEpochNumber", [], options);
    }

    /**
     * Tries to fetch a block given its hash or block number. It has an option to include the transactions in the block, which defaults to false.
     */
    public async getBlockBy<T extends GetBlockByParams>(p = { includeTransactions: false } as T, options = DEFAULT_OPTIONS):
        Promise<T extends { includeTransactions: true } ? MaybeCallResponse<Block> : MaybeCallResponse<PartialBlock>> {
        if ('hash' in p) {
            return this.call("getBlockByHash", [p.hash, p.includeTransactions], options);
        }
        return this.call("getBlockByNumber", [p.blockNumber, p.includeTransactions], options);
    }

    /**
     * Returns the block at the head of the main chain. It has an option to include the
     * transactions in the block, which defaults to false.
     */
    public async getLatestBlock<T extends GetLatestBlockParams>(p = { includeTransactions: false } as T, options = DEFAULT_OPTIONS):
        Promise<MaybeCallResponse<T extends { includeTransactions: true } ? Block : PartialBlock>> {
        return this.call("getLatestBlock", [p.includeTransactions], options);
    }

    /**
     * Returns the information for the slot owner at the given block height and offset. The
     * offset is optional, it will default to getting the offset for the existing block
     * at the given height.
     */
    public async getSlotAt<T extends GetSlotAtParams>({ blockNumber, offsetOpt, withMetadata }: T, options = DEFAULT_OPTIONS):
        Promise<MaybeCallResponse<T extends { withMetadata: true } ? WithMetadata<Slot> : Slot>> {
        return this.call("getSlotAt", [blockNumber, offsetOpt], options, withMetadata);
    }

    /**
     * Fetchs the transaction(s) given the parameters. The parameters can be a hash, a block number, a batch number or an address.
     * 
     * In case of address, it returns the latest transactions for a given address. All the transactions
     * where the given address is listed as a recipient or as a sender are considered. Reward
     * transactions are also returned. It has an option to specify the maximum number of transactions
     * to fetch, it defaults to 500.
     */
    public async getTransactionBy<T extends GetTransactionByParams>(p: T, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<ResultGetTransactionsBy<T>>> {
        if ('hash' in p) {
            return this.call("getTransactionByHash", [p.hash], options);
        } else if ('blockNumber' in p) {
            return this.call("getTransactionsByBlockNumber", [p.blockNumber], options);
        } else if ('batchNumber' in p) {
            return this.call("getTransactionsByBatchNumber", [p.batchNumber], options);
        } else if ('address' in p) {
            if (p.justHashes === true) {
                return this.call("getTransactionHashesByAddress", [p.address, p.max], options);
            } else {
                return this.call("getTransactionsByAddress", [p.address, p.max], options);
            }
        }
        throw new Error("Invalid parameters");
    }

    /**
     * Returns all the inherents (including reward inherents) for the parameter. Note
     * that this only considers blocks in the main chain.
     */
    public async getInherentsBy<T extends GetInherentsByParams>(p: T, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Inherent[]>> {
        if ('blockNumber' in p) {
            return this.call("getInherentsByBlockNumber", [p.blockNumber], options);
        } else if ('batchNumber' in p) {
            return this.call("getInherentsByBatchNumber", [p.batchNumber], options);
        }
        throw new Error("Invalid parameters");
    }

    /**
     * Tries to fetch the account at the given address.
     */
    public async getAccountBy<T extends GetAccountByAddressParams>({ address, withMetadata }: T, options = DEFAULT_OPTIONS):
        Promise<MaybeCallResponse<T extends { withMetadata: true } ? WithMetadata<Account> : Account>> {
        return this.call("getAccountByAddress", [address], options, withMetadata);
    }

    /**
    * Returns a collection of the currently active validator's addresses and balances.
    */
    public async getActiveValidators<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false } as T, options = DEFAULT_OPTIONS):
        Promise<MaybeCallResponse<T extends { withMetadata: true } ? WithMetadata<Validator[]> : Validator[]>> {
        return this.call("getActiveValidators", [], options, withMetadata);
    }

    /**
     * Returns information about the currently slashed slots. This includes slots that lost rewards
     * and that were disabled.
     */
    public async getCurrentSlashedSlots<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false } as T, options = DEFAULT_OPTIONS):
        Promise<MaybeCallResponse<T extends { withMetadata: true } ? WithMetadata<SlashedSlot[]> : SlashedSlot[]>> {
        return this.call("getCurrentSlashedSlots", [], options, withMetadata);
    }

    /**
     * Returns information about the slashed slots of the previous batch. This includes slots that
     * lost rewards and that were disabled.
     */
    public async getPreviousSlashedSlots<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false } as T, options = DEFAULT_OPTIONS):
        Promise<MaybeCallResponse<T extends { withMetadata: true } ? WithMetadata<SlashedSlot[]> : SlashedSlot[]>> {
        return this.call("getPreviousSlashedSlots", [], options, withMetadata);
    }

    /**
     * Returns information about the currently parked validators.
     */
    public async getParkedValidators<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false } as T, options = DEFAULT_OPTIONS):
        Promise<MaybeCallResponse<T extends { withMetadata: true } ? WithMetadata<{ blockNumber: BlockNumber, validators: Validator[] }> : { blockNumber: BlockNumber, validators: Validator[] }>> {
        return this.call("getParkedValidators", [], options, withMetadata);
    }

    /**
     * Tries to fetch a validator information given its address. It has an option to include a map
     * containing the addresses and stakes of all the stakers that are delegating to the validator.
     */
    public async getValidatorBy<T extends GetValidatorByAddressParams>(p = { includeStakers: false } as T, options = DEFAULT_OPTIONS):
        Promise<MaybeCallResponse<T extends { withMetadata: true }
            ? WithMetadata<T extends { includeStakers: true } ? Validator : PartialValidator>
            : T extends { includeStakers: true } ? Validator : PartialValidator>> {
        return this.call("getValidatorByAddress", [p.address, p.includeStakers], options);
    }

    /**
     * Tries to fetch a staker information given its address.
     */
    public async getStakerByAddress<T extends GetStakerByAddressParams>({ address }: T, options = DEFAULT_OPTIONS):
        Promise<MaybeCallResponse<T extends { withMetadata: true } ? WithMetadata<Staker> : Staker>> {
        return this.call("getStakerByAddress", [address], options);
    }

    /**
     * Subscribes to new block events.
     */
    public async subscribeForBlocks<
        T extends (SubscribeForHeadBlockParams | SubscribeForHeadHashParams),
        N extends T["retrieve"] extends 'HASH' ? "subscribeForHeadBlockHash" : "subscribeForHeadBlock",
        O extends StreamOptions<N>
    >(params: T, userOptions?: Partial<O>): Promise<BlockSubscription<T>> {
        if (params.retrieve === 'HASH') {
            const options: StreamOptions<"subscribeForHeadBlockHash"> = { ...WS_DEFAULT_OPTIONS, ...userOptions }
            return this.subscribe("subscribeForHeadBlockHash", [], options) as Promise<BlockSubscription<T>>
        }

        let filter: FilterStreamFn<'subscribeForHeadBlock'> | undefined = undefined;
        if (!userOptions || !userOptions.filter) {
            switch (params.blockType) {
                case 'ELECTION':
                    filter = (block) => (block as MacroBlock).isElectionBlock;
                    break;
                case 'MACRO':
                    filter = (block) => 'isElectionBlock' in block;
                    break;
                case 'MICRO':
                    filter = (block) => !('isElectionBlock' in block);
                    break;
            }
        }

        const options: StreamOptions<"subscribeForHeadBlock"> = { ...WS_DEFAULT_OPTIONS, filter, ...userOptions }

        switch (params.retrieve) {
            case 'FULL':
                return this.subscribe("subscribeForHeadBlock", [/*includeTransactions*/true], options) as Promise<BlockSubscription<T>>
            case 'PARTIAL':
                return this.subscribe("subscribeForHeadBlock", [/*includeTransactions*/false], options) as Promise<BlockSubscription<T>>
        }
    }

    /**
     * Subscribes to pre epoch validators events.
     */
    public async subscribeForValidatorElectionByAddress<
        T extends SubscribeForValidatorElectionByAddressParams,
        O extends StreamOptions<"subscribeForValidatorElectionByAddress">
    >(p: T, userOptions?: Partial<O>):
        Promise<Subscription<MaybeStreamResponse<"subscribeForValidatorElectionByAddress", O extends { withMetadata: true } ? true : false>>> {
        const options: StreamOptions<"subscribeForValidatorElectionByAddress"> = { ...WS_DEFAULT_OPTIONS, withMetadata: false, ...userOptions }
        return this.subscribe("subscribeForValidatorElectionByAddress", [p?.address], options) as
            Promise<Subscription<MaybeStreamResponse<"subscribeForValidatorElectionByAddress", O extends { withMetadata: true } ? true : false>>>;
    }

    /**
     * Subscribes to log events related to a given list of addresses and of any of the log types provided.
     * If addresses is empty it does not filter by address. If log_types is empty it won't filter by log types.
     * Thus the behavior is to assume all addresses or log_types are to be provided if the corresponding vec is empty.
     */
    public async subscribeForLogsByAddressesAndTypes<
        T extends SubscribeForLogsByAddressesAndTypesParams,
        O extends StreamOptions<"subscribeForLogsByAddressesAndTypes">
    >(p?: T, userOptions?: Partial<O>):
        Promise<Subscription<MaybeStreamResponse<"subscribeForLogsByAddressesAndTypes", O extends { withMetadata: true } ? true : false>>> {
        const options: StreamOptions<"subscribeForLogsByAddressesAndTypes"> = { ...WS_DEFAULT_OPTIONS, withMetadata: false, ...userOptions }
        return this.subscribe("subscribeForLogsByAddressesAndTypes", [p?.addresses || [], p?.types || []], options) as  Promise<Subscription<MaybeStreamResponse<"subscribeForLogsByAddressesAndTypes", O extends { withMetadata: true } ? true : false>>>;
    }
}