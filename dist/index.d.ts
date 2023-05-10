import WebSocket from 'ws';

declare enum BlockType {
    MICRO = "micro",
    MACRO = "macro"
}
declare enum LogType {
    PayoutInherent = "payout-inherent",
    ParkInherent = "park-inherent",
    SlashInherent = "slash-inherent",
    RevertContractInherent = "revert-contract-inherent",
    PayFee = "pay-fee",
    Transfer = "transfer",
    HtlcCreate = "htlc-create",
    HtlcTimeoutResolve = "htlc-timeout-resolve",
    HtlcRegularTransfer = "htlc-regular-transfer",
    HtlcEarlyResolve = "htlc-early-resolve",
    VestingCreate = "vesting-create",
    CreateValidator = "create-validator",
    UpdateValidator = "update-validator",
    DeactivateValidator = "deactivate-validator",
    ReactivateValidator = "reactivate-validator",
    UnparkValidator = "unpark-validator",
    CreateStaker = "create-staker",
    Stake = "stake",
    StakerFeeDeduction = "staker-fee-deduction",
    UpdateStaker = "update-staker",
    RetireValidator = "retire-validator",
    DeleteValidator = "delete-validator",
    Unstake = "unstake",
    PayoutReward = "payout-reward",
    Park = "park",
    Slash = "slash",
    RevertContract = "revert-contract",
    FailedTransaction = "failed-transaction",
    ValidatorFeeDeduction = "validator-fee-deduction"
}
declare enum AccountType {
    BASIC = "basic",
    VESTING = "vesting",
    HTLC = "htlc"
}

type Address = `NQ${number} ${string}`
type Coin = number

type BlockNumber = number /* u32 */
type ValidityStartHeight =
    | { relativeValidityStartHeight: number }
    | { absoluteValidityStartHeight: number }
type EpochIndex = number /* u32 */
type BatchIndex = number /* u32 */
type GenesisSupply = number /* u64 */
type GenesisTime = number /* u64 */
type CurrentTime = number /* u64 */
type Hash = string

type PolicyConstants = {
    stakingContractAddress: Address,
    coinbaseAddress: Address,
    transactionValidityWindow: number,
    maxSizeMicroBody: number,
    version: number,
    slots: number,
    blocksPerBatch: number,
    batchesPerEpoch: number,
    blocksPerEpoch: number,
    validatorDeposit: number,
    totalSupply: number,
}

type BasicAccount = {
    type: AccountType.BASIC;
    address: Address;
    balance: Coin;
}

type VestingAccount = {
    type: AccountType.VESTING;
    address: Address;
    balance: Coin;
    owner: Address;
    vestingStart: number;
    vestingStepBlocks: number;
    vestingStepAmount: Coin;
    vestingTotalAmount: Coin;
}

type HtlcAccount = {
    type: AccountType.HTLC;
    address: Address;
    balance: Coin;
    sender: Address;
    recipient: Address;
    hashRoot: string;
    hashCount: number;
    timeout: number;
    totalAmount: Coin;
}

type Account = BasicAccount | VestingAccount | HtlcAccount

type Transaction = {
    hash: string;
    blockNumber: number;
    timestamp: number;
    confirmations: number;
    from: Address;
    to: Address;
    value: Coin;
    fee: Coin;
    data: string;
    flags: number;
    validityStartHeight: number;
    proof: string;
    executionResult: boolean;
}

type RawTransaction = string;

type PartialMicroBlock = {
    type: BlockType.MICRO;
    hash: string;
    size: number;
    batch: number;
    epoch: number;
    version: number;
    number: number;
    timestamp: number;
    parentHash: string;
    seed: {
        signature: number[];
    };
    extraData: string;
    stateHash: string;
    bodyHash: string;
    historyHash: string;
    producer: {
        slotNumber: number;
        validator: Address;
        publicKey: string;
    };
    forkProofs: any[];
    justification: {
        micro: string;
    } | {
        skip: {
            sig: {
                signature: string;
                signers: number[];
            };
        };
    };
}

type MicroBlock = PartialMicroBlock & {
    transactions: Transaction[];
}

type PartialMacroBlock = {
    type: BlockType.MACRO;
    hash: string;
    size: number;
    batch: number;
    epoch: number;
    version: number;
    number: number;
    timestamp: number;
    parentHash: string;
    seed: {
        signature: number[];
    };
    extraData: string;
    stateHash: string;
    bodyHash: string;
    historyHash: string;
    parentElectionHash: string;
}

type MacroBlock = PartialMacroBlock & {
    isElectionBlock: false;
    transactions: Transaction[];
    lostRewardSet: number[];
    disabledSet: number[];
    justification: {
        round: number;
        sig: {
            signature: string;
            signers: number[];
        };
    };
}

type ElectionMacroBlock = PartialMacroBlock & {
    isElectionBlock: true;
    transactions: Transaction[];
    lostRewardSet: number[];
    disabledSet: number[];
    justification: {
        round: number;
        sig: {
            signature: string;
            signers: number[];
        };
    };
    slots: Slot[];
}

type PartialBlock = PartialMicroBlock | PartialMacroBlock
type Block = MicroBlock | MacroBlock | ElectionMacroBlock

type Staker = {
    address: Address;
    balance: Coin;
    delegation?: Address;
}

type PartialValidator = {
    address: Address;
    signingKey: string;
    votingKey: string;
    rewardAddress: Address;
    balance: Coin;
    numStakers: number;
}

type Validator = PartialValidator & {
    signalData?: string;
    inactivityFlag?: number;
    stakers?: Staker[];
}

type Slot = {
    firstSlotNumber: number; // u16
    numSlots: number; // u16
    validator: Address;
    publicKey: string;
}

type SlashedSlot = {
    blockNumber: BlockNumber; // u32
    lostRewards: number[]; // u32[]
    disabled: number[]; // u32[]
}

type ParkedSet = {
    blockNumber: BlockNumber;
    validators: Address[];
}
type Inherent = {
    ty: number; // u8
    blockNumber: BlockNumber; // u32
    timestamp: number; // u64
    target: Address;
    value: Coin;
    data: string; // Might be u8[] or number[] in TS
    hash: Hash;
}

type MempoolInfo = {
    _0?: number; // u32
    _1?: number; // u32
    _2?: number; // u32
    _5?: number; // u32
    _10?: number; // u32
    _20?: number; // u32
    _50?: number; // u32
    _100?: number; // u32
    _200?: number; // u32
    _500?: number; // u32
    _1000?: number; // u32
    _2000?: number; // u32
    _5000?: number; // u32
    _10000?: number; // u32
    total: number; // u32
    buckets: number[]; // u32[]
}

type WalletAccount = {
    address: Address,
    publicKey: string,
    privateKey: string,
}

type Signature = {
    signature: string,
    publicKey: string,
}

type ZKPState = {
    latestHeaderHash: Hash
    latestBlockNumber: BlockNumber
    latestProof?: string
}

type BlockchainState = {
    blockNumber: BlockNumber;
    blockHash: Hash;
}

type Auth = {
    username: string;
    password: string;
}

type PayFeeLog = {
    type: LogType.PayFee;
    from: string;
    fee: number;
}

type TransferLog = {
    type: LogType.Transfer;
    from: Address;
    to: Address;
    amount: Coin;
}

type HtlcCreateLog = {
    contractAddress: Address,
    sender: Address,
    recipient: Address,
    hashAlgorithm: string,
    hashRoot: string,
    hashCount: number,
    timeout: number,
    totalAmount: Coin
}

type HTLCTimeoutResolve = {
    contractAddress: Address,
}

type HTLCRegularTransfer = {
    contractAddress: Address,
    preImage: string,
    hashDepth: number,
}

type HTLCEarlyResolve = {
    contractAddress: Address,
}

type VestingCreateLog = {
    type: LogType.VestingCreate;
    contractAddress: Address;
    owner: Address;
    startTime: number;
    timeStep: number;
    stepAmount: Coin;
    totalAmount: Coin;
};

type CreateValidatorLog = {
    type: LogType.CreateValidator;
    validatorAddress: Address;
    rewardAddress: Address;
};

type UpdateValidatorLog = {
    type: LogType.UpdateValidator;
    validatorAddress: Address;
    oldRewardAddress: Address;
    newRewardAddress: Address | null;
};

type ValidatorFeeDeductionLog = {
    type: LogType.ValidatorFeeDeduction;
    validatorAddress: Address;
    fee: Coin;
};

type DeactivateValidatorLog = {
    type: LogType.DeactivateValidator;
    validatorAddress: Address;
};

type ReactivateValidatorLog = {
    type: LogType.ReactivateValidator;
    validatorAddress: Address;
};

type UnparkValidatorLog = {
    type: LogType.UnparkValidator;
    validatorAddress: Address;
};

type CreateStakerLog = {
    type: LogType.CreateStaker;
    stakerAddress: Address;
    validatorAddress: Address | null;
    value: Coin;
};

type StakeLog = {
    type: LogType.Stake;
    stakerAddress: Address;
    validatorAddress: Address | null;
    value: Coin;
};

