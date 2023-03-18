import { BlockType } from "./enums"

export type Address = `NQ${number} ${string}`
export type Coin = number

export type BlockNumber = number /* u32 */
export type EpochIndex = number /* u32 */
export type BatchIndex = number /* u32 */
export type GenesisSupply = number /* u64 */
export type GenesisTime = number /* u64 */
export type CurrentTime = number /* u64 */
export type Hash = string

export type PolicyConstants = {
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

export enum AccountType {
    BASIC = 'basic',
    VESTING = 'vesting',
    HTLC = 'htlc',
}

export type BasicAccount = {
    type: AccountType.BASIC;
    address: Address;
    balance: Coin;
}

export type VestingAccount = {
    type: AccountType.VESTING;
    address: Address;
    balance: Coin;
    owner: Address;
    vestingStart: number;
    vestingStepBlocks: number;
    vestingStepAmount: Coin;
    vestingTotalAmount: Coin;
}

export type HtlcAccount = {
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

export type Account = BasicAccount | VestingAccount | HtlcAccount

export type Transaction = {
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

export type RawTransaction = string;

export type PartialMicroBlock = {
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
    forkProofs?: any[];
    justification?: {
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

export type MicroBlock = PartialMicroBlock & {
    transactions: Transaction[];
}

export type PartialMacroBlock = {
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
    isElectionBlock: boolean;
    parentElectionHash: string;
}

export type MacroBlock = PartialMacroBlock & {
    transactions: Transaction[];
    lostRewardSet?: any[];
    disabledSet?: any[];
    slots?: {
        firstSlotNumber: number;
        numSlots: number;
        publicKey: string;
        validator: Address;
    }[];
    justification?: {
        round: number;
        sig: {
            signature: string;
            signers: number[];
        };
    };
}

export type PartialBlock = PartialMicroBlock | PartialMacroBlock
export type Block = MicroBlock | MacroBlock

export type Staker = {
    address: Address;
    balance: Coin;
    delegation?: Address;
}

export type PartialValidator = {
    address: Address;
    signingKey: string;
    votingKey: string;
    rewardAddress: Address;
    signalData?: string;
    balance: Coin;
    numStakers: number;
    inactivityFlag?: number;
    stakers?: Staker[];
}

export type Validator = {
    address: Address;
    signingKey: string;
    votingKey: string;
    rewardAddress: Address;
    signalData?: string;
    balance: Coin;
    numStakers: number;
    inactivityFlag?: number;
    stakers?: Staker[];
}

export type Slot = {
    slotNumber: number; // u16
    validator: Address;
    publicKey: string;
}

export type SlashedSlot = {
    blockNumber: BlockNumber; // u32
    lostRewards: number[]; // u32[]
    disabled: number[]; // u32[]
}

export type ParkedSet = {
    blockNumber: BlockNumber;
    validators: Address[];
}
export type Inherent = {
    ty: number; // u8
    blockNumber: BlockNumber; // u32
    timestamp: number; // u64
    target: Address;
    value: Coin;
    data: string; // Might be u8[] or number[] in TS
    hash: Hash;
}

export type MempoolInfo = {
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

export type WalletAccount = {
    address: Address,
    publicKey: string,
    privateKey: string,
}

export type Signature = {
    signature: string,
    publicKey: string,
}

export type ZKPState = {
    latestHeaderHash: Hash
    latestBlockNumber: BlockNumber
    latestProof?: string
}