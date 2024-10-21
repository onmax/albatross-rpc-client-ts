import type { Address, Coin } from './common'

export enum LogType {
  PayFee = 'pay-fee',
  Transfer = 'transfer',
  HTLCCreate = 'htlc-create',
  HTLCTimeoutResolve = 'htlc-timeout-resolve',
  HTLCRegularTransfer = 'htlc-regular-transfer',
  HTLCEarlyResolve = 'htlc-early-resolve',
  VestingCreate = 'vesting-create',
  CreateValidator = 'create-validator',
  UpdateValidator = 'update-validator',
  ValidatorFeeDeduction = 'validator-fee-deduction',
  DeactivateValidator = 'deactivate-validator',
  JailValidator = 'jail-validator',
  ReactivateValidator = 'reactivate-validator',
  CreateStaker = 'create-staker',
  Stake = 'stake',
  StakerFeeDeduction = 'staker-fee-deduction',
  UpdateStaker = 'update-staker',
  RetireValidator = 'retire-validator',
  DeleteValidator = 'delete-validator',
  SetActiveStake = 'set-active-stake',
  RetireStake = 'retire-stake',
  RemoveStake = 'remove-stake',
  DeleteStaker = 'delete-staker',
  PayoutReward = 'payout-reward',
  Penalize = 'penalize',
  Jail = 'jail',
  RevertContract = 'revert-contract',
  FailedTransaction = 'failed-transaction',
}

export interface PayFeeLog {
  type: LogType.PayFee
  from: Address
  fee: Coin
}

export interface TransferLog {
  type: LogType.Transfer
  from: Address
  to: Address
  amount: Coin
  data?: Uint8Array
}

export interface HTLCCreateLog {
  type: LogType.HTLCCreate
  contractAddress: Address
  sender: Address
  recipient: Address
  hashRoot: string
  hashCount: number
  timeout: bigint
  totalAmount: Coin
}

export interface HTLCTimeoutResolveLog {
  type: LogType.HTLCTimeoutResolve
  contractAddress: Address
}

export interface HTLCRegularTransferLog {
  type: LogType.HTLCRegularTransfer
  contractAddress: Address
  preImage: string
  hashDepth: number
}

export interface HTLCEarlyResolveLog {
  type: LogType.HTLCEarlyResolve
  contractAddress: Address
}

export interface VestingCreateLog {
  type: LogType.VestingCreate
  contractAddress: Address
  owner: Address
  startTime: bigint
  timeStep: bigint
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
  inactiveFrom: number
}

export interface JailValidatorLog {
  type: LogType.JailValidator
  validatorAddress: Address
  jailedFrom: number
}

export interface ReactivateValidatorLog {
  type: LogType.ReactivateValidator
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
  activeBalance: Coin
  inactiveFrom: number | null
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

export interface SetActiveStakeLog {
  type: LogType.SetActiveStake
  stakerAddress: Address
  validatorAddress: Address | null
  activeBalance: Coin
  inactiveBalance: Coin
  inactiveFrom: number | null
}

export interface RetireStakeLog {
  type: LogType.RetireStake
  stakerAddress: Address
  validatorAddress: Address | null
  inactiveBalance: Coin
  inactiveFrom: number | null
  retiredBalance: Coin
}

export interface RemoveStakeLog {
  type: LogType.RemoveStake
  stakerAddress: Address
  validatorAddress: Address | null
  value: Coin
}

export interface DeleteStakerLog {
  type: LogType.DeleteStaker
  stakerAddress: Address
  validatorAddress: Address | null
}

export interface PayoutRewardLog {
  type: LogType.PayoutReward
  to: Address
  value: Coin
}

export interface PenalizeLog {
  type: LogType.Penalize
  validatorAddress: Address
  offenseEventBlock: number
  slot: number
  newlyDeactivated: boolean
}

export interface JailLog {
  type: LogType.Jail
  validatorAddress: Address
  eventBlock: number
  newlyJailed: boolean
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

export type Log =
  | PayFeeLog
  | TransferLog
  | HTLCCreateLog
  | HTLCTimeoutResolveLog
  | HTLCRegularTransferLog
  | HTLCEarlyResolveLog
  | VestingCreateLog
  | CreateValidatorLog
  | UpdateValidatorLog
  | ValidatorFeeDeductionLog
  | DeactivateValidatorLog
  | JailValidatorLog
  | ReactivateValidatorLog
  | CreateStakerLog
  | StakeLog
  | StakerFeeDeductionLog
  | UpdateStakerLog
  | RetireValidatorLog
  | DeleteValidatorLog
  | SetActiveStakeLog
  | RetireStakeLog
  | RemoveStakeLog
  | DeleteStakerLog
  | PayoutRewardLog
  | PenalizeLog
  | JailLog
  | RevertContractLog
  | FailedTransactionLog

export interface TransactionLog {
  hash: string
  logs: Log[]
  failed: boolean
}

export interface BlockLog {
  inherentLogs: Log[]
  blockHash: string
  blockNumber: number
  txLogs: TransactionLog[]
  totalTxSize: bigint
}

export interface AppliedBlockLog extends BlockLog {
  type: 'applied-block'
  timestamp: bigint
}

export interface RevertedBlockLog extends BlockLog {
  type: 'reverted-block'
}

export type BlockLogType = AppliedBlockLog | RevertedBlockLog