type StakerFeeDeductionLog = {
    type: LogType.StakerFeeDeduction;
    stakerAddress: Address;
    fee: Coin;
};

type UpdateStakerLog = {
    type: LogType.UpdateStaker;
    stakerAddress: Address;
    oldValidatorAddress: Address | null;
    newValidatorAddress: Address | null;
};

type RetireValidatorLog = {
    type: LogType.RetireValidator;
    validatorAddress: Address;
};

type DeleteValidatorLog = {
    type: LogType.DeleteValidator;
    validatorAddress: Address;
    rewardAddress: Address;
};

type UnstakeLog = {
    type: LogType.Unstake;
    stakerAddress: Address;
    validatorAddress: Address | null;
    value: Coin;
};

type PayoutRewardLog = {
    type: LogType.PayoutReward;
    to: Address;
    value: Coin;
};

type ParkLog = {
    type: LogType.Park;
    validatorAddress: Address;
    eventBlock: number;
};

type SlashLog = {
    type: LogType.Slash;
    validatorAddress: Address;
    eventBlock: number;
    slot: number;
    newlyDisabled: boolean;
};

type RevertContractLog = {
    type: LogType.RevertContract;
    contractAddress: Address;
};

type FailedTransactionLog = {
    type: LogType.FailedTransaction;
    from: Address;
    to: Address;
    failureReason: string;
};

type Log = PayFeeLog | TransferLog | HtlcCreateLog | HTLCTimeoutResolve | HTLCRegularTransfer | VestingCreateLog | CreateValidatorLog | UpdateValidatorLog | ValidatorFeeDeductionLog | DeactivateValidatorLog | ReactivateValidatorLog | UnparkValidatorLog | CreateStakerLog | StakeLog | StakerFeeDeductionLog | UpdateStakerLog | RetireValidatorLog | DeleteValidatorLog | UnstakeLog | PayoutRewardLog | ParkLog | SlashLog | RevertContractLog | FailedTransactionLog;


type TransactionLog = {
    hash: string;
    logs: Log[];
    failed: boolean;
}

type BlockLog = {
    inherents: Log[];
    blockHash: string;
    blockNumber: number;
    transactions: TransactionLog[];
}

type AppliedBlockLog = BlockLog & {
    type: 'applied-block';
    timestamp: number;
}

type RevertedBlockLog = BlockLog & {
    type: 'reverted-block';
}

type ErrorStreamReturn = {
    code: number;
    message: string;
};
type Subscription<Data, Params extends any[]> = {
    next: (callback: (data: MaybeStreamResponse<Data>) => void) => void;
    close: () => void;
    context: {
        headers: WebSocket.ClientOptions["headers"];
        body: {
            method: string;
            params: Params;
            id: number;
        };
        timestamp: number;
        url: string;
    };
    getSubscriptionId: () => number;
};
declare const WS_DEFAULT_OPTIONS: StreamOptions<any>;
type MaybeStreamResponse<Data> = {
    error: ErrorStreamReturn;
    data: undefined;
    metadata: undefined;
} | {
    error: undefined;
    data: Data;
    metadata?: BlockchainState;
};
type FilterStreamFn<Data> = (data: Data) => boolean;
type StreamOptions<Data> = {
    once: boolean;
    filter?: FilterStreamFn<Data>;
};
declare class WebSocketClient {
    private url;
    private id;
    private textDecoder;
    private auth;
    constructor(url: URL, auth?: Auth);
    subscribe<Data, Request extends {
        method: string;
        params: any[];
        withMetadata?: boolean;
    }>(request: Request, userOptions: StreamOptions<Data>): Promise<Subscription<Data, Request["params"]>>;
}

type HttpOptions = {
    timeout?: number;
};
type SendTxCallOptions = HttpOptions & ({
    waitForConfirmationTimeout?: number;
});
declare const DEFAULT_OPTIONS: HttpOptions;
declare const DEFAULT_TIMEOUT_CONFIRMATION: number;
declare const DEFAULT_OPTIONS_SEND_TX: SendTxCallOptions;
type Context<Params extends any[] = any> = {
    headers: HeadersInit;
    body: {
        method: string;
        params: Params;
        id: number;
    };
    timestamp: number;
    url: string;
};
type CallResult<Params extends any[], Data, Metadata = undefined> = {
    context: Context<Params>;
} & ({
    data: Data;
    metadata: Metadata;
    error: undefined;
} | {
    data: undefined;
    metadata: undefined;
    error: {
        code: number;
        message: string;
    };
});
declare class HttpClient {
    private url;
    private static id;
    private auth;
    constructor(url: URL, auth?: Auth);
    call<Data, Request extends {
        method: string;
        params: any[];
        withMetadata?: boolean;
    }, Metadata = undefined>(request: Request, options: HttpOptions): Promise<CallResult<Request["params"], Data, Metadata>>;
}

type GetBlockByParams = ({
    hash: Hash;
} | {
    blockNumber: BlockNumber;
}) & {
    includeTransactions?: boolean;
};
type GetLatestBlockParams = {
    includeTransactions?: boolean;
};
type GetSlotAtParams = {
    blockNumber: BlockNumber;
    offsetOpt?: number;
    withMetadata?: boolean;
};
type GetTransactionsByAddressParams = {
    address: Address;
    max?: number;
    justHashes?: boolean;
};
type GetTransactionByParams = {
    hash: Hash;
} | {
    blockNumber: BlockNumber;
} | {
    batchNumber: BatchIndex;
} | GetTransactionsByAddressParams;
type GetInherentsByParams = {
    batchNumber: BatchIndex;
} | {
    blockNumber: BlockNumber;
};
type GetAccountByAddressParams = {
    address: Address;
    withMetadata?: boolean;
};
type GetValidatorByAddressParams = {
    address: Address;
};
type GetStakersByAddressParams = {
    address: Address;
};
type GetStakerByAddressParams = {
    address: Address;
};
type SubscribeForHeadHashParams$1 = {
    retrieve: 'HASH';
};
type SubscribeForValidatorElectionByAddressParams$1 = {
    address: Address;
};
type SubscribeForLogsByAddressesAndTypesParams$1 = {
    addresses?: Address[];
    types?: LogType[];
};
type TransactionBy<T extends GetTransactionByParams> = CallResult<Hash[] | BlockNumber[] | (BlockNumber | number)[], T extends {
    hash: Hash;
} ? Transaction : T extends GetTransactionsByAddressParams ? T["justHashes"] extends true ? Hash[] : Transaction[] : Transaction[]>;
declare class BlockchainClient extends HttpClient {
    constructor(url: URL, auth?: Auth);
    /**
     * Returns the block number for the current head.
     */
    getBlockNumber(options?: HttpOptions): Promise<CallResult<never[], number, undefined>>;
    /**
     * Returns the batch number for the current head.
     */
    getBatchNumber(options?: HttpOptions): Promise<CallResult<never[], number, undefined>>;
    /**
     * Returns the epoch number for the current head.
     */
    getEpochNumber(options?: HttpOptions): Promise<CallResult<never[], number, undefined>>;
    /**
     * Tries to fetch a block given its hash or block number. It has an option to include the transactions in the block, which defaults to false.
     */
    getBlockBy<T extends GetBlockByParams>(p: T, options?: HttpOptions): Promise<CallResult<(string | boolean | undefined)[], T["includeTransactions"] extends true ? Block : PartialBlock, undefined> | CallResult<(number | boolean | undefined)[], T["includeTransactions"] extends true ? Block : PartialBlock, undefined>>;
    /**
     * Returns the block at the head of the main chain. It has an option to include the
     * transactions in the block, which defaults to false.
     */
    getLatestBlock<T extends GetLatestBlockParams>(p?: T, options?: HttpOptions): Promise<CallResult<(boolean | undefined)[], T["includeTransactions"] extends true ? Block : PartialBlock, undefined>>;
    /**
     * Returns the information for the slot owner at the given block height and offset. The
     * offset is optional, it will default to getting the offset for the existing block
     * at the given height.
     */
    getSlotAt<T extends GetSlotAtParams>({ blockNumber, offsetOpt, withMetadata }: T, options?: HttpOptions): Promise<CallResult<(number | undefined)[], Slot, undefined>>;
    /**
     * Fetchs the transaction(s) given the parameters. The parameters can be a hash, a block number, a batch number or an address.
     *
     * In case of address, it returns the latest transactions for a given address. All the transactions
     * where the given address is listed as a recipient or as a sender are considered. Reward
     * transactions are also returned. It has an option to specify the maximum number of transactions
     * to fetch, it defaults to 500.
     */
    getTransactionBy<T extends GetTransactionByParams>(p: T, options?: HttpOptions): Promise<TransactionBy<T> | CallResult<(number | `NQ${number} ${string}` | undefined)[], Transaction[], undefined>>;
    /**
     * Returns all the inherents (including reward inherents) for the parameter. Note
     * that this only considers blocks in the main chain.
     */
    getInherentsBy<T extends GetInherentsByParams>(p: T, options?: HttpOptions): Promise<CallResult<number[], Inherent[], undefined>>;
    /**
     * Tries to fetch the account at the given address.
     */
    getAccountBy<T extends GetAccountByAddressParams>({ address, withMetadata }: T, options?: HttpOptions): Promise<CallResult<`NQ${number} ${string}`[], Account, T["withMetadata"] extends true ? BlockchainState : undefined>>;
    /**
    * Returns a collection of the currently active validator's addresses and balances.
    */
    getActiveValidators<T extends {
        withMetadata: boolean;
    }>({ withMetadata }?: T, options?: HttpOptions): Promise<CallResult<never[], Validator[], T["withMetadata"] extends true ? BlockchainState : undefined>>;
    /**
     * Returns information about the currently slashed slots. This includes slots that lost rewards
     * and that were disabled.
     */
    getCurrentSlashedSlots<T extends {
        withMetadata: boolean;
    }>({ withMetadata }?: T, options?: HttpOptions): Promise<CallResult<never[], SlashedSlot[], undefined>>;
    /**
     * Returns information about the slashed slots of the previous batch. This includes slots that
     * lost rewards and that were disabled.
     */
    getPreviousSlashedSlots<T extends {
        withMetadata: boolean;
    }>({ withMetadata }?: T, options?: HttpOptions): Promise<CallResult<never[], SlashedSlot[], T["withMetadata"] extends true ? BlockchainState : undefined>>;
    /**
     * Returns information about the currently parked validators.
     */
    getParkedValidators<T extends {
        withMetadata: boolean;
    }>({ withMetadata }?: T, options?: HttpOptions): Promise<CallResult<never[], {
        blockNumber: BlockNumber;
        validators: Validator[];
    }, T["withMetadata"] extends true ? BlockchainState : undefined>>;
    /**
     * Tries to fetch a validator information given its address. It has an option to include a map
     * containing the addresses and stakes of all the stakers that are delegating to the validator.
     */
    getValidatorBy<T extends GetValidatorByAddressParams>({ address }: T, options?: HttpOptions): Promise<CallResult<`NQ${number} ${string}`[], PartialValidator, undefined>>;
    /**
     * Fetches all stakers for a given validator.
     * IMPORTANT: This operation iterates over all stakers of the staking contract
     * and thus is extremely computationally expensive.
     * This function requires the read lock acquisition prior to its execution.
     */
    getStakersByAddress<T extends GetStakersByAddressParams>({ address }: T, options?: HttpOptions): Promise<CallResult<`NQ${number} ${string}`[], Staker[], undefined>>;
    /**
     * Tries to fetch a staker information given its address.
     */
    getStakerByAddress<T extends GetStakerByAddressParams>({ address }: T, options?: HttpOptions): Promise<CallResult<`NQ${number} ${string}`[], Staker, undefined>>;
}

