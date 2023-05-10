import { CallResult, DEFAULT_OPTIONS, HttpClient } from "../client/http";
import { Account, Address, Auth, BatchIndex, Block, BlockNumber, BlockchainState, EpochIndex, Hash, Inherent, PartialBlock, PartialValidator, SlashedSlot, Slot, Staker, Transaction, Validator } from "../types/common";
import { LogType } from "../types/enums";

export type GetBlockByParams = ({ hash: Hash } | { blockNumber: BlockNumber }) & { includeTransactions?: boolean };
export type GetLatestBlockParams = { includeTransactions?: boolean };
export type GetSlotAtParams = { blockNumber: BlockNumber, offsetOpt?: number, withMetadata?: boolean };
export type GetTransactionsByAddressParams = { address: Address, max?: number, justHashes?: boolean };
export type GetTransactionByParams = { hash: Hash } | { blockNumber: BlockNumber } | { batchNumber: BatchIndex } | GetTransactionsByAddressParams;
export type GetInherentsByParams = { batchNumber: BatchIndex } | { blockNumber: BlockNumber };
export type GetAccountByAddressParams = { address: Address, withMetadata?: boolean };
export type GetValidatorByAddressParams = { address: Address };
export type GetStakersByAddressParams = { address: Address };
export type GetStakerByAddressParams = { address: Address };
export type SubscribeForHeadHashParams = { retrieve: 'HASH' };
export type SubscribeForValidatorElectionByAddressParams = { address: Address };
export type SubscribeForLogsByAddressesAndTypesParams = { addresses?: Address[], types?: LogType[] };

type TransactionBy<T extends GetTransactionByParams> = CallResult<Hash[] | BlockNumber[] | (BlockNumber | number)[], T extends { hash: Hash } ? Transaction :
    T extends GetTransactionsByAddressParams ? T["justHashes"] extends true ? Hash[] : Transaction[] :
    Transaction[]>;


export class BlockchainClient extends HttpClient {
    constructor(url: URL, auth?: Auth) {
        super(url, auth)
    }

    /**
     * Returns the block number for the current head.
     */
    public async getBlockNumber(options = DEFAULT_OPTIONS) {
        const req = { method: 'getBlockNumber', params: [] }
        return super.call<BlockNumber, typeof req>(req, options)
    }

    /**
     * Returns the batch number for the current head.
     */
    public async getBatchNumber(options = DEFAULT_OPTIONS) {
        const req = { method: 'getBatchNumber', params: [] }
        return super.call<BatchIndex, typeof req>(req, options)
    }

    /**
     * Returns the epoch number for the current head.
     */
    public async getEpochNumber(options = DEFAULT_OPTIONS) {
        const req = { method: 'getEpochNumber', params: [] }
        return super.call<EpochIndex, typeof req>(req, options)
    }

    /**
     * Tries to fetch a block given its hash or block number. It has an option to include the transactions in the block, which defaults to false.
     */
    public async getBlockBy<T extends GetBlockByParams>(p: T, options = DEFAULT_OPTIONS) {
        if ('hash' in p) {
            const req = { method: 'getBlockByHash', params: [p.hash, p.includeTransactions] }
            return super.call<T["includeTransactions"] extends true ? Block : PartialBlock, typeof req>(req, options)
        }
        const req = { method: 'getBlockByNumber', params: [p.blockNumber, p.includeTransactions] }
        return super.call<T["includeTransactions"] extends true ? Block : PartialBlock, typeof req>(req, options)
    }

    /**
     * Returns the block at the head of the main chain. It has an option to include the
     * transactions in the block, which defaults to false.
     */
    public async getLatestBlock<T extends GetLatestBlockParams>(p = { includeTransactions: false } as T, options = DEFAULT_OPTIONS) {
        const req = { method: 'getLatestBlock', params: [p.includeTransactions] }
        return super.call<T["includeTransactions"] extends true ? Block : PartialBlock, typeof req>(req, options)
    }

    /**
     * Returns the information for the slot owner at the given block height and offset. The
     * offset is optional, it will default to getting the offset for the existing block
     * at the given height.
     */
    public async getSlotAt<T extends GetSlotAtParams>({ blockNumber, offsetOpt, withMetadata }: T, options = DEFAULT_OPTIONS) {
        const req = { method: 'getSlotAt', params: [blockNumber, offsetOpt], withMetadata }
        return super.call<Slot, typeof req>(req, options)
    }

