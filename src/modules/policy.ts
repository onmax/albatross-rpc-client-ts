import { DEFAULT_OPTIONS, HttpClient } from "../client/http";
import { BatchIndex, BlockNumber, EpochIndex, PolicyConstants } from "../types/common";

type JustIndexOption = { justIndex?: boolean };
type EpochIndexOption = { epochIndex?: EpochIndex };
type BatchIndexOption = { batchIndex?: BatchIndex };
type SupplyAtParams = { genesisSupply: number, genesisTime: number, currentTime: number };

export class PolicyClient {
    private client: HttpClient;

    constructor(http: HttpClient) {
        this.client = http;
    }

    /**
     * Gets a bundle of policy constants
     */
    public async getPolicyConstants(options = DEFAULT_OPTIONS) {
        return this.client.call<PolicyConstants>({ method: 'getPolicyConstants' }, options)
    }

    /**
     * Gets the epoch number at a given `block_number` (height)
     * 
     * @param blockNumber The block number (height) to query.
     * @param justIndex The epoch index is the number of a block relative to the epoch it is in.
     * For example, the first block of any epoch always has an epoch index of 0.
     * @returns The epoch number at the given block number (height) or index
     */
    public async getEpochAt(blockNumber: BlockNumber, p?: JustIndexOption, options = DEFAULT_OPTIONS) {
        return this.client.call<EpochIndex>({ method: p?.justIndex ? 'getEpochIndexAt' : 'getEpochAt', params: [blockNumber] }, options)
    }

    /**
     * Gets the batch number at a given `block_number` (height)
     * 
     * @param blockNumber The block number (height) to query.
     * @param justIndex The batch index is the number of a block relative to the batch it is in.
     * For example, the first block of any batch always has an epoch index of 0.
     * @returns The epoch number at the given block number (height).
     */
    public async getBatchAt(batchIndex: BatchIndex, p?: JustIndexOption, options = DEFAULT_OPTIONS) {
        return this.client.call<BatchIndex>({ method: p?.justIndex ? 'getBatchIndexAt' : 'getBatchAt', params: [batchIndex] }, options)
    }

    /**
     * Gets the number (height) of the next election macro block after a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The number (height) of the next election macro block after a given block number (height).
     */
    public async getElectionBlockAfter(blockNumber: BlockNumber, options = DEFAULT_OPTIONS) {
        return this.client.call<BlockNumber>({ method: 'getElectionBlockAfter', params: [blockNumber] }, options)
    }

    /**
     * Gets the block number (height) of the preceding election macro block before a given block number (height).
     * If the given block number is an election macro block, it returns the election macro block before it.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the preceding election macro block before a given block number (height).
     */
    public async getElectionBlockBefore(blockNumber: BlockNumber, options = DEFAULT_OPTIONS) {
        return this.client.call<BlockNumber>({ method: 'getElectionBlockBefore', params: [blockNumber] }, options)
    }

    /**
     * Gets the block number (height) of the last election macro block at a given block number (height).
     * If the given block number is an election macro block, then it returns that block number.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns 
     */
    public async getLastElectionBlock(blockNumber: BlockNumber, options = DEFAULT_OPTIONS) {
        return this.client.call<BlockNumber>({ method: 'getLastElectionBlock', params: [blockNumber] }, options)
    }

    /**
     * Gets a boolean expressing if the block at a given block number (height) is an election macro block.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the block at a given block number (height) is an election macro block.
     */
    public async getIsElectionBlockAt(blockNumber: BlockNumber, options = DEFAULT_OPTIONS) {
        return this.client.call<Boolean>({ method: 'getIsElectionBlockAt', params: [blockNumber] }, options)
    }

    /**
     * Gets the block number (height) of the next macro block after a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the next macro block after a given block number (height).
     */
    public async getMacroBlockAfter(blockNumber: BlockNumber, options = DEFAULT_OPTIONS) {
        return this.client.call<BlockNumber>({ method: 'getMacroBlockAfter', params: [blockNumber] }, options)
    }

