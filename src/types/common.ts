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

/**
 * Represents constants used in the policy module of the blockchain.
 */
export interface PolicyConstants {
  /**
   * The staking contract address in the blockchain.
   */
  stakingContractAddress: Address

  /**
   * The address that receives the block rewards (coinbase).
   */
  coinbaseAddress: Address

  /**
   * The maximum validity window for transactions (number of blocks).
   */
  transactionValidityWindow: number

  /**
   * The maximum size (in bytes) of the body of a micro block.
   */
  maxSizeMicroBody: number

  /**
   * The version number of the policy constants.
   */
  version: number

  /**
   * The total number of validator slots in the network.
   */
  slots: number

  /**
   * The number of blocks in a batch.
   */
  blocksPerBatch: number

  /**
   * The number of batches in an epoch.
   */
  batchesPerEpoch: number

  /**
   * The total number of blocks in an epoch.
   */
  blocksPerEpoch: number

  /**
   * The deposit amount required for a validator slot (in smallest currency unit, e.g., Lunas).
   */
  validatorDeposit: number

  /**
   * The minimum stake required to participate in staking (in smallest currency unit, e.g., Lunas).
   */
  minimumStake: number

  /**
   * The total supply of coins in the network (in smallest currency unit, e.g., Lunas).
   */
  totalSupply: number

  /**
   * The number of epochs for which a validator is jailed after misbehavior.
   */
  jailEpochs: number

  /**
   * The block number of the genesis block.
   */
  genesisBlockNumber: number

  /**
   * The time (in seconds) between the production of two consecutive blocks.
   */
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

  /**
   * The total amount of stakers in the valiator
   */
  numStakers: number

  /**
   * Wether the validator has been retired
   */
  retired: boolean

  /**
   * The block in which the validator was inactive from
   */
  inactivityFlag?: number

  /**
   * The block in which the validator was jailed from
   */
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

export interface Auth {
  username: string
  password: string
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

export enum RetrieveType {
  Full = 'full',
  Partial = 'partial',
  Hash = 'hash',
}

enum NetworkId {
  Test = 1,
  Dev = 2,
  Bounty = 3,
  Dummy = 4,
  Main = 42,

  TestAlbatross = 5,
  DevAlbatross = 6,
  UnitAlbatross = 7,
  MainAlbatross = 24,
}

export interface ForkProof {
  blockNumber: number
  hashes: [string, string]
}

export interface DoubleProposalProof {
  blockNumber: number
  hashes: [string, string]
}

export interface DoubleVoteProof {
  blockNumber: number
}

export type EquivocationProof =
  | { type: 'Fork', proof: ForkProof }
  | { type: 'DoubleProposal', proof: DoubleProposalProof }
  | { type: 'DoubleVote', proof: DoubleVoteProof }

// Block types
export interface PartialBlock {
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
  bodyHash?: string
  historyHash: string
  network: NetworkId
  transactions?: Transaction[]
}

export interface PartialMicroBlock extends PartialBlock {
  type: BlockType.Micro
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
  equivocationProofs?: EquivocationProof[]
  epoch?: undefined
  parentElectionHash?: undefined
}

export interface MicroBlock extends PartialMicroBlock {
  transactions: Transaction[]
  isElectionBlock?: undefined
  lostRewardSet?: number[]
  disabledSet?: number[]
  interlink?: undefined
  slots?: undefined
  nextBatchInitialPunishedSet?: undefined
}

export interface PartialMacroBlock extends PartialBlock {
  type: BlockType.Macro
  epoch: number
  parentElectionHash?: undefined
  producer?: undefined
  equivocationProofs?: undefined
}

export interface MacroBlock extends PartialMacroBlock {
  isElectionBlock: false
  transactions: Transaction[]
  lostRewardSet: number[]
  disabledSet: number[]
  justification?: {
    round: number
    sig: {
      signature: { signature: string }
      signers: number[]
    }
  }
  interlink?: undefined
  slots?: undefined
  nextBatchInitialPunishedSet?: undefined
}

export interface ElectionMacroBlock extends PartialMacroBlock {
  isElectionBlock: true
  transactions: Transaction[]
  interlink: string[]
  slots: Slot[]
  nextBatchInitialPunishedSet: number[]
}

export type Block = MicroBlock | MacroBlock | ElectionMacroBlock