type blockchain_BlockchainClient = BlockchainClient;
declare const blockchain_BlockchainClient: typeof BlockchainClient;
type blockchain_GetAccountByAddressParams = GetAccountByAddressParams;
type blockchain_GetBlockByParams = GetBlockByParams;
type blockchain_GetInherentsByParams = GetInherentsByParams;
type blockchain_GetLatestBlockParams = GetLatestBlockParams;
type blockchain_GetSlotAtParams = GetSlotAtParams;
type blockchain_GetStakerByAddressParams = GetStakerByAddressParams;
type blockchain_GetStakersByAddressParams = GetStakersByAddressParams;
type blockchain_GetTransactionByParams = GetTransactionByParams;
type blockchain_GetTransactionsByAddressParams = GetTransactionsByAddressParams;
type blockchain_GetValidatorByAddressParams = GetValidatorByAddressParams;
declare namespace blockchain {
  export {
    blockchain_BlockchainClient as BlockchainClient,
    blockchain_GetAccountByAddressParams as GetAccountByAddressParams,
    blockchain_GetBlockByParams as GetBlockByParams,
    blockchain_GetInherentsByParams as GetInherentsByParams,
    blockchain_GetLatestBlockParams as GetLatestBlockParams,
    blockchain_GetSlotAtParams as GetSlotAtParams,
    blockchain_GetStakerByAddressParams as GetStakerByAddressParams,
    blockchain_GetStakersByAddressParams as GetStakersByAddressParams,
    blockchain_GetTransactionByParams as GetTransactionByParams,
    blockchain_GetTransactionsByAddressParams as GetTransactionsByAddressParams,
    blockchain_GetValidatorByAddressParams as GetValidatorByAddressParams,
    SubscribeForHeadHashParams$1 as SubscribeForHeadHashParams,
    SubscribeForLogsByAddressesAndTypesParams$1 as SubscribeForLogsByAddressesAndTypesParams,
    SubscribeForValidatorElectionByAddressParams$1 as SubscribeForValidatorElectionByAddressParams,
  };
}

type SubscribeForHeadBlockParams = {
    retrieve: 'FULL' | 'PARTIAL';
    blockType?: 'MACRO' | 'MICRO' | 'ELECTION';
};
type SubscribeForHeadHashParams = {
    retrieve: 'HASH';
};
type SubscribeForValidatorElectionByAddressParams = {
    address: Address;
    withMetadata?: boolean;
};
type SubscribeForLogsByAddressesAndTypesParams = {
    addresses?: Address[];
    types?: LogType[];
    withMetadata?: boolean;
};
declare class BlockchainStream extends WebSocketClient {
    constructor(url: URL, auth?: Auth);
    /**
     * Subscribes to new block events.
     */
    subscribeForBlocks<T extends (SubscribeForHeadBlockParams | SubscribeForHeadHashParams), O extends StreamOptions<T extends SubscribeForHeadBlockParams ? Block | PartialBlock : Hash>>(params: T, userOptions?: Partial<O>): Promise<Subscription<any, boolean[]>>;
    /**
     * Subscribes to pre epoch validators events.
     */
    subscribeForValidatorElectionByAddress<T extends SubscribeForValidatorElectionByAddressParams, O extends StreamOptions<Validator>>(p: T, userOptions?: Partial<O>): Promise<Subscription<Validator, Address[]>>;
    /**
     * Subscribes to log events related to a given list of addresses and of any of the log types provided.
     * If addresses is empty it does not filter by address. If log_types is empty it won't filter by log types.
     * Thus the behavior is to assume all addresses or log_types are to be provided if the corresponding vec is empty.
     */
    subscribeForLogsByAddressesAndTypes<T extends SubscribeForLogsByAddressesAndTypesParams, O extends StreamOptions<BlockLog>>(p: T, userOptions?: Partial<O>): Promise<Subscription<BlockLog, (Address[] | LogType[])[]>>;
}

type blockchainStreams_BlockchainStream = BlockchainStream;
declare const blockchainStreams_BlockchainStream: typeof BlockchainStream;
type blockchainStreams_SubscribeForHeadBlockParams = SubscribeForHeadBlockParams;
type blockchainStreams_SubscribeForHeadHashParams = SubscribeForHeadHashParams;
type blockchainStreams_SubscribeForLogsByAddressesAndTypesParams = SubscribeForLogsByAddressesAndTypesParams;
type blockchainStreams_SubscribeForValidatorElectionByAddressParams = SubscribeForValidatorElectionByAddressParams;
declare namespace blockchainStreams {
  export {
    blockchainStreams_BlockchainStream as BlockchainStream,
    blockchainStreams_SubscribeForHeadBlockParams as SubscribeForHeadBlockParams,
    blockchainStreams_SubscribeForHeadHashParams as SubscribeForHeadHashParams,
    blockchainStreams_SubscribeForLogsByAddressesAndTypesParams as SubscribeForLogsByAddressesAndTypesParams,
    blockchainStreams_SubscribeForValidatorElectionByAddressParams as SubscribeForValidatorElectionByAddressParams,
  };
}

