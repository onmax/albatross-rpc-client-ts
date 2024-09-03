export type Address = string
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

// TODO Review this enum https://github.com/nimiq/core-rs-albatross/blob/albatross/rpc-interface/src/types.rs#L1002
export enum LogType {
  PayoutInherent = 'payout-inherent',
  ParkInherent = 'park-inherent',
  SlashInherent = 'slash-inherent',
  RevertContractInherent = 'revert-contract-inherent',
  PayFee = 'pay-fee',
  Transfer = 'transfer',
  HtlcCreate = 'htlc-create',
  HtlcTimeoutResolve = 'htlc-timeout-resolve',
  HtlcRegularTransfer = 'htlc-regular-transfer',
  HtlcEarlyResolve = 'htlc-early-resolve',
  VestingCreate = 'vesting-create',
  CreateValidator = 'create-validator',
  UpdateValidator = 'update-validator',
  DeactivateValidator = 'deactivate-validator',
  ReactivateValidator = 'reactivate-validator',
  UnparkValidator = 'unpark-validator',
  CreateStaker = 'create-staker',
  Stake = 'stake',
  StakerFeeDeduction = 'staker-fee-deduction',
  SetActiveStake = 'set-inactive-stake',
  UpdateStaker = 'update-staker',
  RetireValidator = 'retire-validator',
  DeleteValidator = 'delete-validator',
  PayoutReward = 'payout-reward',
  Park = 'park',
  Slash = 'slash',
  RevertContract = 'revert-contract',
  FailedTransaction = 'failed-transaction',
  ValidatorFeeDeduction = 'validator-fee-deduction',
  RetireStake = 'retire-stake',
  RemoveStake = 'remove-stake',
}

export enum AccountType {
  Basic = 'basic',
  Vesting = 'vesting',
  HTLC = 'htlc',
}

export enum InherentType {
  Reward = 'reward',
  Jail = 'jail',
  Penalize = 'penalize',
}

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
  minimumStake: number
  jailEpochs: number
  genesisBlockNumber: number
  blockSeparationTime: number
}

export interface BasicAccount {
  type: AccountType.Basic
  address: Address
  balance: Coin
}

export interface VestingAccount {
  type: AccountType.Vesting
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
  type: BlockType.Micro
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
  type: BlockType.Macro
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

export interface InherentReward {
  type: InherentType.Reward
  blockNumber: number
  blockTime: number
  validatorAddress: Address
  target: Address
  value: Coin
  hash: string
}

export interface InherentPenalize {
  type: InherentType.Penalize
  blockNumber: number
  blockTime: number
  validatorAddress: Address
  slot: number
  offenseEventBlock: number // u32
}

export interface InherentJail {
  type: InherentType.Jail
  blockNumber: number
  blockTime: number
  validatorAddress: Address
  offenseEventBlock: number // u32
}

export type Inherent = InherentReward | InherentPenalize | InherentJail

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

export enum BlockType {
  Micro = 'micro',
  Macro = 'macro',
}

export enum BlockSubscriptionType {
  Macro = 'macro',
  Micro = 'micro',
  Election = 'election',
}

export enum RetrieveBlock {
  Full = 'full',
  Partial = 'partial',
  Hash = 'hash',
}
