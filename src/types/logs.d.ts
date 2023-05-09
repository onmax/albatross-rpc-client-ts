import { Address, Coin } from "./common";
import { LogType } from "./enums";

export type PayFeeLog = {
    type: LogType.PayFee;
    from: string;
    fee: number;
}

export type TransferLog = {
    type: LogType.Transfer;
    from: Address;
    to: Address;
    amount: Coin;
}

export type HtlcCreateLog = {
    contractAddress: Address,
    sender: Address,
    recipient: Address,
    hashAlgorithm: string,
    hashRoot: string,
    hashCount: number,
    timeout: number,
    totalAmount: Coin
}

export type HTLCTimeoutResolve = {
    contractAddress: Address,
}

export type HTLCRegularTransfer = {
    contractAddress: Address,
    preImage: string,
    hashDepth: number,
}

export type HTLCEarlyResolve = {
    contractAddress: Address,
}

export type VestingCreateLog = {
    type: LogType.VestingCreate;
    contractAddress: Address;
    owner: Address;
    startTime: number;
    timeStep: number;
    stepAmount: Coin;
    totalAmount: Coin;
};

export type CreateValidatorLog = {
    type: LogType.CreateValidator;
    validatorAddress: Address;
    rewardAddress: Address;
};

export type UpdateValidatorLog = {
    type: LogType.UpdateValidator;
    validatorAddress: Address;
    oldRewardAddress: Address;
    newRewardAddress: Address | null;
};

export type ValidatorFeeDeductionLog = {
    type: LogType.ValidatorFeeDeduction;
    validatorAddress: Address;
    fee: Coin;
};

export type DeactivateValidatorLog = {
    type: LogType.DeactivateValidator;
    validatorAddress: Address;
};

export type ReactivateValidatorLog = {
    type: LogType.ReactivateValidator;
    validatorAddress: Address;
};

export type UnparkValidatorLog = {
    type: LogType.UnparkValidator;
    validatorAddress: Address;
};

export type CreateStakerLog = {
    type: LogType.CreateStaker;
    stakerAddress: Address;
    validatorAddress: Address | null;
    value: Coin;
};

export type StakeLog = {
    type: LogType.Stake;
    stakerAddress: Address;
    validatorAddress: Address | null;
    value: Coin;
};

export type StakerFeeDeductionLog = {
    type: LogType.StakerFeeDeduction;
    stakerAddress: Address;
    fee: Coin;
};

export type UpdateStakerLog = {
    type: LogType.UpdateStaker;
    stakerAddress: Address;
    oldValidatorAddress: Address | null;
    newValidatorAddress: Address | null;
};

export type RetireValidatorLog = {
    type: LogType.RetireValidator;
    validatorAddress: Address;
};

export type DeleteValidatorLog = {
    type: LogType.DeleteValidator;
    validatorAddress: Address;
    rewardAddress: Address;
};

export type UnstakeLog = {
    type: LogType.Unstake;
    stakerAddress: Address;
    validatorAddress: Address | null;
    value: Coin;
};

export type PayoutRewardLog = {
    type: LogType.PayoutReward;
    to: Address;
    value: Coin;
};

export type ParkLog = {
    type: LogType.Park;
    validatorAddress: Address;
    eventBlock: number;
};

export type SlashLog = {
    type: LogType.Slash;
    validatorAddress: Address;
    eventBlock: number;
    slot: number;
    newlyDisabled: boolean;
};

export type RevertContractLog = {
    type: LogType.RevertContract;
    contractAddress: Address;
};

export type FailedTransactionLog = {
    type: LogType.FailedTransaction;
    from: Address;
    to: Address;
    failureReason: string;
};

export type Log = PayFeeLog | TransferLog | HtlcCreateLog | HTLCTimeoutResolve | HTLCRegularTransfer | VestingCreateLog | CreateValidatorLog | UpdateValidatorLog | ValidatorFeeDeductionLog | DeactivateValidatorLog | ReactivateValidatorLog | UnparkValidatorLog | CreateStakerLog | StakeLog | StakerFeeDeductionLog | UpdateStakerLog | RetireValidatorLog | DeleteValidatorLog | UnstakeLog | PayoutRewardLog | ParkLog | SlashLog | RevertContractLog | FailedTransactionLog;


export type TransactionLog = {
    hash: string;
    logs: Log[];
    failed: boolean;
}

export type BlockLog = {
    inherents: Log[];
    blockHash: string;
    blockNumber: number;
    transactions: TransactionLog[];
}

export type AppliedBlockLog = BlockLog & {
    type: 'applied-block';
    timestamp: number;
}

export type RevertedBlockLog = BlockLog & {
    type: 'reverted-block';
}
