declare enum BlockType$1 {
    MICRO = "micro",
    MACRO = "macro"
}
declare enum LogType {
    PayFee = "pay-fee",
    Transfer = "transfer",
    HtlcCreate = "htlc-create",
    HtlcTimeoutResolve = "htlc-timeout-resolve",
    HtlcRegularTransfer = "htlc-regular-transfer",
    HtlcEarlyResolve = "htlc-early-resolve",
    VestingCreate = "vesting-create",
    CreateValidator = "create-validator",
    UpdateValidator = "update-validator",
    InactivateValidator = "inactivate-validator",
    ReactivateValidator = "reactivate-validator",
    UnparkValidator = "unpark-validator",
    CreateStaker = "create-staker",
    Stake = "stake",
    UpdateStaker = "update-staker",
    DeleteValidator = "delete-validator",
    Unstake = "unstake",
    PayoutReward = "payout-reward",
    Park = "park",
    Slash = "slash",
    RevertContract = "revert-contract",
    FailedTransaction = "failed-transaction"
}
declare enum AccountType$1 {
    BASIC = "basic",
    VESTING = "vesting",
    HTLC = "htlc"
}

type Address = `NQ${number} ${string}`
type Coin = number

type BlockNumber = number /* u32 */
type ValidityStartHeight$1 =
    | { relativeValidityStartHeight: number }
    | { absoluteValidityStartHeight: number }
type EpochIndex = number /* u32 */
type BatchIndex = number /* u32 */
type GenesisSupply$1 = number /* u64 */
type GenesisTime$1 = number /* u64 */
type CurrentTime$1 = number /* u64 */
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
    type: BlockType$1.MICRO;
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
    type: BlockType$1.MACRO;
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

type PartialValidator$1 = {
    address: Address;
    signingKey: string;
    votingKey: string;
    rewardAddress: Address;
    balance: Coin;
    numStakers: number;
}

