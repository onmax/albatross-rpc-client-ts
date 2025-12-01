export type ValidityStartHeight
  = | { relativeValidityStartHeight: number }
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
  stakingContractAddress: string

  /**
   * The address that receives the block rewards (coinbase).
   */
  coinbaseAddress: string

  /**
   * The maximum validity window for transactions (number of blocks).
   */
  transactionValidityWindow: number

  /**
   * The maximum size (in bytes) of the body of a micro block.
   */
  maxSizeMicroBody: number

  /**
   * The version number of the policy constants (legacy field, may not be present in v1.2.0+).
   */
  version?: number

  /**
   * The maximum supported protocol version.
   */
  maxSupportedVersion: number

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
  address: string
  balance: number
}

export interface VestingAccount {
  type: AccountType.Vesting
  address: string
  balance: number
  owner: string
  vestingStart: number
  vestingStepBlocks: number
  vestingStepAmount: number
  vestingTotalAmount: number
}

export interface HtlcAccount {
  type: AccountType.HTLC
  address: string
  balance: number
  sender: string
  recipient: string
  hashRoot: string
  hashCount: number
  timeout: number
  totalAmount: number
}

export interface StakingAccount {
  type: AccountType.Staking
  address: string
  balance: number
}

export type Account = BasicAccount | VestingAccount | HtlcAccount | StakingAccount

/**
 * Transaction information.
 *
 * Note: The timestamp field uses bigint for better precision and DX when working with large timestamps.
 * The OpenRPC schema defines it as number, but this client transforms JSON numbers to bigint internally.
 */
export interface Transaction {
  hash: string
  blockNumber?: number // Optional, corresponds to Option<u32>
  /**
   * Unix timestamp in milliseconds. Stored as bigint for precision (schema defines as number).
   */
  timestamp?: bigint // Optional, corresponds to Option<u64>
  confirmations?: number // Optional, corresponds to Option<u32>
  size: number // Corresponds to usize
  relatedAddresses: Set<string> // Corresponds to BTreeSet<string>
  from: string
  fromType: number // Corresponds to u8
  to: string
  toType: number // Corresponds to u8
  value: number
  fee: number
  senderData: string // Corresponds to Vec<u8>
  recipientData: string // Corresponds to Vec<u8>
  flags: number // Corresponds to u8
  validityStartHeight: number // Corresponds to u32
  proof: string // Corresponds to Vec<u8>
  networkId: number // Corresponds to u8
}

export interface ExecutedTransaction {
  transaction: Transaction
  executionResult: boolean
}

export interface Staker {
  address: string
  balance: number
  delegation?: string
  inactiveBalance: number
  inactiveFrom: number | null
  retiredBalance: number
}

export interface Validator {
  address: string
  signingKey: string
  votingKey: string
  rewardAddress: string
  signalData?: string
  balance: number

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
  slotNumber: number
  validator: string
  publicKey: string
}

export interface Slots {
  firstSlotNumber: number
  numSlots: number
  validator: string
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
  validatorAddress: string
  target: string
  value: number
  hash: string
}

export interface InherentPenalize {
  type: InherentType.Penalize
  blockNumber: number
  blockTime: number
  validatorAddress: string
  offenseEventBlock: number
}

export interface InherentJail {
  type: InherentType.Jail
  blockNumber: number
  blockTime: number
  validatorAddress: string
  offenseEventBlock: number
}

export type Inherent = InherentReward | InherentPenalize | InherentJail

/**
 * Mempool information with transaction count buckets.
 *
 * Note: The OpenRPC schema defines bucket keys as numeric strings ("0", "1", "2", etc.),
 * but this client uses underscored keys (_0, _1, _2, etc.) for better TypeScript DX.
 * The server returns numeric string keys which are transformed to underscored keys internally.
 */
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
  address: string
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

export type EquivocationProof
  = | { type: 'Fork', proof: ForkProof }
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
  transactions?: ExecutedTransaction[]
}

export interface PartialMicroBlock extends PartialBlock {
  type: BlockType.Micro
  producer: {
    slotNumber: number
    validator: string
    publicKey: string
  }
  justification?: {
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
  epoch: number
  parentElectionHash?: undefined
}

export interface MicroBlock extends PartialMicroBlock {
  transactions: ExecutedTransaction[]
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
  parentElectionHash: string
  producer?: undefined
  equivocationProofs?: undefined
}

export interface MacroBlock extends PartialMacroBlock {
  isElectionBlock: false
  transactions: ExecutedTransaction[]
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
  transactions: ExecutedTransaction[]
  interlink: string[]
  slots: Slots[]
  nextBatchInitialPunishedSet: number[]
  lostRewardSet: number[]
  disabledSet: number[]
  justification?: {
    round: number
    sig: {
      signature: { signature: string }
      signers: number[]
    }
  }
}

export type Block = MicroBlock | MacroBlock | ElectionMacroBlock
