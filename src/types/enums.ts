export enum BlockType {
    MICRO = 'micro',
    MACRO = 'macro',
}

export enum LogType {
    PayFee = "pay-fee",
    Transfer = "transfer",
    HtlcCreate = "htlc-create",
    HtlcTimeoutResolve = "htlc-timeout-resolve",
    HtlcRegularTransfer = "htlc-regular-transfer",
    HtlcEarlyResolve = "htlc-early-resolve",
    VestingCreate = "vesting-create",
    CreateValidator = "create-validator",
    UpdateValidator = "update-validator",
    InactivateValidator = "inactivate-validator",
    ReactivateValidator = "reactivate-validator",
    UnparkValidator = "unpark-validator",
    CreateStaker = "create-staker",
    Stake = "stake",
    UpdateStaker = "update-staker",
    DeleteValidator = "delete-validator",
    Unstake = "unstake",
    PayoutReward = "payout-reward",
    Park = "park",
    Slash = "slash",
    RevertContract = "revert-contract",
    FailedTransaction = "failed-transaction",
}

export enum AccountType {
    BASIC = 'basic',
    VESTING = 'vesting',
    HTLC = 'htlc',
}