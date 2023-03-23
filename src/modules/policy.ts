import { BlockNumber, PolicyConstants } from "../types/common";
import { Client } from "../client/client";
import { MaybeCallResponse } from "../types/rpc-messages";
import { DEFAULT_OPTIONS } from "../client/http";

type JustBlockNumber = { blockNumber: BlockNumber };
type JustEpochIndex = { epochIndex: number };
type JustBatchIndex = { batchIndex: number };
type BlockNumberWithIndex = { blockNumber: BlockNumber, justIndex?: boolean };
type SupplyAtParams = { genesisSupply: number, genesisTime: number, currentTime: number };

export class PolicyClient extends Client {
    constructor(url: URL) {
        super(url);
    }

    /**
     * Gets a bundle of policy constants
     */
    public async getPolicyConstants(options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<PolicyConstants>> {
        return this.call("getPolicyConstants", [], options);
    }

    /**
     * Gets the epoch number at a given `block_number` (height)
     * 
     * @param blockNumber The block number (height) to query.
     * @param justIndex The epoch index is the number of a block relative to the epoch it is in.
     * For example, the first block of any epoch always has an epoch index of 0.
     * @returns The epoch number at the given block number (height) or index
     */
    public async getEpochAt({ blockNumber, justIndex }: BlockNumberWithIndex, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<number>> {
        if (justIndex) {
            return this.call("getEpochIndexAt", [blockNumber], options);
        } else {
            return this.call("getEpochAt", [blockNumber], options);
        }
    }

    /**
     * Gets the batch number at a given `block_number` (height)
     * 
     * @param blockNumber The block number (height) to query.
     * @param justIndex The batch index is the number of a block relative to the batch it is in.
     * For example, the first block of any batch always has an epoch index of 0.
     * @returns The epoch number at the given block number (height).
     */
    public async getBatchAt({ blockNumber, justIndex }: BlockNumberWithIndex, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<number>> {
        if (justIndex) {
            return this.call("getBatchIndexAt", [blockNumber], options);
        } else {
            return this.call("getBatchAt", [blockNumber], options);
        }
    }

    /**
     * Gets the number (height) of the next election macro block after a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The number (height) of the next election macro block after a given block number (height).
     */
    public async getElectionBlockAfter({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<number>> {
        return this.call("getElectionBlockAfter", [blockNumber], options);
    }

    /**
     * Gets the block number (height) of the preceding election macro block before a given block number (height).
     * If the given block number is an election macro block, it returns the election macro block before it.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the preceding election macro block before a given block number (height).
     */
    public async getElectionBlockBefore({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<number>> {
        return this.call("getElectionBlockBefore", [blockNumber], options);
    }

    /**
     * Gets the block number (height) of the last election macro block at a given block number (height).
     * If the given block number is an election macro block, then it returns that block number.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns 
     */
    public async getLastElectionBlock({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<number>> {
        return this.call("getLastElectionBlock", [blockNumber], options);
    }

    /**
     * Gets a boolean expressing if the block at a given block number (height) is an election macro block.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the block at a given block number (height) is an election macro block.
     */
    public async getIsElectionBlockAt({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Boolean>> {
        return this.call("getIsElectionBlockAt", [blockNumber], options);
    }

    /**
     * Gets the block number (height) of the next macro block after a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the next macro block after a given block number (height).
     */
    public async getMacroBlockAfter({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<number>> {
        return this.call("getMacroBlockAfter", [blockNumber], options);
    }

    /**
     * Gets the block number (height) of the preceding macro block before a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the preceding macro block before a given block number (height).
     */
    public async getMacroBlockBefore({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<number>> {
        return this.call("getMacroBlockBefore", [blockNumber], options);
    }

    /**
     * Gets the block number (height) of the last macro block at a given block number (height).
     * If the given block number is a macro block, then it returns that block number.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the last macro block at a given block number (height).
     */
    public async getLastMacroBlock({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<number>> {
        return this.call("getLastMacroBlock", [blockNumber], options);
    }

    /**
     * Gets a boolean expressing if the block at a given block number (height) is a macro block.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the block at a given block number (height) is a macro block.
     */
    public async getIsMacroBlockAt({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Boolean>> {
        return this.call("getIsMacroBlockAt", [blockNumber], options);
    }

    /**
     * Gets the block number (height) of the next micro block after a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the next micro block after a given block number (height).
     */
    public async getIsMicroBlockAt({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Boolean>> {
        return this.call("getIsMicroBlockAt", [blockNumber], options);
    }

    /**
     * Gets the block number (height) of the first block of the given epoch (which is always a micro block).
     * 
     * @param epochIndex The epoch index to query.
     * @returns The block number (height) of the first block of the given epoch (which is always a micro block).
     */
    public async getFirstBlockOf({ epochIndex }: JustEpochIndex, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<number>> {
        return this.call("getFirstBlockOf", [epochIndex], options);
    }

    /**
     * Gets the block number of the first block of the given batch (which is always a micro block).
     * 
     * @param batchIndex The batch index to query.
     * @returns The block number of the first block of the given batch (which is always a micro block).
     */
    public async getFirstBlockOfBatch({ batchIndex }: JustBatchIndex, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<number>> {
        return this.call("getFirstBlockOfBatch", [batchIndex], options);
    }

    /**
     * Gets the block number of the election macro block of the given epoch (which is always the last block).
     * 
     * @param epochIndex The epoch index to query.
     * @returns The block number of the election macro block of the given epoch (which is always the last block).
     */
    public async getElectionBlockOf({ epochIndex }: JustEpochIndex, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<number>> {
        return this.call("getElectionBlockOf", [epochIndex], options);
    }

    /**
     * Gets the block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
     * 
     * @param batchIndex The batch index to query.
     * @returns The block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
     */
    public async getMacroBlockOf({ batchIndex }: JustBatchIndex, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<number>> {
        return this.call("getMacroBlockOf", [batchIndex], options);
    }

    /**
     * Gets a boolean expressing if the batch at a given block number (height) is the first batch
     * of the epoch.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the batch at a given block number (height) is the first batch
     */
    public async getFirstBatchOfEpoch({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Boolean>> {
        return this.call("getFirstBatchOfEpoch", [blockNumber], options);
    }

    /**
     * Gets the supply at a given time (as Unix time) in Lunas (1 NIM = 100,000 Lunas). It is
     * calculated using the following formula:
     * Supply (t) = Genesis_supply + Initial_supply_velocity / Supply_decay * (1 - e^(- Supply_decay * t))
     * Where e is the exponential function, t is the time in milliseconds since the genesis block and
     * Genesis_supply is the supply at the genesis of the Nimiq 2.0 chain.
     * 
     * @param genesisSupply supply at genesis
     * @param genesisTime timestamp of genesis block
     * @param currentTime timestamp to calculate supply at
     * @returns The supply at a given time (as Unix time) in Lunas (1 NIM = 100,000 Lunas).
     */
    public async getSupplyAt({ genesisSupply, genesisTime, currentTime }: SupplyAtParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<number>> {
        return this.call("getSupplyAt", [genesisSupply, genesisTime, currentTime], options);
    }
}