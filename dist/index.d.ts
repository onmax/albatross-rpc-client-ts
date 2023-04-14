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
    InactivateValidator = "inactivate-validator",
    ReactivateValidator = "reactivate-validator",
    UnparkValidator = "unpark-validator",
    CreateStaker = "create-staker",
    Stake = "stake",
    UpdateStaker = "update-staker",
    RetireValidator = "retire-validator",
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

type Address$1 = `NQ${number} ${string}`
type Coin$1 = number

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
    stakingContractAddress: Address$1,
    coinbaseAddress: Address$1,
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
    address: Address$1;
    balance: Coin$1;
}

type VestingAccount = {
    type: AccountType.VESTING;
    address: Address$1;
    balance: Coin$1;
    owner: Address$1;
    vestingStart: number;
    vestingStepBlocks: number;
    vestingStepAmount: Coin$1;
    vestingTotalAmount: Coin$1;
}

type HtlcAccount = {
    type: AccountType.HTLC;
    address: Address$1;
    balance: Coin$1;
    sender: Address$1;
    recipient: Address$1;
    hashRoot: string;
    hashCount: number;
    timeout: number;
    totalAmount: Coin$1;
}

type Account = BasicAccount | VestingAccount | HtlcAccount

type Transaction = {
    hash: string;
    blockNumber: number;
    timestamp: number;
    confirmations: number;
    from: Address$1;
    to: Address$1;
    value: Coin$1;
    fee: Coin$1;
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
        validator: Address$1;
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

type PartialBlock$1 = PartialMicroBlock | PartialMacroBlock
type Block$1 = MicroBlock | MacroBlock | ElectionMacroBlock

type Staker = {
    address: Address$1;
    balance: Coin$1;
    delegation?: Address$1;
}

type PartialValidator$1 = {
    address: Address$1;
    signingKey: string;
    votingKey: string;
    rewardAddress: Address$1;
    balance: Coin$1;
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
    validator: Address$1;
    publicKey: string;
}

type SlashedSlot = {
    blockNumber: BlockNumber; // u32
    lostRewards: number[]; // u32[]
    disabled: number[]; // u32[]
}

type ParkedSet = {
    blockNumber: BlockNumber;
    validators: Address$1[];
}
type Inherent = {
    ty: number; // u8
    blockNumber: BlockNumber; // u32
    timestamp: number; // u64
    target: Address$1;
    value: Coin$1;
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
    address: Address$1,
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

// TODO Update Log with all types!

type PayoutInherentLog = {
    type: LogType.PayoutInherent;
    to: Address;
    value: Coin;
}

type ParkInherentLog = {
    type: LogType.ParkInherent;
    validatorAddress: Address;
    eventBlock: number;
}

type SlashInherentLog = {
    type: LogType.SlashInherent;
    validatorAddress: Address;
    eventBlock: number;
    slot: number;
    newlyDisabled: boolean;
}

type RevertContractInherentLog = {
    type: LogType.RevertContractInherent;
    contractAddress: Address;
}

type InherentLog = PayoutInherentLog | ParkInherentLog | SlashInherentLog | RevertContractInherentLog

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

type CreateValidatorLog = {
    type: LogType.CreateValidator;
    validatorAddress: Address;
    rewardAddress: Address;
}

type UpdateValidatorLog = {
    type: LogType.UpdateValidator;
    validatorAddress: Address;
    oldRewardAddress: Address;
    newRewardAddress: Address | null;
}

type InactivateValidatorLog = {
    type: LogType.InactivateValidator;    
    validatorAddress: Address;
}

type ReactivateValidatorLog = {
    type: LogType.ReactivateValidator;
    validatorAddress: Address;
}

type UnparkValidatorLog = {
    type: LogType.UnparkValidator;
    validatorAddress: Address;
}

type RetireValidatorLog = {
    type: LogType.RetireValidator;
    validatorAddress: Address;
}

type DeleteValidatorLog = {
    type: LogType.DeleteValidator;
    validatorAddress: Address;
    rewardAddress: Address;
}

type CreateStakerLog = {
    type: LogType.CreateStaker;
    stakerAddress: Address;
    validatorAddress: Address | null;
    value: Coin;
}

type StakeLog = {
    type: LogType.Stake;
    stakerAddress: Address;
    validatorAddress: Address | null;
    value: Coin;
}

type UpdateStakerLog = {
    type: LogType.UpdateStaker;
    stakerAddress: Address;
    oldValidatorAddress: Address | null;
    newValidatorAddress: Address | null;
}

type UnstakeLog = {
    type: LogType.Unstake;
    stakerAddress: Address;
    validatorAddress: Address | null;
    value: Coin;
}

type FailedTransactionLog = {
    type: LogType.FailedTransaction;
    from: Address;
    to: Address;
    failureReason: string;
}

type Log = PayFeeLog | TransferLog | CreateValidatorLog | UpdateValidatorLog | InactivateValidatorLog | ReactivateValidatorLog | UnparkValidatorLog | RetireValidatorLog | DeleteValidatorLog | CreateStakerLog | StakeLog | UpdateStakerLog | UnstakeLog | FailedTransactionLog

type TransactionLog = {
    hash: string;
    logs: Log[];
    failed: boolean;
}

type BlockLog = {
    inherents: InherentLog[];
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

// Metadatas
type BlockchainState = { 
    blockNumber: BlockNumber;
    blockHash: Hash;
}

type Interaction$1<Params extends any[], Result, Metadata = null> = {
    // In the request
    params: Params

    // In the response
    result: Result
    metadata: Metadata
}

type Maybe<T> = T | undefined

type BlockchainMethods = {
    'getBlockNumber': Interaction$1<[], BlockNumber>,
    'getBatchNumber': Interaction$1<[], BatchIndex>,
    'getEpochNumber': Interaction$1<[], EpochIndex>,
    'getBlockByHash': Interaction$1<[Hash, /* include_transactions */Maybe<Boolean>], Block$1>,
    'getBlockByNumber': Interaction$1<[BlockNumber, /* include_transactions */Maybe<Boolean>], Block$1>,
    'getLatestBlock': Interaction$1<[/* include_transactions */Maybe<Boolean>], Block$1>,
    'getSlotAt': Interaction$1<[BlockNumber, /* offset_opt u32 */Maybe<number>], Slot, BlockchainState>,
    'getTransactionByHash': Interaction$1<[Hash], Transaction>,
    'getTransactionsByBlockNumber': Interaction$1<[BlockNumber], Transaction[]>,
    'getInherentsByBlockNumber': Interaction$1<[BlockNumber], Inherent[]>,
    'getTransactionsByBatchNumber': Interaction$1<[BatchIndex], Transaction[]>,
    'getInherentsByBatchNumber': Interaction$1<[BatchIndex], Inherent[]>,
    'getTransactionHashesByAddress': Interaction$1<[Address$1, /* max u16 */Maybe<number>], Hash[]>,
    'getTransactionsByAddress': Interaction$1<[Address$1, /* max u16 */Maybe<number>], Transaction[]>,
    'getAccountByAddress': Interaction$1<[Address$1], Account, BlockchainState>,
    'getActiveValidators': Interaction$1<[], Validator[], BlockchainState>,
    'getCurrentSlashedSlots': Interaction$1<[], SlashedSlot[], BlockchainState>,
    'getPreviousSlashedSlots': Interaction$1<[], SlashedSlot[], BlockchainState>,
    'getParkedValidators': Interaction$1<[], { blockNumber: BlockNumber, validators: Validator[]}, BlockchainState>,
    'getValidatorByAddress': Interaction$1<[Address$1, /* include_stakers */Maybe<Boolean>], Validator | PartialValidator, BlockchainState>,
    'getStakerByAddress': Interaction$1<[Address$1], Staker, BlockchainState>,
}

// When you open a stream, the server will return a subscription number
type StreamOpened = {
    'streamOpened': Interaction$1<[], number>
}

type BlockchainStreams = {
    'subscribeForHeadBlock': Interaction$1<[/* include_transactions */Maybe<Boolean>], Block$1 | PartialBlock$1>,
    'subscribeForHeadBlockHash': Interaction$1<[], Hash>,
    'subscribeForValidatorElectionByAddress': Interaction$1<[Address$1], Validator, BlockchainState>,
    'subscribeForLogsByAddressesAndTypes': Interaction$1<[Address$1[], /*Check out logs-types.ts*/LogType[]], BlockLog, BlockchainState>,
}

type ConsensusMethods = {
    'isConsensusEstablished': Interaction$1<[], Boolean>,
    'getRawTransactionInfo': Interaction$1<[RawTransaction], Transaction>,
    'sendRawTransaction': Interaction$1<[RawTransaction], Hash>,
    'createBasicTransaction': Interaction$1<[/* wallet */Address$1, /* recipient */Address$1, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], RawTransaction>,
    'sendBasicTransaction': Interaction$1<[/* wallet */Address$1, /* recipient */Address$1, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'createBasicTransactionWithData': Interaction$1<[/* wallet */Address$1, /* recipient */Address$1, /*data*/string, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], RawTransaction>,
    'sendBasicTransactionWithData': Interaction$1<[/* wallet */Address$1, /* recipient */Address$1, /*data*/string, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'createNewVestingTransaction': Interaction$1<[/* wallet */Address$1, /* owner */Address$1, /* start_time */number, /* time_step */number, /* num_steps */number, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], RawTransaction>,
    'sendNewVestingTransaction': Interaction$1<[/* wallet */Address$1, /* owner */Address$1, /* start_time */number, /* time_step */number, /* num_steps */number, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'createRedeemVestingTransaction': Interaction$1<[/* wallet */Address$1, /* contract_address */Address$1, /* recipient */Address$1, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], RawTransaction>,
   'sendRedeemVestingTransaction': Interaction$1<[/* wallet */Address$1, /* contract_address */Address$1, /* recipient */Address$1, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'createNewHtlcTransaction': Interaction$1<[/* wallet */Address$1, /* htlc_sender */Address$1, /* htlc_recipient */Address$1, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* timeout */number, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'sendNewHtlcTransaction': Interaction$1<[/* wallet */Address$1, /* htlc_sender */Address$1, /* htlc_recipient */Address$1, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* timeout */number, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'createRedeemRegularHtlcTransaction': Interaction$1<[/* wallet */Address$1, /* contract_address */Address$1,  /* recipient */Address$1, /* pre_image */AnyHash, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'sendRedeemRegularHtlcTransaction': Interaction$1<[/* wallet */Address$1, /* contract_address */Address$1,  /* recipient */Address$1, /* pre_image */AnyHash, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'createRedeemTimeoutHtlcTransaction': Interaction$1<[/* wallet */Address$1, /* htlc_address */Address$1, /* recipient */Address$1, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'sendRedeemTimeoutHtlcTransaction': Interaction$1<[/* wallet */Address$1, /* htlc_address */Address$1, /* recipient */Address$1, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'createRedeemEarlyHtlcTransaction': Interaction$1<[/* wallet */Address$1, /* htlc_address */Address$1, /* recipient */Address$1, /* htlc_sender_signature */String, /* htlc_recipient_signature */String, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'sendRedeemEarlyHtlcTransaction': Interaction$1<[/* wallet */Address$1, /* htlc_address */Address$1, /* recipient */Address$1, /* htlc_sender_signature */String, /* htlc_recipient_signature */String, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'signRedeemEarlyHtlcTransaction': Interaction$1<[/* wallet */Address$1, /* htlc_address */Address$1, /* recipient */Address$1, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], String>,
    'createNewStakerTransaction': Interaction$1<[/* sender_wallet */Address$1, /* staker */Address$1, /* delegation */Maybe<Address$1>, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], RawTransaction>,
    'sendNewStakerTransaction': Interaction$1<[/* sender_wallet */Address$1, /* staker */Address$1, /* delegation */Maybe<Address$1>, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'createStakeTransaction': Interaction$1<[/* sender_wallet */Address$1, /* staker */Address$1, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], RawTransaction>,
    'sendStakeTransaction': Interaction$1<[/* sender_wallet */Address$1, /* staker */Address$1, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'createUpdateStakerTransaction': Interaction$1<[/* sender_wallet */Address$1, /* staker */Address$1, /* new_delegation */Address$1, /* fee */Coin$1, /* validity_start_height */string], RawTransaction>,
    'sendUpdateStakerTransaction': Interaction$1<[/* sender_wallet */Address$1, /* staker */Address$1, /* new_delegation */Address$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'createUnstakeTransaction': Interaction$1<[/* sender_wallet */Address$1, /* recipient */Address$1, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], RawTransaction>,
    'sendUnstakeTransaction': Interaction$1<[/* sender_wallet */Address$1, /* recipient */Address$1, /* value */Coin$1, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'createNewValidatorTransaction': Interaction$1<[/* sender_wallet */Address$1, /* validator */Address$1, /* signing_secret_key */String, /* voting_secret_key */String, /* reward_address */Address$1, /* signal_data */String, /* fee */Coin$1, /* validity_start_height */string], RawTransaction>,
    'sendNewValidatorTransaction': Interaction$1<[/* sender_wallet */Address$1, /* validator */Address$1, /* signing_secret_key */String, /* voting_secret_key */String, /* reward_address */Address$1, /* signal_data */String, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'createUpdateValidatorTransaction': Interaction$1<[/* sender_wallet */Address$1, /* validator */Address$1, /* new_signing_secret_key */String, /* new_voting_secret_key */String, /* new_reward_address */Address$1, /* new_signal_data */String, /* fee */Coin$1, /* validity_start_height */string], RawTransaction>,
    'sendUpdateValidatorTransaction': Interaction$1<[/* sender_wallet */Address$1, /* validator */Address$1, /* new_signing_secret_key */String, /* new_voting_secret_key */String, /* new_reward_address */Address$1, /* new_signal_data */String, /* fee */Coin$1, /* validity_start_height */string], Hash>,
    'createDeactivateValidatorTransaction': Interaction$1<[/* sender_wallet */Address$1, /* validator */Address$1, /* signing_secret_key */String, /* fee */Coin$1, /* validity_start_height */string], RawTransaction>,
    'sendDeactivateValidatorTransaction': Interaction$1<[/* sender_wallet */Address$1, /* validator */Address$1, /* signing_secret_key */String, /* fee */Coin$1, /* validity_start_height */ValidityStartHeight], Hash>,
    'createReactivateValidatorTransaction': Interaction$1<[/* sender_wallet */Address$1, /* validator */Address$1, /* signing_secret_key */String, /* fee */Coin$1, /* validity_start_height */ValidityStartHeight], RawTransaction>,
    'sendReactivateValidatorTransaction': Interaction$1<[/* sender_wallet */Address$1, /* validator */Address$1, /* signing_secret_key */String, /* fee */Coin$1, /* validity_start_height */ValidityStartHeight], Hash>,
    'createUnparkValidatorTransaction': Interaction$1<[/* sender_wallet */Address$1, /* validator */Address$1, /* signing_secret_key */String, /* fee */Coin$1, /* validity_start_height */ValidityStartHeight], RawTransaction>,
    'sendUnparkValidatorTransaction': Interaction$1<[/* sender_wallet */Address$1, /* validator_wallet */Address$1, /* signing_secret_key */String, /* fee */Coin$1, /* validity_start_height */ValidityStartHeight], Hash>,
    'createRetireValidatorTransaction': Interaction$1<[/* sender_wallet */Address$1, /* validator_wallet */Address$1, /* fee */Coin$1, /* validity_start_height */ValidityStartHeight], RawTransaction>,
    'sendRetireValidatorTransaction': Interaction$1<[/* sender_wallet */Address$1, /* validator_wallet */Address$1, /* fee */Coin$1, /* validity_start_height */ValidityStartHeight], Hash>,
    'createDeleteValidatorTransaction': Interaction$1<[/* validator_wallet */Address$1, /* recipient */Address$1, /* fee */Coin$1, /* value */Coin$1, /* validity_start_height */ValidityStartHeight], RawTransaction>,
    'sendDeleteValidatorTransaction': Interaction$1<[/* validator_wallet */Address$1, /* recipient */Address$1, /* fee */Coin$1, /* value */Coin$1, /* validity_start_height */ValidityStartHeight], Hash>,
}

type MempoolMethods = {
    'pushTransaction': Interaction$1<[/* transaction */RawTransaction], Hash>,
    'pushHighPriorityTransaction': Interaction$1<[/* transaction */RawTransaction], Hash>,
    'mempoolContent': Interaction$1<[/* include_transactions */Boolean], (Hash | Transaction)[]>,
    'mempool': Interaction$1<[], MempoolInfo>,
    'getMinFeePerByte': Interaction$1<[], /* f64 */number>,
}

type NetworkMethods = {
    'getPeerId': Interaction$1<[], String>,
    'getPeerCount': Interaction$1<[], number>,
    'getPeerList': Interaction$1<[], string[]>,
}

type PolicyMethods = {
    'getPolicyConstants': Interaction$1<[], PolicyConstants>,
    'getEpochAt': Interaction$1<[BlockNumber], EpochIndex>,
    'getEpochIndexAt': Interaction$1<[BlockNumber], EpochIndex>,
    'getBatchAt': Interaction$1<[BlockNumber], BatchIndex>,
    'getBatchIndexAt': Interaction$1<[BlockNumber], BatchIndex>,
    'getElectionBlockAfter': Interaction$1<[BlockNumber], BlockNumber>,
    'getElectionBlockBefore': Interaction$1<[BlockNumber], BlockNumber>,
    'getLastElectionBlock': Interaction$1<[BlockNumber], BlockNumber>,
    'getIsElectionBlockAt': Interaction$1<[BlockNumber], Boolean>,
    'getMacroBlockAfter': Interaction$1<[BlockNumber], BlockNumber>,
    'getMacroBlockBefore': Interaction$1<[BlockNumber], BlockNumber>,
    'getLastMacroBlock': Interaction$1<[BlockNumber], BlockNumber>,
    'getIsMacroBlockAt': Interaction$1<[BlockNumber], Boolean>,
    'getIsMicroBlockAt': Interaction$1<[BlockNumber], Boolean>,
    'getFirstBlockOf': Interaction$1<[EpochIndex], BlockNumber>,
    'getFirstBlockOfBatch': Interaction$1<[BatchIndex], BlockNumber>,
    'getElectionBlockOf': Interaction$1<[EpochIndex], BlockNumber>,
    'getMacroBlockOf': Interaction$1<[BatchIndex], BlockNumber>,
    'getFirstBatchOfEpoch': Interaction$1<[BlockNumber], Boolean>,
    'getSupplyAt': Interaction$1<[GenesisSupply, GenesisTime, CurrentTime], number>,
}

type ValidatorMethods = {
    'getAddress': Interaction$1<[], Address$1>,
    'getSigningKey': Interaction$1<[], String>,
    'getVotingKey': Interaction$1<[], String>,
    'setAutomaticReactivation': Interaction$1<[/* automatic_reactivation */Boolean], null>,
}

type WalletMethods = {
    'importRawKey': Interaction$1<[/* key_data */String, /* passphrase */Maybe<String>], Address$1>,
    'isAccountImported': Interaction$1<[/* address */Address$1], Boolean>,
    'listAccounts': Interaction$1<[], Address$1[]>,
    'lockAccount': Interaction$1<[/* address */Address$1], null>,
    'createAccount': Interaction$1<[/* passphrase */Maybe<String>], WalletAccount>,
    'unlockAccount': Interaction$1<[/* address */Address$1, /* passphrase */Maybe<String>, /* duration: u64 */Maybe<number>], Boolean>,
    'isAccountLocked': Interaction$1<[/* address */Address$1], Boolean>,
    'sign': Interaction$1<[/* message */String, /* address */Address$1, /* passphrase */Maybe<String>, /* is_hex */Boolean], Signature>,
    'verifySignature': Interaction$1<[/* message */String, /* public_key */PublicKey, /* signature */Signature, /* is_hex */Boolean], Boolean>,
}

type ZKPStateKebab = {
    'latest-header-number': Hash
    'latest-block-number': BlockNumber
    'latest-proof'?: string
}

type ZkpComponentMethods = {
    'getZkpState': Interaction$1<[], ZKPStateKebab>,
}

// export type Methods = PolicyMethods & BlockchainMethods & ConsensusMethods & MempoolMethods & NetworkMethods & ValidatorMethods & WalletMethods & ZkpComponentMethods & StreamOpened
type Methods = PolicyMethods & BlockchainMethods & ConsensusMethods & MempoolMethods & NetworkMethods & ValidatorMethods & WalletMethods & ZkpComponentMethods & StreamOpened
type MethodName = keyof Methods

type Streams = BlockchainStreams
type StreamName = keyof Streams

type Interaction = Methods & Streams
type InteractionName = keyof Interaction

type RpcRequest<M extends InteractionName> = {
    jsonrpc: string,
    method: M,
    params: Interaction[M]['params'],
    id: number
}

type MethodResponsePayload<M extends Methods> = {
    data: M['result'];
    metadata: M['metadata'];
} & {}

type MethodResponseContent<M extends MethodName, WithMetadata extends boolean> = 
    M extends 'streamOpened'
        ? number :
        WithMetadata extends true
            ? MethodResponsePayload<Methods[M]>
            : MethodResponsePayload<Methods[M]>["data"]

type MethodResponse<M extends MethodName> = {
    jsonrpc: string,
    result: MethodResponseContent<M>,
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

type MethodResponseError = {
    jsonrpc: string,
    error: {
        code: number,
        message: string,
        data: string
    }
    id: number
}

type ErrorCallReturn = {
    code: number,
    message: string,
}

type ContextRequest = {
    method: string,
    params: RpcRequest<T>['params'],
    id: number,
    timestamp: number
}

type MaybeCallResponse<T> = {
    error: ErrorCallReturn,
    data: undefined
    context: ContextRequest
} | {
    error: undefined,
    data: T,
    context: ContextRequest
}

type CallOptions = {
    timeout: number
}

type ErrorStreamReturn = {
    code: number,
    message: string,
}

// export type MaybeStreamResponse<T extends StreamName, ShowMetadata extends boolean | undefined = false, IncludeBody extends boolean = false> = {
type MaybeStreamResponse<T extends CallbackParam> = {
    error: ErrorStreamReturn,
    data: undefined
} | {
    error: undefined,
    data: T,
}

type CallbackParam<T extends StreamName, ShowMetadata extends boolean | undefined = false, IncludeBody extends boolean = false> =
    T extends 'subscribeForHeadBlock'
        ? IncludeBody extends true
            ? Block
            : PartialBlock
        : ShowMetadata extends true
            ? StreamResponse<T>['params']['result']
            : StreamResponse<T>['params']['result']['data']

type FilterStreamFn<T extends StreamName> = (data: Streams[T]["result"]) => boolean;

// Only withMetadata if T extends subscribeForValidatorElectionByAddress or subscribeForLogsByAddressesAndTypes

type StreamOptions<T extends StreamName = any> = {
    once: boolean,
    filter?: FilterStreamFn<T>,
    // timeout: number, TODO
} & (
    T extends 'subscribeForValidatorElectionByAddress' | 'subscribeForLogsByAddressesAndTypes'
        ? { withMetadata: boolean }
        : {}
);

declare class Client$1 {
    private httpClient;
    private webSocketClient;
    constructor(url: URL);
    call<T extends MethodName>(method: T, params: RpcRequest<T>["params"], options: CallOptions, withMetadata?: boolean): Promise<{
        error: ErrorCallReturn;
        data: undefined;
        context: ContextRequest;
    } | {
        error: undefined;
        data: any;
        context: ContextRequest;
    }>;
    subscribe<T extends StreamName>(event: T, params: RpcRequest<T>["params"], options: StreamOptions<T>): Promise<unknown>;
}

type Subscription<CallbackItem> = {
    next: (callback: (p: CallbackItem) => void) => void;
    error: (callback: (error: any) => void) => void;
    close: () => void;
    context: ContextRequest;
    getSubscriptionId: () => number;
};
type MaybeSubscription<T extends StreamName, ShowMetadata extends boolean | undefined = false, IncludeBody extends boolean = false> = Subscription<MaybeStreamResponse<CallbackParam<T, ShowMetadata, IncludeBody>>>;

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
    address: Address$1;
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
    address: Address$1;
    withMetadata?: boolean;
};
type GetValidatorByAddressParams = {
    address: Address$1;
    includeStakers?: boolean;
};
type GetStakerByAddressParams = {
    address: Address$1;
};
type SubscribeForHeadBlockParams = {
    retrieve: 'FULL' | 'PARTIAL';
    blockType?: 'MACRO' | 'MICRO' | 'ELECTION';
};
type SubscribeForHeadHashParams = {
    retrieve: 'HASH';
};
type SubscribeForValidatorElectionByAddressParams = {
    address: Address$1;
};
type SubscribeForLogsByAddressesAndTypesParams = {
    addresses?: Address$1[];
    types?: LogType[];
};
type WithMetadata<T> = {
    data: T;
    metadata: BlockchainState;
};
type ResultGetTransactionsByAddress<T extends GetTransactionsByAddressParams> = T extends {
    justHashes: true;
} ? Hash[] : Transaction[];
type ResultGetTransactionsBy<T> = T extends {
    hash: Hash;
} ? Transaction : T extends {
    address: Address$1;
} ? ResultGetTransactionsByAddress<T> : Transaction[];
type SpecificBlock<T extends SubscribeForHeadBlockParams> = T["blockType"] extends 'MICRO' ? (T["retrieve"] extends 'FULL' ? MicroBlock : PartialMicroBlock) : (T["retrieve"] extends 'FULL' ? MacroBlock : PartialMacroBlock);
type BlockSubscription<T extends SubscribeForHeadBlockParams | SubscribeForHeadHashParams> = Subscription<T extends SubscribeForHeadBlockParams ? SpecificBlock<T> : string>;
declare class BlockchainClient extends Client$1 {
    constructor(url: URL);
    /**
     * Returns the block number for the current head.
     */
    getBlockNumber(options?: CallOptions): Promise<MaybeCallResponse<BlockNumber>>;
    /**
     * Returns the batch number for the current head.
     */
    getBatchNumber(options?: CallOptions): Promise<MaybeCallResponse<BatchIndex>>;
    /**
     * Returns the epoch number for the current head.
     */
    getEpochNumber(options?: CallOptions): Promise<MaybeCallResponse<BatchIndex>>;
    /**
     * Tries to fetch a block given its hash or block number. It has an option to include the transactions in the block, which defaults to false.
     */
    getBlockBy<T extends GetBlockByParams>(p?: T, options?: CallOptions): Promise<T extends {
        includeTransactions: true;
    } ? MaybeCallResponse<Block$1> : MaybeCallResponse<PartialBlock$1>>;
    /**
     * Returns the block at the head of the main chain. It has an option to include the
     * transactions in the block, which defaults to false.
     */
    getLatestBlock<T extends GetLatestBlockParams>(p?: T, options?: CallOptions): Promise<MaybeCallResponse<T extends {
        includeTransactions: true;
    } ? Block$1 : PartialBlock$1>>;
    /**
     * Returns the information for the slot owner at the given block height and offset. The
     * offset is optional, it will default to getting the offset for the existing block
     * at the given height.
     */
    getSlotAt<T extends GetSlotAtParams>({ blockNumber, offsetOpt, withMetadata }: T, options?: CallOptions): Promise<MaybeCallResponse<T extends {
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
    getTransactionBy<T extends GetTransactionByParams>(p: T, options?: CallOptions): Promise<MaybeCallResponse<ResultGetTransactionsBy<T>>>;
    /**
     * Returns all the inherents (including reward inherents) for the parameter. Note
     * that this only considers blocks in the main chain.
     */
    getInherentsBy<T extends GetInherentsByParams>(p: T, options?: CallOptions): Promise<MaybeCallResponse<Inherent[]>>;
    /**
     * Tries to fetch the account at the given address.
     */
    getAccountBy<T extends GetAccountByAddressParams>({ address, withMetadata }: T, options?: CallOptions): Promise<MaybeCallResponse<T extends {
        withMetadata: true;
    } ? WithMetadata<Account> : Account>>;
    /**
    * Returns a collection of the currently active validator's addresses and balances.
    */
    getActiveValidators<T extends {
        withMetadata: boolean;
    }>({ withMetadata }?: T, options?: CallOptions): Promise<MaybeCallResponse<T extends {
        withMetadata: true;
    } ? WithMetadata<Validator[]> : Validator[]>>;
    /**
     * Returns information about the currently slashed slots. This includes slots that lost rewards
     * and that were disabled.
     */
    getCurrentSlashedSlots<T extends {
        withMetadata: boolean;
    }>({ withMetadata }?: T, options?: CallOptions): Promise<MaybeCallResponse<T extends {
        withMetadata: true;
    } ? WithMetadata<SlashedSlot[]> : SlashedSlot[]>>;
    /**
     * Returns information about the slashed slots of the previous batch. This includes slots that
     * lost rewards and that were disabled.
     */
    getPreviousSlashedSlots<T extends {
        withMetadata: boolean;
    }>({ withMetadata }?: T, options?: CallOptions): Promise<MaybeCallResponse<T extends {
        withMetadata: true;
    } ? WithMetadata<SlashedSlot[]> : SlashedSlot[]>>;
    /**
     * Returns information about the currently parked validators.
     */
    getParkedValidators<T extends {
        withMetadata: boolean;
    }>({ withMetadata }?: T, options?: CallOptions): Promise<MaybeCallResponse<T extends {
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
    getValidatorBy<T extends GetValidatorByAddressParams>(p?: T, options?: CallOptions): Promise<MaybeCallResponse<T extends {
        withMetadata: true;
    } ? WithMetadata<T extends {
        includeStakers: true;
    } ? Validator : PartialValidator$1> : T extends {
        includeStakers: true;
    } ? Validator : PartialValidator$1>>;
    /**
     * Tries to fetch a staker information given its address.
     */
    getStakerByAddress<T extends GetStakerByAddressParams>({ address }: T, options?: CallOptions): Promise<MaybeCallResponse<T extends {
        withMetadata: true;
    } ? WithMetadata<Staker> : Staker>>;
    /**
     * Subscribes to new block events.
     */
    subscribeForBlocks<T extends (SubscribeForHeadBlockParams | SubscribeForHeadHashParams), N extends T["retrieve"] extends 'HASH' ? "subscribeForHeadBlockHash" : "subscribeForHeadBlock", O extends StreamOptions<N>>(params: T, userOptions?: Partial<O>): Promise<BlockSubscription<T>>;
    /**
     * Subscribes to pre epoch validators events.
     */
    subscribeForValidatorElectionByAddress<T extends SubscribeForValidatorElectionByAddressParams, O extends StreamOptions<"subscribeForValidatorElectionByAddress">>(p: T, userOptions?: Partial<O>): Promise<MaybeSubscription<"subscribeForValidatorElectionByAddress", O extends {
        withMetadata: true;
    } ? true : false>>;
    /**
     * Subscribes to log events related to a given list of addresses and of any of the log types provided.
     * If addresses is empty it does not filter by address. If log_types is empty it won't filter by log types.
     * Thus the behavior is to assume all addresses or log_types are to be provided if the corresponding vec is empty.
     */
    subscribeForLogsByAddressesAndTypes<T extends SubscribeForLogsByAddressesAndTypesParams, O extends StreamOptions<"subscribeForLogsByAddressesAndTypes">>(p?: T, userOptions?: Partial<O>): Promise<MaybeSubscription<"subscribeForLogsByAddressesAndTypes", O extends {
        withMetadata: true;
    } ? true : false>>;
}

type RawTransactionInfoParams = {
    rawTransaction: string;
};
type TransactionParams = {
    wallet: Address$1;
    recipient: Address$1;
    value: Coin$1;
    fee: Coin$1;
    data?: string;
} & ValidityStartHeight$1;
type VestingTxParams = {
    wallet: Address$1;
    owner: Address$1;
    startTime: number;
    timeStep: number;
    numSteps: number;
    value: Coin$1;
    fee: Coin$1;
} & ValidityStartHeight$1;
type RedeemVestingTxParams = {
    wallet: Address$1;
    contractAddress: Address$1;
    recipient: Address$1;
    value: Coin$1;
    fee: Coin$1;
} & ValidityStartHeight$1;
type HtlcTransactionParams = {
    wallet: Address$1;
    htlcSender: Address$1;
    htlcRecipient: Address$1;
    hashRoot: string;
    hashCount: number;
    hashAlgorithm: string;
    timeout: number;
    value: Coin$1;
    fee: Coin$1;
} & ValidityStartHeight$1;
type RedeemRegularHtlcTxParams = {
    wallet: Address$1;
    contractAddress: Address$1;
    recipient: Address$1;
    preImage: string;
    hashRoot: string;
    hashCount: number;
    hashAlgorithm: string;
    value: Coin$1;
    fee: Coin$1;
} & ValidityStartHeight$1;
type RedeemTimeoutHtlcTxParams = {
    wallet: Address$1;
    contractAddress: Address$1;
    recipient: Address$1;
    value: Coin$1;
    fee: Coin$1;
} & ValidityStartHeight$1;
type RedeemEarlyHtlcTxParams = {
    wallet: Address$1;
    htlcAddress: Address$1;
    recipient: Address$1;
    htlcSenderSignature: string;
    htlcRecipientSignature: string;
    value: Coin$1;
    fee: Coin$1;
} & ValidityStartHeight$1;
type SignRedeemEarlyHtlcParams = {
    wallet: Address$1;
    htlcAddress: Address$1;
    recipient: Address$1;
    value: Coin$1;
    fee: Coin$1;
} & ValidityStartHeight$1;
type StakerTxParams = {
    senderWallet: Address$1;
    staker: Address$1;
    delegation: Address$1 | undefined;
    value: Coin$1;
    fee: Coin$1;
} & ValidityStartHeight$1;
type StakeTxParams = {
    senderWallet: Address$1;
    staker: Address$1;
    value: Coin$1;
    fee: Coin$1;
} & ValidityStartHeight$1;
type UpdateStakerTxParams = {
    senderWallet: Address$1;
    staker: Address$1;
    newDelegation: Address$1;
    fee: Coin$1;
} & ValidityStartHeight$1;
type UnstakeTxParams = {
    staker: Address$1;
    recipient: Address$1;
    value: Coin$1;
    fee: Coin$1;
} & ValidityStartHeight$1;
type NewValidatorTxParams = {
    senderWallet: Address$1;
    validator: Address$1;
    signingSecretKey: string;
    votingSecretKey: string;
    rewardAddress: Address$1;
    signalData: string;
    fee: Coin$1;
} & ValidityStartHeight$1;
type UpdateValidatorTxParams = {
    senderWallet: Address$1;
    validator: Address$1;
    newSigningSecretKey: string;
    newVotingSecretKey: string;
    newRewardAddress: Address$1;
    newSignalData: string;
    fee: Coin$1;
} & ValidityStartHeight$1;
type InactiveValidatorTxParams = {
    senderWallet: Address$1;
    validator: Address$1;
    signingSecretKey: string;
    fee: Coin$1;
} & ValidityStartHeight$1;
type ReactivateValidatorTxParams = {
    senderWallet: Address$1;
    validator: Address$1;
    signingSecretKey: string;
    fee: Coin$1;
} & ValidityStartHeight$1;
type UnparkValidatorTxParams = {
    senderWallet: Address$1;
    validator: Address$1;
    signingSecretKey: string;
    fee: Coin$1;
} & ValidityStartHeight$1;
type RetireValidatorTxParams = {
    senderWallet: Address$1;
    validator: Address$1;
    fee: Coin$1;
} & ValidityStartHeight$1;
type DeleteValidatorTxParams = {
    validator: Address$1;
    recipient: Address$1;
    fee: Coin$1;
    value: Coin$1;
} & ValidityStartHeight$1;
declare class ConsensusClient extends Client$1 {
    constructor(url: URL);
    private getValidityStartHeight;
    /**
     * Returns a boolean specifying if we have established consensus with the network
     */
    isConsensusEstablished(options?: CallOptions): Promise<MaybeCallResponse<Boolean>>;
    /**
     * Given a serialized transaction, it will return the corresponding transaction struct
     */
    getRawTransactionInfo({ rawTransaction }: RawTransactionInfoParams, options?: CallOptions): Promise<MaybeCallResponse<Transaction>>;
    /**
     * Creates a serialized transaction
     */
    createTransaction(p: TransactionParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a transaction
     */
    sendTransaction(p: TransactionParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized transaction creating a new vesting contract
     */
    createNewVestingTransaction(p: VestingTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a transaction creating a new vesting contract to the network
     */
    sendNewVestingTransaction(p: VestingTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized transaction redeeming a vesting contract
     */
    createRedeemVestingTransaction(p: RedeemVestingTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a transaction redeeming a vesting contract
     */
    sendRedeemVestingTransaction(p: RedeemVestingTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized transaction creating a new HTLC contract
     */
    createNewHtlcTransaction(p: HtlcTransactionParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a transaction creating a new HTLC contract
     */
    sendNewHtlcTransaction(p: HtlcTransactionParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized transaction redeeming an HTLC contract
     */
    createRedeemRegularHtlcTransaction(p: RedeemRegularHtlcTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a transaction redeeming an HTLC contract
     */
    sendRedeemRegularHtlcTransaction(p: RedeemRegularHtlcTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized transaction redeeming a HTLC contract using the `TimeoutResolve`
     * method
     */
    createRedeemTimeoutHtlcTransaction(p: RedeemTimeoutHtlcTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a transaction redeeming a HTLC contract using the `TimeoutResolve`
     * method to network
     */
    sendRedeemTimeoutHtlcTransaction(p: RedeemTimeoutHtlcTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized transaction redeeming a HTLC contract using the `EarlyResolve`
     * method.
     */
    createRedeemEarlyHtlcTransaction(p: RedeemEarlyHtlcTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a transaction redeeming a HTLC contract using the `EarlyResolve`
     * method.
     */
    sendRedeemEarlyHtlcTransaction(p: RedeemEarlyHtlcTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized signature that can be used to redeem funds from a HTLC contract using
     * the `EarlyResolve` method.
     */
    signRedeemEarlyHtlcTransaction(p: SignRedeemEarlyHtlcParams, options?: CallOptions): Promise<MaybeCallResponse<String>>;
    /**
     * Returns a serialized `new_staker` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    createNewStakerTransaction(p: StakerTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a `new_staker` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    sendNewStakerTransaction(p: StakerTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized `stake` transaction. The funds to be staked and the transaction fee will
     * be paid from the `sender_wallet`.
     */
    createStakeTransaction(p: StakeTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a `stake` transaction. The funds to be staked and the transaction fee will
     * be paid from the `sender_wallet`.
     */
    sendStakeTransaction(p: StakeTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized `update_staker` transaction. You can pay the transaction fee from a basic
     * account (by providing the sender wallet) or from the staker account's balance (by not
     * providing a sender wallet).
     */
    createUpdateStakerTransaction(p: UpdateStakerTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a `update_staker` transaction. You can pay the transaction fee from a basic
     * account (by providing the sender wallet) or from the staker account's balance (by not
     * providing a sender wallet).
     */
    sendUpdateStakerTransaction(p: UpdateStakerTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized `unstake` transaction. The transaction fee will be paid from the funds
     * being unstaked.
     */
    createUnstakeTransaction(p: UnstakeTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a `unstake` transaction. The transaction fee will be paid from the funds
     * being unstaked.
     */
    sendUnstakeTransaction(p: UnstakeTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized `new_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee and the validator deposit.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * "" = Set the signal data field to None.
     * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
     */
    createNewValidatorTransaction(p: NewValidatorTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a `new_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee and the validator deposit.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * "" = Set the signal data field to None.
     * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
     */
    sendNewValidatorTransaction(p: NewValidatorTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized `update_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * null = No change in the signal data field.
     * "" = Change the signal data field to None.
     * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
     */
    createUpdateValidatorTransaction(p: UpdateValidatorTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a `update_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * null = No change in the signal data field.
     * "" = Change the signal data field to None.
     * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
     */
    sendUpdateValidatorTransaction(p: UpdateValidatorTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized `inactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    createDeactivateValidatorTransaction(p: InactiveValidatorTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a `inactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    sendDeactivateValidatorTransaction(p: InactiveValidatorTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized `reactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    createReactivateValidatorTransaction(p: ReactivateValidatorTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a `reactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    sendReactivateValidatorTransaction(p: ReactivateValidatorTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized `unpark_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    createUnparkValidatorTransaction(p: UnparkValidatorTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a `unpark_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    sendUnparkValidatorTransaction(p: UnparkValidatorTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized `retire_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    createRetireValidatorTransaction(p: RetireValidatorTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a `retire_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    sendRetireValidatorTransaction(p: RetireValidatorTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Returns a serialized `delete_validator` transaction. The transaction fee will be paid from the
     * validator deposit that is being returned.
     * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
     * Failed delete validator transactions can diminish the validator deposit
     */
    createDeleteValidatorTransaction(p: DeleteValidatorTxParams, options?: CallOptions): Promise<MaybeCallResponse<RawTransaction>>;
    /**
     * Sends a `delete_validator` transaction. The transaction fee will be paid from the
     * validator deposit that is being returned.
     * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
     * Failed delete validator transactions can diminish the validator deposit
     */
    sendDeleteValidatorTransaction(p: DeleteValidatorTxParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
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
    pushTransaction({ transaction, withHighPriority }: PushTransactionParams, options?: CallOptions): Promise<MaybeCallResponse<Hash>>;
    /**
     * Content of the mempool
     *
     * @param includeTransactions
     * @returns
     */
    mempoolContent({ includeTransactions }?: MempoolContentParams, options?: CallOptions): Promise<MaybeCallResponse<(Hash | Transaction)[]>>;
    /**
     * @returns
     */
    mempool(options?: CallOptions): Promise<MaybeCallResponse<MempoolInfo>>;
    /**
     *
     * @returns
     */
    getMinFeePerByte(options?: CallOptions): Promise<MaybeCallResponse<number>>;
}

declare class NetworkClient extends Client$1 {
    constructor(url: URL);
    /**
     * The peer ID for our local peer.
     */
    getPeerId(options?: CallOptions): Promise<MaybeCallResponse<String>>;
    /**
     * Returns the number of peers.
     */
    getPeerCount(options?: CallOptions): Promise<MaybeCallResponse<number>>;
    /**
     * Returns a list with the IDs of all our peers.
     */
    getPeerList(options?: CallOptions): Promise<MaybeCallResponse<String[]>>;
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
    getPolicyConstants(options?: CallOptions): Promise<MaybeCallResponse<PolicyConstants>>;
    /**
     * Gets the epoch number at a given `block_number` (height)
     *
     * @param blockNumber The block number (height) to query.
     * @param justIndex The epoch index is the number of a block relative to the epoch it is in.
     * For example, the first block of any epoch always has an epoch index of 0.
     * @returns The epoch number at the given block number (height) or index
     */
    getEpochAt({ blockNumber, justIndex }: BlockNumberWithIndex, options?: CallOptions): Promise<MaybeCallResponse<number>>;
    /**
     * Gets the batch number at a given `block_number` (height)
     *
     * @param blockNumber The block number (height) to query.
     * @param justIndex The batch index is the number of a block relative to the batch it is in.
     * For example, the first block of any batch always has an epoch index of 0.
     * @returns The epoch number at the given block number (height).
     */
    getBatchAt({ blockNumber, justIndex }: BlockNumberWithIndex, options?: CallOptions): Promise<MaybeCallResponse<number>>;
    /**
     * Gets the number (height) of the next election macro block after a given block number (height).
     *
     * @param blockNumber The block number (height) to query.
     * @returns The number (height) of the next election macro block after a given block number (height).
     */
    getElectionBlockAfter({ blockNumber }: JustBlockNumber, options?: CallOptions): Promise<MaybeCallResponse<number>>;
    /**
     * Gets the block number (height) of the preceding election macro block before a given block number (height).
     * If the given block number is an election macro block, it returns the election macro block before it.
     *
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the preceding election macro block before a given block number (height).
     */
    getElectionBlockBefore({ blockNumber }: JustBlockNumber, options?: CallOptions): Promise<MaybeCallResponse<number>>;
    /**
     * Gets the block number (height) of the last election macro block at a given block number (height).
     * If the given block number is an election macro block, then it returns that block number.
     *
     * @param blockNumber The block number (height) to query.
     * @returns
     */
    getLastElectionBlock({ blockNumber }: JustBlockNumber, options?: CallOptions): Promise<MaybeCallResponse<number>>;
    /**
     * Gets a boolean expressing if the block at a given block number (height) is an election macro block.
     *
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the block at a given block number (height) is an election macro block.
     */
    getIsElectionBlockAt({ blockNumber }: JustBlockNumber, options?: CallOptions): Promise<MaybeCallResponse<Boolean>>;
    /**
     * Gets the block number (height) of the next macro block after a given block number (height).
     *
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the next macro block after a given block number (height).
     */
    getMacroBlockAfter({ blockNumber }: JustBlockNumber, options?: CallOptions): Promise<MaybeCallResponse<number>>;
    /**
     * Gets the block number (height) of the preceding macro block before a given block number (height).
     *
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the preceding macro block before a given block number (height).
     */
    getMacroBlockBefore({ blockNumber }: JustBlockNumber, options?: CallOptions): Promise<MaybeCallResponse<number>>;
    /**
     * Gets the block number (height) of the last macro block at a given block number (height).
     * If the given block number is a macro block, then it returns that block number.
     *
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the last macro block at a given block number (height).
     */
    getLastMacroBlock({ blockNumber }: JustBlockNumber, options?: CallOptions): Promise<MaybeCallResponse<number>>;
    /**
     * Gets a boolean expressing if the block at a given block number (height) is a macro block.
     *
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the block at a given block number (height) is a macro block.
     */
    getIsMacroBlockAt({ blockNumber }: JustBlockNumber, options?: CallOptions): Promise<MaybeCallResponse<Boolean>>;
    /**
     * Gets the block number (height) of the next micro block after a given block number (height).
     *
     * @param blockNumber The block number (height) to query.
     * @returns The block number (height) of the next micro block after a given block number (height).
     */
    getIsMicroBlockAt({ blockNumber }: JustBlockNumber, options?: CallOptions): Promise<MaybeCallResponse<Boolean>>;
    /**
     * Gets the block number (height) of the first block of the given epoch (which is always a micro block).
     *
     * @param epochIndex The epoch index to query.
     * @returns The block number (height) of the first block of the given epoch (which is always a micro block).
     */
    getFirstBlockOf({ epochIndex }: JustEpochIndex, options?: CallOptions): Promise<MaybeCallResponse<number>>;
    /**
     * Gets the block number of the first block of the given batch (which is always a micro block).
     *
     * @param batchIndex The batch index to query.
     * @returns The block number of the first block of the given batch (which is always a micro block).
     */
    getFirstBlockOfBatch({ batchIndex }: JustBatchIndex, options?: CallOptions): Promise<MaybeCallResponse<number>>;
    /**
     * Gets the block number of the election macro block of the given epoch (which is always the last block).
     *
     * @param epochIndex The epoch index to query.
     * @returns The block number of the election macro block of the given epoch (which is always the last block).
     */
    getElectionBlockOf({ epochIndex }: JustEpochIndex, options?: CallOptions): Promise<MaybeCallResponse<number>>;
    /**
     * Gets the block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
     *
     * @param batchIndex The batch index to query.
     * @returns The block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
     */
    getMacroBlockOf({ batchIndex }: JustBatchIndex, options?: CallOptions): Promise<MaybeCallResponse<number>>;
    /**
     * Gets a boolean expressing if the batch at a given block number (height) is the first batch
     * of the epoch.
     *
     * @param blockNumber The block number (height) to query.
     * @returns A boolean expressing if the batch at a given block number (height) is the first batch
     */
    getFirstBatchOfEpoch({ blockNumber }: JustBlockNumber, options?: CallOptions): Promise<MaybeCallResponse<Boolean>>;
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
    getSupplyAt({ genesisSupply, genesisTime, currentTime }: SupplyAtParams, options?: CallOptions): Promise<MaybeCallResponse<number>>;
}

type SetAutomaticReactivationParams = {
    automaticReactivation: boolean;
};
declare class ValidatorClient extends Client$1 {
    constructor(url: URL);
    /**
     * Returns our validator address.
     */
    getAddress(options?: CallOptions): Promise<MaybeCallResponse<String>>;
    /**
     * Returns our validator signing key
     */
    getSigningKey(options?: CallOptions): Promise<MaybeCallResponse<String>>;
    /**
     * Returns our validator voting key
     */
    getVotingKey(options?: CallOptions): Promise<MaybeCallResponse<String>>;
    /**
     * Updates the configuration setting to automatically reactivate our validator
     */
    setAutomaticReactivation({ automaticReactivation }: SetAutomaticReactivationParams, options?: CallOptions): Promise<MaybeCallResponse<null>>;
}

type ImportKeyParams = {
    keyData: string;
    passphrase?: string;
};
type IsAccountImportedParams = {
    address: Address$1;
};
type LockAccountParams = {
    address: Address$1;
};
type UnlockAccountParams = {
    address: Address$1;
    passphrase?: string;
    duration?: number;
};
type IsAccountLockedParams = {
    address: Address$1;
};
type CreateAccountParams = {
    passphrase?: string;
};
type SignParams = {
    message: string;
    address: Address$1;
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
    importRawKey({ keyData, passphrase }: ImportKeyParams, options?: CallOptions): Promise<MaybeCallResponse<Address$1>>;
    isAccountImported({ address }: IsAccountImportedParams, options?: CallOptions): Promise<MaybeCallResponse<Boolean>>;
    listAccounts(options?: CallOptions): Promise<MaybeCallResponse<Address$1[]>>;
    lockAccount({ address }: LockAccountParams, options?: CallOptions): Promise<MaybeCallResponse<null>>;
    createAccount(p?: CreateAccountParams, options?: CallOptions): Promise<MaybeCallResponse<WalletAccount>>;
    unlockAccount({ address, passphrase, duration }: UnlockAccountParams, options?: CallOptions): Promise<MaybeCallResponse<Boolean>>;
    isAccountLocked({ address }: IsAccountLockedParams, options?: CallOptions): Promise<MaybeCallResponse<Boolean>>;
    sign({ message, address, passphrase, isHex }: SignParams, options?: CallOptions): Promise<MaybeCallResponse<Signature>>;
    verifySignature({ message, publicKey, signature, isHex }: VerifySignatureParams, options?: CallOptions): Promise<MaybeCallResponse<Boolean>>;
}

declare class ZkpComponentClient extends Client$1 {
    constructor(url: URL);
    getZkpState(options?: CallOptions): Promise<MaybeCallResponse<ZKPState>>;
}

declare class Client {
    block: {
        current: (options?: CallOptions) => Promise<MaybeCallResponse<number>>;
        getBy: <T extends GetBlockByParams>(p?: T, options?: CallOptions) => Promise<T extends {
            includeTransactions: true;
        } ? MaybeCallResponse<Block$1> : MaybeCallResponse<PartialBlock$1>>;
        latest: <T_1 extends GetLatestBlockParams>(p?: T_1, options?: CallOptions) => Promise<MaybeCallResponse<T_1 extends {
            includeTransactions: true;
        } ? Block$1 : PartialBlock$1>>;
        election: {
            after: ({ blockNumber }: {
                blockNumber: number;
            }, options?: CallOptions) => Promise<MaybeCallResponse<number>>;
            before: ({ blockNumber }: {
                blockNumber: number;
            }, options?: CallOptions) => Promise<MaybeCallResponse<number>>;
            last: ({ blockNumber }: {
                blockNumber: number;
            }, options?: CallOptions) => Promise<MaybeCallResponse<number>>;
            getBy: ({ epochIndex }: {
                epochIndex: number;
            }, options?: CallOptions) => Promise<MaybeCallResponse<number>>;
            subscribe: <T_2 extends SubscribeForValidatorElectionByAddressParams, O extends StreamOptions<"subscribeForValidatorElectionByAddress">>(p: T_2, userOptions?: Partial<O> | undefined) => Promise<MaybeSubscription<"subscribeForValidatorElectionByAddress", O extends {
                withMetadata: true;
            } ? true : false, false>>;
        };
        isElection: ({ blockNumber }: {
            blockNumber: number;
        }, options?: CallOptions) => Promise<MaybeCallResponse<Boolean>>;
        macro: {
            after: ({ blockNumber }: {
                blockNumber: number;
            }, options?: CallOptions) => Promise<MaybeCallResponse<number>>;
            before: ({ blockNumber }: {
                blockNumber: number;
            }, options?: CallOptions) => Promise<MaybeCallResponse<number>>;
            last: ({ blockNumber }: {
                blockNumber: number;
            }, options?: CallOptions) => Promise<MaybeCallResponse<number>>;
            getBy: ({ batchIndex }: {
                batchIndex: number;
            }, options?: CallOptions) => Promise<MaybeCallResponse<number>>;
        };
        isMacro: ({ blockNumber }: {
            blockNumber: number;
        }, options?: CallOptions) => Promise<MaybeCallResponse<Boolean>>;
        isMicro: ({ blockNumber }: {
            blockNumber: number;
        }, options?: CallOptions) => Promise<MaybeCallResponse<Boolean>>;
        subscribe: <T_3 extends SubscribeForHeadBlockParams | SubscribeForHeadHashParams, N extends T_3["retrieve"] extends "HASH" ? "subscribeForHeadBlockHash" : "subscribeForHeadBlock", O_1 extends StreamOptions<N>>(params: T_3, userOptions?: Partial<O_1> | undefined) => Promise<BlockSubscription<T_3>>;
    };
    batch: {
        current: (options?: CallOptions) => Promise<MaybeCallResponse<number>>;
        at: ({ blockNumber, justIndex }: {
            blockNumber: number;
            justIndex?: boolean | undefined;
        }, options?: CallOptions) => Promise<MaybeCallResponse<number>>;
        firstBlock: ({ epochIndex }: {
            epochIndex: number;
        }, options?: CallOptions) => Promise<MaybeCallResponse<number>>;
    };
    epoch: {
        current: (options?: CallOptions) => Promise<MaybeCallResponse<number>>;
        at: ({ blockNumber, justIndex }: {
            blockNumber: number;
            justIndex?: boolean | undefined;
        }, options?: CallOptions) => Promise<MaybeCallResponse<number>>;
        firstBlock: ({ epochIndex }: {
            epochIndex: number;
        }, options?: CallOptions) => Promise<MaybeCallResponse<number>>;
        firstBatch: ({ blockNumber }: {
            blockNumber: number;
        }, options?: CallOptions) => Promise<MaybeCallResponse<Boolean>>;
    };
    transaction: {
        getBy: <T extends GetTransactionByParams>(p: T, options?: CallOptions) => Promise<MaybeCallResponse<T extends {
            hash: string;
        } ? Transaction : T extends {
            address: `NQ${number} ${string}`;
        } ? T extends infer T_1 ? T_1 extends T ? T_1 extends {
            justHashes: true;
        } ? string[] : Transaction[] : never : never : Transaction[]>>;
        push: ({ transaction, withHighPriority }: {
            transaction: string;
            withHighPriority?: boolean | undefined;
        }, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
        minFeePerByte: (options?: CallOptions) => Promise<MaybeCallResponse<number>>;
        create: (p: TransactionParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
        send: (p: TransactionParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
    };
    inherent: {
        getBy: <T extends GetInherentsByParams>(p: T, options?: CallOptions) => Promise<MaybeCallResponse<Inherent[]>>;
    };
    account: {
        getBy: <T extends GetAccountByAddressParams>({ address, withMetadata }: T, options?: CallOptions) => Promise<MaybeCallResponse<T extends {
            withMetadata: true;
        } ? {
            data: Account;
            metadata: BlockchainState;
        } : Account>>;
        importRawKey: ({ keyData, passphrase }: {
            keyData: string;
            passphrase?: string | undefined;
        }, options?: CallOptions) => Promise<MaybeCallResponse<`NQ${number} ${string}`>>;
        new: (p?: {
            passphrase?: string | undefined;
        } | undefined, options?: CallOptions) => Promise<MaybeCallResponse<WalletAccount>>;
        isImported: ({ address }: {
            address: `NQ${number} ${string}`;
        }, options?: CallOptions) => Promise<MaybeCallResponse<Boolean>>;
        list: (options?: CallOptions) => Promise<MaybeCallResponse<`NQ${number} ${string}`[]>>;
        lock: ({ address }: {
            address: `NQ${number} ${string}`;
        }, options?: CallOptions) => Promise<MaybeCallResponse<null>>;
        unlock: ({ address, passphrase, duration }: {
            address: `NQ${number} ${string}`;
            passphrase?: string | undefined;
            duration?: number | undefined;
        }, options?: CallOptions) => Promise<MaybeCallResponse<Boolean>>;
        isLocked: ({ address }: {
            address: `NQ${number} ${string}`;
        }, options?: CallOptions) => Promise<MaybeCallResponse<Boolean>>;
        sign: ({ message, address, passphrase, isHex }: {
            message: string;
            address: `NQ${number} ${string}`;
            passphrase: string;
            isHex: boolean;
        }, options?: CallOptions) => Promise<MaybeCallResponse<Signature>>;
        verify: ({ message, publicKey, signature, isHex }: {
            message: string;
            publicKey: string;
            signature: Signature;
            isHex: boolean;
        }, options?: CallOptions) => Promise<MaybeCallResponse<Boolean>>;
    };
    validator: {
        byAddress: <T extends GetValidatorByAddressParams>(p?: T, options?: CallOptions) => Promise<MaybeCallResponse<T extends {
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
        }, options?: CallOptions) => Promise<MaybeCallResponse<null>>;
        selfNode: {
            address: (options?: CallOptions) => Promise<MaybeCallResponse<String>>;
            signingKey: (options?: CallOptions) => Promise<MaybeCallResponse<String>>;
            votingKey: (options?: CallOptions) => Promise<MaybeCallResponse<String>>;
        };
        activeList: <T_1 extends {
            withMetadata: boolean;
        }>({ withMetadata }?: T_1, options?: CallOptions) => Promise<MaybeCallResponse<T_1 extends {
            withMetadata: true;
        } ? {
            data: Validator[];
            metadata: BlockchainState;
        } : Validator[]>>;
        parked: <T_2 extends {
            withMetadata: boolean;
        }>({ withMetadata }?: T_2, options?: CallOptions) => Promise<MaybeCallResponse<T_2 extends {
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
                createTx: (p: NewValidatorTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
                sendTx: (p: NewValidatorTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            };
            update: {
                createTx: (p: UpdateValidatorTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
                sendTx: (p: UpdateValidatorTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            };
            deactive: {
                createTx: (p: InactiveValidatorTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
                sendTx: (p: InactiveValidatorTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            };
            reactivate: {
                createTx: (p: ReactivateValidatorTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
                sendTx: (p: ReactivateValidatorTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            };
            unpark: {
                createTx: (p: UnparkValidatorTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
                sendTx: (p: UnparkValidatorTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            };
            retire: {
                createTx: (p: RetireValidatorTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
                sendTx: (p: RetireValidatorTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            };
            delete: {
                createTx: (p: DeleteValidatorTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
                sendTx: (p: DeleteValidatorTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            };
        };
    };
    slots: {
        at: <T extends GetSlotAtParams>({ blockNumber, offsetOpt, withMetadata }: T, options?: CallOptions) => Promise<MaybeCallResponse<T extends {
            withMetadata: true;
        } ? {
            data: Slot;
            metadata: BlockchainState;
        } : Slot>>;
        slashed: {
            current: <T_1 extends {
                withMetadata: boolean;
            }>({ withMetadata }?: T_1, options?: CallOptions) => Promise<MaybeCallResponse<T_1 extends {
                withMetadata: true;
            } ? {
                data: SlashedSlot[];
                metadata: BlockchainState;
            } : SlashedSlot[]>>;
            previous: <T_2 extends {
                withMetadata: boolean;
            }>({ withMetadata }?: T_2, options?: CallOptions) => Promise<MaybeCallResponse<T_2 extends {
                withMetadata: true;
            } ? {
                data: SlashedSlot[];
                metadata: BlockchainState;
            } : SlashedSlot[]>>;
        };
    };
    mempool: {
        info: (options?: CallOptions) => Promise<MaybeCallResponse<MempoolInfo>>;
        content: ({ includeTransactions }?: {
            includeTransactions: boolean;
        }, options?: CallOptions) => Promise<MaybeCallResponse<(string | Transaction)[]>>;
    };
    stakes: {
        new: {
            createTx: (p: StakeTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            sendTx: (p: StakeTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
        };
    };
    staker: {
        byAddress: <T extends GetStakerByAddressParams>({ address }: T, options?: CallOptions) => Promise<MaybeCallResponse<T extends {
            withMetadata: true;
        } ? {
            data: Staker;
            metadata: BlockchainState;
        } : Staker>>;
        new: {
            createTx: (p: StakerTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            sendTx: (p: StakerTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
        };
        update: {
            createTx: (p: UpdateStakerTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            sendTx: (p: UpdateStakerTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
        };
    };
    peers: {
        id: (options?: CallOptions) => Promise<MaybeCallResponse<String>>;
        count: (options?: CallOptions) => Promise<MaybeCallResponse<number>>;
        peers: (options?: CallOptions) => Promise<MaybeCallResponse<String[]>>;
        consensusEstablished: (options?: CallOptions) => Promise<MaybeCallResponse<Boolean>>;
    };
    constant: {
        params: (options?: CallOptions) => Promise<MaybeCallResponse<PolicyConstants>>;
        supply: ({ genesisSupply, genesisTime, currentTime }: {
            genesisSupply: number;
            genesisTime: number;
            currentTime: number;
        }, options?: CallOptions) => Promise<MaybeCallResponse<number>>;
    };
    htlc: {
        new: {
            createTx: (p: HtlcTransactionParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            sendTx: (p: HtlcTransactionParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
        };
        redeem: {
            regular: {
                createTx: (p: RedeemRegularHtlcTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
                sendTx: (p: RedeemRegularHtlcTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            };
            timeoutTx: {
                createTx: (p: RedeemTimeoutHtlcTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
                sendTx: (p: RedeemTimeoutHtlcTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            };
            earlyTx: {
                createTx: (p: RedeemEarlyHtlcTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
                sendTx: (p: RedeemEarlyHtlcTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            };
        };
    };
    vesting: {
        new: {
            createTx: (p: VestingTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            sendTx: (p: VestingTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
        };
        redeem: {
            createTx: (p: RedeemVestingTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
            sendTx: (p: RedeemVestingTxParams, options?: CallOptions) => Promise<MaybeCallResponse<string>>;
        };
    };
    zeroKnowledgeProof: {
        state: (options?: CallOptions) => Promise<MaybeCallResponse<ZKPState>>;
    };
    logs: {
        subscribe: <T extends SubscribeForLogsByAddressesAndTypesParams, O extends StreamOptions<"subscribeForLogsByAddressesAndTypes">>(p?: T | undefined, userOptions?: Partial<O> | undefined) => Promise<MaybeSubscription<"subscribeForLogsByAddressesAndTypes", O extends {
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

export { Account, AccountType$1 as AccountType, Address$1 as Address, AppliedBlockLog, BasicAccount, BatchIndex, Block$1 as Block, BlockLog, BlockNumber, BlockSubscription, BlockType, BlockchainClient, CallOptions, CallbackParam, Client, Coin$1 as Coin, ConsensusClient, ContextRequest, CreateStakerLog, CreateValidatorLog, CurrentTime$1 as CurrentTime, DeleteValidatorLog, DeleteValidatorTxParams, ElectionMacroBlock, EpochIndex, ErrorCallReturn, ErrorStreamReturn, FailedTransactionLog, GenesisSupply$1 as GenesisSupply, GenesisTime$1 as GenesisTime, GetAccountByAddressParams, GetBlockByParams, GetInherentsByParams, GetLatestBlockParams, GetSlotAtParams, GetStakerByAddressParams, GetTransactionByParams, GetTransactionsByAddressParams, GetValidatorByAddressParams, Hash, HtlcAccount, HtlcTransactionParams, InactivateValidatorLog, InactiveValidatorTxParams, Inherent, InherentLog, Log, LogType, MacroBlock, MaybeCallResponse, MaybeStreamResponse, MempoolClient, MempoolInfo, MethodName, MethodResponse, MethodResponseError, MethodResponsePayload, Methods, MicroBlock, NetworkClient, NewValidatorTxParams, ParkInherentLog, ParkedSet, PartialBlock$1 as PartialBlock, PartialMacroBlock, PartialMicroBlock, PartialValidator$1 as PartialValidator, PayFeeLog, PayoutInherentLog, PolicyClient, PolicyConstants, RawTransaction, RawTransactionInfoParams, ReactivateValidatorLog, ReactivateValidatorTxParams, RedeemEarlyHtlcTxParams, RedeemRegularHtlcTxParams, RedeemTimeoutHtlcTxParams, RedeemVestingTxParams, RetireValidatorTxParams, RevertContractInherentLog, RevertedBlockLog, RpcRequest, SignRedeemEarlyHtlcParams, Signature, SlashInherentLog, SlashedSlot, Slot, StakeLog, StakeTxParams, Staker, StakerTxParams, StreamName, StreamOptions, StreamResponse, StreamResponsePayload, Streams, SubscribeForHeadBlockParams, SubscribeForLogsByAddressesAndTypesParams, SubscribeForValidatorElectionByAddressParams, Transaction, TransactionLog, TransactionParams, TransferLog, UnparkValidatorLog, UnparkValidatorTxParams, UnstakeLog, UnstakeTxParams, UpdateStakerLog, UpdateStakerTxParams, UpdateValidatorLog, UpdateValidatorTxParams, Validator, ValidatorClient, VestingAccount, VestingTxParams, WalletAccount, WalletClient, ZKPState, ZkpComponentClient };
