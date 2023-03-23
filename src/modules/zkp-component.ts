import { ZKPState } from "../types/common";
import { Client } from "../client/client";
import { ContextRequest, MaybeCallResponse } from "../types/rpc-messages";
import { DEFAULT_OPTIONS } from "../client/http";

export class ZkpComponentClient extends Client {
    constructor(url: URL) {
        super(url);
    }

    public async getZkpState(options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<ZKPState>> {
        const { data, error, context } = await this.call("getZkpState", [], options);
        if (error) {
            return { error, data, context };
        } else {
            return { 
                error,
                data: {
                    latestHeaderHash: data['latest-header-number'],
                    latestBlockNumber: data['latest-block-number'],
                    latestProof: data['latest-proof'],
                } as ZKPState,
                context
            };
        }
    }
}