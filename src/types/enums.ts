export enum BlockType {
  MICRO = 'micro',
  MACRO = 'macro',
  ELECTION = 'election',
}

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
  SetInactiveStake = 'set-inactive-stake',
  UpdateStaker = 'update-staker',
  RetireValidator = 'retire-validator',
  DeleteValidator = 'delete-validator',
  Unstake = 'unstake',
  PayoutReward = 'payout-reward',
  Park = 'park',
  Slash = 'slash',
  RevertContract = 'revert-contract',
  FailedTransaction = 'failed-transaction',
  ValidatorFeeDeduction = 'validator-fee-deduction',
}

export enum AccountType {
  BASIC = 'basic',
  VESTING = 'vesting',
  HTLC = 'htlc',
}
