import { LogType } from "./enums";

// TODO Update Log with all types!

export type PayoutInherentLog = {
    type: LogType.PayoutInherent;
    to: Address;
    value: Coin;
}

export type ParkInherentLog = {
    type: LogType.ParkInherent;
    validatorAddress: Address;
    eventBlock: number;
}

export type SlashInherentLog = {
    type: LogType.SlashInherent;
    validatorAddress: Address;
    eventBlock: number;
    slot: number;
    newlyDisabled: boolean;
}

export type RevertContractInherentLog = {
    type: LogType.RevertContractInherent;
    contractAddress: Address;
}

export type InherentLog = PayoutInherentLog | ParkInherentLog | SlashInherentLog | RevertContractInherentLog

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

export type CreateValidatorLog = {
    type: LogType.CreateValidator;
    validatorAddress: Address;
    rewardAddress: Address;
}

export type UpdateValidatorLog = {
    type: LogType.UpdateValidator;
    validatorAddress: Address;
    oldRewardAddress: Address;
    newRewardAddress: Address | null;
}

export type InactivateValidatorLog = {
    type: LogType.InactivateValidator;    
    validatorAddress: Address;
}

export type ReactivateValidatorLog = {
    type: LogType.ReactivateValidator;
    validatorAddress: Address;
}

export type UnparkValidatorLog = {
    type: LogType.UnparkValidator;
    validatorAddress: Address;
}

export type RetireValidatorLog = {
    type: LogType.RetireValidator;
    validatorAddress: Address;
}

export type DeleteValidatorLog = {
    type: LogType.DeleteValidator;
    validatorAddress: Address;
    rewardAddress: Address;
}

export type CreateStakerLog = {
    type: LogType.CreateStaker;
    stakerAddress: Address;
    validatorAddress: Address | null;
    value: Coin;
}

export type StakeLog = {
    type: LogType.Stake;
    stakerAddress: Address;
    validatorAddress: Address | null;
    value: Coin;
}

export type UpdateStakerLog = {
    type: LogType.UpdateStaker;
    stakerAddress: Address;
    oldValidatorAddress: Address | null;
    newValidatorAddress: Address | null;
}

export type UnstakeLog = {
    type: LogType.Unstake;
    stakerAddress: Address;
    validatorAddress: Address | null;
    value: Coin;
}

export type FailedTransactionLog = {
    type: LogType.FailedTransaction;
    from: Address;
    to: Address;
    failureReason: string;
}

export type Log = PayFeeLog | TransferLog | CreateValidatorLog | UpdateValidatorLog | InactivateValidatorLog | ReactivateValidatorLog | UnparkValidatorLog | RetireValidatorLog | DeleteValidatorLog | CreateStakerLog | StakeLog | UpdateStakerLog | UnstakeLog | FailedTransactionLog

export type TransactionLog = {
    hash: string;
    logs: Log[];
    failed: boolean;
}

export type BlockLog = {
    inherents: InherentLog[];
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