type RawTransactionInfoParams = {
    rawTransaction: string;
};
type TransactionParams = {
    wallet: Address;
    recipient: Address;
    value: Coin;
    fee: Coin;
    data?: string;
} & ValidityStartHeight;
type VestingTxParams = {
    wallet: Address;
    owner: Address;
    startTime: number;
    timeStep: number;
    numSteps: number;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight;
type RedeemVestingTxParams = {
    wallet: Address;
    contractAddress: Address;
    recipient: Address;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight;
type HtlcTransactionParams = {
    wallet: Address;
    htlcSender: Address;
    htlcRecipient: Address;
    hashRoot: string;
    hashCount: number;
    hashAlgorithm: string;
    timeout: number;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight;
type RedeemRegularHtlcTxParams = {
    wallet: Address;
    contractAddress: Address;
    recipient: Address;
    preImage: string;
    hashRoot: string;
    hashCount: number;
    hashAlgorithm: string;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight;
type RedeemTimeoutHtlcTxParams = {
    wallet: Address;
    contractAddress: Address;
    recipient: Address;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight;
type RedeemEarlyHtlcTxParams = {
    wallet: Address;
    htlcAddress: Address;
    recipient: Address;
    htlcSenderSignature: string;
    htlcRecipientSignature: string;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight;
type SignRedeemEarlyHtlcParams = {
    wallet: Address;
    htlcAddress: Address;
    recipient: Address;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight;
type StakerTxParams = {
    senderWallet: Address;
    staker: Address;
    delegation: Address | undefined;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight;
type StakeTxParams = {
    senderWallet: Address;
    staker: Address;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight;
type UpdateStakerTxParams = {
    senderWallet: Address;
    staker: Address;
    newDelegation: Address;
    fee: Coin;
} & ValidityStartHeight;
type UnstakeTxParams = {
    staker: Address;
    recipient: Address;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight;
type NewValidatorTxParams = {
    senderWallet: Address;
    validator: Address;
    signingSecretKey: string;
    votingSecretKey: string;
    rewardAddress: Address;
    signalData: string;
    fee: Coin;
} & ValidityStartHeight;
type UpdateValidatorTxParams = {
    senderWallet: Address;
    validator: Address;
    newSigningSecretKey: string;
    newVotingSecretKey: string;
    newRewardAddress: Address;
    newSignalData: string;
    fee: Coin;
} & ValidityStartHeight;
type DeactiveValidatorTxParams = {
    senderWallet: Address;
    validator: Address;
    signingSecretKey: string;
    fee: Coin;
} & ValidityStartHeight;
type ReactivateValidatorTxParams = {
    senderWallet: Address;
    validator: Address;
    signingSecretKey: string;
    fee: Coin;
} & ValidityStartHeight;
type UnparkValidatorTxParams = {
    senderWallet: Address;
    validator: Address;
    signingSecretKey: string;
    fee: Coin;
} & ValidityStartHeight;
type RetireValidatorTxParams = {
    senderWallet: Address;
    validator: Address;
    fee: Coin;
} & ValidityStartHeight;
type DeleteValidatorTxParams = {
    validator: Address;
    recipient: Address;
    fee: Coin;
    value: Coin;
} & ValidityStartHeight;
type TxLog = {
    tx: Transaction;
    log?: BlockLog;
    hash: Hash;
};
declare class ConsensusClient extends HttpClient {
    private blockchainClient;
    private blockchainStream;
    constructor(url: URL, blockchainClient: BlockchainClient, blockchainStream: BlockchainStream, auth?: Auth);
    private getValidityStartHeight;
    private waitForConfirmation;
    /**
 * Returns a boolean specifying if we have established consensus with the network
 */
    isConsensusEstablished(options?: HttpOptions): Promise<CallResult<never[], Boolean, undefined>>;
    /**
     * Given a serialized transaction, it will return the corresponding transaction struct
     */
    getRawTransactionInfo({ rawTransaction }: RawTransactionInfoParams, options?: HttpOptions): Promise<CallResult<string[], Transaction, undefined>>;
    /**
     * Creates a serialized transaction
     */
    createTransaction(p: TransactionParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a transaction
     */
    sendTransaction(p: TransactionParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a transaction and waits for confirmation
     */
    sendSyncTransaction(p: TransactionParams, options: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized transaction creating a new vesting contract
     */
    createNewVestingTransaction(p: VestingTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a transaction creating a new vesting contract to the network
     */
    sendNewVestingTransaction(p: VestingTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a transaction creating a new vesting contract to the network and waits for confirmation
     */
    sendSyncNewVestingTransaction(p: VestingTxParams, options: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized transaction redeeming a vesting contract
     */
    createRedeemVestingTransaction(p: RedeemVestingTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a transaction redeeming a vesting contract
     */
    sendRedeemVestingTransaction(p: RedeemVestingTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a transaction redeeming a vesting contract and waits for confirmation
     */
    sendSyncRedeemVestingTransaction(p: RedeemVestingTxParams, options?: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized transaction creating a new HTLC contract
     */
    createNewHtlcTransaction(p: HtlcTransactionParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a transaction creating a new HTLC contract
     */
    sendNewHtlcTransaction(p: HtlcTransactionParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a transaction creating a new HTLC contract and waits for confirmation
     */
    sendSyncNewHtlcTransaction(p: HtlcTransactionParams, options?: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized transaction redeeming an HTLC contract
     */
    createRedeemRegularHtlcTransaction(p: RedeemRegularHtlcTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a transaction redeeming an HTLC contract
     */
    sendRedeemRegularHtlcTransaction(p: RedeemRegularHtlcTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a transaction redeeming a new HTLC contract and waits for confirmation
     */
    sendSyncRedeemRegularHtlcTransaction(p: RedeemRegularHtlcTxParams, options?: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized transaction redeeming a HTLC contract using the `TimeoutResolve`
     * method
     */
    createRedeemTimeoutHtlcTransaction(p: RedeemTimeoutHtlcTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a transaction redeeming a HTLC contract using the `TimeoutResolve`
     * method to network
     */
    sendRedeemTimeoutHtlcTransaction(p: RedeemTimeoutHtlcTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a transaction redeeming a HTLC contract using the `TimeoutResolve`
     * method to network and waits for confirmation
     */
    sendSyncRedeemTimeoutHtlcTransaction(p: RedeemTimeoutHtlcTxParams, options?: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized transaction redeeming a HTLC contract using the `EarlyResolve`
     * method.
     */
    createRedeemEarlyHtlcTransaction(p: RedeemEarlyHtlcTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a transaction redeeming a HTLC contract using the `EarlyResolve`
     * method.
     */
    sendRedeemEarlyHtlcTransaction(p: RedeemEarlyHtlcTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a transaction redeeming a HTLC contract using the `EarlyResolve`
     * method and waits for confirmation
     */
    sendSyncRedeemEarlyHtlcTransaction(p: RedeemEarlyHtlcTxParams, options?: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized signature that can be used to redeem funds from a HTLC contract using
     * the `EarlyResolve` method.
     */
    signRedeemEarlyHtlcTransaction(p: SignRedeemEarlyHtlcParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Returns a serialized `new_staker` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    createNewStakerTransaction(p: StakerTxParams, options?: HttpOptions): Promise<CallResult<(string | number | undefined)[], string, undefined>>;
    /**
     * Sends a `new_staker` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    sendNewStakerTransaction(p: StakerTxParams, options?: HttpOptions): Promise<CallResult<(string | number | undefined)[], string, undefined>>;
    /**
     * Sends a `new_staker` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee and waits for confirmation.
     */
    sendSyncNewStakerTransaction(p: StakerTxParams, options?: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized `stake` transaction. The funds to be staked and the transaction fee will
     * be paid from the `sender_wallet`.
     */
    createStakeTransaction(p: StakeTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `stake` transaction. The funds to be staked and the transaction fee will
     * be paid from the `sender_wallet`.
     */
    sendStakeTransaction(p: StakeTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `stake` transaction. The funds to be staked and the transaction fee will
     * be paid from the `sender_wallet` and waits for confirmation.
     */
    sendSyncStakeTransaction(p: StakeTxParams, options?: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized `update_staker` transaction. You can pay the transaction fee from a basic
     * account (by providing the sender wallet) or from the staker account's balance (by not
     * providing a sender wallet).
     */
    createUpdateStakerTransaction(p: UpdateStakerTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `update_staker` transaction. You can pay the transaction fee from a basic
     * account (by providing the sender wallet) or from the staker account's balance (by not
     * providing a sender wallet).
     */
    sendUpdateStakerTransaction(p: UpdateStakerTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `update_staker` transaction. You can pay the transaction fee from a basic
     * account (by providing the sender wallet) or from the staker account's balance (by not
     * providing a sender wallet) and waits for confirmation.
     */
    sendSyncUpdateStakerTransaction(p: UpdateStakerTxParams, options?: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized `unstake` transaction. The transaction fee will be paid from the funds
     * being unstaked.
     */
    createUnstakeTransaction(p: UnstakeTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `unstake` transaction. The transaction fee will be paid from the funds
     * being unstaked.
     */
    sendUnstakeTransaction(p: UnstakeTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `unstake` transaction. The transaction fee will be paid from the funds
     * being unstaked and waits for confirmation.
     */
    sendSyncUnstakeTransaction(p: UnstakeTxParams, options?: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized `new_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee and the validator deposit.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * "" = Set the signal data field to None.
     * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
     */
    createNewValidatorTransaction(p: NewValidatorTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `new_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee and the validator deposit.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * "" = Set the signal data field to None.
     * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
     */
    sendNewValidatorTransaction(p: NewValidatorTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `new_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee and the validator deposit
     * and waits for confirmation.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * "" = Set the signal data field to None.
     * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
     */
    sendSyncNewValidatorTransaction(p: NewValidatorTxParams, options?: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized `update_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * null = No change in the signal data field.
     * "" = Change the signal data field to None.
     * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
     */
    createUpdateValidatorTransaction(p: UpdateValidatorTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `update_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * null = No change in the signal data field.
     * "" = Change the signal data field to None.
     * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
     */
    sendUpdateValidatorTransaction(p: UpdateValidatorTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `update_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee and waits for confirmation.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * null = No change in the signal data field.
     * "" = Change the signal data field to None.
     * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
     */
    sendSyncUpdateValidatorTransaction(p: UpdateValidatorTxParams, options?: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized `inactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    createDeactivateValidatorTransaction(p: DeactiveValidatorTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `inactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    sendDeactivateValidatorTransaction(p: DeactiveValidatorTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `inactivate_validator` transaction and waits for confirmation.
     * You need to provide the address of a basic account (the sender wallet)
     * to pay the transaction fee.
     */
    sendSyncDeactivateValidatorTransaction(p: DeactiveValidatorTxParams, options?: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized `reactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    createReactivateValidatorTransaction(p: ReactivateValidatorTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `reactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    sendReactivateValidatorTransaction(p: ReactivateValidatorTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `reactivate_validator` transaction and waits for confirmation.
     * You need to provide the address of a basic account (the sender wallet)
     * to pay the transaction fee.
     */
    sendSyncReactivateValidatorTransaction(p: ReactivateValidatorTxParams, options?: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized `unpark_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    createUnparkValidatorTransaction(p: UnparkValidatorTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `unpark_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    sendUnparkValidatorTransaction(p: UnparkValidatorTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `unpark_validator` transaction and waits for confirmation.
     * You need to provide the address of a basic account (the sender wallet)
     * to pay the transaction fee.
     */
    sendSyncUnparkValidatorTransaction(p: UnparkValidatorTxParams, options?: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized `retire_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    createRetireValidatorTransaction(p: RetireValidatorTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `retire_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    sendRetireValidatorTransaction(p: RetireValidatorTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `retire_validator` transaction and waits for confirmation.
     * You need to provide the address of a basic account (the sender wallet)
     * to pay the transaction fee.
     */
    sendSyncRetireValidatorTransaction(p: RetireValidatorTxParams, options?: SendTxCallOptions): Promise<unknown>;
    /**
     * Returns a serialized `delete_validator` transaction. The transaction fee will be paid from the
     * validator deposit that is being returned.
     * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
     * Failed delete validator transactions can diminish the validator deposit
     */
    createDeleteValidatorTransaction(p: DeleteValidatorTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
     * Sends a `delete_validator` transaction. The transaction fee will be paid from the
     * validator deposit that is being returned.
     * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
     * Failed delete validator transactions can diminish the validator deposit
     */
    sendDeleteValidatorTransaction(p: DeleteValidatorTxParams, options?: HttpOptions): Promise<CallResult<(string | number)[], string, undefined>>;
    /**
    * Sends a `delete_validator` transaction and waits for confirmation.
    * The transaction fee will be paid from the validator deposit that is being returned.
    * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
    * Failed delete validator transactions can diminish the validator deposit
    */
    sendSyncDeleteValidatorTransaction(p: DeleteValidatorTxParams, options?: SendTxCallOptions): Promise<unknown>;
}

type consensus_ConsensusClient = ConsensusClient;
declare const consensus_ConsensusClient: typeof ConsensusClient;
type consensus_DeactiveValidatorTxParams = DeactiveValidatorTxParams;
type consensus_DeleteValidatorTxParams = DeleteValidatorTxParams;
type consensus_HtlcTransactionParams = HtlcTransactionParams;
type consensus_NewValidatorTxParams = NewValidatorTxParams;
type consensus_RawTransactionInfoParams = RawTransactionInfoParams;
type consensus_ReactivateValidatorTxParams = ReactivateValidatorTxParams;
type consensus_RedeemEarlyHtlcTxParams = RedeemEarlyHtlcTxParams;
type consensus_RedeemRegularHtlcTxParams = RedeemRegularHtlcTxParams;
type consensus_RedeemTimeoutHtlcTxParams = RedeemTimeoutHtlcTxParams;
type consensus_RedeemVestingTxParams = RedeemVestingTxParams;
type consensus_RetireValidatorTxParams = RetireValidatorTxParams;
type consensus_SignRedeemEarlyHtlcParams = SignRedeemEarlyHtlcParams;
type consensus_StakeTxParams = StakeTxParams;
type consensus_StakerTxParams = StakerTxParams;
type consensus_TransactionParams = TransactionParams;
type consensus_TxLog = TxLog;
type consensus_UnparkValidatorTxParams = UnparkValidatorTxParams;
type consensus_UnstakeTxParams = UnstakeTxParams;
type consensus_UpdateStakerTxParams = UpdateStakerTxParams;
type consensus_UpdateValidatorTxParams = UpdateValidatorTxParams;
type consensus_VestingTxParams = VestingTxParams;
declare namespace consensus {
  export {
    consensus_ConsensusClient as ConsensusClient,
    consensus_DeactiveValidatorTxParams as DeactiveValidatorTxParams,
    consensus_DeleteValidatorTxParams as DeleteValidatorTxParams,
    consensus_HtlcTransactionParams as HtlcTransactionParams,
    consensus_NewValidatorTxParams as NewValidatorTxParams,
    consensus_RawTransactionInfoParams as RawTransactionInfoParams,
    consensus_ReactivateValidatorTxParams as ReactivateValidatorTxParams,
    consensus_RedeemEarlyHtlcTxParams as RedeemEarlyHtlcTxParams,
    consensus_RedeemRegularHtlcTxParams as RedeemRegularHtlcTxParams,
    consensus_RedeemTimeoutHtlcTxParams as RedeemTimeoutHtlcTxParams,
    consensus_RedeemVestingTxParams as RedeemVestingTxParams,
    consensus_RetireValidatorTxParams as RetireValidatorTxParams,
    consensus_SignRedeemEarlyHtlcParams as SignRedeemEarlyHtlcParams,
    consensus_StakeTxParams as StakeTxParams,
    consensus_StakerTxParams as StakerTxParams,
    consensus_TransactionParams as TransactionParams,
    consensus_TxLog as TxLog,
    consensus_UnparkValidatorTxParams as UnparkValidatorTxParams,
    consensus_UnstakeTxParams as UnstakeTxParams,
    consensus_UpdateStakerTxParams as UpdateStakerTxParams,
    consensus_UpdateValidatorTxParams as UpdateValidatorTxParams,
    consensus_VestingTxParams as VestingTxParams,
  };
}

type PushTransactionParams = {
    transaction: RawTransaction;
    withHighPriority?: boolean;
};
type MempoolContentParams = {
    includeTransactions: boolean;
};
declare class MempoolClient extends HttpClient {
    constructor(url: URL, auth?: Auth);
    /**
     * Pushes the given serialized transaction to the local mempool
     *
     * @param transaction Serialized transaction
     * @returns Transaction hash
     */
    pushTransaction({ transaction, withHighPriority }: PushTransactionParams, options?: HttpOptions): Promise<CallResult<string[], string, undefined>>;
    /**
     * Content of the mempool
     *
     * @param includeTransactions
     * @returns
     */
    mempoolContent({ includeTransactions }?: MempoolContentParams, options?: HttpOptions): Promise<CallResult<boolean[], (string | Transaction)[], undefined>>;
    /**
     * @returns
     */
    mempool(options?: HttpOptions): Promise<CallResult<never[], MempoolInfo, undefined>>;
    /**
     *
     * @returns
     */
    getMinFeePerByte(options?: HttpOptions): Promise<CallResult<never[], number, undefined>>;
}

type mempool_MempoolClient = MempoolClient;
declare const mempool_MempoolClient: typeof MempoolClient;
declare namespace mempool {
  export {
    mempool_MempoolClient as MempoolClient,
  };
}

declare class NetworkClient extends HttpClient {
    constructor(url: URL, auth?: Auth);
    /**
     * The peer ID for our local peer.
     */
    getPeerId(options?: HttpOptions): Promise<CallResult<never[], string, undefined>>;
    /**
     * Returns the number of peers.
     */
    getPeerCount(options?: HttpOptions): Promise<CallResult<never[], number, undefined>>;
    /**
     * Returns a list with the IDs of all our peers.
     */
    getPeerList(options?: HttpOptions): Promise<CallResult<never[], string[], undefined>>;
}

type network_NetworkClient = NetworkClient;
declare const network_NetworkClient: typeof NetworkClient;
declare namespace network {
  export {
    network_NetworkClient as NetworkClient,
  };
}

type JustBlockNumber = {
    blockNumber: BlockNumber;
};
type JustEpochIndex = {
    epochIndex: EpochIndex;
};
type JustBatchIndex = {
    batchIndex: BatchIndex;
};
type BlockNumberWithIndex = {
    blockNumber: BlockNumber;
    justIndex?: boolean;
};
type SupplyAtParams = {
    genesisSupply: number;
    genesisTime: number;
    currentTime: number;
};
declare class PolicyClient extends HttpClient {
    constructor(url: URL, auth?: Auth);
    /**
     * Gets a bundle of policy constants
     */
    getPolicyConstants(options?: HttpOptions): Promise<CallResult<never[], PolicyConstants, undefined>>;
    /**
     * Gets the epoch number at a given `block_number` (height)
     *
     * @param blockNumber The block number (height) to query.
     * @param justIndex The epoch index is the number of a block relative to the epoch it is in.
     * For example, the first block of any epoch always has an epoch index of 0.
     * @returns The epoch number at the given block number (height) or index
     */
    getEpochAt({ blockNumber, justIndex }: BlockNumberWithIndex, options?: HttpOptions): Promise<CallResult<number[], number, undefined>>;
    /**
     * Gets the batch number at a given `block_number` (height)
     *
     * @param blockNumber The block number (height) to query.
     * @param justIndex The batch index is the number of a block relative to the batch it is in.
     * For example, the first block of any batch always has an epoch index of 0.
     * @returns The epoch number at the given block number (height).
     */
    getBatchAt({ blockNumber, justIndex }: BlockNumberWithIndex, options?: HttpOptions): Promise<CallResult<number[], number, undefined>>;
    /**
     * Gets the number (height) of the next election macro block after a given block number (height).
     *
     * @param blockNumber The block number (height) to query.
     * @returns The number (height) of the next election macro block after a given block number (height).
     */
    getElectionBlockAfter({ blockNumber }: JustBlockNumber, options?: HttpOptions): Promise<CallResult<number[], number, undefined>>;
    /**
     * Gets the block number (height) of the preceding election macro block before a given block number (height).
     * If the given block number is an election macro block, it returns the election macro block before it.
     *
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the preceding election macro block before a given block number (height).
     */
    getElectionBlockBefore({ blockNumber }: JustBlockNumber, options?: HttpOptions): Promise<CallResult<number[], number, undefined>>;
    /**
     * Gets the block number (height) of the last election macro block at a given block number (height).
     * If the given block number is an election macro block, then it returns that block number.
     *
     * @param blockNumber The block number (height) to query.
     * @returns
     */
    getLastElectionBlock({ blockNumber }: JustBlockNumber, options?: HttpOptions): Promise<CallResult<number[], number, undefined>>;
    /**
     * Gets a boolean expressing if the block at a given block number (height) is an election macro block.
     *
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the block at a given block number (height) is an election macro block.
     */
    getIsElectionBlockAt({ blockNumber }: JustBlockNumber, options?: HttpOptions): Promise<CallResult<number[], Boolean, undefined>>;
    /**
     * Gets the block number (height) of the next macro block after a given block number (height).
     *
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the next macro block after a given block number (height).
     */
    getMacroBlockAfter({ blockNumber }: JustBlockNumber, options?: HttpOptions): Promise<CallResult<number[], number, undefined>>;
    /**
     * Gets the block number (height) of the preceding macro block before a given block number (height).
     *
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the preceding macro block before a given block number (height).
     */
    getMacroBlockBefore({ blockNumber }: JustBlockNumber, options?: HttpOptions): Promise<CallResult<number[], number, undefined>>;
    /**
     * Gets the block number (height) of the last macro block at a given block number (height).
     * If the given block number is a macro block, then it returns that block number.
     *
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the last macro block at a given block number (height).
     */
    getLastMacroBlock({ blockNumber }: JustBlockNumber, options?: HttpOptions): Promise<CallResult<number[], number, undefined>>;
    /**
     * Gets a boolean expressing if the block at a given block number (height) is a macro block.
     *
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the block at a given block number (height) is a macro block.
     */
    getIsMacroBlockAt({ blockNumber }: JustBlockNumber, options?: HttpOptions): Promise<CallResult<number[], Boolean, undefined>>;
    /**
     * Gets the block number (height) of the next micro block after a given block number (height).
     *
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the next micro block after a given block number (height).
     */
    getIsMicroBlockAt({ blockNumber }: JustBlockNumber, options?: HttpOptions): Promise<CallResult<number[], Boolean, undefined>>;
    /**
     * Gets the block number (height) of the first block of the given epoch (which is always a micro block).
     *
     * @param epochIndex The epoch index to query.
     * @returns The block number (height) of the first block of the given epoch (which is always a micro block).
     */
    getFirstBlockOf({ epochIndex }: JustEpochIndex, options?: HttpOptions): Promise<CallResult<number[], number, undefined>>;
    /**
     * Gets the block number of the first block of the given batch (which is always a micro block).
     *
     * @param batchIndex The batch index to query.
     * @returns The block number of the first block of the given batch (which is always a micro block).
     */
    getFirstBlockOfBatch({ batchIndex }: JustBatchIndex, options?: HttpOptions): Promise<CallResult<number[], number, undefined>>;
    /**
     * Gets the block number of the election macro block of the given epoch (which is always the last block).
     *
     * @param epochIndex The epoch index to query.
     * @returns The block number of the election macro block of the given epoch (which is always the last block).
     */
    getElectionBlockOf({ epochIndex }: JustEpochIndex, options?: HttpOptions): Promise<CallResult<number[], number, undefined>>;
    /**
     * Gets the block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
     *
     * @param batchIndex The batch index to query.
     * @returns The block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
     */
    getMacroBlockOf({ batchIndex }: JustBatchIndex, options?: HttpOptions): Promise<CallResult<number[], number, undefined>>;
    /**
     * Gets a boolean expressing if the batch at a given block number (height) is the first batch
     * of the epoch.
     *
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the batch at a given block number (height) is the first batch
     */
    getFirstBatchOfEpoch({ blockNumber }: JustBlockNumber, options?: HttpOptions): Promise<CallResult<number[], number, undefined>>;
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
    getSupplyAt({ genesisSupply, genesisTime, currentTime }: SupplyAtParams, options?: HttpOptions): Promise<CallResult<number[], number, undefined>>;
}

type policy_PolicyClient = PolicyClient;
declare const policy_PolicyClient: typeof PolicyClient;
declare namespace policy {
  export {
    policy_PolicyClient as PolicyClient,
  };
}

type SetAutomaticReactivationParams = {
    automaticReactivation: boolean;
};
declare class ValidatorClient extends HttpClient {
    constructor(url: URL, auth?: Auth);
    /**
     * Returns our validator address.
     */
    getAddress(options?: HttpOptions): Promise<CallResult<never[], `NQ${number} ${string}`, undefined>>;
    /**
     * Returns our validator signing key
     */
    getSigningKey(options?: HttpOptions): Promise<CallResult<never[], String, undefined>>;
    /**
     * Returns our validator voting key
    */
    getVotingKey(options?: HttpOptions): Promise<CallResult<never[], String, undefined>>;
    /**
     * Updates the configuration setting to automatically reactivate our validator
    */
    setAutomaticReactivation({ automaticReactivation }: SetAutomaticReactivationParams, options?: HttpOptions): Promise<CallResult<boolean[], null, undefined>>;
}

type validator_ValidatorClient = ValidatorClient;
declare const validator_ValidatorClient: typeof ValidatorClient;
declare namespace validator {
  export {
    validator_ValidatorClient as ValidatorClient,
  };
}

type ImportKeyParams = {
    keyData: string;
    passphrase?: string;
};
type IsAccountImportedParams = {
    address: Address;
};
type LockAccountParams = {
    address: Address;
};
type UnlockAccountParams = {
    address: Address;
    passphrase?: string;
    duration?: number;
};
type IsAccountLockedParams = {
    address: Address;
};
type CreateAccountParams = {
    passphrase?: string;
};
type SignParams = {
    message: string;
    address: Address;
    passphrase: string;
    isHex: boolean;
};
type VerifySignatureParams = {
    message: string;
    publicKey: string;
    signature: Signature;
    isHex: boolean;
};
declare class WalletClient extends HttpClient {
    constructor(url: URL, auth?: Auth);
    importRawKey({ keyData, passphrase }: ImportKeyParams, options?: HttpOptions): Promise<CallResult<(string | undefined)[], `NQ${number} ${string}`, undefined>>;
    isAccountImported({ address }: IsAccountImportedParams, options?: HttpOptions): Promise<CallResult<`NQ${number} ${string}`[], Boolean, undefined>>;
    listAccounts(options?: HttpOptions): Promise<CallResult<never[], Boolean, undefined>>;
    lockAccount({ address }: LockAccountParams, options?: HttpOptions): Promise<CallResult<`NQ${number} ${string}`[], null, undefined>>;
    createAccount(p?: CreateAccountParams, options?: HttpOptions): Promise<CallResult<(string | undefined)[], WalletAccount, undefined>>;
    unlockAccount({ address, passphrase, duration }: UnlockAccountParams, options?: HttpOptions): Promise<CallResult<(string | number | undefined)[], Boolean, undefined>>;
    isAccountLocked({ address }: IsAccountLockedParams, options?: HttpOptions): Promise<CallResult<`NQ${number} ${string}`[], Boolean, undefined>>;
    sign({ message, address, passphrase, isHex }: SignParams, options?: HttpOptions): Promise<CallResult<(string | boolean)[], Signature, undefined>>;
    verifySignature({ message, publicKey, signature, isHex }: VerifySignatureParams, options?: HttpOptions): Promise<CallResult<(string | boolean | Signature)[], Boolean, undefined>>;
}

type wallet_WalletClient = WalletClient;
declare const wallet_WalletClient: typeof WalletClient;
declare namespace wallet {
  export {
    wallet_WalletClient as WalletClient,
  };
}

declare class ZkpComponentClient extends HttpClient {
    constructor(url: URL, auth?: Auth);
    getZkpState(options?: HttpOptions): Promise<{
        error: {
            code: number;
            message: string;
        };
        data: undefined;
        context: Context<never[]>;
        metadata?: undefined;
    } | {
        error: undefined;
        data: {
            latestHeaderHash: string;
            latestBlockNumber: number;
            latestProof: string | undefined;
        };
        context: Context<never[]>;
        metadata: undefined;
    }>;
}

type zkpComponent_ZkpComponentClient = ZkpComponentClient;
declare const zkpComponent_ZkpComponentClient: typeof ZkpComponentClient;
declare namespace zkpComponent {
  export {
    zkpComponent_ZkpComponentClient as ZkpComponentClient,
  };
}

declare class Client {
    block: {
        current: (options?: HttpOptions) => Promise<CallResult<never[], number, undefined>>;
        getBy: <T extends GetBlockByParams>(p: T, options?: HttpOptions) => Promise<CallResult<(string | boolean | undefined)[], T["includeTransactions"] extends true ? Block : PartialBlock, undefined> | CallResult<(number | boolean | undefined)[], T["includeTransactions"] extends true ? Block : PartialBlock, undefined>>;
        latest: <T_1 extends GetLatestBlockParams>(p?: T_1, options?: HttpOptions) => Promise<CallResult<(boolean | undefined)[], T_1["includeTransactions"] extends true ? Block : PartialBlock, undefined>>;
        election: {
            after: ({ blockNumber }: {
                blockNumber: number;
            }, options?: HttpOptions) => Promise<CallResult<number[], number, undefined>>;
            before: ({ blockNumber }: {
                blockNumber: number;
            }, options?: HttpOptions) => Promise<CallResult<number[], number, undefined>>;
            last: ({ blockNumber }: {
                blockNumber: number;
            }, options?: HttpOptions) => Promise<CallResult<number[], number, undefined>>;
            getBy: ({ epochIndex }: {
                epochIndex: number;
            }, options?: HttpOptions) => Promise<CallResult<number[], number, undefined>>;
            subscribe: <T_2 extends SubscribeForValidatorElectionByAddressParams, O extends StreamOptions<Validator>>(p: T_2, userOptions?: Partial<O> | undefined) => Promise<Subscription<Validator, `NQ${number} ${string}`[]>>;
        };
        isElection: ({ blockNumber }: {
            blockNumber: number;
        }, options?: HttpOptions) => Promise<CallResult<number[], Boolean, undefined>>;
        macro: {
            after: ({ blockNumber }: {
                blockNumber: number;
            }, options?: HttpOptions) => Promise<CallResult<number[], number, undefined>>;
            before: ({ blockNumber }: {
                blockNumber: number;
            }, options?: HttpOptions) => Promise<CallResult<number[], number, undefined>>;
            last: ({ blockNumber }: {
                blockNumber: number;
            }, options?: HttpOptions) => Promise<CallResult<number[], number, undefined>>;
            getBy: ({ batchIndex }: {
                batchIndex: number;
            }, options?: HttpOptions) => Promise<CallResult<number[], number, undefined>>;
        };
        isMacro: ({ blockNumber }: {
            blockNumber: number;
        }, options?: HttpOptions) => Promise<CallResult<number[], Boolean, undefined>>;
        isMicro: ({ blockNumber }: {
            blockNumber: number;
        }, options?: HttpOptions) => Promise<CallResult<number[], Boolean, undefined>>;
        subscribe: <T_3 extends SubscribeForHeadBlockParams | SubscribeForHeadHashParams, O_1 extends StreamOptions<T_3 extends SubscribeForHeadBlockParams ? Block | PartialBlock : string>>(params: T_3, userOptions?: Partial<O_1> | undefined) => Promise<Subscription<any, boolean[]>>;
    };
    batch: {
        current: (options?: HttpOptions) => Promise<CallResult<never[], number, undefined>>;
        at: ({ blockNumber, justIndex }: {
            blockNumber: number;
            justIndex?: boolean | undefined;
        }, options?: HttpOptions) => Promise<CallResult<number[], number, undefined>>;
        firstBlock: ({ epochIndex }: {
            epochIndex: number;
        }, options?: HttpOptions) => Promise<CallResult<number[], number, undefined>>;
    };
    epoch: {
        current: (options?: HttpOptions) => Promise<CallResult<never[], number, undefined>>;
        at: ({ blockNumber, justIndex }: {
            blockNumber: number;
            justIndex?: boolean | undefined;
        }, options?: HttpOptions) => Promise<CallResult<number[], number, undefined>>;
        firstBlock: ({ epochIndex }: {
            epochIndex: number;
        }, options?: HttpOptions) => Promise<CallResult<number[], number, undefined>>;
        firstBatch: ({ blockNumber }: {
            blockNumber: number;
        }, options?: HttpOptions) => Promise<CallResult<number[], number, undefined>>;
    };
    transaction: {
        getBy: <T extends GetTransactionByParams>(p: T, options?: HttpOptions) => Promise<CallResult<(number | `NQ${number} ${string}` | undefined)[], Transaction[], undefined> | ({
            context: Context<string[] | number[] | number[]>;
        } & ({
            data: undefined;
            metadata: undefined;
            error: {
                code: number;
                message: string;
            };
        } | {
            data: T extends {
                hash: string;
            } ? Transaction : T extends GetTransactionsByAddressParams ? T["justHashes"] extends true ? string[] : Transaction[] : Transaction[];
            metadata: undefined;
            error: undefined;
        }))>;
        push: ({ transaction, withHighPriority }: {
            transaction: string;
            withHighPriority?: boolean | undefined;
        }, options?: HttpOptions) => Promise<CallResult<string[], string, undefined>>;
        minFeePerByte: (options?: HttpOptions) => Promise<CallResult<never[], number, undefined>>;
        create: (p: TransactionParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
        send: (p: TransactionParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
        sendSync: (p: TransactionParams, options: SendTxCallOptions) => Promise<unknown>;
    };
    inherent: {
        getBy: <T extends GetInherentsByParams>(p: T, options?: HttpOptions) => Promise<CallResult<number[], Inherent[], undefined>>;
    };
    account: {
        getBy: <T extends GetAccountByAddressParams>({ address, withMetadata }: T, options?: HttpOptions) => Promise<CallResult<`NQ${number} ${string}`[], Account, T["withMetadata"] extends true ? BlockchainState : undefined>>;
        importRawKey: ({ keyData, passphrase }: {
            keyData: string;
            passphrase?: string | undefined;
        }, options?: HttpOptions) => Promise<CallResult<(string | undefined)[], `NQ${number} ${string}`, undefined>>;
        new: (p?: {
            passphrase?: string | undefined;
        } | undefined, options?: HttpOptions) => Promise<CallResult<(string | undefined)[], WalletAccount, undefined>>;
        isImported: ({ address }: {
            address: `NQ${number} ${string}`;
        }, options?: HttpOptions) => Promise<CallResult<`NQ${number} ${string}`[], Boolean, undefined>>;
        list: (options?: HttpOptions) => Promise<CallResult<never[], Boolean, undefined>>;
        lock: ({ address }: {
            address: `NQ${number} ${string}`;
        }, options?: HttpOptions) => Promise<CallResult<`NQ${number} ${string}`[], null, undefined>>;
        unlock: ({ address, passphrase, duration }: {
            address: `NQ${number} ${string}`;
            passphrase?: string | undefined;
            duration?: number | undefined;
        }, options?: HttpOptions) => Promise<CallResult<(string | number | undefined)[], Boolean, undefined>>;
        isLocked: ({ address }: {
            address: `NQ${number} ${string}`;
        }, options?: HttpOptions) => Promise<CallResult<`NQ${number} ${string}`[], Boolean, undefined>>;
        sign: ({ message, address, passphrase, isHex }: {
            message: string;
            address: `NQ${number} ${string}`;
            passphrase: string;
            isHex: boolean;
        }, options?: HttpOptions) => Promise<CallResult<(string | boolean)[], Signature, undefined>>;
        verify: ({ message, publicKey, signature, isHex }: {
            message: string;
            publicKey: string;
            signature: Signature;
            isHex: boolean;
        }, options?: HttpOptions) => Promise<CallResult<(string | boolean | Signature)[], Boolean, undefined>>;
    };
    validator: {
        byAddress: <T extends GetValidatorByAddressParams>({ address }: T, options?: HttpOptions) => Promise<CallResult<`NQ${number} ${string}`[], PartialValidator, undefined>>;
        setAutomaticReactivation: ({ automaticReactivation }: {
            automaticReactivation: boolean;
        }, options?: HttpOptions) => Promise<CallResult<boolean[], null, undefined>>;
        selfNode: {
            address: (options?: HttpOptions) => Promise<CallResult<never[], `NQ${number} ${string}`, undefined>>;
            signingKey: (options?: HttpOptions) => Promise<CallResult<never[], String, undefined>>;
            votingKey: (options?: HttpOptions) => Promise<CallResult<never[], String, undefined>>;
        };
        activeList: <T_1 extends {
            withMetadata: boolean;
        }>({ withMetadata }?: T_1, options?: HttpOptions) => Promise<CallResult<never[], Validator[], T_1["withMetadata"] extends true ? BlockchainState : undefined>>;
        parked: <T_2 extends {
            withMetadata: boolean;
        }>({ withMetadata }?: T_2, options?: HttpOptions) => Promise<CallResult<never[], {
            blockNumber: number;
            validators: Validator[];
        }, T_2["withMetadata"] extends true ? BlockchainState : undefined>>;
        action: {
            new: {
                createTx: (p: NewValidatorTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
                sendTx: (p: NewValidatorTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            };
            update: {
                createTx: (p: UpdateValidatorTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
                sendTx: (p: UpdateValidatorTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            };
            deactivate: {
                createTx: (p: DeactiveValidatorTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
                sendTx: (p: DeactiveValidatorTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            };
            reactivate: {
                createTx: (p: ReactivateValidatorTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
                sendTx: (p: ReactivateValidatorTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            };
            unpark: {
                createTx: (p: UnparkValidatorTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
                sendTx: (p: UnparkValidatorTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            };
            retire: {
                createTx: (p: RetireValidatorTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
                sendTx: (p: RetireValidatorTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            };
            delete: {
                createTx: (p: DeleteValidatorTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
                sendTx: (p: DeleteValidatorTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            };
        };
    };
    slots: {
        at: <T extends GetSlotAtParams>({ blockNumber, offsetOpt, withMetadata }: T, options?: HttpOptions) => Promise<CallResult<(number | undefined)[], Slot, undefined>>;
        slashed: {
            current: <T_1 extends {
                withMetadata: boolean;
            }>({ withMetadata }?: T_1, options?: HttpOptions) => Promise<CallResult<never[], SlashedSlot[], undefined>>;
            previous: <T_2 extends {
                withMetadata: boolean;
            }>({ withMetadata }?: T_2, options?: HttpOptions) => Promise<CallResult<never[], SlashedSlot[], T_2["withMetadata"] extends true ? BlockchainState : undefined>>;
        };
    };
    mempool: {
        info: (options?: HttpOptions) => Promise<CallResult<never[], MempoolInfo, undefined>>;
        content: ({ includeTransactions }?: {
            includeTransactions: boolean;
        }, options?: HttpOptions) => Promise<CallResult<boolean[], (string | Transaction)[], undefined>>;
    };
    stakes: {
        new: {
            createTx: (p: StakeTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            sendTx: (p: StakeTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            sendSyncTx: (p: StakeTxParams, options?: SendTxCallOptions) => Promise<unknown>;
        };
    };
    staker: {
        fromValidator: <T extends GetStakersByAddressParams>({ address }: T, options?: HttpOptions) => Promise<CallResult<`NQ${number} ${string}`[], Staker[], undefined>>;
        getBy: <T_1 extends GetStakerByAddressParams>({ address }: T_1, options?: HttpOptions) => Promise<CallResult<`NQ${number} ${string}`[], Staker, undefined>>;
        new: {
            createTx: (p: StakerTxParams, options?: HttpOptions) => Promise<CallResult<(string | number | undefined)[], string, undefined>>;
            sendTx: (p: StakerTxParams, options?: HttpOptions) => Promise<CallResult<(string | number | undefined)[], string, undefined>>;
            sendSyncTx: (p: StakerTxParams, options?: SendTxCallOptions) => Promise<unknown>;
        };
        update: {
            createTx: (p: UpdateStakerTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            sendTx: (p: UpdateStakerTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            sendSyncTx: (p: UpdateStakerTxParams, options?: SendTxCallOptions) => Promise<unknown>;
        };
    };
    peers: {
        id: (options?: HttpOptions) => Promise<CallResult<never[], string, undefined>>;
        count: (options?: HttpOptions) => Promise<CallResult<never[], number, undefined>>;
        peers: (options?: HttpOptions) => Promise<CallResult<never[], string[], undefined>>;
        consensusEstablished: (options?: HttpOptions) => Promise<CallResult<never[], Boolean, undefined>>;
    };
    constant: {
        params: (options?: HttpOptions) => Promise<CallResult<never[], PolicyConstants, undefined>>;
        supply: ({ genesisSupply, genesisTime, currentTime }: {
            genesisSupply: number;
            genesisTime: number;
            currentTime: number;
        }, options?: HttpOptions) => Promise<CallResult<number[], number, undefined>>;
    };
    htlc: {
        new: {
            createTx: (p: HtlcTransactionParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            sendTx: (p: HtlcTransactionParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            sendSyncTx: (p: HtlcTransactionParams, options?: SendTxCallOptions) => Promise<unknown>;
        };
        redeem: {
            regular: {
                createTx: (p: RedeemRegularHtlcTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
                sendTx: (p: RedeemRegularHtlcTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
                sendSyncTx: (p: RedeemRegularHtlcTxParams, options?: SendTxCallOptions) => Promise<unknown>;
            };
            timeoutTx: {
                createTx: (p: RedeemTimeoutHtlcTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
                sendTx: (p: RedeemTimeoutHtlcTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
                sendSyncTx: (p: RedeemTimeoutHtlcTxParams, options?: SendTxCallOptions) => Promise<unknown>;
            };
            earlyTx: {
                createTx: (p: RedeemEarlyHtlcTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
                sendTx: (p: RedeemEarlyHtlcTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
                sendSyncTx: (p: RedeemEarlyHtlcTxParams, options?: SendTxCallOptions) => Promise<unknown>;
            };
        };
    };
    vesting: {
        new: {
            createTx: (p: VestingTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            sendTx: (p: VestingTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            sendSyncTx: (p: VestingTxParams, options: SendTxCallOptions) => Promise<unknown>;
        };
        redeem: {
            createTx: (p: RedeemVestingTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            sendTx: (p: RedeemVestingTxParams, options?: HttpOptions) => Promise<CallResult<(string | number)[], string, undefined>>;
            sendSyncTx: (p: RedeemVestingTxParams, options?: SendTxCallOptions) => Promise<unknown>;
        };
    };
    zeroKnowledgeProof: {
        state: (options?: HttpOptions) => Promise<{
            error: {
                code: number;
                message: string;
            };
            data: undefined;
            context: Context<never[]>;
            metadata?: undefined;
        } | {
            error: undefined;
            data: {
                latestHeaderHash: string;
                latestBlockNumber: number;
                latestProof: string | undefined;
            };
            context: Context<never[]>;
            metadata: undefined;
        }>;
    };
    logs: {
        subscribe: <T extends SubscribeForLogsByAddressesAndTypesParams, O extends StreamOptions<BlockLog>>(p: T, userOptions?: Partial<O> | undefined) => Promise<Subscription<BlockLog, (`NQ${number} ${string}`[] | LogType[])[]>>;
    };
    _modules: {
        blockchain: BlockchainClient;
        blockchainStreams: BlockchainStream;
        consensus: ConsensusClient;
        mempool: MempoolClient;
        network: NetworkClient;
        policy: PolicyClient;
        validator: ValidatorClient;
        wallet: WalletClient;
        zkpComponent: ZkpComponentClient;
    };
    constructor(url: URL, auth?: Auth);
}

export { Account, AccountType, Address, AppliedBlockLog, BasicAccount, BatchIndex, Block, BlockLog, BlockNumber, BlockType, blockchain as BlockchainClient, BlockchainState, blockchainStreams as BlockchainStream, CallResult, Coin, consensus as ConsensusClient, Context, CreateStakerLog, CreateValidatorLog, CurrentTime, DEFAULT_OPTIONS, DEFAULT_OPTIONS_SEND_TX, DEFAULT_TIMEOUT_CONFIRMATION, DeactivateValidatorLog, DeleteValidatorLog, ElectionMacroBlock, EpochIndex, ErrorStreamReturn, FailedTransactionLog, FilterStreamFn, GenesisSupply, GenesisTime, HTLCEarlyResolve, HTLCRegularTransfer, HTLCTimeoutResolve, Hash, HtlcAccount, HtlcCreateLog, HttpClient, HttpOptions, Inherent, Log, LogType, MacroBlock, MaybeStreamResponse, mempool as MempoolClient, MempoolInfo, MicroBlock, network as NetworkClient, ParkLog, ParkedSet, PartialBlock, PartialMacroBlock, PartialMicroBlock, PartialValidator, PayFeeLog, PayoutRewardLog, policy as PolicyClient, PolicyConstants, RawTransaction, ReactivateValidatorLog, RetireValidatorLog, RevertContractLog, RevertedBlockLog, SendTxCallOptions, Signature, SlashLog, SlashedSlot, Slot, StakeLog, Staker, StakerFeeDeductionLog, StreamOptions, Subscription, Transaction, TransactionLog, TransferLog, UnparkValidatorLog, UnstakeLog, UpdateStakerLog, UpdateValidatorLog, Validator, validator as ValidatorClient, ValidatorFeeDeductionLog, ValidityStartHeight, VestingAccount, VestingCreateLog, WS_DEFAULT_OPTIONS, WalletAccount, wallet as WalletClient, WebSocketClient, ZKPState, zkpComponent as ZkpComponentClient, Client as default };