type Validator = PartialValidator$1 & {
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

type BlockLog = {
    type:         "applied-block" | "reverted-block";
    inherents:    Inherent[];
    timestamp:    number;
    transactions: {
        hash: string;
        logs: Log[];
    }[];
}

type LogsByAddressesAndTypes = {
    type:              BlockType;
    from?:             string;
    fee?:              number;
    to?:               string;
    amount?:           number;
    stakerAddress?:    string;
    validatorAddress?: string;
    value?:            number;
}

// Metadatas
type BlockchainState = { 
    blockNumber: BlockNumber;
    blockHash: Hash;
}

type Interaction<Params extends any[], Result, Metadata = null> = {
    // In the request
    params: Params

    // In the response
    result: Result
    metadata: Metadata
}

type Maybe<T> = T | undefined

// TODO Review the metadatas types
type BlockchainMethods = {
    'getBlockNumber': Interaction<[], BlockNumber>,
    'getBatchNumber': Interaction<[], BatchIndex>,
    'getEpochNumber': Interaction<[], EpochIndex>,
    'getBlockByHash': Interaction<[Hash, /* include_transactions */Maybe<Boolean>], Block>,
    'getBlockByNumber': Interaction<[BlockNumber, /* include_transactions */Maybe<Boolean>], Block>,
    'getLatestBlock': Interaction<[/* include_transactions */Maybe<Boolean>], Block>,
    'getSlotAt': Interaction<[BlockNumber, /* offset_opt u32 */Maybe<number>], Slot, BlockchainState>,
    'getTransactionByHash': Interaction<[Hash], Transaction>,
    'getTransactionsByBlockNumber': Interaction<[BlockNumber], Transaction[]>,
    'getInherentsByBlockNumber': Interaction<[BlockNumber], Inherent[]>,
    'getTransactionsByBatchNumber': Interaction<[BatchIndex], Transaction[]>,
    'getInherentsByBatchNumber': Interaction<[BatchIndex], Inherent[]>,
    'getTransactionHashesByAddress': Interaction<[Address, /* max u16 */Maybe<number>], Hash[]>,
    'getTransactionsByAddress': Interaction<[Address, /* max u16 */Maybe<number>], Transaction[]>,
    'getAccountByAddress': Interaction<[Address], Account, BlockchainState>,
    'getActiveValidators': Interaction<[], Validator[], BlockchainState>,
    'getCurrentSlashedSlots': Interaction<[], SlashedSlot[], BlockchainState>,
    'getPreviousSlashedSlots': Interaction<[], SlashedSlot[], BlockchainState>,
    'getParkedValidators': Interaction<[], { blockNumber: BlockNumber, validators: Validator[]}, BlockchainState>,
    'getValidatorByAddress': Interaction<[Address, /* include_stakers */Maybe<Boolean>], Validator | PartialValidator, BlockchainState>,
    'getStakerByAddress': Interaction<[Address], Staker, BlockchainState>,
}

type BlockchainStreams = {
    'subscribeForHeadBlock': Interaction<[/* include_transactions */Maybe<Boolean>], Block | PartialBlock>,
    'subscribeForHeadBlockHash': Interaction<[], Hash>,
    'subscribeForValidatorElectionByAddress': Interaction<[Address], Validator, BlockchainState>,
    'subscribeForLogsByAddressesAndTypes': Interaction<[Address[], /*Check out logs-types.ts*/string[]], BlockLog, BlockchainState>,
}

type ConsensusMethods = {
    'isConsensusEstablished': Interaction<[], Boolean>,
    'getRawTransactionInfo': Interaction<[RawTransaction], Transaction>,
    'sendRawTransaction': Interaction<[RawTransaction], Hash>,
    'createBasicTransaction': Interaction<[/* wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendBasicTransaction': Interaction<[/* wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createBasicTransactionWithData': Interaction<[/* wallet */Address, /* recipient */Address, /*data*/string, /* value */Coin, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendBasicTransactionWithData': Interaction<[/* wallet */Address, /* recipient */Address, /*data*/string, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createNewVestingTransaction': Interaction<[/* wallet */Address, /* owner */Address, /* start_time */number, /* time_step */number, /* num_steps */number, /* value */Coin, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendNewVestingTransaction': Interaction<[/* wallet */Address, /* owner */Address, /* start_time */number, /* time_step */number, /* num_steps */number, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createRedeemVestingTransaction': Interaction<[/* wallet */Address, /* contract_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
   'sendRedeemVestingTransaction': Interaction<[/* wallet */Address, /* contract_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createNewHtlcTransaction': Interaction<[/* wallet */Address, /* htlc_sender */Address, /* htlc_recipient */Address, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* timeout */number, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'sendNewHtlcTransaction': Interaction<[/* wallet */Address, /* htlc_sender */Address, /* htlc_recipient */Address, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* timeout */number, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createRedeemRegularHtlcTransaction': Interaction<[/* wallet */Address, /* contract_address */Address,  /* recipient */Address, /* pre_image */AnyHash, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'sendRedeemRegularHtlcTransaction': Interaction<[/* wallet */Address, /* contract_address */Address,  /* recipient */Address, /* pre_image */AnyHash, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createRedeemTimeoutHtlcTransaction': Interaction<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'sendRedeemTimeoutHtlcTransaction': Interaction<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createRedeemEarlyHtlcTransaction': Interaction<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* htlc_sender_signature */String, /* htlc_recipient_signature */String, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'sendRedeemEarlyHtlcTransaction': Interaction<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* htlc_sender_signature */String, /* htlc_recipient_signature */String, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'signRedeemEarlyHtlcTransaction': Interaction<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], String>,
    'createNewStakerTransaction': Interaction<[/* sender_wallet */Address, /* staker */Address, /* delegation */Maybe<Address>, /* value */Coin, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendNewStakerTransaction': Interaction<[/* sender_wallet */Address, /* staker */Address, /* delegation */Maybe<Address>, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createStakeTransaction': Interaction<[/* sender_wallet */Address, /* staker */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendStakeTransaction': Interaction<[/* sender_wallet */Address, /* staker */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createUpdateStakerTransaction': Interaction<[/* sender_wallet */Address, /* staker */Address, /* new_delegation */Address, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendUpdateStakerTransaction': Interaction<[/* sender_wallet */Address, /* staker */Address, /* new_delegation */Address, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createUnstakeTransaction': Interaction<[/* sender_wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendUnstakeTransaction': Interaction<[/* sender_wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createNewValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* voting_secret_key */String, /* reward_address */Address, /* signal_data */String, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendNewValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* voting_secret_key */String, /* reward_address */Address, /* signal_data */String, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createUpdateValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* new_signing_secret_key */String, /* new_voting_secret_key */String, /* new_reward_address */Address, /* new_signal_data */String, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendUpdateValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* new_signing_secret_key */String, /* new_voting_secret_key */String, /* new_reward_address */Address, /* new_signal_data */String, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createInactivateValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendInactivateValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */ValidityStartHeight], Hash>,
    'createReactivateValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */ValidityStartHeight], RawTransaction>,
    'sendReactivateValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */ValidityStartHeight], Hash>,
    'createUnparkValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */ValidityStartHeight], RawTransaction>,
    'sendUnparkValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */ValidityStartHeight], Hash>,
    'createDeleteValidatorTransaction': Interaction<[/* sender_wallet */Address, /* recipient */Address, /* fee */Coin, /* value */Coin, /* validity_start_height */ValidityStartHeight], RawTransaction>,
    'sendDeleteValidatorTransaction': Interaction<[/* sender_wallet */Address, /* recipient */Address, /* fee */Coin, /* value */Coin, /* validity_start_height */ValidityStartHeight], Hash>,
}

type MempoolMethods = {
    'pushTransaction': Interaction<[/* transaction */RawTransaction], Hash>,
    'pushHighPriorityTransaction': Interaction<[/* transaction */RawTransaction], Hash>,
    'mempoolContent': Interaction<[/* include_transactions */Boolean], (Hash | Transaction)[]>,
    'mempool': Interaction<[], MempoolInfo>,
    'getMinFeePerByte': Interaction<[], /* f64 */number>,
}

type NetworkMethods = {
    'getPeerId': Interaction<[], String>,
    'getPeerCount': Interaction<[], number>,
    'getPeerList': Interaction<[], string[]>,
}

type PolicyMethods = {
    'getPolicyConstants': Interaction<[], PolicyConstants>,
    'getEpochAt': Interaction<[BlockNumber], EpochIndex>,
    'getEpochIndexAt': Interaction<[BlockNumber], EpochIndex>,
    'getBatchAt': Interaction<[BlockNumber], BatchIndex>,
    'getBatchIndexAt': Interaction<[BlockNumber], BatchIndex>,
    'getElectionBlockAfter': Interaction<[BlockNumber], BlockNumber>,
    'getElectionBlockBefore': Interaction<[BlockNumber], BlockNumber>,
    'getLastElectionBlock': Interaction<[BlockNumber], BlockNumber>,
    'getIsElectionBlockAt': Interaction<[BlockNumber], Boolean>,
    'getMacroBlockAfter': Interaction<[BlockNumber], BlockNumber>,
    'getMacroBlockBefore': Interaction<[BlockNumber], BlockNumber>,
    'getLastMacroBlock': Interaction<[BlockNumber], BlockNumber>,
    'getIsMacroBlockAt': Interaction<[BlockNumber], Boolean>,
    'getIsMicroBlockAt': Interaction<[BlockNumber], Boolean>,
    'getFirstBlockOf': Interaction<[EpochIndex], BlockNumber>,
    'getFirstBlockOfBatch': Interaction<[BatchIndex], BlockNumber>,
    'getElectionBlockOf': Interaction<[EpochIndex], BlockNumber>,
    'getMacroBlockOf': Interaction<[BatchIndex], BlockNumber>,
    'getFirstBatchOfEpoch': Interaction<[BlockNumber], Boolean>,
    'getSupplyAt': Interaction<[GenesisSupply, GenesisTime, CurrentTime], number>,
}

type ValidatorMethods = {
    'getAddress': Interaction<[], Address>,
    'getSigningKey': Interaction<[], String>,
    'getVotingKey': Interaction<[], String>,
    'setAutomaticReactivation': Interaction<[/* automatic_reactivation */Boolean], null>,
}

type WalletMethods = {
    'importRawKey': Interaction<[/* key_data */String, /* passphrase */Maybe<String>], Address>,
    'isAccountImported': Interaction<[/* address */Address], Boolean>,
    'listAccounts': Interaction<[], Address[]>,
    'lockAccount': Interaction<[/* address */Address], null>,
    'createAccount': Interaction<[/* passphrase */Maybe<String>], WalletAccount>,
    'unlockAccount': Interaction<[/* address */Address, /* passphrase */String, /* duration: u64 */Maybe<number>], Boolean>,
    'isAccountLocked': Interaction<[/* address */Address], Boolean>,
    'sign': Interaction<[/* message */String, /* address */Address, /* passphrase */Maybe<String>, /* is_hex */Boolean], Signature>,
    'verifySignature': Interaction<[/* message */String, /* public_key */PublicKey, /* signature */Signature, /* is_hex */Boolean], Boolean>,
}

type ZKPStateKebab = {
    'latest-header-number': Hash
    'latest-block-number': BlockNumber
    'latest-proof'?: string
}

type ZkpComponentMethods = {
    'getZkpState': Interaction<[], ZKPStateKebab>,
}

type Methods = PolicyMethods & BlockchainMethods & ConsensusMethods & MempoolMethods & NetworkMethods & ValidatorMethods & WalletMethods & ZkpComponentMethods & StreamOpened
type MethodName = keyof Methods

type Streams = BlockchainStreams
type StreamName = keyof Streams

type RpcRequest<M extends InteractionName> = {
    jsonrpc: string,
    method: M,
    params: Interactions[M]['params'],
    id: number
}

type StreamResponsePayload<S extends Streams> = {
    data: S['result'];
    metadata: S['metadata'];
} & {}

type StreamResponse<S extends StreamName> = {
    jsonrpc: string,
    method: S,
    params: {
        subscription: number,
        result: StreamResponsePayload<Streams[S]>
    }
}

type ErrorCallReturn = {
    code: number,
    message: string,
}

type ContextCall = {
    method: string,
    params: (string | number | boolean | null)[],
    id: number,
}

type MaybeResponse<T> = {
    error: ErrorCallReturn,
    data: undefined
    context: ContextCall
} | {
    error: undefined,
    data: T,
    context: ContextCall
}

type Subscription<T extends StreamName, ShowMetadata extends boolean | undefined = false, IncludeBody extends boolean = false> = {
    next: (callback: (data: CallbackParam<T, ShowMetadata, IncludeBody>) => void) => void;
    error: (callback: (error: any) => void) => void;
    close: () => void;
    getSubscriptionId: () => number;
};
type CallbackParam<T extends StreamName, ShowMetadata extends boolean | undefined = false, IncludeBody extends boolean = false> = T extends 'subscribeForHeadBlock' ? IncludeBody extends true ? Block : PartialBlock : ShowMetadata extends true ? StreamResponse<T>['params']['result'] : StreamResponse<T>['params']['result']['data'];

declare class Client$1 {
    private httpClient;
    private webSocketClient;
    constructor(url: URL);
    call<T extends MethodName>(method: T, params: RpcRequest<T>["params"], withMetadata?: boolean): Promise<{
        error: ErrorCallReturn;
        data: undefined;
        context: ContextCall;
    } | {
        error: undefined;
        data: (T extends "streamOpened" ? number : {
            data: any;
            metadata: any;
        }) extends {
            metadata: null;
        } ? ({
            metadata: null;
        } & (T extends "streamOpened" ? number : {
            data: any;
            metadata: any;
        }))["data"] : (T extends "streamOpened" ? number : {
            data: any;
            metadata: any;
        })["data"] | (T extends "streamOpened" ? number : {
            data: any;
            metadata: any;
        });
        context: ContextCall;
    }>;
    subscribe<T extends StreamName>(event: T, params: RpcRequest<T>["params"], withMetadata?: boolean): Promise<Subscription<T, boolean, false>>;
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
    includeStakers?: boolean;
};
type GetStakerByAddressParams = {
    address: Address;
};
type SubscribeForHeadBlockParams = {
    filter: 'HASH' | 'FULL' | 'PARTIAL';
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
type WithMetadata<T> = {
    data: T;
    metadata: BlockchainState;
};
type ResultGetTransactionsByAddress<T extends GetTransactionsByAddressParams> = T extends {
    justHashes: true;
} ? Hash[] : Transaction[];
type ResultGetTransactionsBy<T> = Promise<T extends {
    hash: Hash;
} ? Transaction : T extends {
    address: Address;
} ? ResultGetTransactionsByAddress<T> : Transaction[]>;
type BlockSubscription<T extends SubscribeForHeadBlockParams> = Subscription<T["filter"] extends 'HASH' ? 'subscribeForHeadBlockHash' : 'subscribeForHeadBlock', false, T["filter"] extends 'FULL' ? true : false>;
declare class BlockchainClient extends Client$1 {
    constructor(url: URL);
    /**
     * Returns the block number for the current head.
     */
    getBlockNumber(): Promise<MaybeResponse<BlockNumber>>;
    /**
     * Returns the batch number for the current head.
     */
    getBatchNumber(): Promise<MaybeResponse<BatchIndex>>;
    /**
     * Returns the epoch number for the current head.
     */
    getEpochNumber(): Promise<MaybeResponse<BatchIndex>>;
    /**
     * Tries to fetch a block given its hash or block number. It has an option to include the transactions in the block, which defaults to false.
     */
    getBlockBy<T extends GetBlockByParams>(p?: T): Promise<T extends {
        includeTransactions: true;
    } ? MaybeResponse<Block> : MaybeResponse<PartialBlock>>;
    /**
     * Returns the block at the head of the main chain. It has an option to include the
     * transactions in the block, which defaults to false.
     */
    getLatestBlock<T extends GetLatestBlockParams>(p?: T): Promise<MaybeResponse<T extends {
        includeTransactions: true;
    } ? Block : PartialBlock>>;
    /**
     * Returns the information for the slot owner at the given block height and offset. The
     * offset is optional, it will default to getting the offset for the existing block
     * at the given height.
     */
    getSlotAt<T extends GetSlotAtParams>({ blockNumber, offsetOpt, withMetadata }: T): Promise<MaybeResponse<T extends {
        withMetadata: true;
    } ? WithMetadata<Slot> : Slot>>;
    /**
     * Fetchs the transaction(s) given the parameters. The parameters can be a hash, a block number, a batch number or an address.
     *
     * In case of address, it returns the latest transactions for a given address. All the transactions
     * where the given address is listed as a recipient or as a sender are considered. Reward
     * transactions are also returned. It has an option to specify the maximum number of transactions
     * to fetch, it defaults to 500.
     */
    getTransactionBy<T extends GetTransactionByParams>(p: T): Promise<MaybeResponse<ResultGetTransactionsBy<T>>>;
    /**
     * Returns all the inherents (including reward inherents) for the parameter. Note
     * that this only considers blocks in the main chain.
     */
    getInherentsBy<T extends GetInherentsByParams>(p: T): Promise<MaybeResponse<Inherent[]>>;
    /**
     * Tries to fetch the account at the given address.
     */
    getAccountBy<T extends GetAccountByAddressParams>({ address, withMetadata }: T): Promise<MaybeResponse<T extends {
        withMetadata: true;
    } ? WithMetadata<Account> : Account>>;
    /**
    * Returns a collection of the currently active validator's addresses and balances.
    */
    getActiveValidators<T extends {
        withMetadata: boolean;
    }>({ withMetadata }?: T): Promise<MaybeResponse<T extends {
        withMetadata: true;
    } ? WithMetadata<Validator[]> : Validator[]>>;
    /**
     * Returns information about the currently slashed slots. This includes slots that lost rewards
     * and that were disabled.
     */
    getCurrentSlashedSlots<T extends {
        withMetadata: boolean;
    }>({ withMetadata }?: T): Promise<MaybeResponse<T extends {
        withMetadata: true;
    } ? WithMetadata<SlashedSlot[]> : SlashedSlot[]>>;
    /**
     * Returns information about the slashed slots of the previous batch. This includes slots that
     * lost rewards and that were disabled.
     */
    getPreviousSlashedSlots<T extends {
        withMetadata: boolean;
    }>({ withMetadata }?: T): Promise<MaybeResponse<T extends {
        withMetadata: true;
    } ? WithMetadata<SlashedSlot[]> : SlashedSlot[]>>;
    /**
     * Returns information about the currently parked validators.
     */
    getParkedValidators<T extends {
        withMetadata: boolean;
    }>({ withMetadata }?: T): Promise<MaybeResponse<T extends {
        withMetadata: true;
    } ? WithMetadata<{
        blockNumber: BlockNumber;
        validators: Validator[];
    }> : {
        blockNumber: BlockNumber;
        validators: Validator[];
    }>>;
    /**
     * Tries to fetch a validator information given its address. It has an option to include a map
     * containing the addresses and stakes of all the stakers that are delegating to the validator.
     */
    getValidatorBy<T extends GetValidatorByAddressParams>(p?: T): Promise<MaybeResponse<T extends {
        withMetadata: true;
    } ? WithMetadata<T extends {
        includeStakers: true;
    } ? Validator : PartialValidator$1> : T extends {
        includeStakers: true;
    } ? Validator : PartialValidator$1>>;
    /**
     * Tries to fetch a staker information given its address.
     */
    getStakerByAddress<T extends GetStakerByAddressParams>({ address }: T): Promise<MaybeResponse<T extends {
        withMetadata: true;
    } ? WithMetadata<Staker> : Staker>>;
    /**
     * Subscribes to new block events.
     */
    subscribeForBlocks<T extends SubscribeForHeadBlockParams>({ filter }: T): Promise<BlockSubscription<T>>;
    /**
     * Subscribes to pre epoch validators events.
     */
    subscribeForValidatorElectionByAddress<T extends SubscribeForValidatorElectionByAddressParams>(p?: T): Promise<Subscription<"subscribeForValidatorElectionByAddress", T extends {
        withMetadata: true;
    } ? true : false>>;
    /**
     * Subscribes to log events related to a given list of addresses and of any of the log types provided.
     * If addresses is empty it does not filter by address. If log_types is empty it won't filter by log types.
     * Thus the behavior is to assume all addresses or log_types are to be provided if the corresponding vec is empty.
     */
    subscribeForLogsByAddressesAndTypes<T extends SubscribeForLogsByAddressesAndTypesParams>(p?: T): Promise<Subscription<"subscribeForLogsByAddressesAndTypes", T extends {
        withMetadata: true;
    } ? true : false>>;
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
} & ValidityStartHeight$1;
type VestingTxParams = {
    wallet: Address;
    owner: Address;
    startTime: number;
    timeStep: number;
    numSteps: number;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight$1;
type RedeemVestingTxParams = {
    wallet: Address;
    contractAddress: Address;
    recipient: Address;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight$1;
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
} & ValidityStartHeight$1;
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
} & ValidityStartHeight$1;
type RedeemTimeoutHtlcTxParams = {
    wallet: Address;
    contractAddress: Address;
    recipient: Address;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight$1;
type RedeemEarlyHtlcTxParams = {
    wallet: Address;
    htlcAddress: Address;
    recipient: Address;
    htlcSenderSignature: string;
    htlcRecipientSignature: string;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight$1;
type SignRedeemEarlyHtlcParams = {
    wallet: Address;
    htlcAddress: Address;
    recipient: Address;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight$1;
type StakerTxParams = {
    senderWallet: Address;
    staker: Address;
    delegation: Address | undefined;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight$1;
type StakeTxParams = {
    senderWallet: Address;
    staker: Address;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight$1;
type UpdateStakerTxParams = {
    senderWallet: Address;
    staker: Address;
    newDelegation: Address;
    fee: Coin;
} & ValidityStartHeight$1;
type UnstakeTxParams = {
    staker: Address;
    recipient: Address;
    value: Coin;
    fee: Coin;
} & ValidityStartHeight$1;
type ValidatorTxParams = {
    senderWallet: Address;
    validator: Address;
    signingSecretKey: string;
    votingSecretKey: string;
    rewardAddress: Address;
    signalData: string;
    fee: Coin;
} & ValidityStartHeight$1;
type UpdateValidatorTxParams = {
    senderWallet: Address;
    validator: Address;
    newSigningSecretKey: string;
    newVotingSecretKey: string;
    newRewardAddress: Address;
    newSignalData: string;
    fee: Coin;
} & ValidityStartHeight$1;
type InactiveValidatorTxParams = {
    senderWallet: Address;
    validator: Address;
    signingSecretKey: string;
    fee: Coin;
} & ValidityStartHeight$1;
type ReactivateValidatorTxParams = {
    senderWallet: Address;
    validator: Address;
    signingSecretKey: string;
    fee: Coin;
} & ValidityStartHeight$1;
type UnparkValidatorTxParams = {
    senderWallet: Address;
    validator: Address;
    signingSecretKey: string;
    fee: Coin;
} & ValidityStartHeight$1;
type DeleteValidatorTxParams = {
    senderWallet: Address;
    validator: Address;
    fee: Coin;
    value: Coin;
} & ValidityStartHeight$1;
declare class ConsensusClient extends Client$1 {
    constructor(url: URL);
    private getValidityStartHeight;
    /**
     * Returns a boolean specifying if we have established consensus with the network
     */
    isConsensusEstablished(): Promise<MaybeResponse<Boolean>>;
    /**
     * Given a serialized transaction, it will return the corresponding transaction struct
     */
    getRawTransactionInfo({ rawTransaction }: RawTransactionInfoParams): Promise<MaybeResponse<Transaction>>;
    /**
     * Creates a serialized transaction
     */
    createTransaction(p: TransactionParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a transaction
     */
    sendTransaction(p: TransactionParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized transaction creating a new vesting contract
     */
    createNewVestingTransaction(p: VestingTxParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a transaction creating a new vesting contract to the network
     */
    sendNewVestingTransaction(p: VestingTxParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized transaction redeeming a vesting contract
     */
    createRedeemVestingTransaction(p: RedeemVestingTxParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a transaction redeeming a vesting contract
     */
    sendRedeemVestingTransaction(p: RedeemVestingTxParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized transaction creating a new HTLC contract
     */
    createNewHtlcTransaction(p: HtlcTransactionParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a transaction creating a new HTLC contract
     */
    sendNewHtlcTransaction(p: HtlcTransactionParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized transaction redeeming an HTLC contract
     */
    createRedeemRegularHtlcTransaction(p: RedeemRegularHtlcTxParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a transaction redeeming an HTLC contract
     */
    sendRedeemRegularHtlcTransaction(p: RedeemRegularHtlcTxParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized transaction redeeming a HTLC contract using the `TimeoutResolve`
     * method
     */
    createRedeemTimeoutHtlcTransaction(p: RedeemTimeoutHtlcTxParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a transaction redeeming a HTLC contract using the `TimeoutResolve`
     * method to network
     */
    sendRedeemTimeoutHtlcTransaction(p: RedeemTimeoutHtlcTxParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized transaction redeeming a HTLC contract using the `EarlyResolve`
     * method.
     */
    createRedeemEarlyHtlcTransaction(p: RedeemEarlyHtlcTxParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a transaction redeeming a HTLC contract using the `EarlyResolve`
     * method.
     */
    sendRedeemEarlyHtlcTransaction(p: RedeemEarlyHtlcTxParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized signature that can be used to redeem funds from a HTLC contract using
     * the `EarlyResolve` method.
     */
    signRedeemEarlyHtlcTransaction(p: SignRedeemEarlyHtlcParams): Promise<MaybeResponse<String>>;
    /**
     * Returns a serialized `new_staker` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    createNewStakerTransaction(p: StakerTxParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a `new_staker` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    sendNewStakerTransaction(p: StakerTxParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized `stake` transaction. The funds to be staked and the transaction fee will
     * be paid from the `sender_wallet`.
     */
    createStakeTransaction(p: StakeTxParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a `stake` transaction. The funds to be staked and the transaction fee will
     * be paid from the `sender_wallet`.
     */
    sendStakeTransaction(p: StakeTxParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized `update_staker` transaction. You can pay the transaction fee from a basic
     * account (by providing the sender wallet) or from the staker account's balance (by not
     * providing a sender wallet).
     */
    createUpdateStakerTransaction(p: UpdateStakerTxParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a `update_staker` transaction. You can pay the transaction fee from a basic
     * account (by providing the sender wallet) or from the staker account's balance (by not
     * providing a sender wallet).
     */
    sendUpdateStakerTransaction(p: UpdateStakerTxParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized `unstake` transaction. The transaction fee will be paid from the funds
     * being unstaked.
     */
    createUnstakeTransaction(p: UnstakeTxParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a `unstake` transaction. The transaction fee will be paid from the funds
     * being unstaked.
     */
    sendUnstakeTransaction(p: UnstakeTxParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized `new_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee and the validator deposit.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * "" = Set the signal data field to None.
     * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
     */
    createNewValidatorTransaction(p: ValidatorTxParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a `new_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee and the validator deposit.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * "" = Set the signal data field to None.
     * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
     */
    sendNewValidatorTransaction(p: ValidatorTxParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized `update_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * null = No change in the signal data field.
     * "" = Change the signal data field to None.
     * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
     */
    createUpdateValidatorTransaction(p: UpdateValidatorTxParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a `update_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * null = No change in the signal data field.
     * "" = Change the signal data field to None.
     * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
     */
    sendUpdateValidatorTransaction(p: UpdateValidatorTxParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized `inactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    createInactivateValidatorTransaction(p: InactiveValidatorTxParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a `inactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    sendInactivateValidatorTransaction(p: InactiveValidatorTxParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized `reactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    createReactivateValidatorTransaction(p: ReactivateValidatorTxParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a `reactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    sendReactivateValidatorTransaction(p: ReactivateValidatorTxParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized `unpark_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    createUnparkValidatorTransaction(p: UnparkValidatorTxParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a `unpark_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    sendUnparkValidatorTransaction(p: UnparkValidatorTxParams): Promise<MaybeResponse<Hash>>;
    /**
     * Returns a serialized `delete_validator` transaction. The transaction fee will be paid from the
     * validator deposit that is being returned.
     * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
     * Failed delete validator transactions can diminish the validator deposit
     */
    createDeleteValidatorTransaction(p: DeleteValidatorTxParams): Promise<MaybeResponse<RawTransaction>>;
    /**
     * Sends a `delete_validator` transaction. The transaction fee will be paid from the
     * validator deposit that is being returned.
     * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
     * Failed delete validator transactions can diminish the validator deposit
     */
    sendDeleteValidatorTransaction(p: DeleteValidatorTxParams): Promise<MaybeResponse<Hash>>;
}

type PushTransactionParams = {
    transaction: RawTransaction;
    withHighPriority?: boolean;
};
type MempoolContentParams = {
    includeTransactions: boolean;
};
declare class MempoolClient extends Client$1 {
    constructor(url: URL);
    /**
     * Pushes the given serialized transaction to the local mempool
     *
     * @param transaction Serialized transaction
     * @returns Transaction hash
     */
    pushTransaction({ transaction, withHighPriority }: PushTransactionParams): Promise<MaybeResponse<Hash>>;
    /**
     * Content of the mempool
     *
     * @param includeTransactions
     * @returns
     */
    mempoolContent({ includeTransactions }?: MempoolContentParams): Promise<MaybeResponse<(Hash | Transaction)[]>>;
    /**
     * @returns
     */
    mempool(): Promise<MaybeResponse<MempoolInfo>>;
    /**
     *
     * @returns
     */
    getMinFeePerByte(): Promise<MaybeResponse<number>>;
}

declare class NetworkClient extends Client$1 {
    constructor(url: URL);
    /**
     * The peer ID for our local peer.
     */
    getPeerId(): Promise<MaybeResponse<String>>;
    /**
     * Returns the number of peers.
     */
    getPeerCount(): Promise<MaybeResponse<number>>;
    /**
     * Returns a list with the IDs of all our peers.
     */
    getPeerList(): Promise<MaybeResponse<String[]>>;
}

type JustBlockNumber = {
    blockNumber: BlockNumber;
};
type JustEpochIndex = {
    epochIndex: number;
};
type JustBatchIndex = {
    batchIndex: number;
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
declare class PolicyClient extends Client$1 {
    constructor(url: URL);
    /**
     * Gets a bundle of policy constants
     */
    getPolicyConstants(): Promise<MaybeResponse<PolicyConstants>>;
    /**
     * Gets the epoch number at a given `block_number` (height)
     *
     * @param blockNumber The block number (height) to query.
     * @param justIndex The epoch index is the number of a block relative to the epoch it is in.
     * For example, the first block of any epoch always has an epoch index of 0.
     * @returns The epoch number at the given block number (height) or index
     */
    getEpochAt({ blockNumber, justIndex }: BlockNumberWithIndex): Promise<MaybeResponse<number>>;
    /**
     * Gets the batch number at a given `block_number` (height)
     *
     * @param blockNumber The block number (height) to query.
     * @param justIndex The batch index is the number of a block relative to the batch it is in.
     * For example, the first block of any batch always has an epoch index of 0.
     * @returns The epoch number at the given block number (height).
     */
    getBatchAt({ blockNumber, justIndex }: BlockNumberWithIndex): Promise<MaybeResponse<number>>;
    /**
     * Gets the number (height) of the next election macro block after a given block number (height).
     *
     * @param blockNumber The block number (height) to query.
     * @returns The number (height) of the next election macro block after a given block number (height).
     */
    getElectionBlockAfter({ blockNumber }: JustBlockNumber): Promise<MaybeResponse<number>>;
    /**
     * Gets the block number (height) of the preceding election macro block before a given block number (height).
     * If the given block number is an election macro block, it returns the election macro block before it.
     *
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the preceding election macro block before a given block number (height).
     */
    getElectionBlockBefore({ blockNumber }: JustBlockNumber): Promise<MaybeResponse<number>>;
    /**
     * Gets the block number (height) of the last election macro block at a given block number (height).
     * If the given block number is an election macro block, then it returns that block number.
     *
     * @param blockNumber The block number (height) to query.
     * @returns
     */
    getLastElectionBlock({ blockNumber }: JustBlockNumber): Promise<MaybeResponse<number>>;
    /**
     * Gets a boolean expressing if the block at a given block number (height) is an election macro block.
     *
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the block at a given block number (height) is an election macro block.
     */
    getIsElectionBlockAt({ blockNumber }: JustBlockNumber): Promise<MaybeResponse<Boolean>>;
    /**
     * Gets the block number (height) of the next macro block after a given block number (height).
     *
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the next macro block after a given block number (height).
     */
    getMacroBlockAfter({ blockNumber }: JustBlockNumber): Promise<MaybeResponse<number>>;
    /**
     * Gets the block number (height) of the preceding macro block before a given block number (height).
     *
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the preceding macro block before a given block number (height).
     */
    getMacroBlockBefore({ blockNumber }: JustBlockNumber): Promise<MaybeResponse<number>>;
    /**
     * Gets the block number (height) of the last macro block at a given block number (height).
     * If the given block number is a macro block, then it returns that block number.
     *
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the last macro block at a given block number (height).
     */
    getLastMacroBlock({ blockNumber }: JustBlockNumber): Promise<MaybeResponse<number>>;
    /**
     * Gets a boolean expressing if the block at a given block number (height) is a macro block.
     *
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the block at a given block number (height) is a macro block.
     */
    getIsMacroBlockAt({ blockNumber }: JustBlockNumber): Promise<MaybeResponse<Boolean>>;
    /**
     * Gets the block number (height) of the next micro block after a given block number (height).
     *
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the next micro block after a given block number (height).
     */
    getIsMicroBlockAt({ blockNumber }: JustBlockNumber): Promise<MaybeResponse<Boolean>>;
    /**
     * Gets the block number (height) of the first block of the given epoch (which is always a micro block).
     *
     * @param epochIndex The epoch index to query.
     * @returns The block number (height) of the first block of the given epoch (which is always a micro block).
     */
    getFirstBlockOf({ epochIndex }: JustEpochIndex): Promise<MaybeResponse<number>>;
    /**
     * Gets the block number of the first block of the given batch (which is always a micro block).
     *
     * @param batchIndex The batch index to query.
     * @returns The block number of the first block of the given batch (which is always a micro block).
     */
    getFirstBlockOfBatch({ batchIndex }: JustBatchIndex): Promise<MaybeResponse<number>>;
    /**
     * Gets the block number of the election macro block of the given epoch (which is always the last block).
     *
     * @param epochIndex The epoch index to query.
     * @returns The block number of the election macro block of the given epoch (which is always the last block).
     */
    getElectionBlockOf({ epochIndex }: JustEpochIndex): Promise<MaybeResponse<number>>;
    /**
     * Gets the block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
     *
     * @param batchIndex The batch index to query.
     * @returns The block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
     */
    getMacroBlockOf({ batchIndex }: JustBatchIndex): Promise<MaybeResponse<number>>;
    /**
     * Gets a boolean expressing if the batch at a given block number (height) is the first batch
     * of the epoch.
     *
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the batch at a given block number (height) is the first batch
     */
    getFirstBatchOfEpoch({ blockNumber }: JustBlockNumber): Promise<MaybeResponse<Boolean>>;
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
    getSupplyAt({ genesisSupply, genesisTime, currentTime }: SupplyAtParams): Promise<MaybeResponse<number>>;
}

type SetAutomaticReactivationParams = {
    automaticReactivation: boolean;
};
declare class ValidatorClient extends Client$1 {
    constructor(url: URL);
    /**
     * Returns our validator address.
     */
    getAddress(): Promise<MaybeResponse<String>>;
    /**
     * Returns our validator signing key
     */
    getSigningKey(): Promise<MaybeResponse<String>>;
    /**
     * Returns our validator voting key
     */
    getVotingKey(): Promise<MaybeResponse<String>>;
    /**
     * Updates the configuration setting to automatically reactivate our validator
     */
    setAutomaticReactivation({ automaticReactivation }: SetAutomaticReactivationParams): Promise<MaybeResponse<null>>;
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
declare class WalletClient extends Client$1 {
    constructor(url: URL);
    importRawKey({ keyData, passphrase }: ImportKeyParams): Promise<MaybeResponse<Address>>;
    isAccountImported({ address }: IsAccountImportedParams): Promise<MaybeResponse<Boolean>>;
    listAccounts(): Promise<MaybeResponse<Address[]>>;
    lockAccount({ address }: LockAccountParams): Promise<MaybeResponse<null>>;
    createAccount({ passphrase }: CreateAccountParams): Promise<MaybeResponse<WalletAccount>>;
    unlockAccount({ address, passphrase, duration }: UnlockAccountParams): Promise<MaybeResponse<Boolean>>;
    isAccountLocked({ address }: IsAccountLockedParams): Promise<MaybeResponse<Boolean>>;
    sign({ message, address, passphrase, isHex }: SignParams): Promise<MaybeResponse<Signature>>;
    verifySignature({ message, publicKey, signature, isHex }: VerifySignatureParams): Promise<MaybeResponse<Boolean>>;
}

declare class ZkpComponentClient extends Client$1 {
    constructor(url: URL);
    getZkpState(): Promise<MaybeResponse<ZKPState>>;
}

declare class Client {
    block: {
        current: () => Promise<MaybeResponse<number>>;
        by: <T extends GetBlockByParams>(p?: T) => Promise<T extends {
            includeTransactions: true;
        } ? MaybeResponse<Block> : MaybeResponse<PartialBlock>>;
        latest: <T_1 extends GetLatestBlockParams>(p?: T_1) => Promise<MaybeResponse<T_1 extends {
            includeTransactions: true;
        } ? Block : PartialBlock>>;
        election: {
            after: ({ blockNumber }: {
                blockNumber: number;
            }) => Promise<MaybeResponse<number>>;
            before: ({ blockNumber }: {
                blockNumber: number;
            }) => Promise<MaybeResponse<number>>;
            last: ({ blockNumber }: {
                blockNumber: number;
            }) => Promise<MaybeResponse<number>>;
            get: ({ epochIndex }: {
                epochIndex: number;
            }) => Promise<MaybeResponse<number>>;
            subscribe: <T_2 extends SubscribeForValidatorElectionByAddressParams>(p?: T_2) => Promise<Subscription<"subscribeForValidatorElectionByAddress", T_2 extends {
                withMetadata: true;
            } ? true : false, false>>;
        };
        isElection: ({ blockNumber }: {
            blockNumber: number;
        }) => Promise<MaybeResponse<Boolean>>;
        macro: {
            after: ({ blockNumber }: {
                blockNumber: number;
            }) => Promise<MaybeResponse<number>>;
            before: ({ blockNumber }: {
                blockNumber: number;
            }) => Promise<MaybeResponse<number>>;
            last: ({ blockNumber }: {
                blockNumber: number;
            }) => Promise<MaybeResponse<number>>;
            get: ({ batchIndex }: {
                batchIndex: number;
            }) => Promise<MaybeResponse<number>>;
        };
        isMacro: ({ blockNumber }: {
            blockNumber: number;
        }) => Promise<MaybeResponse<Boolean>>;
        isMicro: ({ blockNumber }: {
            blockNumber: number;
        }) => Promise<MaybeResponse<Boolean>>;
        subscribe: <T_3 extends SubscribeForHeadBlockParams>({ filter }: T_3) => Promise<{
            next: (callback: (data: (T_3["filter"] extends "HASH" ? "subscribeForHeadBlockHash" : "subscribeForHeadBlock") extends infer T_4 ? T_4 extends (T_3["filter"] extends "HASH" ? "subscribeForHeadBlockHash" : "subscribeForHeadBlock") ? T_4 extends "subscribeForHeadBlock" ? (T_3["filter"] extends "FULL" ? true : false) extends infer T_5 ? T_5 extends (T_3["filter"] extends "FULL" ? true : false) ? T_5 extends true ? Block : PartialBlock : never : never : BlockchainStreams[T_4]["result"] : never : never) => void) => void;
            error: (callback: (error: any) => void) => void;
            close: () => void;
            getSubscriptionId: () => number;
        }>;
    };
    batch: {
        current: () => Promise<MaybeResponse<number>>;
        at: ({ blockNumber, justIndex }: {
            blockNumber: number;
            justIndex?: boolean | undefined;
        }) => Promise<MaybeResponse<number>>;
        firstBlock: ({ epochIndex }: {
            epochIndex: number;
        }) => Promise<MaybeResponse<number>>;
    };
    epoch: {
        current: () => Promise<MaybeResponse<number>>;
        at: ({ blockNumber, justIndex }: {
            blockNumber: number;
            justIndex?: boolean | undefined;
        }) => Promise<MaybeResponse<number>>;
        firstBlock: ({ epochIndex }: {
            epochIndex: number;
        }) => Promise<MaybeResponse<number>>;
        firstBatch: ({ blockNumber }: {
            blockNumber: number;
        }) => Promise<MaybeResponse<Boolean>>;
    };
    transaction: {
        by: <T extends GetTransactionByParams>(p: T) => Promise<MaybeResponse<Promise<T extends {
            hash: string;
        } ? Transaction : T extends {
            address: `NQ${number} ${string}`;
        } ? T extends infer T_1 ? T_1 extends T ? T_1 extends {
            justHashes: true;
        } ? string[] : Transaction[] : never : never : Transaction[]>>>;
        push: ({ transaction, withHighPriority }: {
            transaction: string;
            withHighPriority?: boolean | undefined;
        }) => Promise<MaybeResponse<string>>;
        minFeePerByte: () => Promise<MaybeResponse<number>>;
        create: (p: TransactionParams) => Promise<MaybeResponse<string>>;
        send: (p: TransactionParams) => Promise<MaybeResponse<string>>;
    };
    inherent: {
        by: <T extends GetInherentsByParams>(p: T) => Promise<MaybeResponse<Inherent[]>>;
    };
    account: {
        byAddress: <T extends GetAccountByAddressParams>({ address, withMetadata }: T) => Promise<MaybeResponse<T extends {
            withMetadata: true;
        } ? {
            data: Account;
            metadata: BlockchainState;
        } : Account>>;
        importRawKey: ({ keyData, passphrase }: {
            keyData: string;
            passphrase?: string | undefined;
        }) => Promise<MaybeResponse<`NQ${number} ${string}`>>;
        create: ({ passphrase }: {
            passphrase?: string | undefined;
        }) => Promise<MaybeResponse<WalletAccount>>;
        isImported: ({ address }: {
            address: `NQ${number} ${string}`;
        }) => Promise<MaybeResponse<Boolean>>;
        list: () => Promise<MaybeResponse<`NQ${number} ${string}`[]>>;
        lock: ({ address }: {
            address: `NQ${number} ${string}`;
        }) => Promise<MaybeResponse<null>>;
        unlock: ({ address, passphrase, duration }: {
            address: `NQ${number} ${string}`;
            passphrase?: string | undefined;
            duration?: number | undefined;
        }) => Promise<MaybeResponse<Boolean>>;
        isLocked: ({ address }: {
            address: `NQ${number} ${string}`;
        }) => Promise<MaybeResponse<Boolean>>;
        sign: ({ message, address, passphrase, isHex }: {
            message: string;
            address: `NQ${number} ${string}`;
            passphrase: string;
            isHex: boolean;
        }) => Promise<MaybeResponse<Signature>>;
        verify: ({ message, publicKey, signature, isHex }: {
            message: string;
            publicKey: string;
            signature: Signature;
            isHex: boolean;
        }) => Promise<MaybeResponse<Boolean>>;
    };
    validator: {
        byAddress: <T extends GetValidatorByAddressParams>(p?: T) => Promise<MaybeResponse<T extends {
            withMetadata: true;
        } ? {
            data: T extends {
                includeStakers: true;
            } ? Validator : PartialValidator$1;
            metadata: BlockchainState;
        } : T extends {
            includeStakers: true;
        } ? Validator : PartialValidator$1>>;
        setAutomaticReactivation: ({ automaticReactivation }: {
            automaticReactivation: boolean;
        }) => Promise<MaybeResponse<null>>;
        selfNode: {
            address: () => Promise<MaybeResponse<String>>;
            signingKey: () => Promise<MaybeResponse<String>>;
            votingKey: () => Promise<MaybeResponse<String>>;
        };
        active: <T_1 extends {
            withMetadata: boolean;
        }>({ withMetadata }?: T_1) => Promise<MaybeResponse<T_1 extends {
            withMetadata: true;
        } ? {
            data: Validator[];
            metadata: BlockchainState;
        } : Validator[]>>;
        parked: <T_2 extends {
            withMetadata: boolean;
        }>({ withMetadata }?: T_2) => Promise<MaybeResponse<T_2 extends {
            withMetadata: true;
        } ? {
            data: {
                blockNumber: number;
                validators: Validator[];
            };
            metadata: BlockchainState;
        } : {
            blockNumber: number;
            validators: Validator[];
        }>>;
        action: {
            new: {
                create: (p: ValidatorTxParams) => Promise<MaybeResponse<string>>;
                send: (p: ValidatorTxParams) => Promise<MaybeResponse<string>>;
            };
            update: {
                create: (p: UpdateValidatorTxParams) => Promise<MaybeResponse<string>>;
                send: (p: UpdateValidatorTxParams) => Promise<MaybeResponse<string>>;
            };
            inactive: {
                create: (p: InactiveValidatorTxParams) => Promise<MaybeResponse<string>>;
                send: (p: InactiveValidatorTxParams) => Promise<MaybeResponse<string>>;
            };
            reactivate: {
                create: (p: ReactivateValidatorTxParams) => Promise<MaybeResponse<string>>;
                send: (p: ReactivateValidatorTxParams) => Promise<MaybeResponse<string>>;
            };
            unpark: {
                create: (p: UnparkValidatorTxParams) => Promise<MaybeResponse<string>>;
                send: (p: UnparkValidatorTxParams) => Promise<MaybeResponse<string>>;
            };
            delete: {
                create: (p: DeleteValidatorTxParams) => Promise<MaybeResponse<string>>;
                send: (p: DeleteValidatorTxParams) => Promise<MaybeResponse<string>>;
            };
        };
    };
    slots: {
        at: <T extends GetSlotAtParams>({ blockNumber, offsetOpt, withMetadata }: T) => Promise<MaybeResponse<T extends {
            withMetadata: true;
        } ? {
            data: Slot;
            metadata: BlockchainState;
        } : Slot>>;
        slashed: {
            current: <T_1 extends {
                withMetadata: boolean;
            }>({ withMetadata }?: T_1) => Promise<MaybeResponse<T_1 extends {
                withMetadata: true;
            } ? {
                data: SlashedSlot[];
                metadata: BlockchainState;
            } : SlashedSlot[]>>;
            previous: <T_2 extends {
                withMetadata: boolean;
            }>({ withMetadata }?: T_2) => Promise<MaybeResponse<T_2 extends {
                withMetadata: true;
            } ? {
                data: SlashedSlot[];
                metadata: BlockchainState;
            } : SlashedSlot[]>>;
        };
    };
    mempool: {
        info: () => Promise<MaybeResponse<MempoolInfo>>;
        content: ({ includeTransactions }?: {
            includeTransactions: boolean;
        }) => Promise<MaybeResponse<(string | Transaction)[]>>;
    };
    stakes: {
        new: {
            create: (p: StakeTxParams) => Promise<MaybeResponse<string>>;
            send: (p: StakeTxParams) => Promise<MaybeResponse<string>>;
        };
    };
    staker: {
        byAddress: <T extends GetStakerByAddressParams>({ address }: T) => Promise<MaybeResponse<T extends {
            withMetadata: true;
        } ? {
            data: Staker;
            metadata: BlockchainState;
        } : Staker>>;
        create: (p: StakerTxParams) => Promise<MaybeResponse<string>>;
        send: (p: StakerTxParams) => Promise<MaybeResponse<string>>;
        update: {
            create: (p: UpdateStakerTxParams) => Promise<MaybeResponse<string>>;
            send: (p: UpdateStakerTxParams) => Promise<MaybeResponse<string>>;
        };
    };
    peers: {
        id: () => Promise<MaybeResponse<String>>;
        count: () => Promise<MaybeResponse<number>>;
        peers: () => Promise<MaybeResponse<String[]>>;
        consensusEstablished: () => Promise<MaybeResponse<Boolean>>;
    };
    constant: {
        params: () => Promise<MaybeResponse<PolicyConstants>>;
        supply: ({ genesisSupply, genesisTime, currentTime }: {
            genesisSupply: number;
            genesisTime: number;
            currentTime: number;
        }) => Promise<MaybeResponse<number>>;
    };
    htlc: {
        create: (p: HtlcTransactionParams) => Promise<MaybeResponse<string>>;
        send: (p: HtlcTransactionParams) => Promise<MaybeResponse<string>>;
        redeem: {
            regular: {
                create: (p: RedeemRegularHtlcTxParams) => Promise<MaybeResponse<string>>;
                send: (p: RedeemRegularHtlcTxParams) => Promise<MaybeResponse<string>>;
            };
            timeout: {
                create: (p: RedeemTimeoutHtlcTxParams) => Promise<MaybeResponse<string>>;
                send: (p: RedeemTimeoutHtlcTxParams) => Promise<MaybeResponse<string>>;
            };
            early: {
                create: (p: RedeemEarlyHtlcTxParams) => Promise<MaybeResponse<string>>;
                send: (p: RedeemEarlyHtlcTxParams) => Promise<MaybeResponse<string>>;
            };
        };
    };
    vesting: {
        create: (p: VestingTxParams) => Promise<MaybeResponse<string>>;
        send: (p: VestingTxParams) => Promise<MaybeResponse<string>>;
        redeem: {
            create: (p: RedeemVestingTxParams) => Promise<MaybeResponse<string>>;
            send: (p: RedeemVestingTxParams) => Promise<MaybeResponse<string>>;
        };
    };
    zeroKnowledgeProof: {
        state: () => Promise<MaybeResponse<ZKPState>>;
    };
    logs: {
        subscribe: <T extends SubscribeForLogsByAddressesAndTypesParams>(p?: T) => Promise<Subscription<"subscribeForLogsByAddressesAndTypes", T extends {
            withMetadata: true;
        } ? true : false, false>>;
    };
    _modules: {
        blockchain: BlockchainClient;
        consensus: ConsensusClient;
        mempool: MempoolClient;
        network: NetworkClient;
        policy: PolicyClient;
        validator: ValidatorClient;
        wallet: WalletClient;
        zkpComponent: ZkpComponentClient;
    };
    constructor(url: URL);
}

export { Account, AccountType$1 as AccountType, Address, BasicAccount, BatchIndex, Block, BlockLog, BlockNumber, BlockType$1 as BlockType, Client, Coin, CurrentTime$1 as CurrentTime, DeleteValidatorTxParams, ElectionMacroBlock, EpochIndex, GenesisSupply$1 as GenesisSupply, GenesisTime$1 as GenesisTime, GetAccountByAddressParams, GetBlockByParams, GetInherentsByParams, GetLatestBlockParams, GetSlotAtParams, GetStakerByAddressParams, GetTransactionByParams, GetTransactionsByAddressParams, GetValidatorByAddressParams, Hash, HtlcAccount, HtlcTransactionParams, InactiveValidatorTxParams, Inherent, LogType, LogsByAddressesAndTypes, MacroBlock, MempoolInfo, MicroBlock, ParkedSet, PartialBlock, PartialMacroBlock, PartialMicroBlock, PartialValidator$1 as PartialValidator, PolicyConstants, RawTransaction, RawTransactionInfoParams, ReactivateValidatorTxParams, RedeemEarlyHtlcTxParams, RedeemRegularHtlcTxParams, RedeemTimeoutHtlcTxParams, RedeemVestingTxParams, SignRedeemEarlyHtlcParams, Signature, SlashedSlot, Slot, StakeTxParams, Staker, StakerTxParams, SubscribeForHeadBlockParams, SubscribeForLogsByAddressesAndTypesParams, SubscribeForValidatorElectionByAddressParams, Transaction, TransactionParams, UnparkValidatorTxParams, UnstakeTxParams, UpdateStakerTxParams, UpdateValidatorTxParams, Validator, ValidatorTxParams, VestingAccount, VestingTxParams, WalletAccount, ZKPState };
