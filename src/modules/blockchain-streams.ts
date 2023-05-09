import { FilterStreamFn, StreamOptions, Subscription, WS_DEFAULT_OPTIONS, WebSocketClient } from "../client/web-socket";
import { Address, Block, Hash, MacroBlock, MicroBlock, PartialBlock, Validator } from "../types/common";
import { LogType } from "../types/enums";
import { BlockLog } from "../types/logs";

export type SubscribeForHeadBlockParams = { retrieve: 'FULL' | 'PARTIAL', blockType?: 'MACRO' | 'MICRO' | 'ELECTION' };
export type SubscribeForHeadHashParams = { retrieve: 'HASH' };
export type SubscribeForValidatorElectionByAddressParams = { address: Address, withMetadata?: boolean };
export type SubscribeForLogsByAddressesAndTypesParams = { addresses?: Address[], types?: LogType[], withMetadata?: boolean };


export class BlockchainStream extends WebSocketClient {
    constructor(url: URL) {
        super(url);
    }

    /**
     * Subscribes to new block events.
     */
    public async subscribeForBlocks<
        T extends (SubscribeForHeadBlockParams | SubscribeForHeadHashParams),
        O extends StreamOptions<T extends SubscribeForHeadBlockParams ? Block | PartialBlock : Hash>
    >(params: T, userOptions?: Partial<O>) {
        if (params.retrieve === 'HASH') {
            const options: StreamOptions<Hash> = { ...WS_DEFAULT_OPTIONS, ...userOptions as StreamOptions<Hash> }
            return super.subscribe({ method: "subscribeForHeadBlockHash", params: [], withMetadata: false }, options) as Promise<Subscription<Hash, []>>
        }

        let filter;

        switch (params.blockType) {
            case 'MACRO':
                filter = ((block) => 'isElectionBlock' in block) as FilterStreamFn<MacroBlock>;
            case 'ELECTION':
                filter = ((block) => 'isElectionBlock' in block) as FilterStreamFn<MacroBlock>;
            case 'MICRO':
                filter = ((block) => !('isElectionBlock' in block)) as FilterStreamFn<MicroBlock>;
            default:
                filter = WS_DEFAULT_OPTIONS.filter;
        }

        const optionsMacro = { ...WS_DEFAULT_OPTIONS, ...userOptions, filter }
        return super.subscribe({ method: "subscribeForHeadBlock", params: [params.retrieve === "FULL"] }, optionsMacro)
    }

    /**
     * Subscribes to pre epoch validators events.
     */
    public async subscribeForValidatorElectionByAddress<
        T extends SubscribeForValidatorElectionByAddressParams,
        O extends StreamOptions<Validator>
    >(p: T, userOptions?: Partial<O>):
        Promise<Subscription<Validator, Address[]>> {
        return super.subscribe({ method: "subscribeForValidatorElectionByAddress", params: [p.address], withMetadata: p?.withMetadata }, { ...WS_DEFAULT_OPTIONS, ...userOptions })
    }

    /**
     * Subscribes to log events related to a given list of addresses and of any of the log types provided.
     * If addresses is empty it does not filter by address. If log_types is empty it won't filter by log types.
     * Thus the behavior is to assume all addresses or log_types are to be provided if the corresponding vec is empty.
     */
    public async subscribeForLogsByAddressesAndTypes<
        T extends SubscribeForLogsByAddressesAndTypesParams,
        O extends StreamOptions<BlockLog>
    >(p: T, userOptions?: Partial<O>):
        Promise<Subscription<BlockLog, (Address[] | LogType[])[]>> {
        return super.subscribe({ method: "subscribeForLogsByAddressesAndTypes", params: [p?.addresses || [], p?.types || []], withMetadata: p?.withMetadata }, { ...WS_DEFAULT_OPTIONS, ...userOptions })
    }
}