    /**
     * Fetchs the transaction(s) given the parameters. The parameters can be a hash, a block number, a batch number or an address.
     * 
     * In case of address, it returns the latest transactions for a given address. All the transactions
     * where the given address is listed as a recipient or as a sender are considered. Reward
     * transactions are also returned. It has an option to specify the maximum number of transactions
     * to fetch, it defaults to 500.
     */
    public async getTransactionBy<T extends GetTransactionByParams>(p: T, options = DEFAULT_OPTIONS) {
        if ('hash' in p) {
            const req = { method: 'getTransactionByHash', params: [p.hash] }
            return super.call(req, options) as Promise<TransactionBy<T>>
        } else if ('blockNumber' in p) {
            const req = { method: 'getTransactionsByBlockNumber', params: [p.blockNumber] }
            return super.call<Transaction[], typeof req>(req, options) as Promise<TransactionBy<T>>
        } else if ('batchNumber' in p) {
            const req = { method: 'getTransactionsByBatchNumber', params: [p.batchNumber] }
            return super.call<Transaction[], typeof req>(req, options) as Promise<TransactionBy<T>>
        } else if ('address' in p) {
            if (p.justHashes === true) {
                const req = { method: 'getTransactionHashesByAddress', params: [p.address, p.max] }
                return super.call<Hash[], typeof req>(req, options) as Promise<TransactionBy<T>>
            } else {
                const req = { method: 'getTransactionsByAddress', params: [p.address, p.max] }
                return super.call<Transaction[], typeof req>(req, options)
            }
        }
        throw new Error("Invalid parameters");
    }

    /**
     * Returns all the inherents (including reward inherents) for the parameter. Note
     * that this only considers blocks in the main chain.
     */
    public async getInherentsBy<T extends GetInherentsByParams>(p: T, options = DEFAULT_OPTIONS) {
        if ('blockNumber' in p) {
            const req = { method: 'getInherentsByBlockNumber', params: [p.blockNumber] }
            return super.call<Inherent[], typeof req>(req, options)
        } else if ('batchNumber' in p) {
            const req = { method: 'getInherentsByBatchNumber', params: [p.batchNumber] }
            return super.call<Inherent[], typeof req>(req, options)
        }
        throw new Error("Invalid parameters");
    }

    /**
     * Tries to fetch the account at the given address.
     */
    public async getAccountBy<T extends GetAccountByAddressParams>({ address, withMetadata }: T, options = DEFAULT_OPTIONS) {
        const req = { method: 'getAccountByAddress', params: [address], withMetadata }
        return super.call<Account, typeof req, T["withMetadata"] extends true ? BlockchainState : undefined>(req, options)
    }

    /**
    * Returns a collection of the currently active validator's addresses and balances.
    */
    public async getActiveValidators<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false } as T, options = DEFAULT_OPTIONS) {
        const req = { method: 'getActiveValidators', params: [], withMetadata }
        return super.call<Validator[], typeof req, T["withMetadata"] extends true ? BlockchainState : undefined>(req, options)
    }

    /**
     * Returns information about the currently slashed slots. This includes slots that lost rewards
     * and that were disabled.
     */
    public async getCurrentSlashedSlots<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false } as T, options = DEFAULT_OPTIONS) {
        const req = { method: 'getCurrentSlashedSlots', params: [], withMetadata }
        return super.call<SlashedSlot[], typeof req>(req, options)
    }

    /**
     * Returns information about the slashed slots of the previous batch. This includes slots that
     * lost rewards and that were disabled.
     */
    public async getPreviousSlashedSlots<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false } as T, options = DEFAULT_OPTIONS) {
        const req = { method: 'getPreviousSlashedSlots', params: [], withMetadata }
        return super.call<SlashedSlot[], typeof req, T["withMetadata"] extends true ? BlockchainState : undefined>(req, options)
    }

    /**
     * Returns information about the currently parked validators.
     */
    public async getParkedValidators<T extends { withMetadata: boolean }>({ withMetadata }: T = { withMetadata: false } as T, options = DEFAULT_OPTIONS) {
        const req = { method: 'getParkedValidators', params: [], withMetadata }
        return super.call<{ blockNumber: BlockNumber, validators: Validator[] }, typeof req, T["withMetadata"] extends true ? BlockchainState : undefined>(req, options)
    }

    /**
     * Tries to fetch a validator information given its address. It has an option to include a map
     * containing the addresses and stakes of all the stakers that are delegating to the validator.
     */
    public async getValidatorBy<T extends GetValidatorByAddressParams>({ address }: T, options = DEFAULT_OPTIONS) {
        const req = { method: 'getValidatorByAddress', params: [address] }
        return super.call<PartialValidator, typeof req>(req, options)
    }

    /**
     * Fetches all stakers for a given validator.
     * IMPORTANT: This operation iterates over all stakers of the staking contract
     * and thus is extremely computationally expensive.
     * This function requires the read lock acquisition prior to its execution.
     */
    public async getStakersByAddress<T extends GetStakersByAddressParams>({ address }: T, options = DEFAULT_OPTIONS) {
        const req = { method: 'getStakersByAddress', params: [address] }
        return super.call<Staker[], typeof req>(req, options)

    }

    /**
     * Tries to fetch a staker information given its address.
     */
    public async getStakerByAddress<T extends GetStakerByAddressParams>({ address }: T, options = DEFAULT_OPTIONS) {
        const req = { method: 'getStakerByAddress', params: [address] }
        return super.call<Staker, typeof req>(req, options)
    }
}
