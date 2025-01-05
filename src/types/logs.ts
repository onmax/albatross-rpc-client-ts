import type { BlockchainState } from './common'

export enum LogType {
  PayFee = 'pay-fee',
  Transfer = 'transfer',
  HtlcCreate = 'htlc-create',
  HtlcTimeoutResolve = 'htlc-timeout-resolve',
  HtlcRegularTransfer = 'htlc-regular-transfer',
  HtlcEarlyResolve = 'htlc-early-resolve',
  VestingCreate = 'vesting-create',
  CreateValidator = 'create-validator',
  UpdateValidator = 'update-validator',
  ValidatorFeeDeduction = 'validator-fee-deduction',
  DeactivateValidator = 'deactivate-validator',
  ReactivateValidator = 'reactivate-validator',
  RetireValidator = 'retire-validator',
  DeleteValidator = 'delete-validator',
  CreateStaker = 'create-staker',
  Stake = 'stake',
  UpdateStaker = 'update-staker',
  SetActiveStake = 'set-active-stake',
  RetireStake = 'retire-stake',
  RemoveStake = 'remove-stake',
  DeleteStaker = 'delete-staker',
  StakerFeeDeduction = 'staker-fee-deduction',
  PayoutReward = 'payout-reward',
  Penalize = 'penalize',
  JailValidator = 'jail-validator',
  RevertContract = 'revert-contract',
  FailedTransaction = 'failed-transaction',
}

export interface PayFeeLog {
  type: LogType.PayFee
  from: string
  fee: number
}

export interface TransferLog {
  type: LogType.Transfer
  from: string
  to: string
  amount: number
  data?: Uint8Array
}

export interface HtlcCreateLog {
  type: LogType.HtlcCreate
  contractAddress: string
  sender: string
  recipient: string
  hashRoot: string
  hashCount: number
  timeout: bigint
  totalAmount: number
}

export interface HtlcTimeoutResolveLog {
  type: LogType.HtlcTimeoutResolve
  contractAddress: string
}

export interface HtlcRegularTransferLog {
  type: LogType.HtlcRegularTransfer
  contractAddress: string
  preImage: string
  hashDepth: number
}

export interface HtlcEarlyResolveLog {
  type: LogType.HtlcEarlyResolve
  contractAddress: string
}

export interface VestingCreateLog {
  type: LogType.VestingCreate
  contractAddress: string
  owner: string
  vestingStartTime: bigint
  vestingTimeStep: bigint
  vestingStepAmount: number
  vestingTotalAmount: number
}

export interface CreateValidatorLog {
  type: LogType.CreateValidator
  validatorAddress: string
  rewardAddress: string
}

export interface UpdateValidatorLog {
  type: LogType.UpdateValidator
  validatorAddress: string
  oldRewardAddress: string
  newRewardAddress: string | null
}

export interface ValidatorFeeDeductionLog {
  type: LogType.ValidatorFeeDeduction
  validatorAddress: string
  fee: number
}

export interface DeactivateValidatorLog {
  type: LogType.DeactivateValidator
  validatorAddress: string
  inactiveFrom: number
}

export interface ReactivateValidatorLog {
  type: LogType.ReactivateValidator
  validatorAddress: string
}

export interface RetireValidatorLog {
  type: LogType.RetireValidator
  validatorAddress: string
}

export interface DeleteValidatorLog {
  type: LogType.DeleteValidator
  validatorAddress: string
  rewardAddress: string
}

export interface CreateStakerLog {
  type: LogType.CreateStaker
  stakerAddress: string
  validatorAddress: string | null
  value: number
}

export interface StakeLog {
  type: LogType.Stake
  stakerAddress: string
  validatorAddress: string | null
  value: number
}

export interface UpdateStakerLog {
  type: LogType.UpdateStaker
  stakerAddress: string
  oldValidatorAddress: string | null
  newValidatorAddress: string | null
  activeBalance: number
  inactiveFrom: number | null
}

export interface SetActiveStakeLog {
  type: LogType.SetActiveStake
  stakerAddress: string
  validatorAddress: string | null
  activeBalance: number
  inactiveBalance: number
  inactiveFrom: number | null
}

export interface RetireStakeLog {
  type: LogType.RetireStake
  stakerAddress: string
  validatorAddress: string | null
  inactiveBalance: number
  inactiveFrom: number | null
  retiredBalance: number
}

export interface RemoveStakeLog {
  type: LogType.RemoveStake
  stakerAddress: string
  validatorAddress: string | null
  value: number
}

export interface DeleteStakerLog {
  type: LogType.DeleteStaker
  stakerAddress: string
  validatorAddress: string | null
}

export interface StakerFeeDeductionLog {
  type: LogType.StakerFeeDeduction
  stakerAddress: string
  fee: number
}

export interface PayoutRewardLog {
  type: LogType.PayoutReward
  to: string
  value: number
}

export interface PenalizeLog {
  type: LogType.Penalize
  validatorAddress: string
  offenseEventBlock: number
  slot: number
  newlyDeactivated: boolean
}

export interface JailValidatorLog {
  type: LogType.JailValidator
  validatorAddress: string
  jailedFrom: number
}

export interface RevertContractLog {
  type: LogType.RevertContract
  contractAddress: string
}

export interface FailedTransactionLog {
  type: LogType.FailedTransaction
  from: string
  to: string
  failureReason: string
}

export type Log =
  | PayFeeLog
  | TransferLog
  | HtlcCreateLog
  | HtlcTimeoutResolveLog
  | HtlcRegularTransferLog
  | HtlcEarlyResolveLog
  | VestingCreateLog
  | CreateValidatorLog
  | UpdateValidatorLog
  | ValidatorFeeDeductionLog
  | DeactivateValidatorLog
  | ReactivateValidatorLog
  | RetireValidatorLog
  | DeleteValidatorLog
  | CreateStakerLog
  | StakeLog
  | UpdateStakerLog
  | SetActiveStakeLog
  | RetireStakeLog
  | RemoveStakeLog
  | DeleteStakerLog
  | StakerFeeDeductionLog
  | PayoutRewardLog
  | PenalizeLog
  | JailValidatorLog
  | RevertContractLog
  | FailedTransactionLog

export interface TransactionLog {
  hash: string
  logs: Log[]
  failed: boolean
}

export interface BlockLog {
  inherents: Log[]
  transactions: TransactionLog[]
}

export interface AppliedBlockLog extends BlockLog {
  type: 'applied-block'
  timestamp: bigint
}

export interface RevertedBlockLog extends BlockLog {
  type: 'reverted-block'
}

export type BlockLogType = AppliedBlockLog | RevertedBlockLog

export interface RPCData<T, M> {
  data: T
  metadata: M
}

// Example usage of RPCData with BlockLogType and BlockchainState
export type BlockLogResponse = RPCData<BlockLogType, BlockchainState>
