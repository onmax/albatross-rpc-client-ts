import { BlockNumber } from "../types/common";
import { RpcClient } from "./client";

export class PolicyClient extends RpcClient {
    constructor(url: string) {
        super(url);
    }

    /**
     * Gets a bundle of policy constants
     */
    public async getPolicyConstants() {
        return this.call("getPolicyConstants", []);
    }

    /**
     * Gets the epoch number at a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The epoch number at the given block number (height).
     */
    public async getEpochAt(blockNumber: BlockNumber) {
        return this.call("getEpochAt", [blockNumber]);
    }

    /**
     * Gets the epoch index at a given block number. The epoch index is the number of a block relative
     * to the epoch it is in. For example, the first block of any epoch always has an epoch index of 0.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The epoch index at the given block number (height).
     */
    public async getEpochIndexAt(blockNumber: BlockNumber) {
        return this.call("getEpochIndexAt", [blockNumber]);
    }

    /**
     * Gets the batch number at a given `block_number` (height)
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The batch number at the given block number (height).
     */
    public async getBatchAt(blockNumber: BlockNumber) {
        return this.call("getBatchAt", [blockNumber]);
    }

    /**
     * Gets the batch index at a given block number. The batch index is the number of a block relative
     * to the batch it is in. For example, the first block of any batch always has an batch index of 0.
     * @param blockNumber The block number (height) to query.
     * @returns The batch index at the given block number (height). 
     */
    public async getBatchIndexAt(blockNumber: BlockNumber) {
        return this.call("getBatchIndexAt", [blockNumber]);
    }

    /**
     * Gets the number (height) of the next election macro block after a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The number (height) of the next election macro block after a given block number (height).
     */
    public async getElectionBlockAfter(blockNumber: BlockNumber) {
        return this.call("getElectionBlockAfter", [blockNumber]);
    }

    /**
     * Gets the block number (height) of the preceding election macro block before a given block number (height).
     * If the given block number is an election macro block, it returns the election macro block before it.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the preceding election macro block before a given block number (height).
     */
    public async getElectionBlockBefore(blockNumber: BlockNumber) {
        return this.call("getElectionBlockBefore", [blockNumber]);
    }

    /**
     * Gets the block number (height) of the last election macro block at a given block number (height).
     * If the given block number is an election macro block, then it returns that block number.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns 
     */
    public async getLastElectionBlock(blockNumber: BlockNumber) {
        return this.call("getLastElectionBlock", [blockNumber]);
    }

    /**
     * Gets a boolean expressing if the block at a given block number (height) is an election macro block.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the block at a given block number (height) is an election macro block.
     */
    public async getIsElectionBlockAt(blockNumber: BlockNumber) {
        return this.call("getIsElectionBlockAt", [blockNumber]);
    }

    /**
     * Gets the block number (height) of the next macro block after a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the next macro block after a given block number (height).
     */
    public async getMacroBlockAfter(blockNumber: BlockNumber) {
        return this.call("getMacroBlockAfter", [blockNumber]);
    }

    /**
     * Gets the block number (height) of the preceding macro block before a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the preceding macro block before a given block number (height).
     */
    public async getMacroBlockBefore(blockNumber: BlockNumber) {
        return this.call("getMacroBlockBefore", [blockNumber]);
    }

    /**
     * Gets the block number (height) of the last macro block at a given block number (height).
     * If the given block number is a macro block, then it returns that block number.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the last macro block at a given block number (height).
     */
    public async getLastMacroBlock(blockNumber: BlockNumber) {
        return this.call("getLastMacroBlock", [blockNumber]);
    }

    /**
     * Gets a boolean expressing if the block at a given block number (height) is a macro block.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the block at a given block number (height) is a macro block.
     */
    public async getIsMacroBlockAt(blockNumber: BlockNumber) {
        return this.call("getIsMacroBlockAt", [blockNumber]);
    }

    /**
     * Gets the block number (height) of the next micro block after a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the next micro block after a given block number (height).
     */
    public async getIsMicroBlockAt(blockNumber: BlockNumber) {
        return this.call("getIsMicroBlockAt", [blockNumber]);
    }

    /**
     * Gets the block number (height) of the first block of the given epoch (which is always a micro block).
     * 
     * @param epochIndex The epoch index to query.
     * @returns The block number (height) of the first block of the given epoch (which is always a micro block).
     */
    public async getFirstBlockOf(epochIndex: BlockNumber) {
        return this.call("getFirstBlockOf", [epochIndex]);
    }

    /**
     * Gets the block number of the first block of the given batch (which is always a micro block).
     * 
     * @param batchIndex The batch index to query.
     * @returns The block number of the first block of the given batch (which is always a micro block).
     */
    public async getFirstBlockOfBatch(batchIndex: BlockNumber) {
        return this.call("getFirstBlockOfBatch", [batchIndex]);
    }

    /**
     * Gets the block number of the election macro block of the given epoch (which is always the last block).
     * 
     * @param epochIndex The epoch index to query.
     * @returns The block number of the election macro block of the given epoch (which is always the last block).
     */
    public async getElectionBlockOf(epochIndex: BlockNumber) {
        return this.call("getElectionBlockOf", [epochIndex]);
    }

    /**
     * Gets the block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
     * 
     * @param batchIndex The batch index to query.
     * @returns The block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
     */
    public async getMacroBlockOf(batchIndex: BlockNumber) {
        return this.call("getMacroBlockOf", [batchIndex]);
    }

    /**
     * Gets a boolean expressing if the batch at a given block number (height) is the first batch
     * of the epoch.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the batch at a given block number (height) is the first batch
     */
    public async getFirstBatchOfEpoch(blockNumber: BlockNumber) {
        return this.call("getFirstBatchOfEpoch", [blockNumber]);
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
    public async getSupplyAt(genesisSupply: number, genesisTime: number, currentTime: number) {
        return this.call("getSupplyAt", [genesisSupply, genesisTime, currentTime]);
    }
}