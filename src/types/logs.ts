import type { Address, Coin } from './common'

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

export interface HtlcCreateLog {
  type: LogType.HtlcCreate
  contractAddress: Address
  sender: Address
  recipient: Address
  hashRoot: string
  hashCount: number
  timeout: bigint
  totalAmount: Coin
}

export interface HtlcTimeoutResolveLog {
  type: LogType.HtlcTimeoutResolve
  contractAddress: Address
}

export interface HtlcRegularTransferLog {
  type: LogType.HtlcRegularTransfer
  contractAddress: Address
  preImage: string
  hashDepth: number
}

export interface HtlcEarlyResolveLog {
  type: LogType.HtlcEarlyResolve
  contractAddress: Address
}

export interface VestingCreateLog {
  type: LogType.VestingCreate
  contractAddress: Address
  owner: Address
  vestingStartTime: bigint
  vestingTimeStep: bigint
  vestingStepAmount: Coin
  vestingTotalAmount: Coin
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

export interface ReactivateValidatorLog {
  type: LogType.ReactivateValidator
  validatorAddress: Address
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

export interface UpdateStakerLog {
  type: LogType.UpdateStaker
  stakerAddress: Address
  oldValidatorAddress: Address | null
  newValidatorAddress: Address | null
  activeBalance: Coin
  inactiveFrom: number | null
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

export interface StakerFeeDeductionLog {
  type: LogType.StakerFeeDeduction
  stakerAddress: Address
  fee: Coin
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

export interface JailValidatorLog {
  type: LogType.JailValidator
  validatorAddress: Address
  jailedFrom: number
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
  inherentLogs: Log[]
  txLogs: TransactionLog[]
}

export interface AppliedBlockLog extends BlockLog {
  type: 'applied-block'
  timestamp: bigint
}

export interface RevertedBlockLog extends BlockLog {
  type: 'reverted-block'
}

export type BlockLogType = AppliedBlockLog | RevertedBlockLog

export interface BlockchainState {
  blockNumber: number
  blockHash: string
}

export interface RPCData<T, M> {
  data: T
  metadata: M
}

// Example usage of RPCData with BlockLogType and BlockchainState
export type BlockLogResponse = RPCData<BlockLogType, BlockchainState>
