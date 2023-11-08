import type { AccountType, BlockType } from './enums'

export type Address = `NQ${number} ${string}`
export type Coin = number

export type BlockNumber = number /* u32 */
export type ValidityStartHeight =
  | { relativeValidityStartHeight: number }
  | { absoluteValidityStartHeight: number }
export type EpochIndex = number /* u32 */
export type BatchIndex = number /* u32 */
export type GenesisSupply = number /* u64 */
export type GenesisTime = number /* u64 */
export type CurrentTime = number /* u64 */
export type Hash = string

export interface PolicyConstants {
  stakingContractAddress: Address
  coinbaseAddress: Address
  transactionValidityWindow: number
  maxSizeMicroBody: number
  version: number
  slots: number
  blocksPerBatch: number
  batchesPerEpoch: number
  blocksPerEpoch: number
  validatorDeposit: number
  totalSupply: number
}

export interface BasicAccount {
  type: AccountType.BASIC
  address: Address
  balance: Coin
}

export interface VestingAccount {
  type: AccountType.VESTING
  address: Address
  balance: Coin
  owner: Address
  vestingStart: number
  vestingStepBlocks: number
  vestingStepAmount: Coin
  vestingTotalAmount: Coin
}

export interface HtlcAccount {
  type: AccountType.HTLC
  address: Address
  balance: Coin
  sender: Address
  recipient: Address
  hashRoot: string
  hashCount: number
  timeout: number
  totalAmount: Coin
}

export type Account = BasicAccount | VestingAccount | HtlcAccount

export interface Transaction {
  hash: string
  blockNumber: number
  timestamp: number
  confirmations: number
  from: Address
  to: Address
  value: Coin
  fee: Coin
  data: string
  flags: number
  validityStartHeight: number
  proof: string
  executionResult: boolean
}

export type RawTransaction = string

export interface PartialMicroBlock {
  type: BlockType.MICRO
  hash: string
  size: number
  batch: number
  version: number
  number: number
  timestamp: number
  parentHash: string
  seed: string
  extraData: string
  stateHash: string
  bodyHash: string
  historyHash: string
  producer: {
    slotNumber: number
    validator: Address
    publicKey: string
  }
  justification: {
    micro: string
  } | {
    skip: {
      sig: {
        signature: { signature: string }
        signers: number[]
      }
    }
  }
}

export type MicroBlock = PartialMicroBlock & {
  transactions: Transaction[]
}

export interface PartialMacroBlock {
  type: BlockType.MACRO
  hash: string
  size: number
  batch: number
  epoch: number
  version: number
  number: number
  timestamp: number
  parentHash: string
  seed: string
  extraData: string
  stateHash: string
  bodyHash: string
  historyHash: string
  parentElectionHash: string
}

export type MacroBlock = PartialMacroBlock & {
  isElectionBlock: false
  transactions: Transaction[]
  lostRewardSet: number[]
  disabledSet: number[]
  justification: {
    round: number
    sig: {
      signature: { signature: string }
      signers: number[]
    }
  }
}

export type ElectionMacroBlock = PartialMacroBlock & {
  isElectionBlock: true
  transactions: Transaction[]
  interlink: string[]
  slots: Slot[]
  nextBatchInitialPunishedSet: number[]
}

export type PartialBlock = PartialMicroBlock | PartialMacroBlock
export type Block = MicroBlock | MacroBlock | ElectionMacroBlock

export interface Staker {
  address: Address
  balance: Coin
  delegation?: Address
  inactiveBalance: Coin
  inactiveFrom: number | null
}

export interface Validator {
  address: Address
  signingKey: string
  votingKey: string
  rewardAddress: Address
  balance: Coin
  numStakers: number
  retired: boolean
}

export interface Slot {
  firstSlotNumber: number // u16
  numSlots: number // u16
  validator: Address
  publicKey: string
}

export interface PenalizedSlot {
  blockNumber: BlockNumber // u32
  lostRewards: number[] // u32[]
  disabled: number[] // u32[]
}

// export type ParkedSet = {
//   blockNumber: BlockNumber;
//   validators: Address[];
// };

export interface Inherent {
  reward: {
    block_number: number
    block_time: number
    target: Address
    value: Coin
    hash: string
  }
}

export interface MempoolInfo {
  _0?: number // u32
  _1?: number // u32
  _2?: number // u32
  _5?: number // u32
  _10?: number // u32
  _20?: number // u32
  _50?: number // u32
  _100?: number // u32
  _200?: number // u32
  _500?: number // u32
  _1000?: number // u32
  _2000?: number // u32
  _5000?: number // u32
  _10000?: number // u32
  total: number // u32
  buckets: number[] // u32[]
}

export interface WalletAccount {
  address: Address
  publicKey: string
  privateKey: string
}

export interface Signature {
  signature: string
  publicKey: string
}

export interface ZKPState {
  latestHeaderHash: Hash
  latestBlockNumber: BlockNumber
  latestProof?: string
}

export interface BlockchainState {
  blockNumber: BlockNumber
  blockHash: Hash
}

export type Auth = {
  username: string
  password: string
} | {
  secret: string
}