    /**
     * Gets the block number (height) of the preceding macro block before a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the preceding macro block before a given block number (height).
     */
    public async getMacroBlockBefore(blockNumber: BlockNumber, options = DEFAULT_OPTIONS) {
        return this.client.call<BlockNumber>({ method: 'getMacroBlockBefore', params: [blockNumber] }, options)
    }

    /**
     * Gets the block number (height) of the last macro block at a given block number (height).
     * If the given block number is a macro block, then it returns that block number.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the last macro block at a given block number (height).
     */
    public async getLastMacroBlock(blockNumber: BlockNumber, options = DEFAULT_OPTIONS) {
        return this.client.call<BlockNumber>({ method: 'getLastMacroBlock', params: [blockNumber] }, options)
    }



    /**
     * Gets a boolean expressing if the block at a given block number (height) is a macro block.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the block at a given block number (height) is a macro block.
     */
    public async getIsMacroBlockAt(blockNumber: BlockNumber, options = DEFAULT_OPTIONS) {
        return this.client.call<Boolean>({ method: 'getIsMacroBlockAt', params: [blockNumber] }, options)
    }

    /**
     * Gets the block number (height) of the next micro block after a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the next micro block after a given block number (height).
     */
    public async getIsMicroBlockAt(blockNumber: BlockNumber, options = DEFAULT_OPTIONS) {
        const req = { method: 'getIsMicroBlockAt', params: [blockNumber] }
        return this.client.call<Boolean>(req, options)
    }

    /**
     * Gets the block number (height) of the first block of the given epoch (which is always a micro block).
     * 
     * @param epochIndex The epoch index to query.
     * @returns The block number (height) of the first block of the given epoch (which is always a micro block).
     */
    public async getFirstBlockOf({ epochIndex }: EpochIndexOption, options = DEFAULT_OPTIONS) {
        const req = { method: 'getFirstBlockOf', params: [epochIndex] }
        return this.client.call<BlockNumber>(req, options)
    }

    /**
     * Gets the block number of the first block of the given batch (which is always a micro block).
     * 
     * @param batchIndex The batch index to query.
     * @returns The block number of the first block of the given batch (which is always a micro block).
     */
    public async getFirstBlockOfBatch({ batchIndex }: BatchIndexOption, options = DEFAULT_OPTIONS) {
        const req = { method: 'getFirstBlockOfBatch', params: [batchIndex] }
        return this.client.call<BlockNumber>(req, options)
    }

    /**
     * Gets the block number of the election macro block of the given epoch (which is always the last block).
     * 
     * @param epochIndex The epoch index to query.
     * @returns The block number of the election macro block of the given epoch (which is always the last block).
     */
    public async getElectionBlockOf({ epochIndex }: EpochIndexOption, options = DEFAULT_OPTIONS) {
        const req = { method: 'getElectionBlockOf', params: [epochIndex] }
        return this.client.call<BlockNumber>(req, options)
    }

    /**
     * Gets the block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
     * 
     * @param batchIndex The batch index to query.
     * @returns The block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
     */
    public async getMacroBlockOf({ batchIndex }: BatchIndexOption, options = DEFAULT_OPTIONS) {
        const req = { method: 'getMacroBlockOf', params: [batchIndex] }
        return this.client.call<BlockNumber>(req, options)
    }

    /**
     * Gets a boolean expressing if the batch at a given block number (height) is the first batch
     * of the epoch.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the batch at a given block number (height) is the first batch
     */
    public async getFirstBatchOfEpoch(blockNumber: BlockNumber, options = DEFAULT_OPTIONS) {
        const req = { method: 'getFirstBatchOfEpoch', params: [blockNumber] }
        return this.client.call<BlockNumber>(req, options)
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
    public async getSupplyAt({ genesisSupply, genesisTime, currentTime }: SupplyAtParams, options = DEFAULT_OPTIONS) {
        const req = { method: 'getSupplyAt', params: [genesisSupply, genesisTime, currentTime] }
        return this.client.call<number>(req, options)
    }
}
