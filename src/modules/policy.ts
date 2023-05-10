import { DEFAULT_OPTIONS, HttpClient } from "../client/http";
import { Auth, BatchIndex, BlockNumber, EpochIndex, PolicyConstants } from "../types/common";

type JustBlockNumber = { blockNumber: BlockNumber };
type JustEpochIndex = { epochIndex: EpochIndex };
type JustBatchIndex = { batchIndex: BatchIndex };
type BlockNumberWithIndex = { blockNumber: BlockNumber, justIndex?: boolean };
type SupplyAtParams = { genesisSupply: number, genesisTime: number, currentTime: number };

export class PolicyClient extends HttpClient {
    constructor(url: URL, auth?: Auth) {
        super(url, auth)
    }

    /**
     * Gets a bundle of policy constants
     */
    public async getPolicyConstants(options = DEFAULT_OPTIONS) {
        const req = { method: 'getPolicyConstants', params: [] }
        return super.call<PolicyConstants, typeof req>(req, options)
    }

    /**
     * Gets the epoch number at a given `block_number` (height)
     * 
     * @param blockNumber The block number (height) to query.
     * @param justIndex The epoch index is the number of a block relative to the epoch it is in.
     * For example, the first block of any epoch always has an epoch index of 0.
     * @returns The epoch number at the given block number (height) or index
     */
    public async getEpochAt({ blockNumber, justIndex }: BlockNumberWithIndex, options = DEFAULT_OPTIONS) {
        if (justIndex) {
            const req = { method: 'getEpochIndexAt', params: [blockNumber] }
            return super.call<EpochIndex, typeof req>(req, options)
        } else {
            const req = { method: 'getEpochAt', params: [blockNumber] }
            return super.call<EpochIndex, typeof req>(req, options)
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
    public async getBatchAt({ blockNumber, justIndex }: BlockNumberWithIndex, options = DEFAULT_OPTIONS) {
        if (justIndex) {
            const req = { method: 'getBatchIndexAt', params: [blockNumber] }
            return super.call<BatchIndex, typeof req>(req, options)
        } else {
            const req = { method: 'getBatchAt', params: [blockNumber] }
            return super.call<BatchIndex, typeof req>(req, options)
        }
    }

    /**
     * Gets the number (height) of the next election macro block after a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The number (height) of the next election macro block after a given block number (height).
     */
    public async getElectionBlockAfter({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS) {
        const req = { method: 'getElectionBlockAfter', params: [blockNumber] }
        return super.call<BlockNumber, typeof req>(req, options)
    }

    /**
     * Gets the block number (height) of the preceding election macro block before a given block number (height).
     * If the given block number is an election macro block, it returns the election macro block before it.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the preceding election macro block before a given block number (height).
     */
    public async getElectionBlockBefore({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS) {
        const req = { method: 'getElectionBlockBefore', params: [blockNumber] }
        return super.call<BlockNumber, typeof req>(req, options)
    }

    /**
     * Gets the block number (height) of the last election macro block at a given block number (height).
     * If the given block number is an election macro block, then it returns that block number.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns 
     */
    public async getLastElectionBlock({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS) {
        const req = { method: 'getLastElectionBlock', params: [blockNumber] }
        return super.call<BlockNumber, typeof req>(req, options)
    }

    /**
     * Gets a boolean expressing if the block at a given block number (height) is an election macro block.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the block at a given block number (height) is an election macro block.
     */
    public async getIsElectionBlockAt({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS) {
        const req = { method: 'getIsElectionBlockAt', params: [blockNumber] }
        return super.call<Boolean, typeof req>(req, options)
    }

    /**
     * Gets the block number (height) of the next macro block after a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the next macro block after a given block number (height).
     */
    public async getMacroBlockAfter({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS) {
        const req = { method: 'getMacroBlockAfter', params: [blockNumber] }
        return super.call<BlockNumber, typeof req>(req, options)
    }

    /**
     * Gets the block number (height) of the preceding macro block before a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the preceding macro block before a given block number (height).
     */
    public async getMacroBlockBefore({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS) {
        const req = { method: 'getMacroBlockBefore', params: [blockNumber] }
        return super.call<BlockNumber, typeof req>(req, options)
    }

    /**
     * Gets the block number (height) of the last macro block at a given block number (height).
     * If the given block number is a macro block, then it returns that block number.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the last macro block at a given block number (height).
     */
    public async getLastMacroBlock({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS) {
        const req = { method: 'getLastMacroBlock', params: [blockNumber] }
        return super.call<BlockNumber, typeof req>(req, options)
    }



    /**
     * Gets a boolean expressing if the block at a given block number (height) is a macro block.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the block at a given block number (height) is a macro block.
     */
    public async getIsMacroBlockAt({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS) {
        const req = { method: 'getIsMacroBlockAt', params: [blockNumber] }
        return super.call<Boolean, typeof req>(req, options)
    }

    /**
     * Gets the block number (height) of the next micro block after a given block number (height).
     * 
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the next micro block after a given block number (height).
     */
    public async getIsMicroBlockAt({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS) {
        const req = { method: 'getIsMicroBlockAt', params: [blockNumber] }
        return super.call<Boolean, typeof req>(req, options)
    }

    /**
     * Gets the block number (height) of the first block of the given epoch (which is always a micro block).
     * 
     * @param epochIndex The epoch index to query.
     * @returns The block number (height) of the first block of the given epoch (which is always a micro block).
     */
    public async getFirstBlockOf({ epochIndex }: JustEpochIndex, options = DEFAULT_OPTIONS) {
        const req = { method: 'getFirstBlockOf', params: [epochIndex] }
        return super.call<BlockNumber, typeof req>(req, options)
    }

    /**
     * Gets the block number of the first block of the given batch (which is always a micro block).
     * 
     * @param batchIndex The batch index to query.
     * @returns The block number of the first block of the given batch (which is always a micro block).
     */
    public async getFirstBlockOfBatch({ batchIndex }: JustBatchIndex, options = DEFAULT_OPTIONS) {
        const req = { method: 'getFirstBlockOfBatch', params: [batchIndex] }
        return super.call<BlockNumber, typeof req>(req, options)
    }

    /**
     * Gets the block number of the election macro block of the given epoch (which is always the last block).
     * 
     * @param epochIndex The epoch index to query.
     * @returns The block number of the election macro block of the given epoch (which is always the last block).
     */
    public async getElectionBlockOf({ epochIndex }: JustEpochIndex, options = DEFAULT_OPTIONS) {
        const req = { method: 'getElectionBlockOf', params: [epochIndex] }
        return super.call<BlockNumber, typeof req>(req, options)
    }

    /**
     * Gets the block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
     * 
     * @param batchIndex The batch index to query.
     * @returns The block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
     */
    public async getMacroBlockOf({ batchIndex }: JustBatchIndex, options = DEFAULT_OPTIONS) {
        const req = { method: 'getMacroBlockOf', params: [batchIndex] }
        return super.call<BlockNumber, typeof req>(req, options)
    }

    /**
     * Gets a boolean expressing if the batch at a given block number (height) is the first batch
     * of the epoch.
     * 
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the batch at a given block number (height) is the first batch
     */
    public async getFirstBatchOfEpoch({ blockNumber }: JustBlockNumber, options = DEFAULT_OPTIONS) {
        const req = { method: 'getFirstBatchOfEpoch', params: [blockNumber] }
        return super.call<BlockNumber, typeof req>(req, options)
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
        return super.call<number, typeof req>(req, options)
    }
}
