import type { Address, Coin, LogType } from './common'

export interface PayFeeLog {
  type: LogType.PayFee
  from: string
  fee: number
}

export interface TransferLog {
  type: LogType.Transfer
  from: Address
  to: Address
  amount: Coin
}

export interface HtlcCreateLog {
  contractAddress: Address
  sender: Address
  recipient: Address
  hashAlgorithm: string
  hashRoot: string
  hashCount: number
  timeout: number
  totalAmount: Coin
}

export interface HTLCTimeoutResolve {
  contractAddress: Address
}

export interface HTLCRegularTransfer {
  contractAddress: Address
  preImage: string
  hashDepth: number
}

export interface HTLCEarlyResolve {
  contractAddress: Address
}

export interface VestingCreateLog {
  type: LogType.VestingCreate
  contractAddress: Address
  owner: Address
  startTime: number
  timeStep: number
  stepAmount: Coin
  totalAmount: Coin
}

export interface CreateValidatorLog {
  type: LogType.CreateValidator
  validatorAddress: Address
  rewardAddress: Address
}

export interface UpdateValidatorLog {
  type: LogType.UpdateValidator
  validatorAddress: Address
  oldRewardAddress: Address
  newRewardAddress: Address | null
}

export interface ValidatorFeeDeductionLog {
  type: LogType.ValidatorFeeDeduction
  validatorAddress: Address
  fee: Coin
}

export interface DeactivateValidatorLog {
  type: LogType.DeactivateValidator
  validatorAddress: Address
}

export interface ReactivateValidatorLog {
  type: LogType.ReactivateValidator
  validatorAddress: Address
}

export interface SetActiveStakeLog {
  type: LogType.SetActiveStake
  validatorAddress: Address
}

export interface CreateStakerLog {
  type: LogType.CreateStaker
  stakerAddress: Address
  validatorAddress: Address | null
  value: Coin
}

export interface StakeLog {
  type: LogType.Stake
  stakerAddress: Address
  validatorAddress: Address | null
  value: Coin
}

export interface StakerFeeDeductionLog {
  type: LogType.StakerFeeDeduction
  stakerAddress: Address
  fee: Coin
}

export interface UpdateStakerLog {
  type: LogType.UpdateStaker
  stakerAddress: Address
  oldValidatorAddress: Address | null
  newValidatorAddress: Address | null
}

export interface RetireValidatorLog {
  type: LogType.RetireValidator
  validatorAddress: Address
}

export interface DeleteValidatorLog {
  type: LogType.DeleteValidator
  validatorAddress: Address
  rewardAddress: Address
}

export interface PayoutRewardLog {
  type: LogType.PayoutReward
  to: Address
  value: Coin
}

export interface ParkLog {
  type: LogType.Park
  validatorAddress: Address
  eventBlock: number
}

export interface SlashLog {
  type: LogType.Slash
  validatorAddress: Address
  eventBlock: number
  slot: number
  newlyDisabled: boolean
}

export interface RevertContractLog {
  type: LogType.RevertContract
  contractAddress: Address
}

export interface FailedTransactionLog {
  type: LogType.FailedTransaction
  from: Address
  to: Address
  failureReason: string
}

export type Log = PayFeeLog | TransferLog | HtlcCreateLog | HTLCTimeoutResolve | HTLCRegularTransfer | VestingCreateLog | CreateValidatorLog | UpdateValidatorLog | ValidatorFeeDeductionLog | DeactivateValidatorLog | ReactivateValidatorLog | SetActiveStakeLog | CreateStakerLog | StakeLog | StakerFeeDeductionLog | UpdateStakerLog | RetireValidatorLog | DeleteValidatorLog | PayoutRewardLog | ParkLog | SlashLog | RevertContractLog | FailedTransactionLog

export interface TransactionLog {
  hash: string
  logs: Log[]
  failed: boolean
}

export interface BlockLog {
  inherents: Log[]
  blockHash: string
  blockNumber: number
  transactions: TransactionLog[]
}

export type AppliedBlockLog = BlockLog & {
  type: 'applied-block'
  timestamp: number
}

export type RevertedBlockLog = BlockLog & {
  type: 'reverted-block'
}
