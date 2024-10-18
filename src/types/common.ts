export type Address = string
export type Coin = number
export type Hash = string
export type BlockNumber = number
export type EpochIndex = number
export type BatchIndex = number
export type GenesisSupply = number
export type GenesisTime = number
export type CurrentTime = number

export type ValidityStartHeight =
  | { relativeValidityStartHeight: number }
  | { absoluteValidityStartHeight: number }

export enum HashAlgorithm {
  Blake2b = 1,
  Sha256 = 3,
  Sha512 = 4,
}

export enum AccountType {
  Basic = 'basic',
  Vesting = 'vesting',
  HTLC = 'htlc',
  Staking = 'staking',
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
  minimumStake: number
  totalSupply: number
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

export interface StakingAccount {
  type: AccountType.Staking
  address: Address
  balance: Coin
}

export type Account = BasicAccount | VestingAccount | HtlcAccount | StakingAccount
export interface Transaction {
  hash: string
  blockNumber?: number // Optional, corresponds to Option<u32>
  timestamp?: bigint // Optional, corresponds to Option<u64>
  confirmations?: number // Optional, corresponds to Option<u32>
  size: number // Corresponds to usize
  relatedAddresses: Set<Address> // Corresponds to BTreeSet<Address>
  from: Address
  fromType: number // Corresponds to u8
  to: Address
  toType: number // Corresponds to u8
  value: Coin
  fee: Coin
  senderData: string // Corresponds to Vec<u8>
  recipientData: string // Corresponds to Vec<u8>
  flags: number // Corresponds to u8
  validityStartHeight: number // Corresponds to u32
  proof: string // Corresponds to Vec<u8>
  networkId: number // Corresponds to u8
}

export interface Staker {
  address: Address
  balance: Coin
  delegation?: Address
  inactiveBalance: Coin
  inactiveFrom: number | null
  retiredBalance: Coin
}

export interface Validator {
  address: Address
  signingKey: string
  votingKey: string
  rewardAddress: Address
  signalData?: string
  balance: Coin
  numStakers: number
  retired: boolean
  inactivityFlag?: number
  jailedFrom?: number
}

export interface Slot {
  firstSlotNumber: number
  numSlots: number
  validator: Address
  publicKey: string
}

export interface PenalizedSlots {
  blockNumber: number
  disabled: number[]
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
  offenseEventBlock: number
}

export interface InherentJail {
  type: InherentType.Jail
  blockNumber: number
  blockTime: number
  validatorAddress: Address
  offenseEventBlock: number
}

export type Inherent = InherentReward | InherentPenalize | InherentJail

export interface MempoolInfo {
  _0?: number
  _1?: number
  _2?: number
  _5?: number
  _10?: number
  _20?: number
  _50?: number
  _100?: number
  _200?: number
  _500?: number
  _1000?: number
  _2000?: number
  _5000?: number
  _10000?: number
  total: number
  buckets: number[]
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
  latestBlock: Block
  latestProof?: string
}

export interface BlockchainState {
  blockNumber: number
  blockHash: string
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

// Block types
export interface Block {
  hash: string
  size: number
  batch: number
  epoch: number
  network: string
  version: number
  number: number
  timestamp: number
  parentHash: string
  seed: string
  extraData: string
  stateHash: string
  bodyHash?: string
  historyHash: string
  transactions?: Transaction[]
  additionalFields: any
}
