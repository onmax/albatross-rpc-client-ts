import { Inherent } from "./common";

export type BlockType = "applied-block" | "reverted-block"
export type BlockLog = {
    type:         BlockType;
    inherents:    Inherent[];
    timestamp:    number;
    transactions: {
        hash: string;
        logs: Log[];
    }[];
}
export type LogsByAddressesAndTypes = {
    type:              string;
    from?:             string;
    fee?:              number;
    to?:               string;
    amount?:           number;
    stakerAddress?:    string;
    validatorAddress?: string;
    value?:            number;
}