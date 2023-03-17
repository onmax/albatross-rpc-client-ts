import { Inherent } from "./common";

export type BlockLog = {
    type:         "applied-block" | "reverted-block";
    inherents:    Inherent[];
    timestamp:    number;
    transactions: {
        hash: string;
        logs: Log[];
    }[];
}

export type LogsByAddressesAndTypes = {
    type:              BlockType;
    from?:             string;
    fee?:              number;
    to?:               string;
    amount?:           number;
    stakerAddress?:    string;
    validatorAddress?: string;
    value?:            number;
}